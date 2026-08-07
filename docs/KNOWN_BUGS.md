# 🐛 Known Bugs

> **Purpose**: Single source of truth for all bugs. No Discord messages, no mental notes — everything goes here.  
> **When to update**: Immediately when a bug is found. Update status when fixed.  
> **Rule**: If it's not in this file, it doesn't exist as a tracked issue.

---

## Active Bugs

| ID | Severity | Description | Found | Assigned | Status | Fix |
|---|---|---|---|---|---|---|
| *No bugs yet — project is in scaffolding phase* | | | | | | |

---

## Severity Levels

| Severity | Meaning | Action |
|---|---|---|
| 🔴 **Critical** | App crashes, data loss, security issue | Fix immediately — drop everything |
| 🟠 **High** | Feature broken, bad user experience | Fix before next demo checkpoint |
| 🟡 **Medium** | Annoying but workaround exists | Fix when time permits |
| 🟢 **Low** | Cosmetic, edge case, minor annoyance | Fix only if nothing else to do |
| ⚪ **Won't Fix** | Known issue, accepted risk | Document why and move on |

---

## Bug Triage Rules

1. **🔴 Critical bugs block all other work.** Stop, fix, verify, move on.
2. **🟠 High bugs get 30 minutes max.** If you can't fix it in 30 minutes, create a workaround and move on.
3. **🟡 Medium bugs go to backlog.** Only fix if P0 and P1 features are complete.
4. **🟢 Low bugs are logged, not fixed.** Unless they're visible during the demo.
5. **Any bug visible during the demo path is automatically upgraded to 🟠 High.**

---

## Bug Report Template

```markdown
| ID | Severity | Description | Found | Assigned | Status | Fix |
| BUG-XXX | 🔴/🟠/🟡/🟢 | Brief description of the bug | YYYY-MM-DD | AI/Human/Unassigned | Open/In Progress/Fixed/Won't Fix | Brief description of the fix |

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: [Chrome / Firefox / Safari]
- Device: [Desktop / Mobile / Tablet]
- Screen size: [dimensions]

### Screenshots
[If applicable]

### Workaround
[If known]
```

---

## Demo Path Bugs

**These are the highest priority.** Any bug in the demo path is an automatic 🔴 Critical.

The demo path includes:
1. Landing page load
2. Primary user action
3. AI-powered feature
4. Result/output display
5. Any feature shown to judges

| ID | Screen | Description | Status |
|---|---|---|---|
| *No demo path bugs — demo path not yet defined* | | | |

---

## Fixed Bugs Archive

| ID | Severity | Description | Found | Fixed | Root Cause | Prevention |
|---|---|---|---|---|---|---|
| *No fixed bugs yet* | | | | | | |

---

## Best Practices

1. **Log immediately** — Don't think "I'll remember this." You won't.
2. **Be specific** — "Button doesn't work" is useless. "Submit button on /create page returns 500 when title is empty" is useful.
3. **Include reproduction steps** — If you can't reproduce it, you can't fix it.
4. **Track the root cause** — After fixing, document WHY it happened to prevent recurrence.
5. **Don't hide bugs** — Honesty during judging Q&A is better than getting caught.

---

*Last updated: 2026-08-07T04:05:00+05:30*
