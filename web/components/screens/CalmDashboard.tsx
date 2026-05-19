'use client';
import { useState, useRef, useEffect } from 'react';
import { T, Tokens, cardStyle } from '../design/tokens';
import Icon from '../ui/Icon';

// ── helpers ──────────────────────────────────────────────────────────────────

interface SummaryRowProps { t: Tokens; label: string; value: string; hint: string; first?: boolean; }
function SummaryRow({ t, label, value, hint, first }: SummaryRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', padding: '16px 0', borderTop: first ? 'none' : `0.5px solid ${t.divider}` }}>
      <div style={{ width: 56, fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 16, color: t.text }}>{value}</div>
      {hint && <div style={{ fontSize: 14, color: t.textSecondary, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{hint}</div>}
    </div>
  );
}

// ── Skyline ───────────────────────────────────────────────────────────────────

const SPEND = [320,0,156,890,230,1240,0,89,245,540,0,0,320,156,0,89,1450,0,0,320,89,540,0,156,2100,0,0,1240,89,245];
const MONTH_START_WD = 3;

function Skyline({ t, W = 320 }: { t: Tokens; W?: number }) {
  const H = 64, gap = 3;
  const count = SPEND.length;
  const col = (W - gap * (count - 1)) / count;
  const sqrtMax = Math.sqrt(Math.max(...SPEND));
  const todayIdx = count - 1;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} style={{ display: 'block', width: '100%' }}>
      <line x1="0" y1={H + 0.5} x2={W} y2={H + 0.5} stroke={t.divider} strokeWidth="0.5"/>
      {SPEND.map((v, i) => {
        const x = i * (col + gap);
        const h = sqrtMax > 0 ? (Math.sqrt(v) / sqrtMax) * H : 0;
        const isToday = i === todayIdx;
        const isWeekend = ((i + MONTH_START_WD) % 7) >= 5;
        return (
          <rect key={i} x={x} y={H - Math.max(h, 2)} width={col} height={Math.max(h, 2)}
            fill={isToday ? t.accent : t.text}
            opacity={isToday ? 1 : isWeekend ? 0.20 : 0.12}
            rx={col * 0.4}/>
        );
      })}
      {/* today dot */}
      <circle
        cx={todayIdx * (col + gap) + col / 2}
        cy={H - (sqrtMax > 0 ? (Math.sqrt(SPEND[todayIdx]) / sqrtMax) * H : 0) - 8}
        r={2.5} fill={t.accent}/>
      <text x="0" y={H + 14} fontSize="10" fill={t.textTertiary} fontFamily="-apple-system">5 / 1</text>
      <text x={W} y={H + 14} fontSize="10" fill={t.accent} fontFamily="-apple-system" textAnchor="end" fontWeight="500">今天</text>
    </svg>
  );
}

// ── Net worth line chart ──────────────────────────────────────────────────────

const NET_PATH = [2.180,2.182,2.179,2.190,2.205,2.198,2.212,2.225,2.220,2.230,2.218,2.245,2.260,2.255,2.270,2.285,2.280,2.291,2.305,2.298,2.310,2.318,2.316,2.329,2.334,2.336,2.345,2.341,2.348].map(v => v * 1_000_000);
const NW_COMP = [
  { label: '投資',       amount: 1891929, color: 'oklch(0.55 0.08 250)' },
  { label: '銀行 · 現金', amount: 468456,  color: 'oklch(0.60 0.07 155)' },
  { label: '電子支付',    amount: 6960,    color: 'oklch(0.62 0.09 290)' },
];

