//
//  DashboardView.swift
//  SnapFinance — 主總覽畫面
//
//  設計原則：
//   • 頂部切換：現金流 ↔ 淨資產
//   • 現金流：一個 Hero 數字（本月剩餘）+ 30 天 Skyline + 對話式摘要 + AI 問卡
//   • 淨資產：大數字 + 90 天折線圖 + 資產組成色條 + 摘要
//

import SwiftUI
import SwiftData

struct DashboardView: View {
    var onCapture: () -> Void = {}

    @Query(sort: \Transaction.date, order: .reverse)
    private var transactions: [Transaction]

    @Query(sort: \AssetSnapshot.date, order: .reverse)
    private var snapshots: [AssetSnapshot]

    @State private var view: DashboardViewMode = .cashflow
    @State private var showingCapture = false

    private var monthRemaining: Decimal {
        let budget: Decimal = 60_000
        let cal = Calendar.current
        let monthStart = cal.dateInterval(of: .month, for: .now)!.start
        let spent = transactions
            .filter { $0.date >= monthStart && $0.type == .expense }
            .reduce(Decimal(0)) { $0 + $1.amount }
        return budget - spent
    }

    private var daysLeft: Int {
        let cal = Calendar.current
        let monthEnd = cal.dateInterval(of: .month, for: .now)!.end
        return max(0, cal.dateComponents([.day], from: .now, to: monthEnd).day ?? 0)
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Month label + filter icon
                    HStack {
                        Text(Date.now.formatted(.dateTime.year().month(.wide)))
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(Color.sfSecondary)
                        Spacer()
                        Image(systemName: "line.3.horizontal.decrease")
                            .font(.system(size: 18, weight: .light))
                            .foregroundStyle(Color.sfSecondary)
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 8)

                    // View toggle
                    HStack(spacing: 22) {
                        ViewToggleButton(title: "現金流", selected: view == .cashflow) {
                            view = .cashflow
                        }
                        ViewToggleButton(title: "淨資產", selected: view == .networth) {
                            view = .networth
                        }
                    }
                    .padding(.horizontal, hPad)
                    .padding(.top, 14)

                    if view == .cashflow {
                        CashflowView(
                            remaining: monthRemaining,
                            daysLeft: daysLeft,
                            transactions: transactions
                        )
                    } else {
                        NetWorthView(snapshots: snapshots)
                    }
                }
                .padding(.bottom, 140)
            }
            .background(Color.sfBackground)

            // FAB centred above tab bar
            CaptureFAB(action: { showingCapture = true })
                .padding(.bottom, 16)
        }
        .sheet(isPresented: $showingCapture) {
            ScreenshotPickerSheet()
        }
    }
}

enum DashboardViewMode { case cashflow, networth }

// MARK: - Toggle button

private struct ViewToggleButton: View {
    let title: String
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: selected ? .semibold : .medium))
                .foregroundStyle(selected ? Color.sfText : Color.sfTertiary)
                .padding(.bottom, 6)
                .overlay(alignment: .bottom) {
                    if selected {
                        Rectangle()
                            .fill(Color.sfText)
                            .frame(height: 1.5)
                    }
                }
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.18), value: selected)
    }
}

// MARK: - Cashflow view

private struct CashflowView: View {
    let remaining: Decimal
    let daysLeft: Int
    let transactions: [Transaction]

    private var dailyAvg: Decimal {
        daysLeft > 0 ? remaining / Decimal(daysLeft) : 0
    }

    // 30 days daily spend for skyline
    private var dailySpend: [Double] {
        let cal = Calendar.current
        return (0..<30).reversed().map { offset in
            let day = cal.date(byAdding: .day, value: -offset, to: .now)!
            let dayStart = cal.startOfDay(for: day)
            let dayEnd = cal.date(byAdding: .day, value: 1, to: dayStart)!
            return transactions
                .filter { $0.date >= dayStart && $0.date < dayEnd && $0.type == .expense }
                .reduce(0.0) { $0 + Double(truncating: $1.amount as NSDecimalNumber) }
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Hero
            VStack(alignment: .leading, spacing: 10) {
                Text("本月剩餘")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.sfSecondary)
                    .kerning(0.3)

                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("$")
                        .font(Font.system(size: 26, weight: .regular, design: .serif))
                        .foregroundStyle(Color.sfSecondary)
                    Text(remaining, format: .number.precision(.fractionLength(0)))
                        .font(Font.heroAmount)
                        .foregroundStyle(Color.sfText)
                        .monospacedDigit()
                }

                HStack(spacing: 6) {
                    Text("還有")
                        .foregroundStyle(Color.sfSecondary)
                    Text("\(daysLeft) 天")
                        .fontWeight(.medium)
                        .foregroundStyle(Color.sfText)
                    Text("過完這個月")
                        .foregroundStyle(Color.sfSecondary)
                    Text("·")
                        .foregroundStyle(Color.sfTertiary)
                    Text("平均每天")
                        .foregroundStyle(Color.sfSecondary)
                    Text(dailyAvg, format: .currency(code: "TWD").precision(.fractionLength(0)))
                        .fontWeight(.medium)
                        .foregroundStyle(Color.sfText)
                }
                .font(.system(size: 14))
            }
            .padding(.horizontal, hPad)
            .padding(.top, 24)

