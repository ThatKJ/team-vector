import { LLMError, LLMProvider, LLM_ERROR_CODES } from '../llm/provider';
import { groqProvider } from '../llm/groq';
import { geminiProvider } from '../llm/gemini';
import { mockProvider } from './mock-provider';
import { modelsForTask, logConfigSummary, TASK_ZOD_SCHEMAS, policyLabel } from './registry';
import { healthManager } from './health';
import { runWithConcurrency } from './concurrency';
import { cacheKey, getCached, setCached } from './cache';
import {
  AIRequest,
  AITask,
  AIMetricsSnapshot,
  AIUnavailableError,
  ModelConfig,
  ProviderKey,
} from './types';

// ---------------------------------------------------------------------------
// AI Gateway — the ONLY entry point for LLM calls in Intervu.
//
// Free-only router: task → ordered free models → provider health/quota filter
// → concurrency-capped call → zod validation → cache. On failure, rotate to the
// next free provider. If every free provider is unavailable, the request fails
// with AIUnavailableError (graceful degraded mode) — NEVER a paid model.
// ---------------------------------------------------------------------------

const PROVIDERS: Record<ProviderKey, LLMProvider> = {
  groq: groqProvider,
  gemini: geminiProvider,
  mock: mockProvider,
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const MAX_PROVIDER_ATTEMPTS = envInt('AI_MAX_ATTEMPTS', 4);

const metrics: AIMetricsSnapshot = {
  requests: 0,
  successes: 0,
  failures: 0,
  rateLimited: 0,
  fallbacks: 0,
  cacheHits: 0,
  avgLatencyMs: 0,
  byProvider: {},
};

function isRateLimitError(err: unknown): boolean {
  return (
    err instanceof LLMError &&
    (err.code === LLM_ERROR_CODES.LLM_RATE_LIMITED ||
      /429|RATE_LIMIT|QUOTA|RESOURCE_EXHAUSTED|TOO_MANY/i.test(err.message))
  );
}

function defaultValidator(task: AITask): (value: unknown) => boolean {
  const schema = TASK_ZOD_SCHEMAS[task];
  return (value: unknown) => schema.safeParse(value).success;
}

// Best-effort quota header capture from providers that expose them.
function captureQuotaHeaders(provider: unknown, model: string): void {
  const headers = (provider as any)?.lastQuotaHeaders as Record<string, string> | undefined;
  if (headers) {
    healthManager.applyQuotaHeaders(model, headers);
    (provider as any).lastQuotaHeaders = null;
  }
}

function recordMetrics(
  model: ModelConfig,
  success: boolean,
  rateLimited: boolean,
  latencyMs: number
): void {
  metrics.requests += 1;
  if (success) metrics.successes += 1;
  else metrics.failures += 1;
  if (rateLimited) metrics.rateLimited += 1;

  const key = `${model.provider}/${model.model}`;
  const slot = (metrics.byProvider[key] ||= {
    requests: 0, successes: 0, failures: 0, rateLimited: 0, latencySumMs: 0,
  });
  slot.requests += 1;
  if (success) slot.successes += 1;
  else slot.failures += 1;
  if (rateLimited) slot.rateLimited += 1;
  slot.latencySumMs += latencyMs;

  const totalLatency = Object.values(metrics.byProvider).reduce((s, p) => s + p.latencySumMs, 0);
  metrics.avgLatencyMs = metrics.successes > 0 ? Math.round(totalLatency / metrics.requests) : 0;
}

/**
 * Single gateway entry point. All prompt modules (evaluator, planner, report)
 * route through this. Returns the validated structured output of the first
 * available free provider; throws AIUnavailableError when none can serve.
 */
export async function aiGenerateStructuredContent<T>(
  request: AIRequest
): Promise<T> {
  policyLabel();

  const key = cacheKey(request.task, request.systemPrompt, request.userPrompt, request.contextId);
  const cached = getCached<T>(key);
  if (cached !== null) {
    metrics.cacheHits += 1;
    console.log(`[AI GATEWAY] task=${request.task} status=CACHE_HIT`);
    return cached;
  }

  const validate = request.validate ?? defaultValidator(request.task);
  const candidates = modelsForTask(request.task).filter(
    (m) => m.configured && healthManager.isAvailable(m.model)
  );

  if (candidates.length === 0) {
    console.warn(`[AI GATEWAY] task=${request.task} no available free provider — graceful degraded mode`);
    throw new AIUnavailableError();
  }

  let lastError: unknown = null;

  for (let i = 0; i < candidates.length && i < MAX_PROVIDER_ATTEMPTS; i++) {
    const model = candidates[i];
    const provider = PROVIDERS[model.provider];
    if (!provider) continue;

    const start = Date.now();
    try {
      const raw = await runWithConcurrency(model.provider, async () => {
        const out = await provider.generateStructuredContent<T>(
          request.systemPrompt,
          request.userPrompt,
          request.schemaDescription,
          model.model
        );
        captureQuotaHeaders(provider, model.model);
        return out;
      });

      if (!validate(raw)) {
        throw new LLMError(
          `Invalid structured output from ${model.model}`,
          LLM_ERROR_CODES.LLM_INVALID_RESPONSE
        );
      }

      healthManager.recordSuccess(model.model);
      setCached(key, raw);
      recordMetrics(model, true, false, Date.now() - start);
      console.log(
        `[AI GATEWAY] task=${request.task} provider=${model.provider} model=${model.model} status=SUCCESS latency=${Date.now() - start}ms`
      );
      return raw;
    } catch (err) {
      lastError = err;
      healthManager.recordFailure(model.model, err);
      recordMetrics(model, false, isRateLimitError(err), Date.now() - start);
      console.warn(
        `[AI GATEWAY] task=${request.task} provider=${model.provider} model=${model.model} status=FAILED reason=${isRateLimitError(err) ? 'RATE_LIMITED' : (err as Error)?.message || 'error'}`
      );
      metrics.fallbacks += 1;
    }
  }

  console.error(
    `[AI GATEWAY] task=${request.task} all ${candidates.length} free provider(s) failed. Last: ${(lastError as Error)?.message}`
  );
  throw new AIUnavailableError();
}

export function aiMetrics(): AIMetricsSnapshot {
  return JSON.parse(JSON.stringify(metrics));
}

// Register all models with the health manager at startup.
for (const model of modelsForTask('evaluation')) {
  healthManager.register(model.provider, model.model, model.configured, model.free);
}
for (const model of modelsForTask('questionGeneration')) {
  healthManager.register(model.provider, model.model, model.configured, model.free);
}
for (const model of modelsForTask('report')) {
  healthManager.register(model.provider, model.model, model.configured, model.free);
}

logConfigSummary();
