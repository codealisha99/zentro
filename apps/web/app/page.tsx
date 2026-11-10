'use client'

import { useState, type ReactNode, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  Video, Link as LinkIcon, ArrowRight, Copy, Check, Shield, Zap,
  Globe, Lock, Plus, MonitorUp, MessageSquare, FileText,
  ChevronDown, ArrowUp, X, ArrowDownRight,
} from 'lucide-react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { BackgroundVignette } from '@/components/BackgroundVignette'

/* ─── Shared data ─────────────────────────────────────────────────── */
const TRUST_BADGES = [
  { Icon: Lock,   label: 'End-to-end encrypted' },
  { Icon: Globe,  label: 'Works in any browser' },
  { Icon: Shield, label: 'No tracking' },
]

const FACTS = [
  { value: '0',   label: 'accounts needed' },
  { value: '1',   label: 'link to share' },
  { value: '2',   label: 'people per room' },
  { value: 'P2P', label: 'direct media' },
]

const PROBLEMS = [
  {
    n: '01',
    title: 'The detour',
    desc: 'Most call apps bounce your voice and face through a server farm before they reach the other person. Every hop adds delay and a place for your call to be stored.',
  },
  {
    n: '02',
    title: 'The gate',
    desc: 'Create an account. Verify your email. Install the app. Find your contact. Ten steps stand between you and hello.',
  },
  {
    n: '03',
    title: 'The baggage',
    desc: 'Meeting links that expire, rooms that pile up, recordings you never asked for. The tool for a 2-minute chat shouldn\u2019t leave a paper trail.',
  },
]

const GAINS = [
  {
    Icon: Zap,
    title: 'Closer, not further',
    desc: 'Media flows device-to-device over DTLS-encrypted WebRTC. No relay in the call path, no server storing the stream — it exists for the length of the call, then it\u2019s gone.',
  },
  {
    Icon: Lock,
    title: 'Nobody in the middle',
    desc: 'Video and audio stream directly between the two browsers. A tiny signaling server only helps the browsers find each other, then steps out of the way.',
  },
  {
    Icon: Globe,
    title: 'Just a link',
    desc: 'One unguessable URL, two people, no accounts. It works in any modern browser — phone or desktop — with nothing to install.',
  },
]