            // Skyline chart
            SkylineChart(dailySpend: dailySpend)
                .padding(.top, 40)

            // Summary rows
            VStack(spacing: 0) {
                SummaryRow(label: "今天",  value: "2 筆消費", hint: "$245",  isFirst: true)
                SummaryRow(label: "昨天",  value: "沒有花費", hint: "")
                SummaryRow(label: "本週",  value: "比上週少", hint: "−$640")
            }
            .padding(.horizontal, hPad)
            .padding(.top, 40)

            // AI card
            AIInsightCard()
                .padding(.horizontal, hPad)
                .padding(.top, 40)
        }
    }
}

// MARK: - Skyline chart

struct SkylineChart: View {
    let dailySpend: [Double]

    private var sqrtMax: Double {
        sqrt(dailySpend.max() ?? 1)
    }

    var body: some View {
        Canvas { ctx, size in
            let W = size.width - hPad * 2
            let H: CGFloat = 64
            let count = dailySpend.count
            let gap: CGFloat = 3
            let col = (W - gap * CGFloat(count - 1)) / CGFloat(count)
            let startX = hPad
            let baseY = H

            // baseline
            var baselinePath = Path()
            baselinePath.move(to: CGPoint(x: startX, y: baseY + 0.5))
            baselinePath.addLine(to: CGPoint(x: startX + W, y: baseY + 0.5))
            ctx.stroke(baselinePath, with: .color(Color.sfDivider), lineWidth: 0.5)

            for (i, v) in dailySpend.enumerated() {
                let x = startX + CGFloat(i) * (col + gap)
                let sqrtV = sqrt(max(v, 0))
                let h = sqrtMax > 0 ? (sqrtV / sqrtMax) * H : 0
                let barH = max(h, 2)
                let y = baseY - barH

                let isToday = i == dailySpend.count - 1
                let isWeekend = (i + 3) % 7 >= 5 // rough weekend calc

                let fillColor: Color = isToday ? Color.sfAccent : Color.sfText
                let opacity: Double = isToday ? 1.0 : (isWeekend ? 0.20 : 0.12)

                let rect = CGRect(x: x, y: y, width: col, height: barH)
                let path = Path(roundedRect: rect, cornerRadius: col * 0.4)
                ctx.fill(path, with: .color(fillColor.opacity(opacity)))

                if isToday {
                    let dotX = x + col / 2
                    let dotY = y - 8
                    let dotRect = CGRect(x: dotX - 2.5, y: dotY - 2.5, width: 5, height: 5)
                    ctx.fill(Path(ellipseIn: dotRect), with: .color(Color.sfAccent))
                }
            }
        }
        .frame(height: 84)
        .overlay(alignment: .bottomLeading) {
            Text("5 / 1")
                .font(.system(size: 10))
                .foregroundStyle(Color.sfTertiary)
                .padding(.leading, hPad)
                .padding(.bottom, 0)
        }
        .overlay(alignment: .bottomTrailing) {
            Text("今天")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(Color.sfAccent)
                .padding(.trailing, hPad)
                .padding(.bottom, 0)
        }
    }
}

// MARK: - AI card

private struct AIInsightCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                ZStack {
                    AIGradient()
                        .clipShape(Circle())
                        .frame(width: 18, height: 18)
                    Image(systemName: "sparkles")
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundStyle(.white)
                }
                Text("AI 注意到")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Color.sfSecondary)
                    .kerning(0.4)
                    .textCase(.uppercase)
            }
            .padding(.bottom, 8)

            Text("你最近平日的**咖啡花費**比上週多了 **$380**。要把它設為單獨子分類嗎？")
                .font(.system(size: 16, weight: .regular))
                .foregroundStyle(Color.sfText)
                .lineSpacing(4)
                .padding(.trailing, 20)

            HStack(spacing: 8) {
                Button("忽略") {}
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.sfSecondary)
                    .buttonStyle(.plain)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)

                Button("好的") {}
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.sfAccent, in: Capsule())
                    .buttonStyle(.plain)
            }
            .padding(.top, 14)
        }
        .padding(18)
        .background(Color.sfCard, in: RoundedRectangle(cornerRadius: cardCorner))
        .overlay {
            // large decorative quote mark
            Text("\"")
                .font(.system(size: 60, design: .serif))
                .foregroundStyle(Color.sfTertiary.opacity(0.35))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .offset(x: -14, y: 6)
                .allowsHitTesting(false)
        }
    }
}

// MARK: - Screenshot picker placeholder

struct ScreenshotPickerSheet: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Image(systemName: "camera.viewfinder")
                    .font(.system(size: 52, weight: .ultraLight))
                    .foregroundStyle(Color.sfAccent)
                Text("從相簿或 Share Sheet 匯入截圖")
                    .font(.title3).fontWeight(.semibold)
                    .multilineTextAlignment(.center)
                Text("在 iOS 內，長按截圖 → 分享 → SnapFinance\n即可直接辨識並記帳")
                    .font(.callout)
                    .foregroundStyle(Color.sfSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(40)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.sfBackground)
            .navigationTitle("截圖記帳")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("關閉") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
    }
}
