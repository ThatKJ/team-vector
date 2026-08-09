import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// AI Gateway tests — FREE_MODEL_ONLY rotation, cooldowns, quota exhaustion,
// invalid output, degraded mode, dedup and the paid-model hard block.
// All providers are mocked (AI_ENABLED_PROVIDERS=mock) — zero real API calls.
// ---------------------------------------------------------------------------

const MOCK_ENV: Record<string, string> = {
  AI_MOCK_MODE: 'ok',
  AI_ENABLED_PROVIDERS: 'mock',
  AI_MAX_ATTEMPTS: '4',
};

let gateway: typeof import('../../src/ai/gateway');

async function loadGateway(overrides: Record<string, string> = {}) {
  vi.resetModules();
  const env = { ...MOCK_ENV, ...overrides };
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
  gateway = await import('../../src/ai/gateway');
  return gateway;
}

afterEach(() => {
  delete process.env.AI_MOCK_MODE;
  delete process.env.AI_MOCK_MODE_A;
  delete process.env.AI_MOCK_MODE_B;
  delete process.env.AI_ENABLED_PROVIDERS;
  delete process.env.AI_MAX_ATTEMPTS;
  delete process.env.AI_PROVIDER_ORDER;
  delete process.env.AI_CACHE_TTL_MS;
});

const okValidator = (v: unknown) => typeof v === 'object' && v !== null && (v as any).ok === true;

