import { ProviderHealth } from './types';
import { modelConfigFor } from './registry';

// ---------------------------------------------------------------------------
// Provider health + quota manager.
//
// - 429 / RESOURCE_EXHAUSTED → cooldown (respect Retry-After when present)
// - "tokens per day (TPD)" exhaustion → disable until next daily quota reset
// - consecutive failures → circuit breaker opens (healthy=false), half-open
//   probe after cooldown
// - quota headers (Groq: x-ratelimit-remaining-*) parsed when available
// ---------------------------------------------------------------------------

const COOLDOWN_STEPS_SEC = [10, 30, 60, 300];
const MAX_CONSECUTIVE_FAILURES = 3;
const HALF_OPEN_WINDOW_MS = 60_000;

const DAILY_QUOTA_HINTS = [
  'tokens per day',
  'tokens per day (TPD)',
  'daily quota',
  'quota exhausted',
  'per-day',
  'daily limit reached',
];

function isDailyQuotaError(message: string): boolean {
  return DAILY_QUOTA_HINTS.some((hint) => message.toLowerCase().includes(hint));
}

function nextMidnightUtcMs(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  return midnight.getTime() + Math.floor(Math.random() * 120_000); // jitter
}

function parseRetryAfter(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  // "1m26.4s" or "86" or HTTP-date
  const match = trimmed.match(/^(\d+(?:\.\d+)?)([smh]?)$/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  const unit = match[2];
  if (unit === 'm') return n * 60;
  if (unit === 'h') return n * 3600;
  return n;
}

class HealthManager {
  private health = new Map<string, ProviderHealth>();
  private failureCounters = new Map<string, number>();

  private ensure(model: string): ProviderHealth {
    let h = this.health.get(model);
    if (!h) {
      const cfg = modelConfigFor(model.split(':')[0] as any, model.split(':')[1] || model);
      h = {
        provider: (model.split(':')[0] as any) || 'groq',
        model,
        configured: cfg ? cfg.configured : true,
        free: cfg ? cfg.free : false,
        healthy: true,
        consecutiveFailures: 0,
        rateLimited: false,
        quotaExhausted: false,
        disabledUntil: null,
        retryAfterSec: null,
        lastSuccessAt: null,
        lastFailureAt: null,
        quota: {},
      };
      this.health.set(model, h);
    }
    return h;
  }

  /** Register a model slot (called by the gateway at startup). */
  public register(provider: string, model: string, configured: boolean, free: boolean): void {
    this.health.set(model, {
      provider: provider as any,
      model,
      configured,
      free,
      healthy: true,
      consecutiveFailures: 0,
      rateLimited: false,
      quotaExhausted: false,
      disabledUntil: null,
      retryAfterSec: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      quota: {},
    });
  }

  public isAvailable(model: string): boolean {
    const h = this.ensure(model);
    if (!h.configured || !h.free) return false;
    if (h.quotaExhausted) return false;
    if (h.disabledUntil && Date.now() < h.disabledUntil) return false;
    if (!h.healthy) {
      // Half-open: allow a single probe after the cooldown window elapsed
      const sinceFailure = h.lastFailureAt ? Date.now() - h.lastFailureAt : Infinity;
      return sinceFailure >= HALF_OPEN_WINDOW_MS;
    }
    return true;
  }

  public recordSuccess(model: string): void {
    const h = this.ensure(model);
    h.healthy = true;
    h.rateLimited = false;
    h.quotaExhausted = false;
    h.consecutiveFailures = 0;
    h.disabledUntil = null;
    h.retryAfterSec = null;
    h.lastSuccessAt = Date.now();
  }

  public recordFailure(model: string, error: unknown): void {
    const h = this.ensure(model);
    h.lastFailureAt = Date.now();
    h.consecutiveFailures += 1;

    const isRateLimit =
      error instanceof Error &&
      ((error as any).code === 'LLM_RATE_LIMITED' ||
        /429|RATE_LIMIT|rate limit|RESOURCE_EXHAUSTED|QUOTA_EXCEEDED|TOO_MANY_REQUESTS/i.test(
          error.message
        ));

    if (isRateLimit) {
      h.rateLimited = true;
      const message = error instanceof Error ? error.message : '';

      if (isDailyQuotaError(message)) {
        h.quotaExhausted = true;
        h.disabledUntil = nextMidnightUtcMs();
        console.warn(
          `[AI HEALTH] ${model} daily free quota exhausted (TPD). Disabled until next quota reset (${new Date(h.disabledUntil).toISOString()}).`
        );
        return;
      }

      const retryAfter = this.extractRetryAfter(error);
      const step = Math.min(h.consecutiveFailures, COOLDOWN_STEPS_SEC.length) - 1;
      const baseSec = COOLDOWN_STEPS_SEC[Math.max(0, step)];
      const jittered = baseSec + Math.random() * 5;
      h.retryAfterSec = retryAfter ?? Math.round(jittered);
      h.disabledUntil = Date.now() + (retryAfter !== null ? retryAfter : jittered) * 1000;
      console.warn(
        `[AI HEALTH] ${model} rate limited (attempt ${h.consecutiveFailures}). Cooldown ${h.retryAfterSec}s (retry-after: ${retryAfter ?? 'none'}).`
      );
      return;
    }

    if (h.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      h.healthy = false;
      console.warn(`[AI HEALTH] ${model} circuit opened after ${h.consecutiveFailures} consecutive failures.`);
    }
  }

  private extractRetryAfter(error: unknown): number | null {
    const err = error as any;
    if (typeof err?.retryAfter === 'number' && err.retryAfter > 0) {
      if (err.retryAfter > 1e12) return null; // absolute timestamp — cannot wait
      return err.retryAfter;
    }
    if (err?.headers) {
      const fromHeader = parseRetryAfter(err.headers['retry-after']);
      if (fromHeader !== null) return fromHeader;
    }
    if (typeof err?.message === 'string') {
      const m = err.message.match(/retry[-\s]?after[:\s]+(\d+(?:\.\d+)?)(?:s| seconds)?/i);
      if (m) return parseFloat(m[1]);
    }
    return null;
  }

  public applyQuotaHeaders(model: string, headers: Record<string, string | undefined>): void {
    const h = this.ensure(model);
    const remainingReq = headers['x-ratelimit-remaining-requests'];
    const remainingTokens = headers['x-ratelimit-remaining-tokens'];
    const resetReq = headers['x-ratelimit-reset-requests'];
    const resetTokens = headers['x-ratelimit-reset-tokens'];
    if (remainingReq) h.quota.remainingRequests = parseInt(remainingReq, 10) || undefined;
    if (remainingTokens) h.quota.remainingTokens = parseInt(remainingTokens, 10) || undefined;
    if (resetReq) {
      const secs = parseRetryAfter(resetReq);
      if (secs !== null) h.quota.resetRequestsAt = Date.now() + secs * 1000;
    }
    if (resetTokens) {
      const secs = parseRetryAfter(resetTokens);
      if (secs !== null) h.quota.resetTokensAt = Date.now() + secs * 1000;
    }
  }

  public snapshot(model: string): ProviderHealth {
    return { ...this.ensure(model) };
  }
}

export const healthManager = new HealthManager();
