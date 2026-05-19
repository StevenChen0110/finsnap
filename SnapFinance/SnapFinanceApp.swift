//
//  SnapFinanceApp.swift
//  SnapFinance
//
//  Swift 6 / iOS 18+
//

import SwiftUI
import SwiftData

@main
struct SnapFinanceApp: App {
    let container: ModelContainer = {
        do {
            return try DataStore.makeContainer()
        } catch {
            fatalError("ModelContainer 初始化失敗: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(container)
    }
}

