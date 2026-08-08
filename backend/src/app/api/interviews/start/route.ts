import { NextResponse } from 'next/server';
import { getSession, createSession, updateSession } from '@/lib/sessionManager';
import { planNextQuestion } from '@/lib/strategyEngine';
import { generateQuestion } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { candidate_id } = await request.json();
    if (!candidate_id) {
      return NextResponse.json({ error: 'Missing candidate_id' }, { status: 400 });
    }

    // 1. Fetch Candidate from candidates.json to pass to the engine
    const filePath = path.join(process.cwd(), 'src/lib/data/candidates.json');
    const rawCandidates = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Since we generate determinist UUIDs from id strings, let's find the matching candidate
    // Or we can query supabase to get the candidate name. Let's query supabase for safety since they are synced.
    const { data: dbCandidate } = await supabase.from('candidates').select('*').eq('id', candidate_id).single();
    
    if (!dbCandidate) {
      return NextResponse.json({ error: 'Candidate not found in DB' }, { status: 404 });
    }

    const fullCandidate = rawCandidates.find((c: any) => c.name === dbCandidate.name);
    if (!fullCandidate) {
      return NextResponse.json({ error: 'Candidate data not found in JSON' }, { status: 404 });
    }

    // 2. Create Interview in Supabase
    const { data: interview, error: intError } = await supabase.from('interviews')
      .insert({ candidate_id, status: 'in_progress', started_at: new Date().toISOString() })
      .select().single();
      
    if (intError || !interview) throw intError;

    // 3. Start Session in Ayaan's Engine
    const sessionId = interview.id;
    let session = getSession(sessionId);
    if (session) {
      return NextResponse.json({ error: 'Session already started' }, { status: 400 });
    }
    session = createSession(sessionId, fullCandidate);
    
    // 4. Generate first question
    const { targetModule, targetDay, questionType } = planNextQuestion(session.theory, session.currentStrategy);
    const generated = await generateQuestion(
      session.theory, 
      session.currentStrategy, 
      targetModule, 
      targetDay, 
      session.currentDifficulty, 
      questionType
    );
    
    session = updateSession(sessionId, {
      conversationHistory: [{ role: 'assistant', content: generated.question }]
    });

    // 5. Save first turn to Supabase
    const { data: turn, error: turnError } = await supabase.from('interview_turns')
      .insert({
        interview_id: interview.id,
        turn_number: 1,
        question_text: generated.question
      })
      .select().single();

    if (turnError) throw turnError;

    // 6. Return Frontend Contract
    return NextResponse.json({
      interview_id: interview.id,
      status: interview.status,
      first_turn: {
        turn_id: `turn_${turn.id}`,
        question: generated.question,
        topic: 'Introduction', // The engine does not provide a human readable topic here currently
        turn_number: 1
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
