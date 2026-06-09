# Visa Glide — Phase 1 Design Spec

## Overview

Visa Glide ("Glide") is an AI-powered visa application assistant. Users chat with an agent that walks them through country-specific visa requirements one by one, collects documents, and tracks their application progress.

**Phase 1 scope:** Auth + requirement-driven chat + message persistence.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 18, Vite, TypeScript | Fast dev, strong typing |
| Styling | Tailwind CSS + AlignUI design tokens | Pixel-match to the design handoff |
| Routing | React Router v6 | Simple, well-known |
| Auth | Supabase Auth (email/password) | Free tier, built-in session management |
| Database | Supabase Postgres | Conversations, messages, requirements, user profiles |
| File storage | Supabase Storage (Phase 2) | Document uploads |
| LLM | OpenAI GPT-4o-mini via Supabase Edge Function | Fast, cheap, API key stays server-side |
| Icons | RemixIcon (CDN) | Matches design system |
| Fonts | Inter, Inter Display, DM Mono (self-hosted or CDN) | Matches design system |

## Architecture

```
Browser (React SPA)
    │
    ├── Supabase Client (auth, DB reads/writes)
    │       │
    │       ├── Auth (email/password signup + login)
    │       ├── conversations table (CRUD)
    │       └── messages table (CRUD)
    │
    └── Supabase Edge Function: /chat
            │
            ├── Validates auth (JWT from client)
            ├── Fetches requirements for the target country from DB
            ├── Builds system prompt with requirements context
            ├── Calls OpenAI GPT-4o-mini
            └── Stores AI response in messages table, returns to client
```

## Data Model

### Tables

```sql
-- User profiles (auto-created on signup via trigger)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz default now()
);

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'New conversation',
  country text,           -- e.g., 'germany', 'france'
  visa_type text,         -- e.g., 'schengen_tourist'
  status text default 'active', -- active | completed | archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',  -- checklist state, doc refs, etc.
  created_at timestamptz default now()
);

-- Visa requirements (seeded, static reference data)
create table visa_requirements (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  visa_type text not null,
  category text not null,        -- 'financial', 'documents', 'travel', 'personal'
  requirement_key text not null, -- 'min_bank_balance', 'passport_validity', etc.
  title text not null,           -- "Bank balance"
  description text not null,     -- "Minimum 5 lakh INR shown for last 3 months"
  threshold text,                -- "500000" (machine-parseable where applicable)
  recommendation text not null,  -- Friendly advice text for when requirement isn't met
  question_hint text,            -- Suggested question LLM can ask: "How much balance..."
  display_order int not null default 0,
  created_at timestamptz default now(),
  unique(country, visa_type, requirement_key)
);

-- Row-level security
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table visa_requirements enable row level security;

-- Policies: users can only see their own data
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users see own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users insert own conversations" on conversations for insert with check (auth.uid() = user_id);
create policy "Users see own messages" on messages for select using (
  conversation_id in (select id from conversations where user_id = auth.uid())
);
create policy "Users insert own messages" on messages for insert with check (
  conversation_id in (select id from conversations where user_id = auth.uid())
);
-- Requirements are public read
create policy "Anyone can read requirements" on visa_requirements for select using (true);
```

### Seed Data (Germany + France)

Requirements will be seeded for two countries covering these categories:

**Germany (Schengen Tourist):**
- Financial: min bank balance (5 lakh INR), income proof
- Documents: passport (6mo validity beyond return), passport photos, cover letter, travel insurance
- Travel: confirmed itinerary, hotel booking, return flight
- Personal: employment letter, leave approval

**France (Schengen Tourist):**
- Similar structure, slightly different thresholds (e.g., 6 lakh INR)

## Chat Flow — Requirement-Driven Conversation

### How it works:

1. User starts a new chat or picks a destination
2. Client creates a `conversation` record with the country
3. Client calls the `/chat` edge function with the first user message
4. Edge function:
   a. Loads all `visa_requirements` for that country/visa_type
   b. Loads conversation history (last N messages)
   c. Constructs a system prompt (see below)
   d. Calls OpenAI
   e. Stores AI response in `messages` table
   f. Returns AI response to client

### System Prompt Strategy:

```
You are Glide, an AI visa assistant. You help users prepare their visa applications.

CONTEXT:
The user wants to visit {country} on a {visa_type} visa.

REQUIREMENTS FOR THIS VISA:
{for each requirement in order:}
- [{category}] {title}: {description}
  Threshold: {threshold}
  If not met, advise: {recommendation}
  Suggested question: {question_hint}

INSTRUCTIONS:
- Walk the user through these requirements in a natural, conversational way.
- Group related topics (e.g., ask about finances together, documents together).
- For each requirement, ask the user about their situation.
- If they meet the requirement, acknowledge it positively and move on.
- If they don't meet it, explain what's recommended and give actionable advice.
  Do NOT be discouraging — frame it as "here's what you can do."
- Keep track of which requirements have been discussed. Once all are covered,
  provide a summary of what's good vs. what needs attention.
- Stay on topic: only discuss travel/visa-related matters.
- If the user asks something unrelated, politely redirect.
- Be concise but warm. Use bullet points for lists.
- When appropriate, offer to help with next steps (document generation, etc.).

CONVERSATION STATE:
{Previously discussed requirements and their outcomes, if any}
```

