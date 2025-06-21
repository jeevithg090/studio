'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { Bot, Loader2, Mic, Music, Save, Trash2, Upload } from 'lucide-react';
import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeNote } from '@/ai/flows/summarize-note';
import { generateAudio } from '@/ai/flows/generate-audio';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { extractPptText } from '@/ai/flows/extract-ppt-text';
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, startTranscribeTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = () => {
    onNoteSave({ id: note.id, title, content, updatedAt: new Date() });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onNoteUpdate({ id: note.id, content: newContent, updatedAt: new Date() });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioDataUri = await blobToBase64(audioBlob);
            
            startTranscribeTransition(async () => {
              try {
                toast({ title: 'Transcribing audio...' });
                const result = await transcribeAudio({ audioDataUri });
                const newContent = content ? `${content}\n\n${result.transcribedText}` : result.transcribedText;
                handleContentChange(newContent);
                toast({ title: 'Transcription Complete', description: 'Your voice has been added to the note.' });
              } catch (error) {
                console.error('Transcription failed:', error);
                toast({ variant: 'destructive', title: 'Transcription Failed' });
              }
            });
            stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
          toast({ title: 'Recording started...' });
        } catch (err) {
          console.error('Error starting recording:', err);
          toast({ variant: 'destructive', title: 'Recording Error', description: 'Could not access microphone.' });
        }
      }
    }
  };

  const handlePptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        const pptDataUri = reader.result as string;
        startUploadTransition(async () => {
            try {
                const result = await extractPptText({ pptDataUri });
                onNoteUpdate({ 
                  id: note.id, 
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  content: result.extractedText, 
                  source: { type: 'ppt', filename: file.name },
                  updatedAt: new Date()
                });
                toast({ title: 'PPT Processed', description: 'Text has been extracted from the presentation.' });
            } catch (error) {
                console.error('PPT extraction failed:', error);
                toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not extract text from the PPT.' });
            }
        });
    };
    reader.readAsDataURL(file);
    toast({ title: 'Uploading PPT...', description: 'Please wait while we process your file.' });
    if (event.target) {
        event.target.value = '';
    }
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
    if (!content) {
      toast({ variant: 'destructive', title: 'Content is empty', description: 'Cannot generate audio for an empty note.' });
      return;
    }
    setIsGeneratingAudio(true);
    toast({ title: 'Generating Audio...', description: 'Please wait while we process your note. This may take a moment.' });
    try {
      const result = await generateAudio({ text: content });
      onNoteUpdate({ id: note.id, audioUrl: result.audioDataUri, updatedAt: new Date() });
      toast({ title: 'Audio Generated', description: 'Your note is now available as audio.' });
    } catch (error) {
      console.error('Audio generation failed:', error);
      toast({ variant: 'destructive', title: 'Audio Generation Failed', description: 'Could not generate audio. Please try again.' });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const isBusy = isRecording || isTranscribing || isUploading || isSummarizing || isGeneratingAudio;

  return (
    <div className="flex flex-col h-full rounded-lg border bg-background shadow-sm">
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 p-3 border-b">
        <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={toggleRecording} variant="outline" size="sm" disabled={isTranscribing || isUploading}>
                {isRecording ? <Loader2 className="animate-spin" /> : <Mic />}
                {isRecording ? 'Stop' : isTranscribing ? 'Transcribing...' : 'Record'}
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={isUploading || isRecording}>
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {isUploading ? 'Importing...' : 'Import PPT'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePptUpload}
              className="hidden"
              accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            />
            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />
            <AIEditMenu content={content} onContentChange={handleContentChange} disabled={!content || isBusy}/>
            <Button onClick={handleSummarize} disabled={isSummarizing || !content || isBusy} variant="outline" size="sm">
              {isSummarizing ? <Loader2 className="animate-spin" /> : <Bot />}
              Summarize
            </Button>
            <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !content || isBusy} variant="outline" size="sm">
              {isGeneratingAudio ? <Loader2 className="animate-spin" /> : <Music />}
              Generate Audio
            </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isBusy} size="sm">
              <Save /> Save
            </Button>
            <Button onClick={() => onNoteDelete(note.id)} variant="destructive" size="icon" disabled={isBusy}>
              <Trash2 />
            </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="p-6 md:p-8 flex flex-col gap-6 h-full">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-3xl lg:text-4xl font-headline font-bold h-auto p-0 border-none focus-visible:ring-0 shadow-none bg-transparent"
              disabled={isBusy}
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note here, record your voice, or import a PPT..."
              className="flex-grow text-base resize-none border-none focus-visible:ring-0 shadow-none p-0 bg-transparent min-h-[30vh]"
              disabled={isBusy}
            />
          
            {note.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-lg">
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
                  <CardTitle className="font-headline flex items-center gap-2 text-lg">
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
    </div>
  );
}