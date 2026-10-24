'use client'

import { useRef, useEffect } from 'react'
import type { TranscriptSegment } from '@/lib/types'
import { Loader2 } from 'lucide-react'

type Props = {
  segments: TranscriptSegment[]
  currentTime?: number
  isLoading?: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function Transcript({ segments, currentTime = 0, isLoading = false }: Props) {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [currentTime])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-bright)' }} />
        Transcribing…
      </div>
    )
  }

  if (segments.length === 0) return null

  return (
    <div
      className="overflow-y-auto max-h-44 rounded-[var(--radius-md)] p-3.5 space-y-1.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--text-muted)' }}>
        Transcript
      </p>
      {segments.map((seg, i) => {
        const isActive = currentTime >= seg.start && currentTime < seg.end
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            className={`flex gap-3 text-[13px] leading-relaxed transition-colors ${
              isActive ? 'font-medium' : ''
            }`}
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <span
              className="font-mono shrink-0 tabular-nums pt-0.5"
              style={{ color: isActive ? 'var(--accent-bright)' : 'var(--text-muted)', fontSize: 11 }}
            >
              {formatTime(seg.start)}
            </span>
            <span>{seg.text}</span>
          </div>
        )
      })}
    </div>
  )
}
