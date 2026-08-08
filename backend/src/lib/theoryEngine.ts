import { 
  CandidateTheory, 
  EvaluationSignal, 
  EvidenceEntry, 
  ClaimEntry, 
  QuestionDifficulty 
} from './types';

// Constants for deterministic score updates
const SCORE_DELTAS: Record<EvaluationSignal, number> = {
  strong_positive: 15,
  positive: 8,
  neutral: 0,
  negative: -8,
  strong_negative: -15
};

const CONFIDENCE_DELTAS: Record<EvaluationSignal, number> = {
  strong_positive: 0.15,
  positive: 0.1,
  neutral: 0.05,
  negative: 0.1,
  strong_negative: 0.15
};

export function boundScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function boundConfidence(conf: number): number {
  return Math.max(0, Math.min(1, conf));
}

export function updateTheory(
  theory: CandidateTheory,
  signal: EvaluationSignal,
  reasoning: string,
  answerSummary: string,
  question: string,
  targetModuleId: number,
  affectedDimensions: string[],
  claims: ClaimEntry[] = []
): CandidateTheory {
  const newTheory = JSON.parse(JSON.stringify(theory)) as CandidateTheory; // Deep copy
  
  const scoreDelta = SCORE_DELTAS[signal];
  const confDelta = CONFIDENCE_DELTAS[signal];

  // Update target module
  if (newTheory.modules[targetModuleId]) {
    const mod = newTheory.modules[targetModuleId];
    mod.score = boundScore(mod.score + scoreDelta);
    mod.confidence = boundConfidence(mod.confidence + confDelta);
    mod.interviewEvidence.push(reasoning);
  }

  // Update affected dimensions
  affectedDimensions.forEach(dimKey => {
    // Check if valid dimension key
    if (dimKey in newTheory.dimensions) {
      const dim = newTheory.dimensions[dimKey as keyof typeof newTheory.dimensions];
      const oldScore = dim.score;
      dim.score = boundScore(dim.score + scoreDelta);
      dim.confidence = boundConfidence(dim.confidence + confDelta);
      
      // Calculate trend
      if (dim.score > oldScore) dim.trend = 'improving';
      else if (dim.score < oldScore) dim.trend = 'declining';
      else dim.trend = 'stable';
    }
  });

  // Create evidence
  const evidence: EvidenceEntry = {
    questionIndex: newTheory.questionsAsked + 1,
    round: newTheory.currentRound,
    question,
    answerSummary,
    signal,
    reasoning,
    affectedModules: [targetModuleId],
    affectedDimensions
  };
  
  newTheory.evidence.push(evidence);
  
  // Update claims
  if (claims.length > 0) {
    claims.forEach(c => {
      newTheory.claims.push({ ...c, questionIndex: newTheory.questionsAsked + 1 });
    });
  }

  // Bump version and stats
  newTheory.theoryVersion = parseFloat((newTheory.theoryVersion + 0.1).toFixed(1));
  newTheory.questionsAsked += 1;

  return newTheory;
}

export function adjustDifficulty(currentDifficulty: QuestionDifficulty, signal: EvaluationSignal): QuestionDifficulty {
  const levels: QuestionDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const currentIndex = levels.indexOf(currentDifficulty);
  
  let newIndex = currentIndex;
  if (signal === 'strong_positive' || signal === 'positive') {
    newIndex = Math.min(levels.length - 1, currentIndex + 1);
  } else if (signal === 'strong_negative') {
    newIndex = Math.max(0, currentIndex - 1);
  } else if (signal === 'negative') {
    // 50% chance to drop difficulty on negative, else maintain
    if (Math.random() > 0.5) newIndex = Math.max(0, currentIndex - 1);
  }

  return levels[newIndex];
}
