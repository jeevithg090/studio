# VocalNote: the AI-powered notebook

VocalNote is a voice-first notebook for the web. You can dictate notes, pull the text out of PowerPoint decks, and use
Google Gemini to summarize, rephrase, translate, proofread, continue and read your notes aloud. It is built with
Next.js (App Router), Genkit and shadcn/ui. Notes are stored in the browser, so it needs no account and no database.

<a href="https://studio.firebase.google.com/import?url=https%3A%2F%2Fgithub.com%2Fjeevithg090%2Fstudio">
  <img height="32" alt="Continue in Firebase Studio" src="https://cdn.firebasestudio.dev/btn/continue_blue_32.svg">
</a>

## Features

| Feature                  | How it works                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 🎙️ **Speech-to-text**    | Record from the microphone (`MediaRecorder`); the clip is sent to Gemini and the transcript is appended to the note.         |
| 📄 **PowerPoint import** | `.pptx` files are unzipped and parsed **in the browser** and the slide text is added in deck order. Nothing is uploaded.     |
| 🤖 **AI summary**        | Generates a short summary of key points and action items, shown under the note.                                              |
| ✍️ **AI editing**        | Rephrase, fix grammar, or translate into Spanish, French, German, Hindi, Japanese or Mandarin Chinese.                       |
| ⌨️ **Continue writing**  | Gemini writes the next paragraph in the same style and tone.                                                                 |
| 🎧 **Text-to-speech**    | Converts a note to speech with a Gemini TTS model and plays it in a built-in audio player.                                   |
| 💾 **Local persistence** | Notes autosave to `localStorage`. Generated audio is dropped first if the storage quota is exceeded.                         |
| 🔎 **Search**            | Instant, case-insensitive search across note titles and content.                                                             |
| 📱 **Responsive UI**     | Collapsible sidebar (a slide-over sheet on mobile), keyboard- and screen-reader-friendly controls, loading and error states. |

