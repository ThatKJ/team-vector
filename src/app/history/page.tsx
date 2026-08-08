import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const MOCK_HISTORY = [
  { id: "int_1", candidate: "Sarah Jenkins", role: "Backend Developer", date: "2026-08-07", score: 92, status: "completed", topic: "Distributed Systems" },
  { id: "int_2", candidate: "Alex Chen", role: "AI Engineer", date: "2026-08-08", score: 86, status: "completed", topic: "Vector Search" }
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-[var(--color-foreground)]">Interview History</h1>
              <p className="text-[var(--color-muted-foreground)] mt-2">Past assessment reports and session context.</p>
            </div>
            <Link href="/candidates">
              <Button>New Assessment</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {MOCK_HISTORY.map(session => (
              <Card key={session.id} className="transition-all hover:border-[var(--color-foreground)]/20">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center font-bold text-[var(--color-primary)] bg-[var(--color-surface)]">
                      {session.score}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{session.candidate}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-muted-foreground)] font-mono">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Badge variant="outline" className="hidden md:inline-flex">{session.topic}</Badge>
                    <Link href={`/report/${session.id}`}>
                      <Button variant="secondary" size="sm">View Report</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {MOCK_HISTORY.length === 0 && (
              <div className="text-center py-24 bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)]">
                <p className="text-[var(--color-muted-foreground)]">No past sessions found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
