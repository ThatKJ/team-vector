# 📝 Decision Log

> **Purpose**: Record every significant product and engineering decision with context and rationale.
> **When to update**: Whenever a decision is made that affects architecture, product direction, tooling, or scope.

---

### DEC-010: Scope Freeze

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Process |
| **Status** | Decided |

**Decision**: Freeze scope at v3.1. No new features will be added. Only build, polish, and demo from this point.

**Reason**: Every additional feature carries more risk than reward. The plan is comprehensive enough to win. Execution quality > feature quantity.

---

### DEC-009: Delete Latest Signal Card

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Design |
| **Status** | Decided |

**Decision**: Remove the Latest Signal card from the interview sidebar. Activity Feed covers the same information.

**Reason**: Reduces sidebar clutter. The Activity Feed already shows signal details (✓ Domain separation, ✗ Missing monitoring). No information loss.

---

### DEC-008: Progressive Disclosure UI

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Design |
| **Status** | Decided |

**Decision**: Interview screen starts with only Theory + Radar + Module Health. Strategy, Activity Feed, and Interview Map animate in after the first answer. Theory Evolution appears after the second answer.

**Reason**: Reduces initial cognitive load. Makes the interface feel like it's learning alongside the AI. Creates a "growing intelligence" narrative that judges experience firsthand.

---

### DEC-007: Instant Interview Start (No Forced Loading)

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Design |
| **Status** | Decided |

**Decision**: Interview screen appears instantly. Processing steps show in the sidebar while the first question loads.

**Reason**: Forced 3-second loading screens feel fake. Sidebar processing (Building Theory → Loading Missions → Selecting Strategy) shows real pipeline steps and makes the system feel alive.

**Alternative Rejected**: 3-second cinematic loading animation — rejected because judges hate fake waiting.

---

### DEC-006: Interview Length — 5 Questions

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Product |
| **Status** | Decided |

**Decision**: 5 rounds × 1 question each + optional follow-up = 5–6 questions total.

**Reason**: Judges won't sit through 8-10 questions. 5 is enough to build a rich Theory while respecting judge patience. Each round has a distinct purpose (Background → Core AI → Applied → Production → Synthesis).

**Alternative Rejected**: 8-10 questions across 5 rounds — rejected as too long for demo and judge evaluation.

---

### DEC-005: Rename Digital Twin → Candidate Theory

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Product |
| **Status** | Decided |

**Decision**: The candidate model is called "Candidate Theory" (not "Digital Twin"). The sidebar is "Live Theory."

**Reason**: "Digital Twin" is becoming generic (IoT/manufacturing connotation). "Candidate Theory" implies hypothesis-driven assessment — the system builds a theory and tests it. More memorable, more unique, more aligned with the product narrative.

---

### DEC-004: Product Idea — Intervu AI

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Product |
| **Status** | Decided |

**Decision**: Build an AI interview agent that constructs a Candidate Theory from cohort data, conducts hypothesis-driven interviews, and produces an Engineering Intelligence Report.

**Reason**: The hackathon challenge requires an AI interview agent. This approach differentiates by making the intelligence visible (live theory, strategy panel, decision trace, evidence chains) and by separating deterministic logic from LLM calls.

---

### DEC-003: Documentation-First Approach

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Process |
| **Status** | Decided |

**Decision**: Create all project documentation and structure before writing any application code.

**Reason**: Hackathon's biggest risk is disorganization. Documentation-first ensures clarity and directly addresses the "AI Steering" judging criteria.

---

### DEC-002: TypeScript as Primary Language

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Tooling |
| **Status** | Decided |

**Decision**: Use TypeScript for all application code.

**Reason**: Type safety catches bugs at compile time, improves IDE support, and demonstrates technical quality to judges.

---

### DEC-001: Git-Based Project with Structured Documentation

| Field | Value |
|---|---|
| **Date** | 2026-08-07 |
| **Category** | Architecture |
| **Status** | Decided |

**Decision**: Organize the project with `docs/`, `prompts/`, `memory/`, `assets/`, and `src/`.

**Reason**: Clear separation of concerns. Easy to navigate for judges and AI sessions.

---

*Last updated: 2026-08-07*
