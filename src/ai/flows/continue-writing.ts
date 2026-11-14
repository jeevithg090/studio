'use server';

/**
 * Continues writing a note in the same style and tone as the existing text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MAX_NOTE_TEXT_CHARS } from '@/lib/limits';

const ContinueWritingInputSchema = z.object({
  content: z.string().trim().min(1).max(MAX_NOTE_TEXT_CHARS).describe('The existing text to continue from.'),
});
export type ContinueWritingInput = z.infer<typeof ContinueWritingInputSchema>;

const ContinueWritingOutputSchema = z.object({
  continuedText: z.string().describe('The AI-generated continuation of the text.'),
});
export type ContinueWritingOutput = z.infer<typeof ContinueWritingOutputSchema>;

const prompt = ai.definePrompt({
  name: 'continueWritingPrompt',
  input: { schema: ContinueWritingInputSchema },
  output: { schema: ContinueWritingOutputSchema },
  prompt: `You are a helpful writing assistant. Continue writing the following text in a consistent style and tone.
Do not repeat the original text in your response. Only provide the new, additional text (one or two paragraphs).

Original Text:
{{{content}}}
`,
});

const continueWritingFlow = ai.defineFlow(
  {
    name: 'continueWritingFlow',
    inputSchema: ContinueWritingInputSchema,
    outputSchema: ContinueWritingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('The model returned no continuation.');
    return output;
  }
);

export async function continueWriting(input: ContinueWritingInput): Promise<ContinueWritingOutput> {
  return continueWritingFlow(input);
}
