"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Candidate, InterviewTurn } from "@/lib/types";
import { ArrowRight, Bot, Check, Loader2, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { cn } from "@/lib/utils";

type TranscriptMessage =
  | { type: "interviewer"; turn: InterviewTurn }
  | { type: "candidate"; text: string };

type Phase = "generating" | "ready" | "evaluating" | "error" | "finalizing";

function formatElapsed(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

type EngineError = { message?: string; code?: string };

const AI_UNAVAILABLE_MESSAGE =
  "The AI interviewer is temporarily busy. Your progress has been saved. You can resume shortly.";

function isRateLimited(err: unknown): boolean {
  const e = (typeof err === "object" && err !== null ? err : {}) as EngineError;
  return (!!e.message && e.message.includes("rate limited")) || e.code === "LLM_RATE_LIMITED";
}

function isAiUnavailable(err: unknown): boolean {
  const e = (typeof err === "object" && err !== null ? err : {}) as EngineError;
  return e.code === "AI_UNAVAILABLE";
}

function errorMessage(err: unknown, fallback: string): string {
  const e = (typeof err === "object" && err !== null ? err : {}) as EngineError;
  return e.message || fallback;
}

function AnimatedDots({ className }: { className?: string }) {
  return (
    <span className="flex gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-1.5 animate-bounce rounded-full", className)}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function InterviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const candidateId = searchParams.get("candidateId");
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [answerInput, setAnswerInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "initializing" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const initCalledRef = useRef(false);
  const startedAtRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lastMessage = transcript[transcript.length - 1];
  const currentTurn =
    lastMessage && lastMessage.type === "interviewer" ? lastMessage.turn : null;

  const interviewerTurns = transcript.filter(
    (m): m is Extract<TranscriptMessage, { type: "interviewer" }> => m.type === "interviewer"
  );
  const history = transcript.slice(0, -1);

  const phase: Phase =
    isComplete || isFinalizing
      ? "finalizing"
      : error || initStatus === "error"
        ? "error"
        : isProcessing
          ? "evaluating"
          : initStatus === "ready" && currentTurn
            ? "ready"
            : "generating";

  const runInit = useCallback(async () => {
    setInitStatus("initializing");
    setError(null);
    try {
      const res = await apiClient.startInterview(id, candidateId);
      if (res.started_at) startedAtRef.current = res.started_at;
      setTranscript([{ type: "interviewer", turn: res.first_turn }]);
      setInitStatus("ready");
    } catch (err: unknown) {
      if (isRateLimited(err)) {
        setError("The assessment engine is temporarily rate limited. Please wait a few seconds and try again.");
      } else if (isAiUnavailable(err)) {
        setError(AI_UNAVAILABLE_MESSAGE);
      } else {
        setError(errorMessage(err, "Unable to connect to the interview engine."));
      }
      setInitStatus("error");
    }
  }, [id, candidateId]);

  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    runInit();
  }, [runInit]);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    apiClient
      .getCandidates()
      .then((data) => {
        if (cancelled) return;
        setCandidate(data.find((c) => c.id === candidateId) || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  useEffect(() => {
    if (initStatus !== "ready" || isComplete) return;
    if (startedAtRef.current) {
      const start = new Date(startedAtRef.current).getTime();
      const base = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setElapsed(base);
    }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [initStatus, isComplete]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTurn?.turn_id]);

  useEffect(() => {
    if (phase === "ready" && !isProcessing) {
      textareaRef.current?.focus();
    }
  }, [phase, isProcessing]);

  const handleSubmit = async () => {
    const text = answerInput.trim();
    if (!text || !currentTurn || isProcessing) return;

    setAnswerInput("");
    setIsProcessing(true);
    let completed = false;

    try {
      const res = await apiClient.submitAnswer(id, {
        turn_id: currentTurn.turn_id,
        answer: text,
      });

      setTranscript((prev) => [
        ...prev,
        { type: "candidate", text },
        ...(res.next_turn ? [{ type: "interviewer" as const, turn: res.next_turn }] : []),
      ]);

      if (res.is_complete) {
        completed = true;
        setIsComplete(true);
        setIsFinalizing(true);
        try {
          await apiClient.finalizeInterview(id);
          router.push(`/report/${id}`);
        } catch (finalizeErr: unknown) {
          if (isRateLimited(finalizeErr)) {
            setError("The assessment engine is temporarily rate limited. Please wait a few seconds and try again.");
          } else if (isAiUnavailable(finalizeErr)) {
            setError(AI_UNAVAILABLE_MESSAGE);
          } else {
            setError("Failed to finalize assessment.");
          }
          setIsFinalizing(false);
          setIsComplete(false);
        }
      }
    } catch (err: unknown) {
      setAnswerInput(text);
      if (isRateLimited(err)) {
        setError("The assessment engine is temporarily rate limited. Please wait a few seconds and try again.");
      } else if (isAiUnavailable(err)) {
        setError(AI_UNAVAILABLE_MESSAGE);
      } else {
        setError(errorMessage(err, "Unable to continue the interview."));
      }
    } finally {
      if (!completed && !isComplete) {
        setIsProcessing(false);
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    if (answerInput.trim() && currentTurn) {
      handleSubmit();
    } else {
      initCalledRef.current = false;
      runInit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  if (isComplete) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-carbon">
        <Loader2 className="mb-6 h-8 w-8 animate-spin text-neon" />
        <div className="mb-4 font-heading text-xl font-bold uppercase tracking-widest text-pearl">
          Assessment Complete
        </div>
        <div className="mt-2 text-sm text-mist">Compiling your assessment report...</div>
      </div>
    );
  }

  const decision = currentTurn?.telemetry?.decision;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-carbon">
      <Navbar />

      {/* Session bar — slim */}
      <div className="z-10 border-b border-carbon-line bg-carbon/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-carbon-raise shadow-sm">
              {candidate?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidate.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-heading text-xs font-semibold text-mist">
                  {(candidate?.name || "Candidate").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-carbon bg-neon" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-base font-semibold leading-tight text-pearl">
                {candidate?.name || "Candidate"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 animate-pulse rounded-full bg-neon" />
                <span className="text-xs font-semibold tracking-[0.05em] text-mist">
                  Interview in progress
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-fog">
                  Question {currentTurn?.turn_number || 1} · Adaptive
                </span>
                <span className="max-w-[240px] truncate text-sm font-medium text-pearl">
                  {currentTurn?.topic || "—"}
                </span>
              </div>
              <div className="h-7 w-px bg-carbon-line" />
              <div className="flex items-center gap-2 rounded-full bg-carbon-raise px-3.5 py-1.5 shadow-sm">
                <Timer className="h-3.5 w-3.5 text-fog" />
                <span className="font-heading text-sm tabular-nums text-pearl">
                  {formatElapsed(elapsed)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <span className="max-w-[140px] truncate rounded-full bg-carbon-raise px-3 py-1 text-xs font-medium text-pearl">
                Q{currentTurn?.turn_number || 1} · {currentTurn?.topic || "…"}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-carbon-raise px-3 py-1 text-xs tabular-nums text-pearl">
                <Timer className="h-3 w-3 text-fog" />
                {formatElapsed(elapsed)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* Timeline sidebar — desktop only */}
        <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-carbon-line px-5 py-6 lg:block">
          {decision && (
            <div className="mb-8">
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-fog">
                Evaluation Focus
              </h3>
              <div className="rounded-xl border border-carbon-line bg-white p-4 shadow-sm">
                <div className="mb-1.5 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-neon" />
                  <h4 className="font-heading text-sm font-semibold text-pearl">
                    {decision.targetCompetency}
                  </h4>
                </div>
                <p className="text-xs leading-relaxed text-mist">{decision.rationale}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-fog">
              Interview Timeline
            </h3>
            <div className="relative flex flex-col">
              <div className="absolute bottom-3 left-[11px] top-3 z-0 w-0.5 bg-carbon-line" />
              {interviewerTurns.map((m, i, arr) => {
                const isCurrent = i === arr.length - 1;
                return (
                  <div key={m.turn.turn_id} className="relative z-10 flex items-start gap-3 py-2.5">
                    {isCurrent ? (
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon shadow-md shadow-neon/20 ring-4 ring-neon/10">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      </span>
                    ) : (
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-carbon-line bg-white shadow-sm">
                        <Check className="h-3 w-3 text-neon" />
                      </span>
                    )}
                    <div className={cn("min-w-0", isCurrent ? "" : "opacity-50")}>
                      <span
                        className={cn(
                          "block text-xs font-semibold",
                          isCurrent ? "text-neon" : "text-mist"
                        )}
                      >
                        Q{String(m.turn.turn_number || i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-xs text-mist">
                        {m.turn.topic || "General"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {phase !== "finalizing" && (
                <div className="relative z-10 flex items-start gap-3 py-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-carbon-line bg-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-carbon-line" />
                  </span>
                  <div>
                    <span className="block text-xs font-semibold text-fog">
                      {phase === "evaluating" ? "Analyzing…" : "Next question"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main interview content */}
        <main ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
            {/* Interviewer card — always in a meaningful state */}
            <motion.div
              layout
              className="overflow-hidden rounded-2xl border border-carbon-line bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-carbon-line px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      phase === "error" ? "bg-red-400" : "animate-pulse bg-neon"
                    )}
                  />
                  <span className="text-xs font-semibold uppercase tracking-widest text-pearl">
                    Interviewer
                  </span>
                </div>
                {currentTurn && phase === "ready" && (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-carbon-raise px-2.5 py-1 text-[11px] font-semibold text-mist">
                      Q{currentTurn.turn_number}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-fog">
                      Adaptive interview
                    </span>
                  </div>
                )}
              </div>

              <div
                className="px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
                aria-live="polite"
                aria-busy={phase === "generating" || phase === "evaluating"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {phase === "ready" && currentTurn && (
                    <motion.div
                      key={`q-${currentTurn.turn_id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      {currentTurn.topic && (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-neon">
                            {currentTurn.topic}
                          </span>
                          <div className="h-px flex-1 bg-carbon-line" />
                        </div>
                      )}
                      <h1 className="font-heading text-2xl font-semibold leading-snug text-pearl lg:text-[27px] lg:leading-snug">
                        {currentTurn.question}
                      </h1>
                    </motion.div>
                  )}

                  {(phase === "generating" || phase === "evaluating") && (
                    <motion.div
                      key="busy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {isProcessing && (
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-fog">
                          Response received
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <AnimatedDots className="bg-neon" />
                        <p className="text-base text-mist">
                          {isProcessing
                            ? "Analyzing your response and preparing the next question…"
                            : "Preparing your first question…"}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {phase === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-base font-medium text-pearl">
                        We couldn&apos;t generate the next question.
                      </p>
                      <p className="mt-1 text-sm text-mist">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="mt-5 flex items-center gap-2 rounded-xl bg-neon px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-neon/20 transition-all hover:-translate-y-0.5 hover:bg-neon/90 active:translate-y-0 active:scale-[0.98]"
                      >
                        <Loader2 className="h-4 w-4" />
                        Try again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Response composer — in flow, directly below the question */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-carbon-line bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-neon/40">
              <div className="flex items-center justify-between border-b border-carbon-line bg-carbon-raise px-5 py-2.5">
                <span className="text-xs font-semibold tracking-[0.05em] text-mist">
                  Your Response
                </span>
                <span className="hidden text-[11px] text-fog sm:block">
                  Markdown supported · ⌘/Ctrl + Enter to submit
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="min-h-[120px] w-full resize-none bg-transparent p-5 text-base leading-relaxed text-pearl outline-none placeholder:text-fog disabled:opacity-40 sm:p-6"
                placeholder="Explain your reasoning…"
                aria-label="Your answer"
                value={answerInput}
                onChange={(e) => {
                  setAnswerInput(e.target.value);
                  resizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                disabled={isProcessing || phase === "generating"}
              />
              <div className="flex items-center justify-between border-t border-carbon-line bg-white px-5 py-3">
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <>
                      <AnimatedDots className="bg-neon" />
                      <span className="text-sm font-semibold text-neon">
                        Analyzing…
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !answerInput.trim() || phase === "generating"}
                  aria-label="Submit answer"
                  className="flex items-center gap-2 rounded-xl bg-neon px-8 py-3 text-sm font-semibold text-white shadow-md shadow-neon/20 transition-all hover:-translate-y-0.5 hover:bg-neon/90 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Submit answer
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Previous questions */}
            {history.length > 0 && (
              <section className="mt-12" aria-label="Previous questions">
                <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-fog">
                  Previous Questions
                </h3>
                <div className="flex flex-col gap-4">
                  {history.map((message, index) =>
                    message.type === "interviewer" ? (
                      <div
                        key={message.turn.turn_id}
                        className="rounded-xl border border-carbon-line bg-white/70 p-4 opacity-70 shadow-sm"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-neon">
                            Q{String(message.turn.turn_number || index + 1).padStart(2, "0")}
                          </span>
                          {message.turn.topic && (
                            <span className="text-[11px] text-fog">· {message.turn.topic}</span>
                          )}
                        </div>
                        <p className="text-[15px] leading-relaxed text-pearl">
                          {message.turn.question}
                        </p>
                      </div>
                    ) : (
                      <div
                        key={`a-${index}`}
                        className="ml-6 rounded-xl border border-carbon-line bg-carbon-raise p-4 opacity-70 shadow-sm"
                      >
                        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-mist">
                          You
                        </div>
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-pearl">
                          {message.text}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
