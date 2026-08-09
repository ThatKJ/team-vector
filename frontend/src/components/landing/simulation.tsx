"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "./motion";

type Metric = { label: string; value: number };
type Scenario = {
  question: string;
  answer: string;
  metrics: Metric[];
  chips: string[];
  followUp: string;
  strategy: string;
  from: number;
  to: number;
};

const SCENARIOS: Scenario[] = [
  {
    question:
      "How would you design a URL shortener that handles 10M requests per second?",
    answer:
      "I'd start with an in-memory cache in front of the database — Redis — to serve the hot URLs, then shard the database by hash of the short code…",
    metrics: [
      { label: "Conceptual depth", value: 86 },
      { label: "System thinking", value: 78 },
      { label: "Trade-off awareness", value: 64 },
    ],
    chips: ["caching", "distributed systems", "horizontal scaling"],
    followUp:
      "You mentioned caching. How would your architecture change if cache invalidation became the bottleneck?",
    strategy: "PROBE_DEPTH",
    from: 4,
    to: 5,
  },
  {
    question:
      "What happens when the load factor of a hash table grows too large?",
    answer:
      "Collisions increase, so lookups degrade toward O(n). The standard fix is to resize and rehash when the load factor crosses a threshold…",
    metrics: [
      { label: "Conceptual depth", value: 91 },
      { label: "System thinking", value: 82 },
      { label: "Trade-off awareness", value: 74 },
    ],
    chips: ["hash tables", "amortized analysis", "rehashing"],
    followUp:
      "Strong. How would you handle a hash-flooding attack that forces worst-case behavior?",
    strategy: "CHALLENGE_ASSUMPTION",
    from: 5,
    to: 7,
  },
];

function Typewriter({
  text,
  active,
  instant,
}: {
  text: string;
  active: boolean;
  instant: boolean;
}) {
  const [out, setOut] = useState(instant ? text : "");

  useEffect(() => {
    if (instant || !active) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 15);
    return () => window.clearInterval(id);
  }, [text, active, instant]);

  return <>{out}</>;
}

function Bar({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-mist">{label}</span>
        <span className="font-mono text-[11px] text-neon-soft">
          {active ? `${value}%` : "—"}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-black/10">
        <motion.div
          className="h-full rounded-full bg-neon"
          initial={{ width: "0%" }}
          animate={{ width: active ? `${value}%` : "0%" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        />
      </div>
    </div>
  );
}

function Chip({ label, show }: { label: string; show: boolean }) {
  return (
    <motion.span
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0.9,
      }}
      transition={{ duration: 0.4, ease: EASE }}
      className="rounded-full border border-carbon-line bg-carbon-raise px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-mist"
    >
      {label}
    </motion.span>
  );
}

type Phase = "question" | "answer" | "analyzing" | "adapting";

export function InterviewSimulation() {
  const reduced = useReducedMotion();
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>(() => (reduced ? "adapting" : "question"));

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const run = async () => {
      for (let pass = 0; ; pass++) {
        if (cancelled) return;
        const sc = SCENARIOS[pass % SCENARIOS.length];
        setScenarioIdx(pass % SCENARIOS.length);
        setPhase("question");
        await sleep(700 + sc.question.length * 15);
        setPhase("answer");
        await sleep(600 + sc.answer.length * 15);
        setPhase("analyzing");
        await sleep(2800);
        setPhase("adapting");
        await sleep(4600);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  const scenario = SCENARIOS[scenarioIdx];
  const analyzing = phase === "analyzing" || phase === "adapting";
  const adapting = phase === "adapting";

  return (
    <div
      aria-hidden
      className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-carbon-line bg-carbon-card/80 shadow-[0_0_80px_rgb(0_109_53/0.12)]"
    >
      <div className="flex items-center justify-between border-b border-carbon-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
            Intervu / Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-fog">SESSION 04281</span>
          <span className="flex items-center gap-1.5 rounded-full border border-carbon-line bg-carbon-raise px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-mint">
              Adaptive engine: active
            </span>
          </span>
        </div>
      </div>

      <div className="flex min-h-[430px] flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded-md bg-neon/15 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-neon-soft">
            Interviewer
          </span>
          <p className="text-[13px] leading-relaxed text-pearl">
            <Typewriter
              key={`q${scenarioIdx}`}
              text={scenario.question}
              active={phase === "question"}
              instant={!!reduced}
            />
            {phase === "question" && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-pulse bg-neon" />
            )}
          </p>
        </div>

        <AnimatePresence>
          {phase !== "question" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 shrink-0 rounded-md bg-pearl/10 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-pearl">
                Candidate
              </span>
              <p className="text-[13px] leading-relaxed text-mist">
                <Typewriter
                  key={`a${scenarioIdx}`}
                  text={scenario.answer}
                  active={phase === "answer"}
                  instant={!!reduced}
                />
                {phase === "answer" && (
                  <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-mist" />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="rounded-xl border border-carbon-line bg-carbon-raise p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                  Analyzing response
                </span>
                <span className="font-mono text-[9px] text-fog">TURN 3 / 8</span>
              </div>
              <div className="flex flex-col gap-3">
                {scenario.metrics.map((m) => (
                  <Bar key={m.label} label={m.label} value={m.value} active={analyzing} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="pt-1 font-mono text-[9px] uppercase tracking-widest text-fog">
                  Detected:
                </span>
                {scenario.chips.map((c) => (
                  <Chip key={c} label={c} show={analyzing} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {adapting && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="rounded-xl border border-neon/25 bg-neon/5 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-soft">
                  Adapting
                </span>
                <span className="rounded-full border border-neon/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon-soft">
                  {scenario.strategy}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-pearl">
                <Typewriter
                  key={`f${scenarioIdx}`}
                  text={scenario.followUp}
                  active
                  instant={!!reduced}
                />
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-mono text-[10px] text-fog">
                  Difficulty{" "}
                  <span className="text-mist line-through">{scenario.from}</span>
                </span>
                <TrendingUp className="h-3.5 w-3.5 text-neon" />
                <span className="font-mono text-[12px] font-semibold text-pearl">
                  {scenario.to}
                </span>
                <div className="ml-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        n <= scenario.to ? "bg-neon" : "bg-black/15"
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-carbon-line px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-fog">
        <span>Strategy: {scenario.strategy}</span>
        <span>{reduced ? "Paused" : "Simulated · not a live session"}</span>
      </div>
    </div>
  );
}
