# Visa Glide Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working vertical slice — email auth, requirement-driven AI chat with OpenAI GPT-4o-mini, message persistence via Supabase — matching the AlignUI "Glide" design.

**Architecture:** React SPA with Supabase for auth/DB. Chat messages route through a Supabase Edge Function that loads country-specific visa requirements from the DB, builds a system prompt, and proxies to OpenAI. All credentials are environment variables — plug in when ready.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS (AlignUI tokens), React Router v6, Supabase (Auth + Postgres + Edge Functions), OpenAI GPT-4o-mini, RemixIcon, Inter/DM Mono fonts.

---

## File Structure

```
visa-glide/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html
├── .env.example
├── .gitignore
├── src/
│   ├── main.tsx
│   ├── app.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-chat.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   └── input.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── app-shell.tsx
│   │   ├── auth/
│   │   │   └── login-form.tsx
│   │   └── chat/
│   │       ├── composer.tsx
│   │       ├── message.tsx
│   │       ├── typing-indicator.tsx
│   │       └── destination-card.tsx
│   └── pages/
│       ├── login.tsx
│       ├── chat-home.tsx
│       ├── chat.tsx
│       ├── documents.tsx
│       ├── dashboard.tsx
│       └── tracking.tsx
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed.sql
│   └── functions/
│       └── chat/
│           └── index.ts
└── docs/
```

---

