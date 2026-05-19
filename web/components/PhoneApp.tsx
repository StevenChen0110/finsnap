'use client';
// Root client component — device frame + tweaks panel
import { useState } from 'react';
import { IOSDevice } from './phone/IOSFrame';
import Phone, { PhoneTweaks } from './App';
import type { Style } from './design/tokens';

export default function PhoneApp() {
  const [tweaks, setTweaks] = useState<PhoneTweaks>({ theme: 'light', style: 'soft' });

  const outerBg = tweaks.style === 'glass'
    ? (tweaks.theme === 'dark'
        ? 'radial-gradient(circle at 20% 0%, #2a1a55 0%, #0a0a20 60%)'
        : 'radial-gradient(circle at 20% 0%, #f9d6e0 0%, #d8e3ff 50%, #d6f0e0 100%)')
    : (tweaks.theme === 'dark' ? '#111' : 'oklch(0.93 0.014 75)');

  return (
    <div style={{
      minHeight: '100dvh', width: '100%',
      background: outerBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 32,
      padding: '40px 20px',
      transition: 'background 0.3s ease',
      fontFamily: '-apple-system, "SF Pro Display", "PingFang TC", system-ui, sans-serif',
    }}>
      {/* Tweaks bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
        background: tweaks.theme === 'dark' ? 'rgba(30,30,32,0.85)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: tweaks.theme === 'dark' ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 14, padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      }}>
        <TweakLabel>設計</TweakLabel>
        {(['soft', 'minimal', 'glass'] as Style[]).map(s => (
          <TweakButton key={s} active={tweaks.style === s} onClick={() => setTweaks(t => ({ ...t, style: s }))}>
            {{ soft: '舒適', minimal: '極簡', glass: '毛玻璃' }[s]}
          </TweakButton>
        ))}
        <Divider/>
        <TweakLabel>主題</TweakLabel>
        {(['light', 'dark'] as const).map(th => (
          <TweakButton key={th} active={tweaks.theme === th} onClick={() => setTweaks(t => ({ ...t, theme: th }))}>
            {{ light: '淺色', dark: '深色' }[th]}
          </TweakButton>
        ))}
      </div>

      {/* iOS device */}
      <IOSDevice dark={tweaks.theme === 'dark'}>
        <Phone tweaks={tweaks}/>
      </IOSDevice>

      <p style={{ fontSize: 12, color: tweaks.theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        點「截圖記帳」→ 選一張截圖模擬 → AI 分析 → 確認儲存<br/>
        底部 tab 可切換總覽 / 交易 / 資產 / 設定
      </p>
    </div>
  );
}

function TweakLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.5)', letterSpacing: 0.4, textTransform: 'uppercase', alignSelf: 'center', padding: '0 4px' }}>
      {children}
    </span>
  );
}

function TweakButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      height: 28, padding: '0 12px', borderRadius: 8, border: 'none',
      background: active ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.06)',
      color: active ? '#fff' : 'rgba(0,0,0,0.7)',
      fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
      transition: 'background 0.15s, color 0.15s',
    }}>
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.12)', alignSelf: 'center', margin: '0 4px' }}/>;
}
