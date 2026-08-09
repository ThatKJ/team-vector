export type AITask = "evaluation" | "questionGeneration" | "report";

export type ProviderKey = "groq" | "gemini" | "mock";

export const AI_MODE_POLICY = "FREE_ONLY";

export const AI_UNAVAILABLE_MESSAGE =
  "The AI interviewer is temporarily busy. Your progress has been saved. You can resume shortly.";

export interface ModelConfig {
  provider: ProviderKey;
  model: string;
  /** FREE_ONLY hard requirement: every registered model MUST be free. */
  free: true;
  tasks: AITask[];
  /** Task suitability: fast = low latency/token cost, strong = best reasoning. */
  quality: "fast" | "standard" | "strong";
  contextLimit: number;
  /** Lower runs first within the same task (configurable via AI_PROVIDER_ORDER). */
  priority: number;
  configured: boolean;
}

export interface ProviderHealth {
  provider: ProviderKey;
  model: string;
  configured: boolean;
  free: boolean;
  healthy: boolean;
  consecutiveFailures: number;
  rateLimited: boolean;
  /** Daily (TPD) quota exhausted — disabled until quota reset. */
  quotaExhausted: boolean;
  disabledUntil: number | null;
  retryAfterSec: number | null;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  quota: {
    remainingRequests?: number;
    remainingTokens?: number;
    resetRequestsAt?: number;
    resetTokensAt?: number;
  };
}

export interface ProviderCallOptions {
  systemPrompt: string;
  userPrompt: string;
  schemaDescription?: unknown;
  model?: string;
}

export interface AIRequest {
  task: AITask;
  systemPrompt: string;
  userPrompt: string;
  schemaDescription?: unknown;
  /** Optional strict validator; defaults to the registry's zod schema for the task. */
  validate?: (value: unknown) => boolean;
  /** Optional interview-session scope for the result cache — prevents identical
   * prompts from one session being served to another. */
  contextId?: string;
}

export class AIUnavailableError extends Error {
  public code = "AI_UNAVAILABLE";
  public retryable = true;
  constructor(message = AI_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export class PaidModelBlockedError extends Error {
  public code = "PAID_MODEL_BLOCKED";
  constructor(model: string) {
    super(`Paid model blocked by ${AI_MODE_POLICY} policy: ${model}`);
    this.name = "PaidModelBlockedError";
  }
}

export interface AIMetricsSnapshot {
  requests: number;
  successes: number;
  failures: number;
  rateLimited: number;
  fallbacks: number;
  cacheHits: number;
  avgLatencyMs: number;
  byProvider: Record<
    string,
    { requests: number; successes: number; failures: number; rateLimited: number; latencySumMs: number }
  >;
}
