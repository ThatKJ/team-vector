# 🏗️ Architecture

> **Purpose**: Document the system architecture, component hierarchy, data flow, and deployment strategy.  
> **When to update**: When new components are added, data flow changes, or infrastructure decisions are made.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │   Pages  │  │Components│  │   State Manager   │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │                 │              │
│       └──────────────┴─────────────────┘              │
│                      │                                │
└──────────────────────┼────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────┼────────────────────────────────┐
│                  API LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │  Routes  │  │Middleware│  │   Auth Handler    │   │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘   │
│       │              │                 │               │
│       └──────────────┴─────────────────┘               │
│                      │                                 │
└──────────────────────┼─────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │Database │   │ AI API  │   │ Breeth  │
   │  (TBD)  │   │ (TBD)  │   │ Memory  │
   └─────────┘   └─────────┘   └─────────┘
```

---

## Folder Structure

```
team-vector-vicodathon-2026/
├── docs/                    # Project documentation
│   ├── AGENT_RULES.md
│   ├── PROJECT_CONTEXT.md
│   ├── PRD.md
│   ├── ARCHITECTURE.md      # ← You are here
│   ├── TASKS.md
│   ├── DECISIONS.md
│   ├── DEMO.md
│   ├── MEMORY_STRATEGY.md
│   └── SPONSOR_USAGE.md
├── prompts/                 # AI usage logs & prompt templates
│   ├── PROMPTS.md
│   ├── planning.md
│   ├── frontend.md
│   ├── backend.md
│   ├── review.md
│   ├── debugging.md
│   └── deployment.md
├── memory/                  # Memory layer documentation
│   ├── schema.md
│   ├── agents.md
│   ├── breeth.md
│   └── memories.md
├── assets/                  # Static assets
│   ├── branding/
│   ├── screenshots/
│   └── demo/
├── src/                     # Application source (TBD)
│   ├── app/                 # Pages / routes
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Primitives (Button, Input, Card)
│   │   └── features/        # Feature-specific components
│   ├── lib/                 # Utilities, helpers, constants
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API clients, external integrations
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles, design tokens
├── public/                  # Static public assets
├── .env.local               # Environment variables (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

> **Note:** The `src/` structure above is the *planned* layout. It will be created when the framework is initialized.

---

## Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Main Content
│   │   └── [Page Components]
│   └── Footer
├── Providers
│   ├── ThemeProvider
│   ├── AuthProvider (if needed)
│   └── AIContextProvider
└── Modals / Overlays
    ├── ConfirmDialog
    ├── Toast Notifications
    └── Loading Overlay
```

---

## Database Schema

**Status**: Not yet decided.

Candidate technologies:
- **Supabase** — Postgres + Auth + Realtime (good for rapid prototyping)
- **Firebase** — NoSQL + Auth + Hosting (fast setup)
- **Prisma + SQLite** — Local-first, no external dependency

Decision will be made based on the product requirements.

---

## API Flow

```
Client Request
    │
    ▼
[Middleware] ─── Auth check ─── Rate limiting
    │
    ▼
[Route Handler] ─── Validate input ─── Process logic
    │
    ├──▶ [Database] ─── CRUD operations
    ├──▶ [AI Service] ─── Prompt → Response
    └──▶ [Breeth] ─── Memory retrieval / storage
    │
    ▼
[Response] ─── Format ─── Cache headers ─── Send
```

---

## Authentication

**Status**: TBD — depends on product requirements.

Options under consideration:

| Option | Pros | Cons |
|---|---|---|
| No auth | Fastest to ship | No personalization |
| Supabase Auth | Full-featured, free tier | Setup overhead |
| NextAuth.js | Flexible, many providers | Config complexity |
| Simple magic link | Low friction | Requires email service |

---

## State Management

**Recommended approach** (for a 48-hour hackathon):

| State Type | Solution |
|---|---|
| Server state | React Query / SWR |
| UI state | React `useState` / `useReducer` |
| Global state | React Context (keep it minimal) |
| Form state | React Hook Form or native |
| URL state | Next.js router / search params |

**Avoid** Redux, Zustand, or Jotai unless complexity demands it.

---

## AI Layer

```
User Input
    │
    ▼
[Prompt Builder] ─── System prompt + User input + Context
    │
    ▼
[AI API Call] ─── OpenAI / Gemini / Anthropic
    │
    ▼
[Response Parser] ─── Structured output extraction
    │
    ▼
[UI Renderer] ─── Display to user
    │
    ▼
[Memory Writer] ─── Store relevant context (Breeth)
```

---

## Memory Layer (Breeth)

See `docs/MEMORY_STRATEGY.md` for the full strategy.

Key principles:
- Memory ≠ Application State
- Memory ≠ Database
- Memory = Persistent AI Context that improves over time
- Only store what genuinely improves the user experience

---

## Deployment Architecture

**Target**: Single-command deployment with preview URLs.

```
Git Push → CI/CD Pipeline → Build → Deploy
                                      │
                               ┌──────┴──────┐
                               │   Vercel /   │
                               │   Railway    │
                               └──────────────┘
```

| Concern | Solution |
|---|---|
| Hosting | Vercel (frontend) / Railway (backend if separate) |
| Domain | Provided by hosting or custom |
| SSL | Automatic via hosting |
| Environment vars | Platform secrets manager |
| Preview deploys | Automatic on PR |

---

## Performance Budget

| Metric | Target |
|---|---|
| Largest Contentful Paint | < 2.5s |
| First Input Delay | < 100ms |
| Cumulative Layout Shift | < 0.1 |
| Bundle size (JS) | < 200KB gzipped |
| Time to Interactive | < 3s |

---

*Last updated: 2026-08-07T03:54:00+05:30*
