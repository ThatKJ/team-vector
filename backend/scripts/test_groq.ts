import { groqProvider } from '../src/llm/groq';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log('[GROQ TEST] Starting...');

  try {
    const evaluatorJsonSchema = {
      type: "object",
      properties: {
        correctness: { type: "number" },
        depth: { type: "number" },
        demonstratedConcepts: { type: "array", items: { type: "string" } },
        recommendedNextAction: { type: "string" }
      },
      required: ["correctness", "depth", "demonstratedConcepts", "recommendedNextAction"]
    };

    const systemPrompt = `You are a test evaluator. Return valid JSON matching: ${JSON.stringify(evaluatorJsonSchema)}`;
    const userPrompt = `Candidate answered: "A vector database uses embeddings to find similar items via ANN."`;

    console.log('[GROQ TEST] Testing Evaluator...');
    const result = await groqProvider.generateStructuredContent(systemPrompt, userPrompt, evaluatorJsonSchema);
    console.log('[GROQ TEST] Evaluator Result:', result);
    
    // Test Planner
    const plannerJsonSchema = {
      type: "object",
      properties: {
        strategy: { type: "string" },
        question: { type: "string" },
        rationale: { type: "string" }
      },
      required: ["strategy", "question", "rationale"]
    };

    console.log('[GROQ TEST] Testing Planner...');
    const pResult = await groqProvider.generateStructuredContent(`You are a test planner. Return valid JSON matching: ${JSON.stringify(plannerJsonSchema)}`, `Candidate knows ANN. Next?`, plannerJsonSchema);
    console.log('[GROQ TEST] Planner Result:', pResult);

  } catch (err) {
    console.error('[GROQ TEST] FAILED', err);
  }
}

run();
