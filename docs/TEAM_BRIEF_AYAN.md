# 👨‍💻 Team Brief — Ayan (Backend / AI Engineer)

> **Branch**: `feature/backend-ai`
> **Role**: You own everything intelligent. The API, the Theory Engine, Gemini integration, and session management.
> **Mantra**: If the AI doesn't feel smart, we lose.

---

## What We're Building

**Intervu AI** — An AI interview agent that builds a living **Candidate Theory** from cohort data, interviews candidates with strategy-driven questions, and produces an **Engineering Intelligence Report**.

**Your part**: The brain. The API endpoint, the Theory Engine, the Gemini prompts, the strategy logic, and the feedback generator. You make the system *think*.

**Key message** (repeated 3× in demo): *"The LLM never decides what to ask next. Our deterministic Theory Engine does."*

---

## Tech Stack (Your Layer)

| Tool | Purpose |
|---|---|
| **Next.js Route Handlers** | `POST /api/interview` endpoint |
| **TypeScript** | All engine logic — strict types |
| **Gemini 2.5 Flash** | Question generation + answer evaluation (structured JSON) |
| **In-memory Map** | Session storage (`Map<sessionId, InterviewState>`) |
| **Static JSON** | `curriculum.json` + `candidates.json` imported at build time |

---

## Architecture (Your Domain)

```
        Candidate Data (from request)
              │
              ▼
    ┌─────────────────────┐
    │  Candidate Analyzer │  ← YOU BUILD: Parse missions → module scores
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Theory Engine      │  ← YOU BUILD: Scoring, confidence, gaps
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Strategy Selector  │  ← YOU BUILD: EXPLORE/VALIDATE/ESCALATE/etc.
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │  ← YOU BUILD: Structured output prompt
    │  Question Generation│
    └─────────┬───────────┘
              │
              ▼
       Candidate Answer (from request)
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │  ← YOU BUILD: Evaluation prompt
    │  Answer Evaluation  │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Theory Updater     │  ← YOU BUILD: Update scores, confidence, claims
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Round Manager      │  ← YOU BUILD: 5 rounds, transitions, completion
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Feedback Generator │  ← YOU BUILD: Spec-compliant output
    └─────────────────────┘
```

**Critical separation**: Gemini is a **tool**. The Theory Engine is the **brain**. Gemini generates text and evaluates answers. The engine decides what to ask, when to escalate, when to stop, and what the scores are.

---

## API Contract (Source of Truth)

### Single Endpoint: `POST /api/interview`

See [technical-spec.md](../assets/technical-spec.md) for the official spec.

#### How to Discriminate Request Type

```typescript
if (body.candidate) → START new interview
if (body.message)   → CONVERSATION turn
```

#### Phase 1: Start Interview

```typescript
// REQUEST
{ "sessionId": "abc-123", "candidate": { /* full candidate object */ } }

// YOUR RESPONSE (spec-required + extended)
{
  "reply": "Welcome, Emily. I can see you completed the AI Cohort...[first question]",
  "done": false,
  
  // Extended fields for frontend (spec allows additional fields)
  "theory": { /* initial theory state */ },
  "strategy": { "current": "EXPLORE", "reason": "...", "targetModule": 6 },
  "round": { "current": 1, "name": "Background", "total": 5 },
  "questionIndex": 1,
  "missionContext": { "day": 22, "title": "Multi-Agent Orchestration", "status": "passed", "attempts": 1 }
}
```

#### Phase 2: Conversation Turn

```typescript
// REQUEST
{ "sessionId": "abc-123", "message": "A multi-agent setup works best when..." }

// YOUR RESPONSE
{
  "reply": "Good analysis. Let me push on that — ...[next question]",
  "done": false,
  
  "theory": { /* updated theory */ },
  "evaluation": {
    "signal": "positive",
    "reasoning": "Correctly identified domain separation. Missing: failure modes.",
    "scoreDeltas": {
      "modules": { "6": { "before": 60, "after": 72, "delta": 12, "confidenceBefore": 0.15, "confidenceAfter": 0.35 } },
      "dimensions": { "architectureThinking": { "before": 50, "after": 62, "delta": 12 } }
    },
    "evidenceReasons": ["Mentioned domain separation", "Discussed specialization", "Did not address failure scenarios"]
  },
  "strategy": { "current": "ESCALATE", "reason": "Strong response. Testing failure mode awareness.", "targetModule": 6 },
  "round": { "current": 2, "name": "Core AI", "total": 5 },
  "questionIndex": 2,
  "missionContext": { "day": 22, "title": "Multi-Agent Orchestration", "status": "passed", "attempts": 1 },
  "activityLog": [
    "✓ Evaluated response — positive signal",
    "✓ Updated Module 6: 60 → 72 (+12)",
    "✓ Architecture Thinking: 50 → 62 (+12)",
    "✓ Confidence increased: 15% → 35%",
    "✓ Strategy changed to ESCALATE"
  ]
}
```

