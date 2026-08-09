export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  status: "pending" | "completed" | "in_progress";
  avatarUrl?: string;
  sessionId?: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  status: "INITIALIZING" | "ACTIVE" | "COMPLETED" | "ERROR";
}

export interface CurriculumTopic {
  id: string;
  day_id: string;
  topic_name: string;
  is_core: boolean;
  status: "completed" | "skipped" | "pending";
}

export interface InterviewTurn {
  turn_id: string;
  question: string;
  topic: string;
  turn_number?: number;
  telemetry?: {
    knowledgeState: {
      competencies: Record<string, any>;
      uncertainty: number;
      trajectory: any[];
    };
    decision: {
      turn: number;
      strategy: string;
      targetCompetency: string;
      rationale: string;
      whyNow: string;
      expectedEvidence: string[];
      nextDifficulty: number;
    };
  };
}

export interface StartInterviewResponse {
  interview_id: string;
  status: string;
  first_turn: InterviewTurn;
}

export interface SubmitAnswerRequest {
  turn_id: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  evaluation_status: string;
  is_complete: boolean;
  next_turn?: InterviewTurn;
}

export interface ReportCategoryScores {
  problem_solving: number;
  systems_thinking: number;
  technical_depth: number;
  communication: number;
}

export interface EvidenceCitation {
  turn: number;
  claim: string;
  demonstrated: boolean;
}

export interface StructuredEvidence {
  conclusion: string;
  evidence: EvidenceCitation[];
}

export interface ReportEvidence {
  strengths: StructuredEvidence[];
  gaps: StructuredEvidence[];
}

export interface InterviewReport {
  score: number;
  categories: ReportCategoryScores;
  evidence: ReportEvidence;
  next_steps: string[];
  trajectory?: { strategy: string; rationale: string }[];
}
