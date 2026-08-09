// ---------------------------------------------------------------------------
// Concurrency limiter for free-tier providers: global cap + per-provider cap.
// ---------------------------------------------------------------------------

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const AI_GLOBAL_CONCURRENCY = envInt('AI_GLOBAL_CONCURRENCY', 3);
export const AI_PER_PROVIDER_CONCURRENCY = envInt('AI_PER_PROVIDER_CONCURRENCY', 1);

class Semaphore {
  private running = 0;
  private waiters: Array<() => void> = [];

  constructor(private max: number) {}

  public async acquire(): Promise<void> {
    if (this.running < this.max) {
      this.running += 1;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
    this.running += 1;
  }

  public release(): void {
    this.running -= 1;
    const next = this.waiters.shift();
    if (next) next();
  }
}

const globalSemaphore = new Semaphore(AI_GLOBAL_CONCURRENCY);
const providerSemaphores = new Map<string, Semaphore>();

function providerSemaphore(provider: string): Semaphore {
  let s = providerSemaphores.get(provider);
  if (!s) {
    s = new Semaphore(AI_PER_PROVIDER_CONCURRENCY);
    providerSemaphores.set(provider, s);
  }
  return s;
}

/**
 * Runs fn under both the global and per-provider caps.
 * Per-interview serialization is handled by the route-level request deduper
 * (`requestDeduper` keyed on session/turn), so one interview never hammers the
 * pool concurrently.
 */
export async function runWithConcurrency<T>(
  provider: string,
  fn: () => Promise<T>
): Promise<T> {
  await globalSemaphore.acquire();
  try {
    await providerSemaphore(provider).acquire();
    try {
      return await fn();
    } finally {
      providerSemaphore(provider).release();
    }
  } finally {
    globalSemaphore.release();
  }
}
