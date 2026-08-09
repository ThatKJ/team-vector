import { Candidate, StartInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, InterviewReport } from "./types";

// Demo dossier used when a report cannot be fetched (e.g. a session id that was
// never finalized, or no backend running). Keeps the report page demo-safe.
const DEMO_DOSSIER: InterviewReport = {
  score: 87,
  verdict: "STRONG",
  summary:
    "Strong conceptual depth across vector search and RAG with consistent production trade-off awareness; a few gaps in write-path concurrency.",
  categories: {
    problem_solving: 90,
    systems_thinking: 86,
    technical_depth: 92,
    communication: 80,
  },
  evidence: {
    strengths: [
      {
        conclusion: "Demonstrated deep understanding of HNSW index trade-offs.",
        evidence: [
          { turn: 2, claim: "Explained HNSW vs IVF correctly", demonstrated: true },
          { turn: 4, claim: "Articulated memory vs recall trade-off", demonstrated: true },
        ],
      },
      {
        conclusion: "Clear separation of concerns in the proposed RAG architecture.",
        evidence: [
          { turn: 4, claim: "Decoupled embedding layer from vector DB", demonstrated: true },
          { turn: 7, claim: "Designed chunking strategy with overlap", demonstrated: true },
        ],
      },
      {
        conclusion: "Proactively identified cold-start latency issues in serverless endpoints.",
        evidence: [
          { turn: 5, claim: "Mentioned cold starts for serverless workers", demonstrated: true },
        ],
      },
    ],
    gaps: [
      {
        conclusion: "Missed edge cases around concurrent document updates.",
        evidence: [
          { turn: 3, claim: "Failed to address write-path locks", demonstrated: false },
        ],
      },
      {
        conclusion: "Did not fully articulate the security boundaries for multi-tenant retrieval.",
        evidence: [
          { turn: 6, claim: "Skipped namespace isolation strategies", demonstrated: false },
        ],
      },
    ],
  },
  next_steps: [
    "Review concurrency models in distributed systems (AI Cohort Day 12).",
    "Practice communicating security constraints in architectural designs.",
  ],
  trajectory: [
    {
      strategy: "BASELINE",
      rationale: "Initial assessment",
      decision: "Established baseline on vector search fundamentals",
      fingerprint: { competency: "Vector Search Fundamentals" },
    },
    {
      strategy: "PROBE_DEPTH",
      rationale: "Strong baseline — probing boundary understanding",
      decision: "Verified HNSW vs IVF trade-offs",
      fingerprint: { competency: "Vector Search Fundamentals" },
    },
    {
      strategy: "PROBE_APPLICATION",
      rationale: "Depth confirmed — moving to applied design",
      decision: "Evaluated RAG pipeline design",
      fingerprint: { competency: "RAG Architecture" },
    },
    {
      strategy: "CROSS_CHECK",
      rationale: "Consistency check across competencies",
      decision: "Cross-checked production failure modes",
      fingerprint: { competency: "Systems Design" },
    },
  ],
  rawCompetencies: {
    "Vector Search Fundamentals": {
      conceptualUnderstanding: 0.92,
      reasoningAbility: 0.88,
      applicationAbility: 0.85,
      uncertainty: 0.15,
    },
    "RAG Architecture": {
      conceptualUnderstanding: 0.85,
      reasoningAbility: 0.8,
      applicationAbility: 0.9,
      uncertainty: 0.2,
    },
    "Database Internals": {
      conceptualUnderstanding: 0.7,
      reasoningAbility: 0.68,
      applicationAbility: 0.6,
      uncertainty: 0.35,
    },
    "Systems Design": {
      conceptualUnderstanding: 0.82,
      reasoningAbility: 0.84,
      applicationAbility: 0.78,
      uncertainty: 0.22,
    },
  },
  final_recommendation: {
    strongest_signal: "Applied RAG architecture reasoning backed by concrete evidence across turns.",
    biggest_risk: "Write-path concurrency and multi-tenant isolation were not fully addressed.",
    recommended_next_step:
      "Advance to the systems design round; pair with a distributed-systems refresher before production ownership.",
  },
  _meta: { generatedAt: new Date().toISOString(), version: 1 },
};

class ApiClient {
  // NEXT_PUBLIC_* values are inlined at build time. An empty/missing value must
  // NEVER fall back to a localhost URL in a production bundle — the browser would
  // request a local-network address (Chrome blocks this and prompts "Access other
  // apps and services on this device"). In production, fall back to the
  // same-origin "/api" path, which Vercel proxies to the backend service.
  private baseUrl =
    (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim() ||
    (process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:3001/api");
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  async getCandidates(): Promise<Candidate[]> {
    try {
      const res = await fetch(`${this.baseUrl}/candidates`);
      if (!res.ok) throw new Error(`Unable to load candidates (HTTP ${res.status})`);
      return res.json();
    } catch (err) {
      console.error("[api] getCandidates failed:", err);
      throw new Error("Unable to load candidates. Please try again.");
    }
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
        started_at: data.startedAt ?? null,
        first_turn: {
          turn_id: "turn_1",
          question: data.reply,
          topic: data.telemetry?.decision?.targetCompetency || "Introduction",
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
        topic: data.telemetry?.decision?.targetCompetency || "Adaptive Follow-up",
        turn_number: currentTurn + 1,
        telemetry: data.telemetry
      }
    };
  }

  async getReport(interviewId: string): Promise<InterviewReport> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 1500));
      return DEMO_DOSSIER;
    }

    const res = await fetch(`${this.baseUrl}/interviews/${interviewId}/report`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to fetch report");
    }
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
