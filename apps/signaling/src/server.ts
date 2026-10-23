import { WebSocketServer, WebSocket } from 'ws'
import { parseMessage, send } from './messages.js'
import { joinRoom, leaveRoom, getOtherPeer, getRoomForPeer } from './room.js'

const PORT = parseInt(process.env.PORT ?? '8080', 10)

const wss = new WebSocketServer({ port: PORT })

console.log(`Signaling server listening on port ${PORT}`)

const HEARTBEAT_INTERVAL_MS = 30_000

function startHeartbeat(ws: WebSocket): NodeJS.Timeout {
  return setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping()
    }
  }, HEARTBEAT_INTERVAL_MS)
}

wss.on('connection', (ws: WebSocket) => {
  let roomId: string | null = null
  const heartbeat = startHeartbeat(ws)

  ws.on('pong', () => {
  })

  ws.on('message', (data: Buffer) => {
    const msg = parseMessage(data.toString())
    if (!msg) {
      console.warn('Received unparseable message')
      return
    }

    if (msg.type === 'ping') {
      send(ws, { type: 'pong' })
      return
    }

    if (msg.type === 'join') {
      roomId = msg.roomId

      const result = joinRoom(roomId, ws)

      if ('full' in result) {
        send(ws, { type: 'room-full' })
        ws.close(4001, 'Room full')
        return
      }

      const { room, peer } = result
      const peerPresent = room.peers.length === 2

      send(ws, { type: 'joined', role: peer.role, peerPresent })

      if (peerPresent) {
        const other = getOtherPeer(room, ws)
        if (other) send(other.ws, { type: 'peer-joined' })
      }

      return
    }

    if (!roomId) {
      console.warn('Message received before join:', msg.type)
      return
    }

    const roomResult = getRoomForPeer(ws)
    if (!roomResult) return

    const { room } = roomResult
    const other = getOtherPeer(room, ws)

    if (!other) {
      return
    }

    switch (msg.type) {
      case 'offer':
        console.log(`[room:${roomId}] relaying offer`)
        send(other.ws, { type: 'offer', sdp: msg.sdp })
        break
      case 'answer':
        console.log(`[room:${roomId}] relaying answer`)
        send(other.ws, { type: 'answer', sdp: msg.sdp })
        break
      case 'ice':
        send(other.ws, { type: 'ice', candidate: msg.candidate })
        break
      default:
        console.warn(`[room:${roomId}] unknown message type`)
    }
  })

  ws.on('close', () => {
    clearInterval(heartbeat)

    if (!roomId) return

    const result = leaveRoom(roomId, ws)
    if (!result) return

    const { room } = result
    for (const peer of room.peers) {
      send(peer.ws, { type: 'peer-left' })
    }
  })

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message)
  })
})
