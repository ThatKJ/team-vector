import { NextResponse } from 'next/server';
import { finalizeAssessment } from '@/assessment/finalize-assessment';
import { requestDeduper } from '@/utils/request-deduper';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const report = await requestDeduper.dedupe(`finalize:${id}`, async () => {
      return await finalizeAssessment(id);
    });

    return NextResponse.json({
      success: true,
      report
    });
  } catch (err: any) {
    console.error(err);
    if (err.name === 'LLMError') {
      const isRateLimit = err.code === 'LLM_RATE_LIMITED';
      if (isRateLimit) return NextResponse.json({ error: 'The assessment engine is temporarily rate limited.', code: 'LLM_RATE_LIMITED', retryable: true }, { status: 429 });
      return NextResponse.json({ error: 'Assessment engine temporarily unavailable.', code: 'LLM_UNAVAILABLE', retryable: true }, { status: 500 });
    }
    if (err.message === 'SESSION_NOT_FOUND') {
      return NextResponse.json({ error: 'Session not found', code: 'SESSION_NOT_FOUND' }, { status: 404 });
    }
    if (err.message === 'SESSION_NOT_COMPLETED') {
      return NextResponse.json({ error: 'Session is not completed yet', code: 'SESSION_NOT_COMPLETED' }, { status: 400 });
    }
    if (err.message === 'CONCURRENCY_CONFLICT' || err.code === '23505') {
       return NextResponse.json({ error: 'Simultaneous requests detected.', code: 'CONCURRENCY_CONFLICT' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to finalize assessment', details: err.message }, { status: 500 });
  }
}
