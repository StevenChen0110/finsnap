//
//  DesignSystem.swift
//  SnapFinance — 設計語彙：顏色、字體、間距
//
//  「舒適」風格：暖奶油底、深石板墨、New York 襯線大數字
//

import SwiftUI

// MARK: - Color tokens

extension Color {
    /// 暖奶油底 — oklch(0.965 0.010 80) ≈ #F5F1EC
    static let sfBackground   = Color(red: 0.961, green: 0.945, blue: 0.926)
    /// 卡片底 — 比底色亮一點
    static let sfCard         = Color(red: 0.985, green: 0.974, blue: 0.960)
    /// 卡片備用底
    static let sfCardAlt      = Color(red: 0.930, green: 0.919, blue: 0.900)
    /// 髮絲線 — oklch(0.88 0.014 75)
    static let sfDivider      = Color(red: 0.878, green: 0.862, blue: 0.838)
    /// 主文字
    static let sfText         = Color(red: 0.039, green: 0.039, blue: 0.047)
    /// 次要文字
    static let sfSecondary    = Color(red: 0.235, green: 0.235, blue: 0.263).opacity(0.65)
    /// 三級文字
    static let sfTertiary     = Color(red: 0.235, green: 0.235, blue: 0.263).opacity(0.35)
    /// Accent — oklch(0.42 0.08 245) ≈ deep navy/indigo
    static let sfAccent       = Color(red: 0.196, green: 0.247, blue: 0.541)
    /// Soft accent tint
    static let sfAccentSoft   = Color(red: 0.196, green: 0.247, blue: 0.541).opacity(0.10)
    /// System green
    static let sfGreen        = Color(red: 0.204, green: 0.780, blue: 0.349)
    /// System red
    static let sfRed          = Color(red: 1.000, green: 0.271, blue: 0.227)
    /// AI gradient start
    static let sfAIStart      = Color(red: 0.369, green: 0.361, blue: 0.902)
    /// AI gradient end
    static let sfAIEnd        = Color(red: 0.749, green: 0.353, blue: 0.945)
}

// MARK: - Category colors (matching the prototype's oklch palette)

struct CategoryStyle {
    let name: String
    let icon: String
    let color: Color
}

let categoryStyles: [String: CategoryStyle] = [
    "飲食": .init(name: "飲食", icon: "fork.knife", color: Color(red: 0.92, green: 0.62, blue: 0.20)),
    "帳單": .init(name: "帳單", icon: "doc.text",   color: Color(red: 0.88, green: 0.76, blue: 0.22)),
    "居家": .init(name: "居家", icon: "house",       color: Color(red: 0.35, green: 0.67, blue: 0.45)),
    "交通": .init(name: "交通", icon: "car",         color: Color(red: 0.25, green: 0.38, blue: 0.72)),
    "購物": .init(name: "購物", icon: "bag",         color: Color(red: 0.80, green: 0.35, blue: 0.40)),
    "娛樂": .init(name: "娛樂", icon: "film",        color: Color(red: 0.58, green: 0.35, blue: 0.82)),
    "收入": .init(name: "收入", icon: "arrow.down",  color: Color(red: 0.20, green: 0.78, blue: 0.35)),
    "其他": .init(name: "其他", icon: "tag",         color: Color(red: 0.56, green: 0.56, blue: 0.58)),
]

func categoryColor(for name: String) -> Color {
    categoryStyles[name]?.color ?? .sfTertiary
}

func categoryIcon(for name: String) -> String {
    categoryStyles[name]?.icon ?? "tag"
}

// MARK: - Typography

extension Font {
    /// 主 Hero 數字 — serif, 68pt light
    static let heroAmount = Font.system(size: 68, weight: .light, design: .serif)
    /// 資產 Hero 數字 — serif, 52pt light
    static let heroAmountMedium = Font.system(size: 52, weight: .light, design: .serif)
    /// 幣別前綴
    static let heroCurrency = Font.system(size: 26, weight: .regular, design: .serif)
    /// Section 標題
    static let sectionLabel = Font.system(size: 12, weight: .semibold)
}

// MARK: - Shared layout

let hPad: CGFloat = 24
let cardCorner: CGFloat = 18

// MARK: - Shared components

struct SectionLabel: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(.sectionLabel)
            .foregroundStyle(Color.sfSecondary)
            .kerning(0.4)
    }
}

struct HairlineDivider: View {
    var body: some View {
        Rectangle()
            .fill(Color.sfDivider)
            .frame(height: 0.5)
    }
}

struct SummaryRow: View {
    let label: String
    let value: String
    let hint: String
    var isFirst: Bool = false

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.sfSecondary)
                .frame(width: 44, alignment: .leading)

            Text(value)
                .font(.system(size: 16, weight: .regular))
                .foregroundStyle(Color.sfText)

            Spacer()

            if !hint.isEmpty {
                Text(hint)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.sfSecondary)
                    .monospacedDigit()
            }
        }
        .padding(.vertical, 16)
        .overlay(alignment: .top) {
            if !isFirst { HairlineDivider() }
        }
    }
}

// MARK: - Capture FAB

struct CaptureFAB: View {
    var label: String = "截圖記帳"
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: "camera.viewfinder")
                    .font(.system(size: 16, weight: .semibold))
                Text(label)
                    .fontWeight(.semibold)
            }
            .padding(.horizontal, 22)
            .frame(height: 52)
            .background(Color.sfText, in: Capsule())
            .foregroundStyle(Color.sfBackground)
            .shadow(color: .black.opacity(0.18), radius: 18, y: 4)
        }
    }
}

// MARK: - AI Gradient background

struct AIGradient: View {
    var body: some View {
        LinearGradient(
            colors: [Color.sfAIStart, Color.sfAIEnd],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
