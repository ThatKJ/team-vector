# 👋 Team Onboarding — Welcome to Team Vector

> **Purpose**: Get any new teammate productive in under 10 minutes.  
> **Audience**: Anyone who just cloned this repo.  
> **Rule**: Read this document first. Everything else can wait.

---

## Quick Start (3 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/ThatKJ/team-vector-vicodathon-2026.git
cd team-vector-vicodathon-2026
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local and add your API keys
```

### 3. Read These Three Documents

| Order | Document | Time | Why |
|---|---|---|---|
| 1st | [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | 2 min | Understand where the project is right now |
| 2nd | [JUDGING.md](JUDGING.md) | 3 min | Understand what we're optimizing for |
| 3rd | [TASKS.md](TASKS.md) | 2 min | See what needs to be done |

That's it. You're ready to contribute.

---

## How Team Vector Works

### Our Engineering Philosophy

We don't optimize for writing the most code. We optimize for shipping the best product.

Key principles:

- **Think before coding** — 20-30 seconds of reasoning before any implementation
- **Every feature must improve our judging score** — if it doesn't, we don't build it
- **Documentation is not optional** — a feature without docs is incomplete
- **Simpler is almost always better** — especially in a 48-hour hackathon
- **Protect the timeline** — say no to scope creep

### The Decision Filter

Before building anything:

```
Does this improve our judging score?
├── YES → Build it
├── NO  → Kill it
└── MAYBE → Defer it
```

See [JUDGING.md](JUDGING.md) for the full criteria breakdown.

---

## How AI Is Used

Team Vector uses AI as a **persistent engineering teammate**, not a stateless code generator.

### AI Workflow

```
Understand → Read Context → Judge Filter → Plan → Code → Review → Document → Commit → Next
```

See [AI_WORKFLOW.md](AI_WORKFLOW.md) for the complete process.

### Key Rules for AI Interactions

1. **Always read project context first** — `PROJECT_CONTEXT.md`, `TASKS.md`, `DECISIONS.md`
2. **Never write code immediately** — think, plan, then implement
3. **Run the judging filter** — does this feature improve our score?
4. **Update documentation** — every task updates relevant docs
5. **Log the interaction** — every AI session is logged in `prompts/PROMPTS.md`

### Memory Decision Tree

When a task involves data storage:

| Data Type | Storage Solution | Example |
|---|---|---|
| Current UI state | React State | Form values, selected tab |
| Persistent structured data | Database | User profiles, content |
| AI context that improves over time | Breeth | Preferences, conversation history |

Always explain **why** you chose a storage layer. See [MEMORY_STRATEGY.md](MEMORY_STRATEGY.md).

---

## How Documentation Is Updated

### After Every Task

| Document | Update |
|---|---|
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Current state snapshot |
| [TASKS.md](TASKS.md) | Move task between Kanban columns |
| [prompts/PROMPTS.md](../prompts/PROMPTS.md) | Log the AI interaction |

### When Relevant

| Trigger | Document to Update |
|---|---|
| Architecture changed | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Decision made | [DECISIONS.md](DECISIONS.md) |
| Feature status changed | [FEATURE_MATRIX.md](FEATURE_MATRIX.md) |
| Bug found or fixed | [KNOWN_BUGS.md](KNOWN_BUGS.md) |
| Sponsor integration changed | [SPONSOR_USAGE.md](SPONSOR_USAGE.md) |

---

## Git Workflow

### Branch Naming

```
feature/short-description    # New features
fix/short-description        # Bug fixes
docs/short-description       # Documentation only
refactor/short-description   # Code restructuring
```

Examples:
- `feature/landing-page`
- `fix/api-timeout`
- `docs/update-prd`
- `refactor/component-structure`

### Commit Conventions

We use **Conventional Commits**:

```
type(scope): short description

Types:
  feat     → New feature
  fix      → Bug fix
  docs     → Documentation changes
  style    → Formatting, no logic change
  refactor → Code restructuring
  perf     → Performance improvement
  chore    → Build, config, tooling
```

Examples:
```bash
git commit -m "feat(ui): add landing page hero section"
git commit -m "fix(api): handle timeout on AI endpoint"
git commit -m "docs: update PRD with finalized features"
git commit -m "chore: configure deployment pipeline"
```

### Git Workflow

```
main (protected)
 └── feature/your-feature
      ├── commit: feat(scope): description
      ├── commit: fix(scope): description
      └── → Pull Request → Review → Merge to main
