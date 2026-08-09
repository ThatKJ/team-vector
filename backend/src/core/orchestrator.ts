import { InterviewStateMachine } from './state-machine';
import { CandidateKnowledgeState, PlannerOutput, EvaluatorOutput } from './types';
import { evaluateAnswer } from '../llm/prompts/evaluator';
import { generateNextQuestion } from '../llm/prompts/planner';
import { updateKnowledgeState } from '../assessment/knowledge-state';
import { 
  getSession, createSession, updateSessionState, 
  getInterviewHistory, addInterviewTurn, getCandidate, getCurriculumTopics
} from '../db/sessions';
import { addTurnEvaluation, addCompetencyEvidence, addAdaptationEvent } from '../db/evidence';

export class InterviewOrchestrator {
  
  static async initializeSession(candidateId: string, sessionId: string) {
    let session = await getSession(sessionId);
    if (session) {
      // Idempotent: return existing
      return { 
        sessionId: session.id,
        isNew: false,
        state: session.assessment_state as CandidateKnowledgeState
      };
    }

    const candidate = await getCandidate(candidateId);
    
    const initialState: CandidateKnowledgeState = {
      candidateId,
      sessionId,
      global: {
        confidence: 0,
        evidenceCoverage: 0,
        consistency: 1,
        communicationQuality: 1
      },
      competencies: {},
      misconceptions: [],
      strengths: [],
      weaknesses: [],
      claims: [],
      unresolvedHypotheses: [],
      trajectory: []
    };

    const newSession = await createSession(sessionId, candidateId, initialState);
    
    return {
      sessionId: newSession.id,
      isNew: true,
      state: initialState
    };
  }

  static async processTurn(sessionId: string, candidateMessage: string) {
    const session = await getSession(sessionId);
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.status === 'COMPLETED') throw new Error('SESSION_ALREADY_COMPLETED');

    const state = session.assessment_state as CandidateKnowledgeState;
    const currentTurnNumber = session.current_turn;
    const history = await getInterviewHistory(sessionId);

    // If it's the very first turn and candidateMessage is null/empty, we just generate the first question
    if (currentTurnNumber === 0 && !candidateMessage) {
      return this.generateQuestionPhase(sessionId, currentTurnNumber + 1, state);
    }

    // 1. Record candidate answer
    const turn = await addInterviewTurn(sessionId, currentTurnNumber + 1, 'candidate', candidateMessage);

    // 2. Evaluate answer
    const lastQuestionTurn = history[history.length - 1];
    const targetCompetency = session.current_competency || 'General';
    const targetConcept = lastQuestionTurn?.target_concept || 'Background';
    
    const evaluation = await evaluateAnswer(
      targetCompetency, 
      targetConcept, 
      lastQuestionTurn?.content || '', 
      candidateMessage, 
      history.map((h: any) => ({ role: h.role === 'interviewer' ? 'assistant' : 'user', content: h.content }))
    );

    await addTurnEvaluation(turn.id, evaluation);

    // 3. Extract evidence
    const evidenceObj = {
      concept: targetConcept,
      evidence: evaluation.demonstratedConcepts,
      strength: 'conceptual' as any,
      missing: evaluation.missingConcepts,
      confidence: evaluation.confidence,
      nextProbe: evaluation.recommendedNextAction
    };
    
    await addCompetencyEvidence(sessionId, turn.id, targetCompetency, evidenceObj);

    // 4. Update Knowledge State
    const newState = updateKnowledgeState(state, evaluation, targetCompetency, turn.id, evaluation.recommendedNextAction);

    // 5. Detect Stopping Condition
    if (this.shouldStop(newState, currentTurnNumber + 1)) {
      await updateSessionState(sessionId, 'COMPLETED', newState, currentTurnNumber + 1);
      return { done: true, reportId: sessionId };
    }

    // 6. Generate Next Question
    const questionPhaseResult = await this.generateQuestionPhase(sessionId, currentTurnNumber + 1, newState, evaluation);
    
    // Log LLM Budget
    console.log(`[LLM BUDGET] session=${sessionId} turn=${currentTurnNumber + 1} callsThisTurn=${1 + questionPhaseResult.plannerAttempts}`);
    
