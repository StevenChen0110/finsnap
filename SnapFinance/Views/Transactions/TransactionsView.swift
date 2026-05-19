//
//  TransactionsView.swift
//  SnapFinance — 交易列表（Things 3 風格時間軸）
//
//  頂部：本月分類色條 + 可橫向捲動 chip
//  中部：全部 / 支出 / 收入 filter
//  下方：依日期分組，每組顯示合計
//

import SwiftUI
import SwiftData

// MARK: - Mock data for preview / empty state

struct MockTransaction: Identifiable {
    let id = UUID()
    let time: String
    let merchant: String
    let category: String
    let account: String
    let amount: Int
    let isIncome: Bool
    let fromScreenshot: Bool
}

struct MockGroup: Identifiable {
    let id = UUID()
    let dateLabel: String
    let total: Int
    let items: [MockTransaction]
}

private let mockGroups: [MockGroup] = [
    MockGroup(dateLabel: "今天 · 5/18", total: 245, items: [
        MockTransaction(time: "12:34", merchant: "全家便利商店 信義店", category: "飲食", account: "玉山卡 1234", amount: 156, isIncome: false, fromScreenshot: true),
        MockTransaction(time: "09:12", merchant: "路易莎咖啡 信義店",   category: "飲食", account: "LINE Pay",   amount: 89,  isIncome: false, fromScreenshot: true),
    ]),
    MockGroup(dateLabel: "昨天 · 5/17", total: 0, items: []),
    MockGroup(dateLabel: "5/16 · 週六", total: -55794, items: [
        MockTransaction(time: "09:00", merchant: "薪資轉入",          category: "收入", account: "玉山銀行",    amount: 58000, isIncome: true,  fromScreenshot: false),
        MockTransaction(time: "19:20", merchant: "家樂福 內湖店",      category: "居家", account: "玉山卡 1234", amount: 1284,  isIncome: false, fromScreenshot: true),
        MockTransaction(time: "14:32", merchant: "台北捷運",           category: "交通", account: "悠遊卡",      amount: 32,    isIncome: false, fromScreenshot: false),
        MockTransaction(time: "12:30", merchant: "優衣庫 信義店",      category: "購物", account: "LINE Pay",   amount: 890,   isIncome: false, fromScreenshot: true),
    ]),
    MockGroup(dateLabel: "5/15 · 週五", total: 720, items: [
        MockTransaction(time: "23:01", merchant: "Netflix 月費",     category: "娛樂", account: "玉山卡 1234", amount: 390, isIncome: false, fromScreenshot: true),
        MockTransaction(time: "18:45", merchant: "麥當勞 信義店",     category: "飲食", account: "LINE Pay",   amount: 185, isIncome: false, fromScreenshot: false),
        MockTransaction(time: "12:10", merchant: "摩斯漢堡",         category: "飲食", account: "LINE Pay",   amount: 145, isIncome: false, fromScreenshot: false),
    ]),
    MockGroup(dateLabel: "5/14 · 週四", total: 963, items: [
        MockTransaction(time: "21:30", merchant: "誠品書店 信義店",   category: "娛樂", account: "玉山卡 1234", amount: 620, isIncome: false, fromScreenshot: true),
        MockTransaction(time: "15:00", merchant: "Uber 計程車",      category: "交通", account: "LINE Pay",   amount: 245, isIncome: false, fromScreenshot: false),
        MockTransaction(time: "08:12", merchant: "7-11 政大店",      category: "飲食", account: "街口支付",   amount: 98,  isIncome: false, fromScreenshot: false),
    ]),
]

// MARK: - Category breakdown data

struct CategoryEntry: Identifiable {
    let id = UUID()
    let name: String
    let amount: Int
    let color: Color
}

private let monthCategories: [CategoryEntry] = [
    CategoryEntry(name: "飲食", amount: 7584, color: Color(red: 0.92, green: 0.62, blue: 0.20)),
    CategoryEntry(name: "帳單", amount: 5800, color: Color(red: 0.88, green: 0.76, blue: 0.22)),
    CategoryEntry(name: "居家", amount: 5062, color: Color(red: 0.35, green: 0.67, blue: 0.45)),
    CategoryEntry(name: "交通", amount: 3374, color: Color(red: 0.25, green: 0.38, blue: 0.72)),
    CategoryEntry(name: "購物", amount: 2953, color: Color(red: 0.80, green: 0.35, blue: 0.40)),
    CategoryEntry(name: "娛樂", amount: 2109, color: Color(red: 0.58, green: 0.35, blue: 0.82)),
    CategoryEntry(name: "其他", amount: 1340, color: Color(red: 0.56, green: 0.56, blue: 0.58)),
]

// MARK: - View

struct TransactionsView: View {
    @State private var filter: TxFilter = .all
    @State private var showingCapture = false

    enum TxFilter: String, CaseIterable {
        case all = "全部", expense = "支出", income = "收入"
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("2026 年 5 月")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(Color.sfSecondary)
                            Text("交易")
                                .font(.system(size: 22, weight: .semibold))
                                .foregroundStyle(Color.sfText)
                        }
                        Spacer()
                        Button { showingCapture = true } label: {
                            Image(systemName: "camera.viewfinder")
                                .font(.system(size: 18))
                                .foregroundStyle(Color.sfSecondary)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 8)

