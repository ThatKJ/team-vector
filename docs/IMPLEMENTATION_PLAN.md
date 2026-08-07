# 🚀 Intervu AI — Implementation Plan (v3.1 Final)

> **Status**: LOCKED. Scope frozen. This is the execution document.
> **Product**: AI-powered interview agent that builds a living Candidate Theory from cohort data, conducts hypothesis-driven interviews, and produces an evidence-backed Engineering Intelligence Report.
> **One-liner**: "The LLM never decides what to ask next. Our deterministic Theory Engine does."

---

## Product Vision

Intervu AI constructs a living **Candidate Theory** from curriculum performance data, then conducts a hypothesis-driven interview that continuously updates the Theory with evidence — showing its reasoning live — and produces an evidence-backed **Engineering Intelligence Report** where every score is explainable and every recommendation traces to a specific moment.

---

## Technology Stack

| Layer | Choice |
|---|---|
| LLM | Gemini 2.5 Flash |
| Frontend | Next.js App Router |
| Styling | Tailwind CSS + Framer Motion |
| Charts | Recharts (Radar + Bar) |
| State | Zustand |
| API | Next.js Route Handlers |
| Deployment | Vercel |
| Session | In-memory Map |
| AI Output | Structured JSON |

---

## Team

| Person | Role | Branch | Owns |
|---|---|---|---|
| Kirtan | Product / UI / Frontend | `feature/frontend-core` | Design system, 3 screens, animations, UX, demo |
| Ayan | Backend / AI Engineer | `feature/backend-ai` | API, Theory Engine, Gemini prompts, session management |
| Person 3 | Frontend / Integration | `feature/frontend-components` | Components, charts, API integration, report, testing |

---

## Architecture

```
        Candidate Data
              │
              ▼
    ┌─────────────────────┐
    │  Candidate Theory   │  ← Deterministic (TypeScript)
    │      Engine         │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Interview Strategy │  ← Deterministic (TypeScript)
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │  ← LLM
    │  Question Generation│
    └─────────┬───────────┘
              │
              ▼
       Candidate Answer
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │  ← LLM
    │  Answer Evaluation  │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Theory Update      │  ← Deterministic (TypeScript)
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Next Strategy      │  ← Deterministic (TypeScript)
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Engineering        │
    │  Intelligence Report│
    └─────────────────────┘
```

**Key**: Gemini appears exactly twice. Everything else is deterministic.

---

## Interview Structure

5 rounds × 1 question + optional follow-up = 5–6 questions.

| Round | Name | Strategy |
|---|---|---|
| 1 | Background | EXPLORE |
| 2 | Core AI | PROBE_WEAKNESS or VALIDATE |
| 3 | Applied | ESCALATE or RECOVER |
| 4 | Production | PROBE_WEAKNESS |
| 5 | Synthesis | CROSS_REFERENCE or VALIDATE |

---

## API Contract

Single endpoint: `POST /api/interview`

### Start: `{ sessionId, candidate }` → `{ reply, done: false, ...extended }`
### Turn: `{ sessionId, message }` → `{ reply, done: false, ...extended }`
### End: `{ reply, done: true, feedback: { summary, strengths[], gaps[], next[] }, ...extended }`

Extended fields (for our frontend): `theory`, `strategy`, `evaluation`, `round`, `questionIndex`, `missionContext`, `activityLog`, `report`

---

## Screens

1. **Start Screen** — Candidate selector, profile preview, module readiness bars
2. **Interview Screen** — Chat panel + Live Theory sidebar (progressive disclosure)
3. **Report Screen** — Engineering Intelligence Report with Engineering DNA radar

---

## Key UX Behaviors

1. **Instant interview start** — no forced loading; sidebar shows processing steps while first question generates
2. **Progressive disclosure** — UI elements animate in after first and second answers
3. **Engineering Readiness count-up** — animates 0→82 over 0.8s
4. **Pipeline step indicators** — "Evaluating... Updating... Selecting... Generating..." during LLM calls
5. **Score deltas with reasons** — `+12 — mentioned domain separation`
6. **Assessment Confidence** — "87% based on 8 cohort signals + 5 responses + 12 evidence points"
7. **Demo answer buttons** — `?demo=true` shows Strong/Average/Weak pre-written answer buttons

---

## Feature Tiers

### Tier 1 — Must Have
- API compliance, session management, structured feedback
- Theory Engine, curriculum-aware questions, 5-round interview
- 3 screens, Live Theory sidebar, Engineering Intelligence Report

### Tier 2 — High Impact
- Progressive disclosure, sidebar processing, count-up animation
- Strategy panel, Activity Feed, score deltas, pipeline indicators
- Interview Map, Engineering DNA radar, Interview Replay, Decision Trace
- Theory Evolution timeline, Theory Version, Evidence Counter, Assessment Confidence
- Demo answer buttons

### Tier 3 — Only if time
- AI Brain Pulse animation, contradiction detection

### Deleted
- Breeth, auth, database, responsive, Latest Signal card, PDF export, dark mode toggle

---

## Timeline

| Hours | Phase | Goal |
|---|---|---|
| 0–2 | Setup | Types, mocks, project init, design system |
| 2–10 | Core Shells | 3 screens with mock data, backend generates real questions |
| 10–20 | Integration | Real API ↔ real frontend, Theory updates live |
| 20–28 | Polish | Animations, prompt tuning, multi-candidate testing |
| 28+ | Demo Prep | Feature freeze, rehearsal, deployment |

---

## Demo Key Message (say 3 times)

> "The LLM never decides what to ask next. Our deterministic Theory Engine does."

---

*Last updated: 2026-08-07*
