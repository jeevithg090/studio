import type { Metadata } from 'next';
import { VocalNoteApp } from '@/components/vocal-note-app';

export const metadata: Metadata = {
  title: 'Notebook',
  description: 'Write, record, import and refine your notes with AI.',
};

export default function NotesPage() {
  return <VocalNoteApp />;
}
