# ⭐ Judging Criteria — North Star

> **Purpose**: The single most important document in this repo. Every feature, every line of code, every design decision must pass through this filter.  
> **When to update**: When judging criteria are clarified, weights change, or new evaluation details emerge.  
> **Rule**: Before building anything, ask — *"Does this improve our judging score?"*

---

## The Filter

Before every feature, task, or design decision, run it through this:

```
┌─────────────────────────────────────────────┐
│     Does this improve our judging score?    │
│                                             │
│              YES  →  Build it               │
│              NO   →  Kill it                │
│           MAYBE   →  Defer it               │
└─────────────────────────────────────────────┘
```

If you can't clearly articulate which judging criteria a feature improves, **don't build it.**

---

## Judging Criteria Breakdown

### 1. 🎨 Originality (Weight: HIGH)

**What judges look for**: A unique idea or a fresh angle on an existing problem. Something they haven't seen 50 times before.

| Signal | Strong | Weak |
|---|---|---|
| Problem framing | "We noticed X and approached it from Y angle" | "We built another to-do app" |
| Technical approach | Novel use of AI / memory / data | Standard CRUD wrapper |
| User insight | Deep understanding of the user's real pain | Surface-level assumption |
| Differentiation | Clear answer to "how is this different?" | "We used AI" |

**How to score high**:
- Identify a non-obvious problem or a surprising intersection of ideas
- Show that the AI isn't just a feature — it fundamentally changes how the product works
- Have a compelling "why now?" narrative

**Self-assessment questions**:
- [ ] Can I explain the product in one sentence and get a "that's interesting" reaction?
- [ ] Is there a clear "insight" behind the product, not just a "technology"?
- [ ] Would this idea surprise a judge who's seen 20 other demos today?

---

### 2. ✨ Polish (Weight: HIGH)

**What judges look for**: Attention to detail. The difference between a prototype and a product. The "feel" of quality.

| Signal | Strong | Weak |
|---|---|---|
| UI quality | Consistent design system, smooth animations | Default browser styles, jerky transitions |
| Error handling | Friendly error messages, graceful degradation | Raw stack traces, crashed pages |
| Loading states | Skeleton screens, spinners, progress indicators | Blank screens, frozen UI |
| Empty states | Helpful guidance, inviting illustrations | "No data found" |
| Micro-interactions | Hover effects, transitions, toast notifications | Static, unresponsive UI |
| Copy/text | Clear, consistent, professional | Lorem ipsum, typos, "test123" |
| Responsive | Works beautifully on mobile AND desktop | Broken on mobile |

**How to score high**:
- Implement a design system from day one (see `docs/UI_GUIDELINES.md`)
- Every interactive element has hover, focus, active, and disabled states
- No raw error messages visible to the user
- Animations are smooth and purposeful (not decorative)
- Typography, spacing, and colors are consistent throughout

**Self-assessment questions**:
- [ ] If a judge opens the app on their phone, does it look good?
- [ ] Are there any "default browser style" elements visible?
- [ ] Do all buttons, inputs, and links have hover/focus states?
- [ ] Is there a single consistent design language across all pages?
- [ ] Would I be embarrassed if a judge sees any screen in the app?

---

### 3. 🔧 Technical Execution (Weight: MEDIUM-HIGH)

**What judges look for**: Clean code, sound architecture, and meaningful use of technology. Not the most code — the best code.

| Signal | Strong | Weak |
|---|---|---|
| Architecture | Clear separation of concerns, typed interfaces | Spaghetti code, no structure |
| Type safety | Strict TypeScript, no `any` | JavaScript or loose types |
| Error handling | Try/catch, error boundaries, fallbacks | Unhandled exceptions |
| Code organization | Feature-based folders, reusable components | Single 2000-line file |
| Performance | Optimized bundles, lazy loading | Massive initial load |
| Security | Input validation, env var management | Exposed API keys |
| Testing | At least core flows tested | Zero tests |

**How to score high**:
- Clean, readable code > clever code
- TypeScript strict mode
- Consistent patterns across the codebase
- Meaningful component abstraction (not over-engineered)
- Production-ready error handling

