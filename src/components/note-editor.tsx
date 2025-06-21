'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bot, Loader2, Music, Save, Trash2 } from 'lucide-react';
import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeNote } from '@/ai/flows/summarize-note';
import { AIEditMenu } from './ai-edit-menu';
import { Separator } from './ui/separator';

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (updatedFields: Partial<Note> & { id: string }) => void;
  onNoteSave: (updatedFields: Partial<Note> & { id: string }) => void;
  onNoteDelete: (id: string) => void;
}

export function NoteEditor({ note, onNoteUpdate, onNoteSave, onNoteDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSummarizing, startSummarizeTransition] = useTransition();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = () => {
    onNoteSave({ id: note.id, title, content, updatedAt: new Date() });
  };

  const handleSummarize = async () => {
    if (!content) {
      toast({ variant: 'destructive', title: 'Content is empty', description: 'Cannot summarize an empty note.' });
      return;
    }
    startSummarizeTransition(async () => {
      try {
        const result = await summarizeNote({ noteContent: content });
        onNoteUpdate({ id: note.id, summary: result.summary, updatedAt: new Date() });
        toast({ title: 'Summary Generated', description: 'The AI-powered summary for your note is ready.' });
      } catch (error) {
        console.error('Summarization failed:', error);
        toast({ variant: 'destructive', title: 'Summarization Failed', description: 'Could not generate summary. Please try again.' });
      }
    });
  };

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    toast({ title: 'Generating Audio...', description: 'Please wait while we process your note.' });
    // Mock ElevenLabs integration
    setTimeout(() => {
      onNoteUpdate({ id: note.id, audioUrl: 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder.mp3', updatedAt: new Date() });
      setIsGeneratingAudio(false);
      toast({ title: 'Audio Generated', description: 'Your note is now available as audio.' });
    }, 2000);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onNoteUpdate({ id: note.id, content: newContent, updatedAt: new Date() });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="flex-shrink-0">
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          <div className="flex-grow font-headline text-lg">Editing Note</div>
          <div className="flex gap-2 ml-auto">
            <AIEditMenu content={content} onContentChange={handleContentChange} disabled={!content}/>
            <Button onClick={handleSummarize} disabled={isSummarizing || !content} variant="outline">
              {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              Summarize
            </Button>
            <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !content} variant="outline">
              {isGeneratingAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Music className="mr-2 h-4 w-4" />}
              Generate Audio
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button onClick={() => onNoteDelete(note.id)} variant="destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
        <Card className="flex-grow flex flex-col">
          <CardContent className="p-6 flex-grow flex flex-col gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-3xl font-headline h-auto p-0 border-none focus-visible:ring-0 shadow-none"
            />
            <Separator />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note here..."
              className="flex-grow text-base resize-none border-none focus-visible:ring-0 shadow-none p-0 -mt-2"
            />
          </CardContent>
        </Card>

        {note.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Bot /> AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{note.summary}</CardDescription>
            </CardContent>
          </Card>
        )}

        {note.audioUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Music /> Note Playback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <audio controls className="w-full" src={note.audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
