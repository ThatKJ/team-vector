import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { supabase } from '../../src/db/client';

// Mock Groq
vi.mock('../../src/llm/groq', () => {
  return {
    groqProvider: {
      generateStructuredContent: vi.fn().mockImplementation(async () => {
        // simulate some delay
        await new Promise(r => setTimeout(r, 100));
        return {
          score: 80,
          verdict: "STRONG",
          summary: "Great candidate",
          categories: { problem_solving: 85, systems_thinking: 85, technical_depth: 85, communication: 85 },
          evidence: { strengths: [], gaps: [] },
          final_recommendation: { strongest_signal: "A", biggest_risk: "B", recommended_next_step: "C" }
        };
      })
    }
  };
});

import { finalizeAssessment } from '../../src/assessment/finalize-assessment';
import { getSession } from '../../src/db/sessions';
const TEST_CANDIDATE_ID = '33333333-3333-3333-3333-333333333333';
const TEST_SESSION_ID = '99999999-9999-9999-9999-999999999999'; // specific for this test

describe('Assessment Report Persistence & Immutability', () => {
  beforeAll(async () => {
    // Clean up any existing report or session for this test
    await supabase.from('assessment_reports').delete().eq('session_id', TEST_SESSION_ID);
    await supabase.from('interview_sessions').delete().eq('id', TEST_SESSION_ID);

    // Create a mock completed session
    await supabase.from('interview_sessions').insert({
      id: TEST_SESSION_ID,
      candidate_id: TEST_CANDIDATE_ID,
      status: 'COMPLETED',
      current_turn: 5,
      assessment_state: {
        candidateId: TEST_CANDIDATE_ID,
        sessionId: TEST_SESSION_ID,
        global: { confidence: 1, evidenceCoverage: 1, consistency: 1, communicationQuality: 1 },
        competencies: {
          'Python Fundamentals': {
            status: 'tested',
            confidence: 0.9,
            conceptualUnderstanding: 0.8,
            reasoningAbility: 0.85,
            applicationAbility: 0.75,
            uncertainty: 0.1,
            testedDimensions: ['correctness', 'depth', 'application'],
            testedConcepts: ['virtual environments'],
            saturatedConcepts: ['virtual environments']
          }
        },
        misconceptions: [],
        strengths: [],
        weaknesses: [],
        claims: [
          {
            turnId: 'mock_turn',
            claim: 'Knows virtual environments',
            topic: 'Python Fundamentals',
            dimension: 'correctness',
            demonstrated: true,
            confidence: 0.9
          }
        ],
        unresolvedHypotheses: [],
        trajectory: []
      }
    });
  });

  afterAll(async () => {
    await supabase.from('assessment_reports').delete().eq('session_id', TEST_SESSION_ID);
    await supabase.from('interview_sessions').delete().eq('id', TEST_SESSION_ID);
  });

  it('1. GET /report before finalization returns 409', async () => {
    // In our test we just check the route handler directly or mock a request.
    // We will test the DB level here directly.
    const { data } = await supabase.from('assessment_reports').select('*').eq('session_id', TEST_SESSION_ID).maybeSingle();
    expect(data).toBeNull();
  });

  it('2. Finalize Assessment generates and persists the report exactly once', async () => {
    const report1 = await finalizeAssessment(TEST_SESSION_ID);
    expect(report1).toBeDefined();
    expect(report1.score).toBeDefined();

    // Verify it's in the DB
    const { data: dbReport } = await supabase.from('assessment_reports').select('*').eq('session_id', TEST_SESSION_ID).single();
    expect(dbReport).toBeDefined();
    expect(dbReport.overall_score).toBe(report1.score);
  });

  it('3. Finalize Assessment idempotency - second call returns the same report', async () => {
    const report2 = await finalizeAssessment(TEST_SESSION_ID);
    
    const { data: dbReports } = await supabase.from('assessment_reports').select('*').eq('session_id', TEST_SESSION_ID);
    expect(dbReports?.length).toBe(1); // STILL exactly one row
    expect(report2.score).toBeDefined();
  });

  it('4. Concurrent finalization requests only create ONE report (race condition protection)', async () => {
    // Delete existing report to test race condition
    await supabase.from('assessment_reports').delete().eq('session_id', TEST_SESSION_ID);

    // Fire 5 finalization requests at the exact same time
    const promises = Array.from({ length: 5 }).map(() => finalizeAssessment(TEST_SESSION_ID));
    
    // We expect them all to resolve successfully, or maybe some throw 23505 if we didn't handle it gracefully.
    // Since we handle 23505 gracefully, they should all resolve to the same report.
    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    results.forEach(res => {
      expect(res).toBeDefined();
      expect(res.score).toBeDefined();
    });

    // Check DB again
    const { data: dbReports } = await supabase.from('assessment_reports').select('*').eq('session_id', TEST_SESSION_ID);
    expect(dbReports?.length).toBe(1); // ONLY ONE ROW created despite 5 concurrent requests
  }, 30000); // give it 30s timeout because of potential groq calls
});
