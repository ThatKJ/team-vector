# API Contracts (Frontend / Backend)

This defines the HTTP API interface the backend provides and the frontend consumes.

## 1. Start Assessment
`POST /api/interviews/start`
- **Request**:
  ```json
  { "candidate_id": "uuid" }
  ```
- **Response**:
  ```json
  {
    "interview_id": "uuid",
    "status": "in_progress",
    "first_turn": {
      "turn_id": "uuid",
      "question": "Based on your recent work with Vector Databases, how would you...",
      "topic": "Vector Search"
    }
  }
  ```

## 2. Submit Answer & Get Follow-up
`POST /api/interviews/:interview_id/turn`
- **Request**:
  ```json
  {
    "turn_id": "uuid",
    "answer": "I would use HNSW indexing for faster retrieval..."
  }
  ```
- **Response**:
  ```json
  {
    "evaluation_status": "processed",
    "is_complete": false,
    "next_turn": {
      "turn_id": "uuid",
      "question": "That makes sense. But what are the memory tradeoffs of HNSW?",
      "topic": "Vector Search (Deep Dive)",
      "turn_number": 2
    }
  }
  ```

## 3. Complete Interview & Fetch Report
`GET /api/interviews/:interview_id/report`
- **Response**:
  ```json
  {
    "score": 86,
    "categories": {
      "problem_solving": 90,
      "systems_thinking": 85,
      "technical_depth": 80,
      "communication": 90
    },
    "evidence": {
      "strengths": ["Strong understanding of indexing tradeoffs."],
      "gaps": ["Missed edge cases in high-concurrency environments."]
    },
    "next_steps": ["Deep dive into concurrent system design."],
    "decision_trace": [...]
  }
  ```
