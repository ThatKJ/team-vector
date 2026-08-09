<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# INTERVU — adaptive interview platform (hackathon handoff)

Two independent Next.js 16 apps (React 19, Tailwind v4, flat ESLint config), each with its own `package.json`, `node_modules`, and gitignored `.env.local`. There is NO root workspace, root package.json, or CI. `CLAUDE.md` files just `@AGENTS.md`.

- `backend/` (port **3001**, set in its package.json scripts): interview engine, Groq/Gemini LLM layer, Supabase persistence, and API routes. This is the "brain".
- `frontend/` (port **3000**): presentation only — must NOT contain interview intelligence, scoring, or prompt generation (docs/ARCHITECTURE.md).

## Commands

```bash
# backend  (npm run dev = PORT=3001 next dev)
cd backend && npm install && npm run dev
npm run build && npm run lint
npm test                          # vitest run (only vitest lives in backend/)
npm run db:reset-dev              # DESTRUCTIVE: deletes ALL interview_sessions (cascades) in dev DB; requires .env.local

# frontend
cd frontend && npm install && npm run dev   # runs on 3000
```

No root scripts exist; run everything from `backend/` or `frontend/`.

## Environment

- `backend/.env.local` (from `backend/.env.example`): `GROQ_API_KEY`, `GROQ_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Loaded by `dotenv` in `vitest.setup.ts`, `scripts/reset-dev.ts`, and `db/client.ts`.
- `frontend/.env.local` (from root `.env.example`): `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3001/api`), `NEXT_PUBLIC_USE_MOCK=true` → mock mode (set `false` to hit the real backend), `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Never commit `.env.local` or API keys (`.gitignore` covers `.env*`).

## LLM layer — AI Gateway

All structured LLM output (evaluator, planner, report in `backend/src/assessment/*` and `backend/src/llm/prompts/*`) flows through `backend/src/ai/gateway.ts` → `aiGenerateStructuredContent()` — the only entry point. Free-only router: task → ordered free models (`backend/src/ai/registry.ts`) → provider health/quota filter → concurrency-capped call → zod validation → cache. On failure it rotates to the next free provider; when every free provider is unavailable the request fails with `AIUnavailableError` (graceful degraded mode) — it NEVER falls back to a paid model.

- Providers: `backend/src/llm/groq.ts` (primary), `backend/src/llm/gemini.ts` (fallback when all free Groq models are rate-limited), `backend/src/ai/mock-provider.ts` (explicit demo mode only).
- `.env.example` docs: `GROQ_API_KEY`, `GROQ_MODEL` (default `llama-3.3-70b-versatile`, but `openai/gpt-oss-120b` verified and used), optional `GEMINI_API_KEY` for the fallback.
- Groq free-tier quotas are **per-model tokens-per-day (TPD)**: on `LLM_RATE_LIMITED`, check the 429 body for `tokens per day (TPD)` and switch `GROQ_MODEL` to a model with budget left (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.1-8b-instant` all verified; `qwen/*` rejects json_object). When docs and code conflict, code wins.

## Testing quirks

- Backend vitest only. `vitest.setup.ts` loads `.env.local` — tests require a real Supabase connection and fail without it.
- `backend/tests/e2e/*.test.ts` upsert candidate rows and initialize sessions against the live (dev) Supabase DB; 30s per-test timeout.

## API surface & engine rules

- `POST /api/interview` — start/continue a session; in-memory promise deduper makes it safe against React Strict Mode double-POST. `POST /api/interviews/[id]/finalize` — exactly ONE LLM call, idempotent (23505 unique-violation handled). `GET /api/interviews/[id]/report` — pure Supabase read, must NEVER call the LLM. `GET /api/candidates`.
- Hard rules (prompt.md §12): don't rewrite the backend architecture, don't fabricate scores/evidence/questions, don't regenerate persisted reports on GET, don't expose internal telemetry on the candidate route, keep the `/demo` route, don't optimize code cleanliness over demo reliability.
- `assessment_reports` table is defined in `backend/scripts/add_assessment_reports.sql` (not in `schema.sql`); RLS on it was knowingly left unconfigured (bypassed via service-role key) — flag as P0 before any production use.
- Supabase client (`backend/src/db/client.ts`) prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to the anon key.

## Docs & workflow

- Truth sources: `docs/` (ARCHITECTURE, API, BACKEND, FRONTEND, DESIGN_SYSTEM, DATABASE, UX, PRD, GIT_WORKFLOW) and `prompt.md` (session log with demo script). `docs/DATABASE.md` describes the ORIGINAL schema; `backend/scripts/schema.sql` is the current one.
- Git: remote has only `main`. docs/GIT_WORKFLOW.md prescribes `feature/*` → `dev` → `main` and never force-pushing. Keep commit messages prefixed (`fix:`, `feat:`, `chore:`) per git log.
