'use client'
import { useState } from 'react'
import { useApp } from '../../lib/context'
import { T } from '../design/tokens'
import { ASSET_TYPE_LABELS, ACCOUNT_COLORS, ACCOUNT_GROUP_LABELS, type AssetType } from '../../lib/types'

interface Props { dark: boolean; editId: string | null; onClose: () => void }

const ASSET_TYPES = Object.keys(ASSET_TYPE_LABELS) as AssetType[]

export default function AddAccount({ dark, editId, onClose }: Props) {
  const t = T(dark, 'soft')
  const { accounts, addAccount, updateAccount } = useApp()

  const existing = editId ? accounts.find(a => a.id === editId) : null
  const today = new Date().toISOString().split('T')[0]

  const [name, setName]           = useState(existing?.name ?? '')
  const [type, setType]           = useState<AssetType>(existing?.type ?? 'bank')
  const [balance, setBalance]     = useState(existing ? String(existing.balance) : '')
  const [isCredit, setIsCredit]   = useState(existing?.isCredit ?? false)
  const [institution, setInstitution] = useState(existing?.institution ?? '')
  const [masked, setMasked]       = useState(existing?.masked ?? '')
  const [error, setError]         = useState('')

  const handleSubmit = () => {
    if (!name.trim()) { setError('請輸入帳戶名稱'); return }
    const bal = parseFloat(balance.replace(/,/g, ''))
    if (!balance || isNaN(bal) || bal < 0) { setError('請輸入有效餘額'); return }

    const data = {
      name: name.trim(),
      type,
      balance: bal,
      isCredit,
      currency: 'TWD',
      institution: institution.trim() || undefined,
      masked: masked.trim() || undefined,
      color: ACCOUNT_COLORS[type],
      groupLabel: ACCOUNT_GROUP_LABELS[type],
      lastUpdated: today,
    }

    if (existing) {
      updateAccount(existing.id, data)
    } else {
      addAccount(data)
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
        <span style={{ fontSize: 17, fontWeight: 600, color: t.text }}>{existing ? '編輯帳戶' : '新增帳戶'}</span>
        <button onClick={handleSubmit} style={{ background: 'none', border: 'none', color: t.accent, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}>儲存</button>
      </div>

      <div style={{ padding: '8px 20px' }}>
        <Field label="帳戶名稱">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="例：玉山銀行 綜存" style={inputStyle} autoFocus/>
        </Field>
        <Field label="類型">
          <select value={type} onChange={e => { setType(e.target.value as AssetType); setIsCredit(e.target.value === 'creditCard') }} style={selectStyle}>
            {ASSET_TYPES.map(tp => <option key={tp} value={tp}>{ASSET_TYPE_LABELS[tp]}</option>)}
          </select>
        </Field>

        {/* Balance hero input */}
        <div style={{ padding: '16px 0 12px', borderBottom: `0.5px solid ${t.divider}`, borderTop: `0.5px solid ${t.divider}`, margin: '8px 0' }}>
          <div style={{ fontSize: 11, color: 'rgba(60,60,67,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>
            {isCredit ? '本期應繳' : '帳戶餘額'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 18, color: t.textSecondary }}>NT$</span>
            <input
              type="number"
              placeholder="0"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 40, fontWeight: 300, color: isCredit ? 'oklch(0.55 0.13 30)' : t.text, outline: 'none', fontVariantNumeric: 'tabular-nums' }}
            />
          </div>
        </div>

        <Field label="銀行 / 機構（選填）">
          <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="例：玉山銀行" style={inputStyle}/>
        </Field>
        <Field label="卡號後四碼（選填）">
          <input value={masked} onChange={e => setMasked(e.target.value)} placeholder="例：****1234" style={inputStyle}/>
        </Field>

        {/* Is credit toggle */}
        {type !== 'creditCard' && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderTop: `0.5px solid ${t.divider}` }}>
            <span style={{ flex: 1, fontSize: 15, color: t.text }}>標記為負債（信用卡應繳）</span>
            <button onClick={() => setIsCredit(v => !v)} style={{ width: 44, height: 26, borderRadius: 13, border: 'none', background: isCredit ? 'oklch(0.62 0.10 35)' : t.divider, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <span style={{ position: 'absolute', top: 3, left: isCredit ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '0 20px 8px', fontSize: 13, color: 'oklch(0.55 0.13 30)' }}>{error}</div>}

      <div style={{ padding: '8px 20px 12px' }}>
        <button onClick={handleSubmit} style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', background: t.text, color: t.bg, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          {existing ? '儲存變更' : '新增帳戶'}
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
