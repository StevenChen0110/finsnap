'use client'
import { useState, useMemo } from 'react'
import { useApp } from '../../lib/context'
import { T } from '../design/tokens'
import Icon from '../ui/Icon'

interface Props { dark: boolean; onCapture: () => void; onAddTx: () => void }

const CAT_COLORS: Record<string, string> = {
  '飲食': 'oklch(0.70 0.10 55)',
  '帳單': 'oklch(0.72 0.08 90)',
  '居家': 'oklch(0.60 0.07 155)',
  '交通': 'oklch(0.55 0.08 250)',
  '購物': 'oklch(0.65 0.09 10)',
  '娛樂': 'oklch(0.62 0.09 290)',
  '其他': 'oklch(0.65 0.02 280)',
}

export default function Dashboard({ dark, onCapture, onAddTx }: Props) {
  const t = T(dark, 'soft')
  const { transactions, accounts, settings } = useApp()
  const [view, setView] = useState<'cashflow' | 'networth'>('cashflow')

  // ── Month calculations ────────────────────────────────────────────
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })

  const monthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(monthStr)), [transactions, monthStr])

  const monthExpenses = useMemo(() =>
    monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTxs])

  const monthRemaining = settings.budget - monthExpenses

  const daysLeft = useMemo(() => {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return Math.max(0, end.getDate() - now.getDate())
  }, [])

  const dailyAvg = daysLeft > 0 ? Math.round(monthRemaining / daysLeft) : 0

  // ── 30-day skyline ────────────────────────────────────────────────
  const dailySpend = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (29 - i))
      const dateStr = d.toISOString().split('T')[0]
      return transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0)
    })
  }, [transactions])

  // ── Category breakdown ────────────────────────────────────────────
  const catBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount, color: CAT_COLORS[name] ?? CAT_COLORS['其他'] }))
  }, [monthTxs])

  const catTotal = catBreakdown.reduce((s, c) => s + c.amount, 0)

  // ── Net worth ─────────────────────────────────────────────────────
  const netWorth = useMemo(() =>
    accounts.reduce((s, a) => a.isCredit ? s - a.balance : s + a.balance, 0), [accounts])

  // ── NW history (reconstruct from transactions) ────────────────────
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

  // ── Today / yesterday / week summaries ───────────────────────────
  const todayStr = now.toISOString().split('T')[0]
  const yestStr = (() => { const d = new Date(now); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] })()
  const todayTxs = transactions.filter(t => t.date === todayStr && t.type === 'expense')
  const todayTotal = todayTxs.reduce((s, t) => s + t.amount, 0)
  const yestTotal = transactions.filter(t => t.date === yestStr && t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const thisWeekStart = (() => { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0] })()
  const lastWeekStart = (() => { const d = new Date(now); d.setDate(d.getDate() - d.getDay() - 7); return d.toISOString().split('T')[0] })()
  const lastWeekEnd   = (() => { const d = new Date(now); d.setDate(d.getDate() - d.getDay() - 1); return d.toISOString().split('T')[0] })()

  const thisWeekTotal = transactions.filter(t => t.date >= thisWeekStart && t.date <= todayStr && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const lastWeekTotal = transactions.filter(t => t.date >= lastWeekStart && t.date <= lastWeekEnd && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const weekDiff = thisWeekTotal - lastWeekTotal

  return (
    <div style={{ maxWidth: 680, padding: '0 0 80px' }}>
      {/* Page header */}
      <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>{monthLabel}</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>總覽</div>
        </div>
        <button onClick={onCapture} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: t.textSecondary }}>
          <Icon name="screenshot" size={20} color={t.textSecondary} weight={1.8}/>
        </button>
      </div>

      {/* View toggle */}
      <div style={{ padding: '16px 28px 0', display: 'flex', gap: 24 }}>
        {(['cashflow', 'networth'] as const).map(k => {
          const on = view === k
          const label = k === 'cashflow' ? '現金流' : '淨資產'
          return (
            <button key={k} onClick={() => setView(k)} style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 600 : 400, color: on ? t.text : t.textTertiary, padding: '4px 0 6px', cursor: 'pointer', borderBottom: on ? `1.5px solid ${t.text}` : '1.5px solid transparent' }}>
              {label}
            </button>
          )
        })}
      </div>

      {view === 'cashflow' ? (
        <CashflowView t={t} remaining={monthRemaining} daysLeft={daysLeft} dailyAvg={dailyAvg} dailySpend={dailySpend} todayCount={todayTxs.length} todayTotal={todayTotal} yestTotal={yestTotal} weekDiff={weekDiff} catBreakdown={catBreakdown} catTotal={catTotal} onAddTx={onAddTx}/>
      ) : (
        <NetWorthView t={t} netWorth={netWorth} nwHistory={nwHistory} accounts={accounts}/>
      )}
    </div>
  )
}

