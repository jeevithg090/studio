import { describe, expect, it } from 'vitest';
import { pcmToWav, toWavBytes } from './wav';

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.subarray(start, start + length));

describe('pcmToWav', () => {
  it('writes a valid 44-byte PCM header followed by the samples', () => {
    const pcm = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const wav = pcmToWav(pcm, { channels: 1, sampleRate: 24_000, sampleWidth: 2 });
    const view = new DataView(wav.buffer);

    expect(wav.byteLength).toBe(44 + pcm.byteLength);
    expect(ascii(wav, 0, 4)).toBe('RIFF');
    expect(view.getUint32(4, true)).toBe(36 + pcm.byteLength);
    expect(ascii(wav, 8, 4)).toBe('WAVE');
    expect(ascii(wav, 12, 4)).toBe('fmt ');
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // channels
    expect(view.getUint32(24, true)).toBe(24_000);
    expect(view.getUint32(28, true)).toBe(48_000); // byte rate
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(ascii(wav, 36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(pcm.byteLength);
    expect(Array.from(wav.subarray(44))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('supports stereo and other sample rates', () => {
    const view = new DataView(pcmToWav(new Uint8Array(8), { channels: 2, sampleRate: 16_000 }).buffer);
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(28, true)).toBe(64_000);
    expect(view.getUint16(32, true)).toBe(4);
  });
});

describe('toWavBytes', () => {
  it('passes WAV data through untouched', () => {
    const wav = new Uint8Array([9, 9, 9]);
    expect(toWavBytes('audio/wav', {}, wav)).toBe(wav);
  });

  it('wraps raw PCM using the advertised sample rate', () => {
    const out = toWavBytes('audio/l16', { rate: '16000' }, new Uint8Array(4));
    expect(new DataView(out.buffer).getUint32(24, true)).toBe(16_000);
  });

  it('defaults to 24 kHz when no rate is given', () => {
    const out = toWavBytes('audio/l16', {}, new Uint8Array(4));
    expect(new DataView(out.buffer).getUint32(24, true)).toBe(24_000);
  });
});
