import { Candidate, StartInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, InterviewReport } from "./types";

// Mock Data for Phase 4 frontend development until backend is ready
const MOCK_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Alex Chen", role: "AI Engineer", experience: "Mid-level", status: "pending" },
  { id: "c2", name: "Sarah Jenkins", role: "Backend Developer", experience: "Senior", status: "completed" },
  { id: "c3", name: "Michael Obi", role: "Fullstack Engineer", experience: "Junior", status: "pending" },
];

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true" || true; // Default to true for Phase 4

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
      // Simulate completing after 3 turns for the hackathon UI test
      const isComplete = payload.turn_id === "turn_3";
      
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
          turn_id: `turn_${Date.now()}`,
          question: "That makes sense. But what are the memory tradeoffs of HNSW compared to IVF when updating the index frequently?",
          topic: "Vector Search (Deep Dive)",
          turn_number: parseInt(payload.turn_id.split("_")[1] || "1") + 1
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
        score: 86,
        categories: {
          problem_solving: 90,
          systems_thinking: 85,
          technical_depth: 80,
          communication: 90
        },
        evidence: {
          strengths: [
            "Strong understanding of indexing tradeoffs.",
            "Communicates architectural decisions clearly.",
            "Aware of memory constraints in HNSW."
          ],
          gaps: [
            "Missed edge cases in high-concurrency environments.",
            "Could elaborate more on distributed consensus for vector sync."
          ]
        },
        next_steps: ["Deep dive into concurrent system design.", "Explore distributed vector architectures."],
        decision_trace: []
      };
    }
    
    const res = await fetch(`${this.baseUrl}/interviews/${interviewId}/report`);
    if (!res.ok) throw new Error("Failed to fetch report");
    return res.json();
  }
}

export const apiClient = new ApiClient();
