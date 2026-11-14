import { ImageResponse } from 'next/og';

export const alt = 'VocalNote: the AI-powered notebook that listens and thinks with you';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ffffff 60%)',
        color: '#030712',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 700, color: '#7c3aed' }}>VocalNote</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 24, maxWidth: 1000 }}>
        The AI-powered notebook that listens &amp; thinks with you
      </div>
      <div style={{ fontSize: 30, marginTop: 32, color: '#4b5563' }}>
        Speech-to-text · PowerPoint import · Summaries · AI editing · Text-to-speech
      </div>
    </div>,
    size
  );
}
