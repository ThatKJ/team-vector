# 🎨 UI Guidelines — Design System

> **Purpose**: The single reference for every visual decision. If two components look different and shouldn't, this file wasn't followed.  
> **When to update**: When design tokens change, new patterns are added, or inconsistencies are found.  
> **Rule**: Every component must reference these tokens. No hardcoded values.

---

## Design Philosophy

- **Consistent** — Every element follows the same rules
- **Premium** — The product should feel expensive
- **Purposeful** — Every animation, shadow, and color serves a function
- **Accessible** — Beauty that everyone can experience

---

## Colors

### Color Palette

*Fill in actual values when the brand identity is decided.*

```css
:root {
  /* Primary */
  --color-primary-50:  hsl(220, 80%, 97%);
  --color-primary-100: hsl(220, 80%, 92%);
  --color-primary-200: hsl(220, 80%, 82%);
  --color-primary-300: hsl(220, 80%, 70%);
  --color-primary-400: hsl(220, 80%, 58%);
  --color-primary-500: hsl(220, 80%, 50%);   /* ← Main primary */
  --color-primary-600: hsl(220, 80%, 42%);
  --color-primary-700: hsl(220, 80%, 35%);
  --color-primary-800: hsl(220, 80%, 28%);
  --color-primary-900: hsl(220, 80%, 20%);

  /* Neutral / Gray */
  --color-gray-50:  hsl(220, 15%, 97%);
  --color-gray-100: hsl(220, 15%, 93%);
  --color-gray-200: hsl(220, 15%, 85%);
  --color-gray-300: hsl(220, 15%, 72%);
  --color-gray-400: hsl(220, 15%, 55%);
  --color-gray-500: hsl(220, 15%, 42%);
  --color-gray-600: hsl(220, 15%, 32%);
  --color-gray-700: hsl(220, 15%, 22%);
  --color-gray-800: hsl(220, 15%, 14%);
  --color-gray-900: hsl(220, 15%, 8%);

  /* Semantic */
  --color-success: hsl(145, 65%, 42%);
  --color-warning: hsl(38, 92%, 50%);
  --color-error:   hsl(0, 72%, 51%);
  --color-info:    hsl(210, 80%, 52%);

  /* Backgrounds */
  --bg-primary:   hsl(220, 15%, 4%);          /* Dark mode base */
  --bg-secondary: hsl(220, 15%, 8%);
  --bg-surface:   hsl(220, 15%, 12%);
  --bg-elevated:  hsl(220, 15%, 16%);

  /* Text */
  --text-primary:   hsl(220, 15%, 95%);
  --text-secondary: hsl(220, 15%, 65%);
  --text-muted:     hsl(220, 15%, 45%);
  --text-inverse:   hsl(220, 15%, 8%);
}
```

### Color Usage Rules

| Use Case | Token | Never Use |
|---|---|---|
| Interactive elements | `--color-primary-500` | Raw hex/rgb values |
| Body text | `--text-primary` | `#fff` or `white` |
| Subtle text | `--text-secondary` | Opacity hacks |
| Error messages | `--color-error` | `red` |
| Success indicators | `--color-success` | `green` |
| Backgrounds | `--bg-*` tokens | Hardcoded colors |

---

## Typography

### Font Family

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

**Google Fonts import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size | Weight | Line Height | Use For |
|---|---|---|---|---|
| `--text-xs` | 0.75rem (12px) | 400 | 1.5 | Captions, badges |
| `--text-sm` | 0.875rem (14px) | 400 | 1.5 | Secondary text, labels |
| `--text-base` | 1rem (16px) | 400 | 1.6 | Body text |
| `--text-lg` | 1.125rem (18px) | 500 | 1.5 | Emphasized body |
| `--text-xl` | 1.25rem (20px) | 600 | 1.4 | Section headers |
| `--text-2xl` | 1.5rem (24px) | 600 | 1.3 | Page sub-headers |
| `--text-3xl` | 1.875rem (30px) | 700 | 1.2 | Page titles |
| `--text-4xl` | 2.25rem (36px) | 700 | 1.1 | Hero text |
| `--text-5xl` | 3rem (48px) | 700 | 1.0 | Hero display |

```css
:root {
  --text-xs:  0.75rem;
  --text-sm:  0.875rem;
  --text-base: 1rem;
  --text-lg:  1.125rem;
  --text-xl:  1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
}
```

---

## Spacing Scale

Based on a **4px** grid. Everything is a multiple of 4.

