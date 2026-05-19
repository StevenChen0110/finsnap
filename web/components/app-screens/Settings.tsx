'use client'
import { useState } from 'react'
import { useApp } from '../../lib/context'
import { T } from '../design/tokens'
import Icon from '../ui/Icon'

interface Props { dark: boolean }

export default function Settings({ dark }: Props) {
  const t = T(dark, 'soft')
  const { settings, updateSettings, transactions, accounts } = useApp()
  const [budgetInput, setBudgetInput] = useState(String(settings.budget))
  const [saved, setSaved] = useState(false)

  const saveBudget = () => {
    const v = parseInt(budgetInput.replace(/,/g, ''), 10)
    if (!isNaN(v) && v > 0) {
      updateSettings({ budget: v })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  const handleReset = () => {
    if (confirm('確定要清除所有資料嗎？此操作無法復原。')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div style={{ maxWidth: 520, padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>設定</div>
      </div>

      {/* AI Status */}
      <div style={{ padding: '20px 28px 0' }}>
        <div style={{ background: t.card, border: t.cardBorder || undefined, borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: t.aiGradient, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="apple-intelligence" size={22} color="#fff"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>截圖 AI 辨識</div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 1 }}>Claude claude-haiku-4.5 · 裝置外推論</div>
          </div>
          <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 10, background: 'color-mix(in oklch,oklch(0.62 0.13 155) 15%,transparent)', color: 'oklch(0.5 0.13 155)', fontWeight: 600 }}>啟用中</div>
        </div>
      </div>

      {/* Budget */}
      <Section t={t} title="預算">
        <SettingsRow t={t} label="每月預算" icon="wallet">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: t.textSecondary }}>NT$</span>
            <input
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              onBlur={saveBudget}
              onKeyDown={e => e.key === 'Enter' && saveBudget()}
              style={{ width: 100, background: 'none', border: 'none', borderBottom: `1px solid ${t.divider}`, fontFamily: 'inherit', fontSize: 15, fontWeight: 500, color: t.text, textAlign: 'right', padding: '2px 0', outline: 'none', fontVariantNumeric: 'tabular-nums' }}
            />
            {saved && <Icon name="check" size={14} color={t.systemGreen} weight={2.5}/>}
          </div>
        </SettingsRow>
      </Section>

      {/* Appearance */}
      <Section t={t} title="外觀">
        <SettingsRow t={t} label="深色模式" icon="wand">
          <button onClick={() => updateSettings({ theme: dark ? 'light' : 'dark' })} style={{ width: 44, height: 26, borderRadius: 13, border: 'none', background: dark ? t.accent : t.divider, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: 3, left: dark ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
          </button>
        </SettingsRow>
      </Section>

      {/* Data stats */}
      <Section t={t} title="資料">
        <SettingsRow t={t} label="交易筆數" icon="list">
          <span style={{ fontSize: 14, color: t.textSecondary }}>{transactions.length} 筆</span>
        </SettingsRow>
        <SettingsRow t={t} label="帳戶數量" icon="wallet">
          <span style={{ fontSize: 14, color: t.textSecondary }}>{accounts.length} 個</span>
        </SettingsRow>
        <SettingsRow t={t} label="儲存方式" icon="shield">
          <span style={{ fontSize: 14, color: t.textSecondary }}>本機 localStorage</span>
        </SettingsRow>
        <div style={{ padding: '12px 0', borderTop: `0.5px solid ${t.divider}` }}>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'oklch(0.55 0.13 30)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="trash" size={16} color="oklch(0.55 0.13 30)" weight={1.8}/>
            清除所有資料（重設）
          </button>
        </div>
      </Section>

      {/* About */}
      <Section t={t} title="關於">
        <SettingsRow t={t} label="版本">
          <span style={{ fontSize: 14, color: t.textSecondary }}>1.0.0</span>
        </SettingsRow>
        <SettingsRow t={t} label="設計理念">
          <span style={{ fontSize: 14, color: t.textSecondary }}>隱私優先 · 截圖驅動</span>
        </SettingsRow>
      </Section>

      <div style={{ padding: '24px 28px 0', textAlign: 'center', fontSize: 11, color: t.textTertiary, lineHeight: 1.8 }}>
        SnapFinance · 所有資料儲存在你的瀏覽器<br/>截圖上傳後僅用於 AI 辨識，不會留存
      </div>
    </div>
  )
}

function Section({ t, title, children }: { t: ReturnType<typeof T>; title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 28px 0' }}>
      <div style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  )
}

function SettingsRow({ t, label, icon, children }: { t: ReturnType<typeof T>; label: string; icon?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: `0.5px solid ${t.divider}` }}>
      {icon && <Icon name={icon} size={17} color={t.textSecondary} weight={1.8}/>}
      {!icon && <div style={{ width: 17 }}/>}
      <div style={{ flex: 1, fontSize: 15, color: t.text, fontWeight: 400 }}>{label}</div>
      {children}
    </div>
  )
}
