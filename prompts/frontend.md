# 🎨 Frontend Prompts

> **Purpose**: Templates for using AI to build UI components, pages, and interactions.  
> **When to use**: When creating new components, implementing designs, or solving layout/styling problems.

---

## Prompt Templates

### 1. Component Creation

```
Create a [component name] React component with TypeScript.

Requirements:
- [visual/functional requirement 1]
- [visual/functional requirement 2]
- [visual/functional requirement 3]

Design specs:
- Style: [modern, minimal, glassmorphism, etc.]
- Color scheme: [reference design tokens]
- Responsive: Must work at 320px, 768px, 1024px, 1440px
- Dark mode: [yes/no]

Accessibility:
- Keyboard navigable
- Screen reader friendly
- ARIA labels for all interactive elements
- Focus indicators visible

States to handle:
- Default
- Hover
- Active/Pressed
- Focused
- Disabled
- Loading
- Error
- Empty

Please also provide:
- TypeScript types/interfaces
- CSS module or styled-components
- Unit test suggestions
```

### 2. Page Layout

```
Create the [page name] page for our application.

Context:
- Framework: [Next.js / React]
- Routing: [app router / pages router]
- Layout: [reference existing layout component]

Page sections:
1. [Section 1] — [description]
2. [Section 2] — [description]
3. [Section 3] — [description]

Data requirements:
- [What data this page needs]
- [Where it comes from]
- [Loading/error/empty states]

SEO:
- Title: [page title]
- Description: [meta description]
- H1: [main heading]
```

### 3. Animation & Interaction

```
Add [animation/interaction type] to [component/element].

Current behavior: [what happens now]
Desired behavior: [what should happen]

Constraints:
- Performance: No jank, 60fps
- Accessibility: Respect prefers-reduced-motion
- Mobile: Must work on touch devices
- Duration: [timing preference]

Reference: [link to inspiration or description]
```

### 4. Design System Token Setup

```
Create a design system with the following tokens:

Colors:
- Primary: [hex/hsl]
- Secondary: [hex/hsl]
- Accent: [hex/hsl]
- Background: [hex/hsl]
- Surface: [hex/hsl]
- Text: [hex/hsl]
- Error/Success/Warning: [hex/hsl]

Typography:
- Font family: [Google Font name]
- Scale: [sizes for h1-h6, body, caption]
- Weights: [400, 500, 600, 700]

Spacing:
- Scale: [4px base, multiples]

Borders:
- Radius: [sm, md, lg, xl, full]

Shadows:
- Levels: [sm, md, lg]

Breakpoints:
- Mobile: 320px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

Format as CSS custom properties.
```

---

## Quality Checklist

Before submitting any frontend work, verify:

- [ ] Responsive at all breakpoints (320, 768, 1024, 1440)
- [ ] Loading states for async data
- [ ] Error states with actionable messages
- [ ] Empty states with helpful guidance
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Focus indicators visible
- [ ] No layout shift (CLS < 0.1)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No console errors
- [ ] No TypeScript errors

---

## Best Practices

1. **Component-first** — Build reusable components, then compose pages
2. **Mobile-first** — Start with the smallest breakpoint
3. **Semantic HTML** — Use `<main>`, `<nav>`, `<section>`, `<article>`, `<button>`
4. **Don't over-abstract** — In a hackathon, some duplication is okay
5. **Visual polish matters** — Judges notice transitions, hover states, and consistency

---

*Last updated: 2026-08-07T03:54:00+05:30*
