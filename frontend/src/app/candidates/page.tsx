"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { apiClient } from "@/lib/api-client";
import { Candidate } from "@/lib/types";
import { ArrowRight, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "pending" | "in_progress" | "completed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Ready" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function curriculumProgress(candidate: Candidate): number | null {
  const missions = candidate.missions;
  if (!Array.isArray(missions) || missions.length === 0) return null;
  const passed = missions.filter((m) => m.status === "passed").length;
  return Math.round((passed / missions.length) * 100);
}

function StatusPill({ candidate }: { candidate: Candidate }) {
  if (candidate.status === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-neon/10 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-neon" />
        <span className="text-xs font-bold uppercase tracking-wider text-neon-soft">
          Completed
        </span>
      </span>
    );
  }
  if (candidate.status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-carbon-raise px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-fog" />
        <span className="text-xs font-bold uppercase tracking-wider text-mist">
          In Progress
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-neon/10 px-3 py-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
      </span>
      <span className="text-xs font-bold uppercase tracking-wider text-neon-soft">
        Ready
      </span>
    </span>
  );
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getCandidates()
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("candidates load failed", e);
        setError(e.message || "Failed to load candidates");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      );
    });
  }, [candidates, filter, search]);

  const selected = candidates.find((c) => c.id === selectedId) || null;

  const handleContinue = () => {
    if (!selected) return;
    if (selected.status === "completed" && selected.sessionId) {
      router.push(`/report/${selected.sessionId}`);
    } else if (selected.status === "in_progress" && selected.sessionId) {
      router.push(`/interview/${selected.sessionId}?candidateId=${selected.id}`);
    } else {
      router.push(`/setup?candidateId=${selected.id}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-36">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pt-10 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[32px] font-semibold leading-10 tracking-tight text-pearl">
              Choose a candidate
            </h1>
            <p className="text-lg text-mist">
              Select a candidate to configure their technical assessment.
            </p>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-[400px]">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates..."
                className="h-12 w-full rounded-full bg-carbon-raise pl-12 pr-4 text-base text-pearl placeholder:text-mist/50 shadow-none outline-none transition-shadow focus:ring-2 focus:ring-neon/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-full bg-carbon-raise p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold tracking-[0.05em] transition-all",
                    filter === f.key
                      ? "bg-white text-pearl shadow-sm"
                      : "text-mist hover:text-pearl"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full overflow-x-auto pb-2">
            <table className="w-full min-w-[820px] border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-carbon-raise/50">
                  <th className="w-[64px] rounded-l-xl py-4 pl-6 text-left text-sm font-semibold tracking-[0.05em] text-mist" />
                  <th className="px-4 py-4 text-left text-sm font-semibold tracking-[0.05em] text-mist">
                    Candidate
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold tracking-[0.05em] text-mist">
                    Role
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold tracking-[0.05em] text-mist">
                    Experience
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold tracking-[0.05em] text-mist">
                    Progress
                  </th>
                  <th className="rounded-r-xl px-6 py-4 text-left text-sm font-semibold tracking-[0.05em] text-mist">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="h-[88px]">
                      <td className="rounded-l-xl bg-white px-6 py-4">
                        <div className="h-6 w-6 animate-pulse rounded-full bg-carbon-raise" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-12 w-12 animate-pulse rounded-full bg-carbon-raise" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-32 animate-pulse rounded-full bg-carbon-raise" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-16 animate-pulse rounded-full bg-carbon-raise" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-40 animate-pulse rounded-full bg-carbon-raise" />
                      </td>
                      <td className="rounded-r-xl px-6 py-4">
                        <div className="h-6 w-24 animate-pulse rounded-full bg-carbon-raise" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="rounded-xl bg-white px-6 py-16 text-center">
                      <p className="text-mist">{error}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLoading(true);
                          setError(null);
                          apiClient.getCandidates().then((data) => {
                            setCandidates(data);
                            setLoading(false);
                          }).catch((e) => {
                            setError(e.message || "Failed to load candidates");
                            setLoading(false);
                          });
                        }}
                        className="mt-4 rounded-full bg-neon px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="rounded-xl bg-white px-6 py-16 text-center">
                      <p className="text-mist">No candidates found.</p>
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="mt-4 text-sm font-semibold text-neon hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((candidate) => {
                    const isSelected = candidate.id === selectedId;
                    const pct = curriculumProgress(candidate);
                    const barColor =
                      candidate.status === "in_progress"
                        ? "bg-fog"
                        : "bg-neon";
                    return (
                      <tr
                        key={candidate.id}
                        onClick={() => setSelectedId(candidate.id)}
                        className={cn(
                          "h-[88px] cursor-pointer transition-colors",
                          isSelected
                            ? "bg-carbon-raise"
                            : "bg-white hover:bg-carbon-raise/50"
                        )}
                      >
                        <td
                          className={cn(
                            "rounded-l-xl py-4 pl-6",
                            isSelected && "border-l-4 border-neon pl-5"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                              isSelected
                                ? "border-neon bg-neon"
                                : "border-carbon-line bg-white"
                            )}
                          >
                            <Check
                              className={cn(
                                "h-3.5 w-3.5 text-white transition-opacity",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            {candidate.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={candidate.avatarUrl}
                                alt=""
                                className="h-12 w-12 rounded-full bg-carbon-raise object-cover shadow-sm"
                              />
                            ) : (
                              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-carbon-raise font-heading text-lg font-semibold text-mist">
                                {candidate.name
                                  .split(" ")
                                  .map((p) => p[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            )}
                            <span className="font-heading text-lg font-semibold text-pearl">
                              {candidate.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-base text-mist">
                          {candidate.role}
                        </td>
                        <td className="px-4 py-4 font-mono text-sm text-mist">
                          {candidate.experience}
                        </td>
                        <td className="w-[200px] px-4 py-4">
                          <div className="flex w-full flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold tracking-[0.05em] text-mist">
                                Curriculum
                              </span>
                              <span
                                className={cn(
                                  "font-mono text-xs",
                                  candidate.status === "in_progress"
                                    ? "text-fog"
                                    : "text-neon"
                                )}
                              >
                                {pct === null ? "—" : `${pct}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-carbon-raise">
                              {pct !== null && (
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className={cn("h-full rounded-full", barColor)}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="rounded-r-xl px-6 py-4">
                          <StatusPill candidate={candidate} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-carbon-line bg-carbon/90 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={false}
            animate={{ opacity: selected ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4"
          >
            <span className="font-heading text-lg text-pearl">
              <span className="font-bold">{selected?.name ?? ""}</span>{" "}
              {selected ? "selected" : ""}
            </span>
          </motion.div>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className="ml-auto flex items-center gap-2 rounded-full bg-neon px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-neon/90 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Continue to assessment
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
