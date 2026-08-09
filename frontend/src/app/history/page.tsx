"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { apiClient } from "@/lib/api-client";
import { Candidate, ReportCategoryScores } from "@/lib/types";
import {
  ArrowRight,
  Download,
  History,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RowState = "completed" | "in_progress" | "no_report";

interface HistoryRow {
  candidate: Candidate;
  state: RowState;
  report?: {
    score: number;
    verdict: string;
    generatedAt?: string;
    categories?: ReportCategoryScores;
  };
}

const VERDICT_TIERS: Record<string, { label: string; classes: string }> = {
  EXCEPTIONAL: {
    label: "Highly Recommended",
    classes: "bg-neon/10 text-neon-soft",
  },
  STRONG: {
    label: "Recommended",
    classes: "bg-[#5a605c]/15 text-[#363b38]",
  },
  SOLID: {
    label: "Average",
    classes: "bg-carbon-raise text-mist",
  },
  DEVELOPING: {
    label: "Not Recommended",
    classes: "bg-[#ffdad6] text-[#93000a]",
  },
  "NEEDS DEVELOPMENT": {
    label: "Not Recommended",
    classes: "bg-[#ffdad6] text-[#93000a]",
  },
};

function scoreColor(score: number) {
  if (score >= 85) return "bg-neon";
  if (score >= 70) return "bg-[#5a605c]";
  if (score >= 50) return "bg-[#6e7a6e]";
  return "bg-[#ba1a1a]";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  problem_solving: "Problem solving",
  systems_thinking: "Systems thinking",
  technical_depth: "Technical depth",
  communication: "Communication",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function HistoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await apiClient.getCandidates();
        const sessions = all.filter(
          (c) => c.sessionId && (c.status === "completed" || c.status === "in_progress")
        );
        const results = await Promise.all(
          sessions.map(async (candidate): Promise<HistoryRow> => {
            if (candidate.status === "in_progress") {
              return { candidate, state: "in_progress" };
            }
            try {
              const report = await apiClient.getReport(candidate.sessionId!);
              return {
                candidate,
                state: "completed",
                report: {
                  score: report.score ?? 0,
                  verdict: report.verdict || "SOLID",
                  generatedAt: report._meta?.generatedAt,
                  categories: report.categories,
                },
              };
            } catch {
              return { candidate, state: "no_report" };
            }
          })
        );
        if (!cancelled) {
          setRows(results.sort((a, b) =>
            (b.report?.generatedAt || "").localeCompare(a.report?.generatedAt || "")
          ));
          setLoading(false);
        }
      } catch (e) {
        console.error("history load failed", e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load history");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.state !== statusFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        row.candidate.name.toLowerCase().includes(q) ||
        row.candidate.role.toLowerCase().includes(q)
      );
    });
  }, [rows, statusFilter, search]);

  const metrics = useMemo(() => {
    const completed = rows.filter((r) => r.state === "completed");
    const scores = completed.map((r) => r.report!.score);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    const passRate = scores.length
      ? Math.round((scores.filter((s) => s >= 70).length / scores.length) * 100)
      : null;

    const categoryTotals: Record<string, { total: number; count: number }> = {};
    completed.forEach((r) => {
      Object.entries(r.report?.categories || {}).forEach(([key, value]) => {
        const entry = categoryTotals[key] || { total: 0, count: 0 };
        entry.total += value;
        entry.count += 1;
        categoryTotals[key] = entry;
      });
    });
    const best = Object.entries(categoryTotals).reduce<{ label: string; value: number } | null>(
      (acc, [key, entry]) => {
        const avg = entry.total / entry.count;
        if (!acc || avg > acc.value) {
          return { label: CATEGORY_LABELS[key] || key, value: Math.round(avg) };
        }
        return acc;
      },
      null
    );

    return { total: rows.length, avg, passRate, best, completedCount: completed.length };
  }, [rows]);

  const handleExport = () => {
    const header = ["Candidate", "Role", "Date", "Score", "Verdict", "Status"];
    const lines = filtered.map((r) => [
      r.candidate.name,
      r.candidate.role,
      formatDate(r.report?.generatedAt),
      r.report ? String(r.report.score) : "—",
      r.report?.verdict || "—",
      r.state === "completed" ? "Completed" : r.state === "in_progress" ? "In Progress" : "Pending",
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intervu-assessment-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openRow = (row: HistoryRow) => {
    if (!row.candidate.sessionId) return;
    if (row.state === "completed") {
      router.push(`/report/${row.candidate.sessionId}`);
    } else if (row.state === "in_progress") {
      router.push(`/interview/${row.candidate.sessionId}?candidateId=${row.candidate.id}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pt-10 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-pearl md:text-5xl">
                Assessment History
              </h1>
              <p className="max-w-2xl text-lg text-mist">
                Review past candidate evaluations, benchmark scores, and access
                detailed AI-generated reports to inform your hiring decisions.
              </p>
            </div>
            <div className="mt-2 flex items-center gap-3 md:mt-0">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-mist">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search candidates..."
                  className="h-10 w-full rounded-full bg-carbon-raise pl-10 pr-4 text-sm text-pearl outline-none transition-all placeholder:text-mist/70 focus:ring-2 focus:ring-neon/50 md:w-64"
                />
              </div>
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className="flex h-10 items-center gap-2 rounded-full bg-carbon-raise px-4 text-sm font-semibold tracking-[0.05em] text-pearl shadow-sm transition-colors hover:bg-carbon-raise/70"
                >
                  <SlidersHorizontal className="h-[18px] w-[18px]" />
                  Filter
                </button>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-carbon-line bg-white py-1 shadow-xl"
                  >
                    {(
                      [
                        { key: "all", label: "All" },
                        { key: "completed", label: "Completed" },
                        { key: "in_progress", label: "In progress" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.key);
                          setFilterOpen(false);
                        }}
                        className={cn(
                          "block w-full px-4 py-2.5 text-left text-sm transition-colors",
                          statusFilter === opt.key
                            ? "bg-carbon-raise font-semibold text-neon"
                            : "text-mist hover:bg-carbon-raise"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="flex h-10 items-center gap-2 rounded-full bg-neon px-4 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-neon/90 active:scale-[0.98]"
              >
                <Download className="h-[18px] w-[18px]" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-neon/5 blur-2xl transition-colors group-hover:bg-neon/10" />
              <div className="relative z-10 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Total Assessments
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-4xl font-bold text-pearl">
                    {metrics.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5b5f5c]/5 blur-2xl transition-colors group-hover:bg-[#5b5f5c]/10" />
              <div className="relative z-10 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Avg. Score
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-4xl font-bold text-pearl">
                    {metrics.avg ?? "—"}
                  </span>
                  <span className="text-sm text-mist">/100</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#ba1a1a]/5 blur-2xl transition-colors group-hover:bg-[#ba1a1a]/10" />
              <div className="relative z-10 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Pass Rate
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-4xl font-bold text-pearl">
                    {metrics.passRate === null ? "—" : `${metrics.passRate}%`}
                  </span>
                  <span className="text-xs text-mist">(score ≥ 70)</span>
                </div>
              </div>
            </div>

            <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-neon p-6 shadow-md transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent)]" />
              <div className="relative z-10">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/90">
                  AI Insights
                </span>
                <p className="line-clamp-2 text-sm leading-relaxed text-white/85">
                  {metrics.best
                    ? `Candidates score highest on ${metrics.best.label.toLowerCase()} (${metrics.best.value}/100) across ${metrics.completedCount} completed assessment${metrics.completedCount === 1 ? "" : "s"}.`
                    : "Complete assessments to unlock trend insights."}
                </p>
              </div>
              <div className="relative z-10 mt-4 flex justify-end">
                <a
                  href="#recent-evaluations"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                  aria-label="View evaluations"
                >
                  <ArrowRight className="h-[18px] w-[18px]" />
                </a>
              </div>
            </div>
          </div>

          <div
            id="recent-evaluations"
            className="mt-2 overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="relative z-10 flex items-center justify-between bg-carbon-raise/50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-carbon-raise text-mist">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-pearl">
                    Recent Evaluations
                  </h2>
                  <p className="text-sm text-mist">
                    Showing {filtered.length} of {rows.length} results
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-white/50 text-xs font-semibold uppercase tracking-wider text-mist">
                    <th className="px-6 py-4 font-medium">Candidate</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-pearl">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-t border-carbon-line">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-carbon-raise" />
                            <div className="h-4 w-32 animate-pulse rounded-full bg-carbon-raise" />
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 w-40 animate-pulse rounded-full bg-carbon-raise" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 w-24 animate-pulse rounded-full bg-carbon-raise" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 w-20 animate-pulse rounded-full bg-carbon-raise" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-6 w-28 animate-pulse rounded-full bg-carbon-raise" />
                        </td>
                        <td className="px-6 py-5" />
                      </tr>
                    ))
                  ) : error ? (
                    <tr className="border-t border-carbon-line">
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-mist">{error}</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr className="border-t border-carbon-line">
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-mist">No assessments found.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => {
                      const tier = row.report
                        ? VERDICT_TIERS[row.report.verdict] || VERDICT_TIERS.SOLID
                        : null;
                      return (
                        <tr
                          key={row.candidate.sessionId}
                          onClick={() => openRow(row)}
                          className="group cursor-pointer border-t border-carbon-line transition-colors duration-200 hover:bg-carbon-raise/40"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-carbon-raise shadow-sm">
                                {row.candidate.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={row.candidate.avatarUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center font-heading text-sm font-semibold text-mist">
                                    {initials(row.candidate.name)}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-pearl">
                                  {row.candidate.name}
                                </span>
                                <span className="text-xs text-mist">
                                  {row.candidate.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-mist">
                            {row.candidate.role}
                          </td>
                          <td className="px-6 py-5 text-mist">
                            {formatDate(row.report?.generatedAt)}
                          </td>
                          <td className="px-6 py-5">
                            {row.report ? (
                              <div className="flex items-center gap-3">
                                <span className="w-8 font-heading text-lg font-semibold text-pearl">
                                  {row.report.score}
                                </span>
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-carbon-raise">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${row.report.score}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={cn(
                                      "h-full rounded-full",
                                      scoreColor(row.report.score)
                                    )}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="font-body italic text-mist">
                                {row.state === "in_progress"
                                  ? "Evaluating..."
                                  : "Pending"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            {row.state === "in_progress" ? (
                              <span className="inline-flex items-center rounded-full border border-carbon-line bg-transparent px-2.5 py-1 text-xs font-semibold text-mist">
                                In Progress
                              </span>
                            ) : tier ? (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                  tier.classes
                                )}
                              >
                                {tier.label}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-carbon-raise px-2.5 py-1 text-xs font-semibold text-mist">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            {row.state === "in_progress" ? (
                              <span className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-mist transition-colors group-hover:text-neon">
                                Resume
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            ) : row.state === "completed" ? (
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-neon transition-colors hover:text-neon/80">
                                View report
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            ) : (
                              <span className="inline-flex cursor-not-allowed items-center gap-1 text-sm font-semibold text-mist opacity-50">
                                View report
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-carbon-raise to-transparent" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
