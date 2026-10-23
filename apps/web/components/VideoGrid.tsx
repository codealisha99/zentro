'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'

type Props = {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerJoined?: boolean
  localName?: string
  remoteName?: string | null
}

export function VideoGrid({
  localStream,
  remoteStream,
  peerJoined = false,
  localName,
  remoteName,
}: Props) {
  const localRef = useRef<HTMLVideoElement>(null)

  // Local stream never unmounts so a plain useEffect is fine.
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream
    }
  }, [localStream])

  // Remote video lives inside AnimatePresence, which delays mounting the
  // entering element until the exiting element's animation finishes.
  // That means remoteRef.current is null when useEffect([remoteStream]) fires,
  // so srcObject is never assigned and the video stays black.
  //
  // Callback refs fire at the moment the element actually mounts, and are
  // re-created (and therefore re-fired) whenever remoteStream changes, so
  // they correctly cover both cases: element mounts with an existing stream,
  // and stream changes while element is mounted.
  const remoteRefCallback = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && remoteStream) {
        el.srcObject = remoteStream
        el.play().catch(() => {})
      }
    },
    [remoteStream],
  )

  const hasRemote = !!remoteStream

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-[var(--radius-xl)] flex items-center justify-center shadow-2xl"
      style={{ background: '#080810' }}
    >
      {/* No mode="wait" — entering element mounts immediately alongside
          the exiting one, so the ref is assigned before the effect window closes. */}
      <AnimatePresence>
        {hasRemote ? (
          <motion.div
            key="remote-video"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <video
              ref={remoteRefCallback}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {remoteName && (
              <div
                className="absolute bottom-4 left-4 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)]"
                style={{
                  background: 'rgba(13,13,18,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--text-primary)',
                }}
              >
                {remoteName}
              </div>
            )}
          </motion.div>
        ) : peerJoined ? (
          <motion.div
            key="connecting-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-0 flex flex-col items-center justify-center gap-3"
          >
            <div
              className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{
                borderColor: 'rgba(124,58,237,0.3)',
                borderTopColor: 'var(--accent)',
              }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Connecting…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="waiting-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-0 flex flex-col items-center justify-center gap-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <User className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p
              className="text-sm font-medium tracking-wide uppercase z-20"
              style={{ color: 'var(--text-muted)' }}
            >
              Waiting for peer…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIP / solo local video */}
      <motion.div
        layout
        initial={false}
        animate={
          hasRemote
            ? { width: 160, height: 120, bottom: 24, right: 24, borderRadius: 12 }
            : { width: '100%', height: '100%', bottom: 0, right: 0, borderRadius: 22 }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="gradient-border absolute overflow-hidden shadow-2xl z-10"
        style={{ background: 'var(--surface)' }}
      >
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        {!localStream && (
          <div
            className="absolute inset-0 flex items-center justify-center backdrop-blur-sm text-xs font-medium"
            style={{ background: 'rgba(26,29,46,0.8)', color: 'var(--text-muted)' }}
          >
            No camera
          </div>
        )}
        {localName && hasRemote && (
          <div
            className="absolute bottom-1.5 left-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-[var(--radius-sm)] leading-tight"
            style={{
              background: 'rgba(13,13,18,0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          >
            {localName} (You)
          </div>
        )}
        {localName && !hasRemote && (
          <div
            className="absolute bottom-4 left-4 text-xs font-medium px-2.5 py-1 rounded-[var(--radius-sm)]"
            style={{
              background: 'rgba(13,13,18,0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          >
            {localName} (You)
          </div>
        )}
      </motion.div>
    </div>
  )
}
