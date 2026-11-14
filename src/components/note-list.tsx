'use client';

import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PlusCircle, Search } from 'lucide-react';
import type { Note } from '@/lib/types';
import { filterNotes, UNTITLED_NOTE } from '@/lib/notes';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { Skeleton } from './ui/skeleton';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  isLoaded: boolean;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onNewNote, isLoaded }: NoteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile, setOpenMobile } = useSidebar();
  const filteredNotes = useMemo(() => filterNotes(notes, searchTerm), [notes, searchTerm]);

  const select = (id: string) => {
    onSelectNote(id);
    if (isMobile) setOpenMobile(false);
  };

  const create = () => {
    onNewNote();
    if (isMobile) setOpenMobile(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 p-2">
        <Button onClick={create} className="w-full" disabled={!isLoaded}>
          <PlusCircle aria-hidden="true" />
          New note
        </Button>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search notes…"
            aria-label="Search notes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-8 text-foreground"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav aria-label="Notes">
          <SidebarMenu className="p-2 pt-0">
            {!isLoaded ? (
              Array.from({ length: 4 }, (_, i) => (
                <SidebarMenuItem key={i}>
                  <Skeleton className="h-12 w-full bg-sidebar-accent" />
                </SidebarMenuItem>
              ))
            ) : filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <SidebarMenuItem key={note.id}>
                  <SidebarMenuButton
                    isActive={note.id === selectedNoteId}
                    aria-current={note.id === selectedNoteId ? 'page' : undefined}
                    onClick={() => select(note.id)}
                    className="h-auto flex-col items-start gap-0.5 py-2"
                  >
                    <span className="w-full truncate text-sm font-semibold">{note.title || UNTITLED_NOTE}</span>
                    {/* Notes load after mount, so relative times never cause a hydration mismatch. */}
                    <time dateTime={note.updatedAt.toISOString()} className="text-xs text-sidebar-foreground/70">
                      {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                    </time>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <li className="p-4 text-center text-sm text-sidebar-foreground/70">
                {searchTerm ? 'No notes match your search.' : 'No notes yet.'}
              </li>
            )}
          </SidebarMenu>
        </nav>
      </ScrollArea>
    </div>
  );
}