## Task 1: Project Scaffolding + Tooling

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/index.css`

- [ ] **Step 1: Initialize project with Vite**

```bash
cd /Users/yashbhati/Documents/pe/visa-glide
npm create vite@latest . -- --template react-ts
```

Select "React" and "TypeScript" if prompted interactively. If it fails because the directory is not empty (docs folder exists), use:

```bash
npm create vite@latest tmp-scaffold -- --template react-ts
mv tmp-scaffold/* tmp-scaffold/.* . 2>/dev/null; rmdir tmp-scaffold
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
```

- [ ] **Step 3: Configure Tailwind with AlignUI tokens**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          0: "#FFFFFF",
          50: "#F5F7FA",
          100: "#F2F5F8",
          200: "#E1E4EA",
          300: "#CACFD8",
          400: "#99A0AE",
          500: "#717784",
          600: "#525866",
          700: "#2B303B",
          800: "#222530",
          900: "#181B25",
          950: "#0E121B",
        },
        blue: {
          50: "#EBF1FF",
          100: "#D5E2FF",
          200: "#C0D5FF",
          300: "#97BAFF",
          400: "#6895FF",
          500: "#335CFF",
          600: "#3559E9",
          700: "#2547D0",
          800: "#1F3BAD",
          900: "#182F8B",
          950: "#122368",
        },
        green: {
          50: "#E3F7EC",
          100: "#D0FBE9",
          200: "#C2F5DA",
          300: "#84EBB4",
          400: "#3EE089",
          500: "#1FC16B",
          600: "#1DAF61",
          700: "#178C4E",
          800: "#1A7544",
          900: "#16643B",
          950: "#0B4627",
        },
        red: {
          50: "#FFEBEC",
          100: "#FFD5D8",
          200: "#FFC0C5",
          300: "#FF97A0",
          400: "#FF6875",
          500: "#FB3748",
          600: "#E93544",
          700: "#D02533",
          800: "#AD1F2B",
          900: "#8B1822",
          950: "#681219",
        },
        orange: {
          50: "#FFF3EB",
          100: "#FFE6D5",
          200: "#FFD9C0",
          300: "#FFC197",
          400: "#FFA468",
          500: "#FA7319",
          600: "#E16614",
          700: "#CE5E12",
          800: "#B75310",
          900: "#96440D",
          950: "#71330A",
        },
        yellow: {
          50: "#FFFAEB",
          100: "#FFEFCC",
          200: "#FFECC0",
          300: "#FFE097",
          400: "#FFD268",
          500: "#F6B51E",
          600: "#E6A819",
          700: "#C99A2C",
          800: "#A78025",
          900: "#86661D",
          950: "#624C18",
        },
        purple: {
          50: "#EFEBFF",
          100: "#DCD5FF",
          200: "#CAC0FF",
          300: "#A897FF",
          400: "#8C71F6",
          500: "#7D52F4",
          600: "#693EE0",
          700: "#5B2CC9",
          800: "#4C25A7",
          900: "#3D1D86",
          950: "#351A75",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter Display", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["DM Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        4: "4px",
        6: "6px",
        8: "8px",
        10: "10px",
        12: "12px",
        16: "16px",
        20: "20px",
        24: "24px",
      },
      boxShadow: {
        "regular-xs": "0 1px 2px 0 rgba(10, 13, 20, 0.03)",
        "regular-sm": "0 2px 4px 0 rgba(27, 28, 29, 0.04)",
        "regular-md": "0 16px 32px -12px rgba(14, 18, 27, 0.10)",
        "regular-lg": "0 20px 20px -10px rgba(14,18,27,0.04), 0 10px 10px -5px rgba(14,18,27,0.04), 0 6px 6px -3px rgba(14,18,27,0.04), 0 3px 3px -1.5px rgba(14,18,27,0.04), 0 1px 1px -0.5px rgba(14,18,27,0.04), 0 0 0 1px rgba(14,18,27,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Configure Vite**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 5: Set up index.css with Tailwind + fonts + RemixIcon**

Replace `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-display: "Inter Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

body {
  margin: 0;
  background: #F5F7FA;
  color: #0E121B;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 6: Set up index.html with font/icon CDN links**

Replace `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Glide — AI Visa Assistant</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" />
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 8: Create .gitignore**

```
node_modules
dist
.env
.env.local
*.local
```

- [ ] **Step 9: Create minimal src/main.tsx**

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 10: Create placeholder src/app.tsx**

```typescript
export function App() {
  return <div className="h-screen grid place-items-center font-sans text-slate-950">Glide is running.</div>;
}
```

- [ ] **Step 11: Verify it runs**

```bash
npm run dev
```

Expected: Vite dev server starts on localhost:5173, page shows "Glide is running."

- [ ] **Step 12: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript + Tailwind project"
```

---

## Task 2: Types + Supabase Client + API Layer

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create type definitions**

Create `src/types/index.ts`:

```typescript
export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  country: string | null;
  visa_type: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VisaRequirement {
  id: string;
  country: string;
  visa_type: string;
  category: string;
  requirement_key: string;
  title: string;
  description: string;
  threshold: string | null;
  recommendation: string;
  question_hint: string | null;
  display_order: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  flag: string;
  gradient: string;
  visa_type: string;
}
```

- [ ] **Step 2: Create Supabase client**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: Create API helper for chat edge function**

Create `src/lib/api.ts`:

```typescript
import { supabase } from "./supabase";

interface ChatRequest {
  conversation_id: string;
  message: string;
}

interface ChatResponse {
  reply: string;
  error?: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { reply: "", error: "Not authenticated" };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { reply: "", error: errorText || "Chat request failed" };
  }

  const data = await response.json();
  return { reply: data.reply, error: undefined };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types src/lib
git commit -m "feat: add types, Supabase client, and chat API layer"
```

---

## Task 3: Auth Hook + Login Page

**Files:**
- Create: `src/hooks/use-auth.ts`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/pages/login.tsx`

- [ ] **Step 1: Create useAuth hook**

Create `src/hooks/use-auth.ts`:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { user, loading, signIn, signUp, signOut };
}
```

- [ ] **Step 2: Create LoginForm component**

Create `src/components/auth/login-form.tsx`:

```typescript
import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (result) {
      setError(result);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[380px]">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-[10px] bg-blue-500 grid place-items-center text-white font-bold text-lg shadow-regular-sm">
          G
        </div>
        <span className="font-display font-semibold text-lg">Glide</span>
      </div>

      <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="text-[15px] leading-[22px] text-slate-600 mt-1.5 mb-7">
        {isSignUp ? "Start your visa journey with Glide." : "Sign in to continue your applications."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-950 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full h-10 px-3 rounded-10 border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-950 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full h-10 px-3 rounded-10 border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-10 bg-blue-500 text-white text-sm font-medium shadow-regular-sm hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5 text-slate-400 text-xs font-medium uppercase tracking-wide">
        <span className="flex-1 h-px bg-slate-200" />
        or
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="flex gap-2.5">
        <button className="flex-1 h-10 border border-slate-200 rounded-10 bg-white shadow-regular-xs flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          <i className="ri-google-fill text-lg" />
          Google
        </button>
        <button className="flex-1 h-10 border border-slate-200 rounded-10 bg-white shadow-regular-xs flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          <i className="ri-apple-fill text-lg" />
          Apple
        </button>
      </div>

      <p className="text-center text-sm text-slate-600 mt-7">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          className="text-blue-500 font-medium cursor-pointer"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create Login page with split-screen layout**

Create `src/pages/login.tsx`:

```typescript
import { LoginForm } from "../components/auth/login-form";

export function LoginPage() {
  return (
    <div className="h-screen grid grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center items-center px-10">
        <LoginForm />
      </div>

      {/* Right: branded panel */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-[120px] -bottom-[120px] w-[380px] h-[380px] rounded-full bg-white/[0.06]" />

        <div>
          <blockquote className="font-display font-medium text-[28px] leading-10 tracking-tight max-w-[460px]">
            "Glide handled my Schengen application in 20 minutes — I spent more time picking my hotel."
          </blockquote>
          <p className="text-[15px] leading-[22px] opacity-80 mt-4">
            James B. — Germany Tourist Visa, 2026
          </p>
        </div>

        <div className="flex gap-5">
          <div className="flex items-center gap-2 text-[13px] opacity-90">
            <i className="ri-shield-check-line text-lg" />
            Bank-grade encryption
          </div>
          <div className="flex items-center gap-2 text-[13px] opacity-90">
            <i className="ri-time-line text-lg" />
            90% faster prep
          </div>
          <div className="flex items-center gap-2 text-[13px] opacity-90">
            <i className="ri-check-double-line text-lg" />
            98% approval rate
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-auth.ts src/components/auth src/pages/login.tsx
git commit -m "feat: add auth hook and login page with split-screen design"
```

---

## Task 4: App Shell — Sidebar + Topbar + Routing

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/topbar.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Modify: `src/app.tsx`
- Create: `src/pages/chat-home.tsx` (placeholder)
- Create: `src/pages/documents.tsx`
- Create: `src/pages/dashboard.tsx`
- Create: `src/pages/tracking.tsx`

- [ ] **Step 1: Create Sidebar component**

Create `src/components/layout/sidebar.tsx`:

```typescript
import { useAuth } from "../../hooks/use-auth";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAV_ITEMS = [
  { id: "home", icon: "ri-add-line", label: "New Chat", className: "text-blue-500" },
  { id: "documents", icon: "ri-folder-3-line", label: "Documents" },
  { id: "dashboard", icon: "ri-dashboard-line", label: "Dashboard" },
  { id: "tracking", icon: "ri-map-pin-line", label: "Tracking" },
  { id: "library", icon: "ri-book-open-line", label: "Library" },
];

