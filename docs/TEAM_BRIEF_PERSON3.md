# 👨‍💻 Team Brief — Person 3 (Frontend Components / Integration)

> **Branch**: `feature/frontend-components`
> **Role**: You own reusable components, the Zustand store, API integration, the Report screen, and demo mode. You are the bridge between Kirtan's UI and Ayan's backend.
> **Mantra**: If integration breaks, we lose.

---

## What We're Building

**Intervu AI** — An AI interview agent that builds a living **Candidate Theory** from cohort data, interviews candidates with strategy-driven questions, and produces an **Engineering Intelligence Report**.

**Your part**: The building blocks (chart components, feed components, cards), the state management (Zustand), the API integration (connecting screens to the real backend), the Report screen, and demo mode. You make the pieces fit together.

**Key message** (repeated 3× in demo): *"The LLM never decides what to ask next. Our deterministic Theory Engine does."*

---

## Tech Stack (Your Layer)

| Tool | Purpose |
|---|---|
| **Recharts** | Radar chart (Engineering DNA) + bar charts |
| **Framer Motion** | Component animations (you build components, Kirtan animates the pages) |
| **Zustand** | Global state store — interview state, theory, messages, loading |
| **Next.js** | API calls via `fetch` to `/api/interview` |
| **TypeScript** | All components strictly typed using Ayan's interfaces |

---

## Architecture Context

```
Kirtan's Pages ←── YOUR COMPONENTS ←── YOUR STORE ←── YOUR API CALLS ←── Ayan's Backend
```

You sit in the middle:
- **Kirtan** builds page layouts and animations. He imports your components.
- **Ayan** builds the API and returns data. You call his API and put data into the store.
- **Your components** read from the store and render the data.

---

## Your Component Library

### Chart Components

#### `RadarChart` — Engineering DNA

Used in: Interview sidebar (small) + Report screen (large hero)

```typescript
interface RadarChartProps {
  dimensions: {
    reasoning: number;
    communication: number;
    architectureThinking: number;
    productionReadiness: number;
    tradeoffAwareness: number;
  };
  size?: 'sm' | 'lg';
  animate?: boolean;
}
```

Build with **Recharts** `<RadarChart>`. Support two sizes: small (sidebar ~180px) and large (report hero ~350px). When `animate=true`, the radar fills in on mount.

---

#### `ModuleHealthBar` — Module Score + Confidence

Used in: Start screen (readiness), Interview sidebar (live), Report screen (final)

```typescript
interface ModuleHealthBarProps {
  moduleTitle: string;
  score: number;          // 0-100
  confidence?: number;    // 0-100% (shown below score after Q1)
  delta?: number;         // e.g. +12 (shown after update)
  animate?: boolean;
}
```

Horizontal bar that fills to `score%`. Optional confidence percentage below. Optional delta badge (green +N or red -N). Animate fill on mount or update.

---

### Feed / Card Components

#### `StrategyCard`

Used in: Interview sidebar (appears after Q1)

```typescript
interface StrategyCardProps {
  strategy: string;       // "ESCALATE", "PROBE_WEAKNESS", etc.
  reason: string;         // "Strong response on multi-agent..."
  targetModule: number;
  missionContext?: {
    day: number;
    title: string;
    status: string;
    attempts?: number;
  };
}
```

---

#### `ActivityFeed`

Used in: Interview sidebar (appears after Q1)

```typescript
interface ActivityFeedProps {
  items: string[];  // ["✓ Updated Module 6 (+12)", "✓ Confidence +20%", ...]
}
```

Scrolling list. New items animate in from the top. Max ~6 visible items, older ones scroll up.

---

#### `EvidenceCounter`

Used in: Interview sidebar header

```typescript
interface EvidenceCounterProps {
  count: number;
}
```

Small badge: "Evidence: 12" — number grows with each answer.

---

#### `TheoryEvolution`

Used in: Interview sidebar (appears after Q2)

```typescript
interface TheoryEvolutionProps {
  versions: Array<{
    version: string;       // "v1.0", "v1.1"
    label: string;         // "Initial", "After Q1"
    readinessScore: number; // 0-100, shown as mini bar
  }>;
}
```

Vertical list of version entries with small horizontal bars showing the Engineering Readiness at each snapshot.

---

#### `InterviewMap`

Used in: Bottom of interview screen

```typescript
interface InterviewMapProps {
  rounds: Array<{
    name: string;          // "Background", "Core AI", etc.
    status: 'complete' | 'active' | 'pending';
  }>;
}
```

