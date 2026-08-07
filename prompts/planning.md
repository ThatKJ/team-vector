# 🗺️ Planning Prompts

> **Purpose**: Templates and strategies for using AI during planning and architecture phases.  
> **When to use**: Before starting a new feature, refactoring, or making a significant architectural decision.

---

## When to Use Planning Prompts

- Starting a new feature or epic
- Evaluating technology choices
- Designing database schemas
- Planning API routes
- Structuring component hierarchies
- Estimating effort and identifying risks

---

## Prompt Templates

### 1. Feature Planning

```
I need to implement [feature name] for our hackathon project.

Context:
- Product: [brief description]
- Stack: [current technology stack]
- Time remaining: [hours left]
- Dependencies: [what this feature depends on]

Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]

Please provide:
1. Implementation plan with steps
2. Files to create or modify
3. Estimated time per step
4. Potential risks or blockers
5. Simpler alternatives if the feature is too complex
```

### 2. Architecture Review

```
Review the following architecture decision for our hackathon project:

Decision: [what we're considering]
Context: [why we need to decide]
Options:
A) [option A with brief description]
B) [option B with brief description]
C) [option C with brief description]

Constraints:
- 48-hour hackathon timeline
- Team of [N] developers
- Need to demo to judges

Please evaluate each option on:
1. Implementation speed
2. Reliability
3. Demo-ability
4. Scalability (post-hackathon)
5. Risk level
```

### 3. Scope Check

```
We're considering adding [feature/scope item] to our hackathon project.

Current state:
- Hours remaining: [N]
- Core features completed: [list]
- Core features pending: [list]

Questions:
1. Is this essential for a winning demo?
2. Can we achieve the same impact with a simpler approach?
3. What's the minimum viable version of this feature?
4. What's the risk of this derailing our timeline?
```

### 4. Sprint Planning

```
We have [N] hours remaining in the hackathon.

Completed:
- [list of completed items]

Remaining backlog:
- [list of remaining items with priority]

Please help me:
1. Prioritize the remaining items
2. Identify what can be cut without hurting the demo
3. Create a time-boxed plan for the remaining hours
4. Flag anything that's too risky to attempt
```

---

## Best Practices

1. **Always include context** — The AI needs to know the project state, time constraints, and goals.
2. **Ask for alternatives** — Planning prompts should explore options, not just validate your first idea.
3. **Include constraints** — Time, team size, and technical limitations shape the plan.
4. **Request risk assessment** — Every plan should identify what could go wrong.
5. **Think in demos** — Every planning decision should consider "how does this look in the demo?"

---

## Anti-Patterns

- ❌ Planning without reading `PROJECT_CONTEXT.md` first
- ❌ Asking AI to plan without providing constraints
- ❌ Planning for features that won't be demoed
- ❌ Over-planning at the expense of execution
- ❌ Planning in isolation without updating `TASKS.md`

---

*Last updated: 2026-08-07T03:54:00+05:30*
