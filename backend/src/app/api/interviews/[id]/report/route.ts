import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const interviewId = params.id;
  
  try {
    const { data: report, error } = await supabase.from('reports')
      .select('*')
      .eq('interview_id', interviewId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      score: report.overall_score || 0,
      categories: {
        problem_solving: report.overall_score || 0,
        systems_thinking: report.overall_score || 0,
        technical_depth: report.overall_score || 0,
        communication: report.overall_score || 0
      },
      evidence: {
        strengths: [
          report.summary || "Completed interview."
        ],
        gaps: [
          report.decision_trace?.verdict || "Needs review."
        ]
      },
      next_steps: [
        "Review areas of improvement highlighted in feedback.",
        "Practice communicating edge cases."
      ],
      decision_trace: [
        { turn: 1, signal: "Interview Completed", weight: 1.0 }
      ]
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
