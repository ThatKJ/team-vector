import { InterviewState, Candidate } from './types';
import { generateInitialTheory } from './candidateAnalyzer';

// In-memory session store (Map<string, InterviewState>)
const sessionStore = new Map<string, InterviewState>();

export function createSession(sessionId: string, candidate: Candidate): InterviewState {
  if (sessionStore.has(sessionId)) {
    throw new Error('Session already exists');
  }

  const initialTheory = generateInitialTheory(sessionId, candidate);

  const newState: InterviewState = {
    sessionId,
    candidate,
    theory: initialTheory,
    currentStrategy: 'EXPLORE', // Round 1 rule
    currentDifficulty: 'medium', // Default
    isComplete: false,
    conversationHistory: [],
  };

  sessionStore.set(sessionId, newState);
  return newState;
}

export function getSession(sessionId: string): InterviewState | undefined {
  return sessionStore.get(sessionId);
}

export function updateSession(sessionId: string, updates: Partial<InterviewState>): InterviewState {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const updatedSession = { ...session, ...updates };
  sessionStore.set(sessionId, updatedSession);
  return updatedSession;
}

export function finishSession(sessionId: string, feedback: NonNullable<InterviewState['feedback']>): InterviewState {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.isComplete = true;
  session.feedback = feedback;
  return session;
}

export function deleteSession(sessionId: string): boolean {
  return sessionStore.delete(sessionId);
}
