import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// In-memory AI result cache. Structured outputs (evaluations, questions,
// reports) are also persisted to Supabase by the engine; this layer prevents
// duplicate LLM calls from retries/rerenders/reloads (StrictMode, retry
// buttons, idempotent init). Keyed on task + normalized prompt.
// ---------------------------------------------------------------------------

interface CacheEntry<T = unknown> {
  value: T;
  ts: number;
}

const TTL_MS = parseInt(process.env.AI_CACHE_TTL_MS || '', 10) || 10 * 60_000;
const MAX_ENTRIES = 200;

const store = new Map<string, CacheEntry>();

export function cacheKey(
  task: string,
  systemPrompt: string,
  userPrompt: string,
  contextId?: string
): string {
  return createHash('sha1')
    .update(`${task}|${contextId ?? ''}|${systemPrompt}|${userPrompt}`)
    .digest('hex')
    .slice(0, 24);
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached<T>(key: string, value: T): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { value, ts: Date.now() });
}

export function clearCache(): void {
  store.clear();
}
