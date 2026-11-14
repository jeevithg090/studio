import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Model names can be overridden per deployment without code changes.
 * The Google AI plugin reads the API key from GEMINI_API_KEY (or GOOGLE_API_KEY).
 */
export const TEXT_MODEL = process.env.VOCALNOTE_TEXT_MODEL || 'gemini-flash-latest';
export const TTS_MODEL = process.env.VOCALNOTE_TTS_MODEL || 'gemini-3.8-flash-tts';
export const TTS_VOICE = process.env.VOCALNOTE_TTS_VOICE || 'Algenib';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(TEXT_MODEL),
});
