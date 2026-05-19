'use client'
import { useState, useMemo } from 'react'
import { useApp } from '../../lib/context'
import { T } from '../design/tokens'
import Icon from '../ui/Icon'
import type { Transaction } from '../../lib/types'

interface Props { dark: boolean; onCapture: () => void; onAddTx: () => void; onEditTx: (id: string) => void }

type Filter = 'all' | 'expense' | 'income'

const CAT_COLORS: Record<string, string> = {
  '飲食': 'oklch(0.70 0.10 55)', '帳單': 'oklch(0.72 0.08 90)',
  '居家': 'oklch(0.60 0.07 155)', '交通': 'oklch(0.55 0.08 250)',
  '購物': 'oklch(0.65 0.09 10)',  '娛樂': 'oklch(0.62 0.09 290)',
  '收入': 'oklch(0.55 0.13 155)', '其他': 'oklch(0.65 0.02 280)',
}

function dateLabel(dateStr: string): string {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yest  = (() => { const d = new Date(now); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] })()
  if (dateStr === today) return `今天 · ${dateStr.slice(5).replace('-', '/')}`
  if (dateStr === yest)  return `昨天 · ${dateStr.slice(5).replace('-', '/')}`
  const d = new Date(dateStr)
  const wd = ['週日','週一','週二','週三','週四','週五','週六'][d.getDay()]
  return `${dateStr.slice(5).replace('-', '/')} · ${wd}`
}

