'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Upload, Bot, Music, PenLine } from 'lucide-react';

const Logo = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-primary"
      aria-hidden="true"
    >
      <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full">
                {icon}
            </div>
            <CardTitle className="font-headline mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);


export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Logo />
                    <h1 className="font-headline text-2xl font-bold text-foreground">VocalNote</h1>
                </div>
                <Button asChild>
                    <Link href="/notes">Get Started</Link>
                </Button>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
                        The AI-Powered Notebook<br />That <span className="text-primary">Listens & Thinks</span> With You
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                        Capture your thoughts with voice, transcribe lectures from PowerPoints, and let AI summarize, edit, and even read your notes back to you. Welcome to the future of note-taking.
                    </p>
                    <div className="mt-10">
                        <Button size="lg" asChild>
                            <Link href="/notes">Start Taking Notes Now</Link>
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-secondary py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-headline font-bold">A Symphony of Features</h2>
                            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">VocalNote combines cutting-edge AI with intuitive design to revolutionize your workflow.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<Mic className="h-8 w-8 text-primary" />}
                                title="Speech-to-Text"
                                description="Just speak. VocalNote transcribes your voice notes instantly and accurately, so you never miss a beat."
                            />
                            <FeatureCard 
                                icon={<Upload className="h-8 w-8 text-primary" />}
                                title="PPT Text Extraction"
                                description="Upload a presentation and watch as VocalNote extracts all the text, creating a ready-to-use note in seconds."
                            />
                            <FeatureCard 
                                icon={<Bot className="h-8 w-8 text-primary" />}
                                title="AI Summarization"
                                description="Overwhelmed with information? Get a concise, AI-generated summary of any note with a single click."
                            />
                            <FeatureCard 
                                icon={<PenLine className="h-8 w-8 text-primary" />}
                                title="Smart AI Editing"
                                description="Fix grammar, rephrase sentences, or translate your notes into different languages with our powerful AI editor."
                            />
                             <FeatureCard 
                                icon={<Music className="h-8 w-8 text-primary" />}
                                title="Text-to-Speech"
                                description="Listen to your notes on the go. Turn any text into natural-sounding audio and give your eyes a rest."
                            />
                            <div className="md:col-span-2 lg:col-span-1">
                                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                                    <CardHeader>
                                        <div className="mx-auto bg-primary/10 p-3 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.38"/><path d="M16 2l6 6"/><path d="M15 11h-1"/><path d="M12 11h1"/><path d="M9 11h1"/><path d="M14 15h1"/><path d="M11 15h1"/><path d="M8 15h1"/><path d="M13 19h2"/><path d="M9 19h2"/></svg>
                                        </div>
                                        <CardTitle className="font-headline mt-4">And Much More...</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Seamlessly organize, edit, and access your notes from anywhere. Your second brain is here.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Visual Showcase */}
                <section className="py-20">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-headline font-bold">See It In Action</h2>
                            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">A clean, intuitive interface designed for focus and productivity.</p>
                        </div>
                        <div className="relative rounded-lg border bg-card shadow-xl overflow-hidden">
                           <Image src="https://placehold.co/1200x600.png" width={1200} height={600} alt="VocalNote App Screenshot" className="w-full" data-ai-hint="app screenshot" />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} VocalNote. All rights reserved.</p>
            </footer>
        </div>
    );
}
