'use client';

interface IOSDeviceProps {
  width?: number;
  height?: number;
  dark?: boolean;
  children: React.ReactNode;
}

export function IOSDevice({ width = 393, height = 852, dark = false, children }: IOSDeviceProps) {
  const bezel = 14;
  const R = 52;
  const innerW = width - bezel * 2;
  const innerH = height - bezel * 2;

  return (
    <div style={{
      position: 'relative',
      width: width + bezel * 2,
      height: height + bezel * 2,
      flexShrink: 0,
    }}>
      {/* Outer shell */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: R + bezel,
        background: dark
          ? 'linear-gradient(160deg,#2a2a2c 0%,#1a1a1c 60%,#111 100%)'
          : 'linear-gradient(160deg,#d8d8de 0%,#c8c8ce 50%,#b8b8be 100%)',
        boxShadow: dark
          ? '0 40px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06) inset'
          : '0 40px 80px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(255,255,255,0.60) inset',
      }}/>

      {/* Screen area */}
      <div style={{
        position: 'absolute',
        top: bezel, left: bezel,
        width: innerW, height: innerH,
        borderRadius: R,
        overflow: 'hidden',
        background: '#000',
      }}>
        {/* Status bar */}
        <IOSStatusBar dark={dark}/>
        {/* Content fills below status bar */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {children}
        </div>
      </div>

      {/* Dynamic island */}
      <div style={{
        position: 'absolute',
        top: bezel + 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 118, height: 34,
        borderRadius: 20,
        background: '#000',
        zIndex: 10,
      }}/>

      {/* Side buttons */}
      {/* Power */}
      <div style={{
        position: 'absolute',
        right: -3, top: 160,
        width: 4, height: 72,
        borderRadius: '0 3px 3px 0',
        background: dark ? '#2a2a2c' : '#b4b4ba',
      }}/>
      {/* Volume up */}
      <div style={{
        position: 'absolute',
        left: -3, top: 140,
        width: 4, height: 54,
        borderRadius: '3px 0 0 3px',
        background: dark ? '#2a2a2c' : '#b4b4ba',
      }}/>
      {/* Volume down */}
      <div style={{
        position: 'absolute',
        left: -3, top: 206,
        width: 4, height: 54,
        borderRadius: '3px 0 0 3px',
        background: dark ? '#2a2a2c' : '#b4b4ba',
      }}/>
      {/* Mute */}
      <div style={{
        position: 'absolute',
        left: -3, top: 100,
        width: 4, height: 28,
        borderRadius: '3px 0 0 3px',
        background: dark ? '#2a2a2c' : '#b4b4ba',
      }}/>

      {/* Home indicator */}
      <div style={{
        position: 'absolute',
        bottom: bezel + 8, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 5, borderRadius: 3,
        background: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)',
        zIndex: 10,
      }}/>
    </div>
  );
}

function IOSStatusBar({ dark = false }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px 0',
      position: 'absolute', top: 0, left: 0, right: 0,
      zIndex: 20, height: 56,
    }}>
      <span style={{ fontWeight: 590, fontSize: 15, color: c, fontFamily: '-apple-system,system-ui', letterSpacing: -0.3 }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={c}>
          <rect x="0" y="7.5" width="3" height="4.5" rx="0.7"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.7"/>
          <rect x="9" y="2.5" width="3" height="9.5" rx="0.7"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.7"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
          <path d="M3.5 6.8A6.5 6.5 0 0112.5 6.8" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <path d="M1 4.2A10 10 0 0115 4.2" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={c} strokeOpacity="0.35"/>
          <rect x="2" y="2" width="17" height="8" rx="2" fill={c}/>
          <path d="M23 4v4c.8-.3 1.5-1.2 1.5-2s-.7-1.7-1.5-2z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}
