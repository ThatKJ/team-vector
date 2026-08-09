import { getSession, getInterviewHistory } from '../db/sessions';
import { supabase } from '../db/client';
import { CandidateKnowledgeState } from '../core/types';
import { aiGenerateStructuredContent } from '../ai/gateway';

const reportJsonSchema = {
  type: "object",
  properties: {
    score: { type: "integer", description: "0-100 overall score" },
    verdict: { type: "string", description: "Must be one of: EXCEPTIONAL, STRONG, SOLID, DEVELOPING, NEEDS DEVELOPMENT" },
    summary: { type: "string", description: "A one sentence hero summary of the candidate's performance" },
    categories: {
      type: "object",
      properties: {
        problem_solving: { type: "integer" },
        systems_thinking: { type: "integer" },
        technical_depth: { type: "integer" },
        communication: { type: "integer" }
      },
      required: ["problem_solving", "systems_thinking", "technical_depth", "communication"]
    },
    evidence: {
      type: "object",
      properties: {
        strengths: { 
          type: "array", 
          items: { 
            type: "object",
            properties: {
              competency: { type: "string" },
              conclusion: { type: "string" },
              evidence: {
                type: "array",
                items: {
                  type: "object",
                  properties: { turn: { type: "integer" }, claim: { type: "string" }, demonstrated: { type: "boolean" } },
                  required: ["turn", "claim", "demonstrated"]
                }
              }
            },
            required: ["competency", "conclusion", "evidence"]
          } 
        },
        gaps: { 
          type: "array", 
          items: { 
            type: "object",
            properties: {
              competency: { type: "string" },
              conclusion: { type: "string" },
              evidence: {
                type: "array",
                items: {
                  type: "object",
                  properties: { turn: { type: "integer" }, claim: { type: "string" }, demonstrated: { type: "boolean" } },
                  required: ["turn", "claim", "demonstrated"]
                }
              }
            },
            required: ["competency", "conclusion", "evidence"]
          } 
        }
      },
      required: ["strengths", "gaps"]
    },
    final_recommendation: {
      type: "object",
      properties: {
        strongest_signal: { type: "string" },
        biggest_risk: { type: "string" },
        recommended_next_step: { type: "string" }
      },
      required: ["strongest_signal", "biggest_risk", "recommended_next_step"]
    }
  },
  required: ["score", "verdict", "summary", "categories", "evidence", "final_recommendation"]
};

export async function finalizeAssessment(sessionId: string) {
  // 1. Verify session exists and is COMPLETED
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('SESSION_NOT_FOUND');
  }

  if (session.status !== 'COMPLETED') {
    throw new Error('SESSION_NOT_COMPLETED');
  }

  // 2. Check if report already exists idempotently
  const { data: existingReport } = await supabase
    .from('assessment_reports')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (existingReport) {
    console.log(`[REPORT EXISTS] Returning persisted report for session: ${sessionId}`);
    return existingReport.report;
  }

  console.log(`[ASSESSMENT FINALIZE] Generating report for session: ${sessionId}`);

  const state = session.assessment_state as CandidateKnowledgeState;
  const history = await getInterviewHistory(sessionId);

  // 3. Deterministically calculate score
  const comps = Object.values(state.competencies);
  let calculatedScore = 0;
  if (comps.length > 0) {
    let totalCorrectness = 0;
    let totalDepth = 0;
    let totalApplication = 0;
    let totalWeight = 0;
    
    for (const c of comps) {
      const w = c.confidence;
      totalCorrectness += c.conceptualUnderstanding * w;
      totalDepth += c.reasoningAbility * w;
      totalApplication += c.applicationAbility * w;
      totalWeight += w;
    }
    
    if (totalWeight > 0) {
      calculatedScore = Math.round(((totalCorrectness + totalDepth + totalApplication) / (3 * totalWeight)) * 100);
    }
  }

  // Group and deduplicate claims for the LLM
  const groupedClaims: Record<string, any[]> = {};
  const seenClaims = new Set<string>();
  
  for (const claim of state.claims) {
    const claimKey = `${claim.topic}:${claim.claim.toLowerCase()}`;
    if (!seenClaims.has(claimKey)) {
      seenClaims.add(claimKey);
      if (!groupedClaims[claim.topic]) groupedClaims[claim.topic] = [];
      groupedClaims[claim.topic].push({ turn: claim.turnId, claim: claim.claim });
    }
  }

  const systemPrompt = `
You are a senior engineering manager writing a final technical assessment report based on the candidate's performance.
The report MUST be strictly evidence-based.
CRITICAL RULES:
1. DO NOT invent achievements or evidence that did not occur in the transcript.
2. The deterministic calculated score is ${calculatedScore}/100. You MUST output exactly this score.
3. Determine the verdict deterministically: >=85: EXCEPTIONAL, >=70: STRONG, >=50: SOLID, >=35: DEVELOPING, <35: NEEDS DEVELOPMENT.
4. NEVER state a candidate has 'no idea' about a concept if they successfully demonstrated it in an earlier turn. If a claim is demonstrated early but application is missed later, explicitly say: "Candidate demonstrated foundational knowledge, but struggled with application/conflict resolution."
5. Ground all gaps narrowly. If they know the basics but failed application, say exactly that.
6. Every conclusion MUST cite the specific turn number and the actual claim demonstrated or missed.

You MUST return ONLY valid JSON matching this exact schema:
${JSON.stringify(reportJsonSchema, null, 2)}
`;

  const userPrompt = `
Candidate Knowledge State (Verified Claims Grouped By Competency):
${JSON.stringify(groupedClaims, null, 2)}

Interview Transcript (Summary):
${history.map((h: any) => `Turn ${h.turn_number} (${h.role}): ${h.content}`).join('\n')}

Produce a structured JSON report. Ensure the overall score is EXACTLY ${calculatedScore}. Every strength/gap MUST cite the exact turn and claim.
`;

  // 4. Generate report with a single LLM call (best available FREE model via gateway)
  const generatedReport = await aiGenerateStructuredContent<any>({
    task: 'report',
    systemPrompt,
    userPrompt,
    schemaDescription: reportJsonSchema,
    contextId: sessionId,
  });

  // 5. Merge trajectory and raw competencies
  const finalReportJson = {
    ...(generatedReport as any),
    trajectory: state.trajectory,
    rawCompetencies: state.competencies // pass raw competencies to build the Competency Map
  };

  // 6. Persist to Supabase
  const { data: newReport, error: insertError } = await supabase
    .from('assessment_reports')
    .insert({
      session_id: sessionId,
      candidate_id: session.candidate_id,
      overall_score: calculatedScore,
      verdict: finalReportJson.verdict || "PENDING",
      report: finalReportJson
    })
    .select('*')
    .maybeSingle();

  // Handle unique constraint violation (Race condition: someone else inserted it while we were calling Groq)
  if (insertError && insertError.code === '23505') {
    const { data: doubleCheckReport } = await supabase
      .from('assessment_reports')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
      
    if (doubleCheckReport) {
      console.log(`[REPORT EXISTS] Returning persisted report for session (caught race condition): ${sessionId}`);
      return doubleCheckReport.report;
    }
    throw insertError;
  }

  if (insertError) {
    console.error('Failed to insert assessment report:', insertError);
    throw new Error('DATABASE_ERROR');
  }

  console.log(`[REPORT CREATED] Report generated and saved for session: ${sessionId}, Score: ${calculatedScore}`);

  return finalReportJson;
}
