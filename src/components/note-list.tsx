'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import type { Note } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
}

const NoteTimestamp = ({ date }: { date: Date }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // To prevent hydration mismatch, we can return a placeholder or null on the server.
    return <span className="text-xs text-muted-foreground">...</span>;
  }

  return (
    <span className="text-xs text-muted-foreground">
      {formatDistanceToNow(date, { addSuffix: true })}
    </span>
  );
};

export function NoteList({ notes, selectedNoteId, onSelectNote, onNewNote }: NoteListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <Button onClick={onNewNote} className="w-full" variant="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <SidebarMenu className="p-2 pt-0">
          {notes.map(note => (
            <SidebarMenuItem key={note.id}>
              <SidebarMenuButton
                isActive={note.id === selectedNoteId}
                onClick={() => onSelectNote(note.id)}
                className="h-auto flex-col items-start gap-0.5 py-2"
              >
                <span className="font-semibold text-sm w-full truncate">{note.title || 'Untitled Note'}</span>
                <NoteTimestamp date={note.updatedAt} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </ScrollArea>
    </div>
  );
}
