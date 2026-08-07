# ✅ Definition of Done

> **Purpose**: The single checklist that determines if a task is truly complete. No exceptions.  
> **When to update**: When quality standards change or new requirements emerge.  
> **Rule**: A task is NOT done until every applicable item is checked. Period.

---

## The Checklist

### Functionality
- [ ] Feature works correctly on the happy path
- [ ] Edge cases are handled (empty input, long text, special characters)
- [ ] No console errors
- [ ] No console warnings (unless documented and intentional)
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No unhandled promise rejections

### UI States (ALL are required for every data-driven component)
- [ ] **Loading state** — skeleton, spinner, or progress indicator
- [ ] **Error state** — user-friendly message with recovery action
- [ ] **Empty state** — helpful guidance, not "No data found"
- [ ] **Success state** — confirmation feedback (toast, animation, message)

### Design Quality
- [ ] Follows `docs/UI_GUIDELINES.md` design tokens (no hardcoded values)
- [ ] Responsive at 320px (mobile)
- [ ] Responsive at 768px (tablet)
- [ ] Responsive at 1024px (desktop)
- [ ] Responsive at 1440px (wide)
- [ ] Consistent with the rest of the application
- [ ] No default browser styles visible (unstyled inputs, buttons, etc.)

### Accessibility
- [ ] All interactive elements are keyboard navigable
- [ ] Focus indicators are visible
- [ ] ARIA labels on buttons, inputs, and interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Screen reader would make sense (semantic HTML)
- [ ] `prefers-reduced-motion` is respected for animations

### Code Quality
- [ ] TypeScript types are complete (no `any` without documented reason)
- [ ] No unused imports or variables
- [ ] No commented-out code
- [ ] No `console.log` statements (use proper logging if needed)
- [ ] Functions are focused and reasonably sized
- [ ] Components are reusable where appropriate
- [ ] Error handling is in place (try/catch, error boundaries)

### Documentation (NONE of these are optional)
- [ ] `docs/PROJECT_CONTEXT.md` updated with current state
- [ ] `docs/TASKS.md` updated — task moved to correct column
- [ ] `prompts/PROMPTS.md` updated — AI interaction logged
- [ ] `docs/ARCHITECTURE.md` updated — if structure changed
- [ ] `docs/FEATURE_MATRIX.md` updated — if feature status changed
- [ ] `docs/KNOWN_BUGS.md` updated — if bugs found or fixed
- [ ] `docs/DECISIONS.md` updated — if a decision was made

### Ship
- [ ] Git commit message suggested (conventional format)
- [ ] Next task recommended
- [ ] No regressions in existing features

---

## Quick Check (For Time-Pressured Moments)

If you're in a rush, at minimum verify:

1. ✅ It works
2. ✅ It doesn't crash anything else
3. ✅ It has loading and error states
4. ✅ It's responsive
5. ✅ No console errors
6. ✅ Docs are updated
7. ✅ Commit message ready

---

## What "Done" Looks Like vs. What It Doesn't

| ✅ Done | ❌ Not Done |
|---|---|
| "Button submits form, shows loading spinner, handles errors, shows success toast" | "Button works" |
| "Page is responsive at all breakpoints, no layout shifts" | "Looks fine on my screen" |
| "Error state shows user-friendly message with retry button" | "It catches the error" |
| "All docs updated, commit message suggested, next task identified" | "Code is pushed" |
| "Keyboard navigation works, ARIA labels present, focus visible" | "It works with a mouse" |

---

## The Final Question

Before marking a task as done, ask yourself:

> **"If a judge opened this feature right now, on any device, would I be proud of it?"**
>
> **YES** → Ship it.  
> **NO** → It's not done.

---

*Last updated: 2026-08-07T04:05:00+05:30*
