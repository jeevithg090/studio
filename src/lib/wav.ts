export interface WavOptions {
  channels?: number;
  sampleRate?: number;
  /** Bytes per sample (2 = 16-bit PCM). */
  sampleWidth?: number;
}

const HEADER_SIZE = 44;

/**
 * Wraps raw little-endian PCM samples in a canonical 44-byte RIFF/WAVE header
 * so browsers can play them in an `<audio>` element.
 */
export function pcmToWav(
  pcm: Uint8Array,
  { channels = 1, sampleRate = 24_000, sampleWidth = 2 }: WavOptions = {}
): Uint8Array {
  const byteRate = sampleRate * channels * sampleWidth;
  const blockAlign = channels * sampleWidth;
  const out = new Uint8Array(HEADER_SIZE + pcm.byteLength);
  const view = new DataView(out.buffer);

  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format: PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, sampleWidth * 8, true);
  writeAscii(36, 'data');
  view.setUint32(40, pcm.byteLength, true);
  out.set(pcm, HEADER_SIZE);
  return out;
}

const DEFAULT_TTS_SAMPLE_RATE = 24_000;

/**
 * Normalizes audio returned by a TTS model into WAV bytes. WAV input is
 * passed through unchanged; raw PCM (e.g. `audio/L16;rate=24000`) is wrapped
 * in a WAV header using the advertised sample rate.
 */
export function toWavBytes(mimeType: string, params: Record<string, string>, bytes: Uint8Array): Uint8Array {
  if (mimeType === 'audio/wav' || mimeType === 'audio/x-wav' || mimeType === 'audio/wave') return bytes;
  const rate = Number.parseInt(params.rate ?? '', 10);
  return pcmToWav(bytes, { sampleRate: Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_TTS_SAMPLE_RATE });
}
