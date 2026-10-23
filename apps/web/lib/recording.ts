export type RecordingCallbacks = {
  onSizeWarning: (sizeMb: number) => void
  onStopped: (blob: Blob) => void
}

const SOFT_LIMIT_BYTES = 20 * 1024 * 1024
const HARD_LIMIT_BYTES = 24 * 1024 * 1024

export class AudioRecorder {
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private totalSize = 0
  private isRecording = false

  constructor(
    private readonly localStream: MediaStream,
    private readonly callbacks: RecordingCallbacks,
  ) {}

  start(): void {
    if (this.isRecording) return

    const audioStream = new MediaStream(this.localStream.getAudioTracks())

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

    this.recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined)
    this.chunks = []
    this.totalSize = 0

    this.recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) return

      if (this.totalSize + event.data.size > SOFT_LIMIT_BYTES) {
        this.callbacks.onSizeWarning((this.totalSize + event.data.size) / (1024 * 1024))
        this.stop()
        return
      }

      this.chunks.push(event.data)
      this.totalSize += event.data.size
    }

    this.recorder.onstop = () => {
      this.isRecording = false
      const blob = new Blob(this.chunks, { type: this.recorder?.mimeType ?? 'audio/webm' })
      this.callbacks.onStopped(blob)
    }

    this.recorder.start(1_000)
    this.isRecording = true
  }

  stop(): void {
    if (!this.recorder || !this.isRecording) return

    try {
      this.recorder.requestData()
    } catch {
    }

    this.recorder.stop()
  }

  get recording(): boolean {
    return this.isRecording
  }

  static isTooBig(blob: Blob): boolean {
    return blob.size > HARD_LIMIT_BYTES
  }
}
