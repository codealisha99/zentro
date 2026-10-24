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

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

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
    setGreeting(getTimeGreeting())
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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 selection:bg-[var(--accent-soft)] overflow-hidden" style={{ background: 'var(--bg)' }}>
      <BackgroundVignette />

      {/* Ambient aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-grid absolute inset-0" />
        <div
          className="aurora absolute left-1/2 -translate-x-1/2 -top-52 h-[480px] w-[720px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(124,92,252,0.12) 0%, transparent 65%)' }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 w-full max-w-5xl mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]"
            style={{
              background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(124,92,252,0.08))',
              border: '1px solid rgba(155,123,255,0.35)',
              boxShadow: '0 0 18px -4px rgba(124,92,252,0.35)',
            }}
          >
            <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            zentro
          </span>
        </div>
        {name.trim() && (
          <span className="text-xs hidden sm:flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
            Signed in as <span style={{ color: 'var(--text-secondary)' }}>{name.trim()}</span>
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
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124,92,252,0.85), rgba(226,180,255,0.35))',
                      color: '#fff',
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
                    className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(240,71,95,0.1)', color: 'var(--danger-bright)' }}
                  >
                    <VideoOff className="w-3 h-3" />
                    Camera off
                  </span>
                )}
              </div>
            )}

            {name.trim() && (
              <div
                className="absolute bottom-3 left-3 text-white text-xs font-medium px-2.5 py-1.5 rounded-[var(--radius-sm)] flex items-center gap-1.5"
                style={{
                  background: 'rgba(10,10,16,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-bright)',
                }}
              >
                {name.trim()}
                <span style={{ color: 'var(--text-muted)' }}>(You)</span>
              </div>
            )}

            {audioMuted ? (
              <div
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium"
                style={{
                  background: 'rgba(240,71,95,0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(240,71,95,0.3)',
                  color: 'var(--danger-bright)',
                }}
              >
                <MicOff className="w-3.5 h-3.5" />
                Muted
              </div>
            ) : localStream ? (
              <div
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-semibold tracking-wide uppercase"
                style={{
                  background: 'rgba(52,211,153,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  color: 'var(--success)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full rec-blink" style={{ background: 'var(--success)' }} />
                Camera live
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
              badge={audioMuted ? 'Mic off' : 'Mic on'}
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
          style={{ background: 'rgba(18,20,31,0.92)', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-xl)' }}
        >
          <div>
            <p className="text-sm mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              {greeting}
              <span aria-hidden="true">👋</span>
            </p>
            <h1
              className="text-[1.7rem] font-bold mb-2 tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Ready to join?
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Enter your name so others know who you are.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="display-name"
                className="block text-[10px] font-semibold mb-2 uppercase tracking-[0.15em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Your name
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-[var(--radius-md)] transition-all focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                }}
              >
                <User className="w-4 h-4 shrink-0 transition-colors" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="e.g. Alex"
                  autoFocus
                  maxLength={40}
                  autoComplete="name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[rgba(242,242,250,0.28)]"
                  style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-bright)' }}
                />
              </div>
            </div>

            <motion.button
              whileHover={name.trim() && !isJoining ? { scale: 1.02 } : {}}
              whileTap={name.trim() && !isJoining ? { scale: 0.97 } : {}}
              onClick={handleJoin}
              disabled={!name.trim() || isJoining}
              className="cta-shine w-full py-3.5 font-semibold text-white text-sm transition-all rounded-[var(--radius-md)] flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 28px -6px var(--accent-glow)',
              }}
              onMouseEnter={(e) => {
                if (!isJoining) e.currentTarget.style.background = 'var(--accent-bright)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent)'
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
            <div className="flex items-center justify-between gap-2 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Meeting ID</span>
              <span
                className="font-mono px-2 py-0.5 rounded-md"
                style={{ color: 'var(--text-secondary)', background: 'var(--accent-soft)' }}
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
                  ? { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: 'var(--success)' }
                  : { background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
              }
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.borderColor = 'var(--border-bright)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.borderColor = 'var(--border)'
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
      <p className="relative z-10 mt-10 text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
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
          ? { background: 'rgba(240,71,95,0.1)', border: '1px solid rgba(240,71,95,0.3)' }
          : { background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', boxShadow: 'var(--shadow-md)' }
      }
      title={label}
      aria-label={label}
      aria-pressed={!muted}
    >
      <span
        className={muted ? 'text-[var(--danger-bright)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors'}
      >
        {icon}
      </span>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
        style={
          muted
            ? { color: 'var(--danger-bright)', background: 'transparent' }
            : { color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }
        }
      >
        {badge}
      </span>
    </motion.button>
  )
}
