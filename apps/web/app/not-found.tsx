import Link from 'next/link'
import { Video } from 'lucide-react'

export default function NotFound() {
  return (
    <main
      className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Blueprint grid */}
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-14">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
          >
            <Video className="w-4 h-4" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight">zentro</span>
          <span className="mono-label text-[9px]" style={{ color: 'var(--text-muted)' }}>
            — direct line
          </span>
        </div>

        {/* Schematic 404 */}
        <svg viewBox="0 0 280 120" className="w-full max-w-[280px] mb-8" aria-hidden="true">
          <rect x="20" y="40" width="100" height="44" rx="8"
            fill="var(--surface-raised)" stroke="rgba(244,241,232,0.28)" strokeWidth="1" />
          <text x="70" y="66" fill="var(--text-primary)" fontSize="14" fontFamily="var(--font-sora)" fontWeight={600} textAnchor="middle">
            here
          </text>
          <rect x="160" y="40" width="100" height="44" rx="8"
            fill="var(--surface)" stroke="rgba(229,72,77,0.5)" strokeWidth="1" />
          <text x="210" y="66" fill="var(--text-muted)" fontSize="14" fontFamily="var(--font-sora)" fontWeight={600} textAnchor="middle">
            page
          </text>
          {/* broken line */}
          <line x1="120" y1="62" x2="146" y2="62" stroke="rgba(244,241,232,0.4)" strokeWidth="1.5" strokeDasharray="4 6" />
          <line x1="152" y1="62" x2="160" y2="62" stroke="rgba(244,241,232,0.4)" strokeWidth="1.5" strokeDasharray="4 6" />
          <path
            d="M 146 53 l 14 18 M 160 53 l -14 18"
            stroke="#e5484d" strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
        </svg>

        <p className="mono-label text-[10px] mb-3" style={{ color: 'var(--accent-bright)' }}>
          Line dropped · 404
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-3">
          Nothing answering there.
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          The page or room code you followed doesn&apos;t exist — or the call
          already ended. Links are one-time neighbors here; start a fresh room in one click.
        </p>

        <Link
          href="/"
          className="cta-shine inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[var(--radius-md)] text-sm font-semibold transition-colors"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          <Video className="w-4 h-4" />
          Start a call
        </Link>
      </div>
    </main>
  )
}