### Guardrails:

The system prompt constrains the LLM to:
- Only discuss travel/visa topics
- Follow the requirements checklist
- Never fabricate requirements not in the DB
- Redirect off-topic questions

Additional safety: the edge function validates that messages are reasonable length, strips any injection-like patterns, and rate-limits per user.

## UI Components (Phase 1)

Matching the AlignUI design handoff:

### Login Page
- Split-screen: form (left), branded panel (right)
- Email + password fields
- "Sign up" / "Sign in" toggle
- Social buttons (Google/Apple) — wired up in Phase 2, shown but disabled for now

### App Shell
- **Sidebar** (272px): logo, nav items (New Chat, Documents*, Dashboard*, Tracking*), recent conversations, user profile
  - *Documents/Dashboard/Tracking show as nav items but display "Coming soon" in Phase 1
- **Main area**: topbar (breadcrumb) + content

### Chat Home
- Greeting: "Where would you like to travel?"
- Destination cards (Germany, France) — clickable, starts a conversation
- Suggested prompts chips
- Composer (textarea + send button + voice button shell)

### Chat View
- Message thread: user bubbles (right, blue tint), AI messages (left, plain)
- AI messages can include inline checklists (requirement progress)
- Typing indicator (3-dot bounce)
- Composer at bottom
- Side panel (collapsible, for doc preview — Phase 2 wires it up)

### Design Token Mapping

Tailwind will be configured with AlignUI tokens:

```js
// tailwind.config.ts (excerpt)
colors: {
  primary: { DEFAULT: '#335CFF', dark: '#2547D0', darker: '#1F3BAD', alpha10: 'rgba(71,108,255,0.10)' },
  slate: { 0: '#FFFFFF', 50: '#F5F7FA', 200: '#E1E4EA', 400: '#99A0AE', 600: '#525866', 950: '#0E121B' },
  success: { DEFAULT: '#1FC16B', dark: '#178C4E', lighter: '#E3F7EC' },
  error: { DEFAULT: '#FB3748', dark: '#D02533', lighter: '#FFEBEC' },
  warning: { DEFAULT: '#FA7319', lighter: '#FFF3EB' },
  away: { DEFAULT: '#F6B51E', lighter: '#FFFAEB' },
  // ...
}
fontFamily: {
  sans: ['Inter', ...],
  display: ['Inter Display', ...],
  mono: ['DM Mono', ...],
}
```

## Project Structure

```
visa-glide/
├── src/
│   ├── app.tsx                  # Router + auth gate
│   ├── main.tsx                 # Entry point
│   ├── components/
│   │   ├── ui/                  # Generic: Button, Input, Badge, Avatar
│   │   ├── layout/             # Sidebar, Topbar, AppShell
│   │   ├── chat/               # Composer, Message, TypingIndicator, DocPanel
│   │   └── auth/               # LoginForm, AuthLayout
│   ├── pages/
│   │   ├── login.tsx
│   │   ├── chat-home.tsx
│   │   ├── chat.tsx
│   │   ├── documents.tsx       # Placeholder
│   │   ├── dashboard.tsx       # Placeholder
│   │   └── tracking.tsx        # Placeholder
│   ├── lib/
│   │   ├── supabase.ts         # Client init
│   │   ├── api.ts              # Edge function caller
│   │   └── constants.ts        # Destination data, etc.
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-conversations.ts
│   │   └── use-chat.ts
│   ├── types/
│   │   └── index.ts            # DB types, message types
│   └── styles/
│       └── globals.css         # Tailwind directives + custom AlignUI classes
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed.sql                # Germany + France requirements
│   └── functions/
│       └── chat/
│           └── index.ts        # OpenAI proxy edge function
├── public/
│   └── fonts/                  # Inter, DM Mono
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Edge Function: `/chat`

```typescript
// Pseudocode for supabase/functions/chat/index.ts
// 1. Verify JWT from Authorization header
// 2. Parse body: { conversation_id, message }
// 3. Fetch conversation (verify ownership)
// 4. Fetch requirements for conversation.country
// 5. Fetch last 20 messages for context
// 6. Build system prompt with requirements
// 7. Call OpenAI GPT-4o-mini
// 8. Store user message + AI response in messages table
// 9. Return AI response
```

## Security Considerations

- OpenAI API key: stored in Supabase Edge Function secrets, never exposed to client
- Supabase anon key: used for client-side auth only; RLS protects all data
- Input validation: message length capped at 2000 chars, rate limit 30 msgs/min per user
- XSS: React's built-in escaping handles output; no dangerouslySetInnerHTML
- Auth: all routes except login require active session

## Out of Scope (Phase 1)

- Document upload and viewing
- Application tracking timeline
- Dashboard with progress metrics
- Voice input
- Social auth (Google/Apple)
- Dark mode
- Mobile responsive (desktop-first for now)
- Real visa appointment booking
