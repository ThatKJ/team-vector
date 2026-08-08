import { NextResponse } from 'next/server';
import { getSession, createSession, updateSession, finishSession } from '@/lib/sessionManager';
import { determineNextStrategy, planNextQuestion, determineRoundAndCompletion } from '@/lib/strategyEngine';
import { generateQuestion, evaluateAnswer, generateFeedback } from '@/lib/gemini';
import { updateTheory, adjustDifficulty } from '@/lib/theoryEngine';
import { supabase } from '@/lib/supabase';
import { getCandidate, getCandidateProgress } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }
    
    const { sessionId, candidate, message } = body;
    let session = getSession(sessionId);

    // START INTERVIEW
    if (candidate) {
      if (session) {
        return NextResponse.json({ error: 'Session already started' }, { status: 400 });
      }

      // Reconstruct full candidate from DB
      const dbCandidate = await getCandidate(candidate.id);
      const progress = await getCandidateProgress(candidate.id);
      
      const fullCandidate = {
        ...dbCandidate,
        missions: progress.map((p: any) => ({
          id: p.topic_id,
          name: p.curriculum_topics?.topic_name || 'Mission',
          status: p.status.toLowerCase(),
          attempts: p.attempts
        }))
      };

      session = createSession(sessionId, fullCandidate);
      
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

      // Persist to Supabase
      await supabase.from('interviews')
        .upsert({ id: sessionId, candidate_id: candidate.id, status: 'in_progress', started_at: new Date().toISOString() }, { onConflict: 'id' });

      await supabase.from('interview_turns')
        .insert({
          interview_id: sessionId,
          turn_number: 1,
          question_text: generated.question
        });

      return NextResponse.json({
        reply: generated.question,
        done: false,
      });
    }

    // CONTINUE INTERVIEW
    if (message) {
      if (!session) {
        return NextResponse.json({ error: 'Unknown sessionId' }, { status: 404 });
      }
      
      if (session.isComplete) {
        return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
      }

      const lastQuestion = session.conversationHistory[session.conversationHistory.length - 1].content;
      const currentPlan = planNextQuestion(session.theory, session.currentStrategy);
      const targetModuleId = currentPlan.targetModule;

      const evaluation = await evaluateAnswer(lastQuestion, message, targetModuleId);
      
      const newTheory = updateTheory(
        session.theory,
        evaluation.signal,
        evaluation.reasoning,
        evaluation.answerSummary,
        lastQuestion,
        targetModuleId,
        evaluation.affectedDimensions,
        (evaluation.claims || []) as any
      );

      const { newRound, isComplete } = determineRoundAndCompletion(newTheory);
      newTheory.currentRound = newRound;

      session = updateSession(sessionId, { 
        theory: newTheory,
        currentDifficulty: adjustDifficulty(session.currentDifficulty, evaluation.signal),
        conversationHistory: [
          ...session.conversationHistory, 
          { role: 'user', content: message }
        ]
      });

      // Determine current turn number for Supabase
      const { data: turns } = await supabase.from('interview_turns')
        .select('id, turn_number')
        .eq('interview_id', sessionId)
        .order('turn_number', { ascending: false })
        .limit(1);
      
      const currentTurn = turns?.[0];
      if (currentTurn) {
        await supabase.from('interview_turns')
          .update({ candidate_answer: message, evaluation_notes: evaluation.reasoning })
          .eq('id', currentTurn.id);
      }

      // Check Completion
      if (isComplete) {
        const feedback = await generateFeedback(session.theory);
        
        const avgScore = Object.values(session.theory.modules).reduce((sum, mod) => sum + mod.score, 0) / 8;
        const verdict = avgScore > 80 ? 'Strong Hire' : avgScore > 65 ? 'Hire' : avgScore > 50 ? 'Borderline' : 'Needs Development';
        const assessmentConfidence = Object.values(session.theory.modules).reduce((sum, mod) => sum + mod.confidence, 0) / 8;

        const finalSession = finishSession(sessionId, feedback);
        
        // Persist completion
        await supabase.from('interviews')
          .update({ status: 'completed', completed_at: new Date().toISOString(), score: Math.round(avgScore) })
          .eq('id', sessionId);

        await supabase.from('reports')
          .insert({
            interview_id: sessionId,
            overall_score: Math.round(avgScore),
            summary: feedback || "Completed interview.",
            decision_trace: { verdict, confidence: assessmentConfidence }
          });

        return NextResponse.json({
          reply: "Thank you for completing the interview. Your feedback is ready.",
          done: true,
          feedback: {
            summary: feedback,
            strengths: ["Persisted in DB"],
            gaps: ["Persisted in DB"],
            next: ["Persisted in DB"]
          }
        });
      }

      // Generate next question
      const nextStrategy = determineNextStrategy(session.theory);
      session = updateSession(sessionId, { currentStrategy: nextStrategy });

      const nextPlan = planNextQuestion(session.theory, session.currentStrategy);
      const nextGenerated = await generateQuestion(
        session.theory, 
        session.currentStrategy, 
        nextPlan.targetModule, 
        nextPlan.targetDay, 
        session.currentDifficulty, 
        nextPlan.questionType
      );

      session = updateSession(sessionId, {
        conversationHistory: [
          ...session.conversationHistory,
          { role: 'assistant', content: nextGenerated.question }
        ]
      });

      await supabase.from('interview_turns')
        .insert({
          interview_id: sessionId,
          turn_number: (currentTurn?.turn_number || 1) + 1,
          question_text: nextGenerated.question
        });

      return NextResponse.json({
        reply: nextGenerated.question,
        done: false
      });
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
