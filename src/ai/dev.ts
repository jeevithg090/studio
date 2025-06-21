import { config } from 'dotenv';
config();

import '@/ai/flows/edit-note-ai.ts';
import '@/ai/flows/summarize-note.ts';
import '@/ai/flows/generate-audio.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/extract-ppt-text.ts';
