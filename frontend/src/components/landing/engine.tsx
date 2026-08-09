"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./motion";

type Branch = {
  condition: string;
  signal: string;
  action: string;
  actionNote: string;
};

const BRANCHES: Branch[] = [
  {
    condition: "Strong depth",
    signal: "evidence of mastery",
    action: "Increase difficulty",
    actionNote: "harder variant, same concept family",
  },
  {
    condition: "Partial understanding",
    signal: "gaps worth probing",
    action: "Probe deeper",
    actionNote: "targeted follow-up on the weak spot",
  },
  {
    condition: "Weak",
    signal: "fragile fundamentals",
    action: "Rebuild fundamentals",
    actionNote: "simpler scoped question first",
  },
];

export function EngineSection() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setActive((v) => (v + 1) % BRANCHES.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <section id="engine" className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The engine"
          title="Every answer changes what comes next."
          sub="One response branches into a decision. The engine reads the evidence, picks a strategy, and aims the next question at the gap it found."
        />

        <div className="flex flex-col items-center">
          <motion.div
            initial={false}
            className="rounded-xl border border-carbon-line bg-carbon-card px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist"
          >
            Candidate answer
          </motion.div>
          <div aria-hidden className="h-8 w-px bg-black/15" />

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {BRANCHES.map((branch, i) => {
              const isActive = i === active;
              return (
                <div key={branch.condition} className="flex flex-col items-center">
                  <div className="relative flex h-10 w-px items-center justify-center">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isActive ? "bg-neon" : "bg-black/20"
                      )}
                    />
                    {isActive && !reduced && (
                      <motion.span
                        className="absolute top-1/2 h-1.5 w-1.5 rounded-full bg-neon"
                        animate={{ y: [-18, 18] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={cn(
                      "w-full rounded-2xl border p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon",
                      isActive
                        ? "border-neon/50 bg-neon/10 shadow-[0_0_40px_rgb(0_109_53/0.15)]"
                        : "border-carbon-line bg-carbon-card/60 hover:border-black/25"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-pearl" : "text-mist"
                      )}
                    >
                      {branch.condition}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fog">
                      {branch.signal}
                    </p>
                  </button>
                  <div className="relative flex h-10 w-px items-center justify-center">
                    {isActive && !reduced && (
                      <motion.span
                        className="absolute top-0 h-1.5 w-1.5 rounded-full bg-neon"
                        animate={{ y: [0, 32] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-2xl border p-5 transition-all duration-300",
                      isActive
                        ? "border-neon/40 bg-carbon-raise"
                        : "border-carbon-line bg-carbon-card/40"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-neon-soft" : "text-fog"
                      )}
                    >
                      {branch.action}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-fog">
                      {branch.actionNote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div aria-hidden className="h-8 w-px bg-black/15" />
          <motion.div
            initial={false}
            animate={
              !reduced
                ? { scale: [1, 1.02, 1], opacity: [0.7, 1, 0.7] }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-xl border border-neon/40 bg-neon/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neon-soft"
          >
            Next question
          </motion.div>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-fog">
          Strategies: baseline · probe depth · probe reasoning · challenge assumption · remediate …
        </p>
      </div>
    </section>
  );
}
