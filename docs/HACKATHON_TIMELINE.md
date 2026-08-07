# ⏱️ Hackathon Timeline — 48-Hour Sprint Plan

> **Purpose**: Hour-by-hour battle plan for the hackathon. Know what to do at every moment.  
> **When to update**: When milestones shift, we fall behind, or priorities change.  
> **Rule**: Check this file every 4 hours. If we're behind, cut scope — don't extend hours.

---

## Timeline Overview

```
Hour 0                    Hour 12                   Hour 24
│█████████████████████████│█████████████████████████│
│ IDEA │ ARCH │  CORE FEATURES SPRINT              │
│      │      │                                     │

Hour 24                   Hour 36                   Hour 48
│█████████████████████████│█████████████████████████│
│    FEATURES CONTINUED   │ POLISH │ DEMO │ SUBMIT │
│                         │        │      │        │
```

---

## Detailed Hour-by-Hour Plan

### Phase 1: Foundation (Hours 0–2) 🏁

**Goal**: Idea locked, PRD written, architecture decided.

| Hour | Activity | Output | Owner |
|---|---|---|---|
| 0:00 | Problem statement released → Read & discuss | Understanding | Team |
| 0:30 | Brainstorm ideas (timeboxed!) | 3-5 candidate ideas | Team |
| 1:00 | Select idea → Apply judging filter | Winning idea chosen | Team |
| 1:15 | Write PRD (update `docs/PRD.md`) | Complete PRD | AI + Human |
| 1:30 | High-level architecture (update `docs/ARCHITECTURE.md`) | Architecture decided | AI + Human |
| 1:45 | Update `docs/FEATURE_MATRIX.md` with features | Prioritized features | AI + Human |
| 2:00 | **Checkpoint**: PRD, Architecture, Features locked ✅ | | |

**Risks at this phase**:
- ⚠️ Spending too long on ideation → Timebox to 30 minutes
- ⚠️ Choosing a too-complex idea → Apply `DO_NOT_BUILD.md` filter

---

### Phase 2: Architecture & Setup (Hours 2–6) 🏗️

**Goal**: Development environment running, design system in place, core structure built.

| Hour | Activity | Output | Owner |
|---|---|---|---|
| 2:00 | Initialize framework (Next.js / Vite) | Running dev server | AI |
| 2:30 | Set up design system (tokens, fonts, base CSS) | `UI_GUIDELINES.md` implemented | AI |
| 3:00 | Create component library (Button, Input, Card, Layout) | Reusable primitives | AI |
| 3:30 | Set up database & schema (if needed) | Database connected | AI |
| 4:00 | Set up API structure & types | API routes scaffolded | AI |
| 4:30 | Set up AI integration service | AI API connected | AI |
| 5:00 | Set up Breeth integration (if applicable) | Memory layer connected | AI |
| 5:30 | Landing page / main layout | Visible product shell | AI |
| 6:00 | **Checkpoint**: Can navigate the app, components work ✅ | | |

**Risks at this phase**:
- ⚠️ Over-engineering the setup → Keep it minimal, iterate later
- ⚠️ Dependency issues → Use proven, well-documented libraries only

---

### Phase 3: Core Features (Hours 6–20) 💻

**Goal**: P0 features complete and working end-to-end.

| Hour | Activity | Output | Owner |
|---|---|---|---|
| 6:00 | Start P0 Feature 1 (core value proposition) | | AI + Human |
| 10:00 | **4-hour checkpoint**: Feature 1 should be working | Feature 1 MVP | |
| 10:00 | Start P0 Feature 2 (AI-powered feature) | | AI + Human |
| 14:00 | **4-hour checkpoint**: Feature 2 should be working | Feature 2 MVP | |
| 14:00 | Integration testing — do features work together? | | AI + Human |
| 16:00 | Fix integration issues, edge cases | Stable core flow | |
| 16:00 | Start P1 features (if P0 complete) | | AI + Human |
| 20:00 | **Checkpoint**: Core product works end-to-end ✅ | | |

**Risks at this phase**:
- ⚠️ Feature taking longer than estimated → Cut scope, ship the MVP version
- ⚠️ Getting stuck on a bug → 30-minute timebox, then workaround
- ⚠️ Scope creep → Check `FEATURE_MATRIX.md` before adding anything

---

### Phase 4: Remaining Features (Hours 20–36) 🔧

**Goal**: P1 features complete, sponsor integration solid, app is feature-complete.

