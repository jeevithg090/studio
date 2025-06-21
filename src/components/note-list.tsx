'use client';

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
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </ScrollArea>
    </div>
  );
}
