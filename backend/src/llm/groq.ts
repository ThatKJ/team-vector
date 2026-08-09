import Groq from 'groq-sdk';
import { LLMProvider, LLMError, LLM_ERROR_CODES } from './provider';

// Read configuration lazily
let client: Groq | null = null;
function getGroqClient() {
  if (!client) {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey) {
      client = new Groq({ apiKey: groqApiKey });
    }
  }
  return client;
}

function getGroqModel() {
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}

export class GroqProvider implements LLMProvider {
  /**
   * Safe JSON extraction from LLM response
   */
  private extractJSON(text: string): string {
    text = text.trim();
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      return match[1].trim();
    }
    
    // Fallback if they didn't use markdown code blocks but still returned JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      return text.substring(firstBrace, lastBrace + 1);
    }
    return text;
  }

  /**
   * Internal generator with typed error wrapping and observability
   */
  private async executeGroqCall(
    systemPrompt: string,
    userPrompt: string,
    purpose: string,
    attempt: number
  ): Promise<string> {
    const groqClient = getGroqClient();
    const currentModel = getGroqModel();
    if (!groqClient) {
      throw new LLMError('Groq API key is missing.', LLM_ERROR_CODES.LLM_AUTH_ERROR);
    }

    const startTime = Date.now();
    try {
      const response = await groqClient.chat.completions.create({
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Keep it deterministic for evaluation
        max_tokens: 2048,
      });

      const latency = Date.now() - startTime;
      console.log(`[LLM OBSERVABILITY] Provider: Groq, Model: ${currentModel}, Purpose: ${purpose}, Attempt: ${attempt}, Latency: ${latency}ms, Status: SUCCESS`);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq');
      }

      return content;
    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error(`[LLM OBSERVABILITY] Provider: Groq, Model: ${currentModel}, Purpose: ${purpose}, Attempt: ${attempt}, Latency: ${latency}ms, Status: FAILURE`);
      
      // Categorize error
      if (error?.status === 401 || error?.status === 403) {
        throw new LLMError('Invalid API Key or Unauthorized', LLM_ERROR_CODES.LLM_AUTH_ERROR);
      }
      if (error?.status === 429) {
        // Embed the retry header if available
        let retryAfterStr = null;
        if (error.headers) {
          retryAfterStr = error.headers['retry-after'] || error.headers['x-ratelimit-reset'] || null;
        }
        
        const llmError = new LLMError('Rate limited by Groq', LLM_ERROR_CODES.LLM_RATE_LIMITED);
        if (retryAfterStr) {
          (llmError as any).retryAfter = parseFloat(retryAfterStr);
        }
        throw llmError;
      }
      if (error?.status === 404 || error?.error?.error?.message?.includes('does not exist')) {
        throw new LLMError(`Model ${currentModel} is unavailable`, LLM_ERROR_CODES.LLM_MODEL_UNAVAILABLE);
      }
      if (error?.status >= 500 || error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
        throw new LLMError('Groq service is currently unavailable or timed out', LLM_ERROR_CODES.LLM_TIMEOUT);
      }
      
      throw new LLMError(`Unknown LLM Error: ${error.message}`, LLM_ERROR_CODES.LLM_UNAVAILABLE);
    }
  }

  public async generateStructuredContent<T>(
    systemPrompt: string,
    userPrompt: string,
    schemaDescription: any
  ): Promise<T> {
    const purpose = systemPrompt.substring(0, 50).replace(/\n/g, ' ') + '...';
    let lastError: any = null;
    let delay = 1000;
    
    // We only retry 429 once. We retry 5xx up to 3 times.
    let rateLimitAttempts = 0;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const rawContent = await this.executeGroqCall(systemPrompt, userPrompt, purpose, attempt);
        const jsonStr = this.extractJSON(rawContent);
        
        try {
          return JSON.parse(jsonStr) as T;
        } catch (parseError: any) {
          console.warn(`[JSON PARSE ERROR] Attempt ${attempt} failed to parse JSON. Attempting repair...`);
          const repairPrompt = `${userPrompt}\n\nWARNING: Your previous response was invalid JSON. It failed with error: ${parseError.message}. You MUST return strictly valid JSON matching the exact schema requested. Do not include markdown blocks or any conversational text.`;
          
          const repairedContent = await this.executeGroqCall(systemPrompt, repairPrompt, `${purpose} (Repair)`, attempt);
          const repairedJsonStr = this.extractJSON(repairedContent);
          
          try {
            return JSON.parse(repairedJsonStr) as T;
          } catch (repairParseError: any) {
            console.error(`[JSON PARSE ERROR] Repair failed.`);
            throw new LLMError('Failed to parse structured JSON from LLM after repair attempt', LLM_ERROR_CODES.LLM_INVALID_RESPONSE);
          }
        }
      } catch (error: any) {
        lastError = error;
        
        if (error instanceof LLMError) {
          if ([LLM_ERROR_CODES.LLM_AUTH_ERROR, LLM_ERROR_CODES.LLM_MODEL_UNAVAILABLE, LLM_ERROR_CODES.LLM_INVALID_RESPONSE].includes(error.code as any)) {
            throw error; // Permanent failure
          }
          
          if (error.code === LLM_ERROR_CODES.LLM_RATE_LIMITED) {
            rateLimitAttempts++;
            if (rateLimitAttempts > 1) {
              console.error(`[LLM RATE LIMIT] Second rate limit hit. Abandoning immediately.`);
              throw error;
            }
            
            // Respect retry-after if provided
            let waitTime = 1000;
            if ((error as any).retryAfter) {
              const retryAfterS = (error as any).retryAfter;
              if (retryAfterS > 5) {
                console.warn(`[LLM RATE LIMIT] Retry-after is ${retryAfterS}s (> 5s). Abandoning immediately.`);
                throw error;
              }
              // If it's a timestamp vs seconds
              if (retryAfterS > 1e12) {
                waitTime = Math.max(0, retryAfterS - Date.now());
              } else {
                waitTime = retryAfterS * 1000;
              }
            }
            
            console.warn(`[LLM RETRY] Rate limited. Retrying ONCE in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // General 5xx/Timeout error backoff
        console.warn(`[LLM RETRY] Transient error encountered. Retrying in ${delay}ms... (Attempt ${attempt}/3)`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 500));
          delay *= 2;
        }
      }
    }
    
    throw lastError || new LLMError('Failed to complete LLM request after 3 attempts', LLM_ERROR_CODES.LLM_UNAVAILABLE);
  }
}

// Export singleton
export const groqProvider = new GroqProvider();