#### Phase 3: End Interview

```typescript
// YOUR RESPONSE (when round manager says "done")
{
  "reply": "Thank you, Emily. Here's my assessment.",
  "done": true,
  "feedback": {
    "summary": "Emily demonstrates advanced AI engineering fundamentals...",
    "strengths": ["Exceptional RAG pipeline understanding...", "Strong multi-agent reasoning...", "..."],
    "gaps": ["Production monitoring...", "Failure mode analysis...", "..."],
    "next": ["Build production monitoring stack...", "Practice failure mode analysis...", "..."]
  },
  
  "report": {
    "engineeringReadiness": 82,
    "verdict": "Strong Hire",
    "assessmentConfidence": 87,
    "assessmentBasis": { "cohortSignals": 8, "interviewResponses": 5, "evidencePoints": 12 },
    "moduleHealth": { /* scores + confidence per module */ },
    "evidenceTimeline": [ /* all evidence entries */ ],
    "strategyTrace": [ /* all strategy decisions */ ],
    "theoryVersion": "v1.5"
  }
}
```

---

## Data Models

### Core Types (Create in `/lib/types.ts`)

```typescript
// Candidate (from candidates.json)
interface Candidate {
  member: {
    id: string;
    name: string;
    jobRole: string;
    yearsExperience: number;
    education: string;
    status: string;
  };
  missions: Mission[];
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
}

interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

// Curriculum (from curriculum.json)
interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

interface CurriculumModule {
  n: number;
  title: string;
  days: [number, number]; // [start, end]
}

// Theory Engine Types
interface CandidateTheory {
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  sessionId: string;
  currentRound: 1 | 2 | 3 | 4 | 5;
  questionsAsked: number;
  theoryVersion: string; // "v1.0", "v1.1", etc.
  
  modules: Record<number, ModuleAssessment>; // keyed by module number 1-8
  dimensions: {
    reasoning: DimensionState;
    communication: DimensionState;
    architectureThinking: DimensionState;
    productionReadiness: DimensionState;
    tradeoffAwareness: DimensionState;
  };
  
  evidence: EvidenceEntry[];
  claims: ClaimEntry[];
  strategyHistory: StrategyEntry[];
}

interface ModuleAssessment {
  moduleNumber: number;
  moduleTitle: string;
  score: number;          // 0-100
  confidence: number;     // 0.0-1.0
  missionData: {
    attempted: number;
    passed: number;
    skipped: number;
    failed: number;
    avgAttempts: number;
  };
  interviewEvidence: EvidenceEntry[];
}

interface DimensionState {
  score: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
}

interface EvidenceEntry {
  questionIndex: number;
  round: number;
  question: string;
  answerSummary: string;
  signal: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
  reasoning: string;
  affectedModules: number[];
  affectedDimensions: string[];
}

interface ClaimEntry {
  questionIndex: number;
  topic: string;
  claim: string;
  contradicts?: number;
}

interface StrategyEntry {
  questionIndex: number;
  strategy: QuestionStrategy;
  reason: string;
  targetModule?: number;
}

type QuestionStrategy = 'EXPLORE' | 'PROBE_WEAKNESS' | 'VALIDATE_STRENGTH' | 'ESCALATE' | 'CROSS_REFERENCE' | 'RECOVER';

// Interview Session State (stored in Map)
interface InterviewState {
  sessionId: string;
  candidate: Candidate;
  theory: CandidateTheory;
  messages: Array<{ role: 'interviewer' | 'candidate'; content: string }>;
  currentRound: number;
  questionIndex: number;
  isComplete: boolean;
}
```

---

## Interview Logic

### 5 Rounds × 1 Question Each

