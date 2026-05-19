'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Transaction, Account, AppSettings } from './types'
import { load, save } from './store'
import { defaultSettings } from './seed'

interface AppCtx {
  transactions: Transaction[]
  accounts: Account[]
  settings: AppSettings
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addAccount: (a: Omit<Account, 'id'>) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void
  updateSettings: (s: Partial<AppSettings>) => void
  resetAll: () => void
}

const Ctx = createContext<AppCtx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTransactions(load.transactions() ?? [])
    setAccounts(load.accounts() ?? [])
    setSettings(load.settings() ?? defaultSettings)
    setHydrated(true)
  }, [])

  useEffect(() => { if (hydrated) save.transactions(transactions) }, [transactions, hydrated])
  useEffect(() => { if (hydrated) save.accounts(accounts) }, [accounts, hydrated])
  useEffect(() => { if (hydrated) save.settings(settings) }, [settings, hydrated])

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setTransactions(prev => [tx, ...prev].sort((a, b) => `${b.date}${b.time}` < `${a.date}${a.time}` ? -1 : 1))
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const addAccount = useCallback((a: Omit<Account, 'id'>) => {
    const acct: Account = { ...a, id: crypto.randomUUID() }
    setAccounts(prev => [...prev, acct])
  }, [])

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }, [])

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id))
  }, [])

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }))
  }, [])

  const resetAll = useCallback(() => {
    localStorage.clear()
    setTransactions([])
    setAccounts([])
    setSettings(defaultSettings)
  }, [])

  return (
    <Ctx.Provider value={{ transactions, accounts, settings, addTransaction, updateTransaction, deleteTransaction, addAccount, updateAccount, deleteAccount, updateSettings, resetAll }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