const RECENT_CHATS = [
  { id: "r1", label: "Travel to Germany" },
  { id: "r2", label: "Japan visa inquiry" },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-[272px] bg-white border-r border-slate-200 flex flex-col p-5 pb-3.5 gap-4 min-h-0">
      {/* Top: logo + collapse */}
      <div className="flex items-center justify-between px-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-blue-500 grid place-items-center text-white font-bold text-lg shadow-regular-sm">
            G
          </div>
          <span className="font-display font-semibold text-lg">Glide</span>
        </div>
        <button className="text-slate-400 text-[22px] bg-transparent border-none cursor-pointer grid place-items-center">
          <i className="ri-side-bar-line" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 h-10 px-3 rounded-10 bg-slate-50 text-slate-400">
        <i className="ri-search-line text-lg" />
        <input
          type="text"
          placeholder="Search"
          className="border-none outline-none bg-transparent flex-1 min-w-0 text-sm text-slate-950 placeholder:text-slate-400"
        />
        <kbd className="text-xs text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘K</kbd>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 h-10 px-3 rounded-8 border-none w-full text-left cursor-pointer text-sm font-medium tracking-tight transition-colors ${
              currentView === item.id
                ? "bg-slate-50 text-slate-950"
                : `bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 ${item.className || ""}`
            }`}
          >
            <i className={`${item.icon} text-xl`} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-slate-200 mx-1.5" />

      {/* Recent chats */}
      <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-y-auto">
        <span className="text-xs font-medium text-slate-400 tracking-wide px-3 pt-2 pb-0.5">
          RECENT
        </span>
        {RECENT_CHATS.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onNavigate("chat")}
            className="flex items-center gap-2 h-9 px-3 rounded-8 border-none bg-transparent w-full text-left cursor-pointer text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          >
            <i className="ri-message-3-line text-base" />
            {chat.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div className="mt-auto flex items-center gap-2.5 px-2 pt-2.5 border-t border-slate-200">
        <div className="w-8 h-8 rounded-full bg-slate-200 grid place-items-center text-sm font-medium text-slate-600">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user?.email?.split("@")[0] || "User"}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email || ""}</div>
        </div>
        <button onClick={signOut} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer bg-transparent border-none">
          <i className="ri-logout-box-r-line" />
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create Topbar component**

Create `src/components/layout/topbar.tsx`:

```typescript
interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex items-center gap-2.5 h-14 px-5 border-b border-slate-200 flex-none">
      <span className="text-[15px] text-slate-400 flex items-center gap-1.5">
        <span>Travel</span>
        <i className="ri-arrow-right-s-line text-lg" />
        <b className="text-slate-950 font-semibold">{title}</b>
        {subtitle && (
          <>
            <i className="ri-arrow-right-s-line text-lg" />
            <span>{subtitle}</span>
          </>
        )}
      </span>
      <span className="flex-1" />
      <button className="w-9 h-9 grid place-items-center rounded-8 border-none bg-transparent text-slate-600 text-xl cursor-pointer hover:bg-slate-50">
        <i className="ri-share-line" />
      </button>
      <button className="w-9 h-9 grid place-items-center rounded-8 border-none bg-transparent text-slate-600 text-xl cursor-pointer hover:bg-slate-50">
        <i className="ri-more-2-fill" />
      </button>
    </header>
  );
}
```

- [ ] **Step 3: Create AppShell that wraps sidebar + content**

Create `src/components/layout/app-shell.tsx`:

```typescript
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ChatHomePage } from "../../pages/chat-home";
import { ChatPage } from "../../pages/chat";
import { DocumentsPage } from "../../pages/documents";
import { DashboardPage } from "../../pages/dashboard";
import { TrackingPage } from "../../pages/tracking";

const VIEW_TITLES: Record<string, string> = {
  home: "New chat",
  chat: "Travel to Germany",
  documents: "Documents",
  dashboard: "Dashboard",
  tracking: "Tracking",
  library: "Library",
};

