'use client';

import { useRef, useState } from 'react';
import { Bot, FileUp, Keyboard, Loader2, Mic, Music, Square, Trash2 } from 'lucide-react';
import type { Note, NoteUpdate } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder, type RecorderError } from '@/hooks/use-audio-recorder';
import { summarizeNote } from '@/ai/flows/summarize-note';
import { generateAudio } from '@/ai/flows/generate-audio';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { continueWriting } from '@/ai/flows/continue-writing';
import { blobToDataUri, formatBytes } from '@/lib/files';
import { MAX_AUDIO_BYTES, MAX_NOTE_TEXT_CHARS, MAX_PPTX_BYTES, MAX_TTS_TEXT_CHARS } from '@/lib/limits';
import { appendContinuation, appendParagraph, countWords, titleFromFilename } from '@/lib/notes';
import { AIEditMenu } from './ai-edit-menu';

type PendingAction = 'transcribe' | 'import' | 'summarize' | 'continue' | 'audio' | 'edit';

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (update: NoteUpdate) => void;
  onNoteDelete: (id: string) => void;
}

const RECORDER_ERRORS: Record<RecorderError, string> = {
  unsupported: 'Audio recording is not supported in this browser.',
  'permission-denied': 'Microphone access was denied. Allow it in your browser settings to record.',
  failed: 'Could not access the microphone.',
};

/**
 * Errors thrown by server actions carry a `digest` and, in production, a
 * redacted message, so only client-side error messages are shown verbatim.
 */
function describeError(error: unknown): string {
  if (error instanceof Error && error.message && !('digest' in error)) return error.message;
  return 'Something went wrong. Please try again.';
}

