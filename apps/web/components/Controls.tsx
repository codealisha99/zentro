'use client'

import {
  Mic, MicOff, Video, VideoOff,
  CircleDot, Square, PhoneOff,
  MonitorUp, MonitorOff, MessageSquare,
  Maximize2, Minimize2, Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  audioMuted: boolean
  videoMuted: boolean
  isRecording: boolean
  isScreenSharing: boolean
  chatOpen?: boolean
  participantsOpen?: boolean
  participantCount?: number
  isFullscreen?: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onToggleChat: () => void
  onToggleParticipants: () => void
  onToggleFullscreen: () => void
  onToggleRecord: () => void
  onEndCall: () => void
  disabled?: boolean
}

export function Controls({
  audioMuted,
  videoMuted,
  isRecording,
  isScreenSharing,
  chatOpen = false,
  participantsOpen = false,
  participantCount = 1,
  isFullscreen = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleFullscreen,
  onToggleRecord,
  onEndCall,
  disabled = false,
}: Props) {
  return (
    <div className="flex items-center justify-center p-4 w-full">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="gradient-border flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-lg)]"
        style={{
          background: 'rgba(18,20,31,0.88)',
          backdropFilter: 'blur(24px) saturate(1.35)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Audio / Video */}
        <ControlButton
          onClick={onToggleAudio}
          disabled={disabled}
          active={!audioMuted}
          label={audioMuted ? 'Unmute' : 'Mute'}
          icon={audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          danger={audioMuted}
        />
        <ControlButton
          onClick={onToggleVideo}
          disabled={disabled}
          active={!videoMuted && !isScreenSharing}
          label={videoMuted ? 'Camera on' : 'Camera off'}
          icon={videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          danger={videoMuted && !isScreenSharing}
        />

        <Divider />

        {/* Screen share / Chat / Participants / Fullscreen */}
        <ControlButton
          onClick={onToggleScreenShare}
          disabled={disabled}
          active={isScreenSharing}
          label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          icon={isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
          accent={isScreenSharing}
        />
        <ControlButton
          onClick={onToggleChat}
          disabled={disabled}
          active={chatOpen}
          label="Chat"
          icon={<MessageSquare className="w-5 h-5" />}
          accent={chatOpen}
        />
        <ControlButton
          onClick={onToggleParticipants}
          disabled={disabled}
          active={participantsOpen}
          label="Participants"
          icon={
            <div className="relative">
              <Users className="w-5 h-5" />
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full text-[9px] flex items-center justify-center text-white font-bold px-0.5"
                style={{
                  background: participantsOpen ? 'var(--accent-deep)' : 'var(--accent)',
                  boxShadow: '0 0 8px -1px var(--accent-glow)',
                }}
              >
                {participantCount}
              </span>
            </div>
          }
          accent={participantsOpen}
        />
        <ControlButton
          onClick={onToggleFullscreen}
          disabled={disabled}
          active={isFullscreen}
          label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          icon={isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          accent={isFullscreen}
        />

        <Divider />

        {/* Record */}
        <ControlButton
          onClick={onToggleRecord}
          disabled={disabled}
          active={isRecording}
          label={isRecording ? 'Stop recording' : 'Record'}
          icon={
            isRecording ? (
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full rec-blink shrink-0" style={{ background: '#fbbf24' }} />
                <Square className="w-4 h-4 fill-current ml-2" />
              </div>
            ) : (
              <CircleDot className="w-5 h-5" />
            )
          }
          variant={isRecording ? 'recording' : 'default'}
        />

        <Divider />

        {/* End call */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={onEndCall}
          className="flex items-center justify-center w-11 h-11 text-white rounded-[var(--radius-md)]"
          style={{
            background: 'var(--danger)',
            boxShadow: '0 0 22px -5px var(--danger-glow)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bright)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger)' }}
          title="End Call"
          aria-label="End call"
        >
          <PhoneOff className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  )
}

function Divider() {
  return (
    <div
      className="w-px h-5 mx-1.5 shrink-0"
      style={{
        background: 'linear-gradient(to bottom, transparent, var(--border-bright), transparent)',
      }}
    />
  )
}

type ButtonProps = {
  onClick: () => void
  disabled?: boolean
  active: boolean
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'recording'
  danger?: boolean
  accent?: boolean
}

function ControlButton({
  onClick,
  disabled,
  active,
  label,
  icon,
  variant = 'default',
  danger = false,
  accent = false,
}: ButtonProps) {
  function getStyle(): React.CSSProperties {
    if (variant === 'recording') {
      return {
        background: 'rgba(251,191,36,0.12)',
        border: '1px solid rgba(251,191,36,0.28)',
        color: '#fbbf24',
      }
    }
    if (danger) {
      return {
        background: 'rgba(240,71,95,0.12)',
        border: '1px solid rgba(240,71,95,0.28)',
        color: 'var(--danger-bright)',
      }
    }
    if (accent) {
      return {
        background: 'var(--accent-soft)',
        border: '1px solid rgba(155,123,255,0.32)',
        color: 'var(--accent-bright)',
      }
    }
    return {
      background: active ? 'var(--surface-hover)' : 'transparent',
      border: '1px solid transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    }
  }

  return (
    <div className="relative group flex justify-center">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        disabled={disabled}
        className="relative flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        style={getStyle()}
        onMouseEnter={(e) => {
          if (disabled || variant !== 'default' || danger || accent) return
          e.currentTarget.style.background = 'var(--surface-hover)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          if (disabled || variant !== 'default' || danger || accent) return
          e.currentTarget.style.background = active ? 'var(--surface-hover)' : 'transparent'
          e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}
        aria-label={label}
        aria-pressed={active}
      >
        {icon}
      </motion.button>

      {/* Tooltip */}
      <div
        role="tooltip"
        className="absolute -top-9 opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 text-[11px] font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap pointer-events-none z-50"
        style={{
          background: 'rgba(30,33,48,0.98)',
          border: '1px solid var(--border-bright)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {label}
      </div>
    </div>
  )
}
