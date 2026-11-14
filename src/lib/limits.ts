/**
 * Input limits shared by the client (for early, friendly validation) and the
 * server actions (as the authoritative check).
 */

/** Maximum characters of note text sent to the text-generation flows. */
export const MAX_NOTE_TEXT_CHARS = 30_000;

/** Maximum characters converted to speech in one request. */
export const MAX_TTS_TEXT_CHARS = 5_000;

/** Maximum size of a recorded audio clip sent for transcription (bytes). */
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

/** Maximum size of a .pptx file imported in the browser (bytes). */
export const MAX_PPTX_BYTES = 25 * 1024 * 1024;
