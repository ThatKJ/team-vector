# 🏗️ Architecture

> **Purpose**: Document the system architecture, component hierarchy, data flow, and deployment strategy.
> **Status**: FINALIZED — Architecture locked for hackathon execution.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + Tailwind + Framer)     │
│                                                                │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Start Screen │  │ Interview Screen  │  │ Report Screen   │  │
│  │              │  │                   │  │                 │  │
│  │ Candidate    │  │ Chat │ Live Theory│  │ Engineering     │  │
│  │ Selector +   │  │      │ Strategy   │  │ Intelligence    │  │
│  │ Module Ready │  │      │ Activity   │  │ Report          │  │
│  └──────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                │
│  Zustand Store: interview state, theory snapshots, evidence    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                    POST /api/interview
                             │
┌────────────────────────────┴───────────────────────────────────┐
│                    BACKEND (Next.js Route Handler)              │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Session        │  │ Interview      │  │ Theory           │  │
│  │ Manager        │  │ Conductor      │  │ Engine           │  │
│  │ (Map<id,state>)│  │ (orchestrates) │  │ (deterministic)  │  │
│  └────────────────┘  └───────┬────────┘  └──────────────────┘  │
│                              │                                  │
│  ┌────────────────┐  ┌──────┴─────────┐  ┌──────────────────┐  │
│  │ Curriculum     │  │ LLM Service    │  │ Candidate        │  │
│  │ Knowledge      │  │ (Gemini 2.5    │  │ Analyzer         │  │
│  │ (static JSON)  │  │  Flash)        │  │ (mission parser) │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Intelligence Pipeline

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
    │  Gemini 2.5 Flash   │  ← LLM (1 of 2 uses)
    │  Question Generation│
    └─────────┬───────────┘
              │
              ▼
       Candidate Answer
              │
              ▼
    ┌─────────────────────┐
    │  Gemini 2.5 Flash   │  ← LLM (2 of 2 uses)
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

**Key design decision**: Gemini appears exactly **twice** in the pipeline. The Theory Engine (deterministic TypeScript) controls strategy, scoring, confidence, and report generation. This separation is the core technical differentiator.

---

## Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js (App Router) | ✅ Decided |
| Language | TypeScript (strict) | ✅ Decided |
| Styling | Tailwind CSS + Framer Motion | ✅ Decided |
| Charts | Recharts | ✅ Decided |
| State | Zustand | ✅ Decided |
| LLM | Gemini 2.5 Flash | ✅ Decided |
| Hosting | Vercel | ✅ Decided |
| Session | In-memory Map | ✅ Decided |
| Database | None (not needed) | ✅ Decided |
| Auth | None (spec says no auth) | ✅ Decided |

---

## Folder Structure

```
team-vector-vicodathon-2026/
├── docs/                         # Project documentation
├── prompts/                      # AI usage logs
├── memory/                       # Memory layer docs
├── assets/                       # Static assets + hackathon data
│   ├── candidates.json           # 20 candidate profiles
│   ├── curriculum.json           # 31-day cohort syllabus
│   └── technical-spec.md         # API contract (source of truth)
├── src/                          # Application source
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Start Screen
│   │   ├── interview/page.tsx    # Interview Screen
│   │   ├── report/page.tsx       # Report Screen
│   │   ├── api/interview/route.ts # POST /api/interview
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # Primitives (Button, Card, Badge, etc.)
│   │   ├── interview/            # Interview-specific components
│   │   ├── theory/               # Theory visualization components
│   │   └── report/               # Report-specific components
│   ├── lib/
│   │   ├── types.ts              # All TypeScript interfaces
│   │   ├── data/                 # curriculum.json, candidates.json
│   │   ├── mocks/                # Mock API responses for frontend dev
│   │   ├── engine/               # Theory Engine, Strategy Engine, etc.
│   │   ├── gemini/               # LLM service (question gen + evaluation)
│   │   └── session/              # Session Manager
│   ├── store/                    # Zustand stores
│   └── styles/                   # Global styles
├── public/                       # Static public assets
├── .env.local                    # API keys (gitignored)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## API Flow

### Single Endpoint: `POST /api/interview`

```
Request arrives
    │
    ▼
[Discriminator] ─── Has `candidate`? → START flow
                ─── Has `message`?   → CONVERSATION flow
    │
    ▼
[Session Manager] ─── Load or create session
    │
    ▼
[Interview Conductor] ─── Orchestrate the turn
    │
    ├──▶ [Theory Engine] ─── Score, confidence, strategy
    ├──▶ [Gemini Service] ─── Generate/evaluate
    └──▶ [Round Manager] ─── Track progression
    │
    ▼
[Response Builder] ─── Spec-compliant + extended fields
    │
    ▼
Response sent
```

---

## State Management

| State Type | Solution |
|---|---|
| Server session state | In-memory Map<sessionId, InterviewState> |
| Client interview state | Zustand store |
| UI state | React useState |
| Form state | Controlled inputs |

---

## Component Hierarchy

```
App (layout.tsx)
├── Start Page
│   ├── CandidateSelector
│   ├── CandidateCard
│   │   ├── ProfileInfo
│   │   └── ModuleReadinessBars
│   └── BeginButton
├── Interview Page
│   ├── ChatPanel
│   │   ├── MessageList
│   │   ├── PipelineIndicator
│   │   └── AnswerInput (+ DemoButtons)
│   ├── TheorySidebar
│   │   ├── TheoryHeader (version + evidence count)
│   │   ├── RadarChart
│   │   ├── ModuleHealthBars (with confidence)
│   │   ├── StrategyCard (after Q1)
│   │   ├── ActivityFeed (after Q1)
│   │   └── TheoryEvolution (after Q2)
│   └── InterviewMap
└── Report Page
    ├── ReportHeader
    ├── EngineeringReadiness (count-up animation)
    ├── EngineeringDNA (hero radar chart)
    ├── StrengthsGaps (two columns)
    ├── ModuleHealth (8 bars with confidence)
    ├── InterviewReplay (clickable timeline)
    ├── DecisionTrace
    ├── AssessmentConfidence
    └── Recommendations
```

---

## Deployment

```
Git Push → Vercel Auto-Deploy → Live URL
```

| Concern | Solution |
|---|---|
| Hosting | Vercel (free tier) |
| Domain | Vercel auto-generated |
| SSL | Automatic |
| Env vars | Vercel secrets (GEMINI_API_KEY) |
| Preview deploys | Automatic on PR |

---

## Git Strategy

```
main
│
├── dev                    (integration branch)
│
├── feature/frontend-core        ← Kirtan
├── feature/backend-ai           ← Ayan
└── feature/frontend-components  ← Person 3
```

PRs go to `dev`. Final merge `dev → main` after demo rehearsal.

---

*Last updated: 2026-08-07*
