//
//  AssetsView.swift
//  SnapFinance — 資產畫面
//
//  淨資產 Hero + 折線圖（無軸）+ 資產組成色條 + 帳戶分組列表（含占比細bar）
//

import SwiftUI
import Charts

// MARK: - Mock data

struct AssetGroup: Identifiable {
    let id = UUID()
    let label: String
    let color: Color
    let items: [AssetItem]
}

struct AssetItem: Identifiable {
    let id = UUID()
    let name: String
    let sub: String
    let amount: Int
    let trend: Int?
    let isCredit: Bool
}

private let assetGroups: [AssetGroup] = [
    AssetGroup(label: "銀行 · 現金", color: Color(red: 0.35, green: 0.67, blue: 0.45), items: [
        AssetItem(name: "玉山銀行 綜存",     sub: "****-***-6789 · 昨天更新",   amount: 284316, trend: +5200,  isCredit: false),
        AssetItem(name: "中國信託 數位帳戶", sub: "****-***-1102 · 5/12 更新", amount: 156400, trend: -1200,  isCredit: false),
        AssetItem(name: "現金",             sub: "手動更新",                   amount: 27740,  trend: nil,    isCredit: false),
    ]),
    AssetGroup(label: "電子支付", color: Color(red: 0.58, green: 0.35, blue: 0.82), items: [
        AssetItem(name: "LINE Pay",  sub: "****1234 連動", amount: 4820, trend: nil, isCredit: false),
        AssetItem(name: "街口支付", sub: "預付餘額",       amount: 2140, trend: nil, isCredit: false),
    ]),
    AssetGroup(label: "信用卡 · 本期", color: Color(red: 0.80, green: 0.35, blue: 0.25), items: [
        AssetItem(name: "玉山信用卡", sub: "****1234 · 6/15 截止", amount: 18420, trend: nil, isCredit: true),
    ]),
    AssetGroup(label: "投資", color: Color(red: 0.25, green: 0.38, blue: 0.72), items: [
        AssetItem(name: "永豐金證券 持倉", sub: "4 檔股票 · 今日 −0.86%", amount: 1486329, trend: -12840, isCredit: false),
        AssetItem(name: "元大投信 基金",   sub: "2 檔 · 月初快照",        amount: 405600,  trend: +3200,  isCredit: false),
    ]),
]

private let positiveGroups = assetGroups.filter { !$0.items.contains(where: { $0.isCredit }) }
private let positiveTotal  = positiveGroups.flatMap(\.items).reduce(0) { $0 + $1.amount }

// MARK: - View

struct AssetsView: View {
    @State private var showingCapture = false