```

**Rules**:
- Never push directly to `main` during active development (use branches)
- Keep commits small and focused
- Write meaningful commit messages
- Pull before pushing to avoid conflicts

---

## Definition of Done

A task is NOT complete until ALL applicable items are checked. See [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) for the full list.

**Quick version**:

- ✅ It works correctly
- ✅ It has loading, error, and empty states
- ✅ It's responsive (320px → 1440px)
- ✅ It's accessible (keyboard nav, ARIA labels)
- ✅ No console errors or TypeScript errors
- ✅ Documentation is updated
- ✅ Commit message follows conventions

---

## Working with Antigravity (AI IDE)

### Setup

The repository includes `.agents/rules/` which automatically configures Antigravity's behavior. When you open this project in Antigravity, it will:

1. Read the project rules automatically
2. Follow the Team Vector engineering workflow
3. Read project context before every task
4. Run the judging filter on feature proposals
5. Update documentation after every change

### How to Ask AI for New Features

**Bad prompt**:
> "Build a login page"

**Good prompt**:
> "I need to implement user authentication. Read PROJECT_CONTEXT.md and ARCHITECTURE.md first. The auth should use Supabase Auth with Google OAuth. Check JUDGING.md to confirm this improves our score. Then implement with loading, error, and empty states. Follow UI_GUIDELINES.md for styling."

**Key patterns**:
1. State what you need
2. Reference relevant docs
3. Specify the approach
4. Mention judging criteria
5. Include UI state requirements

### If Antigravity Goes Off-Track

Say: *"Stop. Read PROJECT_CONTEXT.md and TASKS.md. What is the current project state? What should we be working on?"*

This resets context and brings it back to the plan.

---

## Engineering Standards

### Code

- TypeScript for all application code — strict mode, no `any` without justification
- Components must be reusable — if you copy-paste, refactor
- Follow the design system in [UI_GUIDELINES.md](UI_GUIDELINES.md) — no hardcoded values

### UI

- Mobile-first responsive design (320px, 768px, 1024px, 1440px)
- Every data-driven component needs loading, error, and empty states
- Animations must respect `prefers-reduced-motion`
- All interactive elements need hover, focus, active, and disabled states

### Accessibility

- Keyboard navigation on all interactive elements
- ARIA labels on buttons, inputs, and controls
- Color contrast ≥ 4.5:1 (WCAG AA)
- Semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)
- Visible focus indicators

### Performance

- Bundle size < 200KB gzipped
- Largest Contentful Paint < 2.5s
- No unnecessary re-renders
- Lazy load below-the-fold content

---

## Key Documents Quick Reference

| I need to... | Read this |
|---|---|
| Understand the project | [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) |
| Know what to build next | [TASKS.md](TASKS.md) |
| Check if a feature is worth building | [JUDGING.md](JUDGING.md) |
| Know what NOT to build | [DO_NOT_BUILD.md](DO_NOT_BUILD.md) |
| Follow the AI workflow | [AI_WORKFLOW.md](AI_WORKFLOW.md) |
| Check if a task is done | [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) |
| Style a component | [UI_GUIDELINES.md](UI_GUIDELINES.md) |
| Check the timeline | [HACKATHON_TIMELINE.md](HACKATHON_TIMELINE.md) |
| Log a bug | [KNOWN_BUGS.md](KNOWN_BUGS.md) |
| Record a decision | [DECISIONS.md](DECISIONS.md) |
| Log an AI interaction | [prompts/PROMPTS.md](../prompts/PROMPTS.md) |
| Check the architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Check sponsor requirements | [SPONSOR_USAGE.md](SPONSOR_USAGE.md) |
| Prepare for the demo | [DEMO.md](DEMO.md) |

---

## Emergency Contacts

| Situation | Action |
|---|---|
| Blocked on a feature | Check [TASKS.md](TASKS.md), pick a different task |
| Bug in demo path | Log in [KNOWN_BUGS.md](KNOWN_BUGS.md) as 🔴 Critical, fix immediately |
| Scope creep detected | Check [DO_NOT_BUILD.md](DO_NOT_BUILD.md) and [FEATURE_MATRIX.md](FEATURE_MATRIX.md) |
| Behind schedule | Check [HACKATHON_TIMELINE.md](HACKATHON_TIMELINE.md) emergency protocols |
| Not sure what to work on | Check [TASKS.md](TASKS.md) → Ready column |

---

*Welcome to Team Vector. Let's ship something exceptional. 🚀*

*Last updated: 2026-08-07T04:18:00+05:30*
