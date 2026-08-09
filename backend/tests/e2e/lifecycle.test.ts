import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InterviewOrchestrator } from '../../src/core/orchestrator';
import { supabase } from '../../src/db/client';
import crypto from 'crypto';

// Mock Groq
vi.mock('../../src/llm/groq', () => {
  return {
    groqProvider: {
      generateStructuredContent: vi.fn()
    }
  };
});

import { groqProvider } from '../../src/llm/groq';

describe('Candidate & Session Lifecycle', () => {
  let candidateId: string;

  beforeEach(async () => {
    candidateId = crypto.randomUUID();
    
    // Seed candidate
    await supabase.from('candidates').upsert({
      id: candidateId,
      name: 'Test Candidate',
      email: 'test@example.com',
      job_role: 'Engineer',
      status: 'pending'
    });
    vi.clearAllMocks();
  });

  it('generates a new session UUID successfully', async () => {
    const sessionId = crypto.randomUUID();
    
    // Mock the LLM to return valid init response
    (groqProvider.generateStructuredContent as any).mockResolvedValue({
      turn: 1,
      question: "Hello",
      evaluation: { is_complete: false },
      decision: { strategy: 'BASELINE' }
    });

    const initResult = await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    expect(initResult.isNew).toBe(true);
    
    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    expect(session).not.toBeNull();
    expect(session?.candidate_id).toBe(candidateId);
  });

  it('returns isNew=false for idempotent initialization', async () => {
    const sessionId = crypto.randomUUID();
    
    (groqProvider.generateStructuredContent as any).mockResolvedValue({
      turn: 1,
      question: "Hello",
      evaluation: { is_complete: false },
      decision: { strategy: 'BASELINE' }
    });

    // First initialization
    const init1 = await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    expect(init1.isNew).toBe(true);

    // Second initialization with same session
    const init2 = await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    expect(init2.isNew).toBe(false);
  });

  it('maintains distinct sessions for the same candidate', async () => {
    const sessionId1 = crypto.randomUUID();
    const sessionId2 = crypto.randomUUID();
    
    (groqProvider.generateStructuredContent as any).mockResolvedValue({
      turn: 1,
      question: "Hello",
      evaluation: { is_complete: false },
      decision: { strategy: 'BASELINE' }
    });

    const init1 = await InterviewOrchestrator.initializeSession(candidateId, sessionId1);
    const init2 = await InterviewOrchestrator.initializeSession(candidateId, sessionId2);
    
    expect(init1.isNew).toBe(true);
    expect(init2.isNew).toBe(true);

    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('candidate_id', candidateId);
      
    expect(sessions?.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects continuing a completed session', async () => {
    const sessionId = crypto.randomUUID();
    
    (groqProvider.generateStructuredContent as any).mockResolvedValue({
      turn: 1,
      question: "Hello",
      evaluation: { is_complete: false },
      decision: { strategy: 'BASELINE' }
    });

    await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    
    // Manually mark as completed
    await supabase.from('interview_sessions').update({ status: 'COMPLETED' }).eq('id', sessionId);
    
    // Try to process a turn
    await expect(InterviewOrchestrator.processTurn(sessionId, "answer"))
      .rejects
      .toThrow('SESSION_ALREADY_COMPLETED');
  });

  it('handles two simultaneous initialization requests idempotently', async () => {
    const sessionId = crypto.randomUUID();

    (groqProvider.generateStructuredContent as any).mockResolvedValue({
      turn: 1,
      question: "Simultaneous init question",
      evaluation: { is_complete: false },
      decision: { strategy: 'BASELINE' }
    });

    // Fire two promises concurrently
    const p1 = InterviewOrchestrator.initializeSession(candidateId, sessionId);
    const p2 = InterviewOrchestrator.initializeSession(candidateId, sessionId);
    
    // Using Promise.allSettled because one might reject with a unique constraint error depending on timing, 
    // but the DB handles it without duplicate sessions. In reality, one succeeds and the other might fail 
    // or both succeed if one resolves after the other creates it.
    await Promise.allSettled([p1, p2]);

    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId);
      
    // Exactly ONE session should exist
    expect(sessions?.length).toBe(1);
  });

  it('throws CANDIDATE_NOT_FOUND for nonexistent candidate UUID', async () => {
    const fakeId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    await expect(InterviewOrchestrator.initializeSession(fakeId, sessionId))
      .rejects
      .toThrow('CANDIDATE_NOT_FOUND');
  });

  it('does not throw PGRST116 when Supabase returns zero rows during session lookup', async () => {
    const sessionId = crypto.randomUUID();
    // initializeSession performs a session lookup that will return zero rows since it does not exist.
    // It should not throw PGRST116, but instead proceed to create the session.
    const result = await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    expect(result.isNew).toBe(true);
  });

  it('surfaces graceful degraded mode when every free provider is exhausted', async () => {
    const sessionId = crypto.randomUUID();
    
    await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    
    // Force the LLM to throw an LLMError (e.g. every free provider rate limited)
    const llmError = new Error('Rate limit exceeded');
    llmError.name = 'LLMError';
    (llmError as any).code = 'LLM_RATE_LIMITED';
    (groqProvider.generateStructuredContent as any).mockRejectedValue(llmError);

    try {
      await InterviewOrchestrator.processTurn(sessionId, "answer");
      expect.fail("Should have thrown");
    } catch (err: any) {
      // All free providers failed → graceful AI unavailable (never a paid model)
      expect(err.code).toBe('AI_UNAVAILABLE');
      expect(err.retryable).toBe(true);
    }
  });
});
