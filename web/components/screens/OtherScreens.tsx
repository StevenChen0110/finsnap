'use client';
// TransactionsScreen, AssetsScreen, SettingsScreen — ported from screens.jsx
import { T, Tokens, cardStyle } from '../design/tokens';
import { CalmFAB, CalmTabBar } from './CalmDashboard';
import Icon from '../ui/Icon';
import type { Style } from '../design/tokens';

// ── shared shell ──────────────────────────────────────────────────────────────

interface ShellProps { t: Tokens; title: string; eyebrow?: string; trailing?: React.ReactNode; children: React.ReactNode; }
function Shell({ t, title, eyebrow, trailing, children }: ShellProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: '-apple-system,"SF Pro Display","PingFang TC",system-ui', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ height: 60 }}/>
      <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {eyebrow && <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.2 }}>{eyebrow}</div>}
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, marginTop: eyebrow ? 2 : 0 }}>{title}</div>
        </div>
        {trailing}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>{children}</div>
    </div>
  );
}

// ── Transactions ──────────────────────────────────────────────────────────────

const TX_DATA = [
  { date: '今天 · 5/18', total: 245, items: [
    { time: '12:34', merchant: '全家便利商店 信義店', cat: '飲食', acct: '玉山卡 1234', amount: 156, screenshot: true },
    { time: '09:12', merchant: '路易莎咖啡 信義店',   cat: '飲食', acct: 'LINE Pay',   amount: 89,  screenshot: true },
  ]},
  { date: '昨天 · 5/17', total: 0, items: [] },
  { date: '5/16 · 週六', total: -55794, items: [
    { time: '09:00', merchant: '薪資轉入',      cat: '收入', acct: '玉山銀行',    amount: -58000, income: true },
    { time: '19:20', merchant: '家樂福 內湖店', cat: '居家', acct: '玉山卡 1234', amount: 1284,  screenshot: true },
    { time: '14:32', merchant: '台北捷運',       cat: '交通', acct: '悠遊卡',     amount: 32 },
    { time: '12:30', merchant: '優衣庫 信義店', cat: '購物', acct: 'LINE Pay',   amount: 890, screenshot: true },
  ]},
  { date: '5/15 · 週五', total: 720, items: [
    { time: '23:01', merchant: 'Netflix 月費',  cat: '娛樂', acct: '玉山卡 1234', amount: 390, screenshot: true },
    { time: '18:45', merchant: '麥當勞 信義店', cat: '飲食', acct: 'LINE Pay',   amount: 185 },
    { time: '12:10', merchant: '摩斯漢堡',      cat: '飲食', acct: 'LINE Pay',   amount: 145 },
  ]},
];

const CAT_DATA = [
  { name: '飲食', amount: 7584, color: 'oklch(0.70 0.10 55)' },
  { name: '帳單', amount: 5800, color: 'oklch(0.72 0.08 90)' },
  { name: '居家', amount: 5062, color: 'oklch(0.60 0.07 155)' },
  { name: '交通', amount: 3374, color: 'oklch(0.55 0.08 250)' },
  { name: '購物', amount: 2953, color: 'oklch(0.65 0.09 10)' },
  { name: '娛樂', amount: 2109, color: 'oklch(0.62 0.09 290)' },
  { name: '其他', amount: 1340, color: 'oklch(0.65 0.02 280)' },
];

