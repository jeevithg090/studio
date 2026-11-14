'use client';

import Link from 'next/link';
import { PenSquare, PlusCircle } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotes } from '@/hooks/use-notes';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './logo';
import { NoteEditor } from './note-editor';
import { NoteList } from './note-list';

const SAVE_STATUS_LABEL = {
  saved: 'Saved in this browser',
  'saved-without-audio': 'Saved (audio too large to keep)',
  failed: 'Not saved: browser storage is full',
  unavailable: 'Browser storage unavailable: changes will not persist',
} as const;

function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6 rounded-lg border bg-background p-8" aria-label="Loading notes">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export function VocalNoteApp() {
  const { notes, selectedNote, selectedNoteId, selectNote, addNote, updateNote, deleteNote, isLoaded, saveStatus } =
    useNotes();
  const { toast } = useToast();

  const handleNewNote = () => {
    addNote();
    toast({ title: 'New note created' });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    toast({ title: 'Note deleted' });
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Logo />
            <span className="flex flex-col">
              <span className="font-headline text-xl font-bold">VocalNote</span>
              <span className="text-xs text-sidebar-foreground/70">Your AI notebook</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={selectNote}
            onNewNote={handleNewNote}
            isLoaded={isLoaded}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="h-svh min-h-0">
        <header className="flex h-12 flex-shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger aria-label="Toggle note list" />
          <h1 className="truncate font-headline text-sm font-semibold">{selectedNote?.title || 'VocalNote'}</h1>
          {isLoaded && (
            <span className="ml-auto hidden text-xs text-muted-foreground sm:inline" role="status" aria-live="polite">
              {SAVE_STATUS_LABEL[saveStatus]}
            </span>
          )}
        </header>
        <div className="min-h-0 flex-1 bg-muted/20 p-2 sm:p-4">
          {!isLoaded ? (
            <EditorSkeleton />
          ) : selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onNoteUpdate={updateNote}
              onNoteDelete={handleDeleteNote}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-card p-6">
              <div className="text-center">
                <PenSquare className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                <h2 className="mt-4 font-headline text-2xl font-semibold">No note selected</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a note from the list or create a new one to get started.
                </p>
                <Button onClick={handleNewNote} className="mt-6">
                  <PlusCircle aria-hidden="true" /> New note
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
