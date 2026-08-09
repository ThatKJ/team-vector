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
import { motion } from "framer-motion";
import { Play } from "lucide-react";

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

  const handleStart = () => {
    if (!candidateId) return;
    setStarting(true);
    const sessionId = crypto.randomUUID();
    router.push(`/interview/${sessionId}?candidateId=${candidateId}`);
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

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl shadow-black/5 bg-white/50 backdrop-blur-xl">
              <CardContent className="pt-8 pb-8 px-8">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--color-border)]">
                  <div className="h-20 w-20 bg-[var(--color-muted)] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner border border-[var(--color-border)]">
                     <span className="font-bold text-[var(--color-foreground)] text-3xl">{candidate.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-heading">{candidate.name}</h2>
                    <p className="text-[var(--color-muted-foreground)] font-mono text-sm mt-2 flex items-center gap-2">
                      <span className="bg-[var(--color-muted)] px-2 py-1 rounded-md">{candidate.role}</span>
                      <span>•</span>
                      <span>{candidate.experience}</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">Curriculum Coverage</h3>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="success" className="px-3 py-1.5 text-sm shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">Day 1: Vector DBs</Badge>
                      <Badge variant="success" className="px-3 py-1.5 text-sm shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">Day 2: RAG Systems</Badge>
                      <Badge variant="success" className="px-3 py-1.5 text-sm shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">Day 3: Agentic Workflows</Badge>
                      <Badge variant="neutral" className="px-3 py-1.5 text-sm shadow-sm">Day 4: Fine-tuning (Pending)</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-black/5 bg-white/50 backdrop-blur-xl">
              <CardContent className="pt-8 pb-8 px-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-6">Interview Scope</h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-3 border-b border-dashed border-[var(--color-border)]">
                    <span className="text-[var(--color-muted-foreground)]">Assessment Type</span>
                    <span className="font-semibold text-sm bg-[var(--color-muted)] px-3 py-1 rounded-full">Technical Deep Dive</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-dashed border-[var(--color-border)]">
                    <span className="text-[var(--color-muted-foreground)]">Expected Duration</span>
                    <span className="font-semibold text-sm">30 - 45 mins</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-dashed border-[var(--color-border)]">
                    <span className="text-[var(--color-muted-foreground)]">Difficulty Context</span>
                    <span className="font-semibold text-sm">Adaptive ({candidate.experience})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-24 border-0 shadow-2xl shadow-[var(--color-primary)]/10 bg-[var(--color-foreground)] text-[var(--color-background)]">
              <CardContent className="pt-8 pb-8 px-6 flex flex-col gap-8">
                <div>
                  <h3 className="font-bold text-xl mb-3 font-heading">Ready to begin?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    The AI interviewer will adapt questions based on the selected curriculum scope and candidate&apos;s live responses.
                  </p>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-black hover:bg-gray-100 py-6 text-lg rounded-xl font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all" 
                    onClick={handleStart}
                    disabled={starting}
                  >
                    {starting ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></span> Initializing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Play className="w-5 h-5 fill-current" /> Begin Interview</span>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
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
