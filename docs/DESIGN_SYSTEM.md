# Design System

This design system establishes the visual direction for **INTERVU**. The product follows an **Editorial SaaS** aesthetic, prioritizing clarity, confidence, and a premium technical feel. It intentionally avoids typical "high-tech" glowing AI tropes, opting for a grounded, sophisticated workspace that reduces anxiety while maintaining technical authority.

## Core Identity
- **Feel:** Intelligent, precise, technical, confident, calm, premium, human.
- **Goal:** Emphasize that INTERVU is a *professional interviewer*, not a chat dashboard.

## Colors
The palette uses a warm, off-white foundation to prevent screen fatigue and give a tactile, "organic" paper-like quality.

- **Background:** `#F7F7F4` (Warm neutral canvas)
- **Primary / Accent:** `#43B96B` (Refined, organic green — used sparingly for success states, primary actions, and progress)
- **Text / Secondary:** Deep charcoal-green `#1a1c1b` and `#3e4a3f` for high-contrast legibility.
- **Surface (Cards):** Pure white `#FFFFFF` with subtle borders (`#E5E5DF`).
- **Input Backgrounds:** `#F7F7F4` to recess them into white cards.
- **Badges:** Success (`#e0f2e5` background with `#00441e` text), Neutral (`#eeeeeb` with `#3e4a3f` text).

## Typography
Strong modern type hierarchy focusing on readability and structural clarity.

- **Headlines:** **Hanken Grotesk** (tight and impactful, slight negative letter-spacing for a modern feel).
- **Body & UI Elements:** **Inter** (generous line-height, highly readable).
- **Technical Metadata / Code:** **JetBrains Mono** (monospace, reinforcing the "premium developer tools" aesthetic).
- **Eyebrow / Labels:** Small caps or bold weights for metadata to create clear structural hierarchy.

## Spacing & Layout
Follows a **Fixed-Fluid Hybrid** model.
- **Grid:** Strict 8px baseline grid.
- **Container Max-Width:** 1280px, centered on desktop.
- **Stack Spacing:** 
  - `48px` (stack-lg) between major sections (e.g., Interview Question and Editor).
  - `24px` (stack-md) between cards and primary content blocks.
  - `12px` (stack-sm) for tight internal grouping.
- **Mobile:** Margins shrink to `16px`. Reflows to single-column stack.

## Elevation & Depth (Surfaces)
Avoids heavy borders or blurs. Relies on **Tonal Layering** and **Soft Ambient Shadows**.
- **Level 0 (Background):** `#F7F7F4`
- **Level 1 (Cards):** `#FFFFFF` with `1px` border of `#E5E5DF`.
- **Shadows (Hover/Float):** `0px 12px 32px rgba(45, 49, 46, 0.04)`.
- **Interactive Lift:** Hovered elements lift slightly (negative Y-offset) rather than darkening, giving physical presence.

## Shapes
Friendly but professional. **Avoid excessive rounding**.
- **Cards:** `rounded-xl` (24px) for main dashboards; `rounded-lg` (16px) for inner modules.
- **Buttons & Inputs:** Standard `8px` (soft radius) for precision.
- **Badges:** Pill-shaped (`rounded-full`) to contrast against rectangular cards.

## Motion Principles
Motion must be purposeful, subtle, and communicate state. Avoid excessive bouncing or gimmicky particle effects.
- **Buttons:** 200ms scale-up (1.02x) transition on hover.
- **Progress:** Smooth linear transitions.
- **AI Analysis State:** Gentle pulsing animation, not a generic spinning loader.
- **Question Entrance / Transitions:** Enter smoothly and naturally. Follow-up generation should have distinct typing and reveal animations to indicate adaptive thought processing.
