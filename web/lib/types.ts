export type TransactionType = 'income' | 'expense'
export type AssetType = 'bank' | 'creditCard' | 'ePay' | 'cash' | 'stock' | 'fund' | 'crypto' | 'bond' | 'insurance' | 'other'

export interface Transaction {
  id: string
  date: string    // 'YYYY-MM-DD'
  time: string    // 'HH:MM'
  amount: number
  type: TransactionType
  merchant: string
  category: string
  account: string
  note?: string
  fromScreenshot?: boolean
  createdAt: string
}

export interface Account {
  id: string
  name: string
  type: AssetType
  balance: number
  isCredit: boolean
  currency: string
  institution?: string
  masked?: string
  trend?: number
  lastUpdated: string
  color: string
  groupLabel: string
}

export interface AppSettings {
  theme: 'light' | 'dark'
  budget: number
  currency: string
}

export const CATEGORIES = ['飲食', '交通', '購物', '娛樂', '居家', '帳單', '收入', '其他'] as const
export type Category = typeof CATEGORIES[number]

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  bank: '銀行',
  creditCard: '信用卡',
  ePay: '電子支付',
  cash: '現金',
  stock: '股票/ETF',
  fund: '基金',
  crypto: '加密貨幣',
  bond: '債券',
  insurance: '保險',
  other: '其他',
}

export const ACCOUNT_COLORS: Record<AssetType, string> = {
  bank: 'oklch(0.60 0.07 155)',
  cash: 'oklch(0.60 0.07 155)',
  ePay: 'oklch(0.62 0.09 290)',
  creditCard: 'oklch(0.62 0.10 35)',
  stock: 'oklch(0.55 0.08 250)',
  fund: 'oklch(0.55 0.08 250)',
  crypto: 'oklch(0.65 0.12 55)',
  bond: 'oklch(0.58 0.06 200)',
  insurance: 'oklch(0.60 0.08 340)',
  other: 'oklch(0.65 0.02 280)',
}

export const ACCOUNT_GROUP_LABELS: Record<AssetType, string> = {
  bank: '銀行 · 現金',
  cash: '銀行 · 現金',
  ePay: '電子支付',
  creditCard: '信用卡 · 本期',
  stock: '投資',
  fund: '投資',
  crypto: '投資',
  bond: '投資',
  insurance: '其他資產',
  other: '其他資產',
}
