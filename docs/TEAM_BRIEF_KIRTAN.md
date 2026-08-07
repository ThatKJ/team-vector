# 👨‍💻 Team Brief — Kirtan (Product / UI / Frontend)

> **Branch**: `feature/frontend-core`
> **Role**: You own everything the judges see. Every pixel, every animation, every transition.
> **Mantra**: If it doesn't look premium, we lose.

---

## What We're Building

**Intervu AI** — An AI interview agent that builds a living **Candidate Theory** from cohort data, interviews candidates with strategy-driven questions, and produces an **Engineering Intelligence Report**.

**Your part**: The 3 screens, the design system, all animations, and the UX flow. You make the intelligence *visible*.

**Key message** (say 3× in the demo): *"The LLM never decides what to ask next. Our deterministic Theory Engine does."*

---

## Tech Stack (Your Layer)

| Tool | Purpose |
|---|---|
| **Next.js** (App Router) | Pages, routing, layout |
| **Tailwind CSS** | Styling (dark mode only, no toggle) |
| **Framer Motion** | All animations (progressive disclosure, count-up, transitions) |
| **Recharts** | Radar chart (Engineering DNA) — Person 3 builds the component, you animate it |
| **Zustand** | Read state from the store — Person 3 sets it up |

---

## Architecture Context (What You Need to Know)

```
Candidate Data → Theory Engine → Strategy → Gemini (Q) → Answer → Gemini (Eval) → Theory Update → Report
```

- **Gemini** (LLM) appears exactly **twice**: question generation + answer evaluation
- **Theory Engine** (deterministic TypeScript) controls everything else: strategy, scoring, confidence, report
- You don't build the engine. You **visualize** its output.
- The API returns extended fields (`theory`, `strategy`, `evaluation`, `activityLog`) alongside the spec-required `reply` + `done`

---

## Your Screens

### Screen 1: Start Screen (`/`)

