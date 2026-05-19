//
//  Models.swift
//  SnapFinance — SwiftData 資料模型
//
//  Swift 6 / iOS 18+
//

import Foundation
import SwiftData

// MARK: - Enums

enum TransactionType: String, Codable, CaseIterable {
    case income, expense, transfer

    var localized: String {
        switch self {
        case .income:   return "收入"
        case .expense:  return "支出"
        case .transfer: return "轉帳"
        }
    }
}

enum SourceType: String, Codable, CaseIterable {
    case screenshot, manual, invoice, widget, `import`
}

enum AssetType: String, Codable, CaseIterable {
    case bank, creditCard, ePay, cash, stock, fund, crypto, bond, insurance, other

    var localized: String {
        switch self {
        case .bank:       return "銀行"
        case .creditCard: return "信用卡"
        case .ePay:       return "電子支付"
        case .cash:       return "現金"
        case .stock:      return "股票/ETF"
        case .fund:       return "基金"
        case .crypto:     return "加密貨幣"
        case .bond:       return "債券"
        case .insurance:  return "保險"
        case .other:      return "其他"
        }
    }

    var sfSymbol: String {
        switch self {
        case .bank:       return "building.columns"
        case .creditCard: return "creditcard"
        case .ePay:       return "wave.3.right.circle"
        case .cash:       return "banknote"
        case .stock:      return "chart.line.uptrend.xyaxis"
        case .fund:       return "chart.pie"
        case .crypto:     return "bitcoinsign.circle"
        case .bond:       return "doc.text"
        case .insurance:  return "shield"
        case .other:      return "wallet.pass"
        }
    }
}

// MARK: - Transaction

@Model
final class Transaction {
    @Attribute(.unique) var id: UUID
    var date: Date
    var amount: Decimal
    var currency: String
    var type: TransactionType
    var transactionDescription: String?
    var merchant: String?
    var note: String?
    @Relationship var account: Account?
    @Relationship var toAccount: Account?
    @Relationship var category: Category?
    var sourceType: SourceType
    var imageReference: String?
    var rawText: String?
    var aiConfidence: Double?
    var needsReview: Bool = false
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        date: Date,
        amount: Decimal,
        currency: String = "TWD",
        type: TransactionType,
        description: String? = nil,
        merchant: String? = nil,
        note: String? = nil,
        account: Account? = nil,
        toAccount: Account? = nil,
        category: Category? = nil,
        sourceType: SourceType,
        imageReference: String? = nil,
        rawText: String? = nil,
        aiConfidence: Double? = nil,
        needsReview: Bool = false
    ) {
        self.id = id
        self.date = date
        self.amount = amount
        self.currency = currency
        self.type = type
        self.transactionDescription = description
        self.merchant = merchant
        self.note = note
        self.account = account
        self.toAccount = toAccount
        self.category = category
        self.sourceType = sourceType
        self.imageReference = imageReference
        self.rawText = rawText
        self.aiConfidence = aiConfidence
        self.needsReview = needsReview
        self.createdAt = .now
        self.updatedAt = .now
    }

    var signedAmount: Decimal {
        switch type {
        case .income:   return amount
        case .expense:  return -amount
        case .transfer: return 0
        }
    }
}

// MARK: - AssetSnapshot

@Model
final class AssetSnapshot {
    @Attribute(.unique) var id: UUID
    var date: Date
    var assetName: String
    var assetType: AssetType
    var balance: Decimal
    var currency: String
    var shares: Decimal?
    var ticker: String?
    var costBasis: Decimal?
    @Relationship var account: Account?
    var sourceType: SourceType
    var imageReference: String?
    var rawText: String?
    var aiConfidence: Double?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        date: Date,
        assetName: String,
        assetType: AssetType,
        balance: Decimal,
        currency: String = "TWD",
        shares: Decimal? = nil,
        ticker: String? = nil,
        costBasis: Decimal? = nil,
        account: Account? = nil,
        sourceType: SourceType,
        imageReference: String? = nil,
        rawText: String? = nil,
        aiConfidence: Double? = nil
    ) {
        self.id = id
        self.date = date
        self.assetName = assetName
        self.assetType = assetType
        self.balance = balance
        self.currency = currency
        self.shares = shares
        self.ticker = ticker
        self.costBasis = costBasis
        self.account = account
        self.sourceType = sourceType
        self.imageReference = imageReference
        self.rawText = rawText
        self.aiConfidence = aiConfidence
        self.createdAt = .now
    }
}

// MARK: - Category

@Model
final class Category {
    @Attribute(.unique) var id: UUID
    var name: String
    var icon: String
    var colorHex: String
    var sortOrder: Int = 0
    @Relationship var parent: Category?
    @Relationship(deleteRule: .cascade, inverse: \Category.parent)
    var children: [Category] = []
    @Relationship(inverse: \Transaction.category)
    var transactions: [Transaction] = []

    init(
        id: UUID = UUID(),
        name: String,
        icon: String = "tag",
        colorHex: String = "#8E8E93",
        parent: Category? = nil,
        sortOrder: Int = 0
    ) {
        self.id = id
        self.name = name
        self.icon = icon
        self.colorHex = colorHex
        self.parent = parent
        self.sortOrder = sortOrder
    }

    var fullPath: String {
        if let p = parent { return "\(p.name) / \(name)" }
        return name
    }
}

// MARK: - Account

@Model
final class Account {
    @Attribute(.unique) var id: UUID
    var name: String
    var assetType: AssetType
    var currency: String
    var maskedNumber: String?
    var institution: String?
    var colorHex: String?
    var icon: String?
    var isActive: Bool = true
    var sortOrder: Int = 0
    @Relationship(inverse: \Transaction.account)
    var transactions: [Transaction] = []
    @Relationship(inverse: \AssetSnapshot.account)
    var snapshots: [AssetSnapshot] = []

    init(
        id: UUID = UUID(),
        name: String,
        assetType: AssetType,
        currency: String = "TWD",
        maskedNumber: String? = nil,
        institution: String? = nil,
        colorHex: String? = nil,
        icon: String? = nil
    ) {
        self.id = id
        self.name = name
        self.assetType = assetType
        self.currency = currency
        self.maskedNumber = maskedNumber
        self.institution = institution
        self.colorHex = colorHex
        self.icon = icon
    }
}

// MARK: - MerchantRule

@Model
final class MerchantRule {
    @Attribute(.unique) var id: UUID
    var matchToken: String
    @Relationship var category: Category?
    @Relationship var defaultAccount: Account?
    var hitCount: Int = 0
    var createdAt: Date
    var lastUsedAt: Date?

    init(
        id: UUID = UUID(),
        matchToken: String,
        category: Category? = nil,
        defaultAccount: Account? = nil
    ) {
        self.id = id
        self.matchToken = matchToken.lowercased()
        self.category = category
        self.defaultAccount = defaultAccount
        self.createdAt = .now
    }
}

// MARK: - ModelContainer

enum DataStore {
    static func makeContainer() throws -> ModelContainer {
        let schema = Schema([
            Transaction.self,
            AssetSnapshot.self,
            Category.self,
            Account.self,
            MerchantRule.self,
        ])
        let config = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false,
            allowsSave: true,
            cloudKitDatabase: .none
        )
        return try ModelContainer(for: schema, configurations: [config])
    }
}