function CategoryBreakdown({ t }: { t: Tokens }) {
  const total = CAT_DATA.reduce((s, c) => s + c.amount, 0);
  return (
    <div style={{ padding: '4px 0 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10 }}>
        <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>本月分類</span>
        <span style={{ fontSize: 12, color: t.textTertiary, fontVariantNumeric: 'tabular-nums' }}>共 ${total.toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
        {CAT_DATA.map((c, i) => <div key={i} style={{ flex: c.amount, background: c.color }}/>)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {CAT_DATA.map((c, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 14, flexShrink: 0, background: `color-mix(in oklch,${c.color} 14%,transparent)`, border: `0.5px solid color-mix(in oklch,${c.color} 30%,transparent)` }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: c.color, display: 'block' }}/>
            <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{c.name}</span>
            <span style={{ fontSize: 12, color: t.textSecondary, fontVariantNumeric: 'tabular-nums' }}>${c.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TxLineProps { tx: typeof TX_DATA[0]['items'][0]; t: Tokens; }
function TxLine({ tx, t }: TxLineProps) {
  const isIncome = 'income' in tx && tx.income;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderTop: `0.5px solid ${t.divider}` }}>
      <div style={{ fontSize: 11, color: t.textTertiary, width: 38, paddingTop: 3, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{tx.time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: t.text, fontWeight: 500, lineHeight: 1.3 }}>{tx.merchant}</div>
        <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{tx.cat}</span><span style={{ opacity: 0.4 }}>·</span><span>{tx.acct}</span>
          {'screenshot' in tx && tx.screenshot && <Icon name="screenshot" size={10} color={t.textSecondary} weight={2}/>}
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: isIncome ? t.systemGreen : t.text, paddingTop: 1 }}>
        {isIncome ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
      </div>
    </div>
  );
}

interface ScreenProps { dark: boolean; style: Style; activeTab: string; onTabChange: (id: string) => void; onAddScreenshot: () => void; }

export function TransactionsScreen({ dark, style, activeTab, onTabChange, onAddScreenshot }: ScreenProps) {
  const t = T(dark, style);
  return (
    <>
      <Shell t={t} eyebrow="2026 年 5 月" title="交易"
        trailing={<button style={{ background: 'transparent', border: 'none', color: t.textSecondary, padding: 6, cursor: 'pointer' }} onClick={onAddScreenshot}><Icon name="screenshot" size={18} color={t.textSecondary}/></button>}>
        <div style={{ padding: '14px 20px 0' }}>
          <CategoryBreakdown t={t}/>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, padding: '14px 0 8px', borderBottom: `0.5px solid ${t.divider}` }}>
            {['全部','支出','收入'].map((f, i) => (
              <span key={f} style={{ color: i === 0 ? t.text : t.textTertiary, fontWeight: i === 0 ? 600 : 400, paddingBottom: 6, borderBottom: i === 0 ? `2px solid ${t.text}` : 'none', marginBottom: -1 }}>{f}</span>
            ))}
          </div>
          {TX_DATA.map((g, gi) => (
            <div key={gi} style={{ marginTop: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 6 }}>
                <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{g.date}</span>
                <span style={{ fontSize: 12, color: t.textTertiary, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  {g.items.length === 0 ? '沒有花費' : g.total < 0 ? `淨入 +$${Math.abs(g.total).toLocaleString()}` : `$${g.total.toLocaleString()}`}
                </span>
              </div>
              {g.items.length === 0
                ? <div style={{ fontSize: 14, color: t.textTertiary, padding: '10px 0', fontStyle: 'italic' }}>—</div>
                : g.items.map((tx, i) => <TxLine key={i} tx={tx} t={t}/>)
              }
            </div>
          ))}
          <div style={{ height: 40 }}/>
        </div>
      </Shell>
      <CalmFAB t={t} dark={dark} onClick={onAddScreenshot}/>
      <CalmTabBar t={t} dark={dark} active={activeTab} onChange={onTabChange}/>
    </>
  );
}

// ── Assets ────────────────────────────────────────────────────────────────────

const ASSET_GROUPS = [
  { label: '銀行 · 現金', color: 'oklch(0.60 0.07 155)', items: [
    { name: '玉山銀行 綜存',     sub: '****-***-6789 · 昨天更新',  amount: 284316, trend: +5200 },
    { name: '中國信託 數位帳戶', sub: '****-***-1102 · 5/12 更新', amount: 156400, trend: -1200 },
    { name: '現金',             sub: '手動更新',                   amount: 27740 },
  ]},
  { label: '電子支付', color: 'oklch(0.62 0.09 290)', items: [
    { name: 'LINE Pay', sub: '****1234 連動', amount: 4820 },
    { name: '街口支付', sub: '預付餘額',      amount: 2140 },
  ]},
  { label: '信用卡 · 本期', color: 'oklch(0.62 0.10 35)', items: [
    { name: '玉山信用卡', sub: '****1234 · 6/15 截止', amount: -18420, isCredit: true },
  ]},
  { label: '投資', color: 'oklch(0.55 0.08 250)', items: [
    { name: '永豐金證券 持倉', sub: '4 檔股票 · 今日 −0.86%', amount: 1486329, trend: -12840 },
    { name: '元大投信 基金',   sub: '2 檔 · 月初快照',       amount: 405600,  trend: +3200 },
  ]},
];
const positiveGroups = ASSET_GROUPS.filter(g => !g.items.some(i => 'isCredit' in i && i.isCredit));
const positiveTotal = positiveGroups.flatMap(g => g.items).reduce((s, i) => s + (i.amount > 0 ? i.amount : 0), 0);

const NET_PATH_ASSETS = [2.180,2.182,2.179,2.190,2.205,2.198,2.212,2.225,2.220,2.230,2.218,2.245,2.260,2.255,2.270,2.285,2.280,2.291,2.305,2.298,2.310,2.318,2.316,2.329,2.334,2.336,2.345,2.341,2.348].map(v => v * 1_000_000);

function AssetLineChart({ t }: { t: Tokens }) {
  const W = 360, H = 120;
  const min = Math.min(...NET_PATH_ASSETS), max = Math.max(...NET_PATH_ASSETS), range = max - min || 1;
  const pts = NET_PATH_ASSETS.map((v, i) => ({ x: (i / (NET_PATH_ASSETS.length - 1)) * W, y: H - 6 - ((v - min) / range) * (H - 16) }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} style={{ display: 'block' }}>
      <defs><linearGradient id="assetArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.accent} stopOpacity={0.18}/><stop offset="100%" stopColor={t.accent} stopOpacity="0"/></linearGradient></defs>
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#assetArea)"/>
      <path d={d} stroke={t.accent} strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={last.x} cy={last.y} r="3.2" fill={t.accent}/>
      <circle cx={last.x} cy={last.y} r="6" fill={t.accent} opacity="0.15"/>
    </svg>
  );
}

export function AssetsScreen({ dark, style, activeTab, onTabChange, onAddScreenshot }: ScreenProps) {
  const t = T(dark, style);
  return (
    <>
      <Shell t={t} eyebrow="所有帳戶" title="資產">
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>淨資產</div>
          <div style={{ fontSize: t.serif ? 52 : 44, fontWeight: t.serif ? 400 : 600, letterSpacing: -1.5, marginTop: 6, fontVariantNumeric: 'tabular-nums', fontFamily: t.serif ? 'ui-serif,"New York",Georgia,serif' : 'inherit' }}>
            <span style={{ fontSize: 18, color: t.textSecondary, fontWeight: 500, marginRight: 4 }}>$</span>2,348,925
          </div>
          <div style={{ fontSize: 13, color: t.systemGreen, fontWeight: 500, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="arrow-up-right" size={12} color={t.systemGreen} weight={2.2}/>
            +$12,480 <span style={{ color: t.textSecondary, fontWeight: 400 }}>本週</span>
          </div>
        </div>
        <div style={{ padding: '20px 0 0' }}>
          <AssetLineChart t={t}/>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 10, fontSize: 11, color: t.textTertiary, letterSpacing: 0.4 }}>
            {['1月','3月','6月','1年','全部'].map((p, i) => <span key={p} style={{ color: i === 1 ? t.text : t.textTertiary, fontWeight: i === 1 ? 600 : 500 }}>{p}</span>)}
          </div>
        </div>
        {/* Composition bar */}
        <div style={{ padding: '32px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10 }}>
            <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>資產組成</span>
            <span style={{ fontSize: 11, color: t.textTertiary }}>共 ${positiveTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
            {positiveGroups.map((g, i) => {
              const sum = g.items.reduce((s, it) => s + (it.amount > 0 ? it.amount : 0), 0);
              return <div key={i} style={{ flex: sum, background: g.color }}/>;
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
            {positiveGroups.map((g, i) => {
              const sum = g.items.reduce((s, it) => s + (it.amount > 0 ? it.amount : 0), 0);
              const pct = (sum / positiveTotal * 100).toFixed(0);
              return (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: g.color, display: 'block' }}/>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>{g.label}</span>
                  <span style={{ fontSize: 12, color: t.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Account groups */}
        <div style={{ padding: '24px 20px 0' }}>
          {ASSET_GROUPS.map((g, gi) => (
            <div key={gi} style={{ marginTop: gi === 0 ? 0 : 26 }}>
              <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', paddingBottom: 6 }}>{g.label}</div>
              {g.items.map((a, i) => {
                const isCredit = 'isCredit' in a && a.isCredit;
                const pct = isCredit ? Math.min(1, Math.abs(a.amount) / 50000) : Math.min(1, (a.amount > 0 ? a.amount : 0) / positiveTotal);
                return (
                  <div key={i} style={{ padding: '14px 0', borderTop: `0.5px solid ${t.divider}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <div style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>{a.sub}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: isCredit ? t.systemRed : t.text }}>
                          {isCredit ? '−' : ''}${Math.abs(a.amount).toLocaleString()}
                        </div>
                        {'trend' in a && a.trend !== undefined && (
                          <div style={{ fontSize: 11, marginTop: 2, fontVariantNumeric: 'tabular-nums', color: (a.trend as number) >= 0 ? t.systemGreen : t.systemRed, fontWeight: 500 }}>
                            {(a.trend as number) >= 0 ? '+' : '−'}${Math.abs(a.trend as number).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 3, background: t.divider, borderRadius: 1.5, marginTop: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: isCredit ? 'oklch(0.62 0.10 35)' : g.color, borderRadius: 1.5 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ height: 40 }}/>
        </div>
      </Shell>
      <CalmFAB t={t} dark={dark} onClick={onAddScreenshot} label="更新資產"/>
      <CalmTabBar t={t} dark={dark} active={activeTab} onChange={onTabChange}/>
    </>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────

const SETTINGS_ITEMS = [
  { group: '隱私', rows: [
    { icon: 'screenshot', label: '截圖儲存',     value: '僅文字', hint: '辨識完即捨棄原圖' },
    { icon: 'wand',       label: '原圖加密',     value: 'Face ID' },
    { icon: 'bell',       label: '通知與背景拉取', value: '已開啟' },
  ]},
  { group: '資料', rows: [
    { icon: 'creditcard',   label: '帳戶',         value: '7 個' },
    { icon: 'tag',          label: '分類',         value: '23 個' },
    { icon: 'doc-text',     label: '電子發票載具',  value: '已連動' },
    { icon: 'arrow-up-right', label: '匯出 CSV',   value: '' },
  ]},
  { group: '快捷', rows: [
    { icon: 'sparkles', label: 'App Intents', value: 'Siri / 動作按鈕' },
    { icon: 'photo',    label: 'Widget',      value: '主畫面 + 鎖定畫面' },
  ]},
  { group: '關於', rows: [
    { label: '版本', value: '1.0.0 (build 1)' },
    { label: '設計理念', value: '' },
    { label: '開源授權', value: '' },
  ]},
];

interface SettingsScreenProps { dark: boolean; style: Style; activeTab: string; onTabChange: (id: string) => void; }
export function SettingsScreen({ dark, style, activeTab, onTabChange }: SettingsScreenProps) {
  const t = T(dark, style);
  return (
    <>
      <Shell t={t} title="設定">
        {/* AI status card */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ ...cardStyle(t), borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: t.aiGradient, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="apple-intelligence" size={20} color="#fff"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Apple Intelligence</div>
              <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 1 }}>裝置端 · 142 個學習過的商家</div>
            </div>
            <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 10, background: 'oklch(0.62 0.13 155 / 0.15)', color: 'oklch(0.5 0.13 155)', fontWeight: 600, letterSpacing: 0.3 }}>啟用中</div>
          </div>
        </div>
        {SETTINGS_ITEMS.map((section) => (
          <div key={section.group} style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', paddingBottom: 4 }}>{section.group}</div>
            {section.rows.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: `0.5px solid ${t.divider}` }}>
                {'icon' in it && it.icon && <div style={{ width: 22, display: 'grid', placeItems: 'center' }}><Icon name={it.icon} size={17} color={t.textSecondary} weight={1.8}/></div>}
                {(!('icon' in it) || !it.icon) && <div style={{ width: 22 }}/>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>{it.label}</div>
                  {'hint' in it && it.hint && <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 1 }}>{it.hint}</div>}
                </div>
                <div style={{ fontSize: 14, color: t.textSecondary }}>{it.value}</div>
                <Icon name="chevron-right" size={14} color={t.textTertiary}/>
              </div>
            ))}
          </div>
        ))}
        <div style={{ padding: '24px 20px 40px', textAlign: 'center', fontSize: 11, color: t.textTertiary, lineHeight: 1.6 }}>
          SnapFinance · 所有資料儲存在這台 iPhone<br/>除非你開啟 iCloud 同步
        </div>
      </Shell>
      <CalmTabBar t={t} dark={dark} active={activeTab} onChange={onTabChange}/>
    </>
  );
}