| Round | Name | Default Strategy | What to Probe |
|---|---|---|---|
| 1 | Background | EXPLORE | Candidate's relationship to the cohort. Ask about a mission they interacted with. |
| 2 | Core AI | PROBE_WEAKNESS or VALIDATE | Target weakest or strongest module from mission data. Test reasoning, not recall. |
| 3 | Applied | ESCALATE or RECOVER | Scenario-based. "If X broke, how would you debug?" |
| 4 | Production | PROBE_WEAKNESS | Target deployment/security gaps (skipped missions). |
| 5 | Synthesis | CROSS_REFERENCE or VALIDATE | Connect earlier answers. Look for contradictions. Final calibration. |

### Strategy Selection Logic

```typescript
function selectStrategy(theory: CandidateTheory, round: number): { strategy: QuestionStrategy; targetModule: number; reason: string } {
  // Round 1: Always EXPLORE
  if (round === 1) return explore(theory);
  
  // Find weakest module with lowest confidence
  const weakest = findWeakestModule(theory);
  
  // Find strongest module to validate
  const strongest = findStrongestModule(theory);
  
  // Check last evaluation signal
  const lastSignal = theory.evidence[theory.evidence.length - 1]?.signal;
  
  if (lastSignal === 'strong_positive' || lastSignal === 'positive') {
    return escalate(theory, strongest);
  }
  if (lastSignal === 'negative' || lastSignal === 'strong_negative') {
    return recover(theory, weakest);
  }
  
  // Default: probe the weakest area
  return probeWeakness(theory, weakest);
}
```

### Question Generation Prompt (Gemini)

```
You are an AI interview conductor assessing a candidate who completed a 31-day AI/ML cohort.

CANDIDATE: {name}, {role}, {yearsExperience} years, {education}
STRATEGY: {strategy} — {reason}
TARGET MODULE: {moduleTitle} (Module {moduleNumber})
CURRICULUM CONTEXT: {objectives for relevant days}
MISSION DATA: {candidate's missions for this module — passed/failed/skipped/attempts}
PREVIOUS QUESTIONS: {list of previous questions asked}

Generate ONE interview question that:
1. Tests REASONING, not recall (don't ask "What is X?" — ask "When would you choose X over Y and why?")
2. References the candidate's actual cohort experience when relevant
3. Uses scenario-based framing when the strategy is ESCALATE or PROBE_WEAKNESS
4. Is appropriate for the candidate's experience level ({yearsExperience} years as {role})

Return JSON:
{
  "question": "...",
  "targetModule": N,
  "targetDay": N,
  "difficulty": "easy" | "medium" | "hard",
  "assessmentGoal": "What this question is trying to determine"
}
```

### Answer Evaluation Prompt (Gemini)

```
You are evaluating a candidate's interview response.

QUESTION: {question}
CANDIDATE ANSWER: {answer}
CANDIDATE PROFILE: {name}, {role}, {yearsExperience} years
TARGET MODULE: {moduleTitle}
CURRICULUM OBJECTIVES: {objectives for relevant day}
ASSESSMENT GOAL: {what this question was trying to determine}

Evaluate the answer and return JSON:
{
  "signal": "strong_positive" | "positive" | "neutral" | "negative" | "strong_negative",
  "reasoning": "2-3 sentence explanation of why this signal",
  "evidenceReasons": ["Specific thing candidate said well", "Specific thing missing"],
  "moduleScoreDelta": -10 to +15,
  "dimensionDeltas": {
    "reasoning": -5 to +10,
    "communication": -5 to +10,
    "architectureThinking": -5 to +10,
    "productionReadiness": -5 to +10,
    "tradeoffAwareness": -5 to +10
  },
  "confidenceIncrease": 0.05 to 0.25,
  "claims": [
    { "topic": "vector_databases", "claim": "prefers Pinecone for production" }
  ],
  "answerSummary": "One sentence summary of what the candidate said"
}
```

---

## Your Task List (In Order)

### Phase 0 (Hours 0–2)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-200** | All TypeScript interfaces in `/lib/types.ts` | 0.5h |
| **TASK-201** | Mock response JSON files in `/lib/mocks/` (start, turn, end) | 0.5h |
| **TASK-202** | Import curriculum.json + candidates.json into `/lib/data/` | 0.5h |
| **TASK-203** | API route stub — `POST /api/interview/route.ts` returning mock responses | 0.5h |

