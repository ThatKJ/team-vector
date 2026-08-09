import { supabase } from './client';
import { CandidateKnowledgeState } from '../core/types';

export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}

export async function createSession(sessionId: string, candidateId: string, initialState: CandidateKnowledgeState) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      id: sessionId,
      candidate_id: candidateId,
      status: 'INITIALIZING',
      assessment_state: initialState as unknown as any,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionState(sessionId: string, status: string, state: CandidateKnowledgeState, currentTurn: number) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({
      status,
      assessment_state: state as unknown as any,
      current_turn: currentTurn,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('current_turn', currentTurn - 1) // optimistic lock
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('CONCURRENCY_CONFLICT');
  }
}

export async function getInterviewHistory(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addInterviewTurn(
  sessionId: string, 
  turnNumber: number, 
  role: 'interviewer' | 'candidate', 
  content: string,
  metadata?: { questionType?: string, targetCompetency?: string, difficulty?: number }
) {
  const { data, error } = await supabase
    .from('interview_turns')
    .insert({
      session_id: sessionId,
      turn_number: turnNumber,
      role,
      content,
      question_type: metadata?.questionType,
      target_competency: metadata?.targetCompetency,
      difficulty: metadata?.difficulty
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCandidate(candidateId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  if (!data) {
    const notFoundError = new Error('CANDIDATE_NOT_FOUND');
    (notFoundError as any).code = 'CANDIDATE_NOT_FOUND';
    throw notFoundError;
  }
  return data;
}

export async function getCurriculumTopics() {
  const { data, error } = await supabase
    .from('curriculum_topics')
    .select('topic_name');
    
  if (error) throw error;
  return data.map(d => d.topic_name);
}
