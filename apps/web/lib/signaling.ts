import type { SignalingMessage } from './types'

export type SignalingCallbacks = {
  onJoined: (role: 'polite' | 'impolite', peerPresent: boolean) => void
  onOffer: (sdp: RTCSessionDescriptionInit) => void
  onAnswer: (sdp: RTCSessionDescriptionInit) => void
  onIce: (candidate: RTCIceCandidateInit) => void
  onPeerJoined: () => void
  onPeerLeft: () => void
  onRoomFull: () => void
  onConnectionLost: () => void
}

type SignalingState = 'connecting' | 'connected' | 'reconnecting' | 'closed'

const PING_INTERVAL_MS = 30_000
const MAX_RETRIES = 3
const BASE_BACKOFF_MS = 2_000

export class SignalingClient {
  private ws: WebSocket | null = null
  private state: SignalingState = 'connecting'
  private retries = 0
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private pongTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private readonly url: string,
    private readonly roomId: string,
    private readonly callbacks: SignalingCallbacks,
  ) {}

  connect(): void {
    this.ws = new WebSocket(this.url)
    this.ws.onopen = this.handleOpen
    this.ws.onmessage = this.handleMessage
    this.ws.onclose = this.handleClose
    this.ws.onerror = this.handleError
  }

  send(msg: SignalingMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  close(): void {
    this.state = 'closed'
    this.clearTimers()
    this.ws?.close(1000, 'User left')
    this.ws = null
  }

  private handleOpen = (): void => {
    this.state = 'connected'
    this.retries = 0
    this.send({ type: 'join', roomId: this.roomId })
    this.startPing()
  }

  private handleMessage = (event: MessageEvent<string>): void => {
    let msg: SignalingMessage
    try {
      msg = JSON.parse(event.data) as SignalingMessage
    } catch {
      console.warn('[signaling] failed to parse message')
      return
    }

    switch (msg.type) {
      case 'pong':
        this.clearPongTimeout()
        break
      case 'joined':
        this.callbacks.onJoined(msg.role, msg.peerPresent)
        break
      case 'offer':
        this.callbacks.onOffer(msg.sdp as RTCSessionDescriptionInit)
        break
      case 'answer':
        this.callbacks.onAnswer(msg.sdp as RTCSessionDescriptionInit)
        break
      case 'ice':
        this.callbacks.onIce(msg.candidate as RTCIceCandidateInit)
        break
      case 'peer-joined':
        this.callbacks.onPeerJoined()
        break
      case 'peer-left':
        this.callbacks.onPeerLeft()
        break
      case 'room-full':
        this.callbacks.onRoomFull()
        break
    }
  }

  private handleClose = (event: CloseEvent): void => {
    this.clearTimers()

    if (this.state === 'closed') return

    if (event.code === 1000 || event.code === 4001) return

    if (this.retries < MAX_RETRIES) {
      this.state = 'reconnecting'
      const delay = BASE_BACKOFF_MS * Math.pow(2, this.retries)
      this.retries++
      console.log(`[signaling] reconnecting in ${delay}ms (attempt ${this.retries}/${MAX_RETRIES})`)
      this.reconnectTimer = setTimeout(() => this.connect(), delay)
    } else {
      this.state = 'closed'
      this.callbacks.onConnectionLost()
    }
  }

  private handleError = (): void => {
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.clearPongTimeout()
        this.send({ type: 'ping' })
        this.pongTimer = setTimeout(() => {
          console.warn('[signaling] pong timeout — closing')
          this.ws?.close()
        }, 5_000)
      }
    }, PING_INTERVAL_MS)
  }

  private clearPongTimeout(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer)
      this.pongTimer = null
    }
  }

  private clearTimers(): void {
    if (this.pingTimer) clearInterval(this.pingTimer)
    if (this.pongTimer) clearTimeout(this.pongTimer)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.pingTimer = null
    this.pongTimer = null
    this.reconnectTimer = null
  }
}
