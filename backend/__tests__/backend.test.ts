import { describe, it, expect, beforeEach } from 'vitest';
import { generateInitialTheory } from '../src/lib/candidateAnalyzer';
import { createSession, getSession, updateSession } from '../src/lib/sessionManager';
import { updateTheory, adjustDifficulty, boundScore } from '../src/lib/theoryEngine';
import { determineNextStrategy, determineRoundAndCompletion } from '../src/lib/strategyEngine';
import candidatesData from '../src/lib/data/candidates.json';
import { Candidate, CandidateTheory } from '../src/lib/types';

describe('Backend Engine Tests', () => {
  const candidates: Candidate[] = candidatesData as Candidate[];
  const emily = candidates.find(c => c.id === 'CAND-003')!;
  const gerald = candidates.find(c => c.id === 'CAND-010')!;

  describe('Candidate Analyzer & Module Mapping', () => {
    it('generates deterministic initial theory based on missions', () => {
      const theory = generateInitialTheory('test-123', emily);
      expect(theory.candidateName).toBe('Emily Chen');
      expect(theory.modules[1].score).toBe(85); // Passed 1st attempt
      expect(theory.modules[5].score).toBe(75); // Passed 2nd attempt (85 - (2*5))
    });

    it('identifies failures and skips correctly for Gerald', () => {
      const theory = generateInitialTheory('test-124', gerald);
      expect(theory.modules[3].score).toBe(30); // Failed Vector DB
      expect(theory.modules[5].score).toBe(40); // Skipped RAG
    });
  });

  describe('Theory Engine', () => {
    let theory: CandidateTheory;
    beforeEach(() => {
      theory = generateInitialTheory('t1', emily);
    });

    it('updates theory scores within bounds deterministically', () => {
      const updated = updateTheory(theory, 'strong_positive', 'great answer', 'summary', 'Q1', 1, ['reasoning']);
      expect(updated.modules[1].score).toBe(100); // 85 + 15 = 100
      expect(updated.dimensions.reasoning.score).toBe(65); // 50 + 15
      expect(updated.evidence.length).toBe(1);
    });

    it('bounds scores correctly', () => {
      expect(boundScore(110)).toBe(100);
      expect(boundScore(-10)).toBe(0);
    });

    it('adjusts difficulty correctly', () => {
      expect(adjustDifficulty('medium', 'strong_positive')).toBe('hard');
      expect(adjustDifficulty('easy', 'negative')).toBe('easy'); // Bound lower
      expect(adjustDifficulty('expert', 'strong_positive')).toBe('expert'); // Bound upper
    });
  });

  describe('Strategy Engine', () => {
    it('selects strategy based on round', () => {
      const theory = generateInitialTheory('t1', emily);
      expect(determineNextStrategy(theory)).toBe('EXPLORE');
      
      theory.currentRound = 2;
      // Emily has no score < 60 initially, so should VALIDATE_STRENGTH
      expect(determineNextStrategy(theory)).toBe('VALIDATE_STRENGTH');

      const geraldTheory = generateInitialTheory('t2', gerald);
      geraldTheory.currentRound = 2;
      // Gerald has failed modules (score 30, 40), so should PROBE_WEAKNESS
      expect(determineNextStrategy(geraldTheory)).toBe('PROBE_WEAKNESS');
    });

    it('enforces min 8 questions logic', () => {
      const theory = generateInitialTheory('t1', emily);
      
      theory.questionsAsked = 1;
      expect(determineRoundAndCompletion(theory).newRound).toBe(2);
      
      theory.questionsAsked = 8;
      expect(determineRoundAndCompletion(theory).isComplete).toBe(true);
    });
  });

  describe('Session Manager', () => {
    it('persists and updates sessions', () => {
      const session = createSession('sid-1', emily);
      expect(session.sessionId).toBe('sid-1');
      expect(session.currentStrategy).toBe('EXPLORE');

      updateSession('sid-1', { currentDifficulty: 'expert' });
      const retrieved = getSession('sid-1');
      expect(retrieved?.currentDifficulty).toBe('expert');
    });
  });
});
