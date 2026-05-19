//
//  ConfirmCaptureView.swift
//  SnapFinance — 截圖辨識後的確認畫面
//
//  三種版型：transaction / asset / portfolio
//  每種都顯示：截圖縮圖 + AI 信心度 + 預填表單 + 儲存按鈕
//

import SwiftUI
import SwiftData

struct ConfirmCaptureView: View {
    @Environment(\.modelContext) private var ctx
    @Environment(\.dismiss) private var dismiss

    let payload: SharedPayload
    let onDone: () -> Void

    @State private var amount: Double = 0
    @State private var merchant: String = ""
    @State private var date: Date = .now
    @State private var note: String = ""
    @State private var direction: TransactionType = .expense
    @State private var showRawText = false

    @Query private var allCategories: [Category]
    @Query private var allAccounts: [Account]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Screenshot + AI detection card
                    DetectionCard(payload: payload)

                    // Amount card
                    AmountCard(amount: $amount, direction: $direction)

                    // Detail fields
                    DetailSection(
                        merchant: $merchant,
                        date: $date,
                        note: $note,
                        categories: allCategories,
                        accounts: allAccounts
                    )

                    // Raw text button
                    Button("查看 OCR 原始文字") { showRawText = true }
                        .font(.system(size: 13))
                        .foregroundStyle(Color.sfAccent)
                        .padding(.horizontal, hPad)

                    // Privacy footer
                    Text("所有辨識在裝置上完成 · 截圖預設僅保留辨識後文字")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.sfTertiary)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                        .padding(.horizontal, hPad)
                        .padding(.bottom, 32)
                }
                .padding(.top, 8)
            }
            .background(Color.sfBackground)
            .navigationTitle("確認交易")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { onDone() }
                        .foregroundStyle(Color.sfAccent)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("儲存", action: save)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.sfAccent)
                }
            }
            .onAppear(perform: prefill)
            .sheet(isPresented: $showRawText) {
                NavigationStack {
                    ScrollView {
                        Text(payload.rawText)
                            .font(.callout)
                            .foregroundStyle(Color.sfText)
                            .padding()
                    }
                    .background(Color.sfBackground)
                    .navigationTitle("OCR 原文")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("關閉") { showRawText = false }
                        }
                    }
                }
            }
        }
    }

    private func prefill() {
        guard let p = payload.parsed else { return }
        if let a = p.amount { amount = a }
        merchant = p.merchant ?? ""
        direction = p.direction == .income ? .income
                  : p.direction == .transfer ? .transfer : .expense
        if let iso = p.occurredAt, let d = ISO8601DateFormatter().date(from: iso) {
            date = d
        }
    }

    private func save() {
        let tx = Transaction(
            date: date,
            amount: Decimal(amount),
            type: direction,
            merchant: merchant.isEmpty ? nil : merchant,
            note: note.isEmpty ? nil : note,
            sourceType: .screenshot,
            rawText: payload.rawText,
            aiConfidence: payload.parsed?.confidence
        )
        ctx.insert(tx)
        try? ctx.save()
        onDone()
    }
}

// MARK: - Detection card

private struct DetectionCard: View {
    let payload: SharedPayload

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            if let img = UIImage(data: payload.imageData) {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 72, height: 100)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            } else {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.sfCardAlt)
                    .frame(width: 72, height: 100)
                    .overlay {
                        Image(systemName: "photo")
                            .foregroundStyle(Color.sfTertiary)
                    }
            }

            VStack(alignment: .leading, spacing: 6) {
                // AI badge
                HStack(spacing: 4) {
                    ZStack {
                        AIGradient()
                            .clipShape(Capsule())
                        HStack(spacing: 3) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 8, weight: .semibold))
                            Text("AI 偵測")
                                .font(.system(size: 10, weight: .semibold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                    }
                    .fixedSize()
                }

                Text(payload.parsed?.kind.rawValue ?? "未知類型")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color.sfText)

                if let conf = payload.parsed?.confidence {
                    Text("信心度 \(Int(conf * 100))%")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.sfSecondary)
                }

                if let merchant = payload.parsed?.merchant {
                    Text(merchant)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.sfSecondary)
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                Button("切換類型 ▾") {}
                    .font(.system(size: 12))
                    .foregroundStyle(Color.sfAccent)
                    .buttonStyle(.plain)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(14)
        .background(Color.sfCard, in: RoundedRectangle(cornerRadius: cardCorner))
        .padding(.horizontal, hPad)
    }
}