| Hour | Activity | Output | Owner |
|---|---|---|---|
| 20:00 | Continue P1 features | | AI + Human |
| 24:00 | **HALFWAY CHECKPOINT** 🚨 | | |
| | → All P0 features must be done | | |
| | → Demo path must work | | |
| | → If P0 not done, STOP everything else and finish P0 | | |
| 24:00 | Sponsor integration finalized | Breeth working (if used) | AI + Human |
| 28:00 | P1 features complete | | AI + Human |
| 32:00 | Loading/error/empty states for all views | UI states complete | AI |
| 34:00 | Responsive design pass | Mobile works | AI |
| 36:00 | **Checkpoint**: Feature-complete, all states handled ✅ | | |

**Risks at this phase**:
- ⚠️ Halfway checkpoint reveals P0 incomplete → All hands on P0
- ⚠️ Sponsor tech doesn't work → Remove it rather than force it

---

### Phase 5: Polish (Hours 36–44) ✨

**Goal**: The product feels premium. Every detail is intentional.

| Hour | Activity | Output | Owner |
|---|---|---|---|
| 36:00 | Animations & micro-interactions | Smooth UI | AI |
| 37:00 | Typography & spacing audit | Consistent design | AI |
| 38:00 | Accessibility audit (ARIA, keyboard, focus) | Accessible app | AI |
| 39:00 | Performance audit (Lighthouse, bundle size) | Fast app | AI |
| 40:00 | Content pass — replace all placeholder text | Real content | Human |
| 41:00 | Bug bash — test every feature, every screen | `KNOWN_BUGS.md` updated | Team |
| 42:00 | Fix critical and high bugs only | Stable app | AI |
| 43:00 | Seed demo data | Realistic demo | AI + Human |
| 44:00 | **Checkpoint**: Product is polished and demo-ready ✅ | | |

**Risks at this phase**:
- ⚠️ Temptation to add features → STOP. Polish only. See `DO_NOT_BUILD.md`.
- ⚠️ Finding too many bugs → Only fix demo-path bugs

---

### Phase 6: Demo & Submission (Hours 44–48) 🎬

**Goal**: Demo is rehearsed, submission is complete, we're confident.

| Hour | Activity | Output | Owner |
|---|---|---|---|
| 44:00 | Deploy to production | Live URL | AI |
| 44:30 | Test production deployment | Everything works live | Team |
| 45:00 | Write/update demo script (`docs/DEMO.md`) | Rehearsal-ready script | Human |
| 45:30 | Demo rehearsal #1 | Timing confirmed | Team |
| 46:00 | Fix any issues found during rehearsal | | AI |
| 46:30 | Demo rehearsal #2 | Smooth delivery | Team |
| 47:00 | Record backup demo video | `assets/demo/` | Team |
| 47:15 | Take final screenshots | `assets/screenshots/` | Team |
| 47:30 | Final documentation pass | All docs current | AI |
| | → `PROJECT_CONTEXT.md` updated | | |
| | → `PROMPTS.md` complete | | |
| | → `SPONSOR_USAGE.md` complete | | |
| | → `FEATURE_MATRIX.md` finalized | | |
| | → `README.md` written | | |
| 48:00 | **SUBMIT** 🚀 | | |

**Risks at this phase**:
- ⚠️ Production deployment fails → Have a Vercel/Netlify backup
- ⚠️ Demo rehearsal reveals issues → Fix only critical, skip cosmetic
- ⚠️ Running out of time → Submit what you have. Something > nothing.

---

## Checkpoint Summary

| Hour | Checkpoint | Must Be True |
|---|---|---|
| 2 | Foundation | PRD, architecture, features locked |
| 6 | Setup | Dev environment running, components built |
| 10 | Feature 1 | Core feature working |
| 14 | Feature 2 | AI feature working |
| 20 | Core | Product works end-to-end |
| 24 | **HALFWAY** | **All P0 done, demo path works** |
| 36 | Feature-complete | All planned features done, states handled |
| 44 | Polish-complete | Product feels premium |
| 48 | **SUBMIT** | **Everything shipped** |

---

## Emergency Protocols

| Situation | Action |
|---|---|
| Behind by 2+ hours | Cut the lowest-priority P1 feature |
| Behind by 4+ hours | Cut ALL P1 features, focus on P0 polish |
| P0 feature broken at hour 24 | All hands on fixing it. Nothing else matters. |
| Can't deploy at hour 44 | Use Vercel CLI, Railway, or even GitHub Pages |
| Demo rehearsal is a disaster | Simplify the demo. Show fewer features, show them well. |

---

*Last updated: 2026-08-07T04:05:00+05:30*
