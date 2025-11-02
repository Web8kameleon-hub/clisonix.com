import { NextResponse } from 'next/server'

const arrayBufferCtor = typeof globalThis.ArrayBuffer === 'function' ? globalThis.ArrayBuffer : undefined

type SymphonyOptions = {
  durationSeconds: number
  sampleRate: number
  melody: number[]
}

// Precompute a short synthetic WAV buffer that the frontend can stream without external assets.
function createSymphonyBuffer({ durationSeconds, sampleRate, melody }: SymphonyOptions): Buffer {
  const numChannels = 1
  const bitsPerSample = 16
  const totalSamples = Math.floor(durationSeconds * sampleRate)
  const bytesPerSample = bitsPerSample / 8
  const dataChunkSize = totalSamples * numChannels * bytesPerSample

  const buffer = Buffer.allocUnsafe(44 + dataChunkSize)
  let offset = 0

  // RIFF header
  buffer.write('RIFF', offset)
  offset += 4
  buffer.writeUInt32LE(36 + dataChunkSize, offset)
  offset += 4
  buffer.write('WAVE', offset)
  offset += 4

  // fmt subchunk
  buffer.write('fmt ', offset)
  offset += 4
  buffer.writeUInt32LE(16, offset) // Subchunk1Size (PCM)
  offset += 4
  buffer.writeUInt16LE(1, offset) // AudioFormat (PCM)
  offset += 2
  buffer.writeUInt16LE(numChannels, offset)
  offset += 2
  buffer.writeUInt32LE(sampleRate, offset)
  offset += 4
  const byteRate = sampleRate * numChannels * bytesPerSample
  buffer.writeUInt32LE(byteRate, offset)
  offset += 4
  const blockAlign = numChannels * bytesPerSample
  buffer.writeUInt16LE(blockAlign, offset)
  offset += 2
  buffer.writeUInt16LE(bitsPerSample, offset)
  offset += 2

  // data subchunk
  buffer.write('data', offset)
  offset += 4
  buffer.writeUInt32LE(dataChunkSize, offset)
  offset += 4

  const amplitude = 0.75
  const envelopeAttack = Math.floor(sampleRate * 0.2)
  const envelopeRelease = Math.floor(sampleRate * 0.4)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate

    // Soft ADSR-style amplitude envelope for a smoother start/end
    let envelope = 1
    if (i < envelopeAttack) {
      envelope = i / envelopeAttack
    } else if (totalSamples - i < envelopeRelease) {
      envelope = (totalSamples - i) / envelopeRelease
    }

    // Blend a few harmonic layers to make the tone less sterile
    const baseTone = melody.reduce((acc, freq, idx) => {
      const harmonicAmplitude = 1 / (idx + 1)
      return acc + Math.sin(2 * Math.PI * freq * t) * harmonicAmplitude
    }, 0)

    const modulator = Math.sin(2 * Math.PI * 0.5 * t) // slow modulation for a vibrato-like effect
    const sample = baseTone * (1 + 0.1 * modulator) * envelope * amplitude
    const clamped = Math.max(-1, Math.min(1, sample))
    const intSample = Math.floor(clamped * 0x7fff)

    buffer.writeInt16LE(intSample, 44 + i * bytesPerSample)
  }

  return buffer
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const durationParam = Number(url.searchParams.get('duration'))
    const durationSeconds = Number.isFinite(durationParam) && durationParam > 0 && durationParam <= 12
      ? durationParam
      : 6

    const melody: number[] = [
      220, // A3 base
      330, // E4
      440, // A4
      554.37 // C#5 for a gentle leading tone
    ]

    const buffer = createSymphonyBuffer({
      durationSeconds,
      sampleRate: 44100,
      melody
    })

    const body: BodyInit = (arrayBufferCtor
      ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      : buffer) as BodyInit

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Failed to generate neural symphony:', error)
    return NextResponse.json({ error: 'Unable to synthesize audio' }, { status: 500 })
  }
}
