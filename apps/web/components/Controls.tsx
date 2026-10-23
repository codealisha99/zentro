'use client'

import { useState } from 'react'
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
        className="gradient-border flex items-center gap-2 px-5 py-3 backdrop-blur-xl shadow-2xl rounded-[var(--radius-xl)]"
        style={{ background: 'rgba(19,21,32,0.85)' }}
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

        <div
          className="w-px h-5 mx-1"
          style={{ background: 'var(--border-bright)' }}
        />

        {/* Screen share / Chat / Participants / Fullscreen */}
        <ControlButton
          onClick={onToggleScreenShare}
          disabled={disabled}
          active={isScreenSharing}
          label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          icon={isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        />
        <ControlButton
          onClick={onToggleChat}
          disabled={disabled}
          active={chatOpen}
          label="Chat"
          icon={<MessageSquare className="w-5 h-5" />}
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
                style={{ background: 'var(--accent)' }}
              >
                {participantCount}
              </span>
            </div>
          }
        />
        <ControlButton
          onClick={onToggleFullscreen}
          disabled={disabled}
          active={isFullscreen}
          label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          icon={isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        />

        <div
          className="w-px h-5 mx-1"
          style={{ background: 'var(--border-bright)' }}
        />

        {/* Record */}
        <ControlButton
          onClick={onToggleRecord}
          disabled={disabled}
          active={isRecording}
          label={isRecording ? 'Stop recording' : 'Record'}
          icon={isRecording ? <Square className="w-5 h-5 fill-current" /> : <CircleDot className="w-5 h-5" />}
          variant={isRecording ? 'recording' : 'default'}
        />

        <div
          className="w-px h-5 mx-1"
          style={{ background: 'var(--border-bright)' }}
        />

        {/* End call */}
        <button
          onClick={onEndCall}
          className="flex items-center justify-center w-11 h-11 text-white transition-all group rounded-[var(--radius-md)]"
          style={{
            background: 'var(--danger)',
            boxShadow: '0 0 20px -6px var(--danger-glow)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--danger)' }}
          title="End Call"
        >
          <PhoneOff className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </motion.div>
    </div>
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
}

function ControlButton({
  onClick,
  disabled,
  active,
  label,
  icon,
  variant = 'default',
  danger = false,
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  function getStyle(): React.CSSProperties {
    if (variant === 'recording') {
      return {
        background: 'rgba(245,158,11,0.15)',
        border: '1px solid rgba(245,158,11,0.25)',
        color: '#fbbf24',
      }
    }
    if (danger) {
      return {
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#f87171',
      }
    }
    if (active) {
      return {
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-bright)',
        color: 'var(--text-primary)',
      }
    }
    return {
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-bright)',
      color: 'var(--text-secondary)',
    }
  }

  return (
    <div className="relative group flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={getStyle()}
        aria-label={label}
      >
        <motion.div
          animate={{ scale: isHovered && !disabled ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
      </button>

      <div
        className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-[var(--radius-sm)] shadow-lg whitespace-nowrap pointer-events-none z-50"
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </div>
    </div>
  )
}
