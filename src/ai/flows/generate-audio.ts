'use server';

/**
 * Converts note text to speech with a Gemini TTS model and returns a WAV data URI.
 */

import { ai, TTS_MODEL, TTS_VOICE } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { parseDataUri } from '@/lib/data-uri';
import { MAX_TTS_TEXT_CHARS } from '@/lib/limits';
import { toWavBytes } from '@/lib/wav';

const GenerateAudioInputSchema = z.object({
  text: z.string().trim().min(1).max(MAX_TTS_TEXT_CHARS).describe('The text to convert to audio.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

const GenerateAudioOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async ({ text }) => {
    const { media } = await ai.generate({
      model: googleAI.model(TTS_MODEL),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } },
        },
      },
      prompt: text,
    });

    const parsed = media ? parseDataUri(media.url) : null;
    if (!parsed) throw new Error('The text-to-speech model returned no audio.');

    // Depending on the model, Gemini TTS returns either a WAV file or raw 16-bit PCM;
    // normalize to WAV so browsers can play it.
    const wav = toWavBytes(parsed.mimeType, parsed.params, Buffer.from(parsed.base64, 'base64'));
    return { audioDataUri: `data:audio/wav;base64,${Buffer.from(wav).toString('base64')}` };
  }
);

export async function generateAudio(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
  return generateAudioFlow(input);
}
