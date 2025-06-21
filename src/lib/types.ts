export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
