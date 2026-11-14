import type { Note, NoteUpdate } from './types';

export const UNTITLED_NOTE = 'Untitled Note';

export function createNote(now: Date = new Date(), id: string = crypto.randomUUID()): Note {
  return { id, title: UNTITLED_NOTE, content: '', createdAt: now, updatedAt: now };
}

/** Applies a partial update to the matching note and bumps its `updatedAt`. */
export function applyNoteUpdate(notes: Note[], update: NoteUpdate, now: Date = new Date()): Note[] {
  return notes.map((note) => (note.id === update.id ? { ...note, ...update, updatedAt: now } : note));
}

/**
 * Removes a note and works out which note should be selected afterwards:
 * the previous neighbour of the deleted note, or `null` when none remain.
 */
export function removeNote(
  notes: Note[],
  id: string,
  selectedId: string | null
): { notes: Note[]; selectedId: string | null } {
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return { notes, selectedId };
  const remaining = notes.filter((note) => note.id !== id);
  if (selectedId !== id) return { notes: remaining, selectedId };
  const next = remaining[Math.max(0, index - 1)];
  return { notes: remaining, selectedId: next?.id ?? null };
}

/** Case-insensitive search over note titles and content. */
export function filterNotes(notes: Note[], query: string): Note[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return notes;
  return notes.filter(
    (note) => note.title.toLowerCase().includes(needle) || note.content.toLowerCase().includes(needle)
  );
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Joins new text onto existing note content with a blank line in between. */
export function appendParagraph(content: string, addition: string): string {
  const extra = addition.trim();
  if (!extra) return content;
  const base = content.trimEnd();
  return base ? `${base}\n\n${extra}` : extra;
}

/** Joins an AI continuation onto the existing text with a single space. */
export function appendContinuation(content: string, continuation: string): string {
  const extra = continuation.trim();
  if (!extra) return content;
  const base = content.trimEnd();
  return base ? `${base} ${extra}` : extra;
}

/** Turns a file name into a note title (`Q3 Review.pptx` -> `Q3 Review`). */
export function titleFromFilename(filename: string): string {
  const title = filename.replace(/\.[^/.]+$/, '').trim();
  return title || UNTITLED_NOTE;
}
