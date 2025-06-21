'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, Upload, Bot, Music, PenLine, Star, ArrowRight } from 'lucide-react';

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
    <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                {icon}
            </div>
            <CardTitle className="font-headline mt-4 text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg h-full flex flex-col">
        <CardContent className="pt-6 flex-grow">
            <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-foreground italic">"{quote}"</p>
        </CardContent>
        <CardHeader>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
            <CardDescription>{role}</CardDescription>
        </CardHeader>
    </Card>
);

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
             <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-primary/20 via-background to-background -z-10"></div>
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                    <h1 className="font-headline text-2xl font-bold text-foreground">VocalNote</h1>
                </Link>
                <Button asChild>
                    <Link href="/notes">Get Started</Link>
                </Button>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
                    <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl opacity-50 -z-10"></div>
                    <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full filter blur-3xl opacity-50 -z-10"></div>
                    
                    <Button asChild variant="outline" className="mb-6 rounded-full">
                        <Link href="#features">
                            Now powered by Gemini 2.0 ✨
                        </Link>
                    </Button>
                    <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-foreground">
                        The AI-Powered Notebook<br />That <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Listens & Thinks</span> With You
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                        Capture thoughts with your voice, transcribe lectures from PowerPoints, and let AI summarize, edit, and even read your notes back to you. The future of note-taking is here.
                    </p>
                    <div className="mt-10 flex justify-center items-center gap-4">
                        <Button size="lg" asChild className="shadow-lg shadow-primary/30">
                            <Link href="/notes">Start for Free <ArrowRight className="ml-2" /></Link>
                        </Button>
                        <Button size="lg" variant="ghost" asChild>
                            <Link href="#features">Learn More</Link>
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-secondary/50 py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-headline font-bold">A Symphony of Features</h2>
                            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">VocalNote combines cutting-edge AI with intuitive design to revolutionize your workflow.</p>
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
                             <FeatureCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.38"/><path d="M16 2l6 6"/><path d="M15 11h-1"/><path d="M12 11h1"/><path d="M9 11h1"/><path d="M14 15h1"/><path d="M11 15h1"/><path d="M8 15h1"/><path d="M13 19h2"/><path d="M9 19h2"/></svg>}
                                title="And Much More..."
                                description="Seamlessly organize, edit, and access your notes from anywhere. Your second brain is here."
                            />
                        </div>
                    </div>
                </section>
                
                {/* Testimonials Section */}
                <section className="py-20">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-headline font-bold">Loved by Creatives & Professionals</h2>
                            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it. Here's what our users are saying.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <TestimonialCard 
                                name="Sarah J." 
                                role="Product Manager" 
                                quote="VocalNote has completely changed my meeting workflow. I can record, transcribe, and summarize in minutes. It's a game-changer." 
                           />
                           <TestimonialCard 
                                name="Michael B." 
                                role="PhD Student" 
                                quote="The PPT extraction feature saved me hours of manual note-taking from lecture slides. I can focus on the lecture itself now. Absolutely essential." 
                           />
                           <TestimonialCard 
                                name="Alex R." 
                                role="Creative Writer" 
                                quote="I get my best ideas on the move. Being able to just talk to my phone and have it perfectly transcribed and organized is incredible for my creative process." 
                           />
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-primary/10 rounded-xl p-10 md:p-16 text-center relative overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full filter blur-xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full filter blur-xl"></div>
                            <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Ready to Supercharge Your Notes?</h2>
                            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Join thousands of users who are thinking faster, working smarter, and capturing every brilliant idea.</p>
                            <div className="mt-8">
                                <Button size="lg" asChild className="shadow-lg shadow-primary/30">
                                    <Link href="/notes">Get VocalNote for Free <ArrowRight className="ml-2" /></Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground border-t">
                <p>&copy; {new Date().getFullYear()} VocalNote. All rights reserved.</p>
            </footer>
        </div>
    );
}
