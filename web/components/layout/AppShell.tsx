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

const TAB_TITLES: Record<Tab, string> = {
  home: 'FinSnap',
  txs: '交易紀錄',
  assets: '資產帳戶',
  settings: '設定',
}

export default function AppShell() {
  const { settings } = useApp()
  const dark = settings.theme === 'dark'
  const t = T(dark, 'soft')

  const [tab, setTab]                     = useState<Tab>('home')
  const [modal, setModal]                 = useState<Modal>(null)
  const [editTxId, setEditTxId]           = useState<string | null>(null)
  const [editAccountId, setEditAccountId] = useState<string | null>(null)
  const [ocrPrefill, setOcrPrefill]       = useState<Record<string, string> | null>(null)

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

  const showFab = tab === 'txs' || tab === 'home'
  const fabAction = tab === 'assets' ? () => setModal('add-account') : () => setModal('add-tx')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: t.bg,
      color: t.text,
      fontFamily: '-apple-system,"SF Pro Display","PingFang TC",system-ui,sans-serif',
      overflow: 'hidden',
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* iOS-style top header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
        paddingBottom: 10,
        background: dark ? 'rgba(10,10,11,0.92)' : 'rgba(250,248,244,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `0.5px solid ${t.divider}`,
        flexShrink: 0,
        zIndex: 10,
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
          {TAB_TITLES[tab]}
        </span>
        <button onClick={openOcr} style={{
          width: 36, height: 36,
          borderRadius: 10,
          border: 'none',
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}>
          <Icon name="screenshot" size={18} color={t.text} weight={2}/>
        </button>
      </header>

      {/* Main scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'home'     && <Dashboard    {...screenProps}/>}
        {tab === 'txs'      && <Transactions {...screenProps}/>}
        {tab === 'assets'   && <Assets       {...screenProps}/>}
        {tab === 'settings' && <Settings     dark={dark}/>}
      </main>

      {/* FAB */}
      {showFab && (
        <button onClick={fabAction} style={{
          position: 'absolute',
          right: 20,
          bottom: 'calc(env(safe-area-inset-bottom) + 72px)',
          width: 52,
          height: 52,
          borderRadius: 16,
          border: 'none',
          background: t.text,
          color: t.bg,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 20,
        }}>
          <Icon name="plus" size={22} color={t.bg} weight={2.5}/>
        </button>
      )}

      {/* Bottom tab bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: `0.5px solid ${t.divider}`,
        background: dark ? 'rgba(10,10,11,0.92)' : 'rgba(250,248,244,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        paddingTop: 8,
        flexShrink: 0,
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '4px 20px',
            cursor: 'pointer',
            color: n.id === tab ? t.text : t.textTertiary,
            fontFamily: 'inherit',
          }}>
            <Icon name={n.icon} size={22} color={n.id === tab ? t.accent : t.textTertiary} weight={n.id === tab ? 2.2 : 1.6}/>
            <span style={{ fontSize: 10, fontWeight: n.id === tab ? 600 : 400, color: n.id === tab ? t.accent : t.textTertiary }}>
              {n.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Modals */}
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

function ModalOverlay({ t, onClose, children }: { t: Tokens; onClose: () => void; children: ReactNode }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      animation: 'fadeIn 0.15s ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: 430,
        margin: '0 auto',
        maxHeight: '92dvh',
        overflowY: 'auto',
        background: t.bg,
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.25s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(128,128,128,0.3)' }}/>
        </div>
        {children}
      </div>
    </div>
  )
}
