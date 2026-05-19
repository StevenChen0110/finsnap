import type { Transaction, Account, AppSettings } from './types'

export const seedTransactions: Transaction[] = [
  // 2026-05-18
  { id: 'tx1', date: '2026-05-18', time: '12:34', amount: 156, type: 'expense', merchant: '全家便利商店 信義店', category: '飲食', account: '玉山信用卡', fromScreenshot: true, createdAt: '2026-05-18T12:34:00Z' },
  { id: 'tx2', date: '2026-05-18', time: '09:12', amount: 89, type: 'expense', merchant: '路易莎咖啡 信義店', category: '飲食', account: 'LINE Pay', fromScreenshot: true, createdAt: '2026-05-18T09:12:00Z' },
  // 2026-05-16
  { id: 'tx3', date: '2026-05-16', time: '09:00', amount: 58000, type: 'income', merchant: '薪資轉入', category: '收入', account: '玉山銀行', createdAt: '2026-05-16T09:00:00Z' },
  { id: 'tx4', date: '2026-05-16', time: '19:20', amount: 1284, type: 'expense', merchant: '家樂福 內湖店', category: '居家', account: '玉山信用卡', fromScreenshot: true, createdAt: '2026-05-16T19:20:00Z' },
  { id: 'tx5', date: '2026-05-16', time: '14:32', amount: 32, type: 'expense', merchant: '台北捷運', category: '交通', account: '悠遊卡', createdAt: '2026-05-16T14:32:00Z' },
  { id: 'tx6', date: '2026-05-16', time: '12:30', amount: 890, type: 'expense', merchant: '優衣庫 信義店', category: '購物', account: 'LINE Pay', fromScreenshot: true, createdAt: '2026-05-16T12:30:00Z' },
  // 2026-05-15
  { id: 'tx7', date: '2026-05-15', time: '23:01', amount: 390, type: 'expense', merchant: 'Netflix 月費', category: '娛樂', account: '玉山信用卡', fromScreenshot: true, createdAt: '2026-05-15T23:01:00Z' },
  { id: 'tx8', date: '2026-05-15', time: '18:45', amount: 185, type: 'expense', merchant: '麥當勞 信義店', category: '飲食', account: 'LINE Pay', createdAt: '2026-05-15T18:45:00Z' },
  { id: 'tx9', date: '2026-05-15', time: '12:10', amount: 145, type: 'expense', merchant: '摩斯漢堡', category: '飲食', account: 'LINE Pay', createdAt: '2026-05-15T12:10:00Z' },
  // 2026-05-14
  { id: 'tx10', date: '2026-05-14', time: '21:30', amount: 620, type: 'expense', merchant: '誠品書店 信義店', category: '娛樂', account: '玉山信用卡', fromScreenshot: true, createdAt: '2026-05-14T21:30:00Z' },
  { id: 'tx11', date: '2026-05-14', time: '15:00', amount: 245, type: 'expense', merchant: 'Uber 計程車', category: '交通', account: 'LINE Pay', createdAt: '2026-05-14T15:00:00Z' },
  { id: 'tx12', date: '2026-05-14', time: '08:12', amount: 98, type: 'expense', merchant: '7-11 政大店', category: '飲食', account: '街口支付', createdAt: '2026-05-14T08:12:00Z' },
  // 2026-05-10 to 05-01
  { id: 'tx13', date: '2026-05-10', time: '19:00', amount: 2500, type: 'expense', merchant: '台灣電力公司', category: '帳單', account: '玉山銀行', createdAt: '2026-05-10T19:00:00Z' },
  { id: 'tx14', date: '2026-05-08', time: '14:00', amount: 560, type: 'expense', merchant: '好市多 南港店', category: '居家', account: '玉山信用卡', createdAt: '2026-05-08T14:00:00Z' },
  { id: 'tx15', date: '2026-05-07', time: '12:00', amount: 320, type: 'expense', merchant: '麥當勞 南港店', category: '飲食', account: 'LINE Pay', createdAt: '2026-05-07T12:00:00Z' },
  { id: 'tx16', date: '2026-05-06', time: '20:00', amount: 350, type: 'expense', merchant: 'Spotify 月費', category: '帳單', account: '玉山信用卡', createdAt: '2026-05-06T20:00:00Z' },
  { id: 'tx17', date: '2026-05-05', time: '10:00', amount: 89, type: 'expense', merchant: '路易莎咖啡', category: '飲食', account: 'LINE Pay', createdAt: '2026-05-05T10:00:00Z' },
  { id: 'tx18', date: '2026-05-03', time: '15:30', amount: 1200, type: 'expense', merchant: 'ZARA 信義店', category: '購物', account: '玉山信用卡', fromScreenshot: true, createdAt: '2026-05-03T15:30:00Z' },
  { id: 'tx19', date: '2026-05-02', time: '19:00', amount: 145, type: 'expense', merchant: '全家便利商店', category: '飲食', account: '玉山信用卡', createdAt: '2026-05-02T19:00:00Z' },
  { id: 'tx20', date: '2026-05-01', time: '08:00', amount: 32, type: 'expense', merchant: '台北捷運', category: '交通', account: '悠遊卡', createdAt: '2026-05-01T08:00:00Z' },
  // April 2026
  { id: 'tx21', date: '2026-04-18', time: '09:00', amount: 58000, type: 'income', merchant: '薪資轉入', category: '收入', account: '玉山銀行', createdAt: '2026-04-18T09:00:00Z' },
  { id: 'tx22', date: '2026-04-16', time: '19:30', amount: 980, type: 'expense', merchant: '大潤發 南港', category: '居家', account: '玉山信用卡', createdAt: '2026-04-16T19:30:00Z' },
  { id: 'tx23', date: '2026-04-10', time: '14:00', amount: 2800, type: 'expense', merchant: '台灣電力公司', category: '帳單', account: '玉山銀行', createdAt: '2026-04-10T14:00:00Z' },
  { id: 'tx24', date: '2026-04-05', time: '12:00', amount: 4500, type: 'expense', merchant: '遠百 A13', category: '購物', account: '玉山信用卡', fromScreenshot: true, createdAt: '2026-04-05T12:00:00Z' },
  { id: 'tx25', date: '2026-04-03', time: '10:00', amount: 89, type: 'expense', merchant: '路易莎咖啡', category: '飲食', account: 'LINE Pay', createdAt: '2026-04-03T10:00:00Z' },
  // March 2026
  { id: 'tx26', date: '2026-03-16', time: '09:00', amount: 58000, type: 'income', merchant: '薪資轉入', category: '收入', account: '玉山銀行', createdAt: '2026-03-16T09:00:00Z' },
  { id: 'tx27', date: '2026-03-15', time: '18:00', amount: 1500, type: 'expense', merchant: '家樂福', category: '居家', account: '玉山信用卡', createdAt: '2026-03-15T18:00:00Z' },
  { id: 'tx28', date: '2026-03-10', time: '09:00', amount: 3200, type: 'expense', merchant: '台灣大哥大 月租', category: '帳單', account: '玉山信用卡', createdAt: '2026-03-10T09:00:00Z' },
]

