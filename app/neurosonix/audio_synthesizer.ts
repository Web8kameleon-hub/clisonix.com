import fs from "fs/promises";
import path from "path";

export interface ToneOptions {
  freq: number;
  amplitude?: number;
  mod?: number;
  durationSeconds?: number;
  sampleRate?: number;
  modulationFrequency?: number;
}

export class AudioSynthesizer {
  constructor(
    private readonly sampleRate: number = 44100,
    private readonly defaultDuration: number = 3
  ) {}

  /**
   * Generate a PCM16 WAV buffer using a sine carrier with optional amplitude modulation.
   */
  generate_tone(options: ToneOptions): Buffer {
    const sampleRate = options.sampleRate ?? this.sampleRate;
    const duration = options.durationSeconds ?? this.defaultDuration;
    const totalSamples = Math.max(1, Math.floor(sampleRate * duration));
    const amplitude = Math.min(1, Math.max(0, options.amplitude ?? 0.7));
    const modulationDepth = Math.min(1, Math.max(0, options.mod ?? 0));
    const modulationFrequency = options.modulationFrequency ?? 2.5;
    const carrierFrequency = options.freq;

    const pcmData = Buffer.alloc(totalSamples * 2);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const carrier = Math.sin(2 * Math.PI * carrierFrequency * t);
      const modulator = 1 - modulationDepth + modulationDepth * Math.sin(2 * Math.PI * modulationFrequency * t + Math.PI / 2);
      const sample = amplitude * carrier * modulator;
      const clamped = Math.max(-1, Math.min(1, sample));
      pcmData.writeInt16LE(Math.round(clamped * 0x7fff), i * 2);
    }

    return this.wrapAsWav(pcmData, sampleRate);
  }

  /**
   * Generate the tone and write it to disk as a WAV file.
   */
  async writeTone(filePath: string, options: ToneOptions): Promise<string> {
    const buffer = this.generate_tone(options);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  private wrapAsWav(pcm: Buffer, sampleRate: number): Buffer {
    const bytesPerSample = 2; // 16-bit mono
    const blockAlign = bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const subChunk2Size = pcm.length;
    const chunkSize = 36 + subChunk2Size;

    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(chunkSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16); // PCM header size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(1, 22); // Mono channel
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bytesPerSample * 8, 34); // bits per sample
    header.write("data", 36);
    header.writeUInt32LE(subChunk2Size, 40);

    return Buffer.concat([header, pcm]);
  }
}
