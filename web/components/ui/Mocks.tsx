'use client';
// Mock screenshot thumbnails — authentic-feeling iOS notification/app screens

interface MockProps { scale?: number; }

export function MockCreditCardNotif({ scale = 1 }: MockProps) {
  const sz = (n: number) => n * scale;
  return (
    <div style={{
      width: sz(320), height: sz(520), minWidth: sz(320),
      background: 'linear-gradient(180deg,#2c3138 0%,#1a1d22 100%)',
      borderRadius: sz(22), position: 'relative', overflow: 'hidden',
      fontFamily: '-apple-system,system-ui',
    }}>
      <div style={{ position: 'absolute', top: sz(38), left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: sz(80), fontWeight: 200, letterSpacing: -2, lineHeight: 1 }}>9:41</div>
        <div style={{ fontSize: sz(16), opacity: 0.85, marginTop: sz(4) }}>2026年5月18日 星期一</div>
      </div>
      <div style={{
        position: 'absolute', top: sz(230), left: sz(16), right: sz(16),
        background: 'rgba(255,255,255,0.14)', borderRadius: sz(16), padding: sz(12),
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: sz(8), marginBottom: sz(6) }}>
          <div style={{ width: sz(22), height: sz(22), borderRadius: sz(5), background: '#005BAC', display: 'grid', placeItems: 'center', fontSize: sz(11), fontWeight: 700 }}>玉</div>
          <span style={{ fontSize: sz(13), fontWeight: 600 }}>玉山銀行</span>
          <span style={{ marginLeft: 'auto', fontSize: sz(12), opacity: 0.65 }}>剛剛</span>
        </div>
        <div style={{ fontSize: sz(14), fontWeight: 600, marginBottom: sz(2) }}>消費通知</div>
        <div style={{ fontSize: sz(13), lineHeight: 1.35, opacity: 0.92 }}>
          您的玉山信用卡 (****1234) 於 05/18 12:34<br/>
          在「全家便利商店 信義店」消費 NT$ 156 元
        </div>
      </div>
    </div>
  );
}

