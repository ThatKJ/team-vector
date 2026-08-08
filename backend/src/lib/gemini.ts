import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { CandidateTheory, QuestionStrategy, QuestionType, QuestionDifficulty, EvaluationSignal } from './types';

// Mock mode flag
const useMock = !process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
// Use latest flash
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

export interface GeneratedQuestion {
  question: string;
  assessmentGoal: string;
}

export const EvaluationSchema = z.object({
  signal: z.enum(['strong_positive', 'positive', 'neutral', 'negative', 'strong_negative']),
  reasoning: z.string(),
  answerSummary: z.string(),
  affectedDimensions: z.array(z.string()),
  claims: z.array(z.object({ topic: z.string(), claim: z.string() })).optional(),
});

export type EvaluationResult = z.infer<typeof EvaluationSchema>;

export async function generateQuestion(
  theory: CandidateTheory,
  strategy: QuestionStrategy,
  targetModuleId: number,
  targetDay: number,
  difficulty: QuestionDifficulty,
  questionType: QuestionType
): Promise<GeneratedQuestion> {
  if (useMock) {
    return {
      question: `(MOCK) This is a ${difficulty} ${questionType} question for module ${targetModuleId}, day ${targetDay} targeting ${strategy}.`,
      assessmentGoal: `Assess ability in module ${targetModuleId}`
    };
  }

  const prompt = `
    You are an expert AI engineering interviewer.
    Candidate: ${theory.candidateName} (${theory.candidateRole})
    Strategy: ${strategy}
    Target Module ID: ${targetModuleId}
    Target Day: ${targetDay}
    Difficulty: ${difficulty}
    Question Type: ${questionType}
    
    Previous Questions Asked: ${theory.questionsAsked}
    
    Generate the next interview question. Do not include pleasantries. Return JSON:
    {
      "question": "The interview question text",
      "assessmentGoal": "What this question specifically tests"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      question: parsed.question || "Fallback question due to parsing issue.",
      assessmentGoal: parsed.assessmentGoal || "Fallback assessment goal"
    };
  } catch (err) {
    console.error("Gemini Generation Error:", err);
    return {
      question: `Fallback: Can you explain your experience with module ${targetModuleId}?`,
      assessmentGoal: "General understanding fallback"
    };
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  targetModuleId: number
): Promise<EvaluationResult> {
  if (useMock) {
    return {
      signal: 'positive',
      reasoning: '(MOCK) The candidate provided a reasonable answer.',
      answerSummary: '(MOCK) Answered well.',
      affectedDimensions: ['reasoning']
    };
  }

  const prompt = `
    Evaluate the candidate's answer to the question.
    Question: "${question}"
    Answer: "${answer}"
    Target Module ID: ${targetModuleId}
    
    Provide your evaluation in strict JSON format matching exactly this schema:
    {
      "signal": "strong_positive" | "positive" | "neutral" | "negative" | "strong_negative",
      "reasoning": "Detailed reason for the score",
      "answerSummary": "A concise summary of what they said",
      "affectedDimensions": ["reasoning", "communication", "architectureThinking", "productionReadiness", "tradeoffAwareness"],
      "claims": [{"topic": "...", "claim": "..."}]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Zod Validation
    return EvaluationSchema.parse(parsed);
  } catch (err) {
    console.error("Gemini Evaluation Error:", err);
    return {
      signal: 'neutral',
      reasoning: "Failed to parse evaluation, defaulting to neutral.",
      answerSummary: "Evaluation failed.",
      affectedDimensions: []
    };
  }
}

export async function generateFeedback(theory: CandidateTheory) {
  if (useMock) {
    return {
      summary: "(MOCK) Good overall performance.",
      strengths: ["(MOCK) Python basics", "(MOCK) Quick learner"],
      gaps: ["(MOCK) RAG nuances"],
      next: ["(MOCK) Study advanced retrieval"]
    };
  }

  const prompt = `
    Generate final interview feedback.
    Candidate: ${theory.candidateName}
    Total Questions: ${theory.questionsAsked}
    
    Return strict JSON:
    {
      "summary": "Overall summary",
      "strengths": ["string"],
      "gaps": ["string"],
      "next": ["string"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    return { summary: "Feedback generation failed", strengths: [], gaps: [], next: [] };
  }
}
