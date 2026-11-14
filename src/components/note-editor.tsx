'use client';

import { useRef, useState } from 'react';
import { Bot, FileUp, Keyboard, Loader2, Mic, Music, Square, Trash2, X } from 'lucide-react';
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
import { Button, type ButtonProps } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
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
  const pendingLabel = pending
    ? PENDING_LABELS[pending]
    : recorder.isRecording
      ? 'Recording… press Stop when done.'
      : '';

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
      aria-busy={pending !== null}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {pendingLabel}
      </p>
      <div
        role="toolbar"
        aria-label="Note actions"
        className="flex flex-shrink-0 items-start justify-between gap-2 border-b bg-muted/30 p-2 sm:p-3"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <ToolbarButton
            label={recorder.isRecording ? 'Stop recording' : pending === 'transcribe' ? 'Transcribing…' : 'Record'}
            onClick={recorder.isRecording ? recorder.stop : recorder.start}
            variant={recorder.isRecording ? 'destructive' : 'outline'}
            disabled={pending !== null}
            aria-pressed={recorder.isRecording}
            icon={
              pending === 'transcribe' ? (
                spinner
              ) : recorder.isRecording ? (
                <Square className="animate-pulse fill-current" aria-hidden="true" />
              ) : (
                <Mic aria-hidden="true" />
              )
            }
          />
          <ToolbarButton
            label={pending === 'import' ? 'Importing…' : 'Import PPTX'}
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            icon={pending === 'import' ? spinner : <FileUp aria-hidden="true" />}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePptxImport}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          />
          <Separator orientation="vertical" className="mx-1 hidden h-6 self-center xl:block" />
          <AIEditMenu
            content={content}
            onEdit={handleAiEdit}
            isPending={pending === 'edit'}
            disabled={!hasContent || isBusy}
          />
          <ToolbarButton
            label="Continue writing"
            onClick={handleContinueWriting}
            disabled={!hasContent || isBusy}
            icon={pending === 'continue' ? spinner : <Keyboard aria-hidden="true" />}
          />
          <ToolbarButton
            label="Summarize"
            onClick={handleSummarize}
            disabled={!hasContent || isBusy}
            icon={pending === 'summarize' ? spinner : <Bot aria-hidden="true" />}
          />
          <ToolbarButton
            label="Generate audio"
            onClick={handleGenerateAudio}
            disabled={!hasContent || isBusy}
            icon={pending === 'audio' ? spinner : <Music aria-hidden="true" />}
          />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isBusy}
              aria-label="Delete note"
              title="Delete note"
              className="h-10 w-10 flex-shrink-0 text-red-600 hover:bg-destructive/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 xl:h-9 xl:w-9"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this note?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{note.title || 'Untitled Note'}&rdquo; will be permanently removed from this browser. This cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onNoteDelete(note.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete note
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-grow flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-grow flex-col gap-4 p-4 sm:gap-6 sm:p-6 md:p-8">
          <Input
            value={note.title}
            onChange={(e) => onNoteUpdate({ id: note.id, title: e.target.value })}
            placeholder="Note title"
            aria-label="Note title"
            maxLength={200}
            className="h-auto border-none bg-transparent p-0 font-headline text-2xl font-bold tracking-tight shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-3xl md:text-3xl lg:text-4xl"
            disabled={isBusy}
          />
          <Textarea
            value={content}
            onChange={(e) => onNoteUpdate({ id: note.id, content: e.target.value })}
            placeholder="Start writing your note here, record your voice, or import a presentation…"
            aria-label="Note content"
            className="min-h-[30vh] flex-grow resize-none border-none bg-transparent p-0 text-base leading-relaxed shadow-none md:text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isBusy}
          />
        </div>

        {(note.summary || note.audioUrl) && (
          <div className="mx-auto mt-auto flex w-full max-w-3xl flex-shrink-0 flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6 md:px-8">
            {note.summary && (
              <ResultCard
                icon={<Bot aria-hidden="true" />}
                title="AI summary"
                onDismiss={() => onNoteUpdate({ id: note.id, summary: undefined })}
                dismissLabel="Remove summary"
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{note.summary}</p>
              </ResultCard>
            )}
            {note.audioUrl && (
              <ResultCard
                icon={<Music aria-hidden="true" />}
                title="Note playback"
                onDismiss={() => onNoteUpdate({ id: note.id, audioUrl: undefined })}
                dismissLabel="Remove audio"
              >
                <audio controls className="w-full" src={note.audioUrl} aria-label={`Audio for ${note.title}`}>
                  Your browser does not support the audio element.
                </audio>
              </ResultCard>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span className="truncate">{note.source ? `Imported from ${note.source.filename}` : ''}</span>
        <span>
          {countWords(content).toLocaleString()} words · {content.length.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}

const PENDING_LABELS: Record<PendingAction, string> = {
  transcribe: 'Transcribing your recording…',
  import: 'Importing presentation…',
  summarize: 'Generating summary…',
  continue: 'Writing a continuation…',
  audio: 'Generating audio…',
  edit: 'Applying AI edit…',
};

type ToolbarButtonProps = Omit<ButtonProps, 'children' | 'size'> & { label: string; icon: React.ReactNode };

/** Labelled on wide screens; icon-only (with an accessible name and tooltip) on phones and tablets. */
function ToolbarButton({ label, icon, variant = 'outline', className, ...props }: ToolbarButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      aria-label={label}
      title={label}
      className={cn('h-10 w-10 px-0 xl:h-9 xl:w-auto xl:px-3', className)}
      {...props}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </Button>
  );
}

function ResultCard({
  icon,
  title,
  onDismiss,
  dismissLabel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onDismiss: () => void;
  dismissLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-primary/20 bg-primary/5 duration-300 animate-in fade-in-0 slide-in-from-bottom-2">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="flex items-center gap-2 font-headline text-base [&_svg]:size-4 [&_svg]:text-primary">
          {icon} {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDismiss}
          aria-label={dismissLabel}
          title={dismissLabel}
        >
          <X aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}