const BENTO = [
  {
    Icon: MonitorUp,
    title: 'Screen sharing',
    desc: 'Show docs, decks and dashboards mid-call with one click.',
  },
  {
    Icon: MessageSquare,
    title: 'In-call chat',
    desc: 'Drop links and quick notes without leaving the conversation. Encrypted, peer-to-peer.',
  },
  {
    Icon: FileText,
    title: 'Record, then transcript',
    desc: 'Capture the audio, hang up, and get a timestamped transcript to skim or search. Stays on your device.',
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
    a: 'It is peer-to-peer WebRTC. Your browser and your contact\u2019s browser exchange connection details through a tiny signaling server, then the video and audio stream directly between the two devices — encrypted with DTLS-SRTP and never relayed through our servers.',
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
      { label: 'Why direct', href: '#why' },
      { label: 'How it works', href: '#how' },
      { label: 'What you get', href: '#features' },
      { label: 'FAQ', href: '#faq' },
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
      { label: 'No tracking', href: '#why' },
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
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <BackgroundVignette />

      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 md:px-10"
        style={{
          background: 'rgba(11,12,14,0.8)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <button onClick={scrollTop} className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight">zentro</span>
          <span className="mono-label text-[9px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            — direct line
          </span>
        </button>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: 'Problem', href: '#problem' },
            { label: 'Why direct', href: '#why' },
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
          <span className="mono-label text-[10px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            Free · Open source
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={createRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors"
            style={{ background: 'var(--paper)', color: 'var(--ink)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--paper)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New meeting</span>
            <span className="sm:hidden">New</span>
          </motion.button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="relative pt-16">
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 pt-20 lg:pt-24 pb-8 flex flex-col items-center text-center">

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mono-label inline-flex items-center gap-2.5 px-3.5 py-2 text-[10px] rounded-[var(--radius-sm)]"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(0,220,130,0.28)',
              color: 'var(--accent-bright)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: 'var(--accent)' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--accent)' }} />
            </span>
            Peer-to-peer · WebRTC · 1:1
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-7 font-display text-[2.4rem] sm:text-6xl md:text-7xl xl:text-[5rem] font-bold tracking-[-0.045em] leading-[1.0] max-w-4xl"
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
            Make a room, send one link, and talk face to face. Your devices connect
            directly — no relay, no account, nothing stored.
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
                <p className="mono-label text-[10px] flex items-center justify-center gap-1.5" style={{ color: 'var(--accent-bright)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  Room open — share the link
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
                  <span className="flex-1 text-xs truncate font-mono text-left" style={{ color: 'var(--text-secondary)' }}>
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
                        ? { background: 'var(--accent-soft)', border: '1px solid rgba(0,220,130,0.36)', color: 'var(--accent-bright)' }
                        : { background: 'var(--surface-hover)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)' }
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
                    className="cta-shine flex-1 flex items-center justify-center gap-2 px-5 py-3.5 font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
                    style={{ background: 'var(--paper)', color: 'var(--ink)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--paper)' }}
                  >
                    <Video className="w-4 h-4" />
                    Enter room
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
                  className="cta-shine group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
                  style={{ background: 'var(--paper)', color: 'var(--ink)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--paper)' }}
                >
                  <Video className="w-4 h-4" />
                  Start a call
                  <ArrowRight className="w-4 h-4 opacity-70 transition-transform duration-200 group-hover:translate-x-1" />
                </motion.button>

                <div className="flex items-center gap-2 max-w-sm mx-auto">
                  <div
                    className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] transition-all focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
                  >
                    <LinkIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <input
                      value={joinValue}
                      onChange={(e) => setJoinValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                      placeholder="Have a code? Enter it here"
                      aria-label="Room code or link"
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[rgba(244,241,232,0.28)] min-w-0"
                      style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-bright)' }}
                    />
                  </div>
                  <motion.button
                    whileHover={joinValue.trim() ? { scale: 1.04 } : {}}
                    whileTap={joinValue.trim() ? { scale: 0.96 } : {}}
                    onClick={joinRoom}
                    disabled={!joinValue.trim()}
                    className="px-5 py-2.5 text-sm font-semibold rounded-[var(--radius-sm)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                <Icon className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-bright)', opacity: 0.7 }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* ── P2P schematic hero visualization ── */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.3 }}
            className="relative z-10 w-full max-w-3xl mt-14 lg:mt-16"
          >
            <P2PSchematic />
          </motion.div>
        </div>

        {/* Facts band */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="relative z-10 border-y mt-12"
          style={{ borderColor: 'var(--border)', background: 'rgba(14,15,17,0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
            {FACTS.map(({ value, label }) => (
              <div key={label} className="flex items-center justify-center gap-3">
                <span className="font-display text-2xl md:text-3xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--paper)' }}>
                  {value}
                </span>
                <span className="text-xs leading-tight max-w-[80px] text-left" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── 01 · Problem ────────────────────────────────────────── */}
      <section id="problem" className="relative z-10 py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <SectionHeader n="01" tag="The problem" title="Every call takes a detour." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {PROBLEMS.map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.08} className="relative border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="mono-label text-[11px]" style={{ color: 'var(--text-muted)' }}>{n}</span>
                  <span className="w-6 h-px" style={{ background: 'var(--border-bright)' }} />
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--danger-bright)' }} />
                </div>
                <h3 className="font-display mt-3 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 · Why direct ─────────────────────────────────────── */}
      <section id="why" className="relative z-10 py-24 lg:py-28 border-y" style={{ borderColor: 'var(--border)', background: 'rgba(14,15,17,0.5)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <SectionHeader
            n="02"
            tag="Why direct"
            title="Remove the middleman, and the call gets better."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GAINS.map(({ Icon, title, desc }, i) => (
              <Reveal
                key={title}
                delay={i * 0.06}
                className="p-7 rounded-[var(--radius-lg)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center"
                    style={{ background: 'var(--accent-soft)', border: '1px solid rgba(0,220,130,0.26)' }}
                  >
                    <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--accent-bright)' }} />
                  </div>
                  <ArrowDownRight className="w-4 h-4" style={{ color: 'var(--accent)', opacity: 0.5 }} />
                </div>
                <h3 className="font-display font-semibold text-[16px] mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · How it works ───────────────────────────────────── */}
      <section id="how" className="relative z-10 py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <SectionHeader
            n="03"
            tag="How it works"
            title="Three steps. Then the conversation."
            aside="About 5 seconds end to end"
          />

          {/* The path your media takes — signal small, media direct */}
          <Reveal className="mb-14">
            <div
              className="gradient-border relative rounded-[var(--radius-xl)] overflow-hidden"
              style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="bg-grid absolute inset-0 opacity-50" aria-hidden="true" />
              <div className="relative flex items-start justify-between px-6 md:px-8 pt-7 pb-2 gap-4">
                <p className="mono-label text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  The path your media takes
                </p>
                <span
                  className="mono-label text-[9px] px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: 'var(--accent-soft)', border: '1px solid rgba(0,220,130,0.26)', color: 'var(--accent-bright)' }}
                >
                  media never touches a server
                </span>
              </div>
              <P2PSchematic compact />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {STEPS.map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.08} className="relative border-t pt-6 md:border-t-0 md:border-l md:pl-8" style={{ borderColor: 'var(--border)' }}>
                <p className="mono-label text-[11px]" style={{ color: 'var(--accent-bright)' }}>{n}</p>
                <h3 className="font-display mt-3 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · What you get ───────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 lg:py-28 border-y" style={{ borderColor: 'var(--border)', background: 'rgba(14,15,17,0.5)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <SectionHeader n="04" tag="What you get" title="Everything a great call needs. Nothing else." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENTO.map(({ Icon, title, desc }, i) => (
              <Reveal
                key={title}
                delay={i * 0.06}
                className="feature-card p-7 rounded-[var(--radius-lg)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center mb-5"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--paper)' }} />
                </div>
                <h3 className="font-display font-semibold text-[16px] mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 · FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 py-24 lg:py-28">
        <div className="max-w-3xl mx-auto px-5 md:px-10">
          <SectionHeader n="05" tag="Questions" title="Good questions, honest answers." />

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
                      className="w-8 h-8 shrink-0 rounded-[var(--radius-sm)] flex items-center justify-center"
                      style={{
                        background: open ? 'var(--accent-soft)' : 'transparent',
                        border: '1px solid ' + (open ? 'rgba(0,220,130,0.3)' : 'var(--border-bright)'),
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
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="bg-grid absolute inset-0 opacity-40" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <p className="mono-label mb-3 text-[10px]" style={{ color: 'var(--accent-bright)' }}>
                  Your next conversation
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.03em] leading-[1.05]">
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
                className="cta-shine flex items-center gap-3 px-8 py-4 font-semibold text-sm rounded-[var(--radius-md)] shrink-0 transition-colors"
                style={{ background: 'var(--paper)', color: 'var(--ink)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--paper)' }}
              >
                <Video className="w-4 h-4" />
                Start a free call
              </motion.button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t" style={{ borderColor: 'var(--border)', background: 'rgba(9,10,12,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-14">
          <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 md:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
                >
                  <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
                </div>
                <span className="font-display font-bold text-[15px] tracking-tight">zentro</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Honest, peer-to-peer video calling for one. No accounts, no tracking, no servers relaying your face.
              </p>
              <div
                className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{
                  background: 'var(--accent-soft)',
                  border: '1px solid rgba(0,220,130,0.24)',
                  color: 'var(--accent-bright)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: 'var(--accent)' }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--accent)' }} />
                </span>
                Free and open source
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="mono-label text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, href }) => (
                    <li key={label}>
                      <button
                        onClick={() => {
                          const target = document.querySelector(href || '')
                          if (target) target.scrollIntoView({ behavior: 'smooth' })
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

/* ─── Scroll reveal wrapper (mount-time; robust in headless QA) ──── */
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

/* ─── Section header, schematic style ─────────────────────────────── */
function SectionHeader({
  n, tag, title, aside,
}: {
  n: string
  tag: string
  title: string
  aside?: string
}) {
  return (
    <Reveal className="mb-12 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="mono-label mb-3 flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-bright)' }}>{n}</span>
            <span className="w-6 h-px" style={{ background: 'var(--border-bright)' }} />
            <span>{tag}</span>
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.03em] max-w-xl">
            {title}
          </h2>
        </div>
        {aside && (
          <span className="hidden md:block text-xs pb-1" style={{ color: 'var(--text-muted)' }}>
            {aside}
          </span>
        )}
      </div>
    </Reveal>
  )
}

/* ─── P2P schematic: two devices, one direct line ─────────────────── */
function P2PSchematic({ compact = false }: { compact?: boolean }) {
  const nodeW = 116
  const nodeH = 72
  const W = 640
  const H = compact ? 190 : 240
  const cy = compact ? 96 : 128
  const serverY = compact ? 6 : 14
  const leftX = 56
  const rightX = W - 56 - nodeW

  const nodeStyle = {
    fill: 'var(--surface-raised)',
    stroke: 'rgba(244, 241, 232, 0.28)',
    strokeWidth: 1,
  }
  const paper = '#f4f1e8'
  const muted = 'rgba(244, 241, 232, 0.45)'
  const green = '#00dc82'
  const danger = '#e5484d'

  function DeviceNode({ x, label, sub }: { x: number; label: string; sub: string }) {
    return (
      <g>
        <rect x={x} y={cy - nodeH / 2} width={nodeW} height={nodeH} rx={10} style={nodeStyle} />
        {/* corner ticks */}
        <path
          d={`M ${x - 6} ${cy - nodeH / 2 - 6} h 8 M ${x - 6} ${cy - nodeH / 2 - 6} v 8`}
          stroke={muted} strokeWidth={1} fill="none"
        />
        <path
          d={`M ${x + nodeW + 6} ${cy + nodeH / 2 + 6} h -8 M ${x + nodeW + 6} ${cy + nodeH / 2 + 6} v -8`}
          stroke={muted} strokeWidth={1} fill="none"
        />
        <circle cx={x + 20} cy={cy} r={9} fill="none" stroke={green} strokeWidth={1.5} />
        <circle cx={x + 20} cy={cy} r={3} fill={green} />
        <text x={x + 38} y={cy - 4} fill={paper} fontSize={13} fontFamily="var(--font-sora)" fontWeight={600}>
          {label}
        </text>
        <text x={x + 38} y={cy + 14} fill={muted} fontSize={9} fontFamily="var(--font-mono)">
          {sub}
        </text>
      </g>
    )
  }

  return (
    <div className="relative px-3 md:px-8 pb-6 md:pb-8 select-none" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="presentation">
        {/* ── Detour path (gray, dashed, struck through) ── */}
        <path
          d={`M ${leftX + nodeW} ${cy - 58} C ${(leftX + nodeW + rightX) / 2 - 40} ${cy - 92}, ${(leftX + nodeW + rightX) / 2 + 40} ${cy - 92}, ${rightX} ${cy - 58}`}
          stroke={muted} strokeWidth={1} strokeDasharray="4 6" fill="none"
        />
        {/* Server block on the detour */}
        <g>
          <rect x={(W - 84) / 2} y={serverY} width={84} height={30} rx={6}
            fill={'var(--surface)'} stroke={danger} strokeWidth={1} opacity={0.9} />
          <text x={W / 2} y={serverY + 19} fill={muted} fontSize={9} fontFamily="var(--font-mono)" textAnchor="middle">
            SERVER
          </text>
          {/* strike-through mark */}
          <circle cx={W / 2 + 42} cy={serverY} r={9} fill={'var(--bg)'} stroke={danger} strokeWidth={1} />
          <path
            d={`M ${W / 2 + 42 - 4} ${serverY - 4} l 8 8 M ${W / 2 + 42 + 4} ${serverY - 4} l -8 8`}
            stroke={danger} strokeWidth={1.5} fill="none" strokeLinecap="round"
          />
        </g>
        <text x={W / 2} y={cy - 40} fill={muted} fontSize={8.5} fontFamily="var(--font-mono)" textAnchor="middle">
          media would detour here — not with zentro
        </text>

        {/* ── Direct media line (signal green, animated) ── */}
        <line
          x1={leftX + nodeW} y1={cy} x2={rightX} y2={cy}
          stroke={green} strokeWidth={1.5} strokeLinecap="round"
          className="draw-line"
        />
        <line
          x1={leftX + nodeW} y1={cy} x2={rightX} y2={cy}
          stroke={green} strokeWidth={1.5} strokeLinecap="round" opacity={0.25}
        />
        <text x={W / 2} y={cy + 26} fill={green} fontSize={9} fontFamily="var(--font-mono)" textAnchor="middle">
          media · direct · encrypted
        </text>

        {/* ── Signaling hint (hairline below) ── */}
        <path
          d={`M ${leftX + 30} ${cy + nodeH / 2 + 26} C ${W / 2 - 60} ${H - 18}, ${W / 2 + 60} ${H - 18}, ${rightX + 86} ${cy + nodeH / 2 + 26}`}
          stroke={muted} strokeWidth={0.8} strokeDasharray="2 5" fill="none" opacity={0.6} />
        <text x={W / 2} y={H - 16} fill={muted} fontSize={8.5} fontFamily="var(--font-mono)" textAnchor="middle" opacity={0.85}>
          tiny hello to find each other — signaling only
        </text>

        {/* ── Devices ── */}
        <DeviceNode x={leftX} label="You" sub="BROWSER_A" />
        <DeviceNode x={rightX} label="Them" sub="BROWSER_B" />
      </svg>
    </div>
  )
}
