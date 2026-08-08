# Backend API Specification

## `POST /api/interview`

Acts as the main orchestrator for the interview lifecycle. Use this endpoint to both start a new session and submit candidate answers for the current session.

### 1. Starting an Interview

**Request:**
```json
{
  "sessionId": "abc-123", // Unique session identifier
  "candidate": {
    "id": "CAND-003",
    "name": "Emily Chen",
    "role": "AI Engineer",
    "missions": [
      { "id": "m1", "status": "passed", "attempts": 1 }
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "reply": "Hi Emily, let's start by discussing your Python environment setup.",
  "done": false
}
```

### 2. Continuing an Interview

**Request:**
```json
{
  "sessionId": "abc-123",
  "message": "I used virtual environments to isolate dependencies."
}
```

**Response - Ongoing (200 OK):**
```json
{
  "reply": "That's good. How would you handle a situation where a dependency conflicts with another library?",
  "done": false
}
```

**Response - Completed (200 OK):**
*Returned after a minimum of 8 questions, at the end of Round 5.*
```json
{
  "reply": "Thank you for completing the interview.",
  "done": true,
  "feedback": {
    "summary": "Great overall performance.",
    "strengths": ["Dependency management", "Vector search concepts"],
    "gaps": ["Understanding of indexing trade-offs"],
    "next": ["Deepen understanding of ANN algorithms"]
  },
  "report": {
    "engineeringReadiness": 82.5,
    "verdict": "Strong Hire",
    "assessmentConfidence": 0.8,
    "theoryVersion": 1.9
  }
}
```

### Error Responses

- **400 Bad Request:** 
  - Missing `sessionId`
  - Attempting to start a session that already exists
  - Attempting to send a message to a session that is already completed
- **404 Not Found:**
  - `message` provided but no active session found for `sessionId`.
- **500 Internal Server Error:**
  - LLM failure, validation error, etc.
