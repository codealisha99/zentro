import type { TranscriptSegment } from './types'

export type TranscriptionResult = {
  segments: TranscriptSegment[]
  text: string
}

export async function transcribeAudio(blob: Blob): Promise<TranscriptionResult> {
  const formData = new FormData()
  formData.append('file', blob, 'recording.webm')

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Transcription failed: ${response.status} ${error}`)
  }

  return response.json() as Promise<TranscriptionResult>
}
