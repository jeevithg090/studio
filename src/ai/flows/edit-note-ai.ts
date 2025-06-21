'use server';

/**
 * @fileOverview A flow that edits note content using AI for rephrasing, translating, or grammar correction.
 *
 * - editNoteWithAI - A function that edits the content of a note using AI.
 * - EditNoteWithAIInput - The input type for the editNoteWithAI function.
 * - EditNoteWithAIOutput - The return type for the editNoteWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditNoteWithAIInputSchema = z.object({
  content: z.string().describe('The content of the note to be edited.'),
  action: z
    .enum(['rephrase', 'translate', 'fix grammar'])
    .describe('The action to perform on the note content.'),
  language: z.string().optional().describe('The target language for translation.'),
});
export type EditNoteWithAIInput = z.infer<typeof EditNoteWithAIInputSchema>;

const EditNoteWithAIOutputSchema = z.object({
  editedContent: z.string().describe('The edited content of the note.'),
});
export type EditNoteWithAIOutput = z.infer<typeof EditNoteWithAIOutputSchema>;

export async function editNoteWithAI(input: EditNoteWithAIInput): Promise<EditNoteWithAIOutput> {
  return editNoteWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editNoteAIPrompt',
  input: {schema: EditNoteWithAIInputSchema},
  output: {schema: EditNoteWithAIOutputSchema},
  prompt: `You are an AI assistant that helps users edit their notes.

The user will provide you with the content of a note and an action to perform on it. You should perform the action and return the edited content.

Here is the note content: {{{content}}}

Here is the action: {{{action}}}

{{#if language}}
The target language is: {{{language}}}
{{/if}}
`,
});

const editNoteWithAIFlow = ai.defineFlow(
  {
    name: 'editNoteWithAIFlow',
    inputSchema: EditNoteWithAIInputSchema,
    outputSchema: EditNoteWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      editedContent: output!.editedContent,
    };
  }
);
