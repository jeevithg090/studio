'use client';

import { Languages, Loader2, PenLine, Pilcrow, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { editNoteWithAI, type EditNoteWithAIInput } from '@/ai/flows/edit-note-ai';

interface AIEditMenuProps {
  content: string;
  /** Runs the edit; the parent owns busy state, error handling and applying the result. */
  onEdit: (task: () => Promise<string>) => void;
  isPending: boolean;
  disabled?: boolean;
}

const LANGUAGES = ['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Mandarin Chinese'] as const;

export function AIEditMenu({ content, onEdit, isPending, disabled }: AIEditMenuProps) {
  const edit = (action: EditNoteWithAIInput['action'], language?: string) =>
    onEdit(async () => (await editNoteWithAI({ content, action, language })).editedContent);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label="AI edit"
          title="AI edit"
          className="h-10 w-10 px-0 xl:h-9 xl:w-auto xl:px-3"
        >
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
          <span className="hidden xl:inline">AI edit</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>AI editing tools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => edit('rephrase')}>
          <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
          Rephrase
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => edit('fix grammar')}>
          <Pilcrow className="mr-2 h-4 w-4" aria-hidden="true" />
          Fix grammar
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" aria-hidden="true" />
            Translate
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LANGUAGES.map((language) => (
              <DropdownMenuItem key={language} onSelect={() => edit('translate', language)}>
                {language}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
