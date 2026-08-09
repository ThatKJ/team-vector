import { LLMProvider, LLMError, LLM_ERROR_CODES } from '../llm/provider';
import { mockModeForModel } from './registry';

// ---------------------------------------------------------------------------
// Mock provider for testing rotation / cooldowns / degraded mode WITHOUT
// hammering real free APIs. Behavior is selected via AI_MOCK_MODE:
//   rate-limit | 429        → always throws LLM_RATE_LIMITED (with retry-after)
//   daily-quota              → throws TPD daily-quota exhaustion message
//   invalid-json             → throws LLM_INVALID_RESPONSE
//   invalid-schema           → returns structurally-invalid JSON (fails zod)
//   unavailable | 500        → throws LLM_UNAVAILABLE
//   flaky                    → fails first AI_MOCK_FAILURES calls, then OK
//   (unset / none / ok)      → returns { ok: true }
// ---------------------------------------------------------------------------

let flakyCount = 0;

export function resetMockProvider(): void {
  flakyCount = 0;
}

export class MockProvider implements LLMProvider {
  async generateStructuredContent<T>(
    _systemPrompt: string,
    _userPrompt: string,
    schemaDescription?: unknown,
    model?: string
  ): Promise<T> {
    const mode = mockModeForModel(model);

    if (mode === 'flaky') {
      const failures = parseInt(process.env.AI_MOCK_FAILURES || '', 10) || 1;
      if (flakyCount < failures) {
        flakyCount += 1;
        throw new LLMError('Mock provider unavailable', LLM_ERROR_CODES.LLM_UNAVAILABLE);
      }
      return { ok: true } as T;
    }

    if (mode === 'rate-limit' || mode === '429') {
      const err = new LLMError('Rate limited by Mock', LLM_ERROR_CODES.LLM_RATE_LIMITED);
      (err as any).retryAfter = 2;
      throw err;
    }

    if (mode === 'daily-quota') {
      throw new LLMError(
        'Rate limit reached for model `mock` in organization `test` service tier `on_demand` on tokens per day (TPD): Limit 100000, Used 100000',
        LLM_ERROR_CODES.LLM_RATE_LIMITED
      );
    }

    if (mode === 'invalid-json') {
      throw new LLMError(
        'Failed to parse structured JSON from LLM after repair attempt',
        LLM_ERROR_CODES.LLM_INVALID_RESPONSE
      );
    }

    if (mode === 'invalid-schema') {
      return { garbage: true, noSchemaFields: true } as T;
    }

    if (mode === 'unavailable' || mode === '500' || mode === 'timeout') {
      throw new LLMError('Mock provider service unavailable', LLM_ERROR_CODES.LLM_UNAVAILABLE);
    }

    return { ok: true } as T;
  }
}

export const mockProvider = new MockProvider();
