'use client';
// Main Phone component — orchestrates screens, share picker, processing, confirm
import { useState, useEffect } from 'react';
import { T } from './design/tokens';
import CalmDashboard from './screens/CalmDashboard';
import { TransactionsScreen, AssetsScreen, SettingsScreen } from './screens/OtherScreens';
import { ProcessingScreen, ConfirmSheet } from './screens/ConfirmSheet';
import { MockCreditCardNotif, MockLinePay, MockBankOverview, MockPortfolio } from './ui/Mocks';
import Icon from './ui/Icon';
import type { Style } from './design/tokens';

const SCREENSHOTS = [
  { key: 'credit',    label: '信用卡通知', sub: '玉山 ****1234 消費 NT$156', Mock: MockCreditCardNotif },
  { key: 'linepay',  label: 'LINE Pay 付款', sub: '路易莎咖啡 NT$89',       Mock: MockLinePay },
  { key: 'bank',     label: '銀行帳戶總覽', sub: '玉山綜存 NT$284,316',      Mock: MockBankOverview },
  { key: 'portfolio', label: '證券持倉',   sub: '永豐金 1,486,329',          Mock: MockPortfolio },
];

// ── Share picker ──────────────────────────────────────────────────────────────

interface SharePickerProps { dark: boolean; style: Style; onPick: (k: string) => void; onClose: () => void; }
function SharePicker({ dark, style, onPick, onClose }: SharePickerProps) {
  const t = T(dark, style);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ width: '100%', background: dark ? 'rgba(28,28,30,0.94)' : 'rgba(242,242,247,0.94)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: '12px 12px 36px', maxHeight: '85%', overflowY: 'auto', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ width: 36, height: 5, background: t.textTertiary, borderRadius: 3, margin: '4px auto 14px' }}/>
        <div style={{ padding: '0 6px', fontSize: 13, color: t.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>選擇要記帳的截圖 (模擬)</div>
        <div style={{ fontSize: 12, color: t.textTertiary, padding: '4px 6px 14px' }}>實機從 Share Sheet 接收，這裡點一個來看流程</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {SCREENSHOTS.map(s => (
            <button key={s.key} onClick={() => onPick(s.key)} style={{ background: dark ? 'rgba(28,28,30,0.85)' : '#fff', border: 'none', borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', textAlign: 'left', color: t.text, fontFamily: 'inherit' }}>
              <div style={{ borderRadius: 10, overflow: 'hidden', height: 130, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <s.Mock scale={0.4}/>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>{s.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: 14, height: 48, borderRadius: 12, border: 'none', background: dark ? 'rgba(28,28,30,0.85)' : '#fff', color: t.accent, fontSize: 16, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>取消</button>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function SaveToast({ dark, style, message }: { dark: boolean; style: Style; message: string }) {
  const t = T(dark, style);
  return (
    <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: dark ? 'rgba(50,50,52,0.95)' : 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 6px 30px rgba(0,0,0,0.18)', borderRadius: 22, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: '-apple-system,system-ui', animation: 'toastIn 0.4s cubic-bezier(0.32,0.72,0,1)' }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: t.accent, display: 'grid', placeItems: 'center' }}>
        <Icon name="check" size={14} color="#fff" weight={2.6}/>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{message}</span>
    </div>
  );
}

// ── Phone ─────────────────────────────────────────────────────────────────────

export interface PhoneTweaks { theme: 'light' | 'dark'; style: Style; }

export default function Phone({ tweaks }: { tweaks: PhoneTweaks }) {
  const dark = tweaks.theme === 'dark';
  const style = tweaks.style;
  const t = T(dark, style);

  const [stage, setStage] = useState<'dashboard' | 'picker' | 'processing' | 'confirm'>('dashboard');
  const [tab, setTab] = useState('home');
  const [shotKey, setShotKey] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== 'processing') return;
    setProgress(0);
    const start = performance.now();
    const total = 2200;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setProgress(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setStage('confirm'), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  const handleSave = () => {
    setStage('dashboard');
    const msg = shotKey === 'bank' ? '資產快照已儲存' : shotKey === 'portfolio' ? '持倉已更新' : '交易已儲存';
    setToast(msg);
    if (shotKey === 'bank' || shotKey === 'portfolio') setTab('assets');
    else if (shotKey === 'credit' || shotKey === 'linepay') setTab('txs');
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Tab screens */}
      {tab === 'home' && stage === 'dashboard' && (
        <CalmDashboard dark={dark} style={style} activeTab={tab} onTabChange={setTab} onAddScreenshot={() => setStage('picker')}/>
      )}
      {tab === 'txs' && stage === 'dashboard' && (
        <TransactionsScreen dark={dark} style={style} activeTab={tab} onTabChange={setTab} onAddScreenshot={() => setStage('picker')}/>
      )}
      {tab === 'assets' && stage === 'dashboard' && (
        <AssetsScreen dark={dark} style={style} activeTab={tab} onTabChange={setTab} onAddScreenshot={() => setStage('picker')}/>
      )}
      {tab === 'settings' && stage === 'dashboard' && (
        <SettingsScreen dark={dark} style={style} activeTab={tab} onTabChange={setTab}/>
      )}

      {/* Share picker overlay */}
      {stage === 'picker' && (
        <SharePicker dark={dark} style={style}
          onPick={(k) => { setShotKey(k); setStage('processing'); }}
          onClose={() => setStage('dashboard')}/>
      )}

      {/* Processing / Confirm full-screen */}
      {(stage === 'processing' || stage === 'confirm') && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: t.bg, animation: stage === 'processing' ? 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)' : undefined }}>
          {stage === 'processing' && shotKey && (
            <ProcessingScreen dark={dark} style={style} screenshotKey={shotKey} progress={progress}/>
          )}
          {stage === 'confirm' && shotKey && (
            <ConfirmSheet dark={dark} style={style} screenshotKey={shotKey} onSave={handleSave} onCancel={() => setStage('dashboard')}/>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && <SaveToast dark={dark} style={style} message={toast}/>}
    </div>
  );
}
