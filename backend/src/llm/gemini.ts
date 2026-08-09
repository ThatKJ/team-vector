import { LLMProvider, LLMError, LLM_ERROR_CODES } from './provider';

export class GeminiProvider implements LLMProvider {
  private extractJSON(text: string): string {
    text = text.trim();
    const match = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      return match[1].trim();
    }
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      return text.substring(firstBrace, lastBrace + 1);
    }
    return text;
  }

  private async executeGeminiCall(
    systemPrompt: string,
    userPrompt: string,
    purpose: string,
    attempt: number
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new LLMError('Gemini API key is missing.', LLM_ERROR_CODES.LLM_AUTH_ERROR);
    }

    const currentModel = 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: 'user', parts: [{ text: userPrompt }] }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new LLMError('Rate limited by Gemini', LLM_ERROR_CODES.LLM_RATE_LIMITED);
        }
        if (response.status === 400) {
           console.error("Gemini 400 error:", await response.text());
        }
        throw new LLMError(`Gemini API Error: ${response.status}`, LLM_ERROR_CODES.LLM_UNAVAILABLE);
      }

      const data = await response.json();

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Empty response from Gemini');
      }

      return content;
    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error(`[LLM OBSERVABILITY] Provider: Gemini, Model: ${currentModel}, Purpose: ${purpose}, Attempt: ${attempt}, Latency: ${latency}ms, Status: FAILURE`);
      
      if (error instanceof LLMError) throw error;
      
      throw new LLMError(`Unknown LLM Error: ${error.message}`, LLM_ERROR_CODES.LLM_UNAVAILABLE);
    }
  }

  public async generateStructuredContent<T>(
    systemPrompt: string,
    userPrompt: string,
    schemaDescription: any,
    _model?: string
  ): Promise<T> {
    const purpose = systemPrompt.substring(0, 50).replace(/\n/g, ' ') + '...';
    let lastError: any = null;
    let delay = 1000;
    
    let rateLimitAttempts = 0;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const rawContent = await this.executeGeminiCall(systemPrompt, userPrompt, purpose, attempt);
        const jsonStr = this.extractJSON(rawContent);
        
        try {
          return JSON.parse(jsonStr) as T;
        } catch (parseError: any) {
          console.warn(`[JSON PARSE ERROR] Attempt ${attempt} failed to parse JSON. Attempting repair...`);
          const repairPrompt = `${userPrompt}\n\nWARNING: Your previous response was invalid JSON. It failed with error: ${parseError.message}. You MUST return strictly valid JSON matching the exact schema requested. Do not include markdown blocks or any conversational text.`;
          
          const repairedContent = await this.executeGeminiCall(systemPrompt, repairPrompt, `${purpose} (Repair)`, attempt);
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
            
            let waitTime = 2000;
            console.warn(`[LLM RETRY] Rate limited. Retrying ONCE in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
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

export const geminiProvider = new GeminiProvider();
