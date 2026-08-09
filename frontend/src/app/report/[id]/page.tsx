"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    apiClient.getReport(id).then(setReport).catch(console.error);
  }, [id]);

  if (!report) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--color-background)]">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)] animate-pulse">
          Generating intelligence dossier...
        </div>
      </div>
    );
  }

  const score = report.score ?? 0;
  const verdict = report.verdict || "PENDING";
  const summary = report.summary || "Assessment complete.";

  // Aggregate all evidence for the evidence log
  const allEvidence: { turn: number, claim: string, demonstrated: boolean, competency: string }[] = [];
  report.evidence?.strengths?.forEach((s: any) => {
    s.evidence?.forEach((e: any) => allEvidence.push({ ...e, demonstrated: true, competency: s.competency }));
  });
  report.evidence?.gaps?.forEach((g: any) => {
    g.evidence?.forEach((e: any) => allEvidence.push({ ...e, demonstrated: false, competency: g.competency }));
  });
  
  // Sort evidence by turn number
  allEvidence.sort((a, b) => a.turn - b.turn);

  // Competency Map rendering
  const competencies = report.rawCompetencies ? Object.entries(report.rawCompetencies) : [];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans selection:bg-[var(--color-muted)] py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-3xl border border-[var(--color-border)] p-10 md:p-20 shadow-2xl shadow-black/5 rounded-3xl">
        
        {/* Dossier Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-600 mb-2">
            INTERVU
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-[var(--color-foreground)] mb-12">
            TECHNICAL ASSESSMENT DOSSIER
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start border-t border-b border-[var(--color-border)] py-6">
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">
                  Candidate
                </div>
                <div className="text-sm font-mono text-neutral-900">
                  {id.substring(0,8).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">
                  Assessment ID
                </div>
                <div className="text-sm font-mono text-neutral-900">
                  {id}
                </div>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 flex flex-col gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">
                  Competencies Assessed
                </div>
                <div className="text-sm font-mono text-neutral-900">
                  {competencies.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">
                  Evidence Collected
                </div>
                <div className="text-sm font-mono text-neutral-900">
                  {allEvidence.length}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Verdict */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20 text-center"
        >
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-6">
            OVERALL ASSESSMENT
          </div>
          <div className="text-[80px] leading-none font-medium tracking-tighter text-neutral-900 mb-4">
            {score}
          </div>
          <div className="text-lg font-bold tracking-[0.2em] uppercase text-neutral-900 mb-6">
            {verdict}
          </div>
          <div className="text-xl text-neutral-700 italic max-w-2xl mx-auto">
            "{summary}"
          </div>
        </motion.div>

        {/* Competency Map */}
        {competencies.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-foreground)] mb-4">
              COMPETENCY MAP
            </div>
            <hr className="border-[var(--color-border)] mb-8" />
            <div className="space-y-6 font-mono text-sm">
              {competencies.map(([name, data]: [string, any], idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-[var(--color-border)] pb-4 hover:bg-[var(--color-muted)]/50 transition-colors rounded-xl p-4">
                  <div className="w-full md:w-1/3 text-[var(--color-foreground)] font-bold mb-4 md:mb-0">{name}</div>
                  <div className="w-full md:w-2/3 flex justify-between md:justify-end gap-2 md:gap-8 text-xs text-[var(--color-muted-foreground)]">
                    <div className="flex flex-col items-center md:items-end">
                      <span className="uppercase text-[9px] font-bold tracking-widest mb-1">Correctness</span>
                      <span className="text-[var(--color-foreground)] font-black text-base">{(data.conceptualUnderstanding * 100).toFixed(0)}</span>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                      <span className="uppercase text-[9px] font-bold tracking-widest mb-1">Depth</span>
                      <span className="text-[var(--color-foreground)] font-black text-base">{(data.reasoningAbility * 100).toFixed(0)}</span>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                      <span className="uppercase text-[9px] font-bold tracking-widest mb-1">Application</span>
                      <span className="text-[var(--color-foreground)] font-black text-base">{(data.applicationAbility * 100).toFixed(0)}</span>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                      <span className="uppercase text-[9px] font-bold tracking-widest mb-1">Uncertainty</span>
                      <span className="text-[var(--color-foreground)] font-black text-base">{(data.uncertainty * 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-4">
              WHAT THE CANDIDATE DEMONSTRATED
            </div>
            <hr className="border-neutral-200 mb-6" />
            <div className="space-y-8">
              {report.evidence?.strengths?.map((str: any, idx: number) => (
                <div key={idx}>
                  <div className="flex gap-3 mb-2">
                    <span className="text-emerald-500 font-bold mt-[2px]">✓</span>
                    <div className="text-[14px] font-medium leading-relaxed text-neutral-900">
                      {str.conclusion}
                    </div>
                  </div>
                  <div className="pl-7 space-y-3">
                    {str.evidence?.map((ev: any, i: number) => (
                      <div key={i} className="text-xs text-neutral-600 bg-neutral-50 p-3 border border-neutral-100 font-mono">
                        <span className="font-bold text-neutral-900 block mb-1">TURN {ev.turn}</span>
                        {ev.claim}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!report.evidence?.strengths || report.evidence.strengths.length === 0) && (
                <div className="text-[13px] text-neutral-400 font-mono">None identified.</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-4">
              WHERE UNCERTAINTY REMAINED
            </div>
            <hr className="border-neutral-200 mb-6" />
            <div className="space-y-8">
              {report.evidence?.gaps?.map((gap: any, idx: number) => (
                <div key={idx}>
                  <div className="flex gap-3 mb-2">
                    <span className="text-amber-500 font-bold mt-[2px]">△</span>
                    <div className="text-[14px] font-medium leading-relaxed text-neutral-900">
                      {gap.conclusion}
                    </div>
                  </div>
                  <div className="pl-7 space-y-3">
                    {gap.evidence?.map((ev: any, i: number) => (
                      <div key={i} className="text-xs text-neutral-600 bg-neutral-50 p-3 border border-neutral-100 font-mono">
                        <span className="font-bold text-neutral-900 block mb-1">TURN {ev.turn}</span>
                        {ev.claim}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!report.evidence?.gaps || report.evidence.gaps.length === 0) && (
                <div className="text-[13px] text-neutral-400 font-mono">No significant uncertainty remaining.</div>
              )}
            </div>
          </div>
        </div>

        {/* Adaptation Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-4">
            ADAPTATION TIMELINE
          </div>
          <hr className="border-neutral-200 mb-8" />
          
          <div className="flex flex-col items-center font-mono text-[11px] space-y-4">
            {report.trajectory?.map((t: any, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col items-center w-full max-w-sm"
              >
                <div className="bg-neutral-50 p-4 border border-neutral-200 w-full text-center hover:bg-neutral-100 transition-colors">
                  <div className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">
                    TURN {idx + 1} {t.fingerprint?.competency ? `• ${t.fingerprint.competency}` : ''}
                  </div>
                  <div className="font-bold text-neutral-900 mb-2">
                    {t.strategy}
                  </div>
                  <div className="text-neutral-600 lowercase text-xs leading-relaxed font-sans">
                    {t.decision}
                  </div>
                </div>
                {idx < report.trajectory!.length - 1 && (
                  <div className="text-neutral-300 my-2">↓</div>
                )}
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              <div className="text-neutral-300 my-2">↓</div>
              <div className="bg-neutral-900 text-white px-4 py-3 border border-neutral-900 font-bold w-full text-center">
                CONCLUDE
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Evidence Log */}
        <div className="mb-20">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-4">
            EVIDENCE LOG
          </div>
          <hr className="border-neutral-200 mb-0" />
          <div className="w-full">
            <div className="flex py-3 border-b border-neutral-200 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">
              <div className="w-16">TURN</div>
              <div className="w-1/3">TARGET</div>
              <div className="w-1/2">OBSERVATION</div>
              <div className="w-16 text-right">IMPACT</div>
            </div>
            {allEvidence.map((ev, idx) => (
              <div key={idx} className="flex py-4 border-b border-neutral-100 text-sm">
                <div className="w-16 font-mono text-neutral-500">{ev.turn}</div>
                <div className="w-1/3 font-medium text-neutral-900 pr-4">{ev.competency}</div>
                <div className="w-1/2 text-neutral-700 leading-relaxed pr-4">
                  <span className={ev.demonstrated ? "text-emerald-500 font-bold mr-2" : "text-amber-500 font-bold mr-2"}>
                    {ev.demonstrated ? "✓" : "△"}
                  </span>
                  {ev.claim}
                </div>
                <div className="w-16 text-right font-bold">
                  {ev.demonstrated ? (
                    <span className="text-emerald-600">Conf ↑</span>
                  ) : (
                    <span className="text-amber-600">Unc ↑</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Recommendation */}
        {report.final_recommendation && (
          <div className="bg-neutral-50 border border-neutral-200 p-8">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-6">
              FINAL RECOMMENDATION
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                  STRONGEST SIGNAL
                </div>
                <div className="text-sm text-neutral-900 font-medium">
                  {report.final_recommendation.strongest_signal}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                  BIGGEST RISK
                </div>
                <div className="text-sm text-neutral-900 font-medium">
                  {report.final_recommendation.biggest_risk}
                </div>
              </div>
            </div>

            <hr className="border-neutral-200 my-6" />

            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                RECOMMENDED NEXT STEP
              </div>
              <div className="text-sm text-neutral-900 font-medium bg-white p-4 border border-neutral-200">
                {report.final_recommendation.recommended_next_step}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
