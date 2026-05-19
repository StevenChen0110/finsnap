//
//  RootView.swift
//  SnapFinance
//

import SwiftUI

struct RootView: View {
    @State private var pendingPayload: SharedPayload?
    @State private var selectedTab: Tab = .home

    enum Tab { case home, transactions, assets, settings }

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView(onCapture: { selectedTab = .home })
                .tabItem { Label("總覽", systemImage: "house") }
                .tag(Tab.home)

            TransactionsView()
                .tabItem { Label("交易", systemImage: "list.bullet") }
                .tag(Tab.transactions)

            AssetsView()
                .tabItem { Label("資產", systemImage: "chart.line.uptrend.xyaxis") }
                .tag(Tab.assets)

            SettingsView()
                .tabItem { Label("設定", systemImage: "gearshape") }
                .tag(Tab.settings)
        }
        .tint(Color.sfAccent)
        .onOpenURL { url in
            guard url.host == "capture",
                  let id = UUID(uuidString: url.lastPathComponent),
                  let payload = try? SharedInbox.read(id: id)
            else { return }
            pendingPayload = payload
        }
        .sheet(item: $pendingPayload) { payload in
            ConfirmCaptureView(payload: payload) {
                SharedInbox.clear(id: payload.id)
                pendingPayload = nil
                selectedTab = .transactions
            }
        }
    }
}
