// Entry point for the Genkit developer UI (`npm run genkit:dev`).
import { config } from 'dotenv';

config({ path: ['.env.local', '.env'] });

import '@/ai/flows/edit-note-ai';
import '@/ai/flows/summarize-note';
import '@/ai/flows/generate-audio';
import '@/ai/flows/transcribe-audio';
import '@/ai/flows/continue-writing';
