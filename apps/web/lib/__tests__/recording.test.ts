import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioRecorder } from '../recording'

class MockMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true)
  start = vi.fn()
  stop = vi.fn()
  requestData = vi.fn()
  mimeType = 'audio/webm;codecs=opus'
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
}

class MockMediaStream {
  getAudioTracks = vi.fn().mockReturnValue([{ kind: 'audio', onended: null }])
}

vi.stubGlobal('MediaRecorder', MockMediaRecorder)
vi.stubGlobal('MediaStream', MockMediaStream)

describe('AudioRecorder', () => {
  let stream: MockMediaStream
  let onSizeWarning: ReturnType<typeof vi.fn>
  let onStopped: ReturnType<typeof vi.fn>
  let recorder: AudioRecorder

  beforeEach(() => {
    stream = new MockMediaStream()
    onSizeWarning = vi.fn()
    onStopped = vi.fn()
    recorder = new AudioRecorder(stream as unknown as MediaStream, { onSizeWarning, onStopped })
  })

  it('is not recording initially', () => {
    expect(recorder.recording).toBe(false)
  })

  it('starts recording', () => {
    recorder.start()
    expect(recorder.recording).toBe(true)
  })

  it('does not double-start', () => {
    recorder.start()
    recorder.start()
    expect(recorder.recording).toBe(true)
  })

  it('accumulates chunks and assembles blob on stop', () => {
    recorder.start()

    const mr = (recorder as unknown as { recorder: MockMediaRecorder }).recorder

    const chunk1 = new Blob(['audio1'])
    const chunk2 = new Blob(['audio2'])
    mr.ondataavailable?.({ data: chunk1 })
    mr.ondataavailable?.({ data: chunk2 })

    mr.onstop?.()
    expect(onStopped).toHaveBeenCalledWith(expect.any(Blob))
  })

  it('calls requestData before stop', () => {
    recorder.start()
    const mr = (recorder as unknown as { recorder: MockMediaRecorder }).recorder
    recorder.stop()
    expect(mr.requestData).toHaveBeenCalled()
    expect(mr.stop).toHaveBeenCalled()
  })

  it('isTooBig returns false for small blobs', () => {
    const small = new Blob(['x'.repeat(100)])
    expect(AudioRecorder.isTooBig(small)).toBe(false)
  })

  it('isTooBig returns true for blobs > 24MB', () => {
    const big = { size: 25 * 1024 * 1024 } as Blob
    expect(AudioRecorder.isTooBig(big)).toBe(true)
  })
})
