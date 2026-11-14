'use server';

/**
 * Transcribes a recorded audio clip into text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { base64DecodedSize, parseDataUri } from '@/lib/data-uri';
import { MAX_AUDIO_BYTES } from '@/lib/limits';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .refine((uri) => parseDataUri(uri)?.mimeType.startsWith('audio/') ?? false, {
      message: "Expected a base64 audio data URI ('data:audio/<type>;base64,<data>').",
    })
    .refine((uri) => base64DecodedSize(parseDataUri(uri)?.base64 ?? '') <= MAX_AUDIO_BYTES, {
      message: 'The recording is too large to transcribe.',
    })
    .describe("An audio recording as a base64 data URI: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async ({ audioDataUri }) => {
    const parsed = parseDataUri(audioDataUri)!;
    const { output } = await ai.generate({
      prompt: [
        {
          text: 'Transcribe the following audio recording verbatim. Return only the transcribed text. If there is no intelligible speech, return an empty string.',
        },
        // Strip codec parameters (e.g. `;codecs=opus`) so the model receives a plain MIME type.
        { media: { url: `data:${parsed.mimeType};base64,${parsed.base64}`, contentType: parsed.mimeType } },
      ],
      output: { schema: TranscribeAudioOutputSchema },
    });
    if (!output) throw new Error('The model returned no transcription.');
    return output;
  }
);

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}