    return {
      done: questionPhaseResult.done,
      reply: questionPhaseResult.reply,
      assessmentSignal: questionPhaseResult.assessmentSignal,
      nextAction: questionPhaseResult.nextAction,
      telemetry: questionPhaseResult.telemetry
    };
  }

  private static async generateQuestionPhase(sessionId: string, currentTurnNumber: number, state: CandidateKnowledgeState, evaluation?: EvaluatorOutput) {
    const historyContext = state.trajectory.slice(-5).map(t => `Turn: ${t.turnId} | Strategy: ${t.strategy} | Decision: ${t.decision}`).join('\n');

    const topics = await getCurriculumTopics();
    const history = await getInterviewHistory(sessionId);
    
    let plannerOutput: PlannerOutput | null = null;
    let attempts = 0;
    const maxAttempts = 2;
    let rejectionReason = "";
    
    while (attempts < maxAttempts) {
      const plannerPrompt = `
      CURRENT KNOWLEDGE STATE:
      ${JSON.stringify(state.competencies, null, 2)}
      
      RECENT EVALUATION:
      ${evaluation ? JSON.stringify(evaluation, null, 2) : 'INITIALIZING'}
      
      RECENT TRAJECTORY:
      ${historyContext}
      
      ${rejectionReason ? `PREVIOUS GENERATION WAS REJECTED BECAUSE:\n${rejectionReason}\nYou MUST generate a completely different question/strategy.` : ''}
      `;
      
      plannerOutput = await generateNextQuestion(
        state, 
        evaluation || null, 
        history.map((h: any) => ({ role: h.role === 'interviewer' ? 'assistant' : 'user', content: h.content })), 
        topics,
        currentTurnNumber,
        rejectionReason // Pass rejection to prompt
      );
      
      // DIAGNOSTIC TRACE
      console.log(`\n================ TURN ${currentTurnNumber} DIAGNOSTIC ================`);
      console.log(`Question: ${plannerOutput.question.substring(0, 50)}...`);
      console.log(`Strategy: ${plannerOutput.strategy}`);
      console.log(`Target:   ${plannerOutput.targetCompetency}`);
      console.log(`Dim:      ${plannerOutput.targetDimension}`);
      console.log(`Uncertainty Before: ${plannerOutput.uncertaintyBefore}, After: ${plannerOutput.uncertaintyAfter}, Gain: ${plannerOutput.informationGain}`);
      console.log(`====================================================\n`);

      rejectionReason = ""; // reset
      let isAccepted = true;

      if (plannerOutput.strategy === 'BASELINE' && currentTurnNumber > 1) {
        throw new Error(`DIAGNOSTIC ERROR: BASELINE strategy generated on turn ${currentTurnNumber}`);
      }

      // 1. Saturated Concept Rule
      const compState = state.competencies[plannerOutput.targetCompetency];
      if (compState?.saturatedConcepts?.includes(plannerOutput.targetConcept)) {
        isAccepted = false;
        rejectionReason = `Target concept '${plannerOutput.targetConcept}' is already SATURATED. You must MOVE_ON to a different concept or competency.`;
      }

      // 2. Maximum consecutive same-strategy rule (Max 2)
      const lastTwo = state.trajectory.slice(-2);
      if (lastTwo.length === 2 && lastTwo[0].strategy === plannerOutput.strategy && lastTwo[1].strategy === plannerOutput.strategy) {
        // Exception: REMEDIATE and CROSS_CHECK can continue if explicitly justified, but generally force transition
        if (plannerOutput.strategy !== 'REMEDIATE') {
          isAccepted = false;
          rejectionReason = `Strategy '${plannerOutput.strategy}' has been used for 3 consecutive turns. You MUST transition to a different strategy.`;
        }
      }

      // 3. Semantic Novelty Gate
      const recentFingerprints = state.trajectory.slice(-4).map(t => t.fingerprint).filter(f => f);
      for (const fp of recentFingerprints) {
        if (!fp) continue;
        if (fp.concept === plannerOutput.targetConcept && fp.targetDimension === plannerOutput.targetDimension && fp.taskType === plannerOutput.fingerprint?.taskType) {
           isAccepted = false;
           rejectionReason = `Semantic Duplicate: You already tested concept '${fp.concept}' on dimension '${fp.targetDimension}' with task type '${fp.taskType}'. Change the dimension or concept.`;
           break;
        }
      }

      // 4. Lexical Novelty Gate (Fallback)
      if (isAccepted) {
        const recentQuestions = history.filter((h: any) => h.role === 'interviewer').slice(-3).map((h: any) => h.content.toLowerCase());
        const newQuestionWords = new Set(plannerOutput.question.toLowerCase().split(/\\W+/));
        
        for (const oldQ of recentQuestions) {
          const oldWords = new Set(oldQ.split(/\\W+/));
          const intersection = new Set([...newQuestionWords].filter(x => oldWords.has(x)));
          const union = new Set([...newQuestionWords, ...oldWords]);
          const jaccard = intersection.size / union.size;
          
          if (jaccard > 0.4 && plannerOutput.strategy !== 'CLARIFY_CONCEPT') {
            isAccepted = false;
            rejectionReason = `Lexical Duplicate: The wording is too similar to a recent question (${Math.round(jaccard*100)}% overlap). Ask something fundamentally different.`;
            break;
          }
        }
      }

      if (isAccepted) break;
      console.warn(`[NOVELTY GUARD] Rejecting question: ${rejectionReason}`);
      attempts++;
    }

    if (!plannerOutput || attempts >= maxAttempts) {
      if (!plannerOutput) throw new Error('LLM_INVALID_RESPONSE');
      console.warn("[NOVELTY GUARD] Max attempts reached, forcing fallback cross-check question.");
      plannerOutput = {
        ...plannerOutput,
        strategy: 'CROSS_CHECK',
        targetConcept: 'integration',
        question: `Let's switch gears a bit. How would you approach integrating the concepts we've discussed so far into a larger, distributed system? What specific challenges would you anticipate?`,
        rationale: 'Forced fallback due to novelty guard max attempts reached.',
      }
    }

    const nextTurn = await addInterviewTurn(sessionId, currentTurnNumber, 'interviewer', plannerOutput.question, {
      questionType: plannerOutput.questionType,
      targetCompetency: plannerOutput.targetCompetency,
      difficulty: plannerOutput.difficulty
    });

    // Record the ACTUAL strategy the planner used
    state.trajectory.push({
      turnId: nextTurn.id,
      strategy: plannerOutput.strategy,
      decision: plannerOutput.rationale,
      fingerprint: plannerOutput.fingerprint
    });

    await addAdaptationEvent(sessionId, nextTurn.id, plannerOutput.strategy, plannerOutput.rationale, state, state); // naive state snapshot

    await updateSessionState(sessionId, 'ASSESSING', state, currentTurnNumber);
    
    // Update current competency in session
    const { supabase } = await import('../db/client');
    await supabase.from('interview_sessions').update({ current_competency: plannerOutput.targetCompetency }).eq('id', sessionId);

    return {
      done: false,
      reply: plannerOutput.question,
      assessmentSignal: plannerOutput.rationale, // For UI demo purposes
      nextAction: plannerOutput.strategy,
      telemetry: {
        knowledgeState: {
          competencies: state.competencies,
          uncertainty: state.competencies[plannerOutput.targetCompetency]?.uncertainty || 1,
          trajectory: state.trajectory
        },
        decision: {
          turn: currentTurnNumber,
          strategy: plannerOutput.strategy,
          targetCompetency: plannerOutput.targetCompetency,
          rationale: plannerOutput.rationale,
          whyNow: plannerOutput.whyNow,
          expectedEvidence: plannerOutput.expectedEvidence,
          nextDifficulty: plannerOutput.difficulty
        }
      },
      plannerAttempts: attempts === 0 ? 1 : attempts
    };
  }

  private static shouldStop(state: CandidateKnowledgeState, turnNumber: number): boolean {
    const MAX_TURNS = 10;
    if (turnNumber >= MAX_TURNS) return true;
    
    const tested = Object.values(state.competencies).filter(c => c.status !== 'untested');
    if (tested.length === 0) return false;

    // Stop if we have strong confidence across enough topics
    if (tested.length >= 3 && tested.every(c => c.confidence > 0.85)) {
      return true;
    }

    // Stop if a candidate is demonstrating severe weakness confidently across multiple topics
    const weakCount = tested.filter(c => c.confidence > 0.8 && c.conceptualUnderstanding < 0.3).length;
    if (weakCount >= 2) {
      return true;
    }

    // Stop if user is not able to answer anything after the 4th question
    if (turnNumber >= 4) {
      const unableToAnswerCount = tested.filter(c => c.conceptualUnderstanding < 0.3).length;
      if (unableToAnswerCount >= 2 || (tested.length > 0 && tested.every(c => c.conceptualUnderstanding < 0.4))) {
        return true;
      }
    }

    // Stop if average uncertainty is very low and we've done at least 5 turns
    const avgUncertainty = tested.reduce((acc, c) => acc + c.uncertainty, 0) / tested.length;
    if (turnNumber >= 5 && avgUncertainty < 0.25) {
      return true;
    }

    return false;
  }
}
