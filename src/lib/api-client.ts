import { Candidate, StartInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, InterviewReport } from "./types";

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  async getCandidates(): Promise<Candidate[]> {
    const res = await fetch(`${this.baseUrl}/candidates`);
    if (!res.ok) throw new Error("Failed to fetch candidates");
    return res.json();
  }

  async startInterview(sessionId: string, candidateId?: string | null): Promise<StartInterviewResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    try {
      const bodyPayload: any = { sessionId };
      if (candidateId) {
        bodyPayload.candidate = { id: candidateId };
      }

      const res = await fetch(`${this.baseUrl}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start interview");
      }
      const data = await res.json();
      
      // Map backend format to frontend format
      return {
        interview_id: sessionId, 
        status: "in_progress",
        first_turn: {
          turn_id: "turn_1",
          question: data.reply,
          topic: "Introduction",
          turn_number: 1,
          telemetry: data.telemetry
        }
      };
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        throw new Error("Unable to connect to the interview engine. Please retry.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async submitAnswer(interviewId: string, payload: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 2000));
      const currentTurn = parseInt(payload.turn_id.split("_")[1] || "1");
      const isComplete = currentTurn >= 8;
      
      if (isComplete) {
        return {
          evaluation_status: "processed",
          is_complete: true
        };
      }

      return {
        evaluation_status: "processed",
        is_complete: false,
        next_turn: {
          turn_id: `turn_${currentTurn + 1}`,
          question: "That makes sense. But what are the memory tradeoffs of HNSW compared to IVF when updating the index frequently?",
          topic: "Vector Search (Deep Dive)",
          turn_number: currentTurn + 1
        }
      };
    }

    const res = await fetch(`${this.baseUrl}/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: interviewId, message: payload.answer })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to submit answer");
    }
    const data = await res.json();

    if (data.done) {
      return {
        evaluation_status: "processed",
        is_complete: true
      };
    }

    const currentTurn = parseInt(payload.turn_id.replace("turn_", "")) || 1;
    return {
      evaluation_status: "processed",
      is_complete: false,
      next_turn: {
        turn_id: `turn_${currentTurn + 1}`,
        question: data.reply,
        topic: "Adaptive Follow-up",
        turn_number: currentTurn + 1,
        telemetry: data.telemetry
      }
    };
  }

  async getReport(interviewId: string): Promise<InterviewReport> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 1500));
      return {
        score: 87,
        categories: {
          problem_solving: 92,
          systems_thinking: 85,
          technical_depth: 88,
          communication: 82
        },
        evidence: {
          strengths: [
            {
              conclusion: "Demonstrated deep understanding of HNSW index trade-offs.",
              evidence: [{ turn: 2, claim: "Explained HNSW vs IVF correctly", demonstrated: true }]
            },
            {
              conclusion: "Clear separation of concerns in proposed RAG architecture.",
              evidence: [{ turn: 4, claim: "Decoupled embedding layer from vector DB", demonstrated: true }]
            },
            {
              conclusion: "Proactively identified cold-start latency issues in serverless endpoints.",
              evidence: [{ turn: 5, claim: "Mentioned cold starts for serverless workers", demonstrated: true }]
            }
          ],
          gaps: [
            {
              conclusion: "Missed edge cases around concurrent document updates.",
              evidence: [{ turn: 3, claim: "Failed to address write-path locks", demonstrated: false }]
            },
            {
              conclusion: "Did not fully articulate the security boundaries for multi-tenant retrieval.",
              evidence: [{ turn: 6, claim: "Skipped namespace isolation strategies", demonstrated: false }]
            }
          ]
        },
        next_steps: [
          "Review concurrency models in distributed systems (AI Cohort Day 12).",
          "Practice communicating security constraints in architectural designs."
        ],
        trajectory: [
          { strategy: "BASELINE", rationale: "Initial assessment" },
          { strategy: "PROBE_DEPTH", rationale: "Candidate answered well, testing boundaries" }
        ]
      };
    }
    
    const res = await fetch(`${this.baseUrl}/interviews/${interviewId}/report`);
    if (!res.ok) throw new Error("Failed to fetch report");
    return res.json();
  }

  async finalizeInterview(interviewId: string): Promise<any> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 2000));
      return { success: true };
    }
    
    const res = await fetch(`${this.baseUrl}/interviews/${interviewId}/finalize`, {
      method: "POST"
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to finalize assessment");
    }
    
    return res.json();
  }
}

export const apiClient = new ApiClient();
