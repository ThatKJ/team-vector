import { z } from 'zod';
import {
  AITask,
  AI_MODE_POLICY,
  ModelConfig,
  PaidModelBlockedError,
  ProviderKey,
} from './types';

// ---------------------------------------------------------------------------
// FREE-ONLY policy — hard safety rule. Every model in this registry MUST be
// explicitly free. The router refuses anything else, always.
// ---------------------------------------------------------------------------

const ADAPTATION_STRATEGIES = [
  'BASELINE', 'PROBE_DEPTH', 'PROBE_REASONING', 'PROBE_APPLICATION',
  'CLARIFY_CONCEPT', 'TEST_TRANSFER', 'TEST_EDGE_CASE', 'CROSS_CHECK',
  'CHALLENGE_ASSUMPTION', 'REMEDIATE', 'MOVE_ON', 'CONCLUDE',
] as const;

const QUESTION_TYPES = [
  'baseline', 'conceptual', 'application', 'debugging', 'tradeoff',
  'system_design', 'counterfactual', 'cross_check',
] as const;

const VERDICTS = ['EXCEPTIONAL', 'STRONG', 'SOLID', 'DEVELOPING', 'NEEDS DEVELOPMENT'] as const;

export const TASK_ZOD_SCHEMAS: Record<AITask, z.ZodType> = {
  evaluation: z.object({
    correctness: z.coerce.number(),
    depth: z.coerce.number(),
    reasoning: z.coerce.number(),
    application: z.coerce.number(),
    communication: z.coerce.number(),
    confidence: z.coerce.number(),
    uncertainty: z.coerce.number(),
    demonstratedConcepts: z.array(z.string()),
    missingConcepts: z.array(z.string()),
    misconceptions: z.array(
      z.object({
        concept: z.string(),
        description: z.string(),
        severity: z.enum(['minor', 'moderate', 'critical']),
      })
    ),
    claims: z.array(z.string()),
    evidenceQuality: z.enum(['weak', 'medium', 'strong']),
    recommendedNextAction: z.enum(ADAPTATION_STRATEGIES),
  }),

  questionGeneration: z.object({
    targetCompetency: z.string(),
    targetConcept: z.string(),
    targetDimension: z.string(),
    strategy: z.enum(ADAPTATION_STRATEGIES),
    questionType: z.enum(QUESTION_TYPES),
    difficulty: z.coerce.number().min(1).max(5),
    rationale: z.string(),
    purpose: z.string(),
    expectedEvidence: z.array(z.string()),
    uncertaintyBeingReduced: z.string(),
    uncertaintyBefore: z.coerce.number(),
    uncertaintyAfter: z.coerce.number(),
    informationGain: z.coerce.number(),
    whyNow: z.string(),
    question: z.string().min(1),
    stopCondition: z.string(),
    fingerprint: z.object({
      competency: z.string(),
      concept: z.string(),
      targetDimension: z.string(),
      taskType: z.string(),
      cognitiveOperation: z.string(),
      scenario: z.string(),
      expectedEvidence: z.array(z.string()),
      difficulty: z.coerce.number(),
      adaptationStrategy: z.enum(ADAPTATION_STRATEGIES),
    }),
  }),

  report: z.object({
    score: z.coerce.number().min(0).max(100),
    verdict: z.enum(VERDICTS),
    summary: z.string(),
    categories: z.object({
      problem_solving: z.coerce.number(),
      systems_thinking: z.coerce.number(),
      technical_depth: z.coerce.number(),
      communication: z.coerce.number(),
    }),
    evidence: z.object({
      strengths: z.array(
        z.object({
          competency: z.string(),
          conclusion: z.string(),
          evidence: z.array(
            z.object({ turn: z.coerce.number(), claim: z.string(), demonstrated: z.boolean() })
          ),
        })
      ),
      gaps: z.array(
        z.object({
          competency: z.string(),
          conclusion: z.string(),
          evidence: z.array(
            z.object({ turn: z.coerce.number(), claim: z.string(), demonstrated: z.boolean() })
          ),
        })
      ),
    }),
    final_recommendation: z.object({
      strongest_signal: z.string(),
      biggest_risk: z.string(),
      recommended_next_step: z.string(),
    }),
  }),
};

// ---------------------------------------------------------------------------
// Free model registry — only models verified available on free tiers.
// Verified live (2026-08-09): groq gpt-oss-120b / gpt-oss-20b /
// llama-3.1-8b-instant / llama-3.3-70b-versatile accept json_object; qwen/* does
// not. Gemini is key-configured but currently 429s (quota) — the health manager
// disables it automatically. NEVER add a paid model here.
// ---------------------------------------------------------------------------

const GROQ_CONFIGURED = !!process.env.GROQ_API_KEY;
const GEMINI_CONFIGURED = !!process.env.GEMINI_API_KEY;
const MOCK_MODE = process.env.AI_MOCK_MODE && process.env.AI_MOCK_MODE !== 'none'
  ? process.env.AI_MOCK_MODE
  : null;

// Optional allow-list (comma separated provider keys). When set, only these
// providers are eligible — useful to force tests onto the mock pool or to
// hard-disable a provider in production.
const ENABLED_PROVIDERS = (process.env.AI_ENABLED_PROVIDERS || '')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

