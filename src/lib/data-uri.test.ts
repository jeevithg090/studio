import { describe, expect, it } from 'vitest';
import { base64DecodedSize, parseDataUri } from './data-uri';

describe('parseDataUri', () => {
  it('parses MIME type, parameters and payload', () => {
    expect(parseDataUri('data:audio/webm;codecs=opus;base64,AAEC')).toEqual({
      mimeType: 'audio/webm',
      params: { codecs: 'opus' },
      base64: 'AAEC',
    });
  });

  it('lower-cases the MIME type and parameter names', () => {
    expect(parseDataUri('data:audio/L16;Rate=24000;base64,AA==')).toMatchObject({
      mimeType: 'audio/l16',
      params: { rate: '24000' },
    });
  });

  it.each(['', 'hello', 'data:audio/wav,AAAA', 'data:;base64,AAAA', 'data:audio/wav;base64,<script>'])(
    'rejects %j',
    (uri) => {
      expect(parseDataUri(uri)).toBeNull();
    }
  );
});

describe('base64DecodedSize', () => {
  it.each([
    ['', 0],
    ['QQ==', 1],
    ['QUI=', 2],
    ['QUJD', 3],
    [Buffer.alloc(1000).toString('base64'), 1000],
  ])('%j decodes to %i bytes', (b64, size) => {
    expect(base64DecodedSize(b64)).toBe(size);
  });
});
