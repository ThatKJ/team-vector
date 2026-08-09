CREATE TABLE IF NOT EXISTS assessment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  overall_score INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_reports_session_id ON assessment_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_reports_candidate_id ON assessment_reports(candidate_id);
