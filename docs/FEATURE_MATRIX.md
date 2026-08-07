# 📊 Feature Matrix — Scope Control

> **Purpose**: The scope firewall. When ideas explode, this file keeps the team disciplined.  
> **When to update**: When a feature is proposed, prioritized, started, or cut.  
> **Rule**: If a feature isn't in this matrix, it doesn't exist.

---

## How to Use This Matrix

1. **Before proposing a feature**, add it here first
2. **Score it honestly** against effort, risk, and judge impact
3. **Compare it** to other features — is it worth the time?
4. **If it's below the cut line**, it goes to "Killed Features" — no guilt, no argument

---

## Active Feature Matrix

| # | Feature | Importance (1-5) | Hours Est. | Risk (L/M/H) | Judge Impact (1-5) | Priority | Status |
|---|---|---|---|---|---|---|---|
| F-001 | Core Value Feature | 5 | TBD | M | 5 | P0 | ⏳ Pending |
| F-002 | AI-Powered Feature | 5 | TBD | M | 5 | P0 | ⏳ Pending |
| F-003 | Design System & Polish | 4 | 3-4h | L | 4 | P0 | ⏳ Pending |
| F-004 | Loading/Error/Empty States | 3 | 2-3h | L | 4 | P1 | ⏳ Pending |
| F-005 | Responsive Design | 3 | 2h | L | 3 | P1 | ⏳ Pending |
| F-006 | Sponsor Integration (Breeth) | 3 | 3-4h | M | 3 | P1 | ⏳ Pending |
| F-007 | Demo Data Seeding | 2 | 1h | L | 4 | P1 | ⏳ Pending |
| F-008 | Animations & Micro-interactions | 2 | 2h | L | 3 | P2 | ⏳ Pending |

---

## Scoring Guide

### Importance (1-5)
| Score | Meaning |
|---|---|
| 5 | Product doesn't make sense without it |
| 4 | Significantly better with it |
| 3 | Nice to have, noticeable improvement |
| 2 | Minor improvement |
| 1 | Negligible impact |

### Risk (L/M/H)
| Level | Meaning |
|---|---|
| L | Well-understood, no unknowns |
| M | Some unknowns, manageable with research |
| H | Significant unknowns, could blow up timeline |

### Judge Impact (1-5)
| Score | Meaning |
|---|---|
| 5 | Directly wows judges, visible in demo |
| 4 | Judges will notice and appreciate |
| 3 | Judges may notice if pointed out |
| 2 | Only visible in code review |
| 1 | Invisible to judges |

### Priority
| Level | Rule |
|---|---|
| P0 | Must ship — build first |
| P1 | Should ship — build after P0 is done |
| P2 | Nice to have — only with spare time |
| KILLED | Explicitly cut — do not build |

---

## The Cut Line

**Features below the cut line will NOT be built.**

Draw the cut line based on:
1. Total remaining hours
2. P0 features not yet complete
3. Buffer time needed for polish and demo prep

```
═══════════════════════════════════════════
   ABOVE: Will build     BELOW: Won't build
═══════════════════════════════════════════
```

**Current cut line**: Everything P2 and below is at risk unless P0 and P1 finish early.

---

## Killed Features

*Features explicitly decided against. Recorded here so we don't revisit them.*

| Feature | Reason Killed | Killed Date |
|---|---|---|
| *See `docs/DO_NOT_BUILD.md` for permanent exclusions* | | |

---

## Feature Addition Template

When proposing a new feature, fill this out:

```markdown
| # | Feature | Importance (1-5) | Hours Est. | Risk (L/M/H) | Judge Impact (1-5) | Priority | Status |
| F-XXX | [Name] | X | Xh | X | X | PX | ⏳ Pending |

**Justification**: Why this feature matters.
**Judging criteria it improves**: [Originality / Polish / Technical / AI Steering / Demo]
**What we sacrifice if we build this**: [time taken from other features]
```

---

## Decision Rules

1. **If Importance < 3 AND Judge Impact < 3** → Kill it immediately
2. **If Risk = H AND Hours > 4** → Kill it or radically simplify it
3. **If it doesn't improve any judging criteria** → Kill it
4. **If two features compete for time** → The one with higher Judge Impact wins
5. **Never start a P2 feature if any P0 feature is incomplete**

---

*Last updated: 2026-08-07T04:05:00+05:30*
