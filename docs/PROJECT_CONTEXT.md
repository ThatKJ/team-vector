# 📍 Project Context

> **Purpose**: Single source of truth for the current state of the project. Every AI session reads this first.  
> **When to update**: After every completed task, bug fix, architecture change, or milestone shift.

---

## Current Milestone

**Phase 1: Complete ✅ — Project Scaffolding & Documentation**

The complete project operating system is built — folders, documentation, workflows, team processes, and collaboration infrastructure. Repository is ready for teammates to clone.

**Next Milestone**: Phase 2 — Product Idea & Architecture (starts when problem statement is released)

---

## Status Summary

| Metric | Value |
|---|---|
| Sprint | Phase 1 — Foundation ✅ Complete |
| Timeline | 48 hours (starts when problem statement drops) |
| Health | 🟢 On Track |
| Blockers | Awaiting hackathon problem statement |
| Team | Team Vector |
| Event | ViCodathon 2026 |
| Repository | [github.com/ThatKJ/team-vector-vicodathon-2026](https://github.com/ThatKJ/team-vector-vicodathon-2026) |

---

## Completed Features

- [x] Project workspace structure created (7 directories)
- [x] Documentation framework established (17 docs, 5,000+ lines)
- [x] Agent rules defined (v2.0 with persistent teammate protocol)
- [x] AI usage logging system set up (`prompts/PROMPTS.md`)
- [x] Task management (Kanban) initialized
- [x] Decision log initialized (3 foundational decisions)
- [x] Demo script template created with timing & contingency
- [x] Judging criteria north star document
- [x] Feature matrix for scope control
- [x] Bug tracker with severity triage
- [x] UI design system with CSS tokens
- [x] AI workflow with memory decision tree
- [x] Hour-by-hour hackathon timeline
- [x] Scope firewall (DO_NOT_BUILD.md)
- [x] Definition of Done checklist
- [x] Team onboarding document
- [x] README, LICENSE, .gitignore, .env.example
- [x] Repository readiness review & cleanup

---

## Pending Tasks

- [ ] Finalize product idea & PRD (awaiting problem statement)
- [ ] Choose and justify technology stack
- [ ] Set up development environment (Next.js / Vite)
- [ ] Design system & brand identity
- [ ] Core feature implementation
- [ ] Sponsor technology integration
- [ ] Testing & polish
- [ ] Demo preparation & rehearsal
- [ ] Production deployment

---

## Known Bugs

*No bugs — project is in documentation phase. Application code has not been written yet.*

See [`docs/KNOWN_BUGS.md`](KNOWN_BUGS.md) for the tracking format.

---

## Architecture Summary

**Not yet finalized.** See [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) for the evolving architecture plan.

Likely stack:
- **Frontend**: React / Next.js with TypeScript
- **Styling**: CSS Modules or Tailwind (TBD)
- **Backend**: Next.js API routes or Express
- **Database**: TBD (Supabase / Firebase / Prisma)
- **AI Layer**: TBD (OpenAI / Gemini / Anthropic)
- **Memory Layer**: Breeth (if applicable)
- **Deployment**: Vercel / Railway

---

## Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Framework | TBD | ⏳ Pending |
| Language | TypeScript | ✅ Decided |
| Styling | TBD | ⏳ Pending |
| Database | TBD | ⏳ Pending |
| AI | TBD | ⏳ Pending |
| Memory | Breeth (evaluating) | ⏳ Pending |
| Hosting | TBD | ⏳ Pending |
| Auth | TBD | ⏳ Pending |

---

## Current Blockers

- ⏳ Awaiting hackathon problem statement to finalize product idea

---

## Key Files

| File | Purpose |
|---|---|
| [`docs/PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) | This file — project state |
| [`docs/JUDGING.md`](JUDGING.md) | North star — judging criteria |
| [`docs/TASKS.md`](TASKS.md) | Kanban task board |
| [`docs/TEAM_ONBOARDING.md`](TEAM_ONBOARDING.md) | New teammate guide |
| [`docs/AI_WORKFLOW.md`](AI_WORKFLOW.md) | How we use AI |
| [`docs/PRD.md`](PRD.md) | Product requirements |
| [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | System design |
| [`docs/DECISIONS.md`](DECISIONS.md) | Decision log |
| [`docs/DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md) | Completion checklist |
| [`docs/DEMO.md`](DEMO.md) | Demo script |
| [`docs/FEATURE_MATRIX.md`](FEATURE_MATRIX.md) | Feature prioritization |
| [`docs/HACKATHON_TIMELINE.md`](HACKATHON_TIMELINE.md) | Hour-by-hour plan |
| [`docs/DO_NOT_BUILD.md`](DO_NOT_BUILD.md) | Scope firewall |
| [`docs/UI_GUIDELINES.md`](UI_GUIDELINES.md) | Design system tokens |
| [`docs/KNOWN_BUGS.md`](KNOWN_BUGS.md) | Bug tracker |
| [`docs/MEMORY_STRATEGY.md`](MEMORY_STRATEGY.md) | Memory layer strategy |
| [`docs/SPONSOR_USAGE.md`](SPONSOR_USAGE.md) | Sponsor tech tracker |
| [`prompts/PROMPTS.md`](../prompts/PROMPTS.md) | AI usage log |

---

## Notes for Future Sessions

1. **Always read this file first.** It is the quickest way to understand where the project stands.
2. **Update this file after every task.** Even small changes matter for continuity.
3. **If the project idea hasn't been finalized yet**, check with the human before assuming any product direction.
4. **Check [`docs/JUDGING.md`](JUDGING.md)** before building any feature — does it improve our score?
5. **Check [`docs/DO_NOT_BUILD.md`](DO_NOT_BUILD.md)** before adding scope — is this on the kill list?

---

*Last updated: 2026-08-07T04:18:00+05:30*
