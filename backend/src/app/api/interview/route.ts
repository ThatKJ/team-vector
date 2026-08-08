import { NextResponse } from 'next/server';
import { getSession, createSession, updateSession, finishSession } from '@/lib/sessionManager';
import { determineNextStrategy, planNextQuestion, determineRoundAndCompletion } from '@/lib/strategyEngine';
import { generateQuestion, evaluateAnswer, generateFeedback } from '@/lib/gemini';
import { updateTheory, adjustDifficulty } from '@/lib/theoryEngine';

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
      session = createSession(sessionId, candidate);
      
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
      
      // Determine the module we were testing (simplified assumption that it was the target module of the strategy)
      const currentPlan = planNextQuestion(session.theory, session.currentStrategy);
      const targetModuleId = currentPlan.targetModule;

      // 1. Evaluate the answer
      const evaluation = await evaluateAnswer(lastQuestion, message, targetModuleId);
      
      // 2. Deterministically update the theory
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

      // 3. Round Manager
      const { newRound, isComplete } = determineRoundAndCompletion(newTheory);
      newTheory.currentRound = newRound;

      // Update basic session state
      session = updateSession(sessionId, { 
        theory: newTheory,
        currentDifficulty: adjustDifficulty(session.currentDifficulty, evaluation.signal),
        conversationHistory: [
          ...session.conversationHistory, 
          { role: 'user', content: message }
        ]
      });

      // 4. Check Completion
      if (isComplete) {
        const feedback = await generateFeedback(session.theory);
        
        // Engineering Intelligence Report (Deterministic)
        const avgScore = Object.values(session.theory.modules).reduce((sum, mod) => sum + mod.score, 0) / 8;
        const verdict = avgScore > 80 ? 'Strong Hire' : avgScore > 65 ? 'Hire' : avgScore > 50 ? 'Borderline' : 'Needs Development';
        const report = {
          engineeringReadiness: avgScore,
          verdict,
          assessmentConfidence: Object.values(session.theory.modules).reduce((sum, mod) => sum + mod.confidence, 0) / 8,
          theoryVersion: session.theory.theoryVersion
        };

        const finalSession = finishSession(sessionId, feedback);
        
        return NextResponse.json({
          reply: "Thank you for completing the interview. Your feedback is ready.",
          done: true,
          feedback: finalSession.feedback,
          report
        });
      }

      // 5. Strategy Selector for next question
      const nextStrategy = determineNextStrategy(session.theory);
      session = updateSession(sessionId, { currentStrategy: nextStrategy });

      // 6. Generate next question
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

      return NextResponse.json({
        reply: nextGenerated.question,
        done: false
      });
    }

    return NextResponse.json({ error: 'Invalid request body. Provide candidate or message.' }, { status: 400 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
