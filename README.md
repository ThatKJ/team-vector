# 🚀 Team Vector — ViCodathon 2026

> **A 48-hour AI-first vibe coding hackathon submission by Team Vector.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 What Is This?

This repository is Team Vector's submission for **ViCodathon 2026**. It contains:

1. **A complete project operating system** — documentation, workflows, and engineering standards that drive every decision
2. **The application source code** — built during the 48-hour competition *(coming soon)*
3. **AI usage logs** — transparent documentation of how AI was used throughout development

The product idea will be finalized once the hackathon problem statement is released.

---

## 📁 Repository Structure

```
team-vector-vicodathon-2026/
│
├── .agents/                  # AI agent rules (auto-loaded by Antigravity)
│   └── rules/                # Always-on behavioral rules for AI
│
├── docs/                     # 📚 Project documentation (17 files)
│   ├── PROJECT_CONTEXT.md    # ⭐ START HERE — current project state
│   ├── AGENT_RULES.md        # AI behavioral contract
│   ├── AI_WORKFLOW.md        # How Team Vector uses AI
│   ├── ARCHITECTURE.md       # System design & component hierarchy
│   ├── DECISIONS.md          # Decision log with rationale
│   ├── DEFINITION_OF_DONE.md # Completion checklist
│   ├── DEMO.md               # Demo script with timing
│   ├── DO_NOT_BUILD.md       # Scope firewall — features we won't build
│   ├── FEATURE_MATRIX.md     # Feature prioritization matrix
│   ├── HACKATHON_TIMELINE.md # Hour-by-hour 48h sprint plan
│   ├── JUDGING.md            # ⭐ North star — judging criteria
│   ├── KNOWN_BUGS.md         # Bug tracker
│   ├── MEMORY_STRATEGY.md    # Breeth integration strategy
│   ├── PRD.md                # Product requirements document
│   ├── SPONSOR_USAGE.md      # Sponsor technology tracker
│   ├── TASKS.md              # Kanban task board
│   ├── TEAM_ONBOARDING.md    # 👋 New teammate? Start here.
│   └── UI_GUIDELINES.md      # Design system tokens
│
├── prompts/                  # 🤖 AI usage logs & prompt templates
│   ├── PROMPTS.md            # AI interaction log (judging evidence)
│   ├── planning.md           # Planning prompt templates
│   ├── frontend.md           # Frontend prompt templates
│   ├── backend.md            # Backend prompt templates
│   ├── review.md             # Code review prompt templates
│   ├── debugging.md          # Debugging prompt templates
│   └── deployment.md         # Deployment prompt templates
│
├── memory/                   # 🧠 Memory layer documentation
│   ├── schema.md             # Memory data structures
│   ├── agents.md             # In-product AI agent specs
│   ├── breeth.md             # Breeth integration guide
│   └── memories.md           # Memory entries log
│
├── assets/                   # 🎨 Static assets
│   ├── branding/             # Logos, icons, favicons
│   ├── screenshots/          # App screenshots for submission
│   └── demo/                 # Demo recordings & backup video
│
├── src/                      # 💻 Application source (created during hackathon)
│
├── .gitignore                # Git ignore rules
├── .env.example              # Environment variable template
├── LICENSE                   # MIT License
└── README.md                 # You are here
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm**
- **Git**
- An AI-capable IDE (Antigravity recommended)

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/ThatKJ/team-vector-vicodathon-2026.git
cd team-vector-vicodathon-2026

# Copy environment template
cp .env.example .env.local
# Fill in your API keys in .env.local

# Install dependencies (when application is initialized)
# npm install

# Start development server (when application is initialized)
# npm run dev
```

### First Steps for New Teammates

1. **Read** [`docs/TEAM_ONBOARDING.md`](docs/TEAM_ONBOARDING.md) — complete onboarding guide
2. **Skim** [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) — current project state
3. **Review** [`docs/JUDGING.md`](docs/JUDGING.md) — what we're optimizing for
4. **Check** [`docs/TASKS.md`](docs/TASKS.md) — what needs to be done

---

## 📋 Documentation Overview

### Essential Documents (Read First)

| Document | Purpose | Priority |
|---|---|---|
| [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Current project state — read before every session | ⭐⭐⭐⭐⭐ |
| [JUDGING.md](docs/JUDGING.md) | North star — every decision filters through this | ⭐⭐⭐⭐⭐ |
| [TASKS.md](docs/TASKS.md) | What to work on next | ⭐⭐⭐⭐⭐ |
| [TEAM_ONBOARDING.md](docs/TEAM_ONBOARDING.md) | How to get started | ⭐⭐⭐⭐⭐ |

### Engineering References

| Document | Purpose |
|---|---|
| [AI_WORKFLOW.md](docs/AI_WORKFLOW.md) | How we use AI — the cardinal rule and task workflow |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, folder structure, component hierarchy |
| [DEFINITION_OF_DONE.md](docs/DEFINITION_OF_DONE.md) | When is a task truly complete? |
| [UI_GUIDELINES.md](docs/UI_GUIDELINES.md) | Design tokens — colors, typography, spacing, animations |
| [DO_NOT_BUILD.md](docs/DO_NOT_BUILD.md) | Scope firewall — features we will NOT build |

### Product & Strategy

| Document | Purpose |
|---|---|
| [PRD.md](docs/PRD.md) | Product requirements (TBD — awaiting problem statement) |
| [FEATURE_MATRIX.md](docs/FEATURE_MATRIX.md) | Feature prioritization with scoring |
| [HACKATHON_TIMELINE.md](docs/HACKATHON_TIMELINE.md) | Hour-by-hour sprint plan |
| [DEMO.md](docs/DEMO.md) | Demo script with timing and contingency |
| [DECISIONS.md](docs/DECISIONS.md) | Decision log with rationale |

### AI & Memory

| Document | Purpose |
|---|---|
| [MEMORY_STRATEGY.md](docs/MEMORY_STRATEGY.md) | When and how to use Breeth |
| [SPONSOR_USAGE.md](docs/SPONSOR_USAGE.md) | Sponsor technology integration tracker |
| [PROMPTS.md](prompts/PROMPTS.md) | AI usage log — evidence for judges |

---

## 🔄 Workflow Overview

```
Understand → Read Context → Judge Filter → Plan → Code → Review → Document → Commit → Next Task
```

**The Cardinal Rule**: Never write code immediately. Think for 20-30 seconds. Produce a plan. Only then implement.

See [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md) for the full process.

---

## 👥 Team

| Role | Member | Responsibilities |
|---|---|---|
| Team Lead | TBD | Product decisions, demo delivery, scope management |
| Frontend Engineer | TBD | UI components, design system, responsiveness |
| Backend Engineer | TBD | API routes, database, AI integration |
| AI Engineer | TBD | Prompt engineering, Breeth integration, AI features |

---

## 📊 Current Status

| Metric | Value |
|---|---|
| Phase | Phase 1 — Foundation Complete |
| Documentation | ✅ 17 docs, 5,000+ lines |
| Application | ⏳ Awaiting product idea |
| Deployment | ⏳ Not yet |
| Demo | ⏳ Script template ready |

---

## 🤝 Contributing

1. Read [`docs/TEAM_ONBOARDING.md`](docs/TEAM_ONBOARDING.md)
2. Check [`docs/TASKS.md`](docs/TASKS.md) for available work
3. Follow the workflow in [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md)
4. Review against [`docs/DEFINITION_OF_DONE.md`](docs/DEFINITION_OF_DONE.md)
5. Use conventional commits (see onboarding doc)

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

*Built with 🧠 by Team Vector for ViCodathon 2026*