    private let netWorth   = 2_348_925
    private let weekChange = 12_480

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("所有帳戶")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(Color.sfSecondary)
                            Text("資產")
                                .font(.system(size: 22, weight: .semibold))
                                .foregroundStyle(Color.sfText)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 8)

                    // Net worth hero
                    VStack(alignment: .leading, spacing: 6) {
                        Text("淨資產")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(Color.sfSecondary)

                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("$")
                                .font(.system(size: 20, weight: .regular, design: .serif))
                                .foregroundStyle(Color.sfSecondary)
                            Text(netWorth.formatted())
                                .font(Font.heroAmountMedium)
                                .foregroundStyle(Color.sfText)
                                .monospacedDigit()
                        }

                        HStack(spacing: 4) {
                            Image(systemName: "arrow.up.right")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(Color.sfGreen)
                            Text("+$\(weekChange.formatted())")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Color.sfGreen)
                                .monospacedDigit()
                            Text("本週")
                                .font(.system(size: 13))
                                .foregroundStyle(Color.sfSecondary)
                        }
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 20)

                    // Line chart
                    NetWorthLineChart(data: netWorthPath)
                        .frame(height: 120)
                        .padding(.top, 20)

                    // Period selector
                    HStack(spacing: 18) {
                        ForEach(["1月", "3月", "6月", "1年", "全部"], id: \.self) { p in
                            Text(p)
                                .font(.system(size: 11, weight: p == "3月" ? .semibold : .medium))
                                .foregroundStyle(p == "3月" ? Color.sfText : Color.sfTertiary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 10)

                    // Composition bar
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            SectionLabel(text: "資產組成")
                            Spacer()
                            Text("共 $\(positiveTotal.formatted())")
                                .font(.system(size: 11))
                                .foregroundStyle(Color.sfTertiary)
                                .monospacedDigit()
                        }

                        // Stacked bar
                        GeometryReader { geo in
                            HStack(spacing: 2) {
                                ForEach(positiveGroups) { group in
                                    let sum = group.items.reduce(0) { $0 + $1.amount }
                                    let frac = positiveTotal > 0
                                        ? CGFloat(sum) / CGFloat(positiveTotal) : 0
                                    Rectangle()
                                        .fill(group.color)
                                        .frame(width: geo.size.width * frac)
                                }
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                        }
                        .frame(height: 12)

                        // Legend
                        FlowLayout(spacing: 14) {
                            ForEach(positiveGroups) { group in
                                let sum = group.items.reduce(0) { $0 + $1.amount }
                                let pct = positiveTotal > 0
                                    ? Int(Double(sum) / Double(positiveTotal) * 100) : 0
                                HStack(spacing: 6) {
                                    Circle().fill(group.color).frame(width: 8, height: 8)
                                    Text(group.label)
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.sfSecondary)
                                    Text("\(pct)%")
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundStyle(Color.sfText)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 32)

                    // Account groups
                    VStack(spacing: 0) {
                        ForEach(Array(assetGroups.enumerated()), id: \.element.id) { idx, group in
                            VStack(alignment: .leading, spacing: 0) {
                                SectionLabel(text: group.label)
                                    .padding(.top, idx == 0 ? 24 : 26)
                                    .padding(.bottom, 6)

                                ForEach(group.items) { item in
                                    AccountRow(
                                        item: item,
                                        groupColor: group.color,
                                        totalForBar: positiveTotal
                                    )
                                }
                            }
                        }
                    }
                    .padding(.horizontal, hPad)

                    Spacer(minLength: 140)
                }
            }
            .background(Color.sfBackground)

            CaptureFAB(label: "更新資產", action: { showingCapture = true })
                .padding(.bottom, 16)
        }
        .sheet(isPresented: $showingCapture) {
            ScreenshotPickerSheet()
        }
    }
}

// MARK: - Account row

private struct AccountRow: View {
    let item: AssetItem
    let groupColor: Color
    let totalForBar: Int

    private var barFraction: CGFloat {
        guard !item.isCredit, totalForBar > 0 else {
            return min(1, CGFloat(item.amount) / 50_000)
        }
        return min(1, CGFloat(item.amount) / CGFloat(totalForBar))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color.sfText)
                    Text(item.sub)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.sfSecondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text((item.isCredit ? "−" : "") + "$\(item.amount.formatted())")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(item.isCredit ? Color.sfRed : Color.sfText)
                        .monospacedDigit()
                    if let trend = item.trend {
                        Text((trend >= 0 ? "+" : "−") + "$\(abs(trend).formatted())")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundStyle(trend >= 0 ? Color.sfGreen : Color.sfRed)
                            .monospacedDigit()
                    }
                }
            }

            // Proportion bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 1.5)
                        .fill(Color.sfDivider)
                        .frame(height: 3)
                    RoundedRectangle(cornerRadius: 1.5)
                        .fill(item.isCredit ? Color.sfRed : groupColor)
                        .frame(width: geo.size.width * barFraction, height: 3)
                }
            }
            .frame(height: 3)
        }
        .padding(.vertical, 14)
        .overlay(alignment: .top) {
            HairlineDivider()
        }
    }
}

// MARK: - FlowLayout (simple wrapping HStack)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 0
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineH: CGFloat = 0
        var maxX: CGFloat = 0

        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if currentX + size.width > width && currentX > 0 {
                currentX = 0
                currentY += lineH + spacing
                lineH = 0
            }
            currentX += size.width + spacing
            lineH = max(lineH, size.height)
            maxX = max(maxX, currentX)
        }
        return CGSize(width: maxX, height: currentY + lineH)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var lineH: CGFloat = 0

        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX && x > bounds.minX {
                x = bounds.minX
                y += lineH + spacing
                lineH = 0
            }
            sub.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            lineH = max(lineH, size.height)
        }
    }
}
