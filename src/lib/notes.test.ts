import { describe, expect, it } from 'vitest';
import {
  appendContinuation,
  appendParagraph,
  applyNoteUpdate,
  countWords,
  createNote,
  filterNotes,
  removeNote,
  titleFromFilename,
  UNTITLED_NOTE,
} from './notes';
import type { Note } from './types';

const note = (id: string, title = id, content = ''): Note => ({
  id,
  title,
  content,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
});

describe('createNote', () => {
  it('creates an empty untitled note with matching timestamps', () => {
    const now = new Date('2025-05-05T12:00:00Z');
    expect(createNote(now, 'abc')).toEqual({
      id: 'abc',
      title: UNTITLED_NOTE,
      content: '',
      createdAt: now,
      updatedAt: now,
    });
  });

  it('generates unique ids by default', () => {
    expect(createNote().id).not.toBe(createNote().id);
  });
});

describe('applyNoteUpdate', () => {
  it('merges fields into the matching note only and bumps updatedAt', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const notes = [note('a'), note('b')];
    const result = applyNoteUpdate(notes, { id: 'b', content: 'hello' }, now);
    expect(result[0]).toBe(notes[0]);
    expect(result[1]).toMatchObject({ id: 'b', title: 'b', content: 'hello', updatedAt: now });
  });

  it('does not mutate the input', () => {
    const notes = [note('a')];
    applyNoteUpdate(notes, { id: 'a', title: 'changed' });
    expect(notes[0].title).toBe('a');
  });
});

describe('removeNote', () => {
  const notes = [note('a'), note('b'), note('c')];

  it('selects the previous neighbour when the selected note is deleted', () => {
    expect(removeNote(notes, 'b', 'b')).toEqual({ notes: [notes[0], notes[2]], selectedId: 'a' });
  });

  it('selects the new first note when the first note is deleted', () => {
    expect(removeNote(notes, 'a', 'a').selectedId).toBe('b');
  });

  it('keeps the current selection when another note is deleted', () => {
    expect(removeNote(notes, 'c', 'a').selectedId).toBe('a');
  });

  it('clears the selection when the last note is deleted', () => {
    expect(removeNote([note('a')], 'a', 'a')).toEqual({ notes: [], selectedId: null });
  });

  it('is a no-op for unknown ids', () => {
    expect(removeNote(notes, 'zzz', 'b')).toEqual({ notes, selectedId: 'b' });
  });
});

describe('filterNotes', () => {
  const notes = [note('1', 'Groceries', 'milk and eggs'), note('2', 'Meeting', 'Q3 GOALS')];

  it('returns every note for a blank query', () => {
    expect(filterNotes(notes, '   ')).toBe(notes);
  });

  it('matches titles and content case-insensitively', () => {
    expect(filterNotes(notes, 'groc').map((n) => n.id)).toEqual(['1']);
    expect(filterNotes(notes, 'q3 goals').map((n) => n.id)).toEqual(['2']);
    expect(filterNotes(notes, 'nothing')).toEqual([]);
  });
});

describe('countWords', () => {
  it.each([
    ['', 0],
    ['   \n ', 0],
    ['one', 1],
    ['  two   words ', 2],
    ['line one\nline two\tthree', 5],
  ])('counts %j as %i words', (text, expected) => {
    expect(countWords(text)).toBe(expected);
  });
});

describe('appendParagraph', () => {
  it('separates new text with a blank line', () => {
    expect(appendParagraph('First.\n', '  Second. ')).toBe('First.\n\nSecond.');
  });

  it('returns the addition alone for empty content', () => {
    expect(appendParagraph('', 'Hello')).toBe('Hello');
  });

  it('ignores blank additions', () => {
    expect(appendParagraph('Keep', '  ')).toBe('Keep');
  });
});

describe('appendContinuation', () => {
  it('joins with a single space', () => {
    expect(appendContinuation('It was a dark night.  ', ' The wind howled.')).toBe(
      'It was a dark night. The wind howled.'
    );
  });
});

describe('titleFromFilename', () => {
  it('strips the extension', () => {
    expect(titleFromFilename('Q3 Review.final.pptx')).toBe('Q3 Review.final');
  });

  it('falls back to the untitled label', () => {
    expect(titleFromFilename('.pptx')).toBe(UNTITLED_NOTE);
  });
});
