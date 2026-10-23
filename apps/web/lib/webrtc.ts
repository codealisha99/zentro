import type { ConnectionState } from './types'
import type { SignalingClient } from './signaling'

export type { ConnectionState }

type DataMessage =
  | { type: 'chat'; text: string }
  | { type: 'name'; value: string }

export type WebRTCCallbacks = {
  onRemoteStream: (stream: MediaStream) => void
  onConnectionStateChange: (state: ConnectionState) => void
  onTrackEnded: (kind: string) => void
  onMessage?: (message: string) => void
  onDataChannelOpen?: () => void
  onPeerName?: (name: string) => void
}

const ICE_RECONNECT_GRACE_MS = 5_000

// Public free TURN relays (Metered open relay) so calls still connect when a
// strict NAT blocks direct peer-to-peer. Set NEXT_PUBLIC_TURN_URL /
// NEXT_PUBLIC_TURN_USERNAME / NEXT_PUBLIC_TURN_CREDENTIAL to use your own.
const DEFAULT_TURN = process.env.NEXT_PUBLIC_TURN_URL
  ? { urls: process.env.NEXT_PUBLIC_TURN_URL.split(','), username: process.env.NEXT_PUBLIC_TURN_USERNAME, credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL }
  : {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    }

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    DEFAULT_TURN,
  ],
}

export class PeerConnection {
  private pc: RTCPeerConnection
  private role: 'polite' | 'impolite'
  private signaling: SignalingClient
  private callbacks: WebRTCCallbacks
  private connectionState: ConnectionState = 'idle'

  private iceCandidateBuffer: RTCIceCandidateInit[] = []
  private remoteDescriptionSet = false

  private makingOffer = false
  private ignoreOffer = false

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  private dataChannel: RTCDataChannel | null = null

  constructor(
    role: 'polite' | 'impolite',
    localStream: MediaStream,
    signaling: SignalingClient,
    callbacks: WebRTCCallbacks,
  ) {
    this.role = role
    this.signaling = signaling
    this.callbacks = callbacks
    this.pc = new RTCPeerConnection(RTC_CONFIG)

    localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, localStream)

      track.onended = () => {
        callbacks.onTrackEnded(track.kind)
      }
    })

    if (this.role === 'impolite') {
      this.dataChannel = this.pc.createDataChannel('chat')
      this.setupDataChannel(this.dataChannel)
    }

    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel
      this.setupDataChannel(this.dataChannel)
    }

    this.setupHandlers()
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      this.callbacks.onDataChannelOpen?.()
    }
    channel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as DataMessage
        if (msg.type === 'chat') {
          this.callbacks.onMessage?.(msg.text)
        } else if (msg.type === 'name') {
          this.callbacks.onPeerName?.(msg.value)
        }
      } catch {
        this.callbacks.onMessage?.(event.data as string)
      }
    }
  }

  private sendData(msg: DataMessage): boolean {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(msg))
      return true
    }
    return false
  }

  private setupHandlers(): void {
    this.pc.ontrack = (event) => {
      const [stream] = event.streams
      if (stream) this.callbacks.onRemoteStream(stream)
    }

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send({ type: 'ice', candidate: event.candidate.toJSON() })
      }
    }

    this.pc.oniceconnectionstatechange = () => {
      const iceState = this.pc.iceConnectionState
      console.log(`[webrtc] ICE state: ${iceState}`)

      switch (iceState) {
        case 'checking':
          this.updateState('connecting')
          break
        case 'connected':
        case 'completed':
          this.clearReconnectTimer()
          this.updateState('connected')
          break
        case 'disconnected':
          this.updateState('reconnecting')
          this.reconnectTimer = setTimeout(() => {
            if (this.pc.iceConnectionState === 'disconnected') {
              this.updateState('failed')
            }
          }, ICE_RECONNECT_GRACE_MS)
          break
        case 'failed':
          this.clearReconnectTimer()
          this.updateState('failed')
          break
        case 'closed':
          this.clearReconnectTimer()
          this.updateState('idle')
          break
      }
    }

    this.pc.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true
        await this.pc.setLocalDescription()
        if (this.pc.localDescription) {
          this.signaling.send({ type: 'offer', sdp: this.pc.localDescription })
        }
      } catch (err) {
        console.error('[webrtc] onnegotiationneeded error:', err)
      } finally {
        this.makingOffer = false
      }
    }
  }

  async handleOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    const offerCollision =
      this.makingOffer || this.pc.signalingState !== 'stable'

    this.ignoreOffer = !this.isPolite() && offerCollision

    if (this.ignoreOffer) {
      return
    }

    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
      this.onRemoteDescriptionSet()

      await this.pc.setLocalDescription()
      if (this.pc.localDescription) {
        this.signaling.send({ type: 'answer', sdp: this.pc.localDescription })
      }
    } catch (err) {
      console.error('[webrtc] handleOffer error:', err)
    }
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (this.pc.signalingState === 'stable') {
      return
    }
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
      this.onRemoteDescriptionSet()
    } catch (err) {
      console.error('[webrtc] handleAnswer error:', err)
    }
  }

  async handleIce(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.remoteDescriptionSet) {
      this.iceCandidateBuffer.push(candidate)
      return
    }
    await this.addIceCandidate(candidate)
  }

  private async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (err) {
      if (!this.ignoreOffer) {
        console.error('[webrtc] addIceCandidate error:', err)
      }
    }
  }

  private async onRemoteDescriptionSet(): Promise<void> {
    this.remoteDescriptionSet = true
    const buffered = [...this.iceCandidateBuffer]
    this.iceCandidateBuffer = []
    for (const candidate of buffered) {
      await this.addIceCandidate(candidate)
    }
  }

  close(): void {
    this.clearReconnectTimer()
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    this.pc.close()
    this.updateState('idle')
  }

  async replaceVideoTrack(track: MediaStreamTrack): Promise<void> {
    const senders = this.pc.getSenders()
    const videoSender = senders.find((s) => s.track && s.track.kind === 'video')
    if (videoSender) {
      await videoSender.replaceTrack(track)
    }
  }

  sendMessage(message: string): boolean {
    return this.sendData({ type: 'chat', text: message })
  }

  sendName(name: string): void {
    this.sendData({ type: 'name', value: name })
  }

  isDataChannelOpen(): boolean {
    return this.dataChannel?.readyState === 'open'
  }

  private isPolite(): boolean {
    return this.role === 'polite'
  }

  private updateState(state: ConnectionState): void {
    if (this.connectionState === state) return
    this.connectionState = state
    this.callbacks.onConnectionStateChange(state)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