export const seedAccounts: Account[] = [
  { id: 'acc1', name: '玉山銀行 綜存', type: 'bank', balance: 284316, isCredit: false, currency: 'TWD', institution: '玉山銀行', masked: '****-***-6789', trend: 5200, lastUpdated: '2026-05-17', color: 'oklch(0.60 0.07 155)', groupLabel: '銀行 · 現金' },
  { id: 'acc2', name: '中國信託 數位帳戶', type: 'bank', balance: 156400, isCredit: false, currency: 'TWD', institution: '中國信託', masked: '****-***-1102', trend: -1200, lastUpdated: '2026-05-12', color: 'oklch(0.60 0.07 155)', groupLabel: '銀行 · 現金' },
  { id: 'acc3', name: '現金', type: 'cash', balance: 27740, isCredit: false, currency: 'TWD', lastUpdated: '2026-05-18', color: 'oklch(0.60 0.07 155)', groupLabel: '銀行 · 現金' },
  { id: 'acc4', name: 'LINE Pay', type: 'ePay', balance: 4820, isCredit: false, currency: 'TWD', masked: '****1234', lastUpdated: '2026-05-18', color: 'oklch(0.62 0.09 290)', groupLabel: '電子支付' },
  { id: 'acc5', name: '街口支付', type: 'ePay', balance: 2140, isCredit: false, currency: 'TWD', lastUpdated: '2026-05-18', color: 'oklch(0.62 0.09 290)', groupLabel: '電子支付' },
  { id: 'acc6', name: '玉山信用卡', type: 'creditCard', balance: 18420, isCredit: true, currency: 'TWD', institution: '玉山銀行', masked: '****1234', lastUpdated: '2026-05-18', color: 'oklch(0.62 0.10 35)', groupLabel: '信用卡 · 本期' },
  { id: 'acc7', name: '永豐金證券 持倉', type: 'stock', balance: 1486329, isCredit: false, currency: 'TWD', institution: '永豐金證券', trend: -12840, lastUpdated: '2026-05-18', color: 'oklch(0.55 0.08 250)', groupLabel: '投資' },
  { id: 'acc8', name: '元大投信 基金', type: 'fund', balance: 405600, isCredit: false, currency: 'TWD', institution: '元大投信', trend: 3200, lastUpdated: '2026-05-01', color: 'oklch(0.55 0.08 250)', groupLabel: '投資' },
]

export const defaultSettings: AppSettings = {
  theme: 'light',
  budget: 60000,
  currency: 'TWD',
}