**What it does**: Select a candidate, preview their profile, begin the interview.

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│                        INTERVU AI                              │
│          Intelligent Engineering Assessment                    │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Select Candidate                            ▼         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────┬───────────────────────────────┐   │
│  │  Emily Chen            │  COHORT PERFORMANCE            │   │
│  │  AI Engineer · 6 yrs   │  Commit Days  31/31 ████████  │   │
│  │  MS Artificial Intel.   │  Missions     31/31 ████████  │   │
│  │  Status: COMPLETED     │  First Try    30/31 ███████▒  │   │
│  │                        │                                │   │
│  │                        │  MODULE READINESS (cohort)     │   │
│  │                        │  Env & Tooling    █████████   │   │
│  │                        │  Data Found.      ████████░   │   │
│  │                        │  Embeddings       █████████   │   │
│  │                        │  LLM & Prompting  █████████   │   │
│  │                        │  Chatbot Build    ████████░   │   │
│  │                        │  Agentic AI       █████████   │   │
│  │                        │  Eval & Deploy    ██████░░░   │   │
│  │                        │  Production       ███████░░   │   │
│  └────────────────────────┴───────────────────────────────┘   │
│                                                                │
│                    [ Begin Interview → ]                        │
└──────────────────────────────────────────────────────────────┘
```

**Data source**: Candidates dropdown loads from `/lib/data/candidates.json` (20 candidates). Module readiness bars are computed client-side from the candidate's `missions` array mapped to curriculum modules.

**Interactions**:
- Dropdown selects candidate → profile card + bars update
- "Begin Interview" → calls `POST /api/interview` with `{ sessionId: uuid(), candidate: selectedCandidate }` → navigates to `/interview`

---

### Screen 2: Interview Screen (`/interview`)

**Layout**: Two columns. Left = chat. Right = Live Theory sidebar. Bottom = Interview Map.

**Critical UX**: Progressive Disclosure — the sidebar **grows** with the interview.

#### Before first answer (initial state):

```
LEFT SIDE                        RIGHT SIDE
┌────────────────────────┐      ┌──────────────────────┐
│                        │      │ LIVE THEORY     v1.0 │
│  Q1 loading...         │      │                      │
│                        │      │ [Small radar chart]  │
│                        │      │ (from cohort data)   │
│                        │      │                      │
│  Sidebar shows:        │      │ MODULE HEALTH        │
│  Building Theory... ✓  │      │ (bars from missions) │
│  Loading Missions... ✓ │      │                      │
│  Selecting Strategy... │      │ Awaiting response... │
│  Generating Q1...      │      └──────────────────────┘
│                        │
│  → Q1 fades in         │      NO strategy panel yet
│                        │      NO activity feed yet
└────────────────────────┘      NO interview map yet
```

#### After first answer:

```
LEFT SIDE                        RIGHT SIDE
┌────────────────────────┐      ┌──────────────────────┐
│ Q1: Multi-agent...     │      │ LIVE THEORY     v1.1 │
│ A1: "Domain sep..."    │      │                      │
│                        │      │ [Radar updates]      │
│ Q2: [new question]     │      │                      │
│                        │      │ MODULE HEALTH        │
│                        │      │ Agentic AI 72 +12    │
│                        │      │   confidence 35%     │
│                        │      │                      │
│                        │      │ ╭─ STRATEGY ───────╮ │  ← ANIMATES IN
│                        │      │ │ ESCALATE          │ │
│                        │      │ │ Reason: Strong... │ │
│                        │      │ ╰──────────────────╯ │
│                        │      │                      │
│                        │      │ ╭─ ACTIVITY FEED ──╮ │  ← ANIMATES IN
│  ┌──────────────────┐  │      │ │ ✓ Module 6 +12   │ │
│  │ Type answer...   │  │      │ │ ✓ Confidence +20% │ │
│  └──────────────────┘  │      │ ╰──────────────────╯ │
│                        │      └──────────────────────┘
├────────────────────────┴──────────────────────────────┤
│ Background ✓ │ Core AI ● │ Applied ○ │ Prod ○ │ Syn ○│  ← ANIMATES IN
└───────────────────────────────────────────────────────┘
```

#### After second answer:

Everything from above + **Theory Evolution timeline** animates in:

```
│ THEORY EVOLUTION         │
│ v1.0  ██████░░  (init)   │
│ v1.1  ████████░ (Q1)     │
│ v1.2  █████████ (Q2)     │
```

#### While AI is thinking (between answer submit and next question):

Show pipeline steps in the chat area:

```
◉ Evaluating evidence...
◉ Updating theory...
○ Selecting strategy...
○ Generating question...
```

Animated dots. Each step lights up sequentially. These are real pipeline stages (or staggered at minimum 200ms each if the LLM is faster).

---

### Screen 3: Report Screen (`/report`)

**The Engineering Intelligence Report.** One page. Everything.

**Key animations**:
1. **Engineering Readiness count-up**: 0 → 48 → 61 → 72 → 82 over 0.8s, then "STRONG HIRE" fades in
2. **Engineering DNA radar**: fills in on page load (Framer Motion)
3. **Module health bars**: stagger animation (each bar fills sequentially)
4. **Strengths/Gaps cards**: stagger fade-in

See the full report layout in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — "Screen 3" section.

---

## Your Task List (In Order)

### Phase 0 (Hours 0–2)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-100** | Tailwind config: colors, fonts, spacing, shadows, border-radius, dark theme | 1h |
| **TASK-101** | UI primitives: Button, Card, Badge, Section, ProgressBar, Panel in `components/ui/` | 1h |

### Phase 1 (Hours 2–10)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-102** | Start Screen — full build with mock data | 3h |
| **TASK-103** | Interview Screen layout — chat panel + sidebar shell (mock data) | 4h |
| **TASK-104** | Sidebar processing animation (instant screen + processing steps) | 1.5h |
| **TASK-105** | Progressive disclosure logic (elements animate in after Q1/Q2) | Included in TASK-103 |

### Phase 2 (Hours 10–20)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-106** | Pipeline step indicators (Evaluating/Updating/Selecting/Generating) | 1.5h |
| **TASK-107** | Theory animations — health bars, confidence, radar, version | 3h |
| **TASK-108** | Interview Map (labeled rounds with status) | 1h |
| (Wait) | Strategy panel + Activity Feed rendering — Person 3 connects real API data | — |

### Phase 3 (Hours 20–28)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-109** | Report animations: count-up, verdict reveal, radar fill, card stagger | 2.5h |
| **TASK-110** | Loading skeleton screens during LLM calls | 1h |
| **TASK-111** | Error states — graceful UI when LLM fails or times out | 1h |
| **TASK-112** | Visual polish pass — spacing, typography, transitions, hover states | 1h |

### Phase 4 (Hours 28+)

| Task | Deliverable | Hours |
|---|---|---|
| Demo script finalization | Written script with timings | 1h |
| Demo rehearsal #1 | Run through with team | 0.5h |
| Record backup video | Screen recording | 0.5h |

---

## Design Guidelines

### Color Palette (Dark Mode Only)

| Token | Use | Suggested |
|---|---|---|
| `bg-primary` | Page background | `#0a0a0f` or `hsl(240, 20%, 4%)` |
| `bg-surface` | Cards, panels | `hsl(240, 15%, 8%)` |
| `bg-surface-hover` | Hover state | `hsl(240, 15%, 12%)` |
| `border` | Borders | `hsl(240, 10%, 18%)` |
| `text-primary` | Main text | `hsl(0, 0%, 95%)` |
| `text-secondary` | Secondary text | `hsl(0, 0%, 60%)` |
| `accent` | Primary accent (CTAs, highlights) | `hsl(250, 80%, 65%)` — electric purple/indigo |
| `success` | Positive signals, passed | `hsl(150, 70%, 50%)` |
| `warning` | Medium signals | `hsl(40, 90%, 55%)` |
| `danger` | Negative signals, failed | `hsl(0, 75%, 55%)` |

