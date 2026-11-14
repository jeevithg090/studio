import { describe, expect, it } from 'vitest';
import {
  deserializeNotes,
  loadNotes,
  NOTES_STORAGE_KEY,
  saveNotes,
  serializeNotes,
  type KeyValueStorage,
} from './note-storage';
import type { Note } from './types';

const sample: Note = {
  id: 'n1',
  title: 'Title',
  content: 'Body',
  summary: 'Sum',
  audioUrl: 'data:audio/wav;base64,AAAA',
  createdAt: new Date('2024-02-03T04:05:06.000Z'),
  updatedAt: new Date('2024-02-04T04:05:06.000Z'),
  source: { type: 'pptx', filename: 'deck.pptx' },
};

class MemoryStorage implements KeyValueStorage {
  data = new Map<string, string>();
  constructor(private readonly quota = Infinity) {}
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (value.length > this.quota) throw new DOMException('Quota exceeded', 'QuotaExceededError');
    this.data.set(key, value);
  }
}

describe('serialization', () => {
  it('round-trips notes and revives dates', () => {
    const [restored] = deserializeNotes(serializeNotes([sample]))!;
    expect(restored).toEqual(sample);
    expect(restored.createdAt).toBeInstanceOf(Date);
  });

  it.each([null, '', 'not json', '{"a":1}', '42'])('returns null for unusable input %j', (raw) => {
    expect(deserializeNotes(raw)).toBeNull();
  });

  it('drops malformed entries but keeps valid ones', () => {
    const raw = JSON.stringify([{ id: 1 }, JSON.parse(serializeNotes([sample]))[0], null]);
    expect(deserializeNotes(raw)?.map((n) => n.id)).toEqual(['n1']);
  });

  it('keeps an explicitly empty notebook (does not reseed samples)', () => {
    expect(deserializeNotes('[]')).toEqual([]);
  });
});

describe('saveNotes / loadNotes', () => {
  it('persists under the versioned key', () => {
    const storage = new MemoryStorage();
    expect(saveNotes(storage, [sample])).toBe('saved');
    expect(storage.data.has(NOTES_STORAGE_KEY)).toBe(true);
    expect(loadNotes(storage)).toEqual([sample]);
  });

  it('drops generated audio when the quota is exceeded', () => {
    const big = { ...sample, audioUrl: `data:audio/wav;base64,${'A'.repeat(10_000)}` };
    const storage = new MemoryStorage(2_000);
    expect(saveNotes(storage, [big])).toBe('saved-without-audio');
    expect(loadNotes(storage)?.[0].audioUrl).toBeUndefined();
    expect(loadNotes(storage)?.[0].content).toBe('Body');
  });

  it('reports failure when even the text does not fit', () => {
    expect(saveNotes(new MemoryStorage(10), [sample])).toBe('failed');
  });

  it('returns null when storage throws on read', () => {
    const storage: KeyValueStorage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => undefined,
    };
    expect(loadNotes(storage)).toBeNull();
  });
});
