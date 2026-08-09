export type QuestionType =
  | 'baseline'
  | 'conceptual'
  | 'application'
  | 'debugging'
  | 'tradeoff'
  | 'system_design'
  | 'counterfactual'
  | 'cross_check';

export type AssessmentStateStatus =
  | 'CREATED'
  | 'INITIALIZING'
  | 'BASELINE'
  | 'ASSESSING'
  | 'PROBING'
  | 'CROSS_CHECKING'
  | 'CONCLUDING'
  | 'COMPLETED'
  | 'ERROR';

export type AdaptationStrategy = 
  | 'BASELINE'
  | 'PROBE_DEPTH'
  | 'PROBE_REASONING'
  | 'PROBE_APPLICATION'
  | 'CLARIFY_CONCEPT'
  | 'TEST_TRANSFER'
  | 'TEST_EDGE_CASE'
  | 'CROSS_CHECK'
  | 'CHALLENGE_ASSUMPTION'
  | 'REMEDIATE'
  | 'MOVE_ON'
  | 'CONCLUDE';

export interface QuestionFingerprint {
  competency: string;
  concept: string;
  targetDimension: string;
  taskType: string;
  cognitiveOperation: string;
  scenario: string;
  expectedEvidence: string[];
  difficulty: number;
  adaptationStrategy: AdaptationStrategy;
}

export interface CompetencyState {
  conceptualUnderstanding: number; // 0-1
  applicationAbility: number;
  reasoningAbility: number;
  debuggingAbility: number;
  designAbility: number;
  confidence: number;
  uncertainty: number; // 0-1
  evidenceCount: number;
  lastTestedTurn: number;
  status: 'untested' | 'assessing' | 'demonstrated' | 'weak' | 'needs_remediation' | 'SUFFICIENTLY_EVIDENCED';
  testedDimensions: string[];
  testedConcepts: string[];
  saturatedConcepts: string[];
}

export interface CandidateKnowledgeState {
  candidateId: string;
  sessionId: string;
  global: {
    confidence: number;
    evidenceCoverage: number;
    consistency: number;
    communicationQuality: number;
  };
  competencies: Record<string, CompetencyState>;
  misconceptions: Misconception[];
  strengths: string[];
  weaknesses: string[];
  claims: Claim[];
  unresolvedHypotheses: string[];
  trajectory: { turnId: string; strategy: AdaptationStrategy; decision: string; fingerprint?: QuestionFingerprint }[];
}

export interface Misconception {
  concept: string;
  type: 'misconception';
  severity: 'minor' | 'moderate' | 'critical';
  evidence: string;
  verified: boolean;
}

export interface Claim {
  topic: string;
  claim: string;
  verified: boolean;
  confidence: number;
  turnId: number;
}

export interface EvaluatorOutput {
  correctness: number; // 0.0-1.0
  depth: number;
  reasoning: number;
  application: number;
  communication: number;
  confidence: number;
  uncertainty: number;
  demonstratedConcepts: string[];
  missingConcepts: string[];
  misconceptions: Array<{
    concept: string;
    description: string;
    severity: 'minor' | 'moderate' | 'critical';
  }>;
  claims: string[];
  evidenceQuality: 'weak' | 'medium' | 'strong';
  recommendedNextAction: AdaptationStrategy;
}

export interface PlannerOutput {
  targetCompetency: string;
  targetConcept: string;
  targetDimension: string;
  strategy: AdaptationStrategy;
  questionType: QuestionType;
  difficulty: number; // 1-5
  rationale: string;
  purpose: string;
  expectedEvidence: string[];
  uncertaintyBeingReduced: string;
  uncertaintyBefore: number;
  uncertaintyAfter: number;
  informationGain: number;
  whyNow: string;
  question: string;
  stopCondition: string;
  fingerprint: QuestionFingerprint;
}

export interface TurnEvidence {
  concept: string;
  evidence: string[];
  strength: 'conceptual' | 'application' | 'reasoning' | 'debugging' | 'design';
  missing: string[];
  confidence: number;
  nextProbe: AdaptationStrategy;
}

export interface InterviewTurnRecord {
  id: string;
  session_id: string;
  turn_number: number;
  role: 'interviewer' | 'candidate';
  content: string;
  question_type?: string;
  target_competency?: string;
  target_concept?: string;
  difficulty?: number;
  created_at: string;
}
