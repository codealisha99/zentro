'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VideoGrid } from '@/components/VideoGrid'
import { Controls } from '@/components/Controls'
import { Transcript } from '@/components/Transcript'
import { ConnectionBanner } from '@/components/ConnectionBanner'
import { Lobby } from '@/components/Lobby'
import { Participants } from '@/components/Participants'
import { SignalingClient } from '@/lib/signaling'
import { PeerConnection } from '@/lib/webrtc'
import { AudioRecorder } from '@/lib/recording'
import { transcribeAudio } from '@/lib/groq'
import type { ConnectionState, TranscriptSegment } from '@/lib/types'
import { Video, Copy, Check, Download, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundVignette } from '@/components/BackgroundVignette'

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'ws://localhost:8080'

type ChatMessage = { sender: 'me' | 'peer'; text: string }

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [phase, setPhase] = useState<'lobby' | 'meeting'>('lobby')
  const [localName, setLocalName] = useState('')
  const [remoteName, setRemoteName] = useState<string | null>(null)

  const localNameRef = useRef<string>('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [peerJoined, setPeerJoined] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const replayRef = useRef<HTMLAudioElement>(null)

  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [dataChannelOpen, setDataChannelOpen] = useState(false)
  const [peerAudioOn, setPeerAudioOn] = useState(true)
  const [peerVideoOn, setPeerVideoOn] = useState(true)

  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const meetingContainerRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const signalingRef = useRef<SignalingClient | null>(null)
  const peerRef = useRef<PeerConnection | null>(null)
  const recorderRef = useRef<AudioRecorder | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const recordingBlobUrl = useMemo(() => {
    if (!recordingBlob) return null
    return URL.createObjectURL(recordingBlob)
  }, [recordingBlob])

  useEffect(() => {
    return () => {
      if (recordingBlobUrl) URL.revokeObjectURL(recordingBlobUrl)
    }
  }, [recordingBlobUrl])

  const showToast = useCallback((message: string, durationMs = 4_000) => {
    setToast(message)
    setTimeout(() => setToast(null), durationMs)
  }, [])

  const currentMediaState = useCallback(() => {
    const s = localStreamRef.current
    return {
      audio: s?.getAudioTracks()[0]?.enabled ?? true,
      video: s?.getVideoTracks()[0]?.enabled ?? true,
    }
  }, [])

  const endCall = useCallback(() => {
    recorderRef.current?.stop()
    peerRef.current?.close()
    signalingRef.current?.close()
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    router.push('/')
  }, [router])

  const handleToggleFullscreen = useCallback(async () => {
    if (!meetingContainerRef.current) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await meetingContainerRef.current.requestFullscreen()
      }
    } catch {
      showToast('Fullscreen not available')
    }
  }, [showToast])

  // Sync fullscreen state when user presses Esc or the browser exits fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const revertToCamera = useCallback(async () => {
    if (!peerRef.current) return
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoTrack = camStream.getVideoTracks()[0]
      await peerRef.current.replaceVideoTrack(videoTrack)
      const audioTrack = localStreamRef.current?.getAudioTracks()[0]
      const newStream = new MediaStream([videoTrack, ...(audioTrack ? [audioTrack] : [])])
      localStreamRef.current?.getVideoTracks()[0]?.stop()
      localStreamRef.current = newStream
      setLocalStream(newStream)
      setIsScreenSharing(false)
      setVideoMuted(false)
    } catch {
      showToast('Failed to restore camera')
    }
  }, [showToast])

  useEffect(() => {
    let cancelled = false

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localStreamRef.current = stream
        setLocalStream(stream)
      } catch {
        showToast('Camera blocked — check browser permissions', 8_000)
      }
    }

    initCamera()

    return () => {
      cancelled = true
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [showToast])

  useEffect(() => {
    if (phase !== 'meeting') return

    const stream = localStreamRef.current
    if (!stream || stream.getTracks().every((t) => t.readyState === 'ended')) return

    const nameAtJoin = localNameRef.current

    const signaling = new SignalingClient(SIGNALING_URL, roomId, {
      onJoined: (role, peerPresent) => {
        peerRef.current?.close()

        const peer = new PeerConnection(role, stream, signaling, {
          onRemoteStream: (s) => setRemoteStream(s),
          onConnectionStateChange: (state) => {
            setConnectionState(state)
            if (state === 'failed') showToast('Call ended — connection lost', 10_000)
          },
          onTrackEnded: (kind) => {
            showToast(`${kind === 'video' ? 'Camera' : 'Microphone'} disconnected`, 6_000)
          },
          onMessage: (msg) => {
            setMessages((prev) => [...prev, { sender: 'peer', text: msg }])
            setChatOpen(true)
          },
          onDataChannelOpen: () => {
            setDataChannelOpen(true)
            peer.sendName(nameAtJoin)
            peer.sendState(currentMediaState())
          },
          onPeerName: (name) => {
            setRemoteName(name)
            showToast(`${name} joined`, 3_000)
          },
          onPeerState: (state) => {
            setPeerAudioOn(state.audio)
            setPeerVideoOn(state.video)
          },
        })

        peerRef.current = peer

        recorderRef.current = new AudioRecorder(stream, {
          onSizeWarning: (mb) => {
            showToast(`Recording auto-stopped: ${mb.toFixed(0)}MB limit reached`)
            setIsRecording(false)
          },
          onStopped: (blob) => {
            setIsRecording(false)
            setRecordingBlob(blob)
          },
        })

        if (peerPresent) {
          setConnectionState('connecting')
          setPeerJoined(true)
          showToast('Someone is already in the room', 5_000)
        }
      },
      onOffer: (sdp) => peerRef.current?.handleOffer(sdp),
      onAnswer: (sdp) => peerRef.current?.handleAnswer(sdp),
      onIce: (candidate) => peerRef.current?.handleIce(candidate),
      onPeerJoined: () => {
        setPeerJoined(true)
        setConnectionState('connecting')
        setPeerAudioOn(true)
        setPeerVideoOn(true)
        showToast('Someone joined the room', 5_000)
      },
      onPeerLeft: () => {
        setRemoteStream(null)
        setPeerJoined(false)
        setDataChannelOpen(false)
        setRemoteName(null)
        setPeerAudioOn(true)
        setPeerVideoOn(true)
        setConnectionState('idle')
        showToast('Peer left the call')
      },
      onRoomFull: () => {
        showToast('Room is full — only 2 participants allowed', 8_000)
        router.push('/')
      },
      onConnectionLost: () => {
        showToast("Can't reach signaling server — please rejoin", 10_000)
      },
    })

    signalingRef.current = signaling
    signaling.connect()

    return () => {
      peerRef.current?.close()
      signalingRef.current?.close()
    }
  }, [phase, roomId, showToast, router, currentMediaState])

  useEffect(() => {
    if (phase !== 'meeting') return
    const start = Date.now()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1_000)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    const handler = () => {
      recorderRef.current?.stop()
      signalingRef.current?.close()
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  function handleJoin(name: string) {
    localNameRef.current = name
    setLocalName(name)
    setPhase('meeting')
  }

  function handleToggleAudio() {
    if (!localStreamRef.current) return
    const track = localStreamRef.current.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setAudioMuted(!track.enabled)
    peerRef.current?.sendState(currentMediaState())
  }

  function handleToggleVideo() {
    if (!localStreamRef.current) return
    const track = localStreamRef.current.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setVideoMuted(!track.enabled)
    peerRef.current?.sendState(currentMediaState())
  }

  async function handleToggleScreenShare() {
    if (!peerRef.current || !localStreamRef.current) return
    try {
      if (isScreenSharing) {
        await revertToCamera()
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const videoTrack = stream.getVideoTracks()[0]
        videoTrack.addEventListener('ended', () => revertToCamera())
        await peerRef.current.replaceVideoTrack(videoTrack)
        const audioTrack = localStreamRef.current.getAudioTracks()[0]
        const newLocalStream = new MediaStream([videoTrack, ...(audioTrack ? [audioTrack] : [])])
        setLocalStream(newLocalStream)
        localStreamRef.current.getVideoTracks()[0]?.stop()
        localStreamRef.current = newLocalStream
        setIsScreenSharing(true)
        setVideoMuted(false)
      }
    } catch {
      showToast('Screen sharing failed or was cancelled')
    }
  }

  function handleToggleRecord() {
    if (!recorderRef.current) return
    if (isRecording) {
      recorderRef.current.stop()
    } else {
      setSegments([])
      setRecordingBlob(null)
      recorderRef.current.start()
      setIsRecording(true)
    }
  }

  function handleSendMessage() {
    const text = chatInput.trim()
    if (!text || !peerRef.current) return
    const sent = peerRef.current.sendMessage(text)
    if (sent) {
      setMessages((prev) => [...prev, { sender: 'me', text }])
      setChatInput('')
    } else {
      showToast('Chat not ready yet — please wait for connection', 3_000)
    }
  }

  async function handleTranscribe() {
    if (!recordingBlob) return
    if (AudioRecorder.isTooBig(recordingBlob)) {
      showToast(`Recording too large (${(recordingBlob.size / 1024 / 1024).toFixed(1)}MB > 24MB)`)
      return
    }
    setIsTranscribing(true)
    try {
      const result = await transcribeAudio(recordingBlob)
      setSegments(result.segments)
    } catch {
      showToast('Transcription failed — try again')
    } finally {
      setIsTranscribing(false)
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    showToast('Meeting link copied!', 2_000)
    setTimeout(() => setLinkCopied(false), 2_000)
  }

  // Keyboard shortcuts: M mute, V camera, C chat (ignored while typing)
  useEffect(() => {
    if (phase !== 'meeting') return
    function isTypingTarget(el: EventTarget | null) {
      if (!(el instanceof HTMLElement)) return false
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
    }
    const handler = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      if (e.key === 'm' || e.key === 'M') {
        handleToggleAudio()
      } else if (e.key === 'v' || e.key === 'V') {
        handleToggleVideo()
      } else if (e.key === 'c' || e.key === 'C') {
        setChatOpen((p) => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'lobby') {
    return (
      <Lobby
        roomId={roomId}
        localStream={localStream}
        audioMuted={audioMuted}
        videoMuted={videoMuted}
        onJoin={handleJoin}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
      />
    )
  }

  const participantCount = peerJoined ? 2 : 1

  return (
    <div
      ref={meetingContainerRef}
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: '#080810', color: 'var(--text-primary)' }}
    >
      <BackgroundVignette />

      <div className="relative z-10 flex flex-col flex-1">
        <header
          className="flex items-center justify-between px-5 py-3 backdrop-blur-sm shrink-0"
          style={{
            background: 'rgba(8,8,16,0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-[120px]">
            <div
              className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-bright)' }}
            >
              <Video className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
            </div>
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
              zentro
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {isRecording && (
              <span
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.15em]"
                style={{ background: 'rgba(240,71,95,0.14)', color: 'var(--danger-bright)', border: '1px solid rgba(240,71,95,0.3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full rec-blink" style={{ background: 'var(--danger)' }} />
                REC
              </span>
            )}
            <span
              className="text-sm font-mono tabular-nums"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatElapsed(elapsed)}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[var(--radius-md)] border transition-all font-medium ${
                linkCopied
                  ? 'bg-green-500/15 border-green-500/30 text-green-400'
                  : ''
              }`}
              style={
                linkCopied
                  ? undefined
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }
              }
              onMouseEnter={(e) => {
                if (!linkCopied) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!linkCopied) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                }
              }}
            >
              {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {linkCopied ? 'Copied!' : roomId.slice(0, 8) + '…'}
            </button>
          </div>
        </header>

        <ConnectionBanner state={connectionState} />

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-16 left-1/2 -translate-x-1/2 text-sm px-4 py-2.5 rounded-full z-50 font-medium flex items-center gap-2.5"
              style={{
                background: 'rgba(18,20,31,0.94)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-lg)',
              }}
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ background: 'var(--accent-bright)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: 'var(--accent-bright)' }}
                />
              </span>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-bleed layout: video fills all space, controls float over it */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">

          {/* ── Video pane ─────────────────────────────────────────────── */}
          <div className="flex-1 relative min-h-0 min-w-0">

            {/* VideoGrid fills the entire pane */}
            <div className="absolute inset-0">
              <VideoGrid
                localStream={localStream}
                remoteStream={remoteStream}
                peerJoined={peerJoined}
                localName={localName}
                remoteName={remoteName}
                localIsScreenSharing={isScreenSharing}
                remoteAudioMuted={!peerAudioOn}
                remoteVideoOff={!peerVideoOn}
              />
            </div>

            {/* Recording panel — floats above the controls bar */}
            {recordingBlob && !isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute left-4 right-4 z-20 space-y-3 p-4 rounded-[var(--radius-lg)]"
                style={{
                  bottom: '88px',
                  background: 'rgba(18,20,31,0.88)',
                  backdropFilter: 'blur(24px) saturate(1.3)',
                  border: '1px solid var(--border-bright)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Recording label */}
                  <span
                    className="hidden sm:flex items-center gap-1.5 shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-1 rounded-full"
                    style={{ background: 'rgba(240,71,95,0.12)', color: 'var(--danger-bright)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full rec-blink" style={{ background: 'var(--danger)' }} />
                    Rec
                  </span>
                  <audio
                    ref={replayRef}
                    src={recordingBlobUrl ?? undefined}
                    controls
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    className="flex-1 h-10 min-w-0"
                  />
                  {segments.length === 0 && (
                    <button
                      onClick={handleTranscribe}
                      disabled={isTranscribing}
                      className="px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)] disabled:opacity-50 transition-colors text-white shrink-0 flex items-center gap-2"
                      style={{ background: 'var(--accent)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Transcribing…
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Transcribe
                        </>
                      )}
                    </button>
                  )}
                </div>
                <Transcript
                  segments={segments}
                  currentTime={currentTime}
                  isLoading={isTranscribing}
                />
              </motion.div>
            )}

            {/* Controls float at the bottom center */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <div className="pointer-events-auto">
                <Controls
                  audioMuted={audioMuted}
                  videoMuted={videoMuted}
                  isRecording={isRecording}
                  isScreenSharing={isScreenSharing}
                  chatOpen={chatOpen}
                  participantsOpen={participantsOpen}
                  participantCount={participantCount}
                  isFullscreen={isFullscreen}
                  onToggleAudio={handleToggleAudio}
                  onToggleVideo={handleToggleVideo}
                  onToggleScreenShare={handleToggleScreenShare}
                  onToggleChat={() => setChatOpen(!chatOpen)}
                  onToggleParticipants={() => setParticipantsOpen((p) => !p)}
                  onToggleFullscreen={handleToggleFullscreen}
                  onToggleRecord={handleToggleRecord}
                  onEndCall={endCall}
                  disabled={connectionState === 'failed'}
                />
              </div>
            </div>
          </div>

          {/* ── Side panels ────────────────────────────────────────────── */}
          {chatOpen && (
            <div
              className="w-80 shrink-0 flex flex-col overflow-hidden max-md:absolute max-md:inset-y-0 max-md:right-0 max-md:z-30 max-md:w-full max-md:shadow-2xl"
              style={{ borderLeft: '1px solid var(--border)', background: 'rgba(13,13,18,0.96)' }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center"
                    style={{ background: 'var(--accent-soft)', border: '1px solid rgba(155,123,255,0.22)' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                      In-call messages
                    </h3>
                    <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dataChannelOpen ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      {dataChannelOpen ? 'Encrypted, peer-to-peer' : 'Waiting for peer connection…'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-xs transition-colors rounded-md p-1"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4" style={{ color: 'var(--text-muted)' }}>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--accent-soft)', border: '1px solid rgba(155,123,255,0.2)' }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs leading-relaxed max-w-40">
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex flex-col max-w-[85%] ${
                      m.sender === 'me' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[10px] mb-1 px-1" style={{ color: 'var(--text-muted)' }}>
                      {m.sender === 'me' ? (localName || 'You') : (remoteName ?? 'Peer')}
                    </span>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        m.sender === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                      }`}
                      style={
                        m.sender === 'me'
                          ? {
                              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                              color: '#fff',
                              boxShadow: '0 4px 16px -6px var(--accent-glow)',
                            }
                          : { background: 'rgba(255,255,255,0.07)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                      }
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="relative">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={dataChannelOpen ? 'Type a message…' : 'Waiting for connection…'}
                    disabled={!dataChannelOpen}
                    className="w-full px-4 py-3 pr-12 text-sm rounded-[var(--radius-md)] outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!dataChannelOpen || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                    style={{ background: 'var(--accent)' }}
                    onMouseEnter={(e) => { if (!(e.currentTarget as HTMLButtonElement).disabled) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bright)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
                    aria-label="Send"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {participantsOpen && (
            <div
              className="w-72 shrink-0 overflow-y-auto max-md:absolute max-md:inset-y-0 max-md:right-0 max-md:z-30 max-md:w-full max-md:shadow-2xl"
              style={{ borderLeft: '1px solid var(--border)', background: 'rgba(13,13,18,0.96)' }}
            >
                <Participants
                  localName={localName}
                  remoteName={remoteName}
                  audioMuted={audioMuted}
                  videoMuted={videoMuted}
                  isScreenSharing={isScreenSharing}
                  peerJoined={peerJoined}
                  remoteAudioMuted={!peerAudioOn}
                  remoteVideoOff={!peerVideoOn}
                  onClose={() => setParticipantsOpen(false)}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