                    // Category breakdown
                    VStack(spacing: 0) {
                        CategoryBreakdownBar(categories: monthCategories)
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 16)

                    // Filter
                    HStack(spacing: 0) {
                        ForEach(TxFilter.allCases, id: \.self) { f in
                            Button(f.rawValue) { filter = f }
                                .font(.system(size: 13, weight: filter == f ? .semibold : .regular))
                                .foregroundStyle(filter == f ? Color.sfText : Color.sfTertiary)
                                .padding(.horizontal, 0)
                                .padding(.vertical, 6)
                                .padding(.trailing, 16)
                                .overlay(alignment: .bottom) {
                                    if filter == f {
                                        Rectangle()
                                            .fill(Color.sfText)
                                            .frame(height: 2)
                                            .padding(.trailing, 16)
                                    }
                                }
                                .buttonStyle(.plain)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 14)
                    .padding(.bottom, 8)

                    HairlineDivider()
                        .padding(.horizontal, hPad)

                    // Transaction groups
                    ForEach(mockGroups) { group in
                        TransactionGroup(group: group, filter: filter)
                            .padding(.horizontal, hPad)
                            .padding(.top, 22)
                    }

                    Spacer(minLength: 140)
                }
            }
            .background(Color.sfBackground)

            CaptureFAB(action: { showingCapture = true })
                .padding(.bottom, 16)
        }
        .sheet(isPresented: $showingCapture) {
            ScreenshotPickerSheet()
        }
    }
}

// MARK: - Category breakdown

struct CategoryBreakdownBar: View {
    let categories: [CategoryEntry]

    private var total: Int { categories.reduce(0) { $0 + $1.amount } }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                SectionLabel(text: "本月分類")
                Spacer()
                Text("共 $\(total.formatted())")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.sfTertiary)
                    .monospacedDigit()
            }

            // Stacked bar
            GeometryReader { geo in
                HStack(spacing: 2) {
                    ForEach(categories) { cat in
                        let frac = total > 0 ? CGFloat(cat.amount) / CGFloat(total) : 0
                        Rectangle()
                            .fill(cat.color)
                            .frame(width: geo.size.width * frac)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 6))
            }
            .frame(height: 12)

            // Chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(categories) { cat in
                        let pct = total > 0 ? Int(Double(cat.amount) / Double(total) * 100) : 0
                        CategoryChip(entry: cat, pct: pct)
                    }
                }
                .padding(.vertical, 2)
            }
        }
    }
}

private struct CategoryChip: View {
    let entry: CategoryEntry
    let pct: Int

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(entry.color)
                .frame(width: 8, height: 8)
            Text(entry.name)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.sfText)
            Text("$\(entry.amount.formatted())")
                .font(.system(size: 12))
                .foregroundStyle(Color.sfSecondary)
                .monospacedDigit()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            entry.color.opacity(0.12),
            in: RoundedRectangle(cornerRadius: 14)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(entry.color.opacity(0.28), lineWidth: 0.5)
        )
    }
}

// MARK: - Transaction group

private struct TransactionGroup: View {
    let group: MockGroup
    let filter: TransactionsView.TxFilter

    private var filteredItems: [MockTransaction] {
        switch filter {
        case .all:     return group.items
        case .expense: return group.items.filter { !$0.isIncome }
        case .income:  return group.items.filter { $0.isIncome }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Day header
            HStack(alignment: .firstTextBaseline) {
                Text(group.dateLabel)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Color.sfSecondary)
                    .kerning(0.3)
                Spacer()
                if group.items.isEmpty {
                    Text("沒有花費")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Color.sfTertiary)
                } else {
                    let total = group.total
                    Text(total < 0
                         ? "淨入 +$\(abs(total).formatted())"
                         : "$\(total.formatted())")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Color.sfTertiary)
                        .monospacedDigit()
                }
            }
            .padding(.bottom, 6)

            if filteredItems.isEmpty {
                Text("—")
                    .font(.system(size: 14))
                    .foregroundStyle(Color.sfTertiary)
                    .italic()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 10)
            } else {
                ForEach(filteredItems) { tx in
                    TxLine(tx: tx)
                }
            }
        }
    }
}

// MARK: - TxLine

private struct TxLine: View {
    let tx: MockTransaction

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Text(tx.time)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(Color.sfTertiary)
                .monospacedDigit()
                .frame(width: 38, alignment: .leading)
                .padding(.top, 3)

            VStack(alignment: .leading, spacing: 2) {
                Text(tx.merchant)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(Color.sfText)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(tx.category)
                    Text("·")
                        .opacity(0.4)
                    Text(tx.account)
                    if tx.fromScreenshot {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 9))
                            .foregroundStyle(Color.sfTertiary)
                    }
                }
                .font(.system(size: 12))
                .foregroundStyle(Color.sfSecondary)
            }

            Spacer()

            Text((tx.isIncome ? "+" : "") + "$\(tx.amount.formatted())")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(tx.isIncome ? Color.sfGreen : Color.sfText)
                .monospacedDigit()
                .padding(.top, 1)
        }
        .padding(.vertical, 12)
        .overlay(alignment: .top) {
            HairlineDivider()
        }
    }
}