export function AppShell() {
  const [view, setView] = useState("home");
  const [chatCountry, setChatCountry] = useState<string | null>(null);

  function startChat(country: string) {
    setChatCountry(country);
    setView("chat");
  }

  function navigate(v: string) {
    if (v === "home") {
      setChatCountry(null);
    }
    setView(v);
  }

  const showTopbar = view === "home" || view === "chat";

  return (
    <div className="h-screen grid grid-cols-[272px_1fr] bg-white text-slate-950 overflow-hidden">
      <Sidebar currentView={view} onNavigate={navigate} />
      <main className="flex flex-col min-w-0 min-h-0">
        {showTopbar && <Topbar title={VIEW_TITLES[view] || "Glide"} />}
        {view === "home" && <ChatHomePage onStartChat={startChat} />}
        {view === "chat" && <ChatPage country={chatCountry || "germany"} />}
        {view === "documents" && <DocumentsPage />}
        {view === "dashboard" && <DashboardPage />}
        {view === "tracking" && <TrackingPage />}
        {view === "library" && (
          <div className="flex-1 grid place-items-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center text-[26px] mx-auto mb-3">
                <i className="ri-book-open-fill" />
              </div>
              <h1 className="font-display font-medium text-2xl">Library</h1>
              <p className="text-[15px] text-slate-600 mt-1">Visa guides and templates — coming soon.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create placeholder pages**

Create `src/pages/chat-home.tsx`:

```typescript
interface ChatHomePageProps {
  onStartChat: (country: string) => void;
}

export function ChatHomePage({ onStartChat }: ChatHomePageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 grid place-items-center text-slate-300 font-display font-bold text-2xl mb-2">
        G
      </div>
      <h1 className="font-display font-medium text-[32px] leading-10 tracking-tight">
        Where would you like to travel?
      </h1>
      <p className="text-lg text-slate-400 tracking-tight">
        I'll guide you through the visa process step by step.
      </p>

      {/* Destination cards */}
      <div className="flex gap-4 mt-6 overflow-x-auto px-1 pb-1">
        <DestinationCard
          name="Travel to Germany"
          flag="🇩🇪"
          gradient="linear-gradient(135deg, #FFD268, #E16614)"
          onClick={() => onStartChat("germany")}
        />
        <DestinationCard
          name="Travel to France"
          flag="🇫🇷"
          gradient="linear-gradient(135deg, #97BAFF, #335CFF)"
          onClick={() => onStartChat("france")}
        />
        <DestinationCard
          name="Travel to Japan"
          flag="🇯🇵"
          gradient="linear-gradient(135deg, #47C2FF, #1F7EAD)"
          onClick={() => onStartChat("japan")}
        />
      </div>
    </div>
  );
}

interface DestinationCardProps {
  name: string;
  flag: string;
  gradient: string;
  onClick: () => void;
}

function DestinationCard({ name, flag, gradient, onClick }: DestinationCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex-none w-[248px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs cursor-pointer hover:shadow-regular-md hover:-translate-y-0.5 transition-all text-left"
    >
      <div className="h-[132px]" style={{ background: gradient }} />
      <div className="p-3.5 px-4">
        <h4 className="text-lg font-medium tracking-tight">{name}</h4>
        <div className="inline-flex items-center gap-2 mt-2.5 py-1 px-2 pl-1 rounded-full bg-slate-50 text-xs text-slate-600">
          <span className="w-[18px] h-[18px] rounded-full grid place-items-center text-[11px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(14,18,27,0.08)]">
            {flag}
          </span>
          Schengen visa required
        </div>
      </div>
    </button>
  );
}
```

Create `src/pages/chat.tsx` (placeholder — will be built in Task 5):

```typescript
interface ChatPageProps {
  country: string;
}

export function ChatPage({ country }: ChatPageProps) {
  return (
    <div className="flex-1 grid place-items-center">
      <p className="text-slate-400">Chat for {country} — loading...</p>
    </div>
  );
}
```

Create `src/pages/documents.tsx`:

```typescript
export function DocumentsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1040px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-folder-3-fill" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Documents</h1>
            <p className="text-[15px] text-slate-600 mt-1">All your uploaded and generated visa documents.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-white">
            <i className="ri-file-add-line text-4xl" />
            <p className="mt-3 text-sm">Documents will appear here once you start a chat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/pages/dashboard.tsx`:

```typescript
export function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1040px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-dashboard-fill" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Dashboard</h1>
            <p className="text-[15px] text-slate-600 mt-1">Overview of your visa application progress.</p>
          </div>
        </div>
        <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-white">
          <i className="ri-bar-chart-line text-4xl" />
          <p className="mt-3 text-sm">Dashboard coming soon — start a conversation first.</p>
        </div>
      </div>
    </div>
  );
}
```

Create `src/pages/tracking.tsx`:

```typescript
export function TrackingPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1040px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-map-pin-fill" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Tracking</h1>
            <p className="text-[15px] text-slate-600 mt-1">Track where your applications are in real time.</p>
          </div>
        </div>
        <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-white">
          <i className="ri-route-line text-4xl" />
          <p className="mt-3 text-sm">No active applications to track yet.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire up App with auth gate + routing**

Replace `src/app.tsx`:

```typescript
import { useAuth } from "./hooks/use-auth";
import { LoginPage } from "./pages/login";
import { AppShell } from "./components/layout/app-shell";

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AppShell />;
}
```

- [ ] **Step 6: Verify the app renders the login page**

```bash
npm run dev
```

Expected: Login page with split-screen layout renders. No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add app shell with sidebar, routing, and placeholder pages"
```

---

## Task 5: Chat UI — Composer + Messages + Typing Indicator

**Files:**
- Create: `src/components/chat/composer.tsx`
- Create: `src/components/chat/message.tsx`
- Create: `src/components/chat/typing-indicator.tsx`
- Modify: `src/pages/chat.tsx`
- Create: `src/hooks/use-chat.ts`

- [ ] **Step 1: Create TypingIndicator component**

Create `src/components/chat/typing-indicator.tsx`:

```typescript
export function TypingIndicator() {
  return (
    <div className="self-start flex gap-1 py-1">
      <i className="w-[7px] h-[7px] rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
      <i className="w-[7px] h-[7px] rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
      <i className="w-[7px] h-[7px] rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
```

- [ ] **Step 2: Create Message component**

Create `src/components/chat/message.tsx`:

```typescript
import type { Message as MessageType } from "../../types";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  if (message.role === "user") {
    return (
      <div className="self-end max-w-[78%] bg-blue-500/10 text-blue-700 rounded-[20px] px-[18px] py-3 text-base leading-6 tracking-tight">
        {message.content}
      </div>
    );
  }

  return (
    <div className="self-start max-w-[92%] flex flex-col gap-2.5">
      <div className="text-base leading-[26px] tracking-tight text-slate-950 whitespace-pre-wrap">
        {message.content}
      </div>
      <div className="flex gap-0.5">
        <button className="w-[30px] h-[30px] grid place-items-center rounded-6 border-none bg-transparent text-slate-400 text-[17px] cursor-pointer hover:bg-slate-50 hover:text-slate-600">
          <i className="ri-file-copy-line" />
        </button>
        <button className="w-[30px] h-[30px] grid place-items-center rounded-6 border-none bg-transparent text-slate-400 text-[17px] cursor-pointer hover:bg-slate-50 hover:text-slate-600">
          <i className="ri-thumb-up-line" />
        </button>
        <button className="w-[30px] h-[30px] grid place-items-center rounded-6 border-none bg-transparent text-slate-400 text-[17px] cursor-pointer hover:bg-slate-50 hover:text-slate-600">
          <i className="ri-thumb-down-line" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Composer component**

Create `src/components/chat/composer.tsx`:

```typescript
import { useRef, useEffect } from "react";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Composer({ value, onChange, onSend, placeholder = "Ask Glide anything...", disabled }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  const hasContent = value.trim().length > 0;

  return (
    <div className="max-w-[760px] mx-auto w-full px-6 pb-3.5 pt-2 box-border">
      <div className="border border-slate-200 rounded-20 bg-white shadow-regular-md px-4 pt-3.5 pb-3 relative z-[1]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full box-border border-none outline-none resize-none bg-transparent text-base leading-6 tracking-tight text-slate-950 placeholder:text-slate-400 max-h-[120px]"
        />
        <div className="flex items-center gap-2 mt-2">
          <button className="w-9 h-9 rounded-full border-none bg-slate-50 text-slate-600 grid place-items-center text-[19px] cursor-pointer hover:bg-slate-200">
            <i className="ri-attachment-2" />
          </button>
          <button className="w-9 h-9 rounded-full border-none bg-slate-50 text-slate-600 grid place-items-center text-[19px] cursor-pointer hover:bg-slate-200">
            <i className="ri-mic-line" />
          </button>
          <button
            onClick={onSend}
            disabled={!hasContent || disabled}
            className={`ml-auto w-9 h-9 rounded-full border-none grid place-items-center text-[19px] cursor-pointer transition ${
              hasContent
                ? "bg-slate-950 text-white"
                : "bg-slate-200 text-slate-400"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <i className="ri-arrow-up-line" />
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 pt-2">
        Glide can make mistakes. Verify important visa information independently.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create useChat hook**

Create `src/hooks/use-chat.ts`:

```typescript
import { useState, useCallback } from "react";
import { sendChatMessage } from "../lib/api";
import type { Message } from "../types";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: "user",
      content,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const response = await sendChatMessage({
      conversation_id: conversationId,
      message: content,
    });

    setIsLoading(false);

    if (response.error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: "assistant",
        content: `Sorry, I encountered an error: ${response.error}. Please check that your Supabase and OpenAI credentials are configured.`,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: "assistant",
      content: response.reply,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, [conversationId]);

  return { messages, isLoading, sendMessage };
}
```

- [ ] **Step 5: Build the full Chat page**

Replace `src/pages/chat.tsx`:

```typescript
import { useState, useRef, useEffect } from "react";
import { Composer } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { useChat } from "../hooks/use-chat";

interface ChatPageProps {
  country: string;
}

export function ChatPage({ country }: ChatPageProps) {
  const conversationId = useRef(crypto.randomUUID()).current;
  const { messages, isLoading, sendMessage } = useChat(conversationId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, isLoading]);

  // Send initial greeting on mount
  useEffect(() => {
    sendMessage(`I want to travel to ${country}. Can you help me with the visa process?`);
  }, []);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    sendMessage(trimmed);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-[760px] mx-auto px-6 py-7 flex flex-col gap-[22px]">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </div>
      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder="Reply to Glide..."
        disabled={isLoading}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verify the chat page renders**

```bash
npm run dev
```

Expected: After "login" (auth is disabled until Supabase is connected), clicking a destination card shows the chat UI with the composer. Sending a message shows it in the thread (the API call will fail gracefully since Supabase isn't configured).

- [ ] **Step 7: Commit**

```bash
git add src/components/chat src/hooks/use-chat.ts src/pages/chat.tsx
git commit -m "feat: add chat UI with composer, messages, and typing indicator"
```

---

## Task 6: Supabase Schema + Seed Data

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write the database migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Profiles (auto-created on user signup)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'New conversation',
  country text,
  visa_type text,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
create policy "Users see own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users insert own conversations" on conversations for insert with check (auth.uid() = user_id);
create policy "Users update own conversations" on conversations for update using (auth.uid() = user_id);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table messages enable row level security;
create policy "Users see own messages" on messages for select using (
  conversation_id in (select id from conversations where user_id = auth.uid())
);
create policy "Users insert own messages" on messages for insert with check (
  conversation_id in (select id from conversations where user_id = auth.uid())
);

-- Visa requirements (static reference data)
create table visa_requirements (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  visa_type text not null,
  category text not null,
  requirement_key text not null,
  title text not null,
  description text not null,
  threshold text,
  recommendation text not null,
  question_hint text,
  display_order int not null default 0,
  created_at timestamptz default now(),
  unique(country, visa_type, requirement_key)
);

alter table visa_requirements enable row level security;
create policy "Anyone can read requirements" on visa_requirements for select using (true);

-- Index for fast requirement lookups
create index idx_requirements_country_type on visa_requirements(country, visa_type, display_order);
```

- [ ] **Step 2: Write seed data for Germany and France**

Create `supabase/seed.sql`:

```sql
-- Germany: Schengen Tourist Visa requirements
insert into visa_requirements (country, visa_type, category, requirement_key, title, description, threshold, recommendation, question_hint, display_order) values
('germany', 'schengen_tourist', 'financial', 'bank_balance', 'Bank Balance', 'Minimum bank balance of 5 lakh INR maintained for last 3 months', '500000', 'It is recommended to show at least 5 lakh INR in your savings account. If your balance is lower, consider showing fixed deposits, mutual fund statements, or a sponsor''s financials.', 'How much balance do you currently have in your bank account?', 1),
('germany', 'schengen_tourist', 'financial', 'income_proof', 'Income Proof', 'Salary slips for last 3 months or ITR for last 2 years', null, 'You''ll need recent salary slips or your Income Tax Returns. If you are self-employed, CA-certified financials work too.', 'Are you salaried or self-employed? Do you have recent salary slips or ITR documents?', 2),
('germany', 'schengen_tourist', 'documents', 'passport_validity', 'Passport Validity', 'Passport must be valid for at least 3 months beyond your planned return date, with at least 2 blank pages', null, 'Your passport needs at least 3 months validity after you return. If it expires sooner, you''ll need to renew it first — which takes about 1-2 weeks.', 'When does your current passport expire? How many blank pages do you have?', 3),
('germany', 'schengen_tourist', 'documents', 'passport_photos', 'Passport Photos', '2 recent passport-size photos (35mm x 45mm, white background, taken within last 6 months)', null, 'You''ll need 2 photos meeting Schengen specifications — 35x45mm, white background, neutral expression. Most photo studios know the specs.', 'Do you have recent passport-size photos that meet Schengen specifications?', 4),
('germany', 'schengen_tourist', 'documents', 'cover_letter', 'Cover Letter', 'A letter explaining the purpose of your visit, travel dates, itinerary, and accommodation details', null, 'I can generate a cover letter for you once we have all your trip details. It should explain why you''re visiting, your exact dates, and where you''re staying.', null, 5),
('germany', 'schengen_tourist', 'documents', 'travel_insurance', 'Travel Insurance', 'Travel medical insurance with minimum coverage of 30,000 EUR, valid for all Schengen states', '30000', 'You need travel insurance covering at least 30,000 EUR for medical emergencies. Companies like ICICI Lombard, Bajaj Allianz, or Tata AIG offer Schengen-compliant policies — usually around 1,000-2,000 INR for a short trip.', 'Do you already have travel insurance, or would you like recommendations?', 6),
('germany', 'schengen_tourist', 'travel', 'flight_booking', 'Flight Booking', 'Confirmed or reserved round-trip flight tickets', null, 'You need a confirmed or tentatively booked return flight. Tip: many airlines and agencies offer "hold" bookings or fully refundable tickets so you don''t lose money if the visa is rejected.', 'Have you booked your flights yet, or would you like tips on booking?', 7),
('germany', 'schengen_tourist', 'travel', 'accommodation', 'Accommodation Proof', 'Hotel reservations or invitation letter from host for entire duration of stay', null, 'You need proof of where you''ll stay each night. Hotel bookings from Booking.com (with free cancellation) work perfectly. If staying with someone, they need to provide an invitation letter.', 'Where are you planning to stay? Hotel, Airbnb, or with someone you know?', 8),
('germany', 'schengen_tourist', 'travel', 'itinerary', 'Travel Itinerary', 'Day-by-day travel plan showing cities, activities, and transportation', null, 'A simple day-by-day plan showing what you''ll do each day. It doesn''t have to be rigid — just shows the consulate you have a genuine travel plan.', 'Which cities do you plan to visit, and for how many days each?', 9),
('germany', 'schengen_tourist', 'personal', 'employment_letter', 'Employment Letter', 'Letter from employer confirming position, salary, leave approval, and return guarantee', null, 'Ask your HR for a letter stating your position, salary, that leave is approved, and that you will return after the trip. If self-employed, a CA letter confirming your business works.', 'Are you currently employed? Can your employer provide a letter confirming your leave?', 10),
('germany', 'schengen_tourist', 'personal', 'leave_approval', 'Leave Approval', 'Written leave approval from employer for the travel dates', null, 'This can be part of the employment letter or a separate leave sanction document. Make sure the dates match your travel dates.', null, 11);

-- France: Schengen Tourist Visa requirements
insert into visa_requirements (country, visa_type, category, requirement_key, title, description, threshold, recommendation, question_hint, display_order) values
('france', 'schengen_tourist', 'financial', 'bank_balance', 'Bank Balance', 'Minimum bank balance of 6 lakh INR maintained for last 3 months (France tends to require slightly higher proof)', '600000', 'France consulates typically look for slightly higher financial proof — around 6 lakh INR or more. Fixed deposits and property papers can supplement if your savings are lower.', 'How much balance do you currently have in your bank account?', 1),
('france', 'schengen_tourist', 'financial', 'income_proof', 'Income Proof', 'Salary slips for last 3 months or ITR for last 3 years (France requires 3 years)', null, 'France asks for 3 years of ITR (not 2 like most Schengen countries). Make sure you have ITR acknowledgements for the last 3 financial years.', 'Are you salaried or self-employed? Do you have ITR for the last 3 years?', 2),
('france', 'schengen_tourist', 'documents', 'passport_validity', 'Passport Validity', 'Passport must be valid for at least 3 months beyond return date with 2 blank pages', null, 'Same as other Schengen countries — 3 months validity beyond return and 2 blank pages required.', 'When does your current passport expire?', 3),
('france', 'schengen_tourist', 'documents', 'passport_photos', 'Passport Photos', '2 recent passport photos (35mm x 45mm, white background)', null, 'Standard Schengen photo specs — 35x45mm, white background, taken within last 6 months.', 'Do you have recent passport photos?', 4),
('france', 'schengen_tourist', 'documents', 'cover_letter', 'Cover Letter', 'Letter explaining purpose of visit, in English or French', null, 'I can generate this for you. France accepts English cover letters, though a French version is appreciated.', null, 5),
('france', 'schengen_tourist', 'documents', 'travel_insurance', 'Travel Insurance', 'Minimum 30,000 EUR coverage, valid in all Schengen states', '30000', 'Same requirement as all Schengen countries — 30,000 EUR minimum medical coverage.', 'Do you have travel insurance arranged?', 6),
('france', 'schengen_tourist', 'travel', 'flight_booking', 'Flight Booking', 'Confirmed round-trip flight reservation', null, 'Book refundable tickets or use a hold service. Make sure the return date is within 90 days of entry.', 'Have you booked your flights?', 7),
('france', 'schengen_tourist', 'travel', 'accommodation', 'Accommodation Proof', 'Hotel bookings or attestation d''accueil (hosting certificate) if staying with someone', null, 'France has a specific form called "attestation d''accueil" if you''re staying with a host — they need to get it from their local mairie (town hall). Hotel bookings are simpler.', 'Where will you be staying in France?', 8),
('france', 'schengen_tourist', 'travel', 'itinerary', 'Travel Itinerary', 'Detailed day-by-day plan with intercity transport if visiting multiple cities', null, 'If visiting multiple French cities, show how you''ll travel between them (train tickets, etc).', 'Which cities in France do you plan to visit?', 9),
('france', 'schengen_tourist', 'personal', 'employment_letter', 'Employment Letter', 'Letter from employer on company letterhead confirming employment, salary, and approved leave', null, 'Must be on official letterhead with company stamp. Include your join date, designation, salary, and approved leave dates.', 'Can your employer provide a letter on letterhead?', 10),
('france', 'schengen_tourist', 'personal', 'noc_from_employer', 'No Objection Certificate', 'Some France consulates require a separate NOC from employer', null, 'This varies by consulate location. The VFS France center in your city can confirm if they need it separately from the employment letter.', 'Which city will you be applying from?', 11);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration and seed data for Germany/France requirements"
```

---

## Task 7: Supabase Edge Function — Chat Proxy

**Files:**
- Create: `supabase/functions/chat/index.ts`

- [ ] **Step 1: Create the chat edge function**

Create `supabase/functions/chat/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversation_id, message } = await req.json();

    if (!conversation_id || !message) {
      return new Response(JSON.stringify({ error: "Missing conversation_id or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message too long (max 2000 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if conversation exists; if not, create it
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .single();

    let country = "germany";
    let visaType = "schengen_tourist";

    if (conversation) {
      country = conversation.country || "germany";
      visaType = conversation.visa_type || "schengen_tourist";
    } else {
      // Detect country from first message
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("france")) {
        country = "france";
      } else if (lowerMessage.includes("germany")) {
        country = "germany";
      }

      await supabase.from("conversations").insert({
        id: conversation_id,
        user_id: user.id,
        title: `Travel to ${country.charAt(0).toUpperCase() + country.slice(1)}`,
        country,
        visa_type: visaType,
        status: "active",
      });
    }

    // Store user message
    await supabase.from("messages").insert({
      conversation_id,
      role: "user",
      content: message,
    });

    // Fetch requirements for this country
    const { data: requirements } = await supabase
      .from("visa_requirements")
      .select("*")
      .eq("country", country)
      .eq("visa_type", visaType)
      .order("display_order");

    // Fetch conversation history (last 20 messages)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Build system prompt
    const requirementsList = (requirements || [])
      .map((r) => `- [${r.category}] ${r.title}: ${r.description}\n  Threshold: ${r.threshold || "N/A"}\n  If not met: ${r.recommendation}\n  Suggested question: ${r.question_hint || "N/A"}`)
      .join("\n\n");

    const systemPrompt = `You are Glide, a friendly and knowledgeable AI visa assistant. You help users prepare their visa applications by walking them through requirements.

CONTEXT:
The user wants to visit ${country.charAt(0).toUpperCase() + country.slice(1)} on a ${visaType.replace("_", " ")} visa.

REQUIREMENTS FOR THIS VISA:
${requirementsList}

INSTRUCTIONS:
- Walk the user through these requirements in a natural, conversational way.
- Group related topics when it makes sense (e.g., ask about finances together, documents together).
- For each requirement, ask the user about their situation.
- If they meet a requirement, acknowledge it positively and move to the next topic.
- If they DON'T meet a requirement, explain what's recommended and give actionable advice. Be encouraging, not discouraging — frame it as "here's what you can do."
- Keep track of which requirements have been discussed. Once all are covered, provide a clear summary of what's ready vs. what needs attention.
- Stay strictly on topic: only discuss travel and visa-related matters.
- If the user asks something unrelated to travel/visas, politely redirect: "I'm specialized in visa applications — let me help you with that instead."
- Be concise but warm. Use bullet points for lists. Use simple language.
- When offering to help with documents (cover letter, itinerary), mention that you can help draft them.
- Never fabricate requirements that aren't in the list above.
- Never give legal advice — you provide guidance based on general requirements.`;

    // Build messages array for OpenAI
    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role as string, content: m.content })),
    ];

    // Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return new Response(JSON.stringify({ error: `OpenAI error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await openaiResponse.json();
    const reply = openaiData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Store assistant response
    await supabase.from("messages").insert({
      conversation_id,
      role: "assistant",
      content: reply,
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add Supabase edge function for OpenAI chat proxy with requirement-driven prompting"
```

---

## Task 8: Dev Mode — Mock Chat for Local Testing (Without Supabase)

**Files:**
- Modify: `src/lib/api.ts`
- Modify: `src/hooks/use-chat.ts`

Since Supabase isn't set up yet, we need the app to work locally with a mock response so you can see the UI in action.

- [ ] **Step 1: Add mock mode to api.ts**

Replace `src/lib/api.ts`:

```typescript
import { supabase } from "./supabase";

interface ChatRequest {
  conversation_id: string;
  message: string;
}

interface ChatResponse {
  reply: string;
  error?: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: `Great! I'd be happy to help you with your visa application. 🇩🇪

Let's start by going through the key requirements. First, let me ask about your **finances**:

**Bank Balance**: For a Germany Schengen tourist visa, it's recommended to show at least ₹5,00,000 in your savings account, maintained for the last 3 months.

How much balance do you currently have in your bank account?`,
  low_balance: `I see — ₹2,00,000 is below the typical recommended amount of ₹5,00,000.

Here's what you can do:
• **Show additional assets**: Fixed deposits, mutual fund statements, or PPF balance can supplement your savings
• **Get a sponsor**: A family member with sufficient funds can sponsor your trip with a sponsorship letter
• **Build up over time**: If your trip is a few months away, you have time to accumulate more

Would you like to explore any of these options? Meanwhile, let me ask about your **employment** — are you currently employed? If yes, can your employer provide a letter confirming your leave?`,
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("2 lakh") || lower.includes("200000") || lower.includes("2,00")) {
    return MOCK_RESPONSES.low_balance;
  }
  return MOCK_RESPONSES.default;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // If no Supabase URL configured, use mock mode
  if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { reply: getMockResponse(request.message) };
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { reply: "", error: "Not authenticated" };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { reply: "", error: errorText || "Chat request failed" };
  }

  const data = await response.json();
  return { reply: data.reply, error: undefined };
}
```

- [ ] **Step 2: Add mock auth bypass for local dev**

Modify `src/hooks/use-auth.ts` — add a dev bypass at the top of the hook:

Replace the full file with:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const IS_MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === "https://placeholder.supabase.co";

const MOCK_USER = {
  id: "mock-user-id",
  email: "demo@glide.app",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(IS_MOCK_MODE ? MOCK_USER : null);
  const [loading, setLoading] = useState(!IS_MOCK_MODE);

  useEffect(() => {
    if (IS_MOCK_MODE) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      return null;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      return null;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }

  async function signOut() {
    if (IS_MOCK_MODE) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  }

  return { user, loading, signIn, signUp, signOut };
}
```

- [ ] **Step 3: Verify end-to-end locally**

```bash
npm run dev
```

Expected: App launches, skips login (mock mode auto-authenticates), shows chat home with destination cards. Click "Germany" — chat opens, sends initial message, mock response appears after 1.2s delay with formatted visa guidance.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/hooks/use-auth.ts
git commit -m "feat: add mock mode for local development without Supabase credentials"
```

---

## Task 9: Suggested Prompts + Chat Home Polish

**Files:**
- Modify: `src/pages/chat-home.tsx`

- [ ] **Step 1: Add suggested prompts to ChatHome**

Replace `src/pages/chat-home.tsx`:

```typescript
import { Composer } from "../components/chat/composer";
import { useState } from "react";

interface ChatHomePageProps {
  onStartChat: (country: string) => void;
}

const DESTINATIONS = [
  { id: "germany", name: "Travel to Germany", flag: "🇩🇪", gradient: "linear-gradient(135deg, #FFD268, #E16614)" },
  { id: "france", name: "Travel to France", flag: "🇫🇷", gradient: "linear-gradient(135deg, #97BAFF, #335CFF)" },
  { id: "japan", name: "Travel to Japan", flag: "🇯🇵", gradient: "linear-gradient(135deg, #47C2FF, #1F7EAD)" },
];

const SUGGESTED_PROMPTS = [
  { icon: "ri-passport-line", text: "Check my visa eligibility" },
  { icon: "ri-file-list-3-line", text: "What documents do I need?" },
  { icon: "ri-time-line", text: "How long does processing take?" },
];

export function ChatHomePage({ onStartChat }: ChatHomePageProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    onStartChat("germany");
  }

  function handlePromptClick(text: string) {
    setInput(text);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 grid place-items-center text-slate-300 font-display font-bold text-2xl mb-2">
        G
      </div>
      <h1 className="font-display font-medium text-[32px] leading-10 tracking-tight">
        Where would you like to travel?
      </h1>
      <p className="text-lg text-slate-400 tracking-tight">
        I'll guide you through the visa process step by step.
      </p>

      {/* Destination cards */}
      <div className="flex gap-4 mt-6 overflow-x-auto px-1 pb-1">
        {DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            onClick={() => onStartChat(dest.id)}
            className="flex-none w-[248px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs cursor-pointer hover:shadow-regular-md hover:-translate-y-0.5 transition-all text-left"
          >
            <div className="h-[132px]" style={{ background: dest.gradient }} />
            <div className="p-3.5 px-4">
              <h4 className="text-lg font-medium tracking-tight">{dest.name}</h4>
              <div className="inline-flex items-center gap-2 mt-2.5 py-1 px-2 pl-1 rounded-full bg-slate-50 text-xs text-slate-600">
                <span className="w-[18px] h-[18px] rounded-full grid place-items-center text-[11px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(14,18,27,0.08)]">
                  {dest.flag}
                </span>
                Schengen visa required
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-2 flex-wrap justify-center mt-4">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.text}
            onClick={() => handlePromptClick(prompt.text)}
            className="inline-flex items-center gap-1.5 py-[7px] px-3 rounded-full border border-slate-200 bg-white shadow-regular-xs text-[13px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
          >
            <i className={`${prompt.icon} text-base text-slate-400`} />
            {prompt.text}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="w-full mt-4">
        <Composer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask Glide anything about visas..."
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the polished chat home**

```bash
npm run dev
```

Expected: Chat home shows greeting, 3 destination cards with gradients and flags, suggested prompt chips, and composer at bottom. Clicking a chip populates the composer. Clicking a card starts the chat.

- [ ] **Step 3: Commit**

```bash
git add src/pages/chat-home.tsx
git commit -m "feat: polish chat home with destination cards and suggested prompts"
```

---

## Task 10: Final Cleanup + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README with setup instructions**

Create `README.md`:

```markdown
# Glide — AI Visa Assistant

An AI-powered visa application assistant that walks users through country-specific visa requirements using a conversational interface.

## Quick Start (Local Development)

The app runs in **mock mode** without any credentials — you can see the full UI immediately:

```bash
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
6. Create `.env` from `.env.example`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
7. Restart the dev server — it will now use real auth and AI responses.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (AlignUI design tokens)
- Supabase (Auth, Postgres, Edge Functions)
- OpenAI GPT-4o-mini
- RemixIcon + Inter + DM Mono

## Project Structure

- `src/` — React app (components, pages, hooks, lib)
- `supabase/migrations/` — Database schema
- `supabase/seed.sql` — Visa requirements for Germany and France
- `supabase/functions/chat/` — Edge function that proxies to OpenAI

## Phase 2 (Planned)

- Document upload and management
- Application progress dashboard
- Visa tracking timeline
- Voice input
- Social auth (Google/Apple)
```

- [ ] **Step 2: Run type check to verify no errors**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
```

---

## Summary

| Task | What it delivers |
|------|-----------------|
| 1 | Project scaffold (Vite + React + TS + Tailwind + AlignUI tokens) |
| 2 | Types, Supabase client, API layer |
| 3 | Auth hook + split-screen login page |
| 4 | App shell (sidebar, topbar, routing, placeholder pages) |
| 5 | Chat UI (composer, messages, typing indicator) |
| 6 | Database schema + Germany/France requirement seed data |
| 7 | Edge function (OpenAI proxy with requirement-driven system prompt) |
| 8 | Mock mode for local dev without credentials |
| 9 | Chat home polish (destination cards, suggested prompts) |
| 10 | README + type check + cleanup |

After all 10 tasks: a fully working app you can develop against locally (mock mode), and deploy to production once you plug in Supabase + OpenAI credentials.
