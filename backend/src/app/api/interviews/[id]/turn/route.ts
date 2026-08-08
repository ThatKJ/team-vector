import { NextResponse } from 'next/server';
import { getSession, updateSession, finishSession } from '@/lib/sessionManager';
import { determineNextStrategy, planNextQuestion, determineRoundAndCompletion } from '@/lib/strategyEngine';
import { generateQuestion, evaluateAnswer, generateFeedback } from '@/lib/gemini';
import { updateTheory, adjustDifficulty } from '@/lib/theoryEngine';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request, context: any) {
  const params = await context.params;
  const interviewId = params.id;
  
  try {
    const { turn_id, answer } = await request.json();

    let session = getSession(interviewId);
    if (!session) {
      return NextResponse.json({ error: 'Unknown sessionId' }, { status: 404 });
    }
    
    if (session.isComplete) {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    // 1. Save candidate answer to the PREVIOUS turn in Supabase
    const dbTurnId = turn_id.replace('turn_', '');
    await supabase.from('interview_turns')
      .update({ candidate_answer: answer })
      .eq('id', dbTurnId);

    // 2. Engine Evaluation
    const lastQuestion = session.conversationHistory[session.conversationHistory.length - 1].content;
    const currentPlan = planNextQuestion(session.theory, session.currentStrategy);
    const targetModuleId = currentPlan.targetModule;

    const evaluation = await evaluateAnswer(lastQuestion, answer, targetModuleId);
    
    // Engine Theory Update
    const newTheory = updateTheory(
      session.theory,
      evaluation.signal,
      evaluation.reasoning,
      evaluation.answerSummary,
      lastQuestion,
      targetModuleId,
      evaluation.affectedDimensions,
      evaluation.claims || []
    );

    const { newRound, isComplete } = determineRoundAndCompletion(newTheory);
    newTheory.currentRound = newRound;

    session = updateSession(interviewId, { 
      theory: newTheory,
      currentDifficulty: adjustDifficulty(session.currentDifficulty, evaluation.signal),
      conversationHistory: [
        ...session.conversationHistory, 
        { role: 'user', content: answer }
      ]
    });

    // Determine current turn number for Supabase
    const { data: turns } = await supabase.from('interview_turns')
      .select('turn_number')
      .eq('interview_id', interviewId)
      .order('turn_number', { ascending: false })
      .limit(1);
    
    const currentTurnNum = turns?.[0]?.turn_number || 1;

    // 3. Handle Completion
    if (isComplete) {
      const feedback = await generateFeedback(session.theory);
      
      const avgScore = Object.values(session.theory.modules).reduce((sum, mod) => sum + mod.score, 0) / 8;
      const verdict = avgScore > 80 ? 'Strong Hire' : avgScore > 65 ? 'Hire' : avgScore > 50 ? 'Borderline' : 'Needs Development';
      const assessmentConfidence = Object.values(session.theory.modules).reduce((sum, mod) => sum + mod.confidence, 0) / 8;

      finishSession(interviewId, feedback);

      // Persist Completion to Supabase
      await supabase.from('interviews')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          score: avgScore
        })
        .eq('id', interviewId);

      const safeScore = isNaN(avgScore) ? 0 : Math.round(avgScore);
      const { error: reportError } = await supabase.from('reports')
        .insert({
          interview_id: interviewId,
          overall_score: safeScore,
          summary: feedback || "Completed interview.",
          decision_trace: { verdict, confidence: assessmentConfidence }
        });

      if (reportError) {
        console.error("Failed to insert report:", reportError);
      }

      return NextResponse.json({
        evaluation_status: 'processed',
        is_complete: true
      });
    }

    // 4. Generate next question for continuing interview
    const nextStrategy = determineNextStrategy(session.theory);
    session = updateSession(interviewId, { currentStrategy: nextStrategy });

    const nextPlan = planNextQuestion(session.theory, session.currentStrategy);
    const nextGenerated = await generateQuestion(
      session.theory, 
      session.currentStrategy, 
      nextPlan.targetModule, 
      nextPlan.targetDay, 
      session.currentDifficulty, 
      nextPlan.questionType
    );

    session = updateSession(interviewId, {
      conversationHistory: [
        ...session.conversationHistory,
        { role: 'assistant', content: nextGenerated.question }
      ]
    });

    // 5. Save next turn to Supabase
    const { data: newTurn, error: turnError } = await supabase.from('interview_turns')
      .insert({
        interview_id: interviewId,
        turn_number: currentTurnNum + 1,
        question_text: nextGenerated.question
      })
      .select().single();

    if (turnError) throw turnError;

    return NextResponse.json({
      evaluation_status: 'processed',
      is_complete: false,
      next_turn: {
        turn_id: `turn_${newTurn.id}`,
        question: nextGenerated.question,
        topic: 'Adaptive Follow-up', // Engine does not provide per-turn topic names easily
        turn_number: currentTurnNum + 1
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