export function MockLinePay({ scale = 1 }: MockProps) {
  const sz = (n: number) => n * scale;
  return (
    <div style={{
      width: sz(320), height: sz(520), minWidth: sz(320),
      background: '#fff', borderRadius: sz(22), overflow: 'hidden',
      fontFamily: '-apple-system,system-ui', color: '#111',
    }}>
      <div style={{ height: sz(64), background: '#06C755', display: 'flex', alignItems: 'flex-end', padding: `0 ${sz(18)}px ${sz(12)}px` }}>
        <span style={{ color: '#fff', fontSize: sz(17), fontWeight: 700 }}>LINE Pay</span>
      </div>
      <div style={{ padding: sz(20) }}>
        <div style={{ textAlign: 'center', paddingTop: sz(20) }}>
          <div style={{ width: sz(56), height: sz(56), borderRadius: '50%', background: '#f0faf0', margin: '0 auto', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontSize: sz(28) }}>✓</span>
          </div>
          <div style={{ fontSize: sz(16), fontWeight: 700, marginTop: sz(12), color: '#06C755' }}>付款成功</div>
        </div>
        <div style={{ marginTop: sz(24), padding: sz(16), background: '#f9f9f9', borderRadius: sz(12) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: sz(13), marginBottom: sz(8), color: '#666' }}>
            <span>商家</span><span style={{ color: '#111', fontWeight: 600 }}>路易莎咖啡 信義店</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: sz(13), marginBottom: sz(8), color: '#666' }}>
            <span>金額</span><span style={{ color: '#111', fontWeight: 700, fontSize: sz(16) }}>NT$ 89</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: sz(12), color: '#999' }}>
            <span>時間</span><span>2026/05/18 09:12</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockBankOverview({ scale = 1 }: MockProps) {
  const sz = (n: number) => n * scale;
  return (
    <div style={{
      width: sz(320), height: sz(520), minWidth: sz(320),
      background: '#fff', borderRadius: sz(22), overflow: 'hidden',
      fontFamily: '-apple-system,system-ui', color: '#111',
    }}>
      <div style={{ height: sz(64), background: '#E60012', display: 'flex', alignItems: 'flex-end', padding: `0 ${sz(18)}px ${sz(12)}px` }}>
        <span style={{ color: '#fff', fontSize: sz(17), fontWeight: 700 }}>帳戶總覽</span>
      </div>
      <div style={{ padding: sz(18) }}>
        <div style={{ fontSize: sz(13), color: '#888' }}>新台幣綜存帳戶</div>
        <div style={{ fontSize: sz(12), color: '#aaa', marginTop: sz(2) }}>****-***-678901</div>
        <div style={{ fontSize: sz(28), fontWeight: 700, marginTop: sz(14), letterSpacing: -0.5 }}>NT$ 284,316</div>
        <div style={{ fontSize: sz(12), color: '#888', marginTop: sz(2) }}>可用餘額</div>
        <div style={{ display: 'flex', gap: sz(10), marginTop: sz(18) }}>
          {['轉帳', '繳費', '更多'].map((t, i) => (
            <div key={i} style={{ flex: 1, padding: `${sz(10)}px 0`, textAlign: 'center', background: '#f5f5f7', borderRadius: sz(10), fontSize: sz(13), color: '#333' }}>{t}</div>
          ))}
        </div>
        <div style={{ marginTop: sz(20), fontSize: sz(13), fontWeight: 600 }}>最近交易</div>
        {[['薪資轉入', '+58,000', '#0a7'], ['電費 自動扣繳', '-1,284', '#222'], ['ATM 提款', '-3,000', '#222']].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: `${sz(10)}px 0`, borderTop: '0.5px solid #eee', fontSize: sz(13) }}>
            <span>{row[0]}</span><span style={{ color: row[2], fontWeight: 600 }}>{row[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockPortfolio({ scale = 1 }: MockProps) {
  const sz = (n: number) => n * scale;
  const holdings = [
    { code: '2330', name: '台積電',    shares: 50,  price: 1096, value: 54800, change: -0.54 },
    { code: '0050', name: '元大台灣50', shares: 200, price: 192,  value: 38420, change: +0.21 },
    { code: '2454', name: '聯發科',    shares: 10,  price: 1215, value: 12150, change: -1.22 },
    { code: '006208', name: '富邦台50', shares: 500, price: 108,  value: 54250, change: +0.09 },
  ];
  return (
    <div style={{
      width: sz(320), height: sz(520), minWidth: sz(320),
      background: '#0d1117', borderRadius: sz(22), overflow: 'hidden',
      fontFamily: '-apple-system,system-ui', color: '#fff',
    }}>
      <div style={{ padding: `${sz(20)}px ${sz(18)}px ${sz(12)}px` }}>
        <div style={{ fontSize: sz(13), opacity: 0.6 }}>永豐金證券</div>
        <div style={{ fontSize: sz(28), fontWeight: 700, marginTop: sz(4) }}>$1,486,329</div>
        <div style={{ fontSize: sz(13), color: '#FF453A', marginTop: sz(2) }}>▼ 12,840 (-0.86%) 今日</div>
      </div>
      <div style={{ margin: `0 ${sz(18)}px`, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}/>
      <div style={{ padding: `${sz(8)}px ${sz(18)}px` }}>
        {holdings.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${sz(10)}px 0`, borderBottom: i < holdings.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div>
              <div style={{ fontSize: sz(14), fontWeight: 600 }}>{h.code}</div>
              <div style={{ fontSize: sz(11), opacity: 0.5 }}>{h.name} · {h.shares}股</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: sz(13), fontWeight: 600 }}>${h.value.toLocaleString()}</div>
              <div style={{ fontSize: sz(11), color: h.change >= 0 ? '#34C759' : '#FF453A' }}>
                {h.change >= 0 ? '▲' : '▼'} {Math.abs(h.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
