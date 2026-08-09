# INTERVU — Chat Session Log

Complete record of the final working session on the Intervu codebase (backend + frontend, Next.js 16 monorepo).

## 1. AI Gateway (free-model-only) — Built & Verified

Implemented a centralized AI gateway in `backend/src/ai/` — the ONLY entry point for all LLM calls:

- **types.ts** — `AIRequest`, `AITask` (`evaluation` / `questionGeneration` / `report`), `AIUnavailableError` (`AI_UNAVAILABLE`, retryable, "Your progress has been saved" message), `PaidModelBlockedError`.
- **registry.ts** — FREE_ONLY hard policy. Only verified free models registered: Groq `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`; Gemini `gemini-3.5-flash` fallback. Zod schemas for all three tasks. `AI_ENABLED_PROVIDERS` allow-list, `AI_PROVIDER_ORDER`, `AI_MODE_POLICY` informational. Startup config summary (no keys printed).
- **health.ts** — per-provider cooldowns (retry-after aware, 10s→30s→60s→5min + jitter), daily TPD quota tracking (disables provider until next UTC midnight), circuit breaker (3 failures → open, 60s half-open probe), Groq `x-ratelimit-*` header capture.
- **concurrency.ts** — global cap 3, per-provider cap 1 (`AI_GLOBAL_CONCURRENCY`, `AI_PER_PROVIDER_CONCURRENCY`).
- **cache.ts** — in-memory cache keyed on task + prompts + **session contextId** (added after tests revealed cross-session leakage: identical turn-1 prompts from different sessions must not share results).
- **mock-provider.ts** — simulated `ok` / `rate-limit` / `429` / `daily-quota` / `invalid-json` / `invalid-schema` / `unavailable` / `500` / `timeout` / `flaky` modes for tests.
- **gateway.ts** — task routing, rotation on failure, zod validation of every provider output before persistence, attempt cap (`AI_MAX_ATTEMPTS`, default 4), in-memory metrics, graceful degraded mode: every free provider down → `AIUnavailableError` → routes respond `503 AI_UNAVAILABLE` → frontend shows "The AI interviewer is temporarily busy. Your progress has been saved." Never a paid fallback.

Rewired `evaluator.ts`, `planner.ts`, `finalize-assessment.ts` through the gateway. Provider interface gained an optional `model` param; `groq.ts`/`gemini.ts` keep singletons.

**Tests:** 10 new unit tests in `tests/unit/gateway.test.ts` — rotation on 429, TPD daily-disable, cooldown (no hammering), invalid-output rotation, attempt cap, all-fail degraded mode, circuit breaker + half-open probe, cache dedup, paid-model hard block. All green.

## 2. E2E Harness Regression — Fixed

The full e2e suite broke after the gateway landed. Root causes found and fixed:

1. **Harness fixture regression** — added a static `fingerprint` default to the mocked planner output (required by the gateway's zod schema) which the orchestrator's semantic-novelty gate matched on every turn, forcing rejection → forced `CROSS_CHECK` fallback. Fix: fingerprint concept varies per call.
2. **`maxAttempts = 2` vs test contract (3)** — orchestrator's planner retry loop upgraded to 3 attempts per the tests' spec.
3. **Cache collapsing retries** — retry prompts were identical, so the gateway cache returned the same rejected question. Fix: attempt number now embedded in the rejection reason, making each retry a distinct prompt.
4. **Cache cross-session leak** — identical initialization prompts across sessions shared cached first questions. Fix: cache key scoped by `contextId` (session id), threaded through `evaluateAnswer`, `generateNextQuestion`, and report finalization.

Result: **all 33 backend tests pass (5 files)**, typecheck clean.

## 3. Frontend — Report Demo + Hero Polish

- `/report/verify-cand001` (non-UUID id) now renders a full dossier: added `DEMO_DOSSIER` (used in mock mode only) and typed `rawCompetencies` / `final_recommendation` / trajectory fields in `frontend/src/lib/types.ts`. The silent fake fallback was later removed per production cleanup — the report page now shows a graceful error state with a Retry button.
- Hero badge "AI-powered technical interviews" — removed the pill/bubble, now plain neon underlined text.

## 4. Final Production Cleanup (Pre-Push)

- **Removed tracked scratch files**: root `test_e2e.js`, `tester.js`; backend `test-*.js/.mjs/.ts` (13 files), `scripts/test_groq.ts`, `scripts/run_e2e_scenario.ts`.
- **Removed untracked scratch**: `scripts/audit-db.ts`, `scripts/openapi-test.mjs`, `scripts/seed-assets.ts` (contained a personal absolute path).
- **Removed design/prototype assets**: `frontend/assets/design/**`, `frontend/public/images/**`, `frontend/assets/{candidates,curriculum}.json`, `technical-spec.md`.
- **Removed default Next.js starter page + unused public svgs** from backend; replaced backend `/` with a minimal API index page.
- **Dependencies**: removed unused `node-fetch` + `@supabase/supabase-js` from frontend; dropped `db:seed-assets` script, added `db:seed`.
- **CORS production fix**: `backend/next.config.ts` origin is now env-driven (`ALLOWED_ORIGIN`, default `http://localhost:3000`).
- **Debug log cleanup**: removed per-request `[DB]`, `[REQUEST DEDUPE]`, `[INTERVIEW]`, `[REPORT FETCH]` logs, per-turn DIAGNOSTIC block, and redundant per-call LLM success logs. Kept structured error/warn telemetry (`[AI GATEWAY]`, `[NOVELTY GUARD]`, `[LLM BUDGET]`, route error handlers).
- **.gitignore** rewritten (root + backend); `!.env.example` exceptions added so templates remain trackable.
- **.env.example** updated for both apps with the real variable set (no secrets).
- **README.md** — full production rewrite (see section 5).

## 5. README.md — Production Quality

Rewrote the root README: hero + tagline, product overview, Intervu vs traditional comparison table, interview lifecycle, adaptive-interviewing mechanics (12 strategies, quality gates, stop conditions), AI architecture diagram, FREE_ONLY fallback system, Supabase data model, system architecture, tech stack table, project structure, exact local dev + env var tables, DB setup, reliability, honest security section (no auth/RLS yet), design, roadmap, contributing, license ("Not yet specified"), acknowledgements, footer. Only documented verified functionality; badges reflect actual versions (Next.js 16.3.0, TypeScript 5.9.3).

## 6. Current State / Pending

- Backend production build + frontend production build + smoke tests — pending at session end.
- Final security scan (secrets in tracked files) — pending at session end.
- Commit + push to `origin/main` — pending at session end.
