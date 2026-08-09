"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, SectionHeading } from "./motion";

type Choice = "know" | "unsure" | "explain";

type Outcome = {
  verdict: string;
  line: string;
  difficulty: number;
  followUp: string;
};

const OUTCOMES: Record<Choice, Outcome> = {
  know: {
    verdict: "Understanding detected.",
    line: "Strong signal. Raising the ceiling.",
    difficulty: 5,
    followUp:
      "How would you mitigate a hash-flooding attack that forces worst-case collision behavior?",
  },
  unsure: {
    verdict: "Uncertainty detected.",
    line: "Rebuilding the foundation first.",
    difficulty: 2,
    followUp: "Let's start smaller — what does a hash function actually do?",
  },
  explain: {
    verdict: "Partial understanding.",
    line: "Probing your reasoning on this one.",
    difficulty: 4,
    followUp: "Walk me through open addressing versus chaining — and when you'd pick each.",  },
};

const Q1 = "What happens when you increase the size of a hash table?";

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <motion.span
          key={n}
          className={cn("h-1.5 w-1.5 rounded-full", n <= level ? "bg-neon" : "bg-black/15")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + n * 0.06 }}
        />
      ))}
    </div>
  );
}

export function DemoSection() {
  const [answer, setAnswer] = useState<Choice | null>(null);

  const outcome = answer ? OUTCOMES[answer] : null;

  const restart = () => setAnswer(null);

  return (
    <section id="try" className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Try it"
          title="Answer honestly. Watch it adapt."
          sub="This is a real slice of the adaptive loop. Pick how you'd respond — the engine's next move depends on your choice."
        />

        <div className="overflow-hidden rounded-2xl border border-carbon-line bg-carbon-card/70">
          <div className="flex items-center justify-between border-b border-carbon-line px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
              Intervu / try-demo
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
              Question {answer ? 2 : 1} of 2
            </span>
          </div>

          <div className="min-h-[320px] p-6 md:p-8">
            <div className="mb-5 flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded-md bg-neon/15 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-neon-soft">
                Interviewer
              </span>
              <p className="text-sm leading-relaxed text-pearl">
                {answer ? outcome?.followUp : Q1}
              </p>
            </div>

            {!answer && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {(
                  [
                    ["know", "I know this"],
                    ["unsure", "Not sure"],
                    ["explain", "Explain"],
                  ] as [Choice, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAnswer(key)}
                    className="h-11 flex-1 rounded-[8px] border border-carbon-line bg-carbon-raise px-4 text-sm font-semibold text-pearl transition-all duration-200 hover:scale-[1.02] hover:border-neon/40 hover:bg-carbon-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence>
              {answer && outcome && (
                <motion.div
                  key={answer}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mt-6"
                >
                  <div className="rounded-xl border border-neon/25 bg-neon/5 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-soft">
                      Intervu adaptation
                    </p>
                    <p className="mt-2 text-sm font-semibold text-pearl">{outcome.verdict}</p>
                    <p className="mt-0.5 text-xs text-mist">{outcome.line}</p>
                    <div className="mt-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-fog">
                          Next question difficulty
                        </span>
                        <span className="font-mono text-[11px] text-neon-soft">
                          L{outcome.difficulty} / 7
                        </span>
                      </div>
                      <DifficultyDots level={outcome.difficulty} />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col items-start gap-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-fog">
                      The engine’s follow-up is already different from everyone else’s.
                    </p>
                    <button
                      type="button"
                      onClick={restart}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-mist transition-colors hover:text-pearl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Try another answer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!answer && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 font-mono text-[9px] uppercase tracking-widest text-fog"
                >
                  Three answers. Three different next questions.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/candidates"
            className="group inline-flex h-11 items-center gap-2 rounded-[8px] border border-carbon-line bg-carbon-card/60 px-6 text-sm font-semibold text-pearl transition-all duration-200 hover:scale-[1.02] hover:border-neon/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          >
            Try the real interview
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
