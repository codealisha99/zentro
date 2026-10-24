'use client'

import { useState, type ReactNode, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  Video, Link as LinkIcon, ArrowRight, Copy, Check, ExternalLink, Shield, Zap,
  Mic, Globe, Lock, PhoneOff, Plus, Sparkles, MonitorUp, MessageSquare,
  FileText, Infinity as InfinityIcon, ChevronDown, ArrowUp, MousePointerClick,
} from 'lucide-react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { BackgroundVignette } from '@/components/BackgroundVignette'

/* ─── Shared data ─────────────────────────────────────────────────── */
const TRUST_BADGES = [
  { Icon: Lock,   label: 'End-to-end encrypted' },
  { Icon: Globe,  label: 'Works in any browser' },
  { Icon: Shield, label: 'No tracking' },
]

const STATS = [
  { value: '~2s', label: 'to connect' },
  { value: '0',   label: 'accounts needed' },
  { value: 'P2P', label: 'direct video' },
]

const BENTO = [
  {
    Icon: Zap,
    title: 'Zero setup',
    desc: 'Click once, share a link. Your contact joins in seconds — no downloads, no installs, no accounts.',
    span: '',
  },
  {
    Icon: Shield,
    title: 'Encrypted by design',
    desc: 'Video and audio flow directly between browsers with DTLS-SRTP encryption. Never stored on a server.',
    span: '',
  },
  {
    Icon: Globe,
    title: 'Any browser',
    desc: 'Runs in every modern browser — desktop or mobile. Nothing to configure.',
    span: '',
  },
  {
    Icon: MonitorUp,
    title: 'Screen sharing',
    desc: 'Show docs, decks and dashboards mid-call with one click.',
    span: '',
  },
  {
    Icon: FileText,
    title: 'Live transcript + recording',
    desc: 'Record a call and get a searchable AI transcript the moment you hang up.',
    span: '',
  },
  {
    Icon: MessageSquare,
    title: 'In-call chat',
    desc: 'Drop links and quick notes without leaving the conversation.',
    span: '',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create a room',
    desc: 'One click makes a private room with a single link. No sign-up form between you and the call.',
  },
  {
    n: '02',
    title: 'Share the link',
    desc: 'Send it however you like — text, email, chat. Whoever opens it is in the room, and the room caps at two.',
  },
  {
    n: '03',
    title: 'Just talk',
    desc: 'The browsers connect directly to each other. Wrap up, hit end, close the tab. Nothing lingers.',
  },
]

const FAQS = [
  {
    q: 'Do I need an account or an app to use zentro?',
    a: 'No. There is no sign-up, no download and no install. Everything runs in the browser — desktop or mobile, modern browsers only.',
  },
  {
    q: 'How does the connection actually work?',
    a: 'It is peer-to-peer WebRTC. Your browser and your contact’s browser exchange connection details through a tiny signaling server, then the video and audio stream directly between the two devices — encrypted with DTLS-SRTP and never relayed through our servers.',
  },
  {
    q: 'Who can see my video?',
    a: 'Only the person holding the link. Each room allows exactly two participants and the link is unguessable. When the call ends, the connection is gone — there is no stored stream.',
  },
  {
    q: 'Can I record a call?',
    a: 'Yes. The room owner can record the audio, and on hang-up an AI transcript of the conversation is generated so you can review or export it.',
  },
  {
    q: 'What happens if the room is already full?',
    a: 'You will see a notice — zentro is built strictly for 1:1 conversations. Create a new room for the next call.',
  },
  {
    q: 'Does it cost anything?',
    a: 'No. zentro is free and open source. No tiers, no trials, no paywalls.',
  },
]

const FOOTER_COLS = [
  {
    title: 'Explore',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Start a meeting', href: '#top', action: true },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: '1:1 video calls', href: '#features' },
      { label: 'Screen sharing', href: '#features' },
      { label: 'In-call chat', href: '#features' },
      { label: 'Recording & transcript', href: '#features' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Open source', href: '#how' },
      { label: 'No tracking', href: '#features' },
      { label: 'Peer-to-peer privacy', href: '#how' },
    ],
  },
]

