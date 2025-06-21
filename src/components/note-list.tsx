'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from './ui/button';
import type { Note } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { Input } from './ui/input';

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchTerm) {
      return notes;
    }
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 space-y-2">
        <Button onClick={onNewNote} className="w-full" variant="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <SidebarMenu className="p-2 pt-0">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
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
          )) : (
            <div className="text-center text-sm text-muted-foreground p-4">
              No notes found.
            </div>
          )}
        </SidebarMenu>
      </ScrollArea>
    </div>
  );
}
