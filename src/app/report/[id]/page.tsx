"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiClient } from "@/lib/api-client";
import { InterviewReport } from "@/lib/types";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<InterviewReport | null>(null);

  useEffect(() => {
    apiClient.getReport(id).then(setReport).catch(console.error);
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-[var(--color-background)]">
          <p className="animate-pulse text-[var(--color-muted-foreground)]">Generating engineering profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h1 className="font-heading text-4xl font-bold text-[var(--color-foreground)]">Engineering Profile</h1>
            <p className="text-[var(--color-muted-foreground)] mt-2">Technical evaluation and reasoning assessment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                   <div className="w-32 h-32 rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(67,185,107,0.2)]">
                     <span className="font-heading text-5xl font-bold text-[var(--color-primary)]">{report.score}</span>
                   </div>
                   <h2 className="font-bold text-lg">Engineering Readiness</h2>
                   <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Top 15% of cohort</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Competency Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Problem Solving</span>
                      <span className="font-mono">{report.categories.problem_solving}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-foreground)]" style={{ width: `${report.categories.problem_solving}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Systems Thinking</span>
                      <span className="font-mono">{report.categories.systems_thinking}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-foreground)]" style={{ width: `${report.categories.systems_thinking}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Depth</span>
                      <span className="font-mono">{report.categories.technical_depth}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-foreground)]" style={{ width: `${report.categories.technical_depth}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communication</span>
                      <span className="font-mono">{report.categories.communication}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-foreground)]" style={{ width: `${report.categories.communication}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evidence & Signals</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-4 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {report.evidence.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-[var(--color-foreground)] bg-[var(--color-background)] p-3 rounded-[8px] border border-[var(--color-border)]">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#d9534f] mb-4 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      Identified Gaps
                    </h3>
                    <ul className="space-y-3">
                      {report.evidence.gaps.map((gap, idx) => (
                        <li key={idx} className="text-sm text-[var(--color-foreground)] bg-[var(--color-background)] p-3 rounded-[8px] border border-[var(--color-border)]">
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {report.next_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-mono">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
