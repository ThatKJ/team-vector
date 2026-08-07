# 📍 Project Context

> **Purpose**: Single source of truth for the current state of the project. Every AI session reads this first.
> **When to update**: After every completed task, bug fix, architecture change, or milestone shift.

---

## Current Milestone

**Phase 2: Complete ✅ — Product Strategy & Architecture Finalized**

The product idea (Intervu AI), architecture, team assignments, technology stack, feature tiers, and development roadmap are all locked. Implementation begins now.

**Next Milestone**: Phase 3 — Core Implementation (Hour 0–10)

---

## Status Summary

| Metric | Value |
|---|---|
| Sprint | Phase 2 → Phase 3 transition |
| Timeline | ~36 hours remaining |
| Health | 🟢 Ready to Execute |
| Blockers | None |
| Team | Team Vector (Kirtan, Ayan, Person 3) |
| Event | ViCodathon 2026 |
| Product | **Intervu AI** — AI Interview Agent with Candidate Theory Engine |

---

## Product Summary

**Intervu AI** builds a living Candidate Theory from cohort performance data, conducts hypothesis-driven interviews, and produces an evidence-backed Engineering Intelligence Report.

**Key differentiator**: "The LLM never decides what to ask next. Our deterministic Theory Engine does."

**Tech stack**: Next.js + Tailwind + Framer Motion + Recharts + Zustand + Gemini 2.5 Flash + Vercel

---

## Completed Features

- [x] Project workspace structure (7 directories)
- [x] Documentation framework (18+ docs)
- [x] Product idea finalized (Intervu AI)
- [x] Architecture locked (Theory Engine + Gemini pipeline)
- [x] Technology stack decided
- [x] Team assignments defined
- [x] Feature tiers established
- [x] Development roadmap created
- [x] API contract analyzed (technical-spec.md)
- [x] Candidate data analyzed (20 candidates, patterns identified)
- [x] Curriculum data analyzed (31 days, 8 modules)
- [x] Demo script written
- [x] Git branch strategy defined

---

## Pending Tasks

See [`docs/TASKS.md`](TASKS.md) for full Kanban board.

**Immediate (Hour 0)**:
- [ ] Kirtan: Tailwind config + design system
- [ ] Ayan: TypeScript interfaces + mock responses + API stub
- [ ] Person 3: Next.js project init + dependencies

---

## Architecture Summary

See [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) for full details.

```
Candidate Data → Theory Engine → Strategy → Gemini (Q) → Answer → Gemini (Eval) → Theory Update → Next Strategy → Report
```

**Key**: Gemini appears exactly twice. Everything else is deterministic TypeScript.

---

## Key Files

| File | Purpose |
|---|---|
| [`docs/PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) | This file — project state |
| [`docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | Full implementation plan (v3.1) |
| [`docs/PRD.md`](PRD.md) | Product requirements |
| [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | System design |
| [`docs/TASKS.md`](TASKS.md) | Kanban task board |
| [`docs/JUDGING.md`](JUDGING.md) | North star — judging criteria |
| [`docs/DECISIONS.md`](DECISIONS.md) | Decision log |
| [`docs/HACKATHON_TIMELINE.md`](HACKATHON_TIMELINE.md) | Hour-by-hour plan |
| [`assets/technical-spec.md`](../assets/technical-spec.md) | API contract (source of truth) |
| [`assets/candidates.json`](../assets/candidates.json) | 20 candidate profiles |
| [`assets/curriculum.json`](../assets/curriculum.json) | 31-day cohort syllabus |

---

*Last updated: 2026-08-07T21:12:00+05:30*
