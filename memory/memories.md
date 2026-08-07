# 💾 Memory Entries Log

> **Purpose**: Track all memories stored during development and testing. Useful for debugging memory behavior and preparing demo scenarios.  
> **When to update**: When memories are created, modified, or deleted during testing or production use.

---

## Overview

This file logs notable memory entries for debugging, demo preparation, and quality assurance. It is **not** a replacement for the actual Breeth storage — it's a human-readable reference.

---

## Memory Entries

### Template

```markdown
#### MEM-XXX: [Brief Description]

| Field | Value |
|---|---|
| **ID** | mem_xxx |
| **Type** | episodic / semantic / procedural / preference / feedback |
| **User** | user_xxx |
| **Source** | user_explicit / ai_inferred / system_generated / feedback |
| **Importance** | 0.0 - 1.0 |
| **Created** | YYYY-MM-DDTHH:MM:SS |
| **Expires** | YYYY-MM-DDTHH:MM:SS or Never |
| **Status** | Active / Expired / Deleted |

**Content**:
> The actual memory content stored.

**Tags**: `tag1`, `tag2`, `tag3`

**Notes**: Why this memory was stored, how it was used, any observations.
```

---

## Demo Memories

*Pre-configure these memories for the live demo to show memory working immediately.*

> **Important**: Before the demo, seed these memories so the product demonstrates personalization from the first interaction.

#### MEM-DEMO-001: [Example Preference]

| Field | Value |
|---|---|
| **ID** | mem_demo_001 |
| **Type** | preference |
| **User** | demo_user |
| **Source** | user_explicit |
| **Importance** | 0.9 |
| **Created** | 2026-08-07T12:00:00+05:30 |
| **Expires** | Never |
| **Status** | Active |

**Content**:
> [Example: "User prefers visual explanations with diagrams over text-heavy responses."]

**Tags**: `demo`, `preference`, `style`

**Notes**: Pre-seeded for demo. Shows the product remembering user preferences.

---

#### MEM-DEMO-002: [Example Context]

| Field | Value |
|---|---|
| **ID** | mem_demo_002 |
| **Type** | semantic |
| **User** | demo_user |
| **Source** | ai_inferred |
| **Importance** | 0.7 |
| **Created** | 2026-08-07T12:05:00+05:30 |
| **Expires** | Never |
| **Status** | Active |

**Content**:
> [Example: "User is working on a React project and is at an intermediate skill level."]

**Tags**: `demo`, `context`, `skill-level`

**Notes**: Pre-seeded for demo. Shows the AI adapting to user's skill level.

---

## Memory Statistics

*Update these during development and testing.*

| Metric | Value |
|---|---|
| Total memories stored | 0 |
| Episodic memories | 0 |
| Semantic memories | 0 |
| Procedural memories | 0 |
| Preference memories | 0 |
| Feedback memories | 0 |
| Memories expired | 0 |
| Memories deleted | 0 |
| Avg importance score | N/A |
| Avg retrieval time | N/A |

---

## Observations & Learnings

Track patterns and insights about memory usage:

| Date | Observation | Action Taken |
|---|---|---|
| — | No observations yet | — |

---

## Best Practices for Memory Logging

1. **Log demo memories first** — Seed realistic data before the demo
2. **Track retrieval patterns** — Which memories are actually useful?
3. **Monitor storage rate** — Are we storing too much or too little?
4. **Review expired memories** — Is the TTL appropriate?
5. **Test edge cases** — What happens with contradictory memories?

---

*Last updated: 2026-08-07T03:54:00+05:30*