```css
:root {
  --space-0:  0;
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

**Rule**: Never use arbitrary pixel values. Always use spacing tokens.

---

## Border Radius

```css
:root {
  --radius-sm:   0.25rem;   /* 4px — subtle rounding */
  --radius-md:   0.5rem;    /* 8px — default for cards, inputs */
  --radius-lg:   0.75rem;   /* 12px — modals, large cards */
  --radius-xl:   1rem;      /* 16px — feature sections */
  --radius-2xl:  1.5rem;    /* 24px — hero elements */
  --radius-full: 9999px;    /* Pill shape — badges, avatars */
}
```

| Element | Radius |
|---|---|
| Buttons | `--radius-md` |
| Inputs | `--radius-md` |
| Cards | `--radius-lg` |
| Modals | `--radius-xl` |
| Badges / Pills | `--radius-full` |
| Avatars | `--radius-full` |
| Tooltips | `--radius-sm` |

---

## Shadows

```css
:root {
  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(var(--color-primary-rgb), 0.15);
}
```

| Element | Shadow |
|---|---|
| Cards (resting) | `--shadow-sm` |
| Cards (hover) | `--shadow-md` |
| Dropdowns | `--shadow-lg` |
| Modals | `--shadow-xl` |
| Focused primary buttons | `--shadow-glow` |

---

## Animation & Transitions

### Durations

```css
:root {
  --duration-fast:   100ms;   /* Hover color changes */
  --duration-normal: 200ms;   /* Most transitions */
  --duration-slow:   300ms;   /* Modals, page transitions */
  --duration-slower: 500ms;   /* Complex animations */
}
```

### Easing

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);   /* General purpose */
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);       /* Elements entering */
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);       /* Elements leaving */
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful interactions */
}
```

### Standard Transitions

```css
/* Apply to all interactive elements */
.interactive {
  transition: all var(--duration-normal) var(--ease-default);
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Rules

1. **Every animation must have a purpose** — decorative animations waste time and annoy users
2. **Max 300ms for most transitions** — anything longer feels sluggish
3. **Always respect `prefers-reduced-motion`** — accessibility is non-negotiable
4. **Don't animate layout properties** — animate `transform` and `opacity` only (GPU-accelerated)
5. **Stagger group animations** — 50ms delay between items in a list feels natural

---

## Button Styles

### Variants

| Variant | Use For | Background | Text |
|---|---|---|---|
| **Primary** | Main CTA, primary actions | `--color-primary-500` | `--text-inverse` |
| **Secondary** | Secondary actions | `transparent` + border | `--text-primary` |
| **Ghost** | Tertiary actions, nav items | `transparent` | `--text-secondary` |
| **Danger** | Destructive actions | `--color-error` | `white` |

### States

Every button must implement ALL of these states:

```css
.button {
  /* Default */
  background: var(--color-primary-500);
  cursor: pointer;
  
  /* Hover */
  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }
  
  /* Active / Pressed */
  &:active {
    transform: translateY(0);
  }
  
  /* Focused (keyboard) */
  &:focus-visible {
    outline: 2px solid var(--color-primary-400);
    outline-offset: 2px;
  }
  
  /* Disabled */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Loading */
  &[data-loading="true"] {
    pointer-events: none;
    /* Show spinner, hide text */
  }
}
```

### Sizes

| Size | Padding | Font Size | Min Height |
|---|---|---|---|
| `sm` | `--space-2` `--space-3` | `--text-sm` | 32px |
| `md` | `--space-2` `--space-4` | `--text-base` | 40px |
| `lg` | `--space-3` `--space-6` | `--text-lg` | 48px |

---

## Input Styles

```css
.input {
  background: var(--bg-surface);
  border: 1px solid var(--color-gray-700);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--duration-normal) var(--ease-default);
  
  &::placeholder {
    color: var(--text-muted);
  }
  
  &:hover {
    border-color: var(--color-gray-500);
  }
  
  &:focus {
    border-color: var(--color-primary-500);
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
  }
  
  &[aria-invalid="true"] {
    border-color: var(--color-error);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

---

## Breakpoints

```css
/* Mobile first — default styles are for mobile */

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Wide */
@media (min-width: 1440px) { }
```

**Rule**: Always design mobile-first. Add complexity for larger screens.

---

## Z-Index Scale

```css
:root {
  --z-base:     0;
  --z-dropdown: 10;
  --z-sticky:   20;
  --z-overlay:  30;
  --z-modal:    40;
  --z-toast:    50;
  --z-tooltip:  60;
}
```

**Rule**: Never use arbitrary z-index values. Always use tokens.

---

## Component Quick Reference

| Component | Radius | Shadow | Padding | Border |
|---|---|---|---|---|
| Card | `--radius-lg` | `--shadow-sm` | `--space-6` | 1px `--color-gray-800` |
| Modal | `--radius-xl` | `--shadow-xl` | `--space-8` | none |
| Dropdown | `--radius-md` | `--shadow-lg` | `--space-2` | 1px `--color-gray-800` |
| Tooltip | `--radius-sm` | `--shadow-md` | `--space-2` `--space-3` | none |
| Badge | `--radius-full` | none | `--space-1` `--space-2` | none |
| Input | `--radius-md` | none (focus: glow) | `--space-2` `--space-3` | 1px `--color-gray-700` |
| Button | `--radius-md` | none (focus: glow) | varies by size | none |

---

*Last updated: 2026-08-07T04:05:00+05:30*