Horizontal bar with labeled rounds + status icons (✓ / ● / ○).

---

### Report-Specific Components

#### `InterviewReplay`

Used in: Report screen

```typescript
interface InterviewReplayProps {
  questions: Array<{
    index: number;
    round: string;         // "Background", "Core AI"
    strategy: string;      // "EXPLORE", "ESCALATE"
    targetModule: string;  // "Module 6"
    scoreDelta: number;    // +14, -5
    question?: string;     // Full question text (shown on click)
    answerSummary?: string;
    signal?: string;
    reasoning?: string;
  }>;
}
```

Table-like list. Each row shows Q#, round, strategy, module, delta. Clicking a row expands to show the full question, answer summary, signal, and reasoning.

---

#### `DecisionTrace`

Used in: Report screen

```typescript
interface DecisionTraceProps {
  entries: Array<{
    questionIndex: number;
    strategy: string;
    reason: string;
    targetModule?: string;
  }>;
}
```

Compact list: `Q1 EXPLORE → Module 6 · No interview data yet`

---

#### `AssessmentConfidence`

Used in: Report screen (bottom)

```typescript
interface AssessmentConfidenceProps {
  confidence: number;      // 0-100
  basis: {
    cohortSignals: number;
    interviewResponses: number;
    evidencePoints: number;
  };
}
```

Card showing confidence percentage + breakdown of what it's based on.

---

## Zustand Store

Create in `/src/store/interviewStore.ts`:

```typescript
import { create } from 'zustand';

interface InterviewStore {
  // State
  currentScreen: 'start' | 'interview' | 'report';
  selectedCandidate: Candidate | null;
  sessionId: string | null;
  
  messages: Array<{ role: 'interviewer' | 'candidate'; content: string }>;
  theory: CandidateTheory | null;
  strategy: StrategyInfo | null;
  evaluation: EvaluationInfo | null;
  round: RoundInfo | null;
  activityLog: string[];
  
  isLoading: boolean;
  loadingStep: string | null; // "Evaluating...", "Updating...", etc.
  answersCompleted: number;   // For progressive disclosure
  
  // Report data (populated when interview ends)
  report: ReportData | null;
  feedback: FeedbackData | null;
  
  // Actions
  setCandidate: (candidate: Candidate) => void;
  startInterview: () => Promise<void>;
  sendAnswer: (message: string) => Promise<void>;
  setScreen: (screen: 'start' | 'interview' | 'report') => void;
  reset: () => void;
}
```

**Key**: The store calls `POST /api/interview` in `startInterview()` and `sendAnswer()`, then updates all state from the response.

---

## API Integration

### `startInterview()`

```typescript
const response = await fetch('/api/interview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: generateSessionId(),
    candidate: selectedCandidate,
  }),
});
const data = await response.json();

// Update store
set({
  messages: [{ role: 'interviewer', content: data.reply }],
  theory: data.theory,
  strategy: data.strategy,
  round: data.round,
  isLoading: false,
});
```

### `sendAnswer(message)`

```typescript
// Add candidate message to messages
// Set loading state + loading steps
// Call API
const response = await fetch('/api/interview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId, message }),
});
const data = await response.json();

if (data.done) {
  // Interview complete — store report + feedback, navigate to report
  set({ report: data.report, feedback: data.feedback, currentScreen: 'report' });
} else {
  // Update theory, strategy, evaluation, messages, activityLog
  set({
    messages: [...messages, { role: 'candidate', content: message }, { role: 'interviewer', content: data.reply }],
    theory: data.theory,
    strategy: data.strategy,
    evaluation: data.evaluation,
    activityLog: data.activityLog,
    answersCompleted: answersCompleted + 1,
  });
}
```

---

## Report Screen (You Build This)

See the full layout in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — "Screen 3" section.

Your components assemble the report:

```
ReportPage
├── ReportHeader (candidate name, meta info)
├── EngineeringReadiness (score + verdict — Kirtan animates the count-up)
├── RadarChart (large hero — your component, Kirtan animates the fill)
├── StrengthsGaps (two-column card layout from feedback.strengths + feedback.gaps)
├── ModuleHealthBar × 8 (from report.moduleHealth)
├── InterviewReplay (from report.evidenceTimeline)
├── DecisionTrace (from report.strategyTrace)
├── AssessmentConfidence (from report.assessmentConfidence)
├── Recommendations (from feedback.next)
└── Footer (evidence count, theory version)
```

---

## Demo Mode

When URL has `?demo=true`, show answer buttons below the text input:

