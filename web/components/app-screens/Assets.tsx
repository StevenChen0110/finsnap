'use client'
import { useState, useMemo } from 'react'
import { useApp } from '../../lib/context'
import { T } from '../design/tokens'
import Icon from '../ui/Icon'
import type { Account } from '../../lib/types'

interface Props { dark: boolean; onCapture: () => void; onAddAccount: () => void; onEditAccount: (id: string) => void }

export default function Assets({ dark, onCapture, onAddAccount, onEditAccount }: Props) {
  const t = T(dark, 'soft')
  const { accounts, transactions, deleteAccount } = useApp()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const now = new Date()
  const netWorth = useMemo(() =>
    accounts.reduce((s, a) => a.isCredit ? s - a.balance : s + a.balance, 0), [accounts])

  const positiveTotal = useMemo(() =>
    accounts.filter(a => !a.isCredit).reduce((s, a) => s + a.balance, 0), [accounts])

  // ── Net worth history ─────────────────────────────────────────────
  const nwHistory = useMemo(() => {
    const days = 60
    let running = netWorth
    const points: number[] = []
    for (let i = 0; i < days; i++) {
      points.unshift(running)
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      transactions.filter(t => t.date === dateStr).forEach(tx => {
        if (tx.type === 'income') running -= tx.amount
        else running += tx.amount
      })
    }
    return points
  }, [transactions, netWorth])

  // Group accounts by groupLabel
  const groups = useMemo(() => {
    const map = new Map<string, Account[]>()
    accounts.forEach(a => {
      const grp = map.get(a.groupLabel) ?? []
      grp.push(a)
      map.set(a.groupLabel, grp)
    })
    return Array.from(map.entries()).map(([label, items]) => ({ label, items, color: items[0].color }))
  }, [accounts])

  const positiveGroups = groups.filter(g => !g.items.every(a => a.isCredit))

  return (
    <div style={{ maxWidth: 680, padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>所有帳戶</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>資產</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCapture} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <Icon name="screenshot" size={18} color={t.textSecondary} weight={1.8}/>
          </button>
          <button onClick={onAddAccount} style={{ background: t.accent, border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="plus" size={18} color="#fff" weight={2.2}/>
          </button>
        </div>
      </div>

      {/* Net worth hero */}
      <div style={{ padding: '20px 28px 0' }}>
        <div style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>淨資產</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 400, color: t.textSecondary, fontFamily: 'ui-serif,Georgia,serif' }}>$</span>
          <span style={{ fontSize: 48, fontWeight: 300, letterSpacing: -1.5, fontFamily: 'ui-serif,Georgia,serif', color: t.text, fontVariantNumeric: 'tabular-nums' }}>{netWorth.toLocaleString()}</span>
        </div>
      </div>

      {/* Line chart */}
      <div style={{ padding: '16px 0 0' }}>
        <NWChart t={t} data={nwHistory}/>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10, fontSize: 11, color: t.textTertiary }}>
          {['1月','3月','6月','1年','全部'].map((p, i) => (
            <span key={p} style={{ color: i === 1 ? t.text : t.textTertiary, fontWeight: i === 1 ? 600 : 400 }}>{p}</span>
          ))}
        </div>
      </div>

      {/* Composition bar */}
      {positiveTotal > 0 && (
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>資產組成</span>
            <span style={{ fontSize: 11, color: t.textTertiary }}>共 ${positiveTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
            {positiveGroups.map((g, i) => {
              const sum = g.items.filter(a => !a.isCredit).reduce((s, a) => s + a.balance, 0)
              return <div key={i} style={{ flex: sum, background: g.color }}/>
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
            {positiveGroups.map((g, i) => {
              const sum = g.items.filter(a => !a.isCredit).reduce((s, a) => s + a.balance, 0)
              const pct = (sum / positiveTotal * 100).toFixed(0)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: g.color, display: 'block' }}/>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>{g.label}</span>
                  <span style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Account groups */}
      <div style={{ padding: '20px 28px 0' }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 8 : 28 }}>
            <div style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', paddingBottom: 8 }}>{g.label}</div>
            {g.items.map(acct => (
              confirmDelete === acct.id ? (
                <div key={acct.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `0.5px solid ${t.divider}` }}>
                  <div style={{ flex: 1, fontSize: 14, color: t.textSecondary }}>確認刪除「{acct.name}」？</div>
                  <button onClick={() => setConfirmDelete(null)} style={{ background: 'none', border: `0.5px solid ${t.divider}`, color: t.textSecondary, fontFamily: 'inherit', fontSize: 13, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>取消</button>
                  <button onClick={() => { deleteAccount(acct.id); setConfirmDelete(null) }} style={{ background: 'oklch(0.55 0.13 30)', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>刪除</button>
                </div>
              ) : (
                <AccountRow key={acct.id} acct={acct} t={t} groupColor={g.color} positiveTotal={positiveTotal} onEdit={() => onEditAccount(acct.id)} onDelete={() => setConfirmDelete(acct.id)}/>
              )
            ))}
          </div>
        ))}

        {accounts.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: t.textTertiary }}>
            <Icon name="wallet" size={36} color={t.textTertiary} weight={1.2}/>
            <p style={{ marginTop: 12, fontSize: 14 }}>還沒有帳戶</p>
            <button onClick={onAddAccount} style={{ marginTop: 12, background: t.accent, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 12, cursor: 'pointer' }}>新增帳戶</button>
          </div>
        )}
      </div>

      {/* FAB — mobile */}
      <button onClick={onAddAccount} className="mobile-fab" style={{ position: 'fixed', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 26, border: 'none', background: t.text, color: t.bg, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 10 }}>
        <Icon name="plus" size={22} color={t.bg} weight={2.2}/>
      </button>
    </div>
  )
}

// ── Account row ───────────────────────────────────────────────────────────────

function AccountRow({ acct, t, groupColor, positiveTotal, onEdit, onDelete }: {
  acct: Account; t: ReturnType<typeof T>; groupColor: string; positiveTotal: number; onEdit: () => void; onDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  const pct = acct.isCredit
    ? Math.min(1, acct.balance / 50000)
    : (positiveTotal > 0 ? Math.min(1, acct.balance / positiveTotal) : 0)

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ padding: '14px 0', borderTop: `0.5px solid ${t.divider}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <div style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>{acct.name}</div>
          <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>
            {[acct.masked, acct.institution, acct.lastUpdated && `${acct.lastUpdated} 更新`].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          {hover && (
            <div style={{ display: 'flex', gap: 4, paddingTop: 2 }}>
              <button onClick={onEdit} style={{ background: 'none', border: 'none', padding: 5, cursor: 'pointer', borderRadius: 6, color: t.textSecondary }}>
                <Icon name="pencil" size={13} color={t.textSecondary} weight={1.8}/>
              </button>
              <button onClick={onDelete} style={{ background: 'none', border: 'none', padding: 5, cursor: 'pointer', borderRadius: 6 }}>
                <Icon name="trash" size={13} color="oklch(0.55 0.13 30)" weight={1.8}/>
              </button>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: acct.isCredit ? t.systemRed : t.text }}>
              {acct.isCredit ? '−' : ''}${acct.balance.toLocaleString()}
            </div>
            {acct.trend !== undefined && (
              <div style={{ fontSize: 11, marginTop: 2, fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: acct.trend >= 0 ? t.systemGreen : t.systemRed }}>
                {acct.trend >= 0 ? '+' : '−'}${Math.abs(acct.trend).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: t.divider, borderRadius: 1.5, marginTop: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: acct.isCredit ? 'oklch(0.62 0.10 35)' : groupColor, borderRadius: 1.5, transition: 'width 0.3s ease' }}/>
      </div>
    </div>
  )
}

// ── Line chart ────────────────────────────────────────────────────────────────

function NWChart({ t, data }: { t: ReturnType<typeof T>; data: number[] }) {
  if (data.length < 2) return null
  const W = 600, H = 120
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - 6 - ((v - min) / range) * (H - 16) }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity={0.16}/><stop offset="100%" stopColor={t.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#assetGrad)"/>
      <path d={d} stroke={t.accent} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={last.x} cy={last.y} r="3" fill={t.accent}/>
      <circle cx={last.x} cy={last.y} r="6" fill={t.accent} opacity="0.14"/>
    </svg>
  )
}
