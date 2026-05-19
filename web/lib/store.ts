import type { Transaction, Account, AppSettings } from './types'

const K = {
  tx: 'finsnap_transactions',
  acct: 'finsnap_accounts',
  settings: 'finsnap_settings',
}

function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function set<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export const load = {
  transactions: () => get<Transaction[]>(K.tx),
  accounts: () => get<Account[]>(K.acct),
  settings: () => get<AppSettings>(K.settings),
}

export const save = {
  transactions: (d: Transaction[]) => set(K.tx, d),
  accounts: (d: Account[]) => set(K.acct, d),
  settings: (d: AppSettings) => set(K.settings, d),
}
