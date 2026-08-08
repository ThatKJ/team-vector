"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api-client";
import { Candidate } from "@/lib/types";
import { ChevronRight, Search } from "lucide-react";

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

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-border)] bg-[#fafafa] text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <div className="col-span-12 sm:col-span-5">Candidate</div>
              <div className="hidden sm:block sm:col-span-4">Experience</div>
              <div className="hidden sm:block sm:col-span-3 text-right">Status</div>
            </div>

            {loading ? (
              <div className="divide-y divide-[var(--color-border)]">
                {[1,2,3].map(i => (
                  <div key={i} className="flex px-6 py-5 animate-pulse">
                    <div className="w-full h-10 bg-[var(--color-border)] rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {filtered.map(candidate => (
                  <Link 
                    href={`/setup?candidateId=${candidate.id}`} 
                    key={candidate.id}
                    className="group grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[var(--color-background)] transition-colors focus-visible:outline-none focus-visible:bg-[var(--color-background)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  >
                    <div className="col-span-10 sm:col-span-5 flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 bg-[#f0f0ed] rounded-full flex items-center justify-center border border-[var(--color-border)]">
                        <span className="font-bold text-gray-500">{candidate.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-base text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">{candidate.name}</div>
                        <div className="text-sm font-mono text-[var(--color-muted-foreground)] mt-0.5">{candidate.role}</div>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex sm:col-span-4 items-center">
                      <span className="text-sm text-[var(--color-foreground)]">{candidate.experience}</span>
                    </div>

                    <div className="hidden sm:flex sm:col-span-2 items-center justify-end">
                      <Badge variant={candidate.status === 'completed' ? 'success' : 'neutral'}>
                        {candidate.status === 'completed' ? 'Report Ready' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
                
                {filtered.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <p className="text-[var(--color-muted-foreground)]">No candidates found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
