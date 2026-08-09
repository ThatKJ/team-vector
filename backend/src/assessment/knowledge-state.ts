import { CandidateKnowledgeState, EvaluatorOutput } from '../core/types';

export function updateKnowledgeState(
  currentState: CandidateKnowledgeState,
  evaluation: EvaluatorOutput,
  targetCompetency: string,
  turnId: string,
  decision: string
): CandidateKnowledgeState {
  // Deep clone the state to avoid mutation
  const newState: CandidateKnowledgeState = JSON.parse(JSON.stringify(currentState));

  // Update competencies
    if (!newState.competencies[targetCompetency]) {
    newState.competencies[targetCompetency] = {
      conceptualUnderstanding: 0,
      applicationAbility: 0,
      reasoningAbility: 0,
      debuggingAbility: 0,
      designAbility: 0,
      confidence: 0,
      uncertainty: 1, // Start with high uncertainty
      evidenceCount: 0,
      lastTestedTurn: 0,
      status: 'untested',
      testedDimensions: [],
      testedConcepts: [],
      saturatedConcepts: []
    };
  }

  const comp = newState.competencies[targetCompetency];
  comp.conceptualUnderstanding = updateExponentialMovingAverage(comp.conceptualUnderstanding, evaluation.depth, comp.evidenceCount);
  comp.applicationAbility = updateExponentialMovingAverage(comp.applicationAbility, evaluation.application, comp.evidenceCount);
  comp.reasoningAbility = updateExponentialMovingAverage(comp.reasoningAbility, evaluation.reasoning, comp.evidenceCount);
  comp.confidence = updateExponentialMovingAverage(comp.confidence, evaluation.confidence, comp.evidenceCount);
  comp.uncertainty = updateExponentialMovingAverage(comp.uncertainty, evaluation.uncertainty, comp.evidenceCount);
  
  comp.evidenceCount += 1;
  comp.lastTestedTurn = parseInt(turnId) || 1; // Simplistic
  
  // Update tracked concepts from demonstratedConcepts
  evaluation.demonstratedConcepts.forEach(c => {
    if (!comp.testedConcepts.includes(c)) comp.testedConcepts.push(c);
  });

  // Basic check for dimensions
  const newDims = [];
  if (evaluation.depth > 0.6) newDims.push('conceptual');
  if (evaluation.application > 0.6) newDims.push('application');
  if (evaluation.reasoning > 0.6) newDims.push('reasoning');
  newDims.forEach(d => {
    if (!comp.testedDimensions.includes(d)) comp.testedDimensions.push(d);
  });

  // Track saturated concepts: if we have high confidence and tested dimensions for this concept
  if (comp.confidence > 0.75) {
    evaluation.demonstratedConcepts.forEach(c => {
      if (!comp.saturatedConcepts.includes(c)) {
        comp.saturatedConcepts.push(c);
      }
    });
  }

  // Explicit Evidence Saturation Rule
  const hasUnresolvedMisconceptions = newState.misconceptions.some(m => !m.verified && m.type === 'misconception' && m.concept.includes(targetCompetency));
  
  if (comp.confidence > 0.8 && comp.uncertainty < 0.25 && comp.testedDimensions.length >= 2 && !hasUnresolvedMisconceptions) {
    comp.status = 'SUFFICIENTLY_EVIDENCED';
  } else if (comp.confidence > 0.8 && comp.conceptualUnderstanding > 0.7) {
    comp.status = 'demonstrated';
  } else if (comp.evidenceCount > 2 && comp.conceptualUnderstanding < 0.4) {
    comp.status = 'weak';
  } else {
    comp.status = 'assessing';
  }

  // Update misconceptions
  for (const m of evaluation.misconceptions) {
    newState.misconceptions.push({
      concept: m.concept,
      type: 'misconception',
      severity: m.severity,
      evidence: m.description,
      verified: false
    });
  }

  // Record demonstrated claims
  if (evaluation.claims) {
    for (const c of evaluation.claims) {
      newState.claims.push({
        topic: targetCompetency,
        claim: c,
        verified: true,
        confidence: evaluation.confidence,
        turnId: parseInt(turnId) || 1
      });
    }
  }

  // Record trajectory is now handled by orchestrator after planner generates strategy

  // Update global metrics
  newState.global.consistency = updateExponentialMovingAverage(newState.global.consistency, evaluation.correctness, newState.trajectory.length);
  newState.global.communicationQuality = updateExponentialMovingAverage(newState.global.communicationQuality, evaluation.communication, newState.trajectory.length);
  newState.global.confidence = Object.values(newState.competencies).reduce((acc, c) => acc + c.confidence, 0) / Math.max(Object.keys(newState.competencies).length, 1);

  return newState;
}

function updateExponentialMovingAverage(current: number, newValue: number, n: number): number {
  if (n === 0) return newValue;
  const alpha = 2 / (n + 1 + 1);
  return newValue * alpha + current * (1 - alpha);
}
