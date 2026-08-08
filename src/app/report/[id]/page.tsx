"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { apiClient } from "@/lib/api-client";
import { InterviewReport } from "@/lib/types";

// Helper to render blocky progress bars
function BlockyProgress({ percent, length = 20 }: { percent: number, length?: number }) {
  const filledBlocks = Math.round((percent / 100) * length);
  const emptyBlocks = length - filledBlocks;
  return (
    <span className="font-mono text-sm tracking-widest text-[var(--color-primary)]">
      {'█'.repeat(Math.max(0, filledBlocks))}
      <span className="text-[var(--color-muted-foreground)]">
        {'░'.repeat(Math.max(0, emptyBlocks))}
      </span>
    </span>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<InterviewReport | null>(null);

  useEffect(() => {
    apiClient.getReport(id).then(setReport).catch(console.error);
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-[var(--color-background)]">
          <p className="animate-pulse text-[var(--color-muted-foreground)] uppercase tracking-widest font-bold text-xs">Generating engineering profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const verdictText = (report.score ?? 0) > 80 ? "STRONG HIRE" : (report.score ?? 0) > 65 ? "HIRE" : (report.score ?? 0) > 50 ? "BORDERLINE" : "NEEDS DEVELOPMENT";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <Navbar />
      <main className="flex-1 py-12 px-6">
        <div className="mx-auto w-full max-w-2xl bg-white dark:bg-[#111] p-10 sm:p-16 shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-[var(--color-border)] relative">
          
          {/* Header */}
          <div className="flex flex-col mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-1">INTERVU</span>
            <h1 className="text-2xl font-black uppercase tracking-wide text-[var(--color-foreground)]">Technical Assessment Report</h1>
            <div className="mt-8 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">Candidate</span>
              <span className="text-xl font-medium text-[var(--color-foreground)]">{id}</span> {/* Using ID temporarily if name isn't fetched */}
            </div>
          </div>

          <hr className="border-t-[3px] border-[var(--color-foreground)] mb-12 opacity-90" />

          {/* OVERALL ASSESSMENT */}
          <div className="flex flex-col items-center justify-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">Overall Assessment</span>
            <span className="text-7xl font-black font-heading tracking-tighter text-[var(--color-foreground)]">{report.score ?? 0}</span>
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-1 rounded-sm">
              {verdictText}
            </span>
          </div>

          <hr className="border-t-[3px] border-[var(--color-foreground)] mb-12 opacity-90" />

          {/* Strengths & Weaknesses Bars */}
          <div className="flex flex-col gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)]">Technical Strengths</span>
              <BlockyProgress percent={(report.score || 0) + 5 > 100 ? 100 : (report.score || 0) + 5} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)]">Areas to Develop</span>
              <BlockyProgress percent={100 - (report.score || 0)} />
            </div>
          </div>

          <hr className="border-t-[3px] border-[var(--color-foreground)] mb-12 opacity-90" />

          {/* Assessment Breakdown */}
          {report.categories && (
            <>
              <div className="mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)] block mb-6">Assessment Breakdown</span>
                <div className="flex flex-col gap-4 font-mono text-sm">
                  <div className="flex justify-between border-b border-[var(--color-border)] border-dashed pb-2">
                    <span className="text-[var(--color-foreground)]">Problem Solving</span>
                    <span className="font-bold">{report.categories.problem_solving ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] border-dashed pb-2">
                    <span className="text-[var(--color-foreground)]">Systems Thinking</span>
                    <span className="font-bold">{report.categories.systems_thinking ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] border-dashed pb-2">
                    <span className="text-[var(--color-foreground)]">Technical Depth</span>
                    <span className="font-bold">{report.categories.technical_depth ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] border-dashed pb-2">
                    <span className="text-[var(--color-foreground)]">Communication</span>
                    <span className="font-bold">{report.categories.communication ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
              <hr className="border-t-[3px] border-[var(--color-foreground)] mb-12 opacity-90" />
            </>
          )}

          {/* INTERVIEW INSIGHTS */}
          <div className="mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)] block mb-8">Interview Insights</span>
            
            <div className="space-y-10">
              {report.evidence?.strengths && report.evidence.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)] mb-4">What they demonstrated</h3>
                  <ul className="space-y-2 list-none pl-0 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                    {report.evidence.strengths.map((str, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-[var(--color-primary)]">›</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.evidence?.gaps && report.evidence.gaps.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)] mb-4">Where they struggled</h3>
                  <ul className="space-y-2 list-none pl-0 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                    {report.evidence.gaps.map((gap, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-red-500">›</span> {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.next_steps && report.next_steps.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)] mb-4">Recommended next steps</h3>
                  <ul className="space-y-2 list-none pl-0 text-sm leading-relaxed text-[var(--color-foreground)]">
                    {report.next_steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="font-mono text-xs opacity-50 mt-0.5">{String(idx + 1).padStart(2, '0')}</span> {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <hr className="border-t-[3px] border-[var(--color-foreground)] mb-8 opacity-90" />

          {/* Footer branding */}
          <div className="flex flex-col items-center justify-center opacity-50">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-foreground)] mb-1">INTERVU</span>
            <span className="text-[10px] tracking-widest uppercase font-mono">Assessment completed</span>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
