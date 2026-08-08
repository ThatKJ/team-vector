import { Candidate, StartInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, InterviewReport } from "./types";

// Mock Data for Phase 4 frontend development until backend is ready
const MOCK_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Alex Chen", role: "AI Engineer", experience: "Mid-level", status: "pending" },
  { id: "c2", name: "Sarah Jenkins", role: "Backend Developer", experience: "Senior", status: "completed" },
  { id: "c3", name: "Michael Obi", role: "Fullstack Engineer", experience: "Junior", status: "pending" },
];

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  async getCandidates(): Promise<Candidate[]> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 600));
      return MOCK_CANDIDATES;
    }
    const res = await fetch(`${this.baseUrl}/candidates`);
    if (!res.ok) throw new Error("Failed to fetch candidates");
    return res.json();
  }

  async startInterview(candidateId: string): Promise<StartInterviewResponse> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 1200));
      return {
        interview_id: "int_123",
        status: "in_progress",
        first_turn: {
          turn_id: "turn_1",
          question: "Based on your recent work with Vector Databases in the AI Cohort, how would you design a retrieval system to handle a million embeddings while keeping latency under 50ms?",
          topic: "Vector Search",
          turn_number: 1
        }
      };
    }
    const res = await fetch(`${this.baseUrl}/interviews/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId })
    });
    if (!res.ok) throw new Error("Failed to start interview");
    return res.json();
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

    const res = await fetch(`${this.baseUrl}/interviews/${interviewId}/turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return res.json();
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
            "Demonstrated deep understanding of HNSW index trade-offs.",
            "Clear separation of concerns in proposed RAG architecture.",
            "Proactively identified cold-start latency issues in serverless endpoints."
          ],
          gaps: [
            "Missed edge cases around concurrent document updates.",
            "Did not fully articulate the security boundaries for multi-tenant retrieval."
          ]
        },
        next_steps: [
          "Review concurrency models in distributed systems (AI Cohort Day 12).",
          "Practice communicating security constraints in architectural designs."
        ],
        decision_trace: [
          { turn: 1, signal: "strong system design", weight: 0.8 },
          { turn: 4, signal: "missed edge case", weight: -0.3 }
        ]
      };
    }
    
    const res = await fetch(`${this.baseUrl}/interviews/${interviewId}/report`);
    if (!res.ok) throw new Error("Failed to fetch report");
    return res.json();
  }
}

export const apiClient = new ApiClient();
