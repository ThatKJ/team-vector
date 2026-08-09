import { describe, it, expect } from 'vitest';
import { updateKnowledgeState } from '../../src/assessment/knowledge-state';
import { CandidateKnowledgeState, EvaluatorOutput } from '../../src/core/types';

describe('Knowledge State Engine', () => {
  it('correctly initializes and updates a new competency', () => {
    const initialState: CandidateKnowledgeState = {
      candidateId: 'test',
      sessionId: 'test',
      global: { confidence: 0, evidenceCoverage: 0, consistency: 1, communicationQuality: 1 },
      competencies: {},
      misconceptions: [],
      strengths: [],
      weaknesses: [],
      claims: [],
      unresolvedHypotheses: [],
      trajectory: []
    };

    const evalOutput: EvaluatorOutput = {
      correctness: 0.9,
      depth: 0.8,
      reasoning: 0.8,
      application: 0.8,
      communication: 0.9,
      confidence: 0.85,
      uncertainty: 0.2,
      demonstratedConcepts: ['concept A'],
      missingConcepts: [],
      misconceptions: [],
      claims: [],
      evidenceQuality: 'strong',
      recommendedNextAction: 'MOVE_ON'
    };

    const newState = updateKnowledgeState(initialState, evalOutput, 'System Design', 'turn_1', 'advance');

    expect(newState.competencies['System Design']).toBeDefined();
    expect(newState.competencies['System Design'].evidenceCount).toBe(1);
    expect(newState.competencies['System Design'].conceptualUnderstanding).toBeCloseTo(0.8);
    expect(newState.competencies['System Design'].uncertainty).toBeDefined();
    expect(newState.global.consistency).toBeCloseTo(0.9, 2);
  });

  it('detects and logs misconceptions correctly', () => {
    const initialState: CandidateKnowledgeState = {
      candidateId: 'test',
      sessionId: 'test',
      global: { confidence: 0, evidenceCoverage: 0, consistency: 1, communicationQuality: 1 },
      competencies: {},
      misconceptions: [],
      strengths: [],
      weaknesses: [],
      claims: [],
      unresolvedHypotheses: [],
      trajectory: []
    };

    const evalOutput: EvaluatorOutput = {
      correctness: 0.2,
      depth: 0.1,
      reasoning: 0.2,
      application: 0.1,
      communication: 0.8,
      confidence: 0.9, // high confidence in their wrong answer
      uncertainty: 0.1,
      demonstratedConcepts: [],
      missingConcepts: ['Concept B'],
      misconceptions: [{ concept: 'Concept B', description: 'Fundamentally misunderstood X for Y', severity: 'critical' }],
      claims: [],
      evidenceQuality: 'strong',
      recommendedNextAction: 'REMEDIATE'
    };

    const newState = updateKnowledgeState(initialState, evalOutput, 'System Design', 'turn_2', 'remediate');

    expect(newState.misconceptions).toHaveLength(1);
    expect(newState.misconceptions[0].concept).toBe('Concept B');
    expect(newState.misconceptions[0].severity).toBe('critical');
  });
});
