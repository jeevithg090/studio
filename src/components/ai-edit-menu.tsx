'use client';

import { useTransition } from 'react';
import { Sparkles, Languages, Pilcrow, PenLine, Loader2 } from 'lucide-react';
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { editNoteWithAI } from '@/ai/flows/edit-note-ai';
import { useToast } from '@/hooks/use-toast';

interface AIEditMenuProps {
  content: string;
  onContentChange: (newContent: string) => void;
  disabled?: boolean;
}

const languages = [
  { code: 'Spanish', name: 'Spanish' },
  { code: 'French', name: 'French' },
  { code: 'German', name: 'German' },
  { code: 'Japanese', name: 'Japanese' },
  { code: 'Mandarin Chinese', name: 'Chinese' },
];

export function AIEditMenu({ content, onContentChange, disabled }: AIEditMenuProps) {
  const [isEditing, startEditTransition] = useTransition();
  const { toast } = useToast();

  const handleEdit = async (action: 'rephrase' | 'translate' | 'fix grammar', language?: string) => {
    startEditTransition(async () => {
      try {
        const result = await editNoteWithAI({ content, action, language });
        onContentChange(result.editedContent);
        toast({ title: 'AI Edit Successful', description: `Your note has been updated.` });
      } catch (error) {
        console.error('AI Edit failed:', error);
        toast({ variant: 'destructive', title: 'AI Edit Failed', description: 'Could not edit the note. Please try again.' });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isEditing}>
          {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          AI Edit
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>AI Editing Tools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleEdit('rephrase')}>
          <PenLine className="mr-2 h-4 w-4" />
          <span>Rephrase</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit('fix grammar')}>
          <Pilcrow className="mr-2 h-4 w-4" />
          <span>Fix Grammar</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" />
            <span>Translate</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {languages.map((lang) => (
              <DropdownMenuItem key={lang.code} onClick={() => handleEdit('translate', lang.code)}>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
