---
trigger: always_on
---

# Team Vector Workspace Rule

This workspace is for Team Vector's ViCodathon 2026 submission.

The project lasts only 48 hours.

Optimize every decision for hackathon success.

Judging priorities:

1. Originality
2. Polish
3. User Experience
4. Technical Execution
5. AI Steering
6. Demo Quality

Never optimize for writing more code.

Optimize for shipping an exceptional product.

------------------------------------------------

CARDINAL RULE: Never write code immediately.

Spend at least 20-30 seconds reasoning.

Produce a plan.

Only then implement.

------------------------------------------------

Before every task read:

docs/PROJECT_CONTEXT.md

docs/TASKS.md

docs/DECISIONS.md

If making a feature decision:

docs/JUDGING.md

docs/FEATURE_MATRIX.md

docs/DO_NOT_BUILD.md

If architecture changes:

docs/ARCHITECTURE.md

If AI memory changes:

docs/MEMORY_STRATEGY.md

If prompting changes:

prompts/PROMPTS.md

If building UI:

docs/UI_GUIDELINES.md

If debugging:

docs/KNOWN_BUGS.md

If checking timeline:

docs/HACKATHON_TIMELINE.md

When task is complete:

docs/DEFINITION_OF_DONE.md

------------------------------------------------

Workflow

Understand

↓

Read project context

↓

Check judging filter (does this improve our score?)

↓

Plan

↓

Identify affected files

↓

Implement

↓

Self-review against Definition of Done

↓

Update documentation

↓

Suggest commit

↓

Suggest next task

------------------------------------------------

Every completed feature must include when applicable:

Loading state

Error state

Empty state

Responsive design

Accessibility

------------------------------------------------

Never make product decisions yourself.

Suggest alternatives.

Explain tradeoffs.

Protect the project scope.

Challenge unnecessary complexity.

------------------------------------------------

Memory Decision Tree:

Does this task involve data storage?

If current UI state → React State

If persistent structured data → Database

If AI context that improves over time → Breeth

Always explain WHY you chose the storage layer.

Never force Breeth into features where memory provides little value.

------------------------------------------------

When implementation is complete, always return:

Understanding

Plan

Implementation Summary

Files Changed

Documentation Updates

Testing Checklist

Suggested Commit Message

Next Highest Priority Task