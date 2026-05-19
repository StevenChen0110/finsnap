//
//  NetWorthView.swift
//  SnapFinance — 淨資產視角（總覽的切換面板）
//

import SwiftUI
import SwiftData
import Charts

// Asset composition entry
struct AssetCompositionEntry {
    let label: String
    let amount: Decimal
    let color: Color
}

let mockComposition: [AssetCompositionEntry] = [
    .init(label: "投資",        amount: 1_891_929, color: Color(red: 0.25, green: 0.38, blue: 0.72)),
    .init(label: "銀行 · 現金", amount: 468_456,   color: Color(red: 0.35, green: 0.67, blue: 0.45)),
    .init(label: "電子支付",    amount: 6_960,     color: Color(red: 0.58, green: 0.35, blue: 0.82)),
]

// Mock 90-day net worth path (in millions TWD)
private let netWorthPath: [Double] = [
    2.180, 2.182, 2.179, 2.190, 2.205, 2.198, 2.212, 2.225, 2.220, 2.230,
    2.218, 2.245, 2.260, 2.255, 2.270, 2.285, 2.280, 2.291, 2.305, 2.298,
    2.310, 2.318, 2.316, 2.329, 2.334, 2.336, 2.345, 2.341, 2.348,
].map { $0 * 1_000_000 }

struct NetWorthView: View {
    let snapshots: [AssetSnapshot]

    private var netWorth: Decimal {
        let latest = Dictionary(grouping: snapshots, by: { $0.account?.id })
            .compactMapValues { $0.first }
        return latest.values.reduce(Decimal(0)) { acc, s in
            acc + s.balance * (s.assetType == .creditCard ? -1 : 1)
        }
    }

    private var displayNetWorth: Double {
        netWorth.isNaN ? 2_348_925 : Double(truncating: netWorth as NSDecimalNumber)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Hero
            VStack(alignment: .leading, spacing: 10) {
                Text("淨資產")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.sfSecondary)
                    .kerning(0.3)

                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("$")
                        .font(Font.system(size: 24, weight: .regular, design: .serif))
                        .foregroundStyle(Color.sfSecondary)
                    Text(displayNetWorth, format: .number.precision(.fractionLength(0)))
                        .font(Font.system(size: 60, weight: .light, design: .serif))
                        .foregroundStyle(Color.sfText)
                        .monospacedDigit()
                }

                HStack(spacing: 4) {
                    Image(systemName: "arrow.up.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.sfGreen)
                    Text("+$12,480")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Color.sfGreen)
                    Text("本週")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.sfSecondary)
                }
            }
            .padding(.horizontal, hPad)
            .padding(.top, 24)

            // Line chart
            NetWorthLineChart(data: netWorthPath)
                .frame(height: 120)
                .padding(.top, 32)

            // Period selector
            HStack(spacing: 18) {
                ForEach(["1月", "3月", "6月", "1年", "全部"], id: \.self) { period in
                    Text(period)
                        .font(.system(size: 11, weight: period == "3月" ? .semibold : .medium))
                        .foregroundStyle(period == "3月" ? Color.sfText : Color.sfTertiary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.top, 10)

            // Composition bar
            VStack(alignment: .leading, spacing: 10) {
                let total = mockComposition.reduce(Decimal(0)) { $0 + $1.amount }
                HStack {
                    SectionLabel(text: "資產組成")
                    Spacer()
                    Text("共 $\(total.formatted())")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.sfTertiary)
                }

                StackedBar(entries: mockComposition)
                    .frame(height: 12)

                VStack(spacing: 0) {
                    ForEach(Array(mockComposition.enumerated()), id: \.offset) { idx, entry in
                        let pct = total > 0 ? Double(truncating: (entry.amount / total * 100) as NSDecimalNumber) : 0
                        HStack {
                            Circle()
                                .fill(entry.color)
                                .frame(width: 8, height: 8)
                            Text(entry.label)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundStyle(Color.sfText)
                            Spacer()
                            Text(String(format: "%.1f%%", pct))
                                .font(.system(size: 13))
                                .foregroundStyle(Color.sfSecondary)
                                .frame(width: 44, alignment: .trailing)
                            Text("$\(entry.amount.formatted())")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundStyle(Color.sfText)
                                .monospacedDigit()
                                .frame(width: 100, alignment: .trailing)
                        }
                        .padding(.vertical, 12)
                        .overlay(alignment: .top) {
                            if idx > 0 { HairlineDivider() }
                        }
                    }
                }

                // Credit card note
                HStack {
                    Text("另有信用卡本期應繳")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.sfSecondary)
                    Spacer()
                    Text("$18,420")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Color.sfRed)
                        .monospacedDigit()
                }
                .padding(14)
                .background(Color.sfRed.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
            }
            .padding(.horizontal, hPad)
            .padding(.top, 36)

            // Time-series summary
            VStack(spacing: 0) {
                SummaryRow(label: "本週", value: "比上週多", hint: "+$12,480", isFirst: true)
                SummaryRow(label: "本月", value: "持續上升", hint: "+$38,925")
                SummaryRow(label: "年初", value: "成長 11.8%", hint: "+$248,300")
            }
            .padding(.horizontal, hPad)
            .padding(.top, 40)
        }
    }
}

// MARK: - Line chart

struct NetWorthLineChart: View {
    let data: [Double]

    var body: some View {
        Chart {
            ForEach(Array(data.enumerated()), id: \.offset) { idx, val in
                AreaMark(
                    x: .value("Day", idx),
                    y: .value("NW", val)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color.sfAccent.opacity(0.18), Color.sfAccent.opacity(0)],
                        startPoint: .top, endPoint: .bottom
                    )
                )
                LineMark(
                    x: .value("Day", idx),
                    y: .value("NW", val)
                )
                .foregroundStyle(Color.sfAccent)
                .lineStyle(StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round))
            }
            // Endpoint dot
            if let last = data.last {
                PointMark(
                    x: .value("Day", data.count - 1),
                    y: .value("NW", last)
                )
                .foregroundStyle(Color.sfAccent)
                .symbolSize(20)
            }
        }
        .chartXAxis(.hidden)
        .chartYAxis(.hidden)
        .chartLegend(.hidden)
    }
}

// MARK: - Stacked bar

struct StackedBar: View {
    let entries: [AssetCompositionEntry]

    var body: some View {
        let total = entries.reduce(Decimal(0)) { $0 + $1.amount }
        GeometryReader { geo in
            HStack(spacing: 2) {
                ForEach(Array(entries.enumerated()), id: \.offset) { _, entry in
                    let frac = total > 0
                        ? CGFloat(Double(truncating: (entry.amount / total) as NSDecimalNumber))
                        : 0
                    Rectangle()
                        .fill(entry.color)
                        .frame(width: geo.size.width * frac)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 6))
        }
    }
}
