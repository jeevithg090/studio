'use client';

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { NoteList } from './note-list';
import { NoteEditor } from './note-editor';
import { mockNotes } from '@/lib/data';
import type { Note } from '@/lib/types';
import { PenSquareIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-primary"
    aria-hidden="true"
  >
    <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 17V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


export function VocalNoteApp() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const { toast } = useToast();

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  const handleSelectNote = (id: string) => setSelectedNoteId(id);

  const handleNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setSelectedNoteId(newNote.id);
    toast({ title: "New note created" });
  };

  const handleUpdateNote = (updatedFields: Partial<Note> & { id: string }) => {
    setNotes(notes.map(n => n.id === updatedFields.id ? { ...n, ...updatedFields } : n));
  };
  
  const handleSaveNote = (updatedFields: Partial<Note> & { id: string }) => {
    handleUpdateNote(updatedFields);
    toast({ title: "Note saved successfully" });
  };

  const handleDeleteNote = (id: string) => {
    const noteIndex = notes.findIndex(n => n.id === id);
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);

    if (selectedNoteId === id) {
      if (newNotes.length > 0) {
        const newIndex = Math.max(0, noteIndex - 1);
        setSelectedNoteId(newNotes[newIndex].id);
      } else {
        setSelectedNoteId(null);
      }
    }
    toast({ title: "Note deleted" });
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo />
            <div className="flex flex-col">
              <h1 className="font-headline text-xl font-bold text-foreground">VocalNote</h1>
              <p className="text-xs text-muted-foreground">Your AI Notebook</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 h-full">
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onNoteUpdate={handleUpdateNote}
              onNoteSave={handleSaveNote}
              onNoteDelete={handleDeleteNote}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-card">
              <div className="text-center">
                <PenSquareIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-headline font-semibold text-foreground">No Note Selected</h2>
                <p className="mt-2 text-sm text-muted-foreground">Select a note from the list or create a new one to get started.</p>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
