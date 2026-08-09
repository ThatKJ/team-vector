import { geminiProvider } from '../gemini';
import { EvaluatorOutput } from '../../core/types';

const evaluatorJsonSchema = {
  type: "object",
  properties: {
    correctness: { type: "number", description: "0.0 to 1.0" },
    depth: { type: "number", description: "0.0 to 1.0" },
    reasoning: { type: "number", description: "0.0 to 1.0" },
    application: { type: "number", description: "0.0 to 1.0" },
    communication: { type: "number", description: "0.0 to 1.0" },
    confidence: { type: "number", description: "0.0 to 1.0" },
    uncertainty: { type: "number", description: "0.0 to 1.0, representing how unsure the engine is about the candidate's true capability" },
    demonstratedConcepts: { type: "array", items: { type: "string" } },
    missingConcepts: { type: "array", items: { type: "string" } },
    misconceptions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          concept: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", description: "Must be one of: minor, moderate, critical" }
        },
        required: ["concept", "description", "severity"]
      }
    },
    claims: { type: "array", items: { type: "string" } },
    evidenceQuality: { type: "string", description: "Must be one of: weak, medium, strong" },
    recommendedNextAction: { type: "string", description: "Must be one of: BASELINE, PROBE_DEPTH, PROBE_REASONING, PROBE_APPLICATION, CLARIFY_CONCEPT, TEST_TRANSFER, TEST_EDGE_CASE, CROSS_CHECK, CHALLENGE_ASSUMPTION, REMEDIATE, MOVE_ON, CONCLUDE" }
  },
  required: [
    "correctness", "depth", "reasoning", "application", "communication", "confidence", "uncertainty",
    "demonstratedConcepts", "missingConcepts", "misconceptions", "claims", "evidenceQuality", "recommendedNextAction"
  ]
};

export async function evaluateAnswer(
  targetCompetency: string,
  targetConcept: string,
  question: string,
  answer: string,
  history: { role: string, content: string }[]
): Promise<EvaluatorOutput> {
  const systemPrompt = `
You are an expert technical interviewer evaluating a candidate's answer.
You are NOT a chatbot. Evaluate the candidate's actual answer carefully.

CRITICAL EVALUATION RULES:
1. ONLY evaluate against the specific expected evidence relevant to the question asked. 
2. DO NOT penalize a candidate simply because they didn't mention every possible detail or edge case, unless the question explicitly asked for it. 
3. If a candidate gives a valid, direct answer (e.g. "python -m venv"), that is strong evidence. DO NOT invent weaknesses like "failed to mention X" if X wasn't asked.
4. Separate correctness (is it factually true), depth (do they understand why), application (can they use it), and reasoning (can they debug/tradeoff).
5. Evidence must come from the candidate's actual response. Never invent evidence.

You MUST return ONLY valid JSON matching this exact schema:
${JSON.stringify(evaluatorJsonSchema, null, 2)}
`;

  const userPrompt = `
TARGET COMPETENCY: ${targetCompetency}
TARGET CONCEPT: ${targetConcept}

Recent History:
${history.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

Analyze the candidate's answer. Identify demonstrated concepts, missing critical concepts, misconceptions, and unsupported claims of experience.
Remember: Do not invent weaknesses. Only list missing concepts if they were strictly necessary to answer the specific question asked.
Output MUST strictly conform to the required JSON schema.
`;

  return geminiProvider.generateStructuredContent<EvaluatorOutput>(systemPrompt, userPrompt, evaluatorJsonSchema);
}