## Tech stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions) with React 18 and TypeScript (strict)
- **AI:** [Genkit](https://genkit.dev/) with the [`@genkit-ai/google-genai`](https://genkit.dev/docs/js/integrations/google-genai/) plugin (Gemini)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), [Tailwind CSS](https://tailwindcss.com/), [lucide-react](https://lucide.dev/) icons
- **PPTX parsing:** [JSZip](https://stuk.github.io/jszip/), running client-side
- **Quality:** ESLint (`next/core-web-vitals` and `next/typescript`), Prettier, Vitest
- **Hosting:** set up for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) (`apphosting.yaml`). It also runs on any Node.js host.

## Architecture

```
Browser (React client components)                     Server (Next.js Server Actions)
┌───────────────────────────────────────────┐          ┌──────────────────────────────────┐
│ /notes  VocalNoteApp                      │          │ src/ai/flows/*.ts  ('use server') │
│  ├─ useNotes ── localStorage (persist)    │  RPC     │  ├─ summarizeNote                 │
│  ├─ NoteList (search, select)             │ ───────▶ │  ├─ editNoteWithAI                │
│  └─ NoteEditor                            │          │  ├─ continueWriting               │
│      ├─ useAudioRecorder ─ data URI ──────┼────────▶ │  ├─ transcribeAudio               │
│      ├─ lib/pptx (JSZip, in-browser)      │          │  └─ generateAudio ─ lib/wav       │
│      └─ AIEditMenu                        │          │           │ zod-validated input   │
└───────────────────────────────────────────┘          │           ▼                       │
                                                       │   Genkit ─▶ Google Gemini API     │
                                                       └──────────────────────────────────┘
```

- Each AI feature is a **Genkit flow** exposed as a **Next.js Server Action**. Inputs are validated with zod, with
  length and size limits from `src/lib/limits.ts`, before any model call. The API key stays on the server.
- **Notes never leave the browser** unless you call an AI feature, and then only the text or audio for that request is sent.
- Pure logic (note operations, storage, PPTX parsing, WAV encoding, data-URI parsing) lives in `src/lib` and has unit tests.

## Getting started

### Prerequisites

- Node.js **22+** and npm
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Setup

```bash
git clone https://github.com/jeevithg090/studio.git vocalnote
cd vocalnote
npm ci
cp .env.example .env.local   # then set GEMINI_API_KEY
npm run dev                  # http://localhost:9002
```

Without an API key the notebook still works: you can write, search, delete and import PPTX files. Only the AI
actions fail, and they show an error toast.

### Environment variables

| Variable               | Required | Default                | Description                                                 |
| ---------------------- | -------- | ---------------------- | ----------------------------------------------------------- |
| `GEMINI_API_KEY`       | Yes\*    | none                   | Gemini API key. `GOOGLE_API_KEY` is also accepted.          |
| `VOCALNOTE_TEXT_MODEL` | No       | `gemini-flash-latest`  | Model for summaries, edits, continuation and transcription. |
| `VOCALNOTE_TTS_MODEL`  | No       | `gemini-3.8-flash-tts` | Text-to-speech model.                                       |
| `VOCALNOTE_TTS_VOICE`  | No       | `Algenib`              | Prebuilt TTS voice name.                                    |
| `NEXT_PUBLIC_SITE_URL` | No       | none                   | Public URL, used to make Open Graph URLs absolute.          |

\* Required for the AI features only.

## Scripts

| Command              | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`        | Start the dev server (Turbopack) on port 9002                        |
| `npm run build`      | Production build (type-checks and lints)                             |
| `npm start`          | Serve the production build                                           |
| `npm test`           | Run the unit tests once (Vitest)                                     |
| `npm run test:watch` | Run the tests in watch mode                                          |
| `npm run lint`       | ESLint                                                               |
| `npm run typecheck`  | `tsc --noEmit`                                                       |
| `npm run format`     | Format the code with Prettier (`format:check` to verify)             |
| `npm run check`      | Type-check, lint, format check and tests in one go                   |
| `npm run genkit:dev` | Open the Genkit developer UI to run and trace the flows on their own |

## Deployment

### Firebase App Hosting

1. Create an App Hosting backend connected to this repository (Firebase console → App Hosting).
2. Store the API key as a secret:
   ```bash
   firebase apphosting:secrets:set gemini-api-key
   ```
3. Expose it to the app by adding it to `apphosting.yaml`:
   ```yaml
   env:
     - variable: GEMINI_API_KEY
       secret: gemini-api-key
   ```
4. Push to the live branch. App Hosting runs `npm run build` and serves the app.

### Any Node.js host

```bash
npm ci && npm run build
GEMINI_API_KEY=... npm start   # listens on $PORT (default 3000)
```

Server Actions accept request bodies of up to 12 MB (`next.config.ts`) so voice recordings fit. Make sure any proxy in
front of the app allows that size too.

## Project structure

```
├── apphosting.yaml          # Firebase App Hosting runtime settings
├── docs/blueprint.md        # Original product and style blueprint
├── next.config.ts           # Security headers, Server Action body limit, server externals
├── src/
│   ├── ai/
│   │   ├── genkit.ts        # Genkit instance and model configuration
│   │   ├── dev.ts           # Entry point for `npm run genkit:dev`
│   │   └── flows/           # One Server Action and Genkit flow per AI feature
│   ├── app/
│   │   ├── layout.tsx       # Fonts, metadata, toaster
│   │   ├── page.tsx         # Landing page
│   │   ├── notes/page.tsx   # The notebook app
│   │   ├── error.tsx        # Error boundary
│   │   └── not-found.tsx    # 404 page
│   ├── components/
│   │   ├── vocal-note-app.tsx   # App shell: sidebar, header, editor
│   │   ├── note-list.tsx        # Searchable note list
│   │   ├── note-editor.tsx      # Editor, toolbar and AI actions
│   │   ├── ai-edit-menu.tsx     # Rephrase, grammar and translate menu
│   │   ├── landing-page.tsx
│   │   └── ui/                  # shadcn/ui primitives in use
│   ├── hooks/               # useNotes (persistence), useAudioRecorder, useToast, useIsMobile
│   └── lib/                 # Framework-free logic and its tests (*.test.ts)
└── vitest.config.ts
```

## Limitations

- Notes live in one browser's `localStorage`. They do not sync between devices, and clearing site data deletes them.
- Only modern `.pptx` files are supported. Legacy binary `.ppt` files are not, and text inside images or charts is not extracted.
- The AI Server Actions have no authentication or rate limiting. On a public deployment, anyone who can reach the app can use your Gemini quota.
