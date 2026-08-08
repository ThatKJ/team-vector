# UX Flow & Guidelines

INTERVU is a dynamic, adaptive product. The user experience is designed to feel like an ongoing, context-aware dialogue rather than a disconnected series of forms.

## Screen Architectures & Flows

### 1. Landing Page
- **Purpose:** Explain INTERVU and invite the candidate to start.
- **Structure:** Compact, cinematic, product-focused.
- **Content:** Strong hero headline ("Know how someone engineers"), explanation of the curriculum-aware assessment process, and a subtle product preview showing the adaptive interview interaction in motion.

### 2. Candidate / Interview Setup
- **Purpose:** Prepare the candidate. It should feel like stepping into a professional interview room.
- **Structure:** Clean, focused state displaying candidate identity (avatar/name), cohort progress, curriculum scope, estimated duration, and difficulty level.
- **CTA:** Primary "Start Interview" button.

### 3. Interview Room (Core Experience)
- **Purpose:** The actual assessment. The interface must balance human focus and technical evaluation without feeling like a generic chatbot wrapper.
- **Structure (Desktop):**
  - **Left Panel:** Candidate context, session ID, and progress tracker.
  - **Center Content:** The primary conversation area. Questions appear here. Code editor / answer input is prominent.
  - **Right Panel (Subtle Context):** Displays non-distracting intelligence (Current Topic, Curriculum Day, Competency focus) without exposing hidden chain-of-thought logic.
- **Motion/Interaction:** System adaptation must be visually obvious through typing states, fluid question entrances, and answer submission transitions. 

### 4. Follow-up Moment
- **Purpose:** Highlight the adaptive nature of INTERVU.
- **Interaction:** When a candidate gives an incomplete or deep answer, a distinct state change occurs indicating a spontaneous, unscripted follow-up is being generated (e.g., "Reviewing technical reasoning... Let's go one level deeper").

### 5. Interview Completion
- **Purpose:** Transition from active testing to analytical scoring.
- **Sequence:** "Interview complete" -> Purposeful motion sequence (e.g. "Mapping curriculum coverage", "Evaluating depth") -> Reveal report. No generic loading spinners.

### 6. Final Report
- **Purpose:** Actionable, serious engineering assessment for hiring managers.
- **Structure:** Editorial format.
- **Content:** Overall engineering readiness score (out of 100), breakdown of dimensions (Problem Solving, Systems Thinking, Technical Depth, Communication), strengths/gaps, next steps, and a visual replay/decision trace of the interview.

## Assets
- Stored in `assets/design/`.
- Assets include generated screens, `DESIGN.md`, and raw HTML/CSS output representing the finalized visual direction from Stitch.
- Illustrations and graphics must be tasteful, subtle technical cues rather than generic 3D blobs.
