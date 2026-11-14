export interface ParsedDataUri {
  /** Base MIME type without parameters, lower-cased (e.g. `audio/webm`). */
  mimeType: string;
  /** MIME parameters, with lower-cased keys (e.g. `{ codecs: 'opus' }`). */
  params: Record<string, string>;
  /** The raw base64 payload. */
  base64: string;
}

const DATA_URI_PATTERN = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+)((?:;[^;,]+)*);base64,([a-z0-9+/=\s]*)$/i;

/**
 * Parses a base64 `data:` URI such as `data:audio/webm;codecs=opus;base64,AAAA`.
 * Returns `null` when the input is not a well-formed base64 data URI.
 */
export function parseDataUri(uri: string): ParsedDataUri | null {
  const match = DATA_URI_PATTERN.exec(uri);
  if (!match) return null;
  const [, mimeType, rawParams, base64] = match;
  const params: Record<string, string> = {};
  for (const param of rawParams.split(';').filter(Boolean)) {
    const [key, ...value] = param.split('=');
    params[key.trim().toLowerCase()] = value.join('=').trim();
  }
  return { mimeType: mimeType.toLowerCase(), params, base64: base64.replace(/\s/g, '') };
}

/** Number of bytes a base64 payload decodes to. */
export function base64DecodedSize(base64: string): number {
  const clean = base64.replace(/\s/g, '');
  if (clean.length === 0) return 0;
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}
