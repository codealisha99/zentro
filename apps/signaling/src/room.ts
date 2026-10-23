import type WebSocket from 'ws'
import type { Role } from './messages.js'

export type Peer = {
  ws: WebSocket
  role: Role
  joinedAt: number
}

export type Room = {
  id: string
  peers: Peer[]
  cleanupTimer: ReturnType<typeof setTimeout> | null
}

const rooms = new Map<string, Room>()

const ROOM_TTL_MS = 30 * 60 * 1000

function scheduleCleanup(roomId: string): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    rooms.delete(roomId)
    console.log(`[room:${roomId}] expired (TTL)`)
  }, ROOM_TTL_MS)
}

export function getOrCreateRoom(roomId: string): Room {
  const existing = rooms.get(roomId)
  if (existing) return existing

  const room: Room = { id: roomId, peers: [], cleanupTimer: null }
  rooms.set(roomId, room)
  console.log(`[room:${roomId}] created`)
  return room
}

export function joinRoom(roomId: string, ws: WebSocket): { room: Room; peer: Peer } | { full: true } {
  const room = getOrCreateRoom(roomId)

  if (room.peers.length >= 2) {
    return { full: true }
  }

  if (room.cleanupTimer) {
    clearTimeout(room.cleanupTimer)
    room.cleanupTimer = null
  }

  const role: Role = room.peers.length === 0 ? 'polite' : 'impolite'
  const peer: Peer = { ws, role, joinedAt: Date.now() }
  room.peers.push(peer)

  console.log(`[room:${roomId}] peer joined as ${role} (${room.peers.length}/2)`)
  return { room, peer }
}

export function leaveRoom(roomId: string, ws: WebSocket): { room: Room; remaining: number } | null {
  const room = rooms.get(roomId)
  if (!room) return null

  room.peers = room.peers.filter((p) => p.ws !== ws)
  const remaining = room.peers.length

  console.log(`[room:${roomId}] peer left (${remaining}/2)`)

  if (remaining === 0) {
    room.cleanupTimer = scheduleCleanup(roomId)
  }

  return { room, remaining }
}

export function getPeer(room: Room, ws: WebSocket): Peer | undefined {
  return room.peers.find((p) => p.ws === ws)
}

export function getOtherPeer(room: Room, ws: WebSocket): Peer | undefined {
  return room.peers.find((p) => p.ws !== ws)
}

export function getRoomForPeer(ws: WebSocket): { room: Room; roomId: string } | null {
  for (const [roomId, room] of rooms.entries()) {
    if (room.peers.some((p) => p.ws === ws)) {
      return { room, roomId }
    }
  }
  return null
}
