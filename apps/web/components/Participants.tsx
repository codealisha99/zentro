'use client'

import { Mic, MicOff, Video, VideoOff, MonitorUp, Users, X } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  localName: string
  remoteName: string | null
  audioMuted: boolean
  videoMuted: boolean
  isScreenSharing: boolean
  peerJoined: boolean
  remoteAudioMuted?: boolean
  remoteVideoOff?: boolean
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

/* Deterministic pastel gradient per name so avatars feel branded, not random */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(226,180,255,0.14))',
  'linear-gradient(135deg, rgba(52,211,153,0.28), rgba(124,92,252,0.1))',
  'linear-gradient(135deg, rgba(251,191,36,0.26), rgba(124,92,252,0.1))',
  'linear-gradient(135deg, rgba(240,71,95,0.24), rgba(251,191,36,0.1))',
]

function pickGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: pickGradient(name) || 'var(--accent-soft)',
            color: isConnecting ? 'var(--text-muted)' : '#d9ccff',
            border: '1px solid rgba(155,123,255,0.22)',
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
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-bright)' }}
            >
              You
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
          <MicOff className="w-3.5 h-3.5" style={{ color: 'var(--danger-bright)' }} />
        ) : (
          <Mic className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        )}
        {videoMuted ? (
          <VideoOff className="w-3.5 h-3.5" style={{ color: 'var(--danger-bright)' }} />
        ) : (
          <Video className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
    </motion.div>
  )
}

export function Participants({
  localName,
  remoteName,
  audioMuted,
  videoMuted,
  isScreenSharing,
  peerJoined,
  remoteAudioMuted = false,
  remoteVideoOff = false,
  onClose,
}: Props) {
  const participantCount = peerJoined ? 2 : 1

  return (
    <div
      className="w-full lg:w-72 backdrop-blur-xl flex flex-col overflow-hidden shrink-0 max-md:h-full lg:max-h-none"
      style={{
        background: 'rgba(18,20,31,0.96)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Participants
          </h3>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent-bright)',
            }}
          >
            {participantCount}
          </span>
        </div>
        <button
          onClick={onClose}
          className="transition-colors rounded-md p-1"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
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
            audioMuted={remoteAudioMuted}
            videoMuted={remoteVideoOff}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center py-10 gap-3 px-4 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', border: '1px solid rgba(155,123,255,0.2)' }}
            >
              <Users className="w-5 h-5" style={{ color: 'var(--accent-bright)' }} />
            </div>
            <p className="text-xs leading-relaxed">
              Waiting for someone to join…
              <br />
              <span style={{ opacity: 0.65 }}>Share the invite link.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