export default function Transactions({ dark, onCapture, onAddTx, onEditTx }: Props) {
  const t = T(dark, 'soft')
  const { transactions, deleteTransaction } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(monthStr) && t.type === 'expense'), [transactions, monthStr])

  const catBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    monthTxs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount, color: CAT_COLORS[name] ?? CAT_COLORS['其他'] }))
  }, [monthTxs])
  const catTotal = catBreakdown.reduce((s, c) => s + c.amount, 0)

  const filtered = useMemo(() =>
    filter === 'all' ? transactions : transactions.filter(t => t.type === (filter === 'income' ? 'income' : 'expense')),
    [transactions, filter])

  // Group by date
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    filtered.forEach(tx => {
      const grp = map.get(tx.date) ?? []
      grp.push(tx)
      map.set(tx.date, grp)
    })
    return Array.from(map.entries())
      .sort((a, b) => b[0] < a[0] ? -1 : 1)
      .map(([date, items]) => ({ date, items }))
  }, [filtered])

  return (
    <div style={{ maxWidth: 680, padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>{now.getFullYear()} 年 {now.getMonth() + 1} 月</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>交易</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCapture} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <Icon name="screenshot" size={18} color={t.textSecondary} weight={1.8}/>
          </button>
          <button onClick={onAddTx} style={{ background: t.accent, border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="plus" size={18} color="#fff" weight={2.2}/>
          </button>
        </div>
      </div>

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div style={{ padding: '16px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>本月分類</span>
            <span style={{ fontSize: 11, color: t.textTertiary }}>共 ${catTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
            {catBreakdown.map((c, i) => <div key={i} style={{ flex: c.amount, background: c.color }}/>)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {catBreakdown.map((c, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 12, flexShrink: 0, background: `color-mix(in oklch,${c.color} 14%,transparent)`, border: `0.5px solid color-mix(in oklch,${c.color} 30%,transparent)` }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'block' }}/>
                <span style={{ fontSize: 12, color: t.text, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: t.textSecondary, fontVariantNumeric: 'tabular-nums' }}>${c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ padding: '14px 28px 0', display: 'flex', gap: 0, borderBottom: `0.5px solid ${t.divider}`, marginTop: 4 }}>
        {([['all','全部'],['expense','支出'],['income','收入']] as [Filter, string][]).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: filter === f ? 600 : 400, color: filter === f ? t.text : t.textTertiary, padding: '6px 0', marginRight: 20, cursor: 'pointer', paddingBottom: 8, borderBottom: filter === f ? `2px solid ${t.text}` : '2px solid transparent', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Transaction groups */}
      {groups.length === 0 ? (
        <div style={{ padding: '60px 28px', textAlign: 'center', color: t.textTertiary, fontSize: 14 }}>
          <Icon name="list" size={36} color={t.textTertiary} weight={1.2}/>
          <p style={{ marginTop: 12 }}>還沒有交易記錄</p>
          <button onClick={onAddTx} style={{ marginTop: 12, background: t.accent, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 12, cursor: 'pointer' }}>新增第一筆</button>
        </div>
      ) : groups.map(grp => {
        const total = grp.items.reduce((s, tx) => tx.type === 'expense' ? s + tx.amount : s - tx.amount, 0)
        return (
          <div key={grp.date} style={{ padding: '20px 28px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 }}>{dateLabel(grp.date)}</span>
              <span style={{ fontSize: 12, color: t.textTertiary, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {total < 0 ? `淨入 +$${Math.abs(total).toLocaleString()}` : `$${total.toLocaleString()}`}
              </span>
            </div>
            {grp.items.map(tx => (
              <TxRow key={tx.id} tx={tx} t={t} onEdit={() => onEditTx(tx.id)} onDelete={() => setConfirmDelete(tx.id)} confirmingDelete={confirmDelete === tx.id} onConfirmDelete={() => { deleteTransaction(tx.id); setConfirmDelete(null) }} onCancelDelete={() => setConfirmDelete(null)}/>
            ))}
          </div>
        )
      })}

      {/* FAB — mobile */}
      <button onClick={onAddTx} className="mobile-fab" style={{ position: 'fixed', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 26, border: 'none', background: t.text, color: t.bg, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 10 }}>
        <Icon name="plus" size={22} color={t.bg} weight={2.2}/>
      </button>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxRow({ tx, t, onEdit, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete }: {
  tx: Transaction; t: ReturnType<typeof T>; onEdit: () => void; onDelete: () => void; confirmingDelete: boolean; onConfirmDelete: () => void; onCancelDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  const isIncome = tx.type === 'income'
  const color = CAT_COLORS[tx.category] ?? CAT_COLORS['其他']

  if (confirmingDelete) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `0.5px solid ${t.divider}` }}>
        <div style={{ flex: 1, fontSize: 14, color: t.textSecondary }}>確認刪除「{tx.merchant}」？</div>
        <button onClick={onCancelDelete} style={{ background: 'none', border: `0.5px solid ${t.divider}`, color: t.textSecondary, fontFamily: 'inherit', fontSize: 13, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>取消</button>
        <button onClick={onConfirmDelete} style={{ background: 'oklch(0.55 0.13 30)', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>刪除</button>
      </div>
    )
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderTop: `0.5px solid ${t.divider}`, position: 'relative' }}>
      <div style={{ fontSize: 11, color: t.textTertiary, width: 38, paddingTop: 3, fontVariantNumeric: 'tabular-nums', fontWeight: 500, flexShrink: 0 }}>{tx.time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: t.text, fontWeight: 500, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 6 }}>
          {tx.merchant}
        </div>
        <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }}/>
          <span>{tx.category}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{tx.account}</span>
          {tx.fromScreenshot && <Icon name="screenshot" size={10} color={t.textTertiary} weight={1.8}/>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {hover && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={onEdit} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', borderRadius: 6, color: t.textSecondary }}>
              <Icon name="pencil" size={14} color={t.textSecondary} weight={1.8}/>
            </button>
            <button onClick={onDelete} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', borderRadius: 6, color: 'oklch(0.55 0.13 30)' }}>
              <Icon name="trash" size={14} color="oklch(0.55 0.13 30)" weight={1.8}/>
            </button>
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: isIncome ? t.systemGreen : t.text, paddingTop: 1 }}>
          {isIncome ? '+' : ''}${tx.amount.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
