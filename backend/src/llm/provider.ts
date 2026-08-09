export interface LLMProvider {
  /**
   * Generates a strongly typed JSON output from the LLM based on the system prompt and JSON schema.
   */
  generateStructuredContent<T>(
    systemPrompt: string,
    userPrompt: string,
    schemaDescription: any, // e.g. a JSON Schema object, or simply the stringified representation of the required TypeScript interface.
    model?: string // optional model override selected by the AI gateway (FREE_ONLY pool)
  ): Promise<T>;
}

export class LLMError extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
  }
}

export const LLM_ERROR_CODES = {
  LLM_AUTH_ERROR: 'LLM_AUTH_ERROR',
  LLM_RATE_LIMITED: 'LLM_RATE_LIMITED',
  LLM_MODEL_UNAVAILABLE: 'LLM_MODEL_UNAVAILABLE',
  LLM_INVALID_RESPONSE: 'LLM_INVALID_RESPONSE',
  LLM_TIMEOUT: 'LLM_TIMEOUT',
  LLM_UNAVAILABLE: 'LLM_UNAVAILABLE',
};