describe('AI Gateway — free-only routing', () => {
  it('routes a request to the first available free provider and returns validated output', async () => {
    await loadGateway();
    const res = await gateway.aiGenerateStructuredContent<{ ok: boolean }>({
      task: 'evaluation',
      systemPrompt: 'sys-1',
      userPrompt: 'user-1',
      validate: okValidator,
    });
    expect(res.ok).toBe(true);
    const metrics = gateway.aiMetrics();
    expect(metrics.successes).toBe(1);
    expect(metrics.failures).toBe(0);
  });

  it('deduplicates identical requests (cache hit, single AI call)', async () => {
    await loadGateway();
    await gateway.aiGenerateStructuredContent({
      task: 'evaluation',
      systemPrompt: 'same-sys',
      userPrompt: 'same-user',
      validate: okValidator,
    });
    const metricsAfterFirst = gateway.aiMetrics();
    expect(metricsAfterFirst.requests).toBe(1);

    await gateway.aiGenerateStructuredContent({
      task: 'evaluation',
      systemPrompt: 'same-sys',
      userPrompt: 'same-user',
      validate: okValidator,
    });
    const metrics = gateway.aiMetrics();
    expect(metrics.requests).toBe(1); // no new AI call
    expect(metrics.cacheHits).toBe(1);
  });

  it('rotates to the next free provider when the first is rate limited', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'rate-limit', AI_MOCK_MODE_B: 'ok' });
    const res = await gateway.aiGenerateStructuredContent<{ ok: boolean }>({
      task: 'evaluation',
      systemPrompt: 'sys-rotate',
      userPrompt: 'user-rotate',
      validate: okValidator,
    });
    expect(res.ok).toBe(true);
    const metrics = gateway.aiMetrics();
    expect(metrics.fallbacks).toBeGreaterThanOrEqual(1);
    expect(metrics.rateLimited).toBeGreaterThanOrEqual(1);
  });

  it('disables a provider on daily TPD exhaustion until quota reset and routes around it', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'daily-quota', AI_MOCK_MODE_B: 'ok' });
    const { healthManager } = await import('../../src/ai/health');

    const res = await gateway.aiGenerateStructuredContent<{ ok: boolean }>({
      task: 'evaluation',
      systemPrompt: 'sys-tpd',
      userPrompt: 'user-tpd',
      validate: okValidator,
    });
    expect(res.ok).toBe(true);

    const health = healthManager.snapshot('mock-a');
    expect(health.quotaExhausted).toBe(true);
    expect(health.disabledUntil).not.toBeNull();
    expect(health.disabledUntil!).toBeGreaterThan(Date.now());
    expect(gateway.aiMetrics().fallbacks).toBeGreaterThanOrEqual(1);
  });

  it('does not hammer a rate-limited provider within the cooldown window', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'rate-limit', AI_MOCK_MODE_B: 'ok' });
    const { healthManager } = await import('../../src/ai/health');

    await gateway.aiGenerateStructuredContent({
      task: 'evaluation',
      systemPrompt: 'sys-cd1',
      userPrompt: 'user-cd1',
      validate: okValidator,
    });

    const health = healthManager.snapshot('mock-a');
    expect(health.rateLimited).toBe(true);
    expect(health.disabledUntil).not.toBeNull();
    // A second request must NOT attempt mock-a again while it is cooling down.
    const before = gateway.aiMetrics().requests;
    await gateway.aiGenerateStructuredContent({
      task: 'evaluation',
      systemPrompt: 'sys-cd2',
      userPrompt: 'user-cd2',
      validate: okValidator,
    });
    const after = gateway.aiMetrics().requests;
    // mock-b handled the second request; mock-a was skipped (cooldown)
    expect(after).toBe(before + 1);
    expect(gateway.aiMetrics().byProvider['mock/mock-b']?.requests).toBe(2);
    expect(gateway.aiMetrics().byProvider['mock/mock-a']?.requests).toBe(1);
  });

  it('rotates on invalid structured output (validation failure)', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'invalid-schema', AI_MOCK_MODE_B: 'ok' });
    const res = await gateway.aiGenerateStructuredContent<{ ok: boolean }>({
      task: 'evaluation',
      systemPrompt: 'sys-inv',
      userPrompt: 'user-inv',
      validate: okValidator,
    });
    expect(res.ok).toBe(true);
    expect(gateway.aiMetrics().fallbacks).toBeGreaterThanOrEqual(1);
  });

  it('respects the provider attempt cap', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'unavailable', AI_MOCK_MODE_B: 'ok', AI_MAX_ATTEMPTS: '1' });
    const { AIUnavailableError } = await import('../../src/ai/types');
    await expect(
      gateway.aiGenerateStructuredContent({
        task: 'evaluation',
        systemPrompt: 'sys-cap',
        userPrompt: 'user-cap',
        validate: okValidator,
      })
    ).rejects.toBeInstanceOf(AIUnavailableError);
    expect(gateway.aiMetrics().byProvider['mock/mock-b']).toBeUndefined();
  });

  it('enters graceful degraded mode when every free provider fails', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'unavailable', AI_MOCK_MODE_B: 'unavailable' });
    const { AIUnavailableError } = await import('../../src/ai/types');
    try {
      await gateway.aiGenerateStructuredContent({
        task: 'evaluation',
        systemPrompt: 'sys-down',
        userPrompt: 'user-down',
        validate: okValidator,
      });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AIUnavailableError);
      const unavailable = err as InstanceType<typeof AIUnavailableError>;
      expect(unavailable.code).toBe('AI_UNAVAILABLE');
      expect(unavailable.retryable).toBe(true);
      expect(unavailable.message).toContain('progress has been saved');
    }
  });

  it('opens the circuit after consecutive failures, then allows a half-open probe', async () => {
    await loadGateway({ AI_MOCK_MODE_A: 'unavailable', AI_MOCK_MODE_B: 'ok' });
    const { healthManager } = await import('../../src/ai/health');

    // Fail mock-a 3 consecutive times via 3 distinct requests (mock-b absorbs them)
    for (let i = 0; i < 3; i++) {
      await gateway.aiGenerateStructuredContent({
        task: 'evaluation',
        systemPrompt: `sys-cb-${i}`,
        userPrompt: 'user-cb',
        validate: okValidator,
      });
    }
    const health = healthManager.snapshot('mock-a');
    expect(health.healthy).toBe(false); // circuit open

    // Half-open window must have elapsed for a probe — with a fake clock it does.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect(healthManager.isAvailable('mock-a')).toBe(true);
    vi.useRealTimers();
  });
});

describe('AI Gateway — FREE_ONLY policy enforcement', () => {
  it('rejects paid models with PaidModelBlockedError', async () => {
    await loadGateway();
    const { assertFreeModel } = await import('../../src/ai/registry');
    const { PaidModelBlockedError } = await import('../../src/ai/types');
    expect(() => assertFreeModel({ free: true } as any)).not.toThrow();
    expect(() => assertFreeModel({ free: false } as any)).toThrow(PaidModelBlockedError);
    try {
      assertFreeModel({ free: false } as any);
    } catch (err) {
      expect((err as Error).message).toContain('FREE_ONLY');
    }
  });
});
