"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api-client";
import { Candidate } from "@/lib/types";
import { ChevronRight, Search, Play, FileText, Clock } from "lucide-react";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient.getCandidates().then(data => {
      setCandidates(data);
      setLoading(false);
    });
  }, []);

  const filtered = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-[var(--color-foreground)]">Candidate Roster</h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Select a candidate to begin an adaptive assessment.</p>
            </div>
            <div className="w-full sm:w-80 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </div>
              <Input 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl h-48"></div>
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-[var(--color-muted-foreground)]">No candidates found.</p>
              </div>
            ) : (
              filtered.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    href={candidate.status === 'completed' ? `/report/${candidate.sessionId}` : (candidate.status === 'in_progress' ? `/interview/${candidate.sessionId}?candidateId=${candidate.id}` : `/setup?candidateId=${candidate.id}`)}
                    className="block group h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 shrink-0 bg-[var(--color-muted)] rounded-full flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform duration-300">
                          <span className="font-bold text-[var(--color-foreground)] text-lg">{candidate.name.charAt(0)}</span>
                        </div>
                        <Badge variant={candidate.status === 'completed' ? 'success' : (candidate.status === 'in_progress' ? 'warning' : 'neutral')} className="shadow-sm">
                          {candidate.status === 'completed' ? 'Report Ready' : (candidate.status === 'in_progress' ? 'In Progress' : 'Pending')}
                        </Badge>
                      </div>

                      <div className="mb-4 flex-grow">
                        <h3 className="font-bold text-lg text-[var(--color-foreground)] group-hover:text-black transition-colors">{candidate.name}</h3>
                        <p className="text-sm font-mono text-[var(--color-muted-foreground)] mt-1">{candidate.role}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-2 line-clamp-2">{candidate.experience}</p>
                      </div>

                      <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
                        <span className="text-sm font-medium flex items-center gap-2">
                          {candidate.status === 'completed' ? <><FileText className="w-4 h-4" /> View Report</> : (candidate.status === 'in_progress' ? <><Clock className="w-4 h-4" /> Resume</> : <><Play className="w-4 h-4" /> Start</>)}
                        </span>
                        <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