**Self-assessment questions**:
- [ ] Would I be comfortable showing the codebase to a senior engineer?
- [ ] Are there any `console.log` statements left in production?
- [ ] Is the code organized by feature, not by file type?
- [ ] Are all API keys in environment variables?
- [ ] Can I explain any architectural decision if asked?

---

### 4. 🤖 AI Steering (Weight: HIGH)

**What judges look for**: Thoughtful, intentional use of AI throughout the development process. Not "we generated everything with ChatGPT" — but "we used AI as a skilled collaborator."

| Signal | Strong | Weak |
|---|---|---|
| Process documentation | Detailed PROMPTS.md with timestamps | "We used AI" |
| Prompt quality | Specific, contextual, iterative | "Build me an app" |
| AI in product | Meaningful AI feature that adds real value | AI as a gimmick / wrapper |
| Iteration | Evidence of refining AI output | Copy-paste from first response |
| Human judgment | Humans made product decisions, AI implemented | AI made all decisions |

**How to score high**:
- Maintain `prompts/PROMPTS.md` religiously — every interaction logged
- Show the AI workflow: plan → implement → review → iterate
- AI in the product should solve a real problem, not just be impressive tech
- Show that humans steered the AI, not the other way around
- Reference `docs/AI_WORKFLOW.md` for the documented process

**Self-assessment questions**:
- [ ] Can I show judges our PROMPTS.md and they'd be impressed by the process?
- [ ] Is the AI feature in the product solving a real user problem?
- [ ] Did we iterate on AI outputs, or accept the first response?
- [ ] Can I articulate why we used AI for specific tasks and not others?
- [ ] Is our AI usage documented well enough to reproduce?

---

### 5. 🎬 Demo Experience (Weight: HIGH)

**What judges look for**: A smooth, compelling, well-rehearsed demo that tells a story. The demo IS the product to judges.

| Signal | Strong | Weak |
|---|---|---|
| Opening | Problem statement that hooks attention | "Hi, we're Team X, we built Y" |
| Flow | Smooth, rehearsed, no fumbling | Clicking around randomly |
| Narrative | Story arc: problem → solution → impact | Feature tour with no context |
| Technical depth | Brief but impressive architecture mention | No technical discussion |
| Closing | Strong, memorable final statement | Trails off, "that's about it" |
| Contingency | Backup video/screenshots ready | Panics when WiFi drops |
| Timing | Hits every beat within time limit | Runs over or ends too early |

**How to score high**:
- Practice the demo at least 3 times before presenting
- Lead with the problem, not the solution
- Pre-load all data so nothing loads during the demo
- Have a backup recording in `assets/demo/`
- See `docs/DEMO.md` for the full script

**Self-assessment questions**:
- [ ] Have we rehearsed the demo at least 3 times?
- [ ] Does the demo tell a story, not just show features?
- [ ] Is there a backup plan if the live demo fails?
- [ ] Can we complete the demo within the time limit?
- [ ] Does the demo end with a strong, memorable statement?

---

## Judging Scorecard — Self-Evaluation

Fill this out before submission. Be brutally honest.

| Criteria | Score (1-10) | Evidence | Improvement Possible? |
|---|---|---|---|
| Originality | /10 | | |
| Polish | /10 | | |
| Technical Execution | /10 | | |
| AI Steering | /10 | | |
| Demo Experience | /10 | | |
| **Overall** | **/50** | | |

### Score Interpretation

| Total | Assessment |
|---|---|
| 40-50 | 🏆 Strong contender for Top 3 |
| 30-39 | 🥈 Competitive, needs polish |
| 20-29 | ⚠️ Missing key areas |
| < 20 | 🚨 Major gaps to address |

---

## Feature Decision Filter

Use this table when deciding whether to build a feature:

| Feature | Originality | Polish | Technical | AI Steering | Demo Impact | **BUILD?** |
|---|---|---|---|---|---|---|
| *Example: Animated loading states* | 0 | +3 | +1 | 0 | +2 | ✅ YES |
| *Example: Admin dashboard* | 0 | 0 | +1 | 0 | -1 | ❌ NO |
| *Example: AI memory personalization* | +2 | +1 | +2 | +3 | +3 | ✅ YES |

---

*Last updated: 2026-08-07T04:05:00+05:30*