### Typography

| Element | Font | Size |
|---|---|---|
| Headings | Inter or Outfit (Google Fonts) | 2xl–4xl |
| Body | Inter | sm–base |
| Mono (scores, version) | JetBrains Mono | xs–sm |

### Animation Timings

| Animation | Duration | Easing |
|---|---|---|
| Bar fill | 600ms | `easeOut` |
| Card fade-in | 300ms | `easeOut` |
| Score count-up | 800ms | `easeInOut` |
| Progressive reveal | 400ms | `easeOut` |
| Pipeline step transition | 200ms per step | `linear` |

---

## What You DON'T Touch

- ❌ `/api/interview/route.ts` — Ayan owns this
- ❌ `/lib/engine/` — Ayan owns this
- ❌ `/lib/gemini/` — Ayan owns this
- ❌ Chart components (Radar, Bar) — Person 3 builds, you animate/style
- ❌ Zustand store setup — Person 3 builds, you consume
- ❌ API integration code — Person 3 connects frontend ↔ backend

---

## What You Need From Others

| Need | From | By When |
|---|---|---|
| Mock response JSON (start, turn, end) | Ayan | Hour 1 |
| TypeScript interfaces | Ayan | Hour 1 |
| Zustand store | Person 3 | Hour 2 |
| Radar chart component | Person 3 | Hour 4 |
| Module bar component | Person 3 | Hour 3 |
| Real API working | Ayan | Hour 10 |

---

## Demo Responsibilities

You **present the demo**. You **own the narrative**.

5-minute script is in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) under "Demo Script."

Key moments you control:
1. **0:15** — Click "Begin Interview" on Start Screen
2. **0:40** — Point to sidebar processing ("It's building a theory...")
3. **1:30** — Point to strategy panel ("The Theory Engine decided to escalate...")
4. **2:30** — Point to Live Theory ("Every score has evidence")
5. **3:30** — Show report, point to Engineering DNA radar
6. **4:15** — Architecture slide: "Gemini appears exactly twice"
7. **4:50** — Close: "The LLM never decides what to ask next."

---

*You are the face of this product. Make it unforgettable.*
