# INTERVU

**Know how someone engineers. Not how well they interview.**

Intervu is an AI-powered adaptive technical interview platform. Instead of a fixed list of questions, every interview is a live investigation: each answer is evaluated, the candidate's knowledge state is updated, and the next question is generated from the evidence gathered so far — until the engine has a confident picture of what the candidate actually knows.

Built as a monorepo of two Next.js applications: an interview engine + API backend, and the candidate-facing frontend.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3fcf8e?logo=supabase)
![AI Policy](https://img.shields.io/badge/AI-FREE--ONLY-10b981)

---

## 1. Product Overview

Traditional technical interviews are static. They ask the same predetermined questions to every candidate, reward memorization, and rarely distinguish shallow familiarity from genuine understanding.

Intervu treats an interview as a dynamic experiment:

- The engine builds a **knowledge state** for each candidate — per-competency understanding, reasoning ability, application ability, and uncertainty.
- Every answer is **evaluated against the specific question asked** (correctness, depth, reasoning, application, communication).
- The next question is **generated from the current knowledge state** — probing deeper, testing application, cross-checking claims, or remediating misconceptions.
- The interview ends when the engine is **confident** — or has clearly established the candidate's boundaries.

## 2. Why Intervu

| Traditional Interview | Intervu |
| --- | --- |
| Fixed question list | Adaptive questioning |
| Same difficulty for everyone | Dynamic difficulty (1–5) |
| Limited adaptation | 12 adaptation strategies |
| Subjective scoring | Evidence-based evaluation |
| Transcript-focused | Candidate-specific assessment |

## 3. How It Works

```
Candidate starts assessment
        ↓
Interview initialized (first question generated)
        ↓
Candidate answers
        ↓
Answer persisted
        ↓
Answer evaluated by AI
        ↓
Candidate knowledge state updated
        ↓
Next question generated (adapts to evidence)
        ↓
... loop ...
        ↓
Assessment completed
        ↓
Report generated & persisted
```

Each stage is observable: the interview response carries a `telemetry` payload describing the decision, the strategy, and the updated knowledge state.

## 4. Adaptive Interviewing

The interview is not a sequence of questions — **each answer becomes evidence that influences what comes next**.

The engine maintains a `CandidateKnowledgeState` with, per competency: conceptual understanding, reasoning ability, application ability, uncertainty, confidence, and saturated concepts. A trajectory log records every question's semantic fingerprint (competency, concept, dimension, task type).

Generation rules (implemented in `backend/src/core/orchestrator.ts`):

- **Strategy selection** — one of `BASELINE`, `PROBE_DEPTH`, `PROBE_REASONING`, `PROBE_APPLICATION`, `CLARIFY_CONCEPT`, `TEST_TRANSFER`, `TEST_EDGE_CASE`, `CROSS_CHECK`, `CHALLENGE_ASSUMPTION`, `REMEDIATE`, `MOVE_ON`, `CONCLUDE`, chosen by the planner from the evidence.
- **Quality gates** — proposed questions are rejected if they target a **saturated concept**, reuse a strategy **3 turns in a row**, are **semantic duplicates** (same concept/dimension/task type), or are **lexically too similar** to a recent question. The planner is asked to try again, up to 3 times.
- **Stopping conditions** — the interview ends at 10 turns, or when ≥3 competencies reach high confidence, or when weakness is confidently established across multiple competencies.

## 5. AI Architecture

All AI calls flow through a single centralized gateway — no frontend code and no feature code calls an AI provider directly.

```
                ┌──────────────────┐
                │   Intervu App    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  Interview API   │
                │   Orchestrator   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    AI Gateway    │
                └────────┬─────────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Groq ·      Gemini ·    Mock
           gpt-oss-120b  (test only)
           gpt-oss-20b
           llama-3.1-8b-instant
           llama-3.3-70b-versatile
              │          │
              └──────────┼──────────┘
                         ▼
               zod-validated output
                         │
                         ▼
              Interview Orchestrator
```

Three task types route through the gateway: `evaluation` (answer scoring), `questionGeneration` (adaptive planning), and `report` (final assessment). Every provider output is validated against a zod schema before it is persisted or used.

## 6. Free AI Fallback System

Intervu is designed around **free AI providers only**. The gateway enforces a hard `FREE_ONLY` policy — paid models are rejected at runtime, and there is **no paid fallback path**.

Currently configured (verified free-tier compatible with JSON structured output):

- **Groq** — `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`
- **Gemini** — `gemini-3.5-flash` (fallback)

Failure handling, per provider:

```
primary provider
      ↓
rate limited / quota exhausted / unavailable
      ↓
cooldown applied (retry-after aware, exponential)
      ↓
next available free provider
      ↓
successful response
```

Implemented resilience:

- **429 / rate-limit cooldowns** with exponential backoff and jitter.
- **Daily quota tracking** — providers that hit their per-model tokens-per-day limit are disabled until the next UTC midnight.
- **Circuit breaker** — repeated failures open the circuit; a half-open probe allows recovery.
- **Concurrency caps** — global (3) and per-provider (1) to stay inside free-tier limits.
- **Request caching** — identical in-session prompts never trigger duplicate AI calls.
- **Graceful degraded mode** — if *every* free provider is unavailable, the API returns `503 AI_UNAVAILABLE`, the candidate's answer is already saved, and the interview can be retried. Progress is never lost.

This is not unlimited inference and no uptime is guaranteed — free tiers are rate limited, and the system is designed to survive that gracefully.

## 7. Data & Supabase

Supabase (Postgres) is the system of record. The live schema lives in `backend/scripts/schema.sql` plus `backend/scripts/add_assessment_reports.sql`.

| Table | Purpose |
| --- | --- |
| `candidates` / `candidate_progress` | Candidate profiles and progress (seed data) |
| `curriculum_modules` / `curriculum_days` / `curriculum_topics` | Curriculum graph used for question generation |
| `interview_sessions` | Session state, current turn, assessment state (JSONB) |
| `interview_turns` | Every interviewer and candidate message |
| `turn_evaluations` | AI evaluation of each answer |
| `competency_evidence` | Extracted evidence per competency |
| `adaptation_events` | Every adaptation decision and its rationale |
| `assessment_reports` | Final generated reports (persisted, immutable) |

Core principle: **AI failures never silently erase candidate progress.** Answers are written to `interview_turns` *before* any AI call; the report is persisted once, and fetching it is a pure database read that never calls the AI.

## 8. System Architecture

```
┌───────────────────────────────┐
│        Frontend (3000)        │
│   Next.js 16 · React 19       │
│   /candidates /interview      │
│   /history /report /setup     │
└──────────────┬────────────────┘
               │ HTTP (fetch)
               ▼
┌───────────────────────────────┐
│        Backend API (3001)     │
│   Next.js API routes          │
│   InterviewOrchestrator       │
│   Knowledge state machine     │
│   Report finalization         │
└───────┬───────────────┬───────┘
        │               │
        ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Supabase   │  │  AI Gateway  │
│  persistence │  │  free-only   │
└──────────────┘  └──────────────┘
```

The backend (`backend/`) is the brain: interview orchestration, AI evaluation, adaptive planning, and report generation — nothing of that lives in the frontend. The frontend (`frontend/`) is presentation only.

## 9. Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript | Candidate UI (interview, candidates, history, reports) |
| Backend | Next.js 16 API routes, TypeScript | Interview engine, AI orchestration, persistence |
| AI | Groq SDK + custom gateway, zod | Free-only provider routing, structured validation |
| Database | Supabase (Postgres) | Sessions, turns, evaluations, evidence, reports |
| Styling | Tailwind CSS v4, Framer Motion | Design system, animation |
| Validation | zod | AI output schema validation |
| Testing | Vitest | Unit + end-to-end engine tests |
| Deployment | Vercel (two apps) | Frontend + backend |

## 10. Project Structure

```
├── backend/                  # Interview engine + API (port 3001)
│   ├── src/
│   │   ├── ai/               # AI gateway (FREE_ONLY router, health, cache)
│   │   ├── app/api/          # HTTP API routes
│   │   ├── assessment/       # Knowledge state, report finalization
│   │   ├── core/             # Interview orchestrator, state machine
│   │   ├── db/               # Supabase client + persistence
│   │   ├── llm/              # Provider adapters + prompts
│   │   └── lib/data/         # Candidate & curriculum seed data
│   ├── scripts/              # Schema, seed, dev reset
│   └── tests/                # Vitest unit + e2e suites
├── frontend/                 # Candidate-facing UI (port 3000)
│   └── src/
│       ├── app/              # Pages: candidates, interview, history, report…
│       ├── components/       # Landing, UI primitives
│       └── lib/              # API client, types
└── docs/                     # Architecture & design documentation
```

## 11. Local Development

Requirements: Node.js 18+, a Supabase project, and a free Groq API key.

```bash
git clone https://github.com/Ayaan-20-11/Vector.git
cd Vector
```

**Backend (engine + API):**

```bash
cd backend
npm install
cp .env.example .env.local      # then fill in real values
npm run dev                     # serves http://localhost:3001
```

**Frontend (UI):**

```bash
cd frontend
npm install
cp .env.example .env.local      # point at the backend
npm run dev                     # serves http://localhost:3000
```

Two terminals, two apps. The frontend calls the backend through `NEXT_PUBLIC_API_BASE_URL`.

## 12. Environment Variables

Copy each app's `.env.example` to `.env.local` and populate the required values. **Never commit `.env.local`.**

**Backend** (`backend/.env.local`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | yes | Primary free AI provider (Groq) |
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only Supabase credential |
| `GROQ_MODEL` | no | Default Groq model (default `openai/gpt-oss-120b`) |
| `GEMINI_API_KEY` | no | Fallback free AI provider |
| `ALLOWED_ORIGIN` | no | Browser origin allowed to call the API (default `http://localhost:3000`) |
| `AI_ENABLED_PROVIDERS` | no | Provider allow-list (e.g. `groq,gemini`) |
| `AI_PROVIDER_ORDER` | no | Preferred fallback order |
| `AI_GLOBAL_CONCURRENCY` / `AI_PER_PROVIDER_CONCURRENCY` | no | Concurrency caps (defaults 3 / 1) |
| `AI_MAX_ATTEMPTS` | no | Max provider attempts per AI operation (default 4) |
| `AI_CACHE_TTL_MS` | no | AI result cache TTL (default 600000) |
| `AI_MOCK_MODE` | no | Test-only simulated failures (never set in production) |

**Frontend** (`frontend/.env.local`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | no* | Backend base URL (default `http://localhost:3001/api`) |
| `NEXT_PUBLIC_USE_MOCK` | no | `true` = mock responses for UI development (default `false`) |

\* Required in production — must point at the deployed backend.

## 13. Running the Project

From each app directory (`backend/` or `frontend/`):

```bash
npm run dev       # development server
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint
```

Backend extras:

```bash
npm test                          # Vitest unit + e2e suites
npm run db:seed                   # seed candidates + curriculum into Supabase
npm run db:reset-dev              # DESTRUCTIVE: wipe dev interview sessions
```

## 14. Database Setup

The schema is defined in plain SQL scripts (the project uses a hosted Supabase project, not local migrations):

1. Apply `backend/scripts/schema.sql` in the Supabase SQL editor.
2. Apply `backend/scripts/add_assessment_reports.sql` (report table).
3. Seed data with `npm run db:seed` (candidates + curriculum topics).

A fresh database **must** be seeded before interviews can start.

## 15. Interview Flow

```
START
  ↓
Candidate selected
  ↓
Session initialized · first question generated
  ↓
Question
  ↓
Answer (persisted before any AI call)
  ↓
AI evaluation
  ↓
Adaptive decision · knowledge state updated
  ↓
Next question (quality-gated)
  ↓
Completion (confident | bounded at 10 turns)
  ↓
Report finalized (single idempotent LLM call)
  ↓
Report (served from Supabase, never regenerated)
```

Each answer contributes evidence to the candidate's assessment — there is no point where progress depends on the AI succeeding.

## 16. Reliability

Mechanisms implemented in the codebase:

- **Provider fallback + rotation** across free models on failure.
- **Rate-limit handling** — retry-after-aware cooldowns, exponential backoff, daily quota tracking.
- **Circuit breaker** with half-open recovery probes.
- **Idempotent submissions** — the API dedupes concurrent requests (React StrictMode-safe), re-initialization returns the existing session, and report finalization handles duplicate writes.
- **Persisted interview state** — sessions, turns, evaluations, and reports survive restarts and refreshes.
- **Schema validation** — every AI output is validated against a zod schema before use.
- **Graceful AI failure** — `503 AI_UNAVAILABLE` with the candidate's progress already saved.
- **JSON repair** — malformed provider output is repaired or rejected and the next provider is tried.

## 17. Security

- Secrets (Groq, Gemini, Supabase service-role) exist **only** in server-side environment variables — never in the client bundle, never committed.
- The Supabase service-role key is used **server-side only** (`backend/src/db/client.ts`).
- No API keys appear in client code; the frontend talks to the backend, never to providers.

Not yet implemented (planned): user authentication and Postgres RLS policies. Until then, the API assumes a trusted network layer.

## 18. Design

Intervu uses a clean, editorial interface: monochrome surfaces, a single accent color, and dense typography. The design is intended to make a high-stakes technical interview feel focused, calm, and trustworthy — the candidate's attention belongs on the question, not the chrome. The design system is documented in `docs/DESIGN_SYSTEM.md`.

## 19. Roadmap

**Completed** — adaptive interview engine, free-only AI gateway with rotation, quality gates, evidence-based reports, Supabase persistence, e2e test suite.

**Planned** — authentication + RLS, multi-tenant isolation for the report table, additional free providers (OpenRouter / Cerebras / Together), per-interview AI request budgets, real-time streaming.

## 20. Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-change`).
3. Make changes; run `npm run lint`, `npm test`, and `npm run build` in the affected app.
4. Open a pull request.

Architecture and API docs live in `docs/` — read them before touching the interview engine.

## 21. License

Not yet specified.

## 22. Acknowledgements

Built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Supabase, zod, Vitest, and the free tiers of Groq and Gemini.

## 23. Footer

Built for better technical interviews.

**INTERVU**
