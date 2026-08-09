import { supabase } from './client';
import { TurnEvidence, EvaluatorOutput } from '../core/types';

export async function addTurnEvaluation(turnId: string, evaluation: EvaluatorOutput) {
  const { error } = await supabase
    .from('turn_evaluations')
    .insert({
      turn_id: turnId,
      correctness: evaluation.correctness,
      depth: evaluation.depth,
      reasoning: evaluation.reasoning,
      application: evaluation.application,
      communication: evaluation.communication,
      confidence: evaluation.confidence,
      evidence_quality: evaluation.evidenceQuality,
      evaluation_json: evaluation as unknown as any
    });

  if (error) throw error;
}

export async function addCompetencyEvidence(
  sessionId: string,
  turnId: string,
  competency: string,
  evidence: TurnEvidence
) {
  const { error } = await supabase
    .from('competency_evidence')
    .insert({
      session_id: sessionId,
      turn_id: turnId,
      competency: competency,
      concept: evidence.concept,
      evidence_type: evidence.strength,
      strength: evidence.strength,
      confidence: evidence.confidence,
      evidence_text: evidence.evidence.join(' | ')
    });

  if (error) throw error;
}

export async function addAdaptationEvent(
  sessionId: string,
  turnId: string | null,
  decision: string,
  reason: string,
  previousState: any,
  newState: any
) {
  const { error } = await supabase
    .from('adaptation_events')
    .insert({
      session_id: sessionId,
      turn_id: turnId,
      decision,
      reason,
      previous_state: previousState,
      new_state: newState
    });
    
  if (error) throw error;
}
