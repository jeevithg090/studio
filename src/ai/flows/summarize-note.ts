'use server';

/**
 * Summarizes a note into a short paragraph.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MAX_NOTE_TEXT_CHARS } from '@/lib/limits';

const SummarizeNoteInputSchema = z.object({
  noteContent: z.string().trim().min(1).max(MAX_NOTE_TEXT_CHARS).describe('The content of the note to summarize.'),
});
export type SummarizeNoteInput = z.infer<typeof SummarizeNoteInputSchema>;

const SummarizeNoteOutputSchema = z.object({
  summary: z.string().describe('The summary of the note.'),
});
export type SummarizeNoteOutput = z.infer<typeof SummarizeNoteOutputSchema>;

const summarizeNotePrompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: { schema: SummarizeNoteInputSchema },
  output: { schema: SummarizeNoteOutputSchema },
  prompt: `Summarize the following note in a concise paragraph that captures its key points and any action items.

{{{noteContent}}}`,
});

const summarizeNoteFlow = ai.defineFlow(
  {
    name: 'summarizeNoteFlow',
    inputSchema: SummarizeNoteInputSchema,
    outputSchema: SummarizeNoteOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeNotePrompt(input);
    if (!output) throw new Error('The model returned no summary.');
    return output;
  }
);

export async function summarizeNote(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  return summarizeNoteFlow(input);
}
