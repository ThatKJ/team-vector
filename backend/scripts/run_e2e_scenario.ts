import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import crypto from 'crypto';
import { InterviewOrchestrator } from '../src/core/orchestrator';
import { supabase } from '../src/db/client';
import { groqProvider } from '../src/llm/groq';

// Mock the LLM responses so we don't hit rate limits in E2E
const originalGenerate = groqProvider.generateStructuredContent;
(groqProvider as any).generateStructuredContent = async (systemPrompt: string, userPrompt: string, schema: any) => {
  const fullPrompt = systemPrompt + userPrompt;
  if (fullPrompt.includes('TARGET COMPETENCY')) {
    // Evaluator mock
    return {
      correctness: 0.9,
      depth: 0.8,
      reasoning: 0.8,
      application: 0.8,
      communication: 0.9,
      confidence: 0.85,
      uncertainty: 0.2,
      demonstratedConcepts: ['KV Cache', 'Autoregressive Decoding'],
      missingConcepts: [],
      misconceptions: [],
      claims: [],
      evidenceQuality: 'strong',
      recommendedNextAction: 'PROBE_DEPTH'
    };
  } else {
    // Planner mock
    return {
      targetCompetency: 'System Architecture',
      targetConcept: 'KV Cache',
      targetDimension: 'application',
      strategy: 'PROBE_APPLICATION',
      questionType: 'conceptual',
      difficulty: 3,
      rationale: 'Candidate provided strong baseline.',
      question: 'How does KV Cache affect memory bandwidth during generation?',
      expectedEvidence: ['Memory bound', 'Bandwidth'],
      uncertaintyBeingReduced: 'Application ability',
      whyNow: 'Strong foundational knowledge demonstrated.',
      stopCondition: 'Demonstrates understanding of memory limits.'
    };
  }
};

async function runScenario() {
  console.log("Setting up E2E Adaptive Scenario Test...");
  
  const candidateId = 'b0e00000-0000-4000-8000-000000000001';
  await supabase.from('candidates').upsert({
    id: candidateId,
    name: 'E2E Test Candidate',
    email: 'e2e@example.com',
    job_role: 'AI Engineer',
    status: 'pending'
  });

  const sessionId = crypto.randomUUID();
  
  console.log("\\n--- INITIALIZATION ---");
  const init = await InterviewOrchestrator.initializeSession(candidateId, sessionId);
  console.log("Initialized Session:", init.sessionId);

  console.log("\\n--- Q1: Generating first question ---");
  let res = await InterviewOrchestrator.processTurn(sessionId, '');
  console.log("Q:", (res as any).reply);
  console.log("Debug Trace:", JSON.stringify((res as any).debugTrace, null, 2));

  console.log("\\n--- Candidate gives strong answer ---");
  res = await InterviewOrchestrator.processTurn(sessionId, "The KV cache stores the key and value tensors from previous tokens during autoregressive decoding so we don't have to recompute attention for the whole sequence. This saves a lot of compute.");
  console.log("Q:", (res as any).reply);
  console.log("Debug Trace:", JSON.stringify((res as any).debugTrace, null, 2));
  
  console.log("\\n--- TEST COMPLETE ---");
}

runScenario().catch(console.error);
