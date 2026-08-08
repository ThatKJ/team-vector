# Frontend Strategy & Implementation Guidelines

The frontend is responsible for delivering the premium Stitch-designed experience. It owns rendering, UI state, routing, and animations, consuming data strictly via API contracts from the backend.

## Responsive Design
- **Desktop First:** The interview room is a complex interface containing context panels, chat sequences, and code editors. Prioritize the desktop layout.
- **Tablet / Mobile:** Ensure the interview remains highly usable. On smaller screens, side panels (like the context or curriculum scope) should become collapsible drawers or tabs rather than blindly stacking vertically and breaking the visual hierarchy.

## Component Inventory
This phase identifies the reusable components to build based on the Design System.

### Global & Layout
- `Navbar`: Minimalist top navigation.
- `Footer`: Clean editorial footer.
- `Button`: Primary/Secondary following hover interactions (1.02x scale).
- `Badge`: Pill-shaped labels for metadata, success, and neutral states.
- `Card` / `Surface`: Containers with 1px borders and defined border-radii (`lg` or `xl`).

### Landing
- `HeroSection`: High-impact typography and CTA.
- `ProductPreview`: Visual demonstration of the adaptive interview loop.

### Setup & Context
- `CandidateHeader`: Avatar, name, and cohort information.
- `CurriculumMap`: Visual tracker of the 31-day journey coverage.
- `InterviewScopeCard`: Difficulty, time, and topic summary.

### Interview Room
- `InterviewShell`: The main 3-column (or responsive) layout structure.
- `QuestionBubble` / `AnswerBubble`: Typography-rich conversation blocks.
- `TypingIndicator`: Subtle, intelligent processing animation.
- `InterviewProgress`: The linear tracker of question progression.
- `InterviewContextPanel`: The subtle right-hand panel displaying current topic/competency.
- `InputEditor`: The main candidate interaction zone, using a subtle recessed background (`#F7F7F4`).

### Transition & Reporting
- `PipelineLoader`: Multi-step analytical loading sequence used for completion.
- `ScoreReveal`: Animated introduction of the final score out of 100.
- `ScoreCard` / `DimensionBar`: Visual representation of specific competencies.
- `StrengthsGapsList`: Editorial display of evidence.
- `ReplayTimeline`: Linear event trace of the interview progression.

## Strict Guidelines
- **Do not invent ad-hoc styles.** If a color, spacing value, or font size isn't in `DESIGN_SYSTEM.md` or Tailwind config (once created), it shouldn't be used.
- **No placeholder backend logic.** Use mock data files that perfectly match the `API.md` contracts until Ayaan's backend endpoints are connected.
