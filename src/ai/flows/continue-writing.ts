'use server';

/**
 * @fileOverview A flow that continues writing text based on the provided content.
 *
 * - continueWriting - A function that continues writing based on existing text.
 * - ContinueWritingInput - The input type for the continueWriting function.
 * - ContinueWritingOutput - The return type for the continueWriting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContinueWritingInputSchema = z.object({
  content: z.string().describe('The existing text to continue from.'),
});
export type ContinueWritingInput = z.infer<typeof ContinueWritingInputSchema>;

const ContinueWritingOutputSchema = z.object({
  continuedText: z.string().describe('The AI-generated continuation of the text.'),
});
export type ContinueWritingOutput = z.infer<typeof ContinueWritingOutputSchema>;

export async function continueWriting(input: ContinueWritingInput): Promise<ContinueWritingOutput> {
  return continueWritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'continueWritingPrompt',
  input: {schema: ContinueWritingInputSchema},
  output: {schema: ContinueWritingOutputSchema},
  prompt: `You are a helpful writing assistant. Your task is to continue writing the following text in a consistent style and tone.
Do not repeat the original text in your response. Only provide the new, additional text.

Original Text:
{{{content}}}

Continuation:
`,
});

const continueWritingFlow = ai.defineFlow(
  {
    name: 'continueWritingFlow',
    inputSchema: ContinueWritingInputSchema,
    outputSchema: ContinueWritingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return {
      continuedText: output!.continuedText,
    };
  }
);
