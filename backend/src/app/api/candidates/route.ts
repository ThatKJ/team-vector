import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/db/client';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'candidates.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const candidates = JSON.parse(fileContents);

    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('id, candidate_id, status');

    const sessionMap = new Map();
    if (sessions) {
      for (const session of sessions) {
        // Keep the latest or completed session
        const existing = sessionMap.get(session.candidate_id);
        if (!existing || session.status === 'COMPLETED') {
          sessionMap.set(session.candidate_id, session);
        }
      }
    }

    const formatted = candidates.map((c: any) => {
      const session = sessionMap.get(c.id);
      return {
        ...c,
        experience: c.experienceLevel,
        status: session?.status === 'COMPLETED' ? 'completed' : (session ? 'in_progress' : 'pending'),
        sessionId: session?.id || null
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
