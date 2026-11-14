import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

const description =
  'A voice-powered AI notebook: record and transcribe, import PowerPoint text, and summarize, edit, continue and listen to your notes.';

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: 'VocalNote – The AI-Powered Notebook',
    template: '%s · VocalNote',
  },
  description,
  applicationName: 'VocalNote',
  openGraph: {
    type: 'website',
    siteName: 'VocalNote',
    title: 'VocalNote – The AI-Powered Notebook',
    description,
  },
  twitter: {
    card: 'summary',
    title: 'VocalNote – The AI-Powered Notebook',
    description,
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
