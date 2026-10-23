export type Role = 'polite' | 'impolite'

export type SignalingMessage =
  | { type: 'join'; roomId: string }
  | { type: 'joined'; role: Role; peerPresent: boolean }
  | { type: 'offer'; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit }
  | { type: 'ice'; candidate: RTCIceCandidateInit }
  | { type: 'peer-joined' }
  | { type: 'peer-left' }
  | { type: 'room-full' }
  | { type: 'ping' }
  | { type: 'pong' }

export type TranscriptSegment = {
  start: number
  end: number
  text: string
}

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'
