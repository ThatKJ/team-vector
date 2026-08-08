"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { Candidate } from "@/lib/types";

function SetupContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (candidateId) {
      apiClient.getCandidates().then(data => {
        const found = data.find(c => c.id === candidateId);
        if (found) setCandidate(found);
      });
    }
  }, [candidateId]);

  const handleStart = async () => {
    if (!candidateId) return;
    setStarting(true);
    try {
      const res = await apiClient.startInterview(candidateId);
      router.push(`/interview/${res.interview_id}`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  };

  if (!candidate) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[var(--color-background)] min-h-[60vh]">
        <p className="text-[var(--color-muted-foreground)] animate-pulse">Loading candidate data...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[var(--color-background)] py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold text-[var(--color-foreground)]">Assessment Setup</h1>
          <p className="text-[var(--color-muted-foreground)] mt-2">Configure the adaptive interview based on cohort progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                     <span className="font-bold text-gray-500 text-xl">{candidate.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{candidate.name}</h2>
                    <p className="text-[var(--color-muted-foreground)] font-mono text-sm">{candidate.role} • {candidate.experience}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">Curriculum Coverage</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">Day 1: Vector DBs</Badge>
                      <Badge variant="success">Day 2: RAG Systems</Badge>
                      <Badge variant="success">Day 3: Agentic Workflows</Badge>
                      <Badge variant="neutral">Day 4: Fine-tuning (Pending)</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-4">Interview Scope</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-muted-foreground)]">Assessment Type</span>
                    <span className="font-medium text-sm">Technical Deep Dive</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-muted-foreground)]">Expected Duration</span>
                    <span className="font-medium text-sm">30 - 45 mins</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-muted-foreground)]">Difficulty Context</span>
                    <span className="font-medium text-sm">Adaptive ({candidate.experience})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6 flex flex-col gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Ready to begin?</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">The AI interviewer will adapt questions based on the selected curriculum scope and candidate&apos;s live responses.</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleStart}
                  disabled={starting}
                >
                  {starting ? "Initializing..." : "Begin Interview"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SetupPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<main className="flex-1 flex items-center justify-center bg-[var(--color-background)] min-h-[60vh]"><p className="text-[var(--color-muted-foreground)] animate-pulse">Loading setup...</p></main>}>
        <SetupContent />
      </Suspense>
      <Footer />
    </>
  );
}
