'use client'

import { Mic, MicOff, Video, VideoOff, MonitorUp, Users, X } from 'lucide-react'

type Props = {
  localName: string
  remoteName: string | null
  audioMuted: boolean
  videoMuted: boolean
  isScreenSharing: boolean
  peerJoined: boolean
  onClose: () => void
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

type ParticipantRowProps = {
  name: string
  isLocal?: boolean
  audioMuted?: boolean
  videoMuted?: boolean
  isScreenSharing?: boolean
  isConnecting?: boolean
}

function ParticipantRow({
  name,
  isLocal = false,
  audioMuted = false,
  videoMuted = false,
  isScreenSharing = false,
  isConnecting = false,
}: ParticipantRowProps) {
  const initials = getInitials(name)

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
      style={{ ['--hover-bg' as string]: 'rgba(255,255,255,0.04)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: 'rgba(124,58,237,0.2)',
            color: 'var(--accent-bright)',
          }}
        >
          {initials || '?'}
        </div>
        {/* Online indicator */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
            isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
          }`}
          style={{ borderColor: 'var(--surface-raised)' }}
        />
      </div>

      {/* Name + label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {name}
          </span>
          {isLocal && (
            <span className="text-[10px] font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
              (You)
            </span>
          )}
        </div>
        {isConnecting && (
          <p className="text-[11px] text-amber-400/80 mt-0.5">Connecting…</p>
        )}
      </div>

      {/* Status icons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isScreenSharing && (
          <MonitorUp className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
        )}
        {audioMuted ? (
          <MicOff className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Mic className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        )}
        {videoMuted ? (
          <VideoOff className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Video className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
    </div>
  )
}

export function Participants({
  localName,
  remoteName,
  audioMuted,
  videoMuted,
  isScreenSharing,
  peerJoined,
  onClose,
}: Props) {
  const participantCount = peerJoined ? 2 : 1

  return (
    <div
      className="w-full lg:w-72 backdrop-blur-xl rounded-[var(--radius-xl)] flex flex-col overflow-hidden shadow-2xl shrink-0 max-h-[calc(100vh-200px)] lg:max-h-none"
      style={{
        background: 'rgba(26,29,46,0.85)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Participants
          </h3>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)',
            }}
          >
            {participantCount}
          </span>
        </div>
        <button
          onClick={onClose}
          className="transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          aria-label="Close participants panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Local participant — always shown */}
        <ParticipantRow
          name={localName || 'You'}
          isLocal
          audioMuted={audioMuted}
          videoMuted={videoMuted && !isScreenSharing}
          isScreenSharing={isScreenSharing}
        />

        {/* Remote participant */}
        {peerJoined ? (
          <ParticipantRow
            name={remoteName ?? 'Peer'}
            isConnecting={!remoteName}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2" style={{ color: 'var(--text-muted)' }}>
            <Users className="w-7 h-7" />
            <p className="text-xs text-center">Waiting for someone to join…</p>
          </div>
        )}
      </div>
    </div>
  )
}
