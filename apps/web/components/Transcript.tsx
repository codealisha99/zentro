'use client'

import { useRef, useEffect } from 'react'
import type { TranscriptSegment } from '@/lib/types'

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
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <span className="animate-spin">⟳</span>
        Transcribing...
      </div>
    )
  }

  if (segments.length === 0) return null

  return (
    <div className="overflow-y-auto max-h-48 rounded-lg bg-gray-900 p-3 space-y-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Transcript</p>
      {segments.map((seg, i) => {
        const isActive = currentTime >= seg.start && currentTime < seg.end
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            className={`flex gap-3 text-sm font-mono transition-colors ${
              isActive ? 'text-white' : 'text-gray-400'
            }`}
          >
            <span className="text-gray-600 shrink-0">{formatTime(seg.start)}</span>
            <span>{seg.text}</span>
          </div>
        )
      })}
    </div>
  )
}
