export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  /** A playable URL for the note's generated speech (usually a `data:audio/wav` URI). */
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  source?: {
    type: 'pptx';
    filename: string;
  };
}

export type NoteUpdate = Partial<Omit<Note, 'id' | 'createdAt'>> & { id: string };
