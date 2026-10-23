import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SignalingClient } from '../signaling'

type WsListener = (event: unknown) => void

class MockWebSocket {
  static OPEN = 1
  static CLOSED = 3

  readyState = MockWebSocket.OPEN
  send = vi.fn()
  close = vi.fn()

  onopen: (() => void) | null = null
  onmessage: WsListener | null = null
  onclose: WsListener | null = null
  onerror: WsListener | null = null

  simulateOpen() { this.onopen?.() }
  simulateMessage(data: unknown) { this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent) }
  simulateClose(code = 1000) { this.onclose?.({ code } as CloseEvent) }
}

let mockWs: MockWebSocket

vi.stubGlobal('WebSocket', class {
  constructor() {
    mockWs = new MockWebSocket()
    return mockWs
  }
  static OPEN = 1
})

describe('SignalingClient', () => {
  let callbacks: Parameters<typeof SignalingClient.prototype.connect>[0] extends undefined
    ? never
    : ReturnType<() => {
        onJoined: ReturnType<typeof vi.fn>
        onOffer: ReturnType<typeof vi.fn>
        onAnswer: ReturnType<typeof vi.fn>
        onIce: ReturnType<typeof vi.fn>
        onPeerJoined: ReturnType<typeof vi.fn>
        onPeerLeft: ReturnType<typeof vi.fn>
        onRoomFull: ReturnType<typeof vi.fn>
        onConnectionLost: ReturnType<typeof vi.fn>
      }>

  beforeEach(() => {
    vi.useFakeTimers()
    callbacks = {
      onJoined: vi.fn(),
      onOffer: vi.fn(),
      onAnswer: vi.fn(),
      onIce: vi.fn(),
      onPeerJoined: vi.fn(),
      onPeerLeft: vi.fn(),
      onRoomFull: vi.fn(),
      onConnectionLost: vi.fn(),
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends join message on open', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'join', roomId: 'room-1' }))
  })

  it('calls onJoined callback on joined message', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()
    mockWs.simulateMessage({ type: 'joined', role: 'polite', peerPresent: false })
    expect(callbacks.onJoined).toHaveBeenCalledWith('polite', false)
  })

  it('calls onRoomFull callback', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()
    mockWs.simulateMessage({ type: 'room-full' })
    expect(callbacks.onRoomFull).toHaveBeenCalled()
  })

  it('attempts reconnect on unexpected close', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()
    mockWs.simulateClose(1006) // Abnormal closure
    vi.advanceTimersByTime(2_000)
    expect(callbacks.onConnectionLost).not.toHaveBeenCalled()
  })

  it('calls onConnectionLost after max retries', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()

    for (let i = 0; i < 3; i++) {
      mockWs.simulateClose(1006)
      vi.advanceTimersByTime(10_000) // advance past backoff
    }
    mockWs.simulateClose(1006)

    expect(callbacks.onConnectionLost).toHaveBeenCalled()
  })

  it('exponential backoff increases delay between retries', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()
    mockWs.simulateClose(1006)

    vi.advanceTimersByTime(1_999)
    mockWs.simulateClose(1006)
    vi.advanceTimersByTime(1)
    vi.advanceTimersByTime(3_999)
    mockWs.simulateClose(1006)
    vi.advanceTimersByTime(1)

    mockWs.simulateClose(1006)
    expect(callbacks.onConnectionLost).toHaveBeenCalled()
  })

  it('does not reconnect on normal close (1000)', () => {
    const client = new SignalingClient('ws://localhost', 'room-1', callbacks)
    client.connect()
    mockWs.simulateOpen()
    client.close() // sends 1000
    expect(callbacks.onConnectionLost).not.toHaveBeenCalled()
  })
})
