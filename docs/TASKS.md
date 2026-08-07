# 📌 Tasks — Kanban Board

> **Purpose**: Track all project tasks in a Kanban-style workflow.
> **When to update**: When a task is created, started, completed, or blocked.

---

## 🗂️ Backlog

### Kirtan (Product/UI/Frontend) — `feature/frontend-core`

- [ ] **TASK-100**: Tailwind config — colors, fonts, spacing, dark theme
- [ ] **TASK-101**: UI primitives — Button, Card, Badge, Section, ProgressBar, Panel
- [ ] **TASK-102**: Start Screen — candidate selector, profile card, module readiness bars, CTA
- [ ] **TASK-103**: Interview Screen layout — chat panel + right sidebar shell (mock data)
- [ ] **TASK-104**: Sidebar processing animation (Amendment 1) — instant screen + processing steps
- [ ] **TASK-105**: Progressive disclosure (Amendment 2) — elements animate in after Q1/Q2
- [ ] **TASK-106**: Pipeline step indicators — Evaluating/Updating/Selecting/Generating
- [ ] **TASK-107**: Theory animations — health bars, confidence, radar updates, Theory Version
- [ ] **TASK-108**: Interview Map component (labeled rounds with status)
- [ ] **TASK-109**: Report animations — Readiness count-up, verdict reveal, radar fill, card stagger
- [ ] **TASK-110**: Loading skeleton screens during LLM calls
- [ ] **TASK-111**: Error states — graceful handling if LLM fails
- [ ] **TASK-112**: Visual polish pass — spacing, typography, transitions, hover states

### Ayan (Backend/AI) — `feature/backend-ai`

- [ ] **TASK-200**: TypeScript interfaces — all types from implementation plan in `/lib/types.ts`
- [ ] **TASK-201**: Mock response JSON files in `/lib/mocks/`
- [ ] **TASK-202**: Import curriculum.json + candidates.json into `/lib/data/`
- [ ] **TASK-203**: API route stub — `POST /api/interview/route.ts`
- [ ] **TASK-204**: Session Manager — Map<sessionId, state>, create/load/save/finish
- [ ] **TASK-205**: Candidate Analyzer — parse missions → per-module scores + gaps
- [ ] **TASK-206**: Theory Engine v1 — initial theory from candidate data, module scoring
- [ ] **TASK-207**: Strategy Engine — EXPLORE/VALIDATE/ESCALATE/PROBE_WEAKNESS/RECOVER/CROSS_REFERENCE
- [ ] **TASK-208**: Round Manager — 5 rounds, question index, follow-up logic, completion
- [ ] **TASK-209**: Gemini integration — question generation (structured JSON output)
- [ ] **TASK-210**: Gemini integration — answer evaluation (signal, reasoning, deltas, claims)
- [ ] **TASK-211**: Theory Engine v2 — confidence tracking, gap detection, round transitions
- [ ] **TASK-212**: Feedback Generator — spec-compliant summary/strengths/gaps/next
- [ ] **TASK-213**: Report Builder — Engineering Readiness, module health, evidence, traces
- [ ] **TASK-214**: Error handling — timeouts, invalid JSON, retry, fallback
- [ ] **TASK-215**: Prompt refinement — test with 3+ candidates, improve question quality
- [ ] **TASK-216**: Seed demo answers for CAND-003 (Emily Chen)

### Person 3 (Frontend Components + Integration) — `feature/frontend-components`

- [ ] **TASK-300**: Project init — Next.js + Tailwind + Framer Motion + Recharts + Zustand
- [ ] **TASK-301**: Zustand store — interview state, theory snapshots, messages, loading, report
- [ ] **TASK-302**: Radar chart component (Recharts, animated with Framer Motion)
- [ ] **TASK-303**: Module health bar component (animated, with confidence %)
- [ ] **TASK-304**: Activity Feed component (scrolling list)
- [ ] **TASK-305**: Strategy Card component
- [ ] **TASK-306**: Evidence Counter component
- [ ] **TASK-307**: Theory Evolution timeline component
- [ ] **TASK-308**: Interview Map component (if not done by Kirtan)
- [ ] **TASK-309**: Report Screen — hero, radar, strengths/weaknesses, module health, recommendations
- [ ] **TASK-310**: Interview Replay component (click question → expand context)
- [ ] **TASK-311**: Decision Trace component
- [ ] **TASK-312**: Assessment Confidence card (Amendment 5)
- [ ] **TASK-313**: Connect Interview Screen to real API (replace mocks)
- [ ] **TASK-314**: Connect Report Screen to real API
- [ ] **TASK-315**: Demo mode — `?demo=true`, answer buttons (Strong/Average/Weak)
- [ ] **TASK-316**: Bug fixing — integration issues, edge cases, state bugs
- [ ] **TASK-317**: Score deltas with reasons display

---

## 🟡 Ready

*Tasks ready to start at Hour 0:*

- [ ] **TASK-100**: Tailwind config (Kirtan)
- [ ] **TASK-200**: TypeScript interfaces (Ayan)
- [ ] **TASK-300**: Project init (Person 3)

---

## 🔵 In Progress

*No tasks in progress.*

---

## ✅ Done

- [x] **TASK-001**: Create project folder structure
- [x] **TASK-002**: Generate all documentation files
- [x] **TASK-003**: Set up AI usage logging system
- [x] **TASK-024**: Documentation v2
- [x] **TASK-025**: Repository readiness review
- [x] **TASK-026**: Strategic product review (implementation plan v3.1 finalized)

---

## Priority Legend

| Priority | Meaning |
|---|---|
| P0 | Must ship — product doesn't work without it |
| P1 | Should ship — significantly improves demo quality |
| P2 | Nice to have — only if time permits |

---

*Last updated: 2026-08-07*