function isProviderEnabled(provider: ProviderKey): boolean {
  return ENABLED_PROVIDERS.length === 0 || ENABLED_PROVIDERS.includes(provider);
}

const FREE_MODEL_REGISTRY: ModelConfig[] = [
  // Groq — primary pool (free tier, json_object supported, per-model TPD budgets)
  {
    provider: 'groq', model: 'openai/gpt-oss-120b', free: true,
    tasks: ['evaluation', 'questionGeneration', 'report'],
    quality: 'strong', contextLimit: 131072, priority: 10, configured: GROQ_CONFIGURED && isProviderEnabled('groq'),
  },
  {
    provider: 'groq', model: 'openai/gpt-oss-20b', free: true,
    tasks: ['evaluation', 'questionGeneration'],
    quality: 'standard', contextLimit: 131072, priority: 20, configured: GROQ_CONFIGURED && isProviderEnabled('groq'),
  },
  {
    provider: 'groq', model: 'llama-3.1-8b-instant', free: true,
    tasks: ['evaluation', 'questionGeneration'],
    quality: 'fast', contextLimit: 131072, priority: 30, configured: GROQ_CONFIGURED && isProviderEnabled('groq'),
  },
  {
    provider: 'groq', model: 'llama-3.3-70b-versatile', free: true,
    tasks: ['evaluation', 'questionGeneration', 'report'],
    quality: 'strong', contextLimit: 131072, priority: 40, configured: GROQ_CONFIGURED && isProviderEnabled('groq'),
  },
  // Gemini — free tier fallback (key present, quota state discovered at runtime)
  {
    provider: 'gemini', model: 'gemini-3.5-flash', free: true,
    tasks: ['evaluation', 'questionGeneration', 'report'],
    quality: 'standard', contextLimit: 1048576, priority: 90, configured: GEMINI_CONFIGURED && isProviderEnabled('gemini'),
  },
];

if (MOCK_MODE && isProviderEnabled('mock')) {
  FREE_MODEL_REGISTRY.push(
    {
      provider: 'mock', model: 'mock-a', free: true,
      tasks: ['evaluation', 'questionGeneration', 'report'],
      quality: 'fast', contextLimit: 4096, priority: 0, configured: true,
    },
    {
      provider: 'mock', model: 'mock-b', free: true,
      tasks: ['evaluation', 'questionGeneration', 'report'],
      quality: 'fast', contextLimit: 4096, priority: 1, configured: true,
    }
  );
}

export function assertFreeModel(model: ModelConfig): void {
  if (model.free !== true) {
    throw new PaidModelBlockedError(model.model);
  }
}

function providerOrderIndex(provider: ProviderKey): number {
  const order = (process.env.AI_PROVIDER_ORDER || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const idx = order.indexOf(provider);
  return idx === -1 ? 99 : idx;
}

export function modelsForTask(task: AITask): ModelConfig[] {
  const candidates = FREE_MODEL_REGISTRY.filter((m) => m.tasks.includes(task));
  for (const model of candidates) assertFreeModel(model);
  return candidates.sort(
    (a, b) =>
      providerOrderIndex(a.provider) - providerOrderIndex(b.provider) ||
      a.priority - b.priority
  );
}

export function modelConfigFor(provider: ProviderKey, model: string): ModelConfig | null {
  return FREE_MODEL_REGISTRY.find((m) => m.provider === provider && m.model === model) || null;
}

export function getMockMode(): string | null {
  return MOCK_MODE;
}

export function mockModeForModel(model?: string): string {
  const base = MOCK_MODE || 'ok';
  if (!model) return base;
  if (model === 'mock-a') return process.env.AI_MOCK_MODE_A || base;
  if (model === 'mock-b') return process.env.AI_MOCK_MODE_B || base;
  return base;
}

export function policyLabel(): string {
  const envPolicy = process.env.AI_MODE_POLICY;
  if (envPolicy && envPolicy !== AI_MODE_POLICY) {
    console.warn(
      `[INTERVU AI] AI_MODE_POLICY=${envPolicy} ignored — enforcing ${AI_MODE_POLICY}. Free models only.`
    );
  }
  return AI_MODE_POLICY;
}

/** Startup summary — never prints API keys, only configuration state. */
export function logConfigSummary(): void {
  const lines = ['', `INTERVU AI`, `Policy: ${policyLabel()}`, ''];
  const seen = new Map<ProviderKey, boolean>();
  for (const m of FREE_MODEL_REGISTRY) {
    if (seen.has(m.provider)) continue;
    seen.set(m.provider, true);
    const mark = m.configured ? '✓ configured' : '✗ not configured';
    lines.push(`${m.provider.charAt(0).toUpperCase() + m.provider.slice(1)} ${mark}`);
    for (const mm of FREE_MODEL_REGISTRY.filter((x) => x.provider === m.provider)) {
      lines.push(`  ${mm.model} ${mm.configured ? '✓ free model configured' : '✗ missing key'}`);
    }
  }
  if (MOCK_MODE) lines.push(`Mock mode: ${MOCK_MODE}`);
  lines.push('');
  console.info(lines.join('\n'));
}
