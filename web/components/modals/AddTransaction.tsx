'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../../lib/context'
import { T } from '../design/tokens'
import Icon from '../ui/Icon'
import { CATEGORIES } from '../../lib/types'

interface Props {
  dark: boolean
  editId: string | null
  prefill: Record<string, string> | null
  onClose: () => void
}

export default function AddTransaction({ dark, editId, prefill, onClose }: Props) {
  const t = T(dark, 'soft')
  const { transactions, accounts, addTransaction, updateTransaction } = useApp()

  const existing = editId ? transactions.find(tx => tx.id === editId) : null

  const today = new Date().toISOString().split('T')[0]
  const nowTime = new Date().toTimeString().slice(0, 5)

  const [type, setType]         = useState<'expense' | 'income'>(existing?.type ?? (prefill?.transactionType as 'expense' | 'income') ?? 'expense')
  const [amount, setAmount]     = useState(existing ? String(existing.amount) : (prefill?.amount ?? ''))
  const [merchant, setMerchant] = useState(existing?.merchant ?? prefill?.merchant ?? '')
  const [category, setCategory] = useState(existing?.category ?? prefill?.category ?? '飲食')
  const [account, setAccount]   = useState(existing?.account ?? prefill?.account ?? (accounts[0]?.name ?? ''))
  const [date, setDate]         = useState(existing?.date ?? prefill?.date ?? today)
  const [time, setTime]         = useState(existing?.time ?? prefill?.time ?? nowTime)
  const [note, setNote]         = useState(existing?.note ?? '')
  const [error, setError]       = useState('')

  const accountNames = Array.from(new Set(accounts.map(a => a.name)))

  const handleSubmit = () => {
    const amt = parseFloat(amount.replace(/,/g, ''))
    if (!amount || isNaN(amt) || amt <= 0) { setError('請輸入有效金額'); return }
    if (!merchant.trim()) { setError('請輸入商家或說明'); return }

    if (existing) {
      updateTransaction(existing.id, { type, amount: amt, merchant: merchant.trim(), category, account, date, time, note: note || undefined })
    } else {
      addTransaction({ type, amount: amt, merchant: merchant.trim(), category, account, date, time, note: note || undefined, fromScreenshot: !!prefill })
    }
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'none', border: 'none', borderBottom: `1px solid ${t.divider}`,
    fontFamily: 'inherit', fontSize: 15, color: t.text, padding: '8px 0', outline: 'none',
  }
  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  }

  return (
    <div style={{ padding: '0 0 8px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.accent, fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', padding: 0 }}>取消</button>
        <span style={{ fontSize: 17, fontWeight: 600, color: t.text }}>{existing ? '編輯交易' : '新增交易'}</span>
        <button onClick={handleSubmit} style={{ background: 'none', border: 'none', color: t.accent, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}>儲存</button>
      </div>

      {/* Type toggle */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
        {(['expense','income'] as const).map(tp => (
          <button key={tp} onClick={() => setType(tp)} style={{ flex: 1, height: 38, borderRadius: 10, border: 'none', background: type === tp ? t.text : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), color: type === tp ? t.bg : t.textSecondary, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
            {tp === 'expense' ? '支出' : '收入'}
          </button>
        ))}
      </div>

      {/* Amount hero */}
      <div style={{ padding: '8px 20px 20px', display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: `0.5px solid ${t.divider}` }}>
        <span style={{ fontSize: 20, color: t.textSecondary, fontWeight: 500, fontFamily: 'ui-serif,Georgia,serif' }}>NT$</span>
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', fontFamily: 'ui-serif,Georgia,serif', fontSize: 48, fontWeight: 300, color: t.text, outline: 'none', letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}
          autoFocus
        />
      </div>

      {/* Fields */}
      <div style={{ padding: '8px 20px' }}>
        <Field label="商家 / 說明">
          <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="例：路易莎咖啡" style={inputStyle}/>
        </Field>
        <Field label="分類">
          <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="帳戶">
          <select value={account} onChange={e => setAccount(e.target.value)} style={selectStyle}>
            {accountNames.length > 0
              ? accountNames.map(n => <option key={n} value={n}>{n}</option>)
              : <option value="">（尚未建立帳戶）</option>
            }
          </select>
        </Field>
        <Field label="日期">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle}/>
        </Field>
        <Field label="時間">
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle}/>
        </Field>
        <Field label="備註">
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="選填" style={inputStyle}/>
        </Field>
      </div>

      {error && <div style={{ padding: '0 20px 8px', fontSize: 13, color: 'oklch(0.55 0.13 30)' }}>{error}</div>}

      <div style={{ padding: '8px 20px 12px' }}>
        <button onClick={handleSubmit} style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', background: t.text, color: t.bg, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          {existing ? '儲存變更' : '新增交易'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '4px 0 12px' }}>
      <label style={{ fontSize: 11, color: 'rgba(60,60,67,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {children}
    </div>
  )
}
