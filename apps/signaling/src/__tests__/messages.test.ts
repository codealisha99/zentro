import { describe, it, expect } from 'vitest'
import { parseMessage } from '../messages.js'

describe('parseMessage', () => {
  it('parses a valid join message', () => {
    const msg = parseMessage(JSON.stringify({ type: 'join', roomId: 'abc-123' }))
    expect(msg).toEqual({ type: 'join', roomId: 'abc-123' })
  })

  it('parses a ping message', () => {
    const msg = parseMessage(JSON.stringify({ type: 'ping' }))
    expect(msg).toEqual({ type: 'ping' })
  })

  it('returns null for invalid JSON', () => {
    expect(parseMessage('not json')).toBeNull()
  })

  it('returns null for missing type', () => {
    expect(parseMessage(JSON.stringify({ roomId: 'abc' }))).toBeNull()
  })

  it('returns null for null', () => {
    expect(parseMessage('null')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseMessage('')).toBeNull()
  })
})
