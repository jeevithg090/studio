import type { Note } from './types';

export const NOTES_STORAGE_KEY = 'vocalnote:notes:v1';

/** The subset of the Web Storage API this module needs (eases testing). */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

type StoredNote = Omit<Note, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };

function isStoredNote(value: unknown): value is StoredNote {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.content === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  );
}

function reviveDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export function serializeNotes(notes: Note[]): string {
  return JSON.stringify(notes);
}

/**
 * Parses stored notes. Returns `null` when nothing usable is stored, so the
 * caller can fall back to defaults. Malformed entries are dropped.
 */
export function deserializeNotes(raw: string | null): Note[] | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  return parsed.filter(isStoredNote).map((note) => ({
    ...note,
    createdAt: reviveDate(note.createdAt),
    updatedAt: reviveDate(note.updatedAt),
  }));
}

export function loadNotes(storage: KeyValueStorage): Note[] | null {
  try {
    return deserializeNotes(storage.getItem(NOTES_STORAGE_KEY));
  } catch {
    return null;
  }
}

export type SaveResult = 'saved' | 'saved-without-audio' | 'failed';

/**
 * Persists notes. Generated audio is large, so if the storage quota is
 * exceeded the notes are saved again without their audio.
 */
export function saveNotes(storage: KeyValueStorage, notes: Note[]): SaveResult {
  try {
    storage.setItem(NOTES_STORAGE_KEY, serializeNotes(notes));
    return 'saved';
  } catch {
    try {
      const withoutAudio = notes.map(({ audioUrl: _audioUrl, ...note }) => note);
      storage.setItem(NOTES_STORAGE_KEY, serializeNotes(withoutAudio));
      return 'saved-without-audio';
    } catch {
      return 'failed';
    }
  }
}
