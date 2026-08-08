"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api-client";
import { Candidate } from "@/lib/types";

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
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-[var(--color-foreground)]">Candidate Roster</h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Select a candidate to begin an adaptive assessment.</p>
            </div>
            <div className="w-full sm:w-72">
              <Input 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <Card key={i} className="animate-pulse h-[200px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(candidate => (
                <Card key={candidate.id} interactive className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{candidate.name}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">{candidate.role}</CardDescription>
                      </div>
                      <Badge variant={candidate.status === 'completed' ? 'success' : 'neutral'}>
                        {candidate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-[var(--color-muted-foreground)]">Experience: {candidate.experience}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/setup?candidateId=${candidate.id}`} className="w-full">
                      <Button className="w-full" variant={candidate.status === 'completed' ? 'secondary' : 'primary'}>
                        {candidate.status === 'completed' ? 'View Report' : 'Setup Interview'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