/* ─── Page ────────────────────────────────────────────────────────── */
export default function Home() {
  const router    = useRouter()
  const [joinValue, setJoinValue] = useState('')
  const [newRoomId, setNewRoomId] = useState<string | null>(null)
  const [copied,   setCopied]    = useState(false)
  const [openFaq,  setOpenFaq]   = useState<number | null>(0)

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

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <MotionConfig reducedMotion="user">
    <div
      id="top"
      className="min-h-screen relative overflow-x-hidden font-sans"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <BackgroundVignette />

      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-grid absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px]">
          <div
            className="aurora absolute left-1/2 -translate-x-1/2 -top-48 h-[620px] w-[620px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 65%)' }}
          />
          <div
            className="aurora aurora-delayed absolute -left-40 top-72 h-[460px] w-[460px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(226,180,255,0.07) 0%, transparent 65%)' }}
          />
          <div
            className="aurora aurora-delayed-2 absolute -right-40 top-96 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 65%)' }}
          />
        </div>
        {/* Orbit rings */}
        <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
          <div className="hero-orbit absolute top-0 h-[560px] w-[560px] rounded-full border border-[rgba(155,123,255,0.1)]" />
          <div className="hero-orbit hero-orbit-delayed absolute -mt-10 h-[400px] w-[400px] rounded-full border border-[rgba(155,123,255,0.08)]" />
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 md:px-10"
        style={{
          background: 'rgba(10,10,16,0.75)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <button onClick={scrollTop} className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(124,92,252,0.08))',
              border: '1px solid rgba(155,123,255,0.35)',
              boxShadow: '0 0 18px -4px rgba(124,92,252,0.35)',
            }}
          >
            <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span className="font-bold text-[15px] tracking-tight">zentro</span>
        </button>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how' },
            { label: 'FAQ', href: '#faq' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[13px] font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)' }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right meta */}
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(155,123,255,0.24)',
              color: 'var(--accent-bright)',
            }}
          >
            Free
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={createRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition-colors"
            style={{ background: 'var(--accent)', boxShadow: '0 0 20px -6px var(--accent-glow)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New meeting</span>
            <span className="sm:hidden">New</span>
          </motion.button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="relative pt-16">
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 pt-20 lg:pt-28 pb-10 flex flex-col items-center text-center">

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(155,123,255,0.24)',
              color: 'var(--accent-bright)',
            }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: 'var(--success)' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--success)' }} />
            </span>
            No account · Direct connection · Just talk
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-7 text-[2.75rem] sm:text-6xl md:text-7xl xl:text-[5.25rem] font-bold tracking-[-0.05em] leading-[0.98] max-w-4xl"
          >
            The call is <span className="hero-gradient-text">the whole product</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-6 text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            zentro is honest video calling: make a room, send one link, and talk face to face.
            Peer-to-peer, encrypted, and completely free — no account standing between you and the conversation.
          </motion.p>

          {/* CTA area — animates between states */}
          <AnimatePresence mode="wait">
            {newRoomId ? (
              <motion.div
                key="room-created"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mt-9 space-y-4 w-full max-w-md"
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-1.5"
                  style={{ color: 'var(--accent-bright)' }}
                >
                  <Sparkles className="w-3 h-3" />
                  Meeting ready — share the link
                </p>

                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)]"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-bright)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <LinkIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-bright)' }} />
                  <span className="flex-1 text-xs truncate font-mono" style={{ color: 'var(--text-secondary)' }}>
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
                        ? { background: 'rgba(52,211,153,0.16)', border: '1px solid rgba(52,211,153,0.32)', color: 'var(--success)' }
                        : { background: 'rgba(124,92,252,0.2)', border: '1px solid rgba(155,123,255,0.34)', color: 'var(--accent-bright)' }
                    }
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>

                <div className="flex gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startMeeting}
                    className="cta-shine flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
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
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mt-9 space-y-4 w-full max-w-md"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createRoom}
                  className="cta-shine w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-white font-semibold text-sm rounded-full transition-colors"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 40px -8px var(--accent-glow)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
                >
                  <Video className="w-4 h-4" />
                  Start a call
                  <ArrowRight className="w-4 h-4 opacity-70 transition-transform group-hover" />
                </motion.button>

                <div className="flex items-center gap-2 max-w-sm mx-auto">
                  <div
                    className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
                  >
                    <LinkIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <input
                      value={joinValue}
                      onChange={(e) => setJoinValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                      placeholder="Have a code? Enter it here"
                      aria-label="Room code or link"
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[rgba(242,242,250,0.3)] min-w-0"
                      style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-bright)' }}
                    />
                  </div>
                  <motion.button
                    whileHover={joinValue.trim() ? { scale: 1.04 } : {}}
                    whileTap={joinValue.trim() ? { scale: 0.96 } : {}}
                    onClick={joinRoom}
                    disabled={!joinValue.trim()}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)' }}
                  >
                    Join
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-x-5 gap-y-2"
          >
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-bright)', opacity: 0.65 }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.25 }}
          className="relative z-10 flex justify-center px-5 md:px-10 pb-24"
        >
          <VideoPreview />
        </motion.div>

        {/* Stats band */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="relative z-10 border-y"
          style={{ borderColor: 'var(--border)', background: 'rgba(12,12,20,0.55)', backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 grid grid-cols-3 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <p className="text-2xl md:text-3xl font-bold tracking-tight hero-gradient-text">{value}</p>
                <p className="text-[11px] tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── 01 · Features ───────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Reveal className="mb-12 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--accent-bright)' }}>
                  <span>01</span>
                  <span className="w-6 h-px" style={{ background: 'rgba(155,123,255,0.4)' }} />
                  <span>What you get</span>
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] max-w-xl">
                  Everything a great call needs. Nothing else.
                </h2>
              </div>
              <span className="hidden md:block text-xs pb-1" style={{ color: 'var(--text-muted)' }}>
                Made for actual conversations
              </span>
            </div>
          </Reveal>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BENTO.map(({ Icon, title, desc, span }, i) => (
              <Reveal
                key={title}
                delay={i * 0.06}
                className={`feature-card p-6 md:p-7 rounded-[var(--radius-lg)] ${span}`}
                style={{ background: 'rgba(18,20,31,0.6)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center mb-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,92,252,0.22), rgba(124,92,252,0.08))',
                    border: '1px solid rgba(155,123,255,0.28)',
                    boxShadow: '0 0 16px -4px rgba(124,92,252,0.2)',
                  }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--accent-bright)' }} />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 · How it works ───────────────────────────────────── */}
      <section id="how" className="relative z-10 py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Reveal className="mb-12 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--accent-bright)' }}>
                  <span>02</span>
                  <span className="w-6 h-px" style={{ background: 'rgba(155,123,255,0.4)' }} />
                  <span>How it works</span>
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] max-w-xl">
                  Three steps. Then the conversation.
                </h2>
              </div>
              <span className="hidden md:block text-xs pb-1" style={{ color: 'var(--text-muted)' }}>
                About 5 seconds end to end
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-[13px] left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, rgba(155,123,255,0.35), rgba(155,123,255,0.08) 55%, transparent)' }}
              aria-hidden="true"
            />
            {STEPS.map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.08} className="relative">
                {/* Node dot */}
                <div
                  className="hidden md:block absolute -top-[7px] left-0 w-[15px] h-[15px] rounded-full"
                  style={{
                    background: 'var(--bg)',
                    border: '2px solid var(--accent-bright)',
                    boxShadow: '0 0 12px -2px rgba(124,92,252,0.5)',
                  }}
                  aria-hidden="true"
                />
                <p className="font-mono text-[11px] tracking-[0.18em] mt-0 md:mt-4" style={{ color: 'var(--accent-bright)' }}>{n}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 py-24 lg:py-28">
        <div className="max-w-3xl mx-auto px-5 md:px-10">
          <Reveal className="mb-12 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--accent-bright)' }}>
              <span>03</span>
              <span className="w-6 h-px" style={{ background: 'rgba(155,123,255,0.4)' }} />
              <span>Questions</span>
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em]">
              Good questions, honest answers.
            </h2>
          </Reveal>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {FAQS.map(({ q, a }, i) => {
              const open = openFaq === i
              return (
                <div key={q} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                  >
                    <span
                      className="text-[15px] font-semibold transition-colors"
                      style={{ color: open ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                      {q}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        background: open ? 'var(--accent-soft)' : 'transparent',
                        border: '1px solid ' + (open ? 'rgba(155,123,255,0.3)' : 'var(--border-bright)'),
                      }}
                    >
                      <ChevronDown className="w-4 h-4" style={{ color: open ? 'var(--accent-bright)' : 'var(--text-muted)' }} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-14 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA band ──────────────────────────────────────── */}
      <section className="relative z-10 px-5 md:px-10 pb-24 lg:pb-28">
        <Reveal className="max-w-7xl mx-auto">
          <div
            className="gradient-border relative rounded-[var(--radius-xl)] p-10 md:p-16 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.16) 0%, rgba(12,12,20,0.9) 40%, rgba(12,12,20,0.95) 100%)' }}
          >
            <div className="bg-grid absolute inset-0 opacity-40" />
            <div
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.22), transparent 68%)' }}
              aria-hidden="true"
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--accent-bright)' }}>
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Your next conversation</span>
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] leading-[1.05]">
                  One link is all it takes.
                </h2>
                <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Start a call, send the link, and be talking before the kettle boils.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={createRoom}
                className="cta-shine flex items-center gap-3 px-8 py-4 text-white font-semibold text-sm rounded-full shrink-0 transition-colors"
                style={{ background: 'var(--accent)', boxShadow: '0 0 48px -10px var(--accent-glow)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
              >
                <Video className="w-4 h-4" />
                Start a free call
              </motion.button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t" style={{ borderColor: 'var(--border)', background: 'rgba(8,8,14,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-14">
          <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 md:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(124,92,252,0.08))',
                    border: '1px solid rgba(155,123,255,0.35)',
                  }}
                >
                  <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
                </div>
                <span className="font-bold text-[15px] tracking-tight">zentro</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Honest, peer-to-peer video calling for one. No accounts, no tracking, no servers relaying your face.
              </p>
              <div
                className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{
                  background: 'rgba(52,211,153,0.08)',
                  border: '1px solid rgba(52,211,153,0.22)',
                  color: 'var(--success)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: 'var(--success)' }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--success)' }} />
                </span>
                Free and open source
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--text-muted)' }}>
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, href, action }) => (
                    <li key={label}>
                      <button
                        onClick={() => {
                          if (action) createRoom()
                          else scrollTop()
                          // anchor scrolling handled natively for hrefs
                          if (!action) {
                            const target = document.querySelector(href || '')
                            if (target) target.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                        className="text-[13px] text-left transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} zentro · Peer-to-peer video conferencing · Built with WebRTC
            </p>
            <button
              onClick={scrollTop}
              className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-full transition-colors"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Back to top
            </button>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  )
}

/* ─── Scroll reveal wrapper ───────────────────────────────────────── */
function Reveal({
  children,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ─── Video call preview mockup (hero showcase) ───────────────────── */
function VideoPreview() {
  return (
    <div className="relative w-full max-w-[760px] py-10 sm:px-4">
      {/* Ambient glow */}
      <div
        className="absolute inset-x-16 top-10 bottom-6 rounded-[var(--radius-xl)] pointer-events-none"
        style={{ background: 'rgba(124,92,252,0.12)', filter: 'blur(72px)' }}
      />

      {/* Main call window */}
      <div
        className="gradient-border relative rounded-[var(--radius-xl)] overflow-hidden shadow-2xl float-slow"
        style={{ background: '#080810', aspectRatio: '16/9', boxShadow: 'var(--shadow-xl)' }}
      >
        {/* Remote video placeholder — subtle gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0c0d1a 0%, #14152a 45%, #0e0f1c 100%)' }}
        />
        <div className="bg-grid absolute inset-0 opacity-60" />

        {/* Remote participant */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold select-none"
              style={{
                background: 'linear-gradient(135deg, rgba(124,92,252,0.28), rgba(226,180,255,0.12))',
                color: '#c9b8ff',
                border: '2px solid rgba(155,123,255,0.4)',
                boxShadow: '0 0 36px -6px rgba(124,92,252,0.4)',
                position: 'relative',
              }}
            >
              AJ
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ border: '1.5px solid rgba(155,123,255,0.35)', animationDuration: '2.2s' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Name chip + mic equalizer */}
        <div className="absolute bottom-16 left-4 flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium flex items-center gap-1.5"
            style={{
              background: 'rgba(10,10,16,0.78)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
            }}
          >
            Alex Johnson
          </div>
          <div
            className="flex items-end gap-[2.5px] px-2.5 py-1.5 rounded-[var(--radius-sm)] h-7"
            style={{
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.25)',
            }}
          >
            {[0.35, 1, 0.6].map((delayMul, i) => (
              <span
                key={i}
                className="eq-bar w-[2.5px] h-2.5 rounded-full"
                style={{ background: 'var(--success)', animationDuration: `${0.85 + i * 0.28}s`, animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        </div>

        {/* PIP — local video */}
        <div
          className="gradient-border absolute bottom-16 right-3 w-28 h-[78px] rounded-[var(--radius-md)] overflow-hidden shadow-xl"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1d2e 0%, #12141f 100%)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold select-none"
              style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(226,180,255,0.15))', color: '#c9b8ff' }}
            >
              Me
            </div>
          </div>
          <div
            className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{ background: 'rgba(10,10,16,0.75)', color: 'var(--text-muted)' }}
          >
            You
          </div>
        </div>

        {/* Bottom control bar mockup */}
        <div
          className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center gap-2 px-4"
          style={{ background: 'linear-gradient(to top, rgba(8,8,16,0.95) 15%, transparent 100%)' }}
        >
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{ background: 'rgba(25,28,43,0.95)', border: '1px solid var(--border-bright)' }}
          >
            <Mic className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{ background: 'rgba(25,28,43,0.95)', border: '1px solid var(--border-bright)' }}
          >
            <Video className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--border-bright)' }} />
          <div
            className="w-9 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{ background: 'var(--danger)', boxShadow: '0 0 16px -4px var(--danger-glow)' }}
          >
            <PhoneOff className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Live badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)]"
          style={{
            background: 'rgba(10,10,16,0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full rec-blink shrink-0" style={{ background: 'var(--danger)' }} />
          <span className="text-[9px] font-semibold tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
            LIVE
          </span>
        </div>

        {/* Duration chip */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-[var(--radius-sm)]"
          style={{
            background: 'rgba(10,10,16,0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="text-[9px] font-mono font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>
            04:32
          </span>
        </div>
      </div>

      {/* Floating feature callouts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute bottom-2 -left-2 sm:-left-6 px-3.5 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2.5 shadow-xl"
        style={{
          background: 'rgba(18,20,31,0.97)',
          border: '1px solid var(--border-bright)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(52,211,153,0.15)' }}
        >
          <Shield className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
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
        transition={{ delay: 0.85, duration: 0.5 }}
        className="absolute top-2 -right-2 sm:-right-6 px-3.5 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2.5 shadow-xl"
        style={{
          background: 'rgba(18,20,31,0.97)',
          border: '1px solid var(--border-bright)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124,92,252,0.2)' }}
        >
          <InfinityIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
        </div>
        <div>
          <p className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Free forever
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            No limits, no paywalls
          </p>
        </div>
      </motion.div>
    </div>
  )
}