export function NoteEditor({ note, onNoteUpdate, onNoteDelete }: NoteEditorProps) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Async work reads the latest note through this ref instead of a stale closure.
  const noteRef = useRef(note);
  noteRef.current = note;
  const { toast } = useToast();

  /** Runs an AI action with a shared busy state and consistent error toasts. */
  const runAction = async (action: PendingAction, failureTitle: string, task: () => Promise<void>) => {
    setPending(action);
    try {
      await task();
    } catch (error) {
      console.error(`${action} failed:`, error);
      toast({ variant: 'destructive', title: failureTitle, description: describeError(error) });
    } finally {
      setPending(null);
    }
  };

  const recorder = useAudioRecorder({
    onRecordingComplete: (recording) => {
      if (recording.size > MAX_AUDIO_BYTES) {
        toast({
          variant: 'destructive',
          title: 'Recording too long',
          description: `Recordings must be under ${formatBytes(MAX_AUDIO_BYTES)}. Try a shorter clip.`,
        });
        return;
      }
      void runAction('transcribe', 'Transcription failed', async () => {
        const audioDataUri = await blobToDataUri(recording);
        const { transcribedText } = await transcribeAudio({ audioDataUri });
        if (!transcribedText.trim()) {
          toast({ title: 'No speech detected', description: 'Nothing was added to your note.' });
          return;
        }
        onNoteUpdate({ id: note.id, content: appendParagraph(noteRef.current.content, transcribedText) });
        toast({ title: 'Transcription complete', description: 'Your recording has been added to the note.' });
      });
    },
    onError: (error) =>
      toast({ variant: 'destructive', title: 'Recording error', description: RECORDER_ERRORS[error] }),
  });

  const content = note.content;
  const hasContent = content.trim().length > 0;
  const isBusy = pending !== null || recorder.isRecording;

  const requireContent = (limit: number, what: string): boolean => {
    if (!hasContent) {
      toast({ variant: 'destructive', title: 'Note is empty', description: `Add some text before you ${what}.` });
      return false;
    }
    if (content.length > limit) {
      toast({
        variant: 'destructive',
        title: 'Note is too long',
        description: `This action supports up to ${limit.toLocaleString()} characters.`,
      });
      return false;
    }
    return true;
  };

  const handlePptxImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      toast({ variant: 'destructive', title: 'Unsupported file', description: 'Please choose a .pptx presentation.' });
      return;
    }
    if (file.size > MAX_PPTX_BYTES) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Presentations must be under ${formatBytes(MAX_PPTX_BYTES)}.`,
      });
      return;
    }
    await runAction('import', 'Import failed', async () => {
      // Parsed entirely in the browser; the file is never uploaded. Loaded lazily to keep the editor bundle small.
      const { extractTextFromPptx } = await import('@/lib/pptx');
      const extractedText = await extractTextFromPptx(await file.arrayBuffer());
      if (!extractedText) {
        toast({ title: 'No text found', description: 'The presentation does not contain any slide text.' });
        return;
      }
      const current = noteRef.current;
      onNoteUpdate({
        id: note.id,
        title: current.content.trim() ? current.title : titleFromFilename(file.name),
        content: appendParagraph(current.content, extractedText),
        source: { type: 'pptx', filename: file.name },
      });
      toast({ title: 'Presentation imported', description: `Text from ${file.name} was added to the note.` });
    });
  };

  const handleSummarize = () => {
    if (!requireContent(MAX_NOTE_TEXT_CHARS, 'summarize')) return;
    void runAction('summarize', 'Summarization failed', async () => {
      const { summary } = await summarizeNote({ noteContent: content });
      onNoteUpdate({ id: note.id, summary });
      toast({ title: 'Summary generated' });
    });
  };

  const handleContinueWriting = () => {
    if (!requireContent(MAX_NOTE_TEXT_CHARS, 'continue writing')) return;
    void runAction('continue', 'Could not continue writing', async () => {
      const { continuedText } = await continueWriting({ content });
      onNoteUpdate({ id: note.id, content: appendContinuation(noteRef.current.content, continuedText) });
      toast({ title: 'Text generated', description: 'The AI continued your note.' });
    });
  };

  const handleGenerateAudio = () => {
    if (!requireContent(MAX_TTS_TEXT_CHARS, 'generate audio')) return;
    void runAction('audio', 'Audio generation failed', async () => {
      const { audioDataUri } = await generateAudio({ text: content });
      onNoteUpdate({ id: note.id, audioUrl: audioDataUri });
      toast({ title: 'Audio generated', description: 'Your note is ready to play.' });
    });
  };

  const handleAiEdit = (task: () => Promise<string>) =>
    runAction('edit', 'AI edit failed', async () => {
      const editedContent = await task();
      onNoteUpdate({ id: note.id, content: editedContent });
      toast({ title: 'Note updated by AI' });
    });

  const spinner = <Loader2 className="animate-spin" aria-hidden="true" />;

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background shadow-sm" aria-busy={pending !== null}>
      <div
        role="toolbar"
        aria-label="Note actions"
        className="flex flex-shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b p-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={recorder.isRecording ? recorder.stop : recorder.start}
            variant={recorder.isRecording ? 'destructive' : 'outline'}
            size="sm"
            disabled={pending !== null}
            aria-pressed={recorder.isRecording}
          >
            {pending === 'transcribe' ? (
              spinner
            ) : recorder.isRecording ? (
              <Square aria-hidden="true" />
            ) : (
              <Mic aria-hidden="true" />
            )}
            {recorder.isRecording ? 'Stop recording' : pending === 'transcribe' ? 'Transcribing…' : 'Record'}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={isBusy}>
            {pending === 'import' ? spinner : <FileUp aria-hidden="true" />}
            {pending === 'import' ? 'Importing…' : 'Import PPTX'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePptxImport}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          />
          <Separator orientation="vertical" className="mx-1 hidden h-8 sm:block" />
          <AIEditMenu
            content={content}
            onEdit={handleAiEdit}
            isPending={pending === 'edit'}
            disabled={!hasContent || isBusy}
          />
          <Button onClick={handleContinueWriting} disabled={!hasContent || isBusy} variant="outline" size="sm">
            {pending === 'continue' ? spinner : <Keyboard aria-hidden="true" />}
            Continue writing
          </Button>
          <Button onClick={handleSummarize} disabled={!hasContent || isBusy} variant="outline" size="sm">
            {pending === 'summarize' ? spinner : <Bot aria-hidden="true" />}
            Summarize
          </Button>
          <Button onClick={handleGenerateAudio} disabled={!hasContent || isBusy} variant="outline" size="sm">
            {pending === 'audio' ? spinner : <Music aria-hidden="true" />}
            Generate audio
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isBusy} aria-label="Delete note" title="Delete note">
              <Trash2 aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this note?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{note.title || 'Untitled Note'}&rdquo; will be permanently removed from this browser.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onNoteDelete(note.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-grow flex-col overflow-y-auto">
        <div className="flex flex-grow flex-col gap-6 p-6 md:p-8">
          <Input
            value={note.title}
            onChange={(e) => onNoteUpdate({ id: note.id, title: e.target.value })}
            placeholder="Note title"
            aria-label="Note title"
            className="h-auto border-none bg-transparent p-0 font-headline text-3xl font-bold shadow-none focus-visible:ring-0 lg:text-4xl"
            disabled={isBusy}
          />
          <Textarea
            value={content}
            onChange={(e) => onNoteUpdate({ id: note.id, content: e.target.value })}
            placeholder="Start writing your note here, record your voice, or import a presentation…"
            aria-label="Note content"
            className="min-h-[30vh] flex-grow resize-none border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            disabled={isBusy}
          />
        </div>

        <div className="mt-auto flex flex-shrink-0 flex-col gap-6 px-6 pb-6 md:px-8">
          {note.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-lg">
                  <Bot aria-hidden="true" /> AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.summary}</p>
              </CardContent>
            </Card>
          )}

          {note.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-lg">
                  <Music aria-hidden="true" /> Note playback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls className="w-full" src={note.audioUrl} aria-label={`Audio for ${note.title}`}>
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-t p-3 text-xs text-muted-foreground">
        <span>{note.source ? `Imported from ${note.source.filename}` : ''}</span>
        <span aria-live="polite">
          {countWords(content).toLocaleString()} words · {content.length.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}
