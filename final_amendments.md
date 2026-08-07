# Intervu AI — Final Amendments (v3.1)

> **This document amends the [Implementation Plan v3](file:///Users/kirtan/.gemini/antigravity-ide/brain/f3527822-c41f-4e03-89ed-c792686394cd/implementation_plan.md).**
> These are the last changes before code begins.
> **SCOPE IS FROZEN after this document.**

---

## Amendment 1: Replace Forced Loading → Instant + Sidebar Processing

**Before (v3)**: 3-second cinematic animation blocking the transition to Interview Screen.

**After (v3.1)**: Interview Screen appears **instantly**. The right sidebar shows processing steps while the first question loads.

```
Click "Begin Interview"
        │
        ▼
Interview Screen appears immediately
        │
        ├── Left side: empty chat, waiting
        │
        └── Right side (Live Theory panel):
            
            Building Candidate Theory...
            ████████████████████ ✓
            
            Loading mission history...
            ████████████████░░░░
            
            Selecting interview strategy...
            ░░░░░░░░░░░░░░░░░░░░
            
            ↓ (1-2 seconds, real LLM time)
            
            All ✓ → First question fades into chat
```

**Why**: No fake waiting. The processing steps are real pipeline stages. The sidebar feels alive while the LLM generates the first question. Judges see the system thinking, not a loading screen.

**Implementation**: Framer Motion `AnimatePresence` for the processing steps. Each step transitions to ✓ as the actual backend processing completes (or on a timed stagger if the LLM is faster than expected — minimum 200ms per step to feel intentional).

---

## Amendment 2: Progressive Disclosure — UI Grows With the Interview

**Before (v3)**: All sidebar elements visible from the start (Strategy, Activity Feed, Module Health, Confidence, Version, Mission Context, Interview Map).

**After (v3.1)**: Interface reveals elements progressively.

### State: Before First Answer

```
Right Sidebar shows ONLY:
┌──────────────────────────┐
│  LIVE THEORY       v1.0  │
│                          │
│  [Small radar chart]     │
│  (initialized from       │
│   cohort data)           │
│                          │
│  MODULE HEALTH           │
│  (bars from mission data)│
│                          │
│  Awaiting first response │
└──────────────────────────┘
```

### State: After First Answer (elements animate in)

```
Right Sidebar reveals:
┌──────────────────────────┐
│  LIVE THEORY       v1.1  │  ← version ticks
│                          │
│  [Radar chart updates]   │
│                          │
│  MODULE HEALTH           │
│  Agentic AI  72  +12     │  ← deltas appear
│    confidence 35%  +20%  │  ← confidence appears
│                          │
│  ╭─ STRATEGY ──────────╮ │  ← ANIMATES IN
│  │ ESCALATE             │ │
│  │ Reason: Strong Q1... │ │
│  ╰──────────────────────╯ │
│                          │
│  ╭─ ACTIVITY FEED ─────╮ │  ← ANIMATES IN
│  │ ✓ Updated Module 6   │ │
│  │ ✓ Confidence +20%    │ │
│  ╰──────────────────────╯ │
└──────────────────────────┘

Bottom bar:
INTERVIEW MAP                    ← ANIMATES IN
Background ✓ │ Core AI ● │ ...
```

### State: After Second Answer Onward

```
All elements are now visible.
Theory Evolution timeline appears:
┌──────────────────────────┐
│  THEORY EVOLUTION        │
│  v1.0  ██████░░  (init)  │
│  v1.1  ████████░ (Q1)    │
│  v1.2  █████████ (Q2)    │ ← grows each turn
└──────────────────────────┘
```

**Why**: The interview screen starts clean and grows richer as the AI observes more. It feels like the system is *learning*, not just *displaying*. Judges experience the same progressive understanding as the AI.

**Implementation**: Zustand store tracks `answersCompleted` count. Components conditionally render with `AnimatePresence` based on threshold: `answersCompleted >= 1` for strategy/feed, `answersCompleted >= 2` for Theory Evolution timeline.

---

## Amendment 3: Engineering Readiness Count-Up Animation

**Before (v3)**: Score appears immediately as `82 — Strong Hire`.

**After (v3.1)**: Score counts up from 0 to final value over ~0.8 seconds.

```
Report loads → Engineering Readiness section:

Calculating...

  48      (flash)
  
  61      (flash)
  
  72      (flash)
  
  82      (holds)
  
  STRONG HIRE   (fades in below)
```

**Implementation**: Framer Motion `useSpring` or `useMotionValue` with `animate`. Count from 0 to target value over 800ms with easing. Verdict text fades in 200ms after count completes.

---

## Amendment 4: Architecture as Vertical Flow Diagram

**Before (v3)**: Architecture explained in paragraphs during demo.

**After (v3.1)**: One visual flow diagram. Used in the demo AND optionally shown in the Report screen footer or a dedicated section.

```
        Candidate Data
              │
              ▼
    ┌─────────────────────┐
    │  Candidate Theory   │
    │      Engine         │  ← Deterministic (TypeScript)
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Interview Strategy │  ← Deterministic (TypeScript)
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │
    │  Question Generation│  ← LLM
    └─────────┬───────────┘
              │
              ▼
       Candidate Answer
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │
    │  Answer Evaluation  │  ← LLM
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

**Key visual**: LLM boxes are one color. Deterministic boxes are another. The split is immediately obvious.

**In the demo**: "Notice — Gemini appears exactly twice in this pipeline. Everything else is our deterministic Theory Engine."

---

## Amendment 5: Assessment Confidence in Report

**Before (v3)**: Report ends with Engineering Readiness score + verdict.

**After (v3.1)**: Report includes **Confidence in Assessment** metric with reasoning.

```
┌─────────────────────────────────────────┐
│                                          │
│  Confidence in Assessment                │
│                                          │
│             87%                          │
│                                          │
│  Based on:                               │
│    8 cohort signals                      │
│    5 interview responses                 │
│    12 evidence points                    │
│                                          │
└─────────────────────────────────────────┘
```

**Implementation**: Computed deterministically by the Theory Engine:
- Count of mission data points used (from `signals` + `missions`)
- Count of interview questions answered
- Count of evidence entries generated
- Average confidence across all modules
- Combined into a single meta-confidence percentage

**Why**: This signals to judges that the AI knows how certain it is. A 5-question interview has lower assessment confidence than a 10-question one — and the system acknowledges this.

---

## Additional Tweaks

### ADD: Theory Evolution Mini-Timeline

Added to the Live Theory sidebar (appears after Q2 per progressive disclosure).

```
THEORY EVOLUTION
v1.0  ██████░░░░  Initial (cohort data)
v1.1  ████████░░  After Q1
v1.2  █████████░  After Q2
v1.3  ██████████  After Q3 (current)
```

**Implementation**: Simple list component. Each entry is a snapshot of the overall Engineering Readiness score at that version. Renders as small horizontal bars. Framer Motion stagger animation when new entries appear.

### REMOVE: Latest Signal Card

Deleted from the Interview Screen. The Activity Feed already surfaces the same information:
```
✓ Domain separation mentioned
✓ Agent specialization discussed  
✗ Failure modes not addressed
```

Removing the Latest Signal card reduces sidebar clutter without losing information.

### ADD: Demo Answer Buttons

For demo purposes only. Three buttons below the answer input:

```
[ Strong Answer ]  [ Average Answer ]  [ Weak Answer ]
```

Clicking one instantly fills the text area with a pre-written response and auto-submits.

**Implementation**: Only visible in development mode (`process.env.NODE_ENV === 'development'`) or behind a query param (`?demo=true`). Pre-written answers stored in `/lib/mocks/demo-answers.ts`, keyed by candidate ID + question index.

**Why**: Demo becomes deterministic. No typing mistakes. No fumbling. Click → answer appears → submit → Theory updates. Smooth and rehearsable.

### Key Message Strategy

The single most important sentence for judges:

> **"The LLM never decides what to ask next. Our deterministic Theory Engine does."**

This must be said **three times** during the demo:

1. **During architecture explanation** (4:15): "Notice — Gemini appears exactly twice in this pipeline. The Theory Engine decides everything else."
2. **During interview** (1:30): "The Theory Engine detected low confidence in production thinking, so it selected a PROBE_WEAKNESS strategy targeting Module 7."
3. **During close** (4:50): "The report is generated from the Theory Engine's evidence chain — not from a single LLM summary call."

---

## Scope Freeze Declaration

> [!CAUTION]
> **SCOPE IS FROZEN.**
>
> No new features will be added after this document.
> No strategic changes will be made.
> No UI components will be redesigned.
>
> From this point forward, the only work is:
> 1. **Build** what's in the plan
> 2. **Polish** what's been built
> 3. **Rehearse** the demo
>
> Any proposed change must pass this test:
> "Will this increase our winning probability more than spending the same time on polish?"
> The answer is almost certainly NO.

---

## Updated Feature List (Final — Frozen)

### TIER 1 — Must Have

- [ ] `POST /api/interview` (spec compliance)
- [ ] Session management (in-memory Map)
- [ ] Start → Conversation → End with correct response shapes
- [ ] Structured feedback (`summary`, `strengths`, `gaps`, `next`)
- [ ] Theory Engine (deterministic scoring, confidence, strategy)
- [ ] Curriculum-aware, candidate-aware question generation
- [ ] 5-round interview (1 question each + optional follow-up)
- [ ] 3 screens: Start, Interview, Report
- [ ] Live Theory sidebar with module health + confidence
- [ ] Engineering Intelligence Report with Engineering Readiness

### TIER 2 — High Impact

- [ ] Instant interview screen + sidebar processing steps (Amendment 1)
- [ ] Progressive disclosure — UI grows with interview (Amendment 2)
- [ ] Engineering Readiness count-up animation (Amendment 3)
- [ ] Strategy panel (appears after Q1)
- [ ] Activity Feed (appears after Q1)
- [ ] Score deltas with reasons
- [ ] Pipeline step indicators during LLM processing
- [ ] Mission context linking (question ← cohort day)
- [ ] Interview Map (labeled rounds)
- [ ] Engineering DNA radar chart (report hero)
- [ ] Interview Replay (click question → full context)
- [ ] Decision Trace
- [ ] Theory Evolution mini-timeline (appears after Q2)
- [ ] Theory Version counter
- [ ] Evidence Counter
- [ ] Assessment Confidence metric (Amendment 5)
- [ ] Demo answer buttons (`?demo=true`)

### TIER 3 — Only if Tier 2 is done

- [ ] AI Brain Pulse animation
- [ ] Contradiction detection (LLM-handled, not custom engine)

### DELETED — Will Not Build

- ~~Latest Signal card~~ (redundant with Activity Feed)
- ~~3-second forced loading animation~~ (replaced by sidebar processing)
- ~~Breeth integration~~
- ~~Cross-session memory~~
- ~~Responsive/tablet~~
- ~~Evidence expand/collapse~~
- ~~Multiple seeded demo candidates~~
- ~~Dark mode toggle~~
- ~~Authentication~~
- ~~Database~~
- ~~PDF export~~

---

## Ready to Execute

The plan is locked. The amendments are final.

**Next step**: Phase 0 — Contracts & Setup.

**Hour 0 tasks** (can start immediately):
- **Ayan**: TypeScript interfaces in `/lib/types.ts` + mock response JSON
- **Person 3**: `npx create-next-app` + Tailwind + Framer Motion + Recharts + Zustand
- **Kirtan**: Design system decisions (colors, fonts) → Tailwind config

All three developers work independently from Hour 0.
First integration checkpoint: Hour 10.
