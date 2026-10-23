import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type { TranscriptSegment } from '@/lib/types'

const GROQ_MAX_FILE_BYTES = 25 * 1024 * 1024

export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  if (file.size > GROQ_MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 25MB)` },
      { status: 413 },
    )
  }

  const groq = new Groq({ apiKey })

  try {
    const audioFile = new File([file], 'recording.webm', { type: file.type || 'audio/webm' })

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
    })

    const segments: TranscriptSegment[] = (
      (transcription as unknown as { segments?: Array<{ start: number; end: number; text: string }> })
        .segments ?? []
    ).map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    }))

    return NextResponse.json({
      segments,
      text: transcription.text,
    })
  } catch (err) {
    console.error('[transcribe] Groq API error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
