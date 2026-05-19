'use client'
import { useState, useRef, useCallback } from 'react'
import { T } from '../design/tokens'
import Icon from '../ui/Icon'

interface Props {
  dark: boolean
  onClose: () => void
  onDone: (data: Record<string, string>) => void
}

type Stage = 'upload' | 'analyzing' | 'done' | 'error'

const STEPS = ['辨識文字', '判斷類型', '提取金額', '建議分類']
const STEP_THRESHOLDS = [25, 50, 75, 95]

export default function OcrModal({ dark, onClose, onDone }: Props) {
  const t = T(dark, 'soft')
  const [stage, setStage]       = useState<Stage>('upload')
  const [preview, setPreview]   = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState<Record<string, string> | null>(null)
  const [errMsg, setErrMsg]     = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setErrMsg('請選擇圖片檔案'); return }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setStage('analyzing')
      setProgress(0)

      // Animate progress
      const start = Date.now()
      const total = 3000
      const tick = () => {
        const p = Math.min(100, Math.round(((Date.now() - start) / total) * 95))
        setProgress(p)
        if (p < 95) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      try {
        const base64 = dataUrl.split(',')[1]
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        })
        const data = await res.json() as Record<string, string>
        setProgress(100)
        if (data.error) throw new Error(String(data.error))
        setResult(data)
        setStage('done')
      } catch (err) {
        setErrMsg(err instanceof Error ? err.message : '辨識失敗，請重試')
        setStage('error')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFile = (files: FileList | null) => {
    if (files?.[0]) processFile(files[0])
  }

  const handleUseResult = () => {
    if (result) {
      const prefill: Record<string, string> = {
        amount: String(result.amount ?? ''),
        merchant: String(result.merchant ?? ''),
        date: String(result.date ?? ''),
        time: String(result.time ?? ''),
        account: String(result.account ?? ''),
        category: String(result.category ?? ''),
        transactionType: String(result.transactionType ?? 'expense'),
      }
      onDone(prefill)
    }
  }

  return (
    <div style={{ padding: '0 0 8px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.accent, fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', padding: 0 }}>取消</button>
        <span style={{ fontSize: 17, fontWeight: 600, color: t.text }}>截圖記帳</span>
        <div style={{ width: 40 }}/>
      </div>

      {stage === 'upload' && (
        <div style={{ padding: '8px 20px 20px' }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files) }}
            onClick={() => inputRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? t.accent : t.divider}`, borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? `color-mix(in oklch,${t.accent} 6%,transparent)` : 'transparent', transition: 'all 0.15s' }}
          >
            <Icon name="upload" size={36} color={dragOver ? t.accent : t.textTertiary} weight={1.5}/>
            <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600, color: t.text }}>拖曳截圖到這裡</div>
            <div style={{ marginTop: 6, fontSize: 14, color: t.textSecondary }}>或點擊選擇圖片</div>
            <div style={{ marginTop: 4, fontSize: 12, color: t.textTertiary }}>支援 JPG、PNG、WEBP</div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files)}/>
          <div style={{ marginTop: 16, padding: '12px 14px', background: `color-mix(in oklch,${t.accent} 8%,transparent)`, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: t.aiGradient, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="apple-intelligence" size={12} color="#fff"/>
              </div>
              <div style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>上傳信用卡通知、銀行帳戶、或 LINE Pay 截圖，AI 會自動辨識並填入交易資訊</div>
            </div>
          </div>
        </div>
      )}

      {stage === 'analyzing' && preview && (
        <div style={{ padding: '8px 20px 24px' }}>
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', maxHeight: 200, display: 'flex', justifyContent: 'center', background: dark ? '#000' : '#f5f5f5' }}>
            <img src={preview} alt="截圖" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', display: 'block' }}/>
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${progress * 0.8}%`, height: 2, background: `linear-gradient(90deg,transparent,${t.accent},transparent)`, boxShadow: `0 0 10px ${t.accent}`, transition: 'top 0.3s ease-out' }}/>
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: t.aiGradient, display: 'grid', placeItems: 'center' }}>
              <Icon name="apple-intelligence" size={14} color="#fff"/>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>AI 分析中 {progress}%</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20 }}>
            {STEPS.map((s, i) => {
              const done = progress >= STEP_THRESHOLDS[i]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: done ? 1 : 0.35, transition: 'opacity 0.3s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: done ? t.accent : 'transparent', border: done ? 'none' : `1.5px solid ${t.textTertiary}`, display: 'grid', placeItems: 'center' }}>
                    {done && <Icon name="check" size={11} color="#fff" weight={2.5}/>}
                  </div>
                  <span style={{ fontSize: 14, color: done ? t.text : t.textSecondary }}>{s}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stage === 'done' && result && (
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ background: t.card, border: t.cardBorder || undefined, borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: t.aiGradient, display: 'grid', placeItems: 'center' }}>
                <Icon name="apple-intelligence" size={9} color="#fff"/>
              </div>
              <span style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>AI 辨識結果</span>
              {result.confidence && (
                <span style={{ fontSize: 11, color: t.systemGreen, marginLeft: 'auto' }}>信心 {Math.round(Number(result.confidence) * 100)}%</span>
              )}
            </div>
            {[
              ['金額', result.amount ? `NT$ ${Number(result.amount).toLocaleString()}` : '—'],
              ['商家', result.merchant || '—'],
              ['類型', result.transactionType === 'income' ? '收入' : '支出'],
              ['分類', result.category || '—'],
              ['日期', result.date || '—'],
              ['帳戶', result.account || '—'],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: 'flex', padding: '8px 0', borderTop: i === 0 ? 'none' : `0.5px solid ${t.divider}` }}>
                <span style={{ width: 56, fontSize: 13, color: t.textSecondary }}>{label}</span>
                <span style={{ flex: 1, fontSize: 14, color: t.text, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={handleUseResult} style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', background: t.text, color: t.bg, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            使用此結果 →
          </button>
          <button onClick={() => setStage('upload')} style={{ width: '100%', height: 40, borderRadius: 12, border: 'none', background: 'none', color: t.textSecondary, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
            重新上傳
          </button>
        </div>
      )}

      {stage === 'error' && (
        <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
          <Icon name="xmark" size={40} color="oklch(0.55 0.13 30)" weight={1.5}/>
          <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600, color: t.text }}>辨識失敗</div>
          <div style={{ marginTop: 6, fontSize: 14, color: t.textSecondary }}>{errMsg}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: t.textTertiary }}>請確認已設定 ANTHROPIC_API_KEY</div>
          <button onClick={() => setStage('upload')} style={{ marginTop: 20, height: 44, padding: '0 24px', borderRadius: 12, border: 'none', background: t.text, color: t.bg, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            重試
          </button>
        </div>
      )}
    </div>
  )
}
