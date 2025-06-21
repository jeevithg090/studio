'use server';
/**
 * @fileOverview A flow to extract text from a PowerPoint presentation.
 *
 * - extractPptText - A function that handles the PPT text extraction process.
 * - ExtractPptTextInput - The input type for the extractPptText function.
 * - ExtractPptTextOutput - The return type for the extractPptText function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ExtractPptTextInputSchema = z.object({
  pptDataUri: z
    .string()
    .describe(
      "A PowerPoint file, as a data URI that must include a MIME type (e.g., application/vnd.openxmlformats-officedocument.presentationml.presentation) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPptTextInput = z.infer<typeof ExtractPptTextInputSchema>;

const ExtractPptTextOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the presentation.'),
});
export type ExtractPptTextOutput = z.infer<typeof ExtractPptTextOutputSchema>;

export async function extractPptText(input: ExtractPptTextInput): Promise<ExtractPptTextOutput> {
  return extractPptTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPptTextPrompt',
  input: { schema: ExtractPptTextInputSchema },
  output: { schema: ExtractPptTextOutputSchema },
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that extracts text from presentation files. Extract all readable text from the slides in the provided file. Maintain the order of the text as it appears on the slides. Format the output clearly as plain text.

Presentation: {{media url=pptDataUri}}`,
});

const extractPptTextFlow = ai.defineFlow(
  {
    name: 'extractPptTextFlow',
    inputSchema: ExtractPptTextInputSchema,
    outputSchema: ExtractPptTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
