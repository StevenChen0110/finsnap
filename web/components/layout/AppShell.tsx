'use client'
import { useState, useCallback, type ReactNode } from 'react'
import { useApp } from '../../lib/context'
import { T, type Tokens } from '../design/tokens'
import Icon from '../ui/Icon'
import Dashboard from '../app-screens/Dashboard'
import Transactions from '../app-screens/Transactions'
import Assets from '../app-screens/Assets'
import Settings from '../app-screens/Settings'
import AddTransactionModal from '../modals/AddTransaction'
import OcrModal from '../modals/OcrModal'
import AddAccountModal from '../modals/AddAccount'

type Tab = 'home' | 'txs' | 'assets' | 'settings'
type Modal = 'add-tx' | 'edit-tx' | 'ocr' | 'add-account' | 'edit-account' | null

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'home',     icon: 'house',  label: '總覽' },
  { id: 'txs',      icon: 'list',   label: '交易' },
  { id: 'assets',   icon: 'chart',  label: '資產' },
  { id: 'settings', icon: 'gear',   label: '設定' },
]

export default function AppShell() {
  const { settings } = useApp()
  const dark = settings.theme === 'dark'
  const t = T(dark, 'soft')

  const [tab, setTab]         = useState<Tab>('home')
  const [modal, setModal]     = useState<Modal>(null)
  const [editTxId, setEditTxId]       = useState<string | null>(null)
  const [editAccountId, setEditAccountId] = useState<string | null>(null)
  const [ocrPrefill, setOcrPrefill]   = useState<Record<string, string> | null>(null)

  const closeModal = useCallback(() => {
    setModal(null); setEditTxId(null); setEditAccountId(null); setOcrPrefill(null)
  }, [])

  const openOcr = useCallback(() => setModal('ocr'), [])

  const handleOcrDone = useCallback((data: Record<string, string>) => {
    setOcrPrefill(data)
    setModal('add-tx')
  }, [])

  const handleEditTx = useCallback((id: string) => {
    setEditTxId(id); setModal('edit-tx')
  }, [])

  const handleEditAccount = useCallback((id: string) => {
    setEditAccountId(id); setModal('edit-account')
  }, [])

  const screenProps = {
    dark,
    onCapture: openOcr,
    onAddTx: () => setModal('add-tx'),
    onAddAccount: () => setModal('add-account'),
    onEditTx: handleEditTx,
    onEditAccount: handleEditAccount,
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: t.bg, color: t.text, fontFamily: '-apple-system,"SF Pro Display","PingFang TC",system-ui,sans-serif', overflow: 'hidden' }}>

      {/* Sidebar — desktop only via CSS class */}
      <aside className="app-sidebar" style={{ width: 220, borderRight: `0.5px solid ${t.divider}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <SidebarContent t={t} dark={dark} activeTab={tab} onTabChange={setTab} onCapture={openOcr}/>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'home'     && <Dashboard    {...screenProps}/>}
          {tab === 'txs'      && <Transactions {...screenProps}/>}
          {tab === 'assets'   && <Assets       {...screenProps}/>}
          {tab === 'settings' && <Settings     dark={dark}/>}
        </main>

        {/* Bottom nav — mobile only via CSS class */}
        <nav className="app-bottom-nav" style={{ borderTop: `0.5px solid ${t.divider}`, background: dark ? 'rgba(10,10,11,0.92)' : 'rgba(250,248,244,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 8 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 16px', cursor: 'pointer', color: n.id === tab ? t.text : t.textTertiary, fontFamily: 'inherit' }}>
              <Icon name={n.icon} size={22} color={n.id === tab ? t.text : t.textTertiary} weight={n.id === tab ? 2 : 1.6}/>
              <span style={{ fontSize: 10, fontWeight: n.id === tab ? 600 : 400 }}>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Modal overlays */}
      {(modal === 'add-tx' || modal === 'edit-tx') && (
        <ModalOverlay t={t} onClose={closeModal}>
          <AddTransactionModal dark={dark} editId={modal === 'edit-tx' ? editTxId : null} prefill={ocrPrefill} onClose={closeModal}/>
        </ModalOverlay>
      )}
      {modal === 'ocr' && (
        <ModalOverlay t={t} onClose={closeModal}>
          <OcrModal dark={dark} onClose={closeModal} onDone={handleOcrDone}/>
        </ModalOverlay>
      )}
      {(modal === 'add-account' || modal === 'edit-account') && (
        <ModalOverlay t={t} onClose={closeModal}>
          <AddAccountModal dark={dark} editId={modal === 'edit-account' ? editAccountId : null} onClose={closeModal}/>
        </ModalOverlay>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({ t, dark, activeTab, onTabChange, onCapture }: { t: Tokens; dark: boolean; activeTab: Tab; onTabChange: (t: Tab) => void; onCapture: () => void }) {
  return (
    <>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accent, display: 'grid', placeItems: 'center' }}>
          <Icon name="wallet" size={16} color="#fff" weight={2}/>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: t.text }}>SnapFinance</span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '4px 10px' }}>
        {NAV.map(n => {
          const active = n.id === activeTab
          return (
            <button key={n.id} onClick={() => onTabChange(n.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', marginBottom: 2, background: active ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: active ? t.text : t.textSecondary, textAlign: 'left' }}>
              <Icon name={n.icon} size={18} color={active ? t.text : t.textSecondary} weight={active ? 2.2 : 1.6}/>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{n.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Capture button */}
      <div style={{ padding: '12px 14px 24px' }}>
        <button onClick={onCapture} style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', background: t.text, color: t.bg, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon name="screenshot" size={15} color={t.bg} weight={2.2}/>
          截圖記帳
        </button>
      </div>
    </>
  )
}

// ── Modal overlay ─────────────────────────────────────────────────────────────

function ModalOverlay({ t, onClose, children }: { t: Tokens; onClose: () => void; children: ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease-out' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '90dvh', overflowY: 'auto', background: t.bg, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.2s cubic-bezier(0.32,0.72,0,1)' }}>
        {children}
      </div>
    </div>
  )
}
