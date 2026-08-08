export type QuestionStrategy = 
  | 'EXPLORE'
  | 'PROBE_WEAKNESS'
  | 'VALIDATE_STRENGTH'
  | 'ESCALATE'
  | 'CROSS_REFERENCE'
  | 'RECOVER';

export type EvaluationSignal = 
  | 'strong_positive'
  | 'positive'
  | 'neutral'
  | 'negative'
  | 'strong_negative';

export type DimensionTrend = 'improving' | 'stable' | 'declining' | 'unknown';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type QuestionType = 'conceptual' | 'scenario' | 'architecture' | 'debugging' | 'production' | 'comparison' | 'reflection';

export interface Mission {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  attempts: number;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  experienceLevel: string;
  missions: Mission[];
}

export interface CurriculumDay {
  day: number;
  topics: string[];
  objectives: string[];
}

export interface CurriculumModule {
  id: number;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  days: CurriculumDay[];
}

export interface ModuleAssessment {
  moduleId: number;
  score: number; // 0-100
  confidence: number; // 0-1
  missionData: {
    attempted: number;
    passed: number;
    failed: number;
    skipped: number;
    averageAttempts: number;
  };
  interviewEvidence: string[];
}

export interface DimensionState {
  score: number; // 0-100
  confidence: number; // 0-1
  trend: DimensionTrend;
}

export interface EvidenceEntry {
  questionIndex: number;
  round: number;
  question: string;
  answerSummary: string;
  signal: EvaluationSignal;
  reasoning: string;
  affectedModules: number[];
  affectedDimensions: string[];
}

export interface ClaimEntry {
  topic: string;
  claim: string;
  questionIndex: number;
}

export interface StrategyEntry {
  round: number;
  strategy: QuestionStrategy;
  reason: string;
}

export interface CandidateTheory {
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  sessionId: string;
  currentRound: number;
  questionsAsked: number;
  theoryVersion: number;
  modules: Record<number, ModuleAssessment>;
  dimensions: {
    reasoning: DimensionState;
    communication: DimensionState;
    architectureThinking: DimensionState;
    productionReadiness: DimensionState;
    tradeoffAwareness: DimensionState;
  };
  evidence: EvidenceEntry[];
  claims: ClaimEntry[];
  strategyHistory: StrategyEntry[];
}

export interface InterviewState {
  sessionId: string;
  candidate: Candidate;
  theory: CandidateTheory;
  currentStrategy: QuestionStrategy;
  currentDifficulty: QuestionDifficulty;
  isComplete: boolean;
  conversationHistory: { role: 'user' | 'assistant', content: string }[];
  feedback?: {
    summary: string;
    strengths: string[];
    gaps: string[];
    next: string[];
  };
}
