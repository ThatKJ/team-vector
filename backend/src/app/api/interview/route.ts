import { NextResponse } from 'next/server';
import { InterviewOrchestrator } from '@/core/orchestrator';
import { requestDeduper } from '@/utils/request-deduper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.sessionId) {
      return NextResponse.json({ error: 'Missing sessionId', code: 'INVALID_REQUEST' }, { status: 400 });
    }
    
    const { sessionId, candidate, message } = body;

    // INITIALIZATION
    if (candidate && !message) {
      try {
        const result = await requestDeduper.dedupe(`init:${sessionId}`, async () => {
          const { isNew, state, startedAt } = await InterviewOrchestrator.initializeSession(candidate.id, sessionId);
          
          if (!isNew) {
            // Idempotent: return the last generated question
            const { getInterviewHistory } = await import('@/db/sessions');
            const history = await getInterviewHistory(sessionId);
            const lastInterviewerTurn = history.reverse().find((h: any) => h.role === 'interviewer');
            const lastTrajectory = state.trajectory[state.trajectory.length - 1] || {};
            
            return {
              sessionId,
              startedAt: startedAt ?? null,
              reply: lastInterviewerTurn?.content || '',
              done: false,
              assessmentSignal: lastTrajectory.decision || '',
              nextAction: lastTrajectory.strategy || 'BASELINE',
              telemetry: {
                knowledgeState: {
                  competencies: state.competencies,
                  trajectory: state.trajectory
                }
              }
            };
          }
          
          // Generate the first question for a new session
          const processResult = await InterviewOrchestrator.processTurn(sessionId, '');
          
          return {
            sessionId,
            startedAt: startedAt ?? null,
            reply: (processResult as any).reply,
            done: false,
            assessmentSignal: (processResult as any).assessmentSignal,
            nextAction: (processResult as any).nextAction,
            telemetry: (processResult as any).telemetry
          };
        });
        
        return NextResponse.json(result);
      } catch (err: any) {
        console.error(err);
        return handleApiError(err);
      }
    }

    // CONTINUE
    if (message !== undefined) {
      try {
        // Find current turn for deduping
        const { getSession } = await import('@/db/sessions');
        const session = await getSession(sessionId);
        const currentTurn = session ? session.current_turn : 0;
        
        const result = await requestDeduper.dedupe(`turn:${sessionId}:${currentTurn}`, async () => {
          return await InterviewOrchestrator.processTurn(sessionId, message);
        });
        
        return NextResponse.json(result);
      } catch (err: any) {
        console.error(err);
        return handleApiError(err);
      }
    }

    return NextResponse.json({ error: 'Invalid request', code: 'INVALID_REQUEST' }, { status: 400 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

function handleApiError(err: any) {
  if (err?.code === 'AI_UNAVAILABLE' || err?.name === 'AIUnavailableError') {
    return NextResponse.json({ error: err.message || 'The AI interviewer is temporarily busy. Your progress has been saved. You can resume shortly.', code: 'AI_UNAVAILABLE', retryable: true }, { status: 503 });
  }
  if (err.name === 'LLMError') {
     const isRateLimit = err.code === 'LLM_RATE_LIMITED';
     const isAuth = err.code === 'LLM_AUTH_ERROR';
     const isModel = err.code === 'LLM_MODEL_UNAVAILABLE';
     
     if (isRateLimit) return NextResponse.json({ error: 'The assessment engine is temporarily rate limited.', code: 'LLM_RATE_LIMITED', retryable: true }, { status: 429 });
     if (isAuth) return NextResponse.json({ error: 'Assessment engine authentication failed.', code: 'LLM_AUTH_ERROR', retryable: false }, { status: 500 });
     if (isModel) return NextResponse.json({ error: 'Assessment engine model unavailable.', code: 'LLM_MODEL_UNAVAILABLE', retryable: false }, { status: 500 });
     
     return NextResponse.json({ error: 'Assessment engine temporarily unavailable.', code: 'LLM_UNAVAILABLE', retryable: true }, { status: 500 });
  }
  if (err.message === 'SESSION_ALREADY_COMPLETED') {
     return NextResponse.json({ error: 'Interview is already completed.', code: 'SESSION_ALREADY_COMPLETED' }, { status: 400 });
  }
  if (err.message === 'SESSION_NOT_FOUND') {
     return NextResponse.json({ error: 'Session not found.', code: 'SESSION_NOT_FOUND' }, { status: 404 });
  }
  if (err.message === 'CANDIDATE_NOT_FOUND') {
     return NextResponse.json({ error: 'Candidate not found.', code: 'CANDIDATE_NOT_FOUND' }, { status: 404 });
  }
  if (err.message === 'CONCURRENCY_CONFLICT' || err.code === '23505') {
     return NextResponse.json({ error: 'Simultaneous requests detected.', code: 'CONCURRENCY_CONFLICT' }, { status: 409 });
  }
  return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
}