### Phase 1 (Hours 2–10)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-204** | Session Manager — `Map<sessionId, InterviewState>`, create/load/save/finish | 1.5h |
| **TASK-205** | Candidate Analyzer — parse missions, compute per-module scores + gaps | 2h |
| **TASK-206** | Theory Engine v1 — build initial theory from candidate data | 1h |
| **TASK-207** | Strategy Engine — strategy selection logic per round | 2h |
| **TASK-209** | Gemini integration — question generation with structured output | 3h |
| **TASK-210** | Gemini integration — answer evaluation with structured output | 2h |

### Phase 2 (Hours 10–20)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-208** | Round Manager — 5 rounds, question index, follow-up logic, completion trigger | 1.5h |
| **TASK-211** | Theory Engine v2 — confidence tracking, gap detection, round transitions | 2h |
| **TASK-212** | Feedback Generator — spec-compliant summary/strengths/gaps/next from theory state | 2h |
| **TASK-213** | Report Builder — Engineering Readiness score, module health, evidence timeline, traces | 2h |
| **TASK-214** | Error handling — LLM timeout, invalid JSON retry, fallback responses | 1.5h |

### Phase 3 (Hours 20–28)

| Task | Deliverable | Hours |
|---|---|---|
| **TASK-215** | Prompt refinement — test with CAND-003, CAND-010, CAND-017 (different archetypes) | 3h |
| **TASK-216** | Seed demo answers for CAND-003 (Emily Chen) — 5 pre-written responses | 1h |
| Multi-candidate validation | Run full interviews with 3+ candidates, verify quality | 2h |

### Phase 4 (Hours 28+)

| Task | Deliverable | Hours |
|---|---|---|
| Production deployment | Deploy to Vercel, set env vars | 1h |
| Fix rehearsal issues | Bugs found during demo rehearsals | 1.5h |

---

## Candidate Data Quick Reference

### Archetypes to Test Against

| Candidate | Profile | Why Interesting |
|---|---|---|
| **CAND-003** Emily Chen | AI Engineer, 6yr, 30/31 first-try | Near-perfect. Questions should be hard. |
| **CAND-010** Gerald Combs | IT Support, 20yr, 3 FAILURES | Struggling learner. Questions should be gentler. |
| **CAND-017** Tyler Brooks | Junior Dev, 0yr, 1 first-try | Persistent but struggled. Raw potential signal. |
| **CAND-004** David Miller | Business Analyst, MBA | Career transitioner. Non-technical background. |
| **CAND-008** Harold Whitfield | Distinguished Eng, 28yr | Veteran who struggled with newer AI concepts. |

### Curriculum Modules (for mapping missions)

| Module | Days | Title |
|---|---|---|
| 1 | 1–3 | Environment & Tooling |
| 2 | 4–6 | Data Foundations |
| 3 | 7–10 | Embeddings & Vector Search |
| 4 | 11–15 | LLM Core, Prompting & Fine-Tuning |
| 5 | 16–20 | Chatbot Application Build |
| 6 | 21–24 | Agentic AI & MCP |
| 7 | 25–28 | Evaluation, Security & Deployment |
| 8 | 29–31 | Production & Capstone |

---

## What You DON'T Touch

- ❌ UI components — Kirtan and Person 3 own these
- ❌ Tailwind config — Kirtan owns this
- ❌ Zustand store — Person 3 owns this
- ❌ Chart components — Person 3 owns these
- ❌ Page layouts — Kirtan owns these

---

## What You Need From Others

| Need | From | By When |
|---|---|---|
| Running dev server | Person 3 | Hour 1 |
| Nothing else | — | You're self-sufficient |

## What Others Need From You

| Deliverable | For | By When |
|---|---|---|
| TypeScript interfaces (`/lib/types.ts`) | Everyone | Hour 0.5 |
| Mock response JSONs (`/lib/mocks/`) | Kirtan + Person 3 | Hour 1 |
| API stub returning mock data | Person 3 | Hour 1.5 |
| Curriculum + candidate data imported | Everyone | Hour 1 |
| Working API with real Gemini responses | Person 3 (for integration) | Hour 10 |
| Seeded demo answers | Kirtan (for demo) | Hour 26 |

---

## Environment Setup

```bash
# .env.local (gitignored)
GEMINI_API_KEY=your_key_here
```

Use the Gemini SDK (`@google/generative-ai`) with structured output / JSON mode.

---

*You are the brain of this product. If the questions are generic, we lose. Make them intelligent.*
