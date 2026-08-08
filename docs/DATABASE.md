# Database Model

*Designed with Supabase MCP.*

The backend relies on Supabase for relational data storage and state management. The schema below represents the core domain models required to drive the platform.

## Tables

### `candidates`
Stores candidate profiles.
- `id` (UUID, PK)
- `name` (String)
- `email` (String)
- `created_at` (Timestamp)

### `curriculum_modules` / `curriculum_days` / `curriculum_topics`
Defines the 31-day AI Cohort learning journey.
- `curriculum_days`: `id`, `day_number`, `title`, `description`
- `curriculum_topics`: `id`, `day_id` (FK), `topic_name`, `is_core`

### `candidate_progress`
Tracks the candidate's learning journey and topic completions.
- `id` (UUID, PK)
- `candidate_id` (FK to candidates)
- `topic_id` (FK to curriculum_topics)
- `status` (Enum: completed, skipped, pending)

### `interviews`
Tracks individual interview sessions.
- `id` (UUID, PK)
- `candidate_id` (FK)
- `status` (Enum: pending, in_progress, completed, failed)
- `started_at` (Timestamp)
- `completed_at` (Timestamp)
- `score` (Integer, nullable)

### `interview_turns`
Maintains the context of the conversation.
- `id` (UUID, PK)
- `interview_id` (FK to interviews)
- `turn_number` (Integer)
- `topic_id` (FK to curriculum_topics, nullable)
- `question_text` (Text)
- `candidate_answer` (Text)
- `evaluation_notes` (Text)
- `created_at` (Timestamp)

### `interview_signals`
Tracks the specific evidence of engineering capability (strengths/gaps).
- `id` (UUID, PK)
- `interview_turn_id` (FK to interview_turns)
- `signal_type` (Enum: strength, gap, neutral)
- `category` (Enum: problem_solving, systems_thinking, technical_depth, communication)
- `description` (Text)

### `reports`
Stores the final structured evaluation report.
- `id` (UUID, PK)
- `interview_id` (FK to interviews)
- `overall_score` (Integer)
- `summary` (Text)
- `next_steps` (Text)
- `decision_trace` (JSONB - for transparency on how AI arrived at the score)
