-- Clean up existing legacy tables (careful not to delete curriculum or candidate core data)
-- Let's drop old interview tracking if it exists
DROP TABLE IF EXISTS adaptation_events CASCADE;
DROP TABLE IF EXISTS competency_evidence CASCADE;
DROP TABLE IF EXISTS turn_evaluations CASCADE;
DROP TABLE IF EXISTS interview_turns CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;

-- 1. Interview Sessions
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY,
  candidate_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'INITIALIZING',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_turn INTEGER DEFAULT 0,
  current_competency VARCHAR(255),
  assessment_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Interview Turns
CREATE TABLE interview_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'interviewer' or 'candidate'
  content TEXT NOT NULL,
  question_type VARCHAR(100),
  target_competency VARCHAR(255),
  target_concept VARCHAR(255),
  difficulty INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Turn Evaluations
CREATE TABLE turn_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id UUID NOT NULL REFERENCES interview_turns(id) ON DELETE CASCADE,
  correctness NUMERIC(3,2),
  depth NUMERIC(3,2),
  reasoning NUMERIC(3,2),
  application NUMERIC(3,2),
  communication NUMERIC(3,2),
  confidence NUMERIC(3,2),
  evidence_quality VARCHAR(50),
  evaluation_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Competency Evidence
CREATE TABLE competency_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  competency VARCHAR(255) NOT NULL,
  concept VARCHAR(255) NOT NULL,
  turn_id UUID NOT NULL REFERENCES interview_turns(id) ON DELETE CASCADE,
  evidence_type VARCHAR(100),
  strength VARCHAR(50),
  confidence NUMERIC(3,2),
  evidence_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Adaptation Events
CREATE TABLE adaptation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  turn_id UUID REFERENCES interview_turns(id) ON DELETE CASCADE,
  previous_state JSONB,
  new_state JSONB,
  decision VARCHAR(100),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We are keeping the existing candidates, candidate_progress, curriculum_modules, curriculum_days, curriculum_topics intact as they act as our seed data for candidates and the curriculum graph.