```typescript
// Only visible in demo mode
const isDemoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';
```

Three buttons:
- **Strong Answer** — fills textbox with a pre-written strong response, auto-submits
- **Average Answer** — fills textbox with a mediocre response, auto-submits
- **Weak Answer** — fills textbox with a weak response, auto-submits

Pre-written answers come from `/lib/mocks/demo-answers.ts` (Ayan provides these, keyed by candidate ID + question index).

---

## Your Task List (In Order)

### Phase 0 (Hours 0–2)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-300** | Project init: `npx create-next-app` + Tailwind + Framer + Recharts + Zustand | 1h |
| **TASK-301** | Zustand store skeleton (all state, placeholder actions) | 1h |

### Phase 1 (Hours 2–10)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-302** | Radar chart component (Recharts, two sizes, animated) | 2h |
| **TASK-303** | Module health bar component (animated, with confidence + delta) | 1.5h |
| **TASK-304** | Activity Feed component | 1h |
| **TASK-305** | Strategy Card component | 0.5h |
| **TASK-306** | Evidence Counter component | 0.5h |
| **TASK-308** | Interview Map component | 1h |
| **TASK-309** | Report Screen layout (all sections with mock data) | 3h |

### Phase 2 (Hours 10–20)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-313** | Connect Interview Screen to real API (replace mocks with store) | 3h |
| **TASK-314** | Connect Report Screen to real API | 2h |
| **TASK-310** | Interview Replay component (clickable, expandable) | 2h |
| **TASK-311** | Decision Trace component | 1.5h |
| **TASK-317** | Score deltas with reasons display in module bars | 1.5h |
| **TASK-315** | Demo mode (`?demo=true` + answer buttons) | 1h |

### Phase 3 (Hours 20–28)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-307** | Theory Evolution timeline component | 1h |
| **TASK-312** | Assessment Confidence card | 1h |
| **TASK-316** | Bug fixing — integration, edge cases, state bugs | 2h |
| Error handling | Graceful errors when API fails | 1h |

### Phase 4 (Hours 28+)

| Task | Deliverable | Hours |
|---|---|---|
| Final bug bash | Demo path only | 1h |
| Test production deployment | Verify on Vercel | 0.5h |

---

## What You DON'T Touch

- ❌ Page layouts (Start screen, Interview screen layout) — Kirtan owns these
- ❌ Tailwind config / design system — Kirtan owns this
- ❌ Animation timing / page transitions — Kirtan owns these
- ❌ API route (`/api/interview/route.ts`) — Ayan owns this
- ❌ Theory Engine logic — Ayan owns this
- ❌ Gemini prompts — Ayan owns this

---

## What You Need From Others

| Need | From | By When |
|---|---|---|
| TypeScript interfaces (`/lib/types.ts`) | Ayan | Hour 0.5 |
| Mock response JSONs | Ayan | Hour 1 |
| Tailwind config (colors, fonts) | Kirtan | Hour 1 |
| Working API endpoint | Ayan | Hour 10 |
| Demo answers file | Ayan | Hour 26 |

## What Others Need From You

| Deliverable | For | By When |
|---|---|---|
| Running dev server | Everyone | Hour 1 |
| Zustand store | Kirtan | Hour 2 |
| Radar chart component | Kirtan (embeds in sidebar) | Hour 4 |
| Module bar component | Kirtan (embeds in sidebar + start screen) | Hour 3 |
| Activity Feed component | Kirtan (embeds in sidebar) | Hour 5 |
| Report screen working | Kirtan (for demo rehearsal) | Hour 20 |
| API integration complete | Everyone (for full demo) | Hour 16 |

---

## Integration Rules

You are the **merge gatekeeper**. When Kirtan or Ayan want to merge to `dev`:

1. Pull their branch
2. Test that the app still works end-to-end
3. Fix any integration issues
4. Only then merge the PR

If a change touches shared files (`/lib/types.ts`, Zustand store, or API contracts), **sync with the team before merging** to avoid conflicts.

---

## Shared Files (Conflict Zone)

These files are touched by multiple people. Be careful:

| File | Primary Owner | Others Touch |
|---|---|---|
| `/lib/types.ts` | Ayan | Everyone imports |
| `/src/store/interviewStore.ts` | You | Kirtan reads from it |
| `/lib/mocks/*.json` | Ayan | You + Kirtan read |
| `package.json` | You (init) | Everyone adds deps |

---

*You are the glue. If you don't integrate well, nobody's work matters. Make the pieces fit.*
