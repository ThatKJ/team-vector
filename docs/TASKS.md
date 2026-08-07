# 📌 Tasks — Kanban Board

> **Purpose**: Track all project tasks in a Kanban-style workflow.  
> **When to update**: When a task is created, started, completed, or blocked. Every AI session should update this file.

---

## 🗂️ Backlog

*Tasks identified but not yet prioritized or ready to start.*

- [ ] **TASK-006**: Finalize product idea and update PRD
- [ ] **TASK-007**: Choose and justify technology stack
- [ ] **TASK-008**: Design system — colors, typography, spacing tokens
- [ ] **TASK-009**: Database schema design
- [ ] **TASK-010**: API route design
- [ ] **TASK-011**: Authentication flow (if needed)
- [ ] **TASK-012**: AI prompt engineering for core features
- [ ] **TASK-013**: Breeth memory integration (if applicable)
- [ ] **TASK-014**: Sponsor technology integration
- [ ] **TASK-015**: Error boundary & error states for all pages
- [ ] **TASK-016**: Loading states & skeleton screens
- [ ] **TASK-017**: Empty states for data-driven views
- [ ] **TASK-018**: Accessibility audit (ARIA, keyboard nav, focus)
- [ ] **TASK-019**: Responsive design testing (320px → 1440px)
- [ ] **TASK-020**: Performance optimization (bundle size, LCP)
- [ ] **TASK-021**: Demo rehearsal & timing
- [ ] **TASK-022**: Production deployment
- [ ] **TASK-023**: Final README for submission

---

## 🟡 Ready

*Tasks that are fully specified and ready to pick up.*

- [ ] **TASK-004**: Initialize development environment (framework setup)
- [ ] **TASK-005**: Create brand identity (logo, color palette)

---

## 🔵 In Progress

*Tasks currently being worked on.*

*No tasks in progress.*

---

## 🟣 Review

*Tasks completed but awaiting human review or testing.*

*No tasks in review.*

---

## ✅ Done

*Completed tasks.*

- [x] **TASK-001**: Create project folder structure  
  *Completed: 2026-08-07 — All directories created (docs/, prompts/, memory/, assets/)*

- [x] **TASK-002**: Generate all documentation files with starter content  
  *Completed: 2026-08-07 — All markdown files populated with production-quality content*

- [x] **TASK-003**: Set up AI usage logging system (PROMPTS.md)  
  *Completed: 2026-08-07 — Structured prompt log initialized*

- [x] **TASK-024**: Documentation v2 — competitive advantage upgrade  
  *Completed: 2026-08-07 — 8 new docs (JUDGING, FEATURE_MATRIX, KNOWN_BUGS, UI_GUIDELINES, AI_WORKFLOW, HACKATHON_TIMELINE, DO_NOT_BUILD, DEFINITION_OF_DONE) + AGENT_RULES v2.0 with persistent teammate protocol*

- [x] **TASK-025**: Repository readiness review & team collaboration setup  
  *Completed: 2026-08-07 — README, LICENSE, .gitignore, .env.example, TEAM_ONBOARDING.md, PROJECT_CONTEXT updated, cross-reference audit, formatting review*

---

## Task Template

When adding a new task, use this format:

```markdown
- [ ] **TASK-XXX**: [Short title]
  - **Description**: What needs to be done
  - **Priority**: P0 / P1 / P2
  - **Estimated effort**: S / M / L / XL
  - **Dependencies**: TASK-XXX (if any)
  - **Assignee**: AI / Human / Pair
```

---

## Priority Legend

| Priority | Meaning |
|---|---|
| P0 | Must ship — product doesn't work without it |
| P1 | Should ship — significantly improves quality |
| P2 | Nice to have — only if time permits |

## Size Legend

| Size | Estimated Time |
|---|---|
| S | < 30 minutes |
| M | 30 min – 2 hours |
| L | 2 – 4 hours |
| XL | 4+ hours (consider splitting) |

---

*Last updated: 2026-08-07T04:05:00+05:30*