function NetWorthChart({ t }: { t: Tokens }) {
  const W = 360, H = 120;
  const min = Math.min(...NET_PATH), max = Math.max(...NET_PATH);
  const range = max - min || 1;
  const pts = NET_PATH.map((v, i) => ({
    x: (i / (NET_PATH.length - 1)) * W,
    y: H - 6 - ((v - min) / range) * (H - 16),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${d} L ${W} ${H} L 0 ${H} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="netArea2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity={0.18}/>
          <stop offset="100%" stopColor={t.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#netArea2)"/>
      <path d={d} stroke={t.accent} strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={last.x} cy={last.y} r="3.2" fill={t.accent}/>
      <circle cx={last.x} cy={last.y} r="6" fill={t.accent} opacity="0.15"/>
    </svg>
  );
}

function NetWorthView({ t }: { t: Tokens }) {
  const netWorth = 2348925;
  const compTotal = NW_COMP.reduce((s, c) => s + c.amount, 0);
  return (
    <>
      <div style={{ padding: '0 24px', marginTop: 24 }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>淨資產</div>
        <div style={{
          fontSize: t.serif ? 64 : 52, fontWeight: t.serif ? 400 : 600,
          letterSpacing: t.serif ? -1.8 : -2, lineHeight: 1, marginTop: 10,
          fontFamily: t.serif ? 'ui-serif,"New York","Iowan Old Style",Georgia,serif' : 'inherit',
          fontVariantNumeric: 'tabular-nums', color: t.text,
        }}>
          <span style={{ fontSize: t.serif ? 26 : 20, fontWeight: 400, color: t.textSecondary, marginRight: 6 }}>$</span>
          {netWorth.toLocaleString()}
        </div>
        <div style={{ fontSize: 14, color: t.textSecondary, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="arrow-up-right" size={13} color={t.systemGreen} weight={2.2}/>
          <span style={{ color: t.systemGreen, fontWeight: 600 }}>+$12,480</span>
          <span>本週</span>
        </div>
      </div>
      <div style={{ padding: '32px 0 0' }}>
        <NetWorthChart t={t}/>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 10, fontSize: 11, color: t.textTertiary }}>
          {['1月','3月','6月','1年','全部'].map((p, i) => (
            <span key={p} style={{ color: i === 1 ? t.text : t.textTertiary, fontWeight: i === 1 ? 600 : 500 }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '36px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 12 }}>
          <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>資產組成</span>
          <span style={{ fontSize: 11, color: t.textTertiary }}>共 ${compTotal.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
          {NW_COMP.map((c, i) => <div key={i} style={{ flex: c.amount, background: c.color }}/>)}
        </div>
        <div style={{ marginTop: 16 }}>
          {NW_COMP.map((c, i) => {
            const pct = c.amount / compTotal * 100;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderTop: i === 0 ? 'none' : `0.5px solid ${t.divider}` }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: c.color, marginRight: 14, flexShrink: 0 }}/>
                <div style={{ flex: 1, fontSize: 15, color: t.text, fontWeight: 500 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: t.textSecondary, marginRight: 14 }}>{pct.toFixed(1)}%</div>
                <div style={{ fontSize: 14, color: t.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500, minWidth: 86, textAlign: 'right' }}>${c.amount.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: 'color-mix(in oklch,oklch(0.62 0.10 35) 8%,transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: t.textSecondary }}>另有信用卡本期應繳</span>
          <span style={{ fontSize: 13, color: 'oklch(0.55 0.13 30)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>$18,420</span>
        </div>
      </div>
      <div style={{ padding: '40px 24px 0' }}>
        <SummaryRow t={t} label="本週" value="比上週多" hint="+$12,480" first/>
        <SummaryRow t={t} label="本月" value="持續上升" hint="+$38,925"/>
        <SummaryRow t={t} label="年初" value="成長 11.8%" hint="+$248,300"/>
      </div>
    </>
  );
}

// ── AI card ───────────────────────────────────────────────────────────────────

function AICard({ t }: { t: Tokens }) {
  return (
    <div style={{ padding: '40px 24px 0' }}>
      <div style={{ ...cardStyle(t), borderRadius: 18, padding: '18px 18px 14px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 6, right: 14, fontSize: 60, fontFamily: 'Georgia,serif', color: t.textTertiary, opacity: 0.35, lineHeight: 1, pointerEvents: 'none' }}>"</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: t.aiGradient, display: 'grid', placeItems: 'center' }}>
            <Icon name="apple-intelligence" size={11} color="#fff"/>
          </div>
          <span style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>AI 注意到</span>
        </div>
        <div style={{ fontSize: 16, color: t.text, lineHeight: 1.5, paddingRight: 20 }}>
          你最近平日的<strong>咖啡花費</strong>比上週多了 <strong>$380</strong>。要把它設為單獨子分類嗎？
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button style={{ background: 'transparent', border: 'none', color: t.textSecondary, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, padding: '8px 14px', cursor: 'pointer' }}>忽略</button>
          <button style={{ background: t.accent, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 18, cursor: 'pointer' }}>好的</button>
        </div>
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'home', icon: 'house' },
  { id: 'txs', icon: 'list' },
  { id: 'assets', icon: 'chart' },
  { id: 'settings', icon: 'gear' },
] as const;

interface TabBarProps { t: Tokens; dark: boolean; active: string; onChange: (id: string) => void; }
export function CalmTabBar({ t, dark, active, onChange }: TabBarProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 84,
      background: dark ? 'rgba(10,10,11,0.85)' : 'rgba(250,250,250,0.85)',
      backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: `0.5px solid ${t.divider}`,
      display: 'flex', paddingTop: 14, justifyContent: 'center', gap: 56,
    }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon name={tab.icon} size={22} color={tab.id === active ? t.text : t.textTertiary} weight={tab.id === active ? 2 : 1.6}/>
        </button>
      ))}
    </div>
  );
}

// ── FAB ───────────────────────────────────────────────────────────────────────

interface FABProps { t: Tokens; dark: boolean; onClick: () => void; label?: string; }
export function CalmFAB({ t, dark, onClick, label = '截圖記帳' }: FABProps) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
      height: 52, padding: '0 22px', borderRadius: 26, border: 'none',
      background: t.text, color: t.bg, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: dark ? '0 4px 18px rgba(255,255,255,0.08)' : '0 4px 18px rgba(0,0,0,0.18)',
      fontFamily: 'inherit', fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
    }}>
      <Icon name="screenshot" size={18} color={t.bg} weight={2}/>
      <span>{label}</span>
    </button>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

interface CalmDashboardProps {
  dark: boolean; style: 'soft' | 'minimal' | 'glass';
  activeTab: string; onTabChange: (id: string) => void;
  onAddScreenshot: () => void;
}

export default function CalmDashboard({ dark, style, activeTab, onTabChange, onAddScreenshot }: CalmDashboardProps) {
  const t = T(dark, style);
  const [view, setView] = useState<'cashflow' | 'networth'>('cashflow');
  const remaining = 47214, daysLeft = 13;
  const dailyAvg = Math.round(remaining / daysLeft);

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: '-apple-system,"SF Pro Display","PingFang TC",system-ui', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ height: 60 }}/>
      {/* tiny header */}
      <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>2026 年 5 月</span>
        <button style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', color: t.textSecondary }}>
          <Icon name="list" size={18} color={t.textSecondary} weight={1.8}/>
        </button>
      </div>

      {/* view toggle */}
      <div style={{ padding: '14px 24px 0', display: 'flex', gap: 22 }}>
        {(['cashflow', 'networth'] as const).map((k) => {
          const label = k === 'cashflow' ? '現金流' : '淨資產';
          const on = view === k;
          return (
            <button key={k} onClick={() => setView(k)} style={{
              background: 'transparent', border: 'none', padding: '4px 0 6px', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13,
              color: on ? t.text : t.textTertiary, fontWeight: on ? 600 : 500,
              borderBottom: on ? `1.5px solid ${t.text}` : '1.5px solid transparent',
            }}>{label}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
        {view === 'cashflow' ? (
          <>
            {/* Hero */}
            <div style={{ padding: '0 24px', marginTop: t.serif ? 24 : 16 }}>
              <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>本月剩餘</div>
              <div style={{
                fontSize: t.serif ? 72 : 58, fontWeight: t.serif ? 400 : 600,
                letterSpacing: t.serif ? -2 : -2.2, lineHeight: 1, marginTop: 10,
                fontFamily: t.serif ? 'ui-serif,"New York","Iowan Old Style",Georgia,serif' : 'inherit',
                fontVariantNumeric: 'tabular-nums', color: t.text,
              }}>
                <span style={{ fontSize: t.serif ? 28 : 22, fontWeight: 400, color: t.textSecondary, marginRight: 6 }}>$</span>
                {remaining.toLocaleString()}
              </div>
              <div style={{ fontSize: 14, color: t.textSecondary, marginTop: 12, lineHeight: 1.6 }}>
                還有 <span style={{ color: t.text, fontWeight: 500 }}>{daysLeft} 天</span> 過完五月
                <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                平均每天 <span style={{ color: t.text, fontWeight: 500 }}>${dailyAvg.toLocaleString()}</span>
              </div>
            </div>

            {/* Skyline */}
            <div style={{ padding: '40px 24px 0' }}>
              <Skyline t={t}/>
            </div>

            {/* Summary rows */}
            <div style={{ padding: '40px 24px 0' }}>
              <SummaryRow t={t} label="今天" value="2 筆消費" hint="$245" first/>
              <SummaryRow t={t} label="昨天" value="沒有花費" hint=""/>
              <SummaryRow t={t} label="本週" value="比上週少" hint="−$640"/>
            </div>

            <AICard t={t}/>
          </>
        ) : (
          <NetWorthView t={t}/>
        )}
      </div>

      <CalmFAB t={t} dark={dark} onClick={onAddScreenshot}/>
      <CalmTabBar t={t} dark={dark} active={activeTab} onChange={onTabChange}/>
    </div>
  );
}
