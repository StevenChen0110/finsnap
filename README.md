# SnapFinance

個人化、截圖驅動、隱私優先的 iOS 記帳 App。

## 開啟方式

1. 在 Xcode 建一個新的 iOS App 專案（`File → New → Project → App`）
   - Product Name: **SnapFinance**
   - Bundle ID: `com.yourname.snapfinance`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: **SwiftData** ✓
2. 刪除 Xcode 自動產生的 `ContentView.swift`
3. 把 `SnapFinance/` 資料夾下所有 `.swift` 檔案拖進 Xcode 專案（勾選 "Copy items if needed"）
4. 在 `SnapFinanceApp.swift` 確認 `@main` 標記存在
5. 加入 Charts framework：`Target → General → Frameworks, Libraries → + → Charts.framework`
6. Build & Run（iPhone 16 Simulator 或實機 iOS 18+）

## 專案結構

```
SnapFinance/
├── SnapFinanceApp.swift         # App 進入點，ModelContainer 初始化
├── Models/
│   └── Models.swift             # SwiftData 資料模型（Transaction / AssetSnapshot / Category / Account / MerchantRule）
├── Processing/
│   └── ScreenshotProcessor.swift # Vision OCR + 規則引擎 + Apple Intelligence stub
└── Views/
    ├── DesignSystem.swift        # 顏色 token、字體、共用元件（FAB / Divider / SectionLabel）
    ├── RootView.swift            # TabView root + deep link routing
    ├── Dashboard/
    │   ├── DashboardView.swift   # 現金流視角（Hero 數字 + Skyline + AI 卡）
    │   └── NetWorthView.swift    # 淨資產視角（折線圖 + 資產組成色條）
    ├── Transactions/
    │   └── TransactionsView.swift # 時間軸列表 + 本月分類色條 + chip
    ├── Assets/
    │   └── AssetsView.swift       # 淨資產 + 折線圖 + 帳戶群組 + 占比細 bar
    ├── Settings/
    │   └── SettingsView.swift     # 隱私優先設定，AI 狀態卡在頂部
    └── Capture/
        └── ConfirmCaptureView.swift # 截圖辨識確認畫面（預填 + 儲存）
```

## 設計語彙

| Token | 值 |
|---|---|
| 背景 | 暖奶油 `oklch(0.965 0.010 80)` ≈ `#F5F1EC` |
| Accent | 深靛藍 `oklch(0.42 0.08 245)` ≈ `#3247AA` |
| Hero 字體 | New York Serif, 68pt Light |
| 卡片邊角 | 18pt |
| 側邊 padding | 24pt |

## Phase 2 待實作

- [ ] Widget（WidgetKit）：今日花費 / 淨資產
- [ ] App Intents + Siri 快速新增
- [ ] Share Extension（真實 iOS Share Sheet 接收）
- [ ] Apple Intelligence FoundationModels（iOS 26+）整合
- [ ] 電子發票載具背景拉取
- [ ] 預算設定 + 超支警示
- [ ] CSV 匯出
- [ ] Charts 月報表
