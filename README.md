# Glide — AI Visa Assistant

An AI-powered visa application assistant that walks users through country-specific visa requirements using a conversational interface.

## Quick Start (Local Development)

The app runs in **mock mode** without any credentials — you can see the full UI immediately:

```bash
nvm use 20
npm install
npm run dev
```

Open http://localhost:5173. The app auto-authenticates and serves mock AI responses.

## Connecting to Supabase + OpenAI

1. Create a Supabase project at https://supabase.com
2. Run the migration: copy `supabase/migrations/001_initial_schema.sql` into the Supabase SQL editor and execute
3. Run the seed: copy `supabase/seed.sql` into the SQL editor and execute
4. Deploy the edge function: `supabase functions deploy chat`
5. Set edge function secrets:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-your-key-here
   ```
6. Create `.env.local` from `.env.example`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
7. Restart the dev server — it will now use real auth and AI responses.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 (AlignUI design tokens)
- Supabase (Auth, Postgres, Edge Functions)
- OpenAI GPT-4o-mini
- RemixIcon + Inter + DM Mono

## Project Structure

- `src/` — React app (components, pages, hooks, lib)
- `supabase/migrations/` — Database schema
- `supabase/seed.sql` — Visa requirements for Germany and France
- `supabase/functions/chat/` — Edge function that proxies to OpenAI

## How It Works

1. User picks a destination or asks about a visa
2. The chat edge function loads country-specific requirements from the database
3. Requirements are injected into the LLM system prompt
4. The AI walks the user through each requirement naturally, grouping related topics
5. If the user doesn't meet a requirement, the AI gives actionable advice
6. Once all requirements are covered, a summary is provided

## Phase 2 (Planned)

- Document upload and management
- Application progress dashboard
- Visa tracking timeline
- Voice input
- Social auth (Google/Apple)
