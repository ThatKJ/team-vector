import { NextResponse } from 'next/server';
import { supabase } from '@/db/client';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const { data: existingReport, error } = await supabase
      .from('assessment_reports')
      .select('*')
      .eq('session_id', id)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching report:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!existingReport) {
      return NextResponse.json({ 
        error: 'Report not finalized', 
        code: 'REPORT_NOT_FINALIZED' 
      }, { status: 409 });
    }

    console.log(`[REPORT FETCH] Report retrieved from database for session: ${id}`);
    
    // Add version and generatedAt to the response payload wrapper
    return NextResponse.json({
      ...existingReport.report,
      _meta: {
        generatedAt: existingReport.finalized_at,
        version: 1
      }
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch report', details: err.message }, { status: 500 });
  }
}
