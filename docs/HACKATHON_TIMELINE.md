# ⏱️ Hackathon Timeline — Sprint Plan

> **Purpose**: Phase-by-phase plan for the hackathon.
> **Rule**: Check every 4 hours. If behind, cut scope — don't extend hours.

---

## Timeline Overview

```
Hour 0          Hour 2         Hour 10         Hour 20         Hour 28        Hour 36
│ SETUP         │ CORE SHELLS  │ INTEGRATION   │ POLISH         │ DEMO PREP    │
│ Types, mocks  │ 3 screens    │ Real API ↔    │ Animations     │ Rehearsal    │
│ Project init  │ Mock data    │ Real frontend │ Prompt tuning  │ Deployment   │
│ Design system │ LLM works    │ Theory live   │ Bug fixes      │ Submit       │
```

---

## Phase 0: Setup (Hours 0–2) 🏁

**Goal**: Everyone can work independently.

| Hour | Task | Owner |
|---|---|---|
| 0:00 | `npx create-next-app` + Tailwind + Framer + Recharts + Zustand | Person 3 |
| 0:00 | TypeScript interfaces (`/lib/types.ts`) | Ayan |
| 0:00 | Tailwind config — colors, fonts, spacing, dark theme | Kirtan |
| 0:30 | Mock response JSON files (`/lib/mocks/`) | Ayan |
| 0:30 | UI primitives — Button, Card, Badge, Panel | Kirtan |
| 1:00 | API route stub (`/api/interview/route.ts`) | Ayan |
| 1:00 | Zustand store skeleton | Person 3 |
| 1:00 | Import curriculum.json + candidates.json | Ayan |
| 2:00 | **Checkpoint**: Dev server runs, types shared, mocks available ✅ |

---

## Phase 1: Core Shells (Hours 2–10) 💻

**Goal**: All 3 screens render with mock data. Backend generates real questions.

| Hour | Task | Owner |
|---|---|---|
| 2:00 | Start Screen (selector, profile, module readiness) | Kirtan |
| 2:00 | Radar chart + Module bar components | Person 3 |
| 2:00 | Theory Engine v1 (candidate analyzer, module scoring) | Ayan |
| 4:00 | Interview Screen layout (chat + sidebar shell) | Kirtan |
| 4:00 | Activity Feed, Strategy Card, Evidence Counter | Person 3 |
| 4:00 | Strategy Engine + Round Manager | Ayan |
| 6:00 | Sidebar processing animation | Kirtan |
| 6:00 | Report Screen layout (all sections, mock data) | Person 3 |
| 6:00 | Gemini integration — question generation | Ayan |
| 8:00 | Progressive disclosure logic | Kirtan |
| 8:00 | Interview Replay + Decision Trace components | Person 3 |
| 8:00 | Gemini integration — answer evaluation | Ayan |
| 10:00 | **Checkpoint #1** ✅ |

**Must be true at Hour 10**:
- ✅ All 3 screens render with mock data
- ✅ Backend returns real question for at least 1 candidate
- ✅ Charts render and animate
- ✅ Sidebar processing works

---

## Phase 2: Integration (Hours 10–20) 🔧

**Goal**: Real API ↔ real frontend. Theory updates live.

| Hour | Task | Owner |
|---|---|---|
| 10:00 | Connect Interview Screen to real API | Person 3 |
| 10:00 | Theory Engine v2 (confidence, gaps, round transitions) | Ayan |
| 10:00 | Live Theory animations (bars, confidence, version) | Kirtan |
| 13:00 | Connect Report Screen to real API | Person 3 |
| 13:00 | Follow-up decision logic (ESCALATE vs RECOVER) | Ayan |
| 13:00 | Strategy panel live updates | Kirtan |
| 15:00 | Activity Feed populated from API | Person 3 |
| 15:00 | Feedback generator (spec-compliant) | Ayan |
| 15:00 | Pipeline step indicators | Kirtan |
| 17:00 | Score deltas with reasons | Person 3 |
| 17:00 | Report builder (readiness, traces, replay data) | Ayan |
| 17:00 | Interview Map live updates | Kirtan |
| 20:00 | **Checkpoint #2** ✅ |

**Must be true at Hour 20**:
- ✅ Full interview works end-to-end
- ✅ Theory updates visually after each answer
- ✅ Strategy panel shows real reasoning
- ✅ Report populates with real data
- ✅ Feedback is spec-compliant

---

## Phase 3: Polish (Hours 20–28) ✨

**Goal**: Production quality. Demo-ready.

| Hour | Task | Owner |
|---|---|---|
| 20:00 | Micro-animations (transitions, reveals) | Kirtan |
| 20:00 | Prompt refinement (3+ candidates) | Ayan |
| 20:00 | Theory Evolution timeline | Person 3 |
| 22:00 | Engineering Readiness count-up animation | Kirtan |
| 22:00 | Multi-candidate validation | Ayan |
| 22:00 | Assessment Confidence card | Person 3 |
| 24:00 | Engineering DNA radar fill animation | Kirtan |
| 24:00 | Error handling (timeouts, fallbacks) | Ayan |
| 24:00 | Demo mode (`?demo=true` + answer buttons) | Person 3 |
| 26:00 | Loading skeletons | Kirtan |
| 26:00 | Seed demo answers for CAND-003 | Ayan |
| 26:00 | Bug fixing | Person 3 |
| 28:00 | Visual consistency pass | Kirtan |
| 28:00 | **Checkpoint #3 — FEATURE FREEZE** 🚫 ✅ |

---

## Phase 4: Demo Prep (Hours 28–36) 🎬

**🚫 NO NEW FEATURES. Only demo, deploy, document.**

| Hour | Task | Owner |
|---|---|---|
| 28:00 | Demo script finalization | Kirtan |
| 28:30 | Demo rehearsal #1 | ALL |
| 29:00 | Fix rehearsal issues | Ayan + Person 3 |
| 30:00 | Demo rehearsal #2 | ALL |
| 30:30 | Record backup video | Kirtan |
| 31:00 | Production deployment to Vercel | Ayan |
| 31:30 | Test production deployment | ALL |
| 32:00 | Final bug bash (demo path only) | Person 3 |
| 33:00 | README finalization | ALL |
| 34:00 | PROMPTS.md finalization | ALL |
| 35:00 | Final documentation pass | ALL |
| 36:00 | **SUBMIT** 🚀 |

---

## Emergency Protocols

| Situation | Action |
|---|---|
| Behind by 2+ hours at Phase 1 | Cut Tier 2 items. Focus on Tier 1 only. |
| Behind by 4+ hours at Phase 2 | All hands on API compliance + basic UI. Skip animations. |
| LLM responses unreliable | Hardcode fallback questions per module. |
| Integration breaks at Hour 14 | Person 3 drops everything and debugs integration. |
| Can't deploy at Hour 31 | Use Vercel CLI or Netlify as backup. |
| Demo rehearsal fails | Simplify. Show fewer questions. Pre-record backup video. |

---

*Last updated: 2026-08-07*
