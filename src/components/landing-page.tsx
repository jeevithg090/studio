import Link from 'next/link';
import { ArrowRight, Bot, FileUp, HardDrive, Keyboard, Mic, Music, PenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Mic,
    title: 'Speech-to-text',
    description: 'Record straight from your microphone and Gemini transcribes the clip into your note.',
  },
  {
    icon: FileUp,
    title: 'PowerPoint import',
    description: 'Drop in a .pptx and the slide text is extracted in your browser, slide by slide.',
  },
  {
    icon: Bot,
    title: 'AI summaries',
    description: 'Condense a long note into a short paragraph of key points and action items.',
  },
  {
    icon: PenLine,
    title: 'Smart editing',
    description: 'Rephrase, fix grammar, or translate a note into Spanish, French, German, Hindi, Japanese or Chinese.',
  },
  {
    icon: Keyboard,
    title: 'Continue writing',
    description: 'Stuck mid-thought? Let the AI write the next paragraph in your style and tone.',
  },
  {
    icon: Music,
    title: 'Text-to-speech',
    description: 'Turn any note into natural-sounding audio and listen back with a built-in player.',
  },
];

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <Card className="border-primary/10 bg-card/50 text-center shadow-lg backdrop-blur-sm duration-300 hover:-translate-y-1 hover:shadow-xl transition-all">
      <CardHeader>
        <div className="mx-auto rounded-full bg-primary/10 p-4">
          <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="mt-4 font-headline text-xl">
          <h3>{title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <div
        className="absolute left-0 top-0 -z-10 h-[600px] w-full bg-gradient-to-br from-primary/20 via-background to-background"
        aria-hidden="true"
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="VocalNote home">
            <Logo className="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="font-headline text-xl font-bold sm:text-2xl">VocalNote</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/notes">Open notebook</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-grow">
        <section className="container relative mx-auto px-4 py-20 text-center sm:px-6 md:py-32 lg:px-8">
          <div
            className="absolute -left-1/4 -top-1/4 -z-10 h-1/2 w-1/2 rounded-full bg-primary/10 opacity-50 blur-3xl"
            aria-hidden="true"
          />
          <p className="mb-6 inline-block rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            Powered by Google Gemini via Genkit
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-7xl">
            The AI-powered notebook
            <br />
            that{' '}
            <span className="bg-gradient-to-r from-primary to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
              listens &amp; thinks
            </span>{' '}
            with you
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
            Capture thoughts with your voice, pull the text out of slide decks, and let AI summarize, edit, continue,
            and read your notes back to you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="shadow-lg shadow-primary/30">
              <Link href="/notes">
                Start writing <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="#features">See features</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 bg-secondary/50 py-20" aria-labelledby="features-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 id="features-heading" className="font-headline text-3xl font-bold md:text-5xl">
                Everything in one notebook
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Write, speak, import and refine notes without leaving the editor.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" aria-labelledby="privacy-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-primary/10 p-8 text-center md:p-16">
              <HardDrive className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
              <h2 id="privacy-heading" className="mt-4 font-headline text-3xl font-bold md:text-5xl">
                Your notes stay in your browser
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                No account needed. Notes are saved to this browser&rsquo;s local storage; only the text or audio you
                send to an AI feature leaves your device.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild className="shadow-lg shadow-primary/30">
                  <Link href="/notes">
                    Open VocalNote <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>VocalNote, built with Next.js, Genkit and Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}
