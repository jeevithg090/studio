'use server';
/**
 * @fileOverview A flow to generate audio from text using ElevenLabs Text-to-Speech.
 *
 * - generateAudio - A function that handles the audio generation process.
 * - GenerateAudioInput - The input type for the generateAudio function.
 * - GenerateAudioOutput - The return type for the generateAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ElevenLabsClient } from 'elevenlabs';
import { PassThrough } from 'stream';

const GenerateAudioInputSchema = z.object({
  text: z.string().describe('The text to convert to audio.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

const GenerateAudioOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/mpeg;base64,<encoded_data>'"
    ),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;

export async function generateAudio(
  input: GenerateAudioInput
): Promise<GenerateAudioOutput> {
  return generateAudioFlow(input);
}

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

const streamToBuffer = (stream: PassThrough): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
};

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async (input) => {
    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ElevenLabs API key is not configured. Please set the ELEVENLABS_API_KEY environment variable.");
    }
    
    try {
        const audioStream = await elevenlabs.generate({
            voice: "Rachel",
            text: input.text,
            model_id: "eleven_multilingual_v2"
        });

        const buffer = await streamToBuffer(audioStream as PassThrough);
        const audioDataUri = `data:audio/mpeg;base64,${buffer.toString('base64')}`;

        return { audioDataUri };

    } catch (error) {
        console.error("Error generating audio with ElevenLabs:", error);
        throw new Error("Failed to generate audio using ElevenLabs.");
    }
  }
);
