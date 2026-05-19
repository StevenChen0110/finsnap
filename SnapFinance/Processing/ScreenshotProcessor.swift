//
//  ScreenshotProcessor.swift
//  SnapFinance — Share Sheet 接收 + Vision OCR + Apple Intelligence 語意抽取
//
//  流程：
//    1. ShareViewController 拿到 NSItemProvider → loadData → UIImage
//    2. ScreenshotProcessor.process(image:) 跑 Vision pipeline
//    3. FoundationModels.LanguageModelSession 抽結構化資料 → ParsedCapture
//    4. 主 App 收到 deep link，跳 ConfirmCaptureView
//
//  ⚠️  FoundationModels 需要 iOS 26 / Xcode 26 Beta
//      在 iOS 18–25 上請移除 FoundationModels import，改用本地規則引擎兜底
//

import Foundation
import Vision
import VisionKit
import UIKit
// import FoundationModels   // iOS 26+

// MARK: - ParsedCapture

struct ParsedCapture: Codable, Equatable {
    var kind: CaptureKind
    var amount: Double?
    var direction: Direction?
    var merchant: String?
    var occurredAt: String?
    var accountHint: String?
    var suggestedCategory: String?
    var suggestedSubcategory: String?
    var totalBalance: Double?
    var confidence: Double

    enum CaptureKind: String, Codable { case transaction, asset, portfolio, other }
    enum Direction:   String, Codable { case expense, income, transfer }
}

// MARK: - SharedPayload

struct SharedPayload: Codable {
    let id: UUID
    let imageData: Data
    let parsed: ParsedCapture?
    let rawText: String

    init(id: UUID = UUID(), imageData: Data, parsed: ParsedCapture?, rawText: String) {
        self.id = id
        self.imageData = imageData
        self.parsed = parsed
        self.rawText = rawText
    }
}

// MARK: - SharedInbox (App Group relay)

enum SharedInbox {
    static let appGroup = "group.com.example.snapfinance"

    private static var dir: URL {
        let fm = FileManager.default
        let base = fm.containerURL(forSecurityApplicationGroupIdentifier: appGroup)!
            .appendingPathComponent("Inbox", isDirectory: true)
        try? fm.createDirectory(at: base, withIntermediateDirectories: true)
        return base
    }

    static func write(_ payload: SharedPayload) throws {
        let url = dir.appendingPathComponent(payload.id.uuidString + ".json")
        try JSONEncoder().encode(payload).write(to: url, options: .atomic)
    }

    static func read(id: UUID) throws -> SharedPayload {
        let url = dir.appendingPathComponent(id.uuidString + ".json")
        return try JSONDecoder().decode(SharedPayload.self, from: Data(contentsOf: url))
    }

    static func clear(id: UUID) {
        let url = dir.appendingPathComponent(id.uuidString + ".json")
        try? FileManager.default.removeItem(at: url)
    }
}

// MARK: - Error types

enum ScreenshotError: Error {
    case noText
    case visionFailed(Error)
    case llmUnavailable
    case llmFailed(Error)
}

// MARK: - ScreenshotProcessor

@MainActor
final class ScreenshotProcessor {
    static let shared = ScreenshotProcessor()
    private init() {}

    /// 主入口：丟一張圖進來，得到結構化 ParsedCapture。
    /// LLM 不可用時退回規則引擎，再失敗才讓使用者手動輸入。
    func process(image: UIImage) async throws -> (parsed: ParsedCapture?, rawText: String) {
        let recognized = try await runVision(image: image)
        guard !recognized.text.isEmpty else { throw ScreenshotError.noText }

        // 先嘗試規則引擎（離線可用，速度快）
        if let quick = RuleEngine.parse(text: recognized.text) {
            return (quick, recognized.text)
        }

        // 再嘗試 Apple Intelligence（iOS 26+）
        // do {
        //     let parsed = try await runLanguageModel(text: recognized.text, tables: recognized.tables)
        //     return (parsed, recognized.text)
        // } catch {
        //     return (nil, recognized.text)
        // }

        return (nil, recognized.text)
    }

    // MARK: Vision

    private struct RecognizedDoc {
        let text: String
        let tables: [String]
    }

    private func runVision(image: UIImage) async throws -> RecognizedDoc {
        guard let cg = image.cgImage else { throw ScreenshotError.noText }
        let fallback = try await fallbackTextRecognition(cg: cg)
        return RecognizedDoc(text: fallback, tables: [])
    }

    private func fallbackTextRecognition(cg: CGImage) async throws -> String {
        try await withCheckedThrowingContinuation { cont in
            let req = VNRecognizeTextRequest { req, err in
                if let err = err { cont.resume(throwing: err); return }
                let lines = (req.results as? [VNRecognizedTextObservation] ?? [])
                    .compactMap { $0.topCandidates(1).first?.string }
                cont.resume(returning: lines.joined(separator: "\n"))
            }
            req.recognitionLevel = .accurate
            req.usesLanguageCorrection = true
            req.recognitionLanguages = ["zh-Hant", "en-US"]
            do {
                try VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
            } catch {
                cont.resume(throwing: ScreenshotError.visionFailed(error))
            }
        }
    }
}

// MARK: - Simple rule engine (offline fallback)

private enum RuleEngine {
    // Matches patterns like "消費 NT$156" or "金額：156"
    static func parse(text: String) -> ParsedCapture? {
        let lower = text.lowercased()

        // Detect type
        let kind: ParsedCapture.CaptureKind
        if lower.contains("消費") || lower.contains("付款") || lower.contains("扣款") {
            kind = .transaction
        } else if lower.contains("餘額") || lower.contains("存款") {
            kind = .asset
        } else if lower.contains("持倉") || lower.contains("股票") || lower.contains("基金") {
            kind = .portfolio
        } else {
            return nil
        }

        // Extract amount
        let amountPattern = /(?:NT\$|NT\\$|新台幣|金額[：:]\s*)(\d[\d,]+)/
        let amount = text.firstMatch(of: amountPattern).map {
            Double($0.1.replacingOccurrences(of: ",", with: "")) ?? 0
        }

        // Merchant heuristics
        let merchant: String? = {
            for keyword in ["全家", "7-11", "路易莎", "麥當勞", "統一超商", "Family Mart"] {
                if text.contains(keyword) { return keyword }
            }
            return nil
        }()

        let category: String? = {
            if merchant != nil { return "飲食" }
            if lower.contains("netflix") || lower.contains("apple") { return "娛樂" }
            return nil
        }()

        return ParsedCapture(
            kind: kind,
            amount: amount,
            direction: .expense,
            merchant: merchant,
            occurredAt: nil,
            accountHint: nil,
            suggestedCategory: category,
            suggestedSubcategory: nil,
            totalBalance: nil,
            confidence: 0.65
        )
    }
}
