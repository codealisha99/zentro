import { describe, it, expect, beforeEach, vi } from 'vitest'

class MockWS {
  send = vi.fn()
  close = vi.fn()
  readyState = 1
}

describe('room', () => {
  type Role = 'polite' | 'impolite'
  type Peer = { ws: MockWS; role: Role; joinedAt: number }
  type Room = { id: string; peers: Peer[]; cleanupTimer: ReturnType<typeof setTimeout> | null }

  function makeRoomStore() {
    const rooms = new Map<string, Room>()

    function getOrCreate(roomId: string): Room {
      const ex = rooms.get(roomId)
      if (ex) return ex
      const room: Room = { id: roomId, peers: [], cleanupTimer: null }
      rooms.set(roomId, room)
      return room
    }

    function join(roomId: string, ws: MockWS): { room: Room; peer: Peer } | { full: true } {
      const room = getOrCreate(roomId)
      if (room.peers.length >= 2) return { full: true }
      const role: Role = room.peers.length === 0 ? 'polite' : 'impolite'
      const peer: Peer = { ws, role, joinedAt: Date.now() }
      room.peers.push(peer)
      return { room, peer }
    }

    function leave(roomId: string, ws: MockWS): number {
      const room = rooms.get(roomId)
      if (!room) return -1
      room.peers = room.peers.filter((p) => p.ws !== ws)
      return room.peers.length
    }

    return { join, leave, rooms }
  }

  let store: ReturnType<typeof makeRoomStore>

  beforeEach(() => {
    store = makeRoomStore()
  })

  it('assigns polite role to first joiner', () => {
    const ws = new MockWS()
    const result = store.join('room-1', ws)
    expect('full' in result).toBe(false)
    if (!('full' in result)) {
      expect(result.peer.role).toBe('polite')
    }
  })

  it('assigns impolite role to second joiner', () => {
    const ws1 = new MockWS()
    const ws2 = new MockWS()
    store.join('room-1', ws1)
    const result = store.join('room-1', ws2)
    expect('full' in result).toBe(false)
    if (!('full' in result)) {
      expect(result.peer.role).toBe('impolite')
    }
  })

  it('rejects third joiner', () => {
    const ws1 = new MockWS()
    const ws2 = new MockWS()
    const ws3 = new MockWS()
    store.join('room-1', ws1)
    store.join('room-1', ws2)
    const result = store.join('room-1', ws3)
    expect('full' in result).toBe(true)
  })

  it('removes peer on leave and returns remaining count', () => {
    const ws1 = new MockWS()
    const ws2 = new MockWS()
    store.join('room-1', ws1)
    store.join('room-1', ws2)
    const remaining = store.leave('room-1', ws1)
    expect(remaining).toBe(1)
  })

  it('allows new joiner after one leaves', () => {
    const ws1 = new MockWS()
    const ws2 = new MockWS()
    const ws3 = new MockWS()
    store.join('room-1', ws1)
    store.join('room-1', ws2)
    store.leave('room-1', ws1)
    const result = store.join('room-1', ws3)
    expect('full' in result).toBe(false)
  })

  it('handles leave for unknown room gracefully', () => {
    const ws = new MockWS()
    const remaining = store.leave('nonexistent', ws)
    expect(remaining).toBe(-1)
  })
})