// ── Cashflow ──────────────────────────────────────────────────────────────────

function CashflowView({ t, remaining, daysLeft, dailyAvg, dailySpend, todayCount, todayTotal, yestTotal, weekDiff, catBreakdown, catTotal, onAddTx }: {
  t: ReturnType<typeof T>; remaining: number; daysLeft: number; dailyAvg: number; dailySpend: number[]; todayCount: number; todayTotal: number; yestTotal: number; weekDiff: number; catBreakdown: { name: string; amount: number; color: string }[]; catTotal: number; onAddTx: () => void
}) {
  const isNeg = remaining < 0
  return (
    <>
      {/* Hero */}
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>本月剩餘</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: t.textSecondary, fontFamily: 'ui-serif,Georgia,serif' }}>$</span>
          <span style={{ fontSize: 64, fontWeight: 300, letterSpacing: -2, fontFamily: 'ui-serif,Georgia,serif', color: isNeg ? 'oklch(0.55 0.13 30)' : t.text, fontVariantNumeric: 'tabular-nums' }}>{Math.abs(remaining).toLocaleString()}</span>
          {isNeg && <span style={{ fontSize: 14, color: 'oklch(0.55 0.13 30)', fontWeight: 600 }}>超支</span>}
        </div>
        <div style={{ fontSize: 14, color: t.textSecondary, marginTop: 10 }}>
          還有 <span style={{ color: t.text, fontWeight: 500 }}>{daysLeft} 天</span> 過完這個月
          <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
          平均每天 <span style={{ color: t.text, fontWeight: 500 }}>${dailyAvg.toLocaleString()}</span>
        </div>
      </div>

      {/* Skyline */}
      <div style={{ padding: '32px 0 0' }}>
        <Skyline t={t} data={dailySpend}/>
      </div>

      {/* Summary rows */}
      <div style={{ padding: '32px 28px 0' }}>
        <SummaryRow t={t} label="今天" value={todayCount > 0 ? `${todayCount} 筆消費` : '沒有花費'} hint={todayTotal > 0 ? `$${todayTotal.toLocaleString()}` : ''} first/>
        <SummaryRow t={t} label="昨天" value={yestTotal > 0 ? `$${yestTotal.toLocaleString()}` : '沒有花費'} hint=""/>
        <SummaryRow t={t} label="本週" value={weekDiff < 0 ? '比上週少' : weekDiff > 0 ? '比上週多' : '與上週持平'} hint={weekDiff !== 0 ? `${weekDiff > 0 ? '+' : ''}$${weekDiff.toLocaleString()}` : ''}/>
      </div>

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div style={{ padding: '32px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>本月分類</span>
            <span style={{ fontSize: 11, color: t.textTertiary }}>共 ${catTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
            {catBreakdown.map((c, i) => <div key={i} style={{ flex: c.amount, background: c.color }}/>)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {catBreakdown.map((c, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 12, flexShrink: 0, background: `color-mix(in oklch,${c.color} 14%,transparent)`, border: `0.5px solid color-mix(in oklch,${c.color} 30%,transparent)` }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'block', flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: t.text, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: t.textSecondary, fontVariantNumeric: 'tabular-nums' }}>${c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI insight card */}
      <div style={{ padding: '32px 28px 0' }}>
        <div style={{ background: t.card, border: t.cardBorder || undefined, borderRadius: 18, padding: '18px 18px 14px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 6, right: 14, fontSize: 60, fontFamily: 'Georgia,serif', color: t.textTertiary, opacity: 0.3, lineHeight: 1, pointerEvents: 'none' }}>"</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: t.aiGradient, display: 'grid', placeItems: 'center' }}>
              <Icon name="apple-intelligence" size={11} color="#fff"/>
            </div>
            <span style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>AI 注意到</span>
          </div>
          <div style={{ fontSize: 15, color: t.text, lineHeight: 1.6, paddingRight: 20 }}>
            你最近平日的<strong>咖啡花費</strong>比上週多了 <strong>$380</strong>。點「截圖記帳」上傳收據就能自動分類。
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button style={{ background: 'none', border: 'none', color: t.textSecondary, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, padding: '8px 14px', cursor: 'pointer' }}>忽略</button>
            <button onClick={onAddTx} style={{ background: t.accent, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 16, cursor: 'pointer' }}>新增交易</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Net worth ─────────────────────────────────────────────────────────────────

function NetWorthView({ t, netWorth, nwHistory, accounts }: {
  t: ReturnType<typeof T>; netWorth: number; nwHistory: number[]; accounts: ReturnType<typeof useApp>['accounts']
}) {
  const positiveTotal = accounts.filter(a => !a.isCredit).reduce((s, a) => s + a.balance, 0)
  const groups = Array.from(new Set(accounts.filter(a => !a.isCredit).map(a => a.groupLabel)))

  return (
    <>
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>淨資產</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 400, color: t.textSecondary, fontFamily: 'ui-serif,Georgia,serif' }}>$</span>
          <span style={{ fontSize: 52, fontWeight: 300, letterSpacing: -1.5, fontFamily: 'ui-serif,Georgia,serif', color: t.text, fontVariantNumeric: 'tabular-nums' }}>{netWorth.toLocaleString()}</span>
        </div>
      </div>

      {/* Line chart */}
      <div style={{ padding: '20px 0 0' }}>
        <NWLineChart t={t} data={nwHistory}/>
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
            {groups.map((label, i) => {
              const sum = accounts.filter(a => !a.isCredit && a.groupLabel === label).reduce((s, a) => s + a.balance, 0)
              const color = accounts.find(a => a.groupLabel === label)?.color ?? t.accent
              return <div key={i} style={{ flex: sum, background: color }}/>
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
            {groups.map((label, i) => {
              const sum = accounts.filter(a => !a.isCredit && a.groupLabel === label).reduce((s, a) => s + a.balance, 0)
              const pct = (sum / positiveTotal * 100).toFixed(0)
              const color = accounts.find(a => a.groupLabel === label)?.color ?? t.accent
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: color, display: 'block' }}/>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>{label}</span>
                  <span style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

// ── Skyline chart ─────────────────────────────────────────────────────────────

function Skyline({ t, data }: { t: ReturnType<typeof T>; data: number[] }) {
  const W = 600, H = 64, gap = 3
  const count = data.length
  const col = (W - gap * (count - 1)) / count
  const sqrtMax = Math.sqrt(Math.max(...data, 1))
  const todayIdx = count - 1
  const monthStartWD = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} style={{ display: 'block', padding: '0 24px', boxSizing: 'border-box' }}>
      <line x1="24" y1={H + 0.5} x2={W - 24} y2={H + 0.5} stroke={t.divider} strokeWidth="0.5"/>
      {data.map((v, i) => {
        const x = 24 + i * (col + gap)
        const h = sqrtMax > 0 ? (Math.sqrt(v) / sqrtMax) * H : 0
        const barH = Math.max(h, 2)
        const isToday = i === todayIdx
        const isWeekend = ((i + monthStartWD) % 7) >= 5
        return (
          <rect key={i} x={x} y={H - barH} width={col} height={barH}
            fill={isToday ? t.accent : t.text}
            opacity={isToday ? 1 : isWeekend ? 0.18 : 0.1}
            rx={col * 0.4}/>
        )
      })}
      {sqrtMax > 0 && (
        <circle cx={24 + todayIdx * (col + gap) + col / 2} cy={H - (Math.sqrt(data[todayIdx]) / sqrtMax) * H - 8} r={2.5} fill={t.accent}/>
      )}
      <text x="24" y={H + 14} fontSize="10" fill={t.textTertiary} fontFamily="-apple-system">月初</text>
      <text x={W - 24} y={H + 14} fontSize="10" fill={t.accent} fontFamily="-apple-system" textAnchor="end" fontWeight="500">今天</text>
    </svg>
  )
}

// ── Net worth line chart ───────────────────────────────────────────────────────

function NWLineChart({ t, data }: { t: ReturnType<typeof T>; data: number[] }) {
  if (data.length < 2) return null
  const W = 600, H = 120
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - 6 - ((v - min) / range) * (H - 16) }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity={0.16}/>
          <stop offset="100%" stopColor={t.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#nwGrad)"/>
      <path d={d} stroke={t.accent} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={last.x} cy={last.y} r="3" fill={t.accent}/>
      <circle cx={last.x} cy={last.y} r="6" fill={t.accent} opacity="0.14"/>
    </svg>
  )
}

// ── Summary row ───────────────────────────────────────────────────────────────

function SummaryRow({ t, label, value, hint, first }: { t: ReturnType<typeof T>; label: string; value: string; hint: string; first?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', padding: '16px 0', borderTop: first ? 'none' : `0.5px solid ${t.divider}` }}>
      <div style={{ width: 48, fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 16, color: t.text }}>{value}</div>
      {hint && <div style={{ fontSize: 14, color: t.textSecondary, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{hint}</div>}
    </div>
  )
}
