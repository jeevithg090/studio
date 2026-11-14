import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Genkit pulls in OpenTelemetry's Node SDK, which has optional dynamic requires
  // that webpack cannot resolve; load these from node_modules at runtime instead.
  serverExternalPackages: ['genkit', '@genkit-ai/core', '@genkit-ai/google-genai', '@opentelemetry/sdk-node'],
  experimental: {
    serverActions: {
      // Voice recordings are sent to the transcription action as base64 data URIs
      // (MAX_AUDIO_BYTES in src/lib/limits.ts plus ~33% encoding overhead).
      bodySizeLimit: '12mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;
