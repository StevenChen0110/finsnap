'use client';
// Processing + Confirm screens — ported from confirm.jsx
import { T, Tokens, cardStyle, CAT_META } from '../design/tokens';
import { MockCreditCardNotif, MockLinePay, MockBankOverview, MockPortfolio } from '../ui/Mocks';
import Icon from '../ui/Icon';
import type { Style } from '../design/tokens';

// ── Processing screen ─────────────────────────────────────────────────────────

const STEPS = ['辨識文字', '判斷類型', '提取結構', '建議分類'];
const STEP_THRESHOLDS = [30, 55, 80, 95];

interface ProcessingProps { dark: boolean; style: Style; screenshotKey: string; progress: number; }
export function ProcessingScreen({ dark, style, screenshotKey, progress }: ProcessingProps) {
  const t = T(dark, style);
  const MockComp = { credit: MockCreditCardNotif, bank: MockBankOverview, portfolio: MockPortfolio, linepay: MockLinePay }[screenshotKey];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: '-apple-system,system-ui', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 60 }}/>
      <div style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, color: t.textSecondary }}>截圖辨識</span>
        <span style={{ fontSize: 13, color: t.textSecondary, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: 24 }}>
        <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
          {MockComp && <MockComp scale={0.78}/>}
          {/* scan beam */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${progress * 0.85}%`, height: 3, background: `linear-gradient(90deg,transparent,${t.accent},transparent)`, boxShadow: `0 0 14px ${t.accent}`, transition: 'top 0.3s ease-out' }}/>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: `${progress * 0.85}%`, background: `linear-gradient(180deg,${t.accent}10,transparent)`, transition: 'height 0.3s ease-out' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: t.aiGradient, display: 'grid', placeItems: 'center' }}>
            <Icon name="apple-intelligence" size={16} color="#fff"/>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Apple Intelligence 分析中</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', minWidth: 200 }}>
          {STEPS.map((s, i) => {
            const done = progress >= STEP_THRESHOLDS[i];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: done ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: done ? t.accent : 'transparent', border: done ? 'none' : `1.5px solid ${t.textTertiary}`, display: 'grid', placeItems: 'center' }}>
                  {done && <Icon name="check" size={12} color="#fff" weight={2.5}/>}
                </div>
                <span style={{ fontSize: 14, color: done ? t.text : t.textSecondary }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Payloads ──────────────────────────────────────────────────────────────────

const PAYLOADS = {
  credit: { type: 'transaction', typeLabel: '交易', title: '玉山信用卡 消費', detected: '玉山銀行 消費通知', amount: 156, sign: -1, merchant: '全家便利商店 信義店', date: '2026/05/18 12:34', account: '玉山信用卡 ****1234', category: '飲食', subcategory: '便利商店', confidence: 0.96, reason: '商家「全家便利商店」過去 12 筆中 11 筆歸為「飲食 / 便利商店」' },
  linepay: { type: 'transaction', typeLabel: '交易', title: 'LINE Pay 付款', detected: 'LINE Pay 付款完成', amount: 89, sign: -1, merchant: '路易莎咖啡 信義店', date: '2026/05/18 09:12', account: 'LINE Pay (玉山信用卡 ****1234)', category: '飲食', subcategory: '咖啡', confidence: 0.93, reason: '「路易莎咖啡」符合常用分類「飲食 / 咖啡」' },
  bank: { type: 'asset', typeLabel: '資產快照', title: '帳戶餘額更新', detected: '銀行 帳戶總覽', amount: 284316, sign: 1, institution: '玉山銀行', account: '****-***-678901', assetType: '銀行帳戶 (新台幣綜存)', date: '2026/05/18', delta: +5200, confidence: 0.98 },
  portfolio: { type: 'portfolio', typeLabel: '投資持倉', title: '持股快照', detected: '證券 App 帳戶總覽', total: 1486329, delta: -12840, deltaPct: -0.86, institution: '永豐金證券', date: '2026/05/18', holdings: [{ code: '2330', name: '台積電', shares: 50, value: 54800 }, { code: '0050', name: '元大台灣50', shares: 200, value: 38420 }, { code: '2454', name: '聯發科', shares: 10, value: 12150 }, { code: '006208', name: '富邦台50', shares: 500, value: 54250 }], confidence: 0.94 },
} as const;

// ── Field component ───────────────────────────────────────────────────────────

interface FieldProps { label: string; value: string; icon?: string; accent?: boolean; t: Tokens; last?: boolean; }
function Field({ label, value, icon, accent, t, last }: FieldProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : `0.5px solid ${t.divider}` }}>
      {icon && <div style={{ width: 32, height: 32, borderRadius: 8, background: `${(CAT_META[value] || CAT_META['飲食']).color}22`, display: 'grid', placeItems: 'center', marginRight: 12, flexShrink: 0 }}>
        <Icon name={(CAT_META[value] || CAT_META['飲食']).icon} size={16} color={(CAT_META[value] || CAT_META['飲食']).color}/>
      </div>}
      {!icon && <div style={{ width: 44 }}/>}
      <div style={{ flex: 1, fontSize: 15, color: t.text }}>{label}</div>
      <div style={{ fontSize: 15, color: accent ? t.accent : t.text, fontWeight: accent ? 500 : 400 }}>{value}</div>
      <div style={{ marginLeft: 8 }}><Icon name="chevron-right" size={14} color={t.textTertiary}/></div>
    </div>
  );
}

// ── Main confirm sheet ────────────────────────────────────────────────────────

interface ConfirmProps { dark: boolean; style: Style; screenshotKey: string; onSave: () => void; onCancel: () => void; }
export function ConfirmSheet({ dark, style, screenshotKey, onSave, onCancel }: ConfirmProps) {
  const t = T(dark, style);
  const payload = PAYLOADS[screenshotKey as keyof typeof PAYLOADS];
  if (!payload) return null;

  const MockComp = { credit: MockCreditCardNotif, bank: MockBankOverview, portfolio: MockPortfolio, linepay: MockLinePay }[screenshotKey];

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: '-apple-system,system-ui', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 60 }}/>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: t.accent, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}>取消</button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>確認 {payload.typeLabel}</span>
        <button onClick={onSave} style={{ background: 'none', border: 'none', color: t.accent, fontSize: 16, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}>儲存</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>
        {/* Screenshot + detection */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 16, ...cardStyle(t), borderRadius: 16, padding: 12 }}>
          <div style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', width: 78, alignSelf: 'flex-start' }}>
            {MockComp && <MockComp scale={0.244}/>}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: t.aiGradient, borderRadius: 10, marginBottom: 4 }}>
                <Icon name="apple-intelligence" size={10} color="#fff"/>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>AI 偵測</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{payload.detected}</div>
              <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>信心度 {Math.round(payload.confidence * 100)}% · 點選縮圖查看原圖</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: t.accent, fontSize: 12, fontFamily: 'inherit', padding: 0, marginTop: 6, alignSelf: 'flex-start', cursor: 'pointer' }}>切換類型 ▾</button>
          </div>
        </div>

        {payload.type === 'transaction' && <TransactionForm payload={payload as typeof PAYLOADS['credit']} t={t}/>}
        {payload.type === 'asset' && <AssetForm payload={payload as typeof PAYLOADS['bank']} t={t}/>}
        {payload.type === 'portfolio' && <PortfolioForm payload={payload as typeof PAYLOADS['portfolio']} t={t}/>}

        <div style={{ marginTop: 20, padding: '0 8px', fontSize: 11, color: t.textTertiary, textAlign: 'center', lineHeight: 1.5 }}>
          所有辨識在裝置上完成 · 截圖預設僅保留辨識後文字
        </div>
      </div>
    </div>
  );
}

// ── Transaction form ──────────────────────────────────────────────────────────

function TransactionForm({ payload, t }: { payload: typeof PAYLOADS['credit']; t: Tokens }) {
  return (
    <div>
      <div style={{ ...cardStyle(t), borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>支出金額</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 16, color: t.textSecondary, fontWeight: 500 }}>NT$</span>
          <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.2 }}>{payload.amount.toLocaleString()}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: t.cardAlt, borderRadius: 12, marginTop: 4 }}>
          <Icon name="check" size={11} color={t.systemGreen} weight={2.5}/>
          <span style={{ fontSize: 11, color: t.textSecondary }}>金額已自動辨識</span>
        </div>
      </div>
      <div style={{ marginTop: 14, ...cardStyle(t), borderRadius: 14, overflow: 'hidden' }}>
        <Field label="商家" t={t} value={payload.merchant}/>
        <Field label="日期 / 時間" t={t} value={payload.date}/>
        <Field label="付款帳戶" t={t} value={payload.account}/>
        <Field label="分類" t={t} value={payload.category} icon="fork-knife"/>
        <Field label="子分類" t={t} value={payload.subcategory} last/>
      </div>
      <div style={{ marginTop: 12, ...cardStyle(t), borderRadius: 14, padding: '12px 16px' }}>
        <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 6, fontWeight: 500 }}>AI 分類依據</div>
        <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5 }}>{payload.reason}</div>
      </div>
    </div>
  );
}

function AssetForm({ payload, t }: { payload: typeof PAYLOADS['bank']; t: Tokens }) {
  return (
    <div>
      <div style={{ ...cardStyle(t), borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>帳戶餘額</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 16, color: t.textSecondary }}>NT$</span>
          <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.2 }}>{payload.amount.toLocaleString()}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: t.cardAlt, borderRadius: 12 }}>
          <Icon name="arrow-up-right" size={11} color={t.systemGreen} weight={2.5}/>
          <span style={{ fontSize: 11, color: t.textSecondary }}>較上次 +${payload.delta.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ marginTop: 14, ...cardStyle(t), borderRadius: 14, overflow: 'hidden' }}>
        <Field label="機構" t={t} value={payload.institution}/>
        <Field label="帳號" t={t} value={payload.account}/>
        <Field label="類型" t={t} value={payload.assetType}/>
        <Field label="日期" t={t} value={payload.date} last/>
      </div>
    </div>
  );
}

function PortfolioForm({ payload, t }: { payload: typeof PAYLOADS['portfolio']; t: Tokens }) {
  return (
    <div>
      <div style={{ ...cardStyle(t), borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>持倉總值</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 16, color: t.textSecondary }}>NT$</span>
          <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>{payload.total.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 13, color: t.systemRed, fontWeight: 500 }}>
          ▼ ${Math.abs(payload.delta).toLocaleString()} ({payload.deltaPct}%) 今日
        </div>
      </div>
      <div style={{ marginTop: 14, ...cardStyle(t), borderRadius: 14, overflow: 'hidden', padding: '0 16px' }}>
        <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', padding: '12px 0 8px' }}>{payload.institution}</div>
        {payload.holdings.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderTop: i === 0 ? 'none' : `0.5px solid ${t.divider}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{h.code}</div>
              <div style={{ fontSize: 12, color: t.textSecondary }}>{h.name} · {h.shares} 股</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>${h.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
