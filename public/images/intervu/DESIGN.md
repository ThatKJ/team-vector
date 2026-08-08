---
name: Intervu
colors:
  surface: '#f9f9f6'
  surface-dim: '#dadad7'
  surface-bright: '#f9f9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#3e4a3f'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#6e7a6e'
  outline-variant: '#bdcabc'
  surface-tint: '#006d35'
  primary: '#006d35'
  on-primary: '#ffffff'
  primary-container: '#43b96b'
  on-primary-container: '#00441e'
  inverse-primary: '#69dd8b'
  secondary: '#5b5f5c'
  on-secondary: '#ffffff'
  secondary-container: '#dde0dc'
  on-secondary-container: '#606460'
  tertiary: '#5a605c'
  on-tertiary: '#ffffff'
  tertiary-container: '#a0a5a1'
  on-tertiary-container: '#363b38'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#86faa5'
  primary-fixed-dim: '#69dd8b'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#e0e3df'
  secondary-fixed-dim: '#c4c7c3'
  on-secondary-fixed: '#191c1a'
  on-secondary-fixed-variant: '#444844'
  tertiary-fixed: '#dfe4df'
  tertiary-fixed-dim: '#c3c8c3'
  on-tertiary-fixed: '#181d1a'
  on-tertiary-fixed-variant: '#434845'
  background: '#f9f9f6'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is built on an **Editorial SaaS** aesthetic, prioritizing clarity, confidence, and a premium academic feel. It avoids the typical "high-tech" tropes of glowing AI effects in favor of a grounded, sophisticated workspace that reduces candidate anxiety while maintaining technical authority.

The style is a blend of **Minimalism** and **Tactile Modernism**. It uses generous white space, a warm-toned neutral palette, and high-quality typography to create an environment that feels more like a modern design journal than a cold testing software. The emotional response should be one of "calm focus"—where the AI feels like a supportive co-pilot rather than a surveillance tool.

## Colors
The palette is anchored by a warm, off-white foundation (`#F7F7F4`) to prevent screen fatigue and provide an "organic" paper-like quality. 

- **Primary:** A refined, organic green used sparingly for success states, primary actions, and progress indicators.
- **Secondary/Text:** A deep charcoal-green for high-contrast typography, ensuring maximum legibility.
- **Neutral/Surface:** Multiple tiers of warm greys and off-whites. Borders should remain subtle (`#E5E5DF`) to define structure without adding visual noise.
- **Accents:** Use soft, desaturated versions of the primary green for background fills on badges and selected states.

## Typography
This design system utilizes **Hanken Grotesk** for headlines to provide a sharp, contemporary "design-led" feel, and **Inter** for body copy and UI elements due to its exceptional readability at small sizes.

- **Headlines:** Should be tight and impactful with slight negative letter-spacing.
- **Body:** Uses a generous line-height to maintain an editorial, breathable feel.
- **Labels:** Small caps or bold weights are used for metadata and eyebrow text to create a clear structural hierarchy.
- **Technical Content:** For code snippets and technical requirements, use **JetBrains Mono** to maintain the "premium tools" aesthetic.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a 1280px max-width container on desktop, centered with generous outer margins. 

A strict **8px grid** governs all internal spacing. Layouts should prioritize vertical "stacks" with distinct rhythm:
- Use **48px (stack-lg)** to separate major sections like "Interview Question" from "Code Editor".
- Use **24px (stack-md)** for spacing between cards and primary content blocks.
- On mobile, margins shrink to 16px, and complex 3-column layouts reflow into a single-column stack, prioritizing the code editor or video feed.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Soft Ambient Shadows** rather than heavy borders or blurs.

- **Level 0 (Background):** `#F7F7F4` (The warm canvas).
- **Level 1 (Cards/Surface):** Pure white (`#FFFFFF`) with a 1px border of `#E5E5DF`.
- **Shadows:** Use a single, highly-diffused shadow for floating elements (e.g., dropdowns or active cards): `0px 12px 32px rgba(45, 49, 46, 0.04)`.
- **Interactive States:** When a card is hovered, it should subtly lift (negative Y-offset) rather than darken, emphasizing its "physical" presence on the page.

## Shapes
The shape language is friendly but professional. 

- **Cards:** Use `rounded-xl` (24px) for main dashboard containers and `rounded-lg` (16px) for inner content modules to create a "nested" softness.
- **Buttons & Inputs:** Use a standard 8px (soft) radius to maintain a sense of precision.
- **Badges:** Use pill-shaped (fully rounded) containers to contrast against the more structured rectangular cards.

## Components
- **Buttons:** Primary buttons use a solid `#43B96B` fill with white text. Secondary buttons should use a white fill with a subtle `#E5E5DF` border. Apply a 200ms transition on hover for a slight scale-up (1.02x).
- **Refined Cards:** All cards must have a white background, a 16px or 24px corner radius, and a subtle 1px border. Avoid heavy dropshadows.
- **Progress Indicators:** Use thin, 4px height bars with the primary green. For "AI Analysis" states, use a gentle pulse animation rather than a spinning loader.
- **Input Fields:** Use the warm neutral `#F7F7F4` as the field background to make them feel "recessed" into the white cards.
- **Badges:** Use high-contrast "Inter" bold caps. Success badges use a light green tint background with dark green text; neutral badges use a grey tint background.
- **Video Feeds:** Candidate and interviewer video frames should follow the `rounded-lg` (16px) rule, with a subtle inner glow or border to define the frame against the background.