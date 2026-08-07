# 🔍 Review Prompts

> **Purpose**: Templates for using AI to review code quality, architecture, and user experience.  
> **When to use**: After implementing a feature, before merging, or during periodic quality checks.

---

## Prompt Templates

### 1. Code Review

```
Review the following code for quality, correctness, and hackathon readiness.

File: [path/to/file]
Purpose: [what this code does]

Review criteria:
1. Correctness — Does it work as intended?
2. TypeScript — Are types complete and accurate? Any `any` types?
3. Error handling — Are all failure modes handled?
4. Accessibility — Are interactive elements accessible?
5. Performance — Any obvious performance issues?
6. Security — Any input validation or injection risks?
7. Readability — Is the code clean and self-documenting?
8. Duplication — Does this duplicate logic from elsewhere?

Please provide:
- Issues found (categorized by severity: Critical / Warning / Suggestion)
- Specific line-level feedback
- Recommended fixes
```

### 2. UX Review

```
Review the user experience of [feature/page].

Context:
- Target user: [persona]
- User goal: [what they're trying to do]
- Current flow: [describe the flow]

Review for:
1. Intuitiveness — Can a first-time user figure it out?
2. Feedback — Does the UI respond to every user action?
3. Error recovery — What happens when things go wrong?
4. Loading states — Are async operations communicated?
5. Empty states — What does the user see with no data?
6. Mobile experience — Does it work on small screens?
7. Accessibility — Can it be used without a mouse?

Please provide:
- Issues found
- Improvement suggestions
- Priority ranking
```

### 3. Pre-Demo Review

```
Review the entire application for demo readiness.

Check:
1. No console errors or warnings
2. No broken links or missing images
3. All features work end-to-end on the happy path
4. Loading states appear during async operations
5. Error states are user-friendly (no raw error messages)
6. Responsive on mobile and desktop
7. Performance is acceptable (no visible lag)
8. Data looks realistic (no "lorem ipsum" or "test123")

Demo-specific:
- Are there any screens that could embarrass us?
- Is the happy path smooth and impressive?
- Are there any edge cases that could break during a live demo?
- Is the design polished enough for judges?
```

### 4. Architecture Review

```
Review the current architecture for:

1. Separation of concerns — Is logic in the right places?
2. Component reusability — Are components properly abstracted?
3. Data flow — Is state management clean and predictable?
4. API design — Are endpoints consistent and well-typed?
5. Error boundaries — Can a component failure crash the app?
6. Bundle size — Are we importing anything unnecessarily heavy?
7. Security — Any exposed secrets, XSS risks, or injection points?

Provide:
- Critical issues that must be fixed before submission
- Warnings that could cause problems during demo
- Suggestions for improvement if time permits
```

---

## Review Checklist (Quick)

Use this for fast self-reviews:

### Functionality
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] No regressions in existing features

### Code Quality
- [ ] No TypeScript errors
- [ ] No `any` types without justification
- [ ] No console.log statements in production code
- [ ] No commented-out code
- [ ] Functions are small and focused

### UI/UX
- [ ] Loading states present
- [ ] Error states present
- [ ] Empty states present
- [ ] Responsive at all breakpoints
- [ ] Animations respect prefers-reduced-motion

### Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (4.5:1 minimum)
- [ ] Screen reader tested (or ARIA reviewed)

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Bundle size reasonable

---

## Best Practices

1. **Review before committing** — Every feature gets at least a self-review
2. **Be specific** — "This is bad" is not useful. "This handler doesn't catch network errors" is.
3. **Prioritize** — In a hackathon, fix critical issues first, log the rest
4. **Check the demo path** — The features judges see must be flawless
5. **Trust but verify** — AI-generated code should always be reviewed

---

*Last updated: 2026-08-07T03:54:00+05:30*
