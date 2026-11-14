'use server';

/**
 * Edits note content with AI: rephrase, translate, or fix grammar.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MAX_NOTE_TEXT_CHARS } from '@/lib/limits';

const EditNoteWithAIInputSchema = z
  .object({
    content: z.string().trim().min(1).max(MAX_NOTE_TEXT_CHARS).describe('The content of the note to be edited.'),
    action: z.enum(['rephrase', 'translate', 'fix grammar']).describe('The action to perform on the note content.'),
    language: z.string().trim().min(1).max(50).optional().describe('The target language for translation.'),
  })
  .refine((input) => input.action !== 'translate' || input.language, {
    message: 'A target language is required for translation.',
    path: ['language'],
  });
export type EditNoteWithAIInput = z.infer<typeof EditNoteWithAIInputSchema>;

const EditNoteWithAIOutputSchema = z.object({
  editedContent: z.string().describe('The edited content of the note.'),
});
export type EditNoteWithAIOutput = z.infer<typeof EditNoteWithAIOutputSchema>;

const prompt = ai.definePrompt({
  name: 'editNoteAIPrompt',
  input: { schema: EditNoteWithAIInputSchema },
  output: { schema: EditNoteWithAIOutputSchema },
  prompt: `You are an AI assistant that helps users edit their notes.
Perform the requested action on the note content and return only the full edited content.
Preserve the original meaning, line breaks and list formatting.

Action: {{{action}}}
{{#if language}}
Target language: {{{language}}}
{{/if}}

Note content:
{{{content}}}
`,
});

const editNoteWithAIFlow = ai.defineFlow(
  {
    name: 'editNoteWithAIFlow',
    inputSchema: EditNoteWithAIInputSchema,
    outputSchema: EditNoteWithAIOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('The model returned no edited content.');
    return output;
  }
);

export async function editNoteWithAI(input: EditNoteWithAIInput): Promise<EditNoteWithAIOutput> {
  return editNoteWithAIFlow(input);
}
