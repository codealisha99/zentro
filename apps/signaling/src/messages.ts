export type Role = 'polite' | 'impolite'

export type IncomingMessage =
  | { type: 'join'; roomId: string }
  | { type: 'offer'; sdp: unknown }
  | { type: 'answer'; sdp: unknown }
  | { type: 'ice'; candidate: unknown }
  | { type: 'ping' }

export type OutgoingMessage =
  | { type: 'joined'; role: Role; peerPresent: boolean }
  | { type: 'offer'; sdp: unknown }
  | { type: 'answer'; sdp: unknown }
  | { type: 'ice'; candidate: unknown }
  | { type: 'peer-joined' }
  | { type: 'peer-left' }
  | { type: 'room-full' }
  | { type: 'pong' }

export function parseMessage(raw: string): IncomingMessage | null {
  try {
    const msg = JSON.parse(raw) as unknown
    if (typeof msg !== 'object' || msg === null || !('type' in msg)) return null
    const m = msg as Record<string, unknown>
    switch (m.type) {
      case 'join':
        return typeof m.roomId === 'string' ? (m as unknown as IncomingMessage) : null
      case 'offer':
      case 'answer':
        return m.sdp !== undefined ? (m as unknown as IncomingMessage) : null
      case 'ice':
        return m.candidate !== undefined ? (m as unknown as IncomingMessage) : null
      case 'ping':
        return { type: 'ping' }
      default:
        return null
    }
  } catch {
    return null
  }
}

export function send(ws: { send: (data: string) => void }, msg: OutgoingMessage): void {
  ws.send(JSON.stringify(msg))
}
