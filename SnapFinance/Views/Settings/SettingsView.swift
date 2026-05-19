//
//  SettingsView.swift
//  SnapFinance — 設定畫面（隱私為先）
//

import SwiftUI

struct SettingsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                Text("設定")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(Color.sfText)
                    .padding(.horizontal, hPad)
                    .padding(.top, 8)

                // AI status card
                AIStatusCard()
                    .padding(.horizontal, hPad)
                    .padding(.top, 16)

                // Settings groups
                SettingsGroup(title: "隱私", items: [
                    SettingsItem(icon: "camera.viewfinder", label: "截圖儲存",      value: "僅文字",  hint: "辨識完即捨棄原圖"),
                    SettingsItem(icon: "faceid",           label: "原圖加密",      value: "Face ID", hint: nil),
                    SettingsItem(icon: "bell",             label: "通知與背景拉取", value: "已開啟",  hint: nil),
                ])

                SettingsGroup(title: "資料", items: [
                    SettingsItem(icon: "creditcard",       label: "帳戶",         value: "7 個",         hint: nil),
                    SettingsItem(icon: "tag",              label: "分類",         value: "23 個",         hint: nil),
                    SettingsItem(icon: "doc.text",         label: "電子發票載具", value: "已連動",         hint: nil),
                    SettingsItem(icon: "arrow.up.right",   label: "匯出 CSV",    value: "",              hint: nil),
                ])

                SettingsGroup(title: "快捷", items: [
                    SettingsItem(icon: "sparkles",         label: "App Intents", value: "Siri / 動作按鈕", hint: nil),
                    SettingsItem(icon: "photo.on.rectangle", label: "Widget",   value: "主畫面 + 鎖定畫面", hint: nil),
                ])

                SettingsGroup(title: "關於", items: [
                    SettingsItem(icon: nil, label: "版本",    value: "1.0.0 (build 1)", hint: nil),
                    SettingsItem(icon: nil, label: "設計理念", value: "",               hint: nil),
                    SettingsItem(icon: nil, label: "開源授權", value: "",               hint: nil),
                ])

                // Footer
                VStack(spacing: 4) {
                    Text("SnapFinance")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Color.sfTertiary)
                    Text("所有資料儲存在這台 iPhone")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.sfTertiary)
                    Text("除非你開啟 iCloud 同步")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.sfTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 24)
                .padding(.bottom, 48)
            }
        }
        .background(Color.sfBackground)
    }
}

// MARK: - AI status card

private struct AIStatusCard: View {
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                AIGradient()
                    .clipShape(Circle())
                    .frame(width: 36, height: 36)
                Image(systemName: "sparkles")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text("Apple Intelligence")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color.sfText)
                Text("裝置端 · 142 個學習過的商家")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.sfSecondary)
            }

            Spacer()

            Text("啟用中")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(Color.sfGreen)
                .kerning(0.3)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Color.sfGreen.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
        }
        .padding(16)
        .background(Color.sfCard, in: RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Settings group

struct SettingsItem {
    let icon: String?
    let label: String
    let value: String
    let hint: String?
}

private struct SettingsGroup: View {
    let title: String
    let items: [SettingsItem]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionLabel(text: title)
                .padding(.horizontal, hPad)
                .padding(.top, 24)
                .padding(.bottom, 4)

            ForEach(Array(items.enumerated()), id: \.offset) { idx, item in
                HStack(alignment: .center, spacing: 12) {
                    if let icon = item.icon {
                        Image(systemName: icon)
                            .font(.system(size: 16))
                            .foregroundStyle(Color.sfSecondary)
                            .frame(width: 22, alignment: .center)
                    } else {
                        Spacer().frame(width: 22)
                    }

                    VStack(alignment: .leading, spacing: 1) {
                        Text(item.label)
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(Color.sfText)
                        if let hint = item.hint {
                            Text(hint)
                                .font(.system(size: 12))
                                .foregroundStyle(Color.sfSecondary)
                        }
                    }

                    Spacer()

                    Text(item.value)
                        .font(.system(size: 14))
                        .foregroundStyle(Color.sfSecondary)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.sfTertiary)
                }
                .padding(.horizontal, hPad)
                .padding(.vertical, 14)
                .overlay(alignment: .top) {
                    if idx > 0 {
                        HairlineDivider()
                            .padding(.leading, hPad + 22 + 12)
                    }
                }
            }
        }
    }
}
