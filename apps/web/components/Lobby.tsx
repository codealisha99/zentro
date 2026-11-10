'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, User, Link as LinkIcon, Loader2, Check, Camera, Copy } from 'lucide-react'
import { BackgroundVignette } from './BackgroundVignette'

type Props = {
  roomId: string
  localStream: MediaStream | null
  audioMuted: boolean
  videoMuted: boolean
  onJoin: (name: string) => void
  onToggleAudio: () => void
  onToggleVideo: () => void
}

const STORAGE_KEY = 'zentro-display-name'

export function Lobby({
  roomId,
  localStream,
  audioMuted,
  videoMuted,
  onJoin,
  onToggleAudio,
  onToggleVideo,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setName(saved)
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleJoin() {
    const trimmed = name.trim()
    if (!trimmed || isJoining) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setIsJoining(true)
    onJoin(trimmed)
  }

  function handleCopyLink() {
    const link = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden selection:bg-[var(--accent-soft)]" style={{ background: 'var(--bg)' }}>
      <BackgroundVignette />

      {/* Blueprint grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 w-full max-w-5xl mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
          >
            <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            zentro
          </span>
          <span className="mono-label text-[9px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            — direct line
          </span>
        </div>
        {name.trim() && (
          <span
            className="mono-label text-[9px] hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', color: 'var(--text-muted)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Showing up as <span style={{ color: 'var(--text-primary)' }}>{name.trim()}</span>
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-10 items-center">

        {/* Camera preview panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 flex flex-col items-center gap-5 w-full max-w-lg"
        >
          <div
            className="gradient-border relative w-full aspect-video overflow-hidden rounded-[var(--radius-xl)]"
            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* corner ticks */}
            <span
              className="absolute top-2 left-2 w-3 h-3 border-t border-l pointer-events-none"
              style={{ borderColor: 'rgba(244,241,232,0.3)' }}
            />
            <span
              className="absolute bottom-2 right-2 w-3 h-3 border-b border-r pointer-events-none"
              style={{ borderColor: 'rgba(244,241,232,0.3)' }}
            />

            {localStream && !videoMuted ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'var(--surface)' }}>
                {initials ? (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(244,241,232,0.12), rgba(244,241,232,0.04))',
                      color: 'var(--paper)',
                      border: '1px solid var(--border-bright)',
                    }}
                  >
                    {initials}
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
                  >
                    <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                {videoMuted && (
                  <span
                    className="flex items-center gap-1.5 mono-label text-[9px] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(229,72,77,0.12)', color: 'var(--danger-bright)', border: '1px solid rgba(229,72,77,0.3)' }}
                  >
                    <VideoOff className="w-3 h-3" />
                    CAM OFF
                  </span>
                )}
              </div>
            )}

            {name.trim() && (
              <div
                className="absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1.5 rounded-[var(--radius-sm)] flex items-center gap-1.5"
                style={{
                  background: 'rgba(11,12,14,0.78)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--text-primary)',
                }}
              >
                {name.trim()}
                <span style={{ color: 'var(--text-muted)' }}>(You)</span>
              </div>
            )}

            {audioMuted ? (
              <div
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] mono-label text-[9px]"
                style={{
                  background: 'rgba(11,12,14,0.78)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(229,72,77,0.3)',
                  color: 'var(--danger-bright)',
                }}
              >
                <MicOff className="w-3.5 h-3.5" />
                MUTED
              </div>
            ) : localStream ? (
              <div
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] mono-label text-[9px]"
                style={{
                  background: 'rgba(11,12,14,0.78)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0,220,130,0.28)',
                  color: 'var(--accent-bright)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full rec-blink" style={{ background: 'var(--accent)' }} />
                CAMERA LIVE
              </div>
            ) : null}
          </div>

          {/* Mic / Camera toggles */}
          <div className="flex items-center gap-3">
            <TogglePill
              onClick={onToggleAudio}
              muted={audioMuted}
              label={audioMuted ? 'Unmute microphone' : 'Mute microphone'}
              icon={audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              badge={audioMuted ? 'Muted' : 'Mic on'}
            />
            <TogglePill
              onClick={onToggleVideo}
              muted={videoMuted}
              label={videoMuted ? 'Turn on camera' : 'Turn off camera'}
              icon={videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              badge={videoMuted ? 'Cam off' : 'Cam on'}
            />
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="gradient-border flex flex-col gap-7 w-full max-w-xs p-7 rounded-[var(--radius-lg)]"
          style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-xl)' }}
        >
          <div>
            <p className="mono-label text-[9px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {greeting}
            </p>
            <h1 className="font-display text-[1.7rem] font-bold mb-2 tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              Ready to join?
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Enter your name so others know who you are.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="display-name" className="mono-label block text-[9px] mb-2" style={{ color: 'var(--text-muted)' }}>
                Your name
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-[var(--radius-md)] transition-all focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
              >
                <User className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="e.g. Alex"
                  autoFocus
                  maxLength={40}
                  autoComplete="name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[rgba(244,241,232,0.26)]"
                  style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-bright)' }}
                />
              </div>
            </div>

            <motion.button
              whileHover={name.trim() && !isJoining ? { scale: 1.02 } : {}}
              whileTap={name.trim() && !isJoining ? { scale: 0.97 } : {}}
              onClick={handleJoin}
              disabled={!name.trim() || isJoining}
              className="cta-shine w-full py-3.5 font-semibold text-sm transition-all rounded-[var(--radius-md)] flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ background: 'var(--paper)', color: 'var(--ink)' }}
              onMouseEnter={(e) => {
                if (!isJoining) { e.currentTarget.style.background = 'var(--accent-bright)'; e.currentTarget.style.color = 'var(--ink)' }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--paper)'
              }}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  Enter meeting
                </>
              )}
            </motion.button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="mono-label text-[9px]" style={{ color: 'var(--text-muted)' }}>Meeting ID</span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded-md"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface-hover)' }}
              >
                {roomId.slice(0, 8)}…
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all rounded-[var(--radius-md)] ${
                copied ? '' : 'hover:-translate-y-px'
              }`}
              style={
                copied
                  ? { background: 'var(--accent-soft)', border: '1px solid rgba(0,220,130,0.3)', color: 'var(--accent-bright)' }
                  : { background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', color: 'var(--text-secondary)' }
              }
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.borderColor = 'rgba(244,241,232,0.3)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.borderColor = 'var(--border-bright)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link copied!' : 'Copy invite link'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer note */}
      <p className="relative z-10 mt-10 mono-label text-[9px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <Camera className="w-3 h-3" aria-hidden="true" />
        Your camera only turns on in the meeting — nothing is recorded here
      </p>
    </div>
  )
}

/* ── Toggle pill (mic/cam) ── */
function TogglePill({
  onClick,
  muted,
  label,
  icon,
  badge,
}: {
  onClick: () => void
  muted: boolean
  label: string
  icon: React.ReactNode
  badge: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="group relative flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-full transition-all"
      style={
        muted
          ? { background: 'rgba(229,72,77,0.1)', border: '1px solid rgba(229,72,77,0.3)' }
          : { background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', boxShadow: 'var(--shadow-md)' }
      }
      title={label}
      aria-label={label}
      aria-pressed={!muted}
    >
      <span className={muted ? 'text-[var(--danger-bright)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors'}>
        {icon}
      </span>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
        style={
          muted
            ? { color: 'var(--danger-bright)', background: 'transparent' }
            : { color: 'var(--text-secondary)', background: 'rgba(244,241,232,0.05)' }
        }
      >
        {badge}
      </span>
    </motion.button>
  )
}
