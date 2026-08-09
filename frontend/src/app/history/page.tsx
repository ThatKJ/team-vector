import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight } from "lucide-react";

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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-[var(--color-foreground)]">Interview History</h1>
              <p className="text-[var(--color-muted-foreground)] mt-2">Past assessment reports and session context.</p>
            </div>
            <Link 
              href="/candidates"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-sm font-semibold transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm h-10 px-4 py-2"
            >
              New Assessment
            </Link>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-border)] bg-[#fafafa] text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <div className="col-span-12 sm:col-span-5">Candidate / Topic</div>
              <div className="hidden sm:block sm:col-span-3">Date</div>
              <div className="hidden sm:block sm:col-span-4 text-right">Result</div>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {MOCK_HISTORY.map(session => (
                <Link 
                  href={`/report/${session.id}`} 
                  key={session.id}
                  className="group grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[var(--color-background)] transition-colors focus-visible:outline-none focus-visible:bg-[var(--color-background)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <div className="col-span-10 sm:col-span-5 flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 border border-[var(--color-border)] rounded-full flex items-center justify-center font-bold text-[var(--color-foreground)] bg-[#f0f0ed]">
                      {session.score}
                    </div>
                    <div>
                      <div className="font-semibold text-base text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">{session.candidate}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="neutral" className="text-[10px]">{session.topic}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex sm:col-span-3 items-center">
                    <span className="text-sm font-mono text-[var(--color-muted-foreground)]">{session.date}</span>
                  </div>

                  <div className="hidden sm:flex sm:col-span-3 items-center justify-end">
                    <span className="text-sm font-medium text-[var(--color-primary)]">Completed</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
              
              {MOCK_HISTORY.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <p className="text-[var(--color-muted-foreground)]">No past sessions found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
