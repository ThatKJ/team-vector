# Intervu AI Backend Architecture

## Overview
The Intervu AI backend is built with **Next.js Route Handlers**, providing a robust API layer running on Node.js. It strictly separates LLM generation from application logic to ensure deterministic control over the interview flow.

## Core Principles
> "THE LLM NEVER DECIDES WHAT TO ASK NEXT. OUR DETERMINISTIC THEORY ENGINE DOES."

Gemini is used exclusively as a text generation and structured extraction tool. It does not dictate difficulty, round progression, or strategy.

## Key Engines

### Candidate Analyzer
- **Location**: `src/lib/candidateAnalyzer.ts`
- **Purpose**: Parses candidate Hackathon missions and generates an initial deterministically scored `CandidateTheory`.

### Session Manager
- **Location**: `src/lib/sessionManager.ts`
- **Purpose**: Manages an in-memory `Map` of active `InterviewState` objects, preserving context and conversation history across requests.

### Theory Engine
- **Location**: `src/lib/theoryEngine.ts`
- **Purpose**: Applies strict bounds and score deltas (e.g., `+15` for strong_positive, `-8` for negative). Updates confidence values and tracks trend metrics (improving, declining) deterministically.

### Strategy Engine
- **Location**: `src/lib/strategyEngine.ts`
- **Purpose**: Controls the 5-round logic (enforcing a minimum of 8 questions). It selects strategies (`EXPLORE`, `PROBE_WEAKNESS`, `ESCALATE`) based solely on the mathematical state of the Theory Engine.

### Gemini Integrations
- **Location**: `src/lib/gemini.ts`
- **Purpose**: 
  1. Translates strategy contexts into natural language questions.
  2. Extracts Zod-validated `EvaluationSignal`s from raw candidate text.
  3. Generates the final natural language feedback summary.

## Running the Backend
1. cd `backend/`
2. Configure `.env.local` with `GEMINI_API_KEY`.
3. Run `npm install`
4. Run `npm run dev`
5. API will be available at `http://localhost:3000/api/...`
