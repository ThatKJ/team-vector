# 📋 Product Requirements Document (PRD)

> **Purpose**: Define what we're building, who it's for, and why it matters.
> **Status**: FINALIZED — Scope frozen.

---

## Product Vision

**Intervu AI** — An AI-powered interview agent that constructs a living Candidate Theory from cohort performance data, conducts hypothesis-driven interviews with curriculum-aware questions, and produces an evidence-backed Engineering Intelligence Report.

**One-liner**: "The LLM never decides what to ask next. Our deterministic Theory Engine does."

---

## Target Users

| Persona | Description | Primary Need |
|---|---|---|
| Hackathon Judges | Evaluating our submission via the API | Spec-compliant API, impressive demo, technical depth |
| Hiring Managers | Assessing candidates from AI cohort | Consistent, explainable, evidence-based assessments |
| Candidates | Completing the interview | Actionable feedback with specific growth recommendations |

---

## Problem Statement

Technical interviews are broken in two ways:
1. **For assessors**: Interviews are inconsistent and subjective. Two interviewers reach opposite conclusions about the same candidate.
2. **For candidates**: They get pass/fail with no explanation. They don't know what to improve.

**Intervu AI solves both** by building a transparent, evidence-backed assessment model that shows exactly what it knows, why it believes it, and what changed after every answer.

---

## Proposed Solution

An AI interview agent that:
1. Receives a candidate profile with cohort performance data (missions, signals)
2. Builds an initial Candidate Theory from that data
3. Conducts a 5-round, strategy-driven interview with curriculum-aware questions
4. Updates the Theory after every answer with evidence, confidence, and score deltas
5. Produces a structured Engineering Intelligence Report with Engineering Readiness score

The system is split: **Gemini generates questions and evaluates answers. A deterministic Theory Engine decides strategy, builds the model, and produces the report.**

---

## Key Features (MVP Scope)

| Priority | Feature | Description | Effort | Status |
|---|---|---|---|---|
| P0 | API Endpoint | `POST /api/interview` per technical spec | 2h | ⏳ |
| P0 | Theory Engine | Deterministic scoring, confidence, strategy selection | 8h | ⏳ |
| P0 | Gemini Integration | Question generation + answer evaluation (structured JSON) | 6h | ⏳ |
| P0 | Session Management | In-memory Map keyed by sessionId | 1.5h | ⏳ |
| P0 | Start Screen | Candidate selector, profile, module readiness bars | 3h | ⏳ |
| P0 | Interview Screen | Chat + Live Theory sidebar + Strategy panel | 8h | ⏳ |
| P0 | Report Screen | Engineering Intelligence Report with radar, module health | 6h | ⏳ |
| P1 | Progressive Disclosure | UI grows with interview (Amendment 2) | 2h | ⏳ |
| P1 | Strategy Panel | Shows WHY each question was chosen | 2h | ⏳ |
| P1 | Activity Feed | Scrolling log of AI decisions | 1.5h | ⏳ |
| P1 | Interview Replay | Click question → full context in report | 2h | ⏳ |
| P1 | Decision Trace | Strategy log in report | 1.5h | ⏳ |
| P1 | Demo Mode | Pre-written answer buttons for deterministic demos | 1h | ⏳ |

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| API response time | < 5s per turn (LLM latency) |
| Desktop support | Chrome, Firefox, Safari (latest) |
| Accessibility | Basic ARIA, keyboard nav |
| Performance | < 3s initial load |

---

## Judging Criteria Alignment

| Criteria | Weight | How We Address It |
|---|---|---|
| Originality | High | Candidate Theory + hypothesis-driven questioning + evidence chains |
| Polish | High | Framer Motion animations, progressive disclosure, premium dark UI |
| Technical Quality | Medium-High | Deterministic engine + LLM separation, TypeScript, clean architecture |
| AI Steering | High | Documented AI usage, Gemini structured output, Theory Engine |
| Demo Experience | High | Pre-seeded demo, 5-minute script, key message repeated 3× |

---

## Out of Scope

- Authentication
- Database persistence
- Voice/speech input
- Code editor
- PDF export
- Mobile/tablet optimization
- Breeth integration
- Cross-session memory
- Multiple interview tracks

---

## Success Metrics

1. ✅ API passes all spec compliance checks (start, conversation, end, feedback)
2. ✅ Interview adapts to candidate's cohort data (different questions for different candidates)
3. ✅ Demo can be delivered in under 5 minutes with deterministic answers
4. ✅ Engineering Intelligence Report shows evidence-backed scores
5. ✅ Judges can see WHY each question was asked (strategy panel + decision trace)

---

*Last updated: 2026-08-07*
