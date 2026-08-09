import { groqProvider } from '../groq';
import { PlannerOutput, CandidateKnowledgeState, EvaluatorOutput } from '../../core/types';

const plannerJsonSchema = {
  type: "object",
  properties: {
    targetCompetency: { type: "string" },
    targetConcept: { type: "string" },
    targetDimension: { type: "string" },
    strategy: { type: "string", description: "Must be one of: BASELINE, PROBE_DEPTH, PROBE_REASONING, PROBE_APPLICATION, CLARIFY_CONCEPT, TEST_TRANSFER, TEST_EDGE_CASE, CROSS_CHECK, CHALLENGE_ASSUMPTION, REMEDIATE, MOVE_ON, CONCLUDE" },
    questionType: { type: "string", description: "Must be one of: baseline, conceptual, application, debugging, tradeoff, system_design, counterfactual, cross_check" },
    difficulty: { type: "integer", description: "1-5" },
    rationale: { type: "string" },
    purpose: { type: "string", description: "Explicit explanation of what NEW evidence this question will obtain. If it doesn't obtain new evidence, it will be rejected." },
    expectedEvidence: { type: "array", items: { type: "string" } },
    uncertaintyBeingReduced: { type: "string" },
    uncertaintyBefore: { type: "number", description: "0.0 to 1.0" },
    uncertaintyAfter: { type: "number", description: "Expected uncertainty after this question (0.0 to 1.0)" },
    informationGain: { type: "number", description: "Expected information gain (0.0 to 1.0)" },
    whyNow: { type: "string" },
    question: { type: "string" },
    stopCondition: { type: "string" },
    fingerprint: {
      type: "object",
      properties: {
        competency: { type: "string" },
        concept: { type: "string" },
        targetDimension: { type: "string" },
        taskType: { type: "string" },
        cognitiveOperation: { type: "string" },
        scenario: { type: "string" },
        expectedEvidence: { type: "array", items: { type: "string" } },
        difficulty: { type: "integer" },
        adaptationStrategy: { type: "string" }
      },
      required: ["competency", "concept", "targetDimension", "taskType", "cognitiveOperation", "scenario", "expectedEvidence", "difficulty", "adaptationStrategy"]
    }
  },
  required: [
    "targetCompetency", "targetConcept", "targetDimension", "strategy", "questionType", "difficulty",
    "rationale", "purpose", "expectedEvidence", "uncertaintyBeingReduced", "uncertaintyBefore", "uncertaintyAfter", "informationGain", "whyNow", "question", "stopCondition", "fingerprint"
  ]
};

export async function generateNextQuestion(
  state: CandidateKnowledgeState,
  lastEvaluation: EvaluatorOutput | null,
  history: { role: string, content: string }[],
  curriculumTopics: string[],
  currentTurnNumber: number,
  rejectionReason: string = ""
): Promise<PlannerOutput> {
  const saturatedConcepts = Object.values(state.competencies).flatMap(c => c.saturatedConcepts || []);

  const systemPrompt = `
You are the Adaptive Question Planner for an elite technical assessment engine.
Your task is to determine the optimal next question to ask the candidate to build an accurate evidence graph of their capability.

CRITICAL RULES FOR ADAPTATION:
1. DO NOT repeatedly ask the same question or strategy for the same concept.
2. If foundational knowledge is established (e.g. they answered a PROBE_DEPTH well), YOU MUST ESCALATE. 
   - Escalate to PROBE_APPLICATION, CROSS_CHECK, or TEST_BOUNDARY.
3. If they show misconceptions, pivot to REMEDIATE or CLARIFY_CONCEPT.
4. If a competency is sufficiently tested, pivot to a new competency via BASELINE or CROSS_CHECK.
5. Every question MUST have an explicit purpose. Ask yourself: "What NEW evidence will this obtain?"
6. BASELINE strategy is ONLY allowed on Turn 1. DO NOT use BASELINE if Turn > 1.
7. Do NOT use the same strategy more than twice in a row. You MUST transition to a different strategy (e.g., PROBE_DEPTH -> PROBE_APPLICATION).
8. SATURATED CONCEPTS: You MUST NOT ask about the following saturated concepts: ${saturatedConcepts.length ? saturatedConcepts.join(', ') : 'None'}.
9. The semantic fingerprint MUST accurately classify the question to prevent repetition.

You MUST return ONLY valid JSON matching this exact schema:
${JSON.stringify(plannerJsonSchema, null, 2)}
`;

  const userPrompt = `
CURRENT TURN: ${currentTurnNumber}

Available Curriculum Topics:
${curriculumTopics.join(', ')}

Candidate Knowledge State (Compact):
${JSON.stringify({ 
  global: state.global, 
  competencies: state.competencies,
  trajectory: state.trajectory.slice(-3)
}, null, 2)}

${lastEvaluation ? `Last Evaluation:\n${JSON.stringify({
  misconceptions: lastEvaluation.misconceptions,
  uncertainty: lastEvaluation.uncertainty,
  recommendedNextAction: lastEvaluation.recommendedNextAction
}, null, 2)}` : ''}

Recent History:
${history.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

${rejectionReason ? `\nCRITICAL WARNING: YOUR PREVIOUS GENERATION WAS REJECTED. REASON: ${rejectionReason}\nYOU MUST FIX THIS IN YOUR NEW GENERATION.\n` : ''}

Based on the evidence gathered so far, select the target competency and concept. 
Decide on a specific question type and difficulty. 
Generate the actual question text and the semantic fingerprint.
Provide the reasoning and purpose for this selection.
`;

  return groqProvider.generateStructuredContent<PlannerOutput>(systemPrompt, userPrompt, plannerJsonSchema);
}
