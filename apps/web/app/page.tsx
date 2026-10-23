'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  Video, Link as LinkIcon, ArrowRight, Copy, Check,
  ExternalLink, Shield, Zap, Users, Mic, Globe, Lock, PhoneOff,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundVignette } from '@/components/BackgroundVignette'

/* ─── Feature data ───────────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Zap,
    title: 'Zero Setup',
    desc: 'Click once, share a link. Your contact joins in seconds — no downloads, no installs, no accounts required.',
  },
  {
    Icon: Shield,
    title: 'Peer-to-Peer Encrypted',
    desc: 'Your video never touches a server. Direct WebRTC connection between you and your contact.',
  },
  {
    Icon: Users,
    title: 'Always Free',
    desc: 'No free tier limits, no paywalls. A fast, private video call whenever you need one.',
  },
]

const TRUST_BADGES = [
  { Icon: Lock,   label: 'End-to-end encrypted' },
  { Icon: Globe,  label: 'Works in any browser' },
  { Icon: Shield, label: 'No tracking' },
]

/* ─── Page ────────────────────────────────────────────────────────── */
export default function Home() {
  const router    = useRouter()
  const [joinValue, setJoinValue] = useState('')
  const [newRoomId, setNewRoomId] = useState<string | null>(null)
  const [copied,   setCopied]    = useState(false)

  function createRoom() {
    setNewRoomId(uuidv4())
  }

  function copyRoomLink() {
    if (!newRoomId) return
    navigator.clipboard.writeText(`${window.location.origin}/room/${newRoomId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2_000)
  }

  function startMeeting() {
    if (newRoomId) router.push(`/room/${newRoomId}`)
  }

  function joinRoom() {
    const trimmed = joinValue.trim()
    if (!trimmed) return
    const id = trimmed.startsWith('http') ? trimmed.split('/room/')[1] : trimmed
    if (id) router.push(`/room/${id}`)
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden font-sans"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <BackgroundVignette />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 md:px-10"
        style={{
          background: 'rgba(13,13,18,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <Video className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span
            className="font-semibold text-sm tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            zentro
          </span>
        </div>

        {/* Right meta */}
        <div className="ml-auto flex items-center gap-3">
          <span
            className="text-xs hidden sm:block"
            style={{ color: 'var(--text-muted)' }}
          >
            WebRTC · No account required
          </span>
          <div
            className="w-px h-4 hidden sm:block"
            style={{ background: 'var(--border-bright)' }}
          />
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.22)',
              color: 'var(--accent-bright)',
            }}
          >
            Free
          </span>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="min-h-screen flex items-center pt-14">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* Left: copy + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.22)',
                color: 'var(--accent-bright)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              No sign up · No servers · Peer-to-peer
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
                style={{ color: 'var(--text-primary)' }}
              >
                Video calls that
                <br />
                <span style={{ color: 'var(--accent-bright)' }}>just work.</span>
              </h1>
              <p
                className="text-base md:text-lg leading-relaxed max-w-md"
                style={{ color: 'var(--text-secondary)' }}
              >
                Instant peer-to-peer video. Share a link, your contact joins.
                No downloads, no accounts, no friction.
              </p>
            </div>

            {/* CTA area — animates between states */}
            <AnimatePresence mode="wait">
              {newRoomId ? (
                /* ── Room created state ── */
                <motion.div
                  key="room-created"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3 max-w-sm"
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Meeting ready — share the link
                  </p>

                  {/* Link row */}
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)]"
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border-bright)',
                    }}
                  >
                    <LinkIcon
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--accent-bright)' }}
                    />
                    <span
                      className="flex-1 text-xs truncate font-mono"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {typeof window !== 'undefined' ? window.location.origin : ''}/room/
                      {newRoomId.slice(0, 8)}…
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyRoomLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all shrink-0"
                      style={
                        copied
                          ? { background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }
                          : { background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.32)', color: 'var(--accent-bright)' }
                      }
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startMeeting}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
                      style={{ background: 'var(--accent)', boxShadow: '0 0 32px -8px var(--accent-glow)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Start Meeting
                    </motion.button>
                    <button
                      onClick={() => setNewRoomId(null)}
                      className="px-4 py-3.5 text-sm rounded-[var(--radius-md)] transition-colors"
                      style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ── Default state ── */
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  {/* Primary CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={createRoom}
                    className="flex items-center gap-3 px-7 py-4 text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
                    style={{ background: 'var(--accent)', boxShadow: '0 0 40px -8px var(--accent-glow)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
                  >
                    <Video className="w-4 h-4" />
                    New Meeting
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </motion.button>

                  {/* Join input */}
                  <div className="flex items-center gap-2 max-w-sm">
                    <div
                      className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] transition-shadow focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]"
                      style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
                    >
                      <LinkIcon
                        className="w-4 h-4 shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <input
                        value={joinValue}
                        onChange={(e) => setJoinValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                        placeholder="Enter code or link"
                        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[rgba(240,240,248,0.3)]"
                        style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-bright)' }}
                      />
                    </div>
                    <motion.button
                      whileHover={joinValue.trim() ? { scale: 1.04 } : {}}
                      whileTap={joinValue.trim() ? { scale: 0.96 } : {}}
                      onClick={joinRoom}
                      disabled={!joinValue.trim()}
                      className="px-5 py-2.5 text-sm font-medium rounded-[var(--radius-md)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', color: 'var(--text-secondary)' }}
                    >
                      Join
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {TRUST_BADGES.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Video call preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.15 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <VideoPreview />
          </motion.div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="relative z-10 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="p-6 rounded-[var(--radius-xl)]"
                style={{
                  background: 'rgba(19,21,32,0.65)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(124,58,237,0.14)',
                    border: '1px solid rgba(124,58,237,0.2)',
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
                </div>
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer line */}
          <p
            className="text-center text-xs mt-10"
            style={{ color: 'var(--text-muted)' }}
          >
            zentro — open-source, peer-to-peer video conferencing
          </p>
        </div>
      </section>
    </div>
  )
}

/* ─── Video call preview mockup (hero right column) ──────────────── */
function VideoPreview() {
  return (
    <div className="relative w-full max-w-[520px]">
      {/* Ambient glow */}
      <div
        className="absolute inset-8 rounded-[var(--radius-xl)] pointer-events-none"
        style={{ background: 'rgba(124,58,237,0.1)', filter: 'blur(48px)' }}
      />

      {/* Main call window */}
      <div
        className="gradient-border relative rounded-[var(--radius-xl)] overflow-hidden shadow-2xl"
        style={{ background: '#080810', aspectRatio: '16/11' }}
      >
        {/* Remote video placeholder — subtle gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #0c0d1a 0%, #14152a 45%, #0e0f1c 100%)',
          }}
        />

        {/* Remote participant */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold select-none"
              style={{
                background: 'rgba(124,58,237,0.2)',
                color: 'var(--accent-bright)',
                border: '2px solid rgba(124,58,237,0.28)',
              }}
            >
              AJ
            </div>
          </motion.div>
        </div>

        {/* Remote name chip */}
        <div
          className="absolute bottom-16 left-4 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium"
          style={{
            background: 'rgba(13,13,18,0.78)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-bright)',
            color: 'var(--text-primary)',
          }}
        >
          Alex Johnson
        </div>

        {/* PIP — local video */}
        <div
          className="gradient-border absolute bottom-16 right-3 w-28 h-[78px] rounded-[var(--radius-md)] overflow-hidden shadow-xl"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1d2e 0%, #131520 100%)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold select-none"
              style={{ background: 'rgba(124,58,237,0.22)', color: 'var(--accent-bright)' }}
            >
              Me
            </div>
          </div>
          <div
            className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{
              background: 'rgba(13,13,18,0.75)',
              color: 'var(--text-muted)',
            }}
          >
            You
          </div>
        </div>

        {/* Bottom control bar mockup */}
        <div
          className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center gap-2 px-4"
          style={{
            background: 'linear-gradient(to top, rgba(8,8,16,0.92) 0%, transparent 100%)',
          }}
        >
          {/* Mic button */}
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{
              background: 'rgba(26,29,46,0.9)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <Mic className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </div>
          {/* Cam button */}
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{
              background: 'rgba(26,29,46,0.9)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <Video className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </div>
          {/* Spacer */}
          <div className="w-px h-4 mx-1" style={{ background: 'var(--border-bright)' }} />
          {/* End call */}
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{ background: 'var(--danger)' }}
          >
            <PhoneOff className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Live badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)]"
          style={{
            background: 'rgba(13,13,18,0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span
            className="text-[9px] font-semibold tracking-widest"
            style={{ color: 'var(--text-secondary)' }}
          >
            LIVE
          </span>
        </div>

        {/* Duration chip */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-[var(--radius-sm)]"
          style={{
            background: 'rgba(13,13,18,0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            className="text-[9px] font-mono font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            04:32
          </span>
        </div>
      </div>

      {/* Floating feature callouts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -bottom-4 -left-4 px-3 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2.5 shadow-xl"
        style={{
          background: 'rgba(19,21,32,0.95)',
          border: '1px solid var(--border-bright)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(74,222,128,0.15)' }}
        >
          <Shield className="w-3.5 h-3.5 text-green-400" />
        </div>
        <div>
          <p className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            End-to-end encrypted
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            Direct P2P connection
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="absolute -top-4 -right-4 px-3 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2.5 shadow-xl"
        style={{
          background: 'rgba(19,21,32,0.95)',
          border: '1px solid var(--border-bright)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124,58,237,0.18)' }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
        </div>
        <div>
          <p className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            No downloads needed
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            Works in any browser
          </p>
        </div>
      </motion.div>
    </div>
  )
}