// MARK: - Amount card

private struct AmountCard: View {
    @Binding var amount: Double
    @Binding var direction: TransactionType

    var body: some View {
        VStack(spacing: 12) {
            Text("支出金額")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Color.sfSecondary)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("NT$")
                    .font(.system(size: 18))
                    .foregroundStyle(Color.sfSecondary)
                TextField("0", value: $amount, format: .number.precision(.fractionLength(0)))
                    .font(.system(size: 48, weight: .bold))
                    .foregroundStyle(Color.sfText)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.center)
                    .monospacedDigit()
            }

            // Auto-detected badge
            HStack(spacing: 4) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.sfGreen)
                Text("金額已自動辨識")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.sfSecondary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.sfCardAlt, in: RoundedRectangle(cornerRadius: 12))

            // Type picker
            Picker("類型", selection: $direction) {
                ForEach(TransactionType.allCases, id: \.self) {
                    Text($0.localized).tag($0)
                }
            }
            .pickerStyle(.segmented)
            .padding(.top, 4)
        }
        .padding(20)
        .background(Color.sfCard, in: RoundedRectangle(cornerRadius: cardCorner))
        .padding(.horizontal, hPad)
    }
}

// MARK: - Detail section

private struct DetailSection: View {
    @Binding var merchant: String
    @Binding var date: Date
    @Binding var note: String
    let categories: [Category]
    let accounts: [Account]
    @State private var selectedCategory: Category?
    @State private var selectedAccount: Account?

    var body: some View {
        VStack(spacing: 0) {
            DetailRow(icon: "storefront", label: "商家") {
                TextField("商家 / 說明", text: $merchant)
                    .font(.system(size: 15))
                    .foregroundStyle(Color.sfText)
                    .multilineTextAlignment(.trailing)
            }

            HairlineDivider()
                .padding(.leading, hPad + 22 + 12)

            DetailRow(icon: "calendar", label: "日期") {
                DatePicker("", selection: $date, displayedComponents: [.date, .hourAndMinute])
                    .labelsHidden()
            }

            HairlineDivider()
                .padding(.leading, hPad + 22 + 12)

            DetailRow(icon: "creditcard", label: "帳戶") {
                Picker("帳戶", selection: $selectedAccount) {
                    Text("選擇…").tag(Account?.none)
                    ForEach(accounts) { a in
                        Text(a.name).tag(Account?.some(a))
                    }
                }
                .tint(Color.sfSecondary)
                .labelsHidden()
            }

            HairlineDivider()
                .padding(.leading, hPad + 22 + 12)

            DetailRow(icon: "tag", label: "分類") {
                Picker("分類", selection: $selectedCategory) {
                    Text("選擇…").tag(Category?.none)
                    ForEach(categories.filter { $0.parent == nil }) { c in
                        Text(c.name).tag(Category?.some(c))
                    }
                }
                .tint(Color.sfSecondary)
                .labelsHidden()
            }

            HairlineDivider()
                .padding(.leading, hPad + 22 + 12)

            DetailRow(icon: "note.text", label: "備註") {
                TextField("選填", text: $note, axis: .vertical)
                    .font(.system(size: 15))
                    .foregroundStyle(Color.sfText)
                    .multilineTextAlignment(.trailing)
                    .lineLimit(1...3)
            }
        }
        .background(Color.sfCard, in: RoundedRectangle(cornerRadius: cardCorner))
        .padding(.horizontal, hPad)
    }
}

private struct DetailRow<Content: View>: View {
    let icon: String
    let label: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(Color.sfSecondary)
                .frame(width: 22, alignment: .center)
            Text(label)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(Color.sfText)
            Spacer()
            content()
        }
        .padding(.horizontal, hPad)
        .padding(.vertical, 14)
    }
}

// SharedPayload.id already exists; just declare Identifiable conformance
extension SharedPayload: @retroactive Identifiable {}
