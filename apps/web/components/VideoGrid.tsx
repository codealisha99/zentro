'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { User, Wifi } from 'lucide-react'
import { MicOff, VideoOff } from 'lucide-react'

type Props = {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerJoined?: boolean
  localName?: string
  remoteName?: string | null
  localIsScreenSharing?: boolean
  remoteAudioMuted?: boolean
  remoteVideoOff?: boolean
}

export function VideoGrid({
  localStream,
  remoteStream,
  peerJoined = false,
  localName,
  remoteName,
  localIsScreenSharing = false,
  remoteAudioMuted = false,
  remoteVideoOff = false,
}: Props) {
  const localRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()

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
  const showLocalPreview = peerJoined || hasRemote || localIsScreenSharing

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-[var(--radius-xl)] flex items-center justify-center"
      style={{ background: '#080810', boxShadow: 'var(--shadow-xl)' }}
    >
      {/* Subtle grid texture on empty/pre-call states */}
      {!hasRemote && <div className="bg-grid absolute inset-0 pointer-events-none" aria-hidden="true" />}

      {/* No mode="wait" — entering element mounts immediately alongside
          the exiting one, so the ref is assigned before the effect window closes. */}
      <AnimatePresence>
        {hasRemote ? (
          <motion.div
            key="remote-video"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
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
                className="absolute bottom-4 left-4 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-2"
                style={{
                  background: 'rgba(10,10,16,0.72)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--text-primary)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--success)' }} />
                {remoteName}
                {remoteVideoOff && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
                    style={{ background: 'rgba(240,71,95,0.14)', color: 'var(--danger)' }}
                  >
                    <VideoOff className="w-3 h-3" /> Cam off
                  </span>
                )}
                {remoteAudioMuted && !remoteVideoOff && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
                    style={{ background: 'rgba(240,71,95,0.14)', color: 'var(--danger)' }}
                  >
                    <MicOff className="w-3 h-3" /> Muted
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ) : peerJoined ? (
          <motion.div
            key="connecting-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-0 flex flex-col items-center justify-center gap-5"
          >
            {/* Radar ripple */}
            <div className="relative flex items-center justify-center w-20 h-20">
              {!shouldReduceMotion && (
                <>
                  <span
                    className="radar-dot absolute inset-0 rounded-full"
                    style={{ border: '1.5px solid rgba(155,123,255,0.4)' }}
                  />
                  <span
                    className="radar-dot radar-dot-delayed absolute inset-0 rounded-full"
                    style={{ border: '1.5px solid rgba(155,123,255,0.25)' }}
                  />
                </>
              )}
              <div
                className="w-14 h-14 rounded-full z-10 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(124,92,252,0.06))',
                  border: '1px solid rgba(155,123,255,0.35)',
                }}
              >
                <Wifi className="w-5 h-5" style={{ color: 'var(--accent-bright)' }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Connecting…
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Establishing peer connection
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="waiting-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-0 flex flex-col items-center justify-center gap-5"
          >
            <div className="relative flex items-center justify-center w-24 h-24">
              {!shouldReduceMotion && (
                <span
                  className="radar-dot absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(155,123,255,0.2)' }}
                />
              )}
              <div
                className="w-20 h-20 rounded-full z-10 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,92,252,0.14), rgba(255,255,255,0.02))',
                  border: '1px solid var(--border-bright)',
                }}
              >
                <User className="w-9 h-9" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div className="text-center max-w-56">
              <p
                className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                Waiting for peer…
              </p>
              {remoteName === null && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)', opacity: 0.65 }}>
                  Share the invite link to bring someone in
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The local preview becomes a corner tile during a call or screen share. */}
      <motion.div
        layout={!shouldReduceMotion}
        initial={false}
        transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
        className={`gradient-border absolute overflow-hidden z-10 motion-safe:transition-[width,height,border-radius] motion-safe:duration-300 motion-safe:ease-in-out ${
          showLocalPreview
            ? `right-3 sm:right-5 ${localIsScreenSharing ? 'top-3 sm:top-5' : 'bottom-24 sm:bottom-5'} w-[clamp(8rem,22vw,18rem)] aspect-video rounded-[var(--radius-md)]`
            : 'inset-0 rounded-[var(--radius-xl)]'
        }`}
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}
      >
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full ${localIsScreenSharing ? 'object-contain' : 'object-cover scale-x-[-1]'}`}
        />
        {!localStream && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 backdrop-blur-sm text-xs font-medium"
            style={{ background: 'rgba(25,28,43,0.85)', color: 'var(--text-muted)' }}
          >
            <User className="w-5 h-5" aria-hidden="true" />
            No camera
          </div>
        )}
        {localName && showLocalPreview && (
          <div
            className="absolute bottom-1.5 left-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-[var(--radius-sm)] leading-tight"
            style={{
              background: 'rgba(10,10,16,0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          >
            {localName} (You)
          </div>
        )}
        {localName && !showLocalPreview && (
          <div
            className="absolute bottom-4 left-4 text-xs font-medium px-2.5 py-1 rounded-[var(--radius-sm)] flex items-center gap-2"
            style={{
              background: 'rgba(10,10,16,0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          >
            {localName} <span style={{ color: 'var(--text-muted)' }}>(You)</span>
          </div>
        )}
        {localStream && !localStream.getVideoTracks()[0]?.enabled && !localIsScreenSharing && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wide"
            style={{ background: 'rgba(240,71,95,0.18)', color: 'var(--danger-bright)' }}
          >
            <MicOff className="w-2.5 h-2.5" aria-hidden="true" />
            Cam off
          </div>
        )}
      </motion.div>
    </div>
  )
}
