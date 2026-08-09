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
import { PlannerOutput, EvaluatorOutput } from '../../src/core/types';

describe('INTERVU Adaptation Harness', () => {
  let sessionId: string;
  let candidateId: string;

  beforeEach(async () => {
    candidateId = crypto.randomUUID();
    sessionId = crypto.randomUUID();
    
    // Seed candidate
    await supabase.from('candidates').upsert({
      id: candidateId,
      name: 'Test Candidate',
      email: 'test@example.com',
      job_role: 'Engineer',
      status: 'pending'
    });
    
    await InterviewOrchestrator.initializeSession(candidateId, sessionId);
    vi.clearAllMocks();
  });

  const mockLLM = (evals: Partial<EvaluatorOutput>[], planners: Partial<PlannerOutput>[]) => {
    let evalCount = 0;
    let plannerCount = 0;
    
    (groqProvider.generateStructuredContent as any).mockImplementation(async (systemPrompt: string, userPrompt: string) => {
      const fullPrompt = systemPrompt + userPrompt;
      if (fullPrompt.includes('TARGET COMPETENCY') || fullPrompt.includes('RECENT EVALUATION')) {
        // Evaluator
        const res = evals[evalCount] || evals[evals.length - 1];
        evalCount++;
        return {
          correctness: 0.5, depth: 0.5, reasoning: 0.5, application: 0.5, communication: 0.5,
          confidence: 0.5, uncertainty: 0.5, demonstratedConcepts: [], missingConcepts: [],
          misconceptions: [], claims: [], evidenceQuality: 'medium', recommendedNextAction: 'BASELINE',
          ...res
        };
      } else {
        // Planner
        const res = planners[plannerCount] || planners[planners.length - 1];
        plannerCount++;
        return {
          targetCompetency: 'Test Competency', targetConcept: 'Test Concept', targetDimension: 'concept',
          strategy: 'BASELINE', questionType: 'conceptual', difficulty: 3, rationale: 'test',
          expectedEvidence: [], uncertaintyBeingReduced: 'test', whyNow: 'test', question: `Test Question ${plannerCount} ${Math.random()}`,
          stopCondition: 'test',
          ...res
        };
      }
    });
  };

  it('SCENARIO A — STRONG CANDIDATE (Trajectory Verification)', async () => {
    // Turn 1: First question generated (planner only)
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    let res = await InterviewOrchestrator.processTurn(sessionId, '');
    expect((res as any).nextAction).toBe('BASELINE');
    
    // Check that BASELINE is correctly in the trajectory at index 0
    let trace = (res as any).telemetry;
    expect(trace.knowledgeState.trajectory).toHaveLength(1);
    expect(trace.knowledgeState.trajectory[0].strategy).toBe('BASELINE');
    
    // Turn 2: Strong answer -> Depth probe
    mockLLM([
      { correctness: 0.9, depth: 0.8, application: 0.9, recommendedNextAction: 'PROBE_DEPTH', uncertainty: 0.2 }
    ], [
      { strategy: 'PROBE_DEPTH', difficulty: 4 }
    ]);
    res = await InterviewOrchestrator.processTurn(sessionId, 'Very strong answer');
    
    trace = (res as any).telemetry;
    expect(trace.decision.strategy).toBe('PROBE_DEPTH');
    expect(trace.decision.nextDifficulty).toBe(4); // Difficulty increased
    expect(trace.knowledgeState.uncertainty).toBeLessThan(0.6); // Uncertainty decreases
    
    // Check that PROBE_DEPTH was successfully pushed to trajectory
    expect(trace.knowledgeState.trajectory).toHaveLength(2);
    expect(trace.knowledgeState.trajectory[0].strategy).toBe('BASELINE');
    expect(trace.knowledgeState.trajectory[1].strategy).toBe('PROBE_DEPTH');
  });

  it('SCENARIO B — WEAK CANDIDATE', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');
    
    // Weak answer -> Remediation
    mockLLM([
      { 
        correctness: 0.2, depth: 0.2, 
        recommendedNextAction: 'REMEDIATE', 
        misconceptions: [{ concept: 'Concept A', description: 'Critical mistake', severity: 'critical' }] 
      }
    ], [
      { strategy: 'REMEDIATE', difficulty: 2 } // Difficulty decreases
    ]);
    const res = await InterviewOrchestrator.processTurn(sessionId, 'Very weak answer');
    
    const trace = (res as any).telemetry;
    expect(trace.decision.strategy).toBe('REMEDIATE');
    expect(trace.decision.nextDifficulty).toBe(2);
  });

  it('SCENARIO C — STRONG THEORY / WEAK APPLICATION', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');
    
    mockLLM([
      { correctness: 0.9, application: 0.2, recommendedNextAction: 'PROBE_APPLICATION' }
    ], [
      { strategy: 'PROBE_APPLICATION', targetDimension: 'application' }
    ]);
    const res = await InterviewOrchestrator.processTurn(sessionId, 'Good theory, no application');
    
    const trace = (res as any).telemetry;
    expect(trace.decision.strategy).toBe('PROBE_APPLICATION');
  });

  it('SCENARIO D — SUPERFICIAL CANDIDATE', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');
    
    mockLLM([
      { correctness: 0.8, depth: 0.2, communication: 0.9, recommendedNextAction: 'PROBE_DEPTH' }
    ], [
      { strategy: 'PROBE_DEPTH' }
    ]);
    const res = await InterviewOrchestrator.processTurn(sessionId, 'Fluent but shallow answer');
    
    expect((res as any).telemetry.decision.strategy).toBe('PROBE_DEPTH');
  });

  it('SCENARIO E — CONTRADICTION', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');
    
    mockLLM([
      { correctness: 0.5, uncertainty: 0.8, recommendedNextAction: 'CROSS_CHECK' }
    ], [
      { strategy: 'CROSS_CHECK' }
    ]);
    const res = await InterviewOrchestrator.processTurn(sessionId, 'Contradictory statement');
    
    expect((res as any).telemetry.decision.strategy).toBe('CROSS_CHECK');
  });

  it('SCENARIO F — MASTERY / EARLY STOP', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');
    
    // Simulate high confidence across multiple competencies
    mockLLM([
      { correctness: 0.95, confidence: 0.95, recommendedNextAction: 'MOVE_ON' }
    ], [
      { strategy: 'MOVE_ON', targetCompetency: 'Comp 1' }
    ]);
    await InterviewOrchestrator.processTurn(sessionId, 'Mastery answer 1');
    
    mockLLM([
      { correctness: 0.95, confidence: 0.95, recommendedNextAction: 'MOVE_ON' }
    ], [
      { strategy: 'MOVE_ON', targetCompetency: 'Comp 2' }
    ]);
    await InterviewOrchestrator.processTurn(sessionId, 'Mastery answer 2');
    
    mockLLM([
      { correctness: 0.95, confidence: 0.95, recommendedNextAction: 'CONCLUDE' }
    ], [
      { strategy: 'CONCLUDE', targetCompetency: 'Comp 3' }
    ]);
    
    // The orchestrator's `shouldStop` will trigger if >= 3 competencies have high confidence
    const res = await InterviewOrchestrator.processTurn(sessionId, 'Mastery answer 3');
    
    expect((res as any).done).toBe(true);
    expect((res as any).reportId).toBe(sessionId);
  });

  it('SCENARIO G — QUALITY GATE: SEMANTIC DUPLICATE REJECTION', async () => {
    // We mock the LLM to return the exact same semantic fingerprint twice in a row.
    // The orchestrator should try to reject it (which we can observe by checking if it calls generateNextQuestion multiple times for the second turn).
    const fp1: any = { competency: 'C1', concept: 'Concept A', targetDimension: 'concept', taskType: 'explain', cognitiveOperation: 'recall', scenario: 'none', expectedEvidence: [], difficulty: 3, adaptationStrategy: 'PROBE_DEPTH' };
    
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3, targetConcept: 'Concept A', fingerprint: fp1 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');

    mockLLM([
      { correctness: 0.9, recommendedNextAction: 'PROBE_DEPTH' }
    ], [
      { strategy: 'PROBE_DEPTH', targetConcept: 'Concept A', targetDimension: 'concept', fingerprint: fp1 }
    ]);
    
    const generateSpy = vi.spyOn(groqProvider, 'generateStructuredContent');
    generateSpy.mockClear();
    
    await InterviewOrchestrator.processTurn(sessionId, 'Answer 1');
    
    // Because the mock keeps returning the same semantic duplicate, the orchestrator should hit maxAttempts (3)
    // plus the evaluator call (1), meaning generateStructuredContent is called 4 times.
    expect(generateSpy).toHaveBeenCalledTimes(4);
  });

  it('SCENARIO H — QUALITY GATE: MAX CONSECUTIVE STRATEGY REJECTION', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3 }]);
    await InterviewOrchestrator.processTurn(sessionId, '');

    // Turn 2: PROBE_DEPTH
    mockLLM([{ correctness: 0.9 }], [{ strategy: 'PROBE_DEPTH' }]);
    await InterviewOrchestrator.processTurn(sessionId, 'Answer');

    // Turn 3: PROBE_DEPTH (Valid, 2nd time)
    mockLLM([{ correctness: 0.9 }], [{ strategy: 'PROBE_DEPTH' }]);
    await InterviewOrchestrator.processTurn(sessionId, 'Answer');

    // Turn 4: PROBE_DEPTH (Invalid, 3rd time in a row)
    mockLLM([{ correctness: 0.9 }], [{ strategy: 'PROBE_DEPTH' }]);
    
    const generateSpy = vi.spyOn(groqProvider, 'generateStructuredContent');
    generateSpy.mockClear();
    
    await InterviewOrchestrator.processTurn(sessionId, 'Answer');
    
    // It should hit maxAttempts (3) trying to get a different strategy, plus 1 evaluator call.
    expect(generateSpy).toHaveBeenCalledTimes(4);
  });

  it('SCENARIO I — QUALITY GATE: SATURATED CONCEPT REJECTION', async () => {
    mockLLM([], [{ strategy: 'BASELINE', difficulty: 3, targetCompetency: 'Comp 1', targetConcept: 'Saturated Concept' }]);
    await InterviewOrchestrator.processTurn(sessionId, '');

    // Mock an evaluation that leads to high confidence and saturation
    mockLLM([
      { 
        correctness: 0.95, depth: 0.95, application: 0.95, reasoning: 0.95, 
        confidence: 0.95, uncertainty: 0.1, 
        demonstratedConcepts: ['Saturated Concept'] 
      }
    ], [
      { strategy: 'PROBE_DEPTH', targetCompetency: 'Comp 1', targetConcept: 'Saturated Concept' }
    ]);
    
    const generateSpy = vi.spyOn(groqProvider, 'generateStructuredContent');
    generateSpy.mockClear();
    
    await InterviewOrchestrator.processTurn(sessionId, 'Perfect answer covering all dimensions');
    
    // Since the concept becomes saturated in updateKnowledgeState during this turn,
    // when the planner returns 'Saturated Concept' again, the orchestrator should reject it 3 times.
    expect(generateSpy).toHaveBeenCalledTimes(4);
  });
});
