'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sampleNotes } from '@/lib/data';
import { applyNoteUpdate, createNote, removeNote } from '@/lib/notes';
import { loadNotes, saveNotes, type SaveResult } from '@/lib/note-storage';
import type { Note, NoteUpdate } from '@/lib/types';

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // e.g. storage disabled by browser privacy settings
  }
}

/**
 * Notebook state persisted to `localStorage`. Notes are loaded after mount so
 * server and client render the same markup (no hydration mismatch).
 */
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveResult | 'unavailable'>('saved');
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const selectedRef = useRef(selectedNoteId);
  selectedRef.current = selectedNoteId;

  useEffect(() => {
    const storage = getStorage();
    const stored = storage ? loadNotes(storage) : null;
    const initial = stored ?? sampleNotes;
    setNotes(initial);
    setSelectedNoteId(initial[0]?.id ?? null);
    setSaveStatus(storage ? 'saved' : 'unavailable');
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const storage = getStorage();
    setSaveStatus(storage ? saveNotes(storage, notes) : 'unavailable');
  }, [notes, isLoaded]);

  const addNote = useCallback((): Note => {
    const note = createNote();
    setNotes((prev) => [note, ...prev]);
    setSelectedNoteId(note.id);
    return note;
  }, []);

  const updateNote = useCallback((update: NoteUpdate) => {
    setNotes((prev) => applyNoteUpdate(prev, update));
  }, []);

  const deleteNote = useCallback((id: string) => {
    const result = removeNote(notesRef.current, id, selectedRef.current);
    setNotes(result.notes);
    setSelectedNoteId(result.selectedId);
  }, []);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;

  return {
    notes,
    selectedNote,
    selectedNoteId,
    selectNote: setSelectedNoteId,
    addNote,
    updateNote,
    deleteNote,
    isLoaded,
    saveStatus,
  };
}
