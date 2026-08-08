import { CandidateTheory, QuestionStrategy, InterviewState, QuestionType } from './types';
import curriculumData from './data/curriculum.json';

// Strategy rules based on rounds
export function determineNextStrategy(theory: CandidateTheory): QuestionStrategy {
  const r = theory.currentRound;
  const q = theory.questionsAsked;

  if (r === 1) return 'EXPLORE';
  
  if (r === 2) {
    // If they have a weak module, probe it, otherwise validate strength
    const weakest = findWeakestModule(theory);
    return weakest && weakest.score < 50 ? 'PROBE_WEAKNESS' : 'VALIDATE_STRENGTH';
  }
  
  if (r === 3) {
    // If confidence is low or score is dropping, recover. Else escalate.
    const lastSignal = theory.evidence.length > 0 ? theory.evidence[theory.evidence.length - 1].signal : 'neutral';
    if (lastSignal === 'strong_negative' || lastSignal === 'negative') return 'RECOVER';
    return 'ESCALATE';
  }

  if (r === 4) {
    return 'PROBE_WEAKNESS';
  }

  if (r === 5) {
    return 'CROSS_REFERENCE';
  }

  return 'EXPLORE';
}

function findWeakestModule(theory: CandidateTheory) {
  let weakest = null;
  let minScore = 101;
  for (const modId in theory.modules) {
    const mod = theory.modules[modId];
    if (mod.score < minScore) {
      minScore = mod.score;
      weakest = mod;
    }
  }
  return weakest;
}

function findStrongestModule(theory: CandidateTheory) {
  let strongest = null;
  let maxScore = -1;
  for (const modId in theory.modules) {
    const mod = theory.modules[modId];
    if (mod.score > maxScore) {
      maxScore = mod.score;
      strongest = mod;
    }
  }
  return strongest;
}

export function determineRoundAndCompletion(theory: CandidateTheory): { newRound: number, isComplete: boolean } {
  const q = theory.questionsAsked;
  let round = theory.currentRound;
  let complete = false;

  // Enforce 8 questions minimum according to spec:
  // R1: 1q (q=1) -> R2
  // R2: 2q (q=3) -> R3
  // R3: 2q (q=5) -> R4
  // R4: 2q (q=7) -> R5
  // R5: 1q (q=8) -> Complete
  
  if (q >= 8) {
    complete = true;
  } else if (q >= 7) {
    round = 5;
  } else if (q >= 5) {
    round = 4;
  } else if (q >= 3) {
    round = 3;
  } else if (q >= 1) {
    round = 2;
  }

  return { newRound: round, isComplete: complete };
}

export function planNextQuestion(theory: CandidateTheory, strategy: QuestionStrategy): { targetModule: number, targetDay: number, questionType: QuestionType } {
  let targetModuleId = 1; // Default
  let questionType: QuestionType = 'conceptual';

  const weakest = findWeakestModule(theory);
  const strongest = findStrongestModule(theory);

  switch (strategy) {
    case 'EXPLORE':
      targetModuleId = 1; // Environment & Tooling
      questionType = 'conceptual';
      break;
    case 'PROBE_WEAKNESS':
      targetModuleId = weakest ? weakest.moduleId : 2;
      questionType = 'debugging';
      break;
    case 'VALIDATE_STRENGTH':
      targetModuleId = strongest ? strongest.moduleId : 4;
      questionType = 'scenario';
      break;
    case 'ESCALATE':
      targetModuleId = strongest ? strongest.moduleId : 5;
      questionType = 'architecture';
      break;
    case 'CROSS_REFERENCE':
      targetModuleId = 8; // Production Capstone covers cross-cutting
      questionType = 'comparison';
      break;
    case 'RECOVER':
      targetModuleId = weakest ? weakest.moduleId : 3;
      questionType = 'reflection';
      break;
  }

  const moduleObj = curriculumData.find(m => m.id === targetModuleId);
  const targetDay = moduleObj && moduleObj.days.length > 0 ? moduleObj.days[0].day : 1;

  return { targetModule: targetModuleId, targetDay, questionType };
}
