# 🔄 AI Workflow — How Team Vector Uses AI

> **Purpose**: Document the exact process Team Vector follows when using AI. This is our competitive advantage and a key part of the AI Steering judging criteria.  
> **When to update**: When the workflow improves, new patterns emerge, or lessons are learned.  
> **Audience**: Judges, team members, and future AI sessions.

---

## The Team Vector AI Workflow

This is not "User asks → AI codes." This is a disciplined engineering process.

```
    ┌──────────────┐
    │   💡 IDEA    │
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  📋 PRD      │ ← Define what we're building and why
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ 🏗️ ARCH      │ ← Design the system before coding
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  📌 TASKS    │ ← Break it down into shippable units
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ ⭐ JUDGE     │ ← Does this improve our score? YES/NO
    │   FILTER     │
    └──────┬───────┘
           │ YES
    ┌──────▼───────┐
    │  🧠 THINK    │ ← 20-30 seconds of reasoning before ANY code
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  📝 PLAN     │ ← Produce a plan. Identify files. Flag risks.
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  💻 CODE     │ ← Implement with discipline
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  🔍 REVIEW   │ ← Self-review against Definition of Done
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  📄 DOCS     │ ← Update ALL relevant documentation
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  💾 COMMIT   │ ← Suggest descriptive commit message
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ ⭐ JUDGE     │ ← Did this improve our score?
    │   REVIEW     │
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  ✨ POLISH   │ ← Micro-animations, edge cases, states
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  ➡️ NEXT     │ ← Suggest next highest-impact task
    └──────────────┘
```

---

## The Cardinal Rule

> ### 🚨 Never write code immediately.
>
> Spend at least 20–30 seconds reasoning. Produce a plan. Only then implement.
>
> This alone massively improves consistency.

Every time the AI is about to generate code, it must first:

1. **Read** — What's the current project state? What are the priorities?
2. **Think** — What's the right approach? What are the risks? Is there a simpler way?
3. **Plan** — What files are affected? What's the implementation order?
4. **Then** — Write the code.

---

## Pre-Task Context Loading

Before **every** response, the AI must load context from:

```
ALWAYS READ:
├── docs/PROJECT_CONTEXT.md    ← Current project state
├── docs/TASKS.md              ← What's in progress, what's next
└── docs/DECISIONS.md          ← What's already been decided

CONDITIONALLY READ:
├── docs/ARCHITECTURE.md       ← If architecture-related
├── docs/MEMORY_STRATEGY.md    ← If memory-related
├── docs/JUDGING.md            ← If making a feature decision
├── docs/FEATURE_MATRIX.md     ← If evaluating scope
├── docs/UI_GUIDELINES.md      ← If building UI
├── docs/DO_NOT_BUILD.md       ← If considering a new feature
├── docs/KNOWN_BUGS.md         ← If debugging
└── prompts/PROMPTS.md         ← If reviewing AI process
```

**This transforms the AI from a stateless code generator into a persistent engineering teammate.**

---

## Memory Decision Tree

Before every task, run this check:

```
Does this task involve storing or retrieving data?
│
├── NO → Proceed without memory
│
└── YES → What kind of data?
    │
    ├── Current UI state (form values, selected tab, etc.)
    │   └── Use: React State (useState / useReducer)
    │   └── Why: Ephemeral, resets on page reload
    │
    ├── Persistent structured data (user profiles, content, records)
    │   └── Use: Database (Supabase / Firebase / Prisma)
    │   └── Why: Needs CRUD, querying, relationships
    │
    └── AI context that improves over time (preferences, patterns, history)
        └── Use: Breeth (Persistent AI Memory)
        └── Why: Makes AI smarter across sessions, not structured data

IMPORTANT: Explain WHY you chose this storage layer.
"Store in Breeth" is not acceptable without justification.
```

---

## Task Execution Checklist

For every single task, follow these steps in order:

### Step 1: Understand
- [ ] Read the request carefully
- [ ] Identify what's being asked (feature, fix, refactor, docs?)
- [ ] Note any ambiguity — ask before assuming

### Step 2: Context
- [ ] Read `PROJECT_CONTEXT.md`
- [ ] Read `TASKS.md`
- [ ] Read `DECISIONS.md`
- [ ] Read relevant conditional docs

### Step 3: Think
- [ ] Is this the right thing to build? (Check `JUDGING.md`)
- [ ] Is there a simpler approach? (Check `DO_NOT_BUILD.md`)
- [ ] Does this require architecture changes? (Check `ARCHITECTURE.md`)
- [ ] Does this need memory? (Run the Memory Decision Tree)

### Step 4: Plan
- [ ] List files to create/modify
- [ ] Identify dependencies and order of implementation
- [ ] Flag risks or concerns
- [ ] Estimate effort (S/M/L)

### Step 5: Implement
- [ ] Write clean, typed, accessible code
- [ ] Follow `UI_GUIDELINES.md` for all visual elements
- [ ] Handle loading, error, and empty states
- [ ] Test at all breakpoints

### Step 6: Review
- [ ] Self-review against `DEFINITION_OF_DONE.md`
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All states handled
- [ ] Accessible

### Step 7: Document
- [ ] Update `PROJECT_CONTEXT.md`
- [ ] Move task in `TASKS.md`
- [ ] Log interaction in `PROMPTS.md`
- [ ] Update `ARCHITECTURE.md` if structure changed
- [ ] Log any bugs in `KNOWN_BUGS.md`
- [ ] Update `FEATURE_MATRIX.md` if feature status changed

### Step 8: Ship
- [ ] Suggest commit message
- [ ] Suggest next task
- [ ] Flag any new risks or blockers

---

## Response Format

Every AI response follows this structure:

```markdown
## Understanding
[What was asked and why]

## Plan
[What we're going to do and how]

## Files to Modify
[List of files being created/modified/deleted]

## Implementation
[The actual code/changes]

## Risks
[What could go wrong]

## Documentation Updated
[Which docs were updated]

## Testing Checklist
[How to verify this works]

## Suggested Commit Message
[Conventional commit format]

## Next Recommended Task
[What to do next, based on TASKS.md and JUDGING.md priorities]
```

---

## AI Usage Principles

1. **AI is a collaborator, not a contractor.** The human makes product decisions. The AI implements and advises.
2. **AI suggests, human approves.** Never make a decision that changes product direction without asking.
3. **AI explains its reasoning.** Every architectural choice comes with a "why."
4. **AI flags risks.** Don't quietly introduce potential problems.
5. **AI protects the timeline.** Always suggest the simplest solution that meets the bar.
6. **AI maintains context.** Read project docs before every task.
7. **AI is transparent.** Every interaction is logged in `PROMPTS.md`.

---

*Last updated: 2026-08-07T04:05:00+05:30*
