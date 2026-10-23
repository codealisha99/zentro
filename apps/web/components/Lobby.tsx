'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, User, Link as LinkIcon, Loader2 } from 'lucide-react'
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
}export function Lobby({
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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setName(saved)
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

  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setGreeting(getTimeGreeting())
  }, [])

  return (
    <div className="min-h-screen bg-[#0d0d12] flex flex-col items-center justify-center p-6 selection:bg-[var(--accent)]/30">
      <BackgroundVignette />

      {/* Logo */}
      <div className="relative z-10 w-full max-w-5xl mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)]"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
          >
            <Video className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            zentro
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-10 items-center">

        {/* Camera preview panel */}
        <div className="flex-1 flex flex-col items-center gap-5 w-full max-w-lg">
          <div
            className="gradient-border relative w-full aspect-video overflow-hidden shadow-2xl rounded-[var(--radius-xl)]"
            style={{ background: 'var(--surface)' }}
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
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                {initials ? (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                    style={{ background: 'rgba(124,58,237,0.7)' }}
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
              </div>
            )}

            {name.trim() && (
              <div
                className="absolute bottom-3 left-3 text-white text-xs font-medium px-2.5 py-1 rounded-[var(--radius-sm)]"
                style={{
                  background: 'rgba(13,13,18,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-bright)',
                }}
              >
                {name.trim()} (You)
              </div>
            )}

            {audioMuted && (
              <div
                className="absolute top-3 right-3 flex items-center gap-1.5 text-red-400 px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                <MicOff className="w-3.5 h-3.5" />
                Muted
              </div>
            )}
          </div>

          {/* Mic / Camera toggles */}
          <div className="flex gap-3">
            <button
              onClick={onToggleAudio}
              className={`w-11 h-11 flex items-center justify-center transition-all rounded-[var(--radius-md)] ${
                audioMuted
                  ? 'text-red-400'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={
                audioMuted
                  ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)' }
                  : { background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }
              }
              title={audioMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={onToggleVideo}
              className={`w-11 h-11 flex items-center justify-center transition-all rounded-[var(--radius-md)] ${
                videoMuted
                  ? 'text-red-400'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={
                videoMuted
                  ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)' }
                  : { background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }
              }
              title={videoMuted ? 'Turn on camera' : 'Turn off camera'}
            >
              {videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="gradient-border flex flex-col gap-7 w-full max-w-xs p-7 rounded-[var(--radius-xl)]"
          style={{ background: 'var(--surface)' }}
        >
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              {greeting}
            </p>
            <h1
              className="text-3xl font-bold mb-2 tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Ready to join?
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Enter your name so others know who you are.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block text-[10px] font-semibold mb-2 uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="e.g. Alex"
                autoFocus
                maxLength={40}
                className="w-full px-4 py-3 text-sm transition-all outline-none rounded-[var(--radius-md)]"
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-bright)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-bright)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <motion.button
              whileHover={name.trim() && !isJoining ? { scale: 1.02 } : {}}
              whileTap={name.trim() && !isJoining ? { scale: 0.98 } : {}}
              onClick={handleJoin}
              disabled={!name.trim() || isJoining}
              className="w-full py-3.5 font-semibold text-white text-sm transition-all rounded-[var(--radius-md)] flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
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
                'Join now'
              )}
            </motion.button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Meeting ID:</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                {roomId.slice(0, 8)}…
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all rounded-[var(--radius-md)] ${
                copied ? 'text-green-400' : ''
              }`}
              style={
                copied
                  ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }
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
              <LinkIcon className="w-3.5 h-3.5" />
              {copied ? 'Link copied!' : 'Copy invite link'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
