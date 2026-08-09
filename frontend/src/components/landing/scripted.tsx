"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { EASE, SectionHeading } from "./motion";

const TRADITIONAL = ["Question", "Answer", "Question", "Answer", "Question"];

const ADAPTIVE = [
  { step: "Question", note: "opens the assessment" },
  { step: "Understand", note: "reads your reasoning" },
  { step: "Evaluate", note: "measures depth & evidence" },
  { step: "Adapt", note: "chooses the next move" },
  { step: "Probe", note: "follows what's interesting" },
  { step: "Reassess", note: "updates its model of you" },
  { step: "Next question", note: "built from what you said" },
];

export function ScriptedSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();

  return (
    <section id="scripted" className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The difference"
          title={
            <>
              Most interviews follow a script.
              <br />
              <span className="text-neon-soft">Intervu follows you.</span>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4 rounded-2xl border border-carbon-line bg-carbon-card/50 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
                Traditional
              </span>
              <span className="rounded-full border border-carbon-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-fog">
                Scripted
              </span>
            </div>
            <div className="flex flex-col">
              {TRADITIONAL.map((step, i) => (
                <div key={`${step}-${i}`} className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-fog">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-mist">{step}</span>
                  </div>
                  {i < TRADITIONAL.length - 1 && (
                    <div className="ml-[7px] h-6 w-px bg-black/10" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-fog">
              Same questions. Same order. Every candidate.
            </p>
          </div>

          <div
            ref={ref}
            className="relative flex flex-col gap-0 rounded-2xl border border-neon/25 bg-neon/5 p-6 md:p-8"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-soft">
                Intervu
              </span>
              <span className="rounded-full border border-neon/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-soft">
                Adaptive loop
              </span>
            </div>
            <div className="relative mt-4 flex flex-col">
              <div
                aria-hidden
                className="absolute bottom-2 left-[7px] top-2 w-px bg-neon/20"
              />
              <motion.div
                aria-hidden
                className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-neon"
                initial={{ scaleY: 0 }}
                animate={inView && !reduced ? { scaleY: 1 } : { scaleY: 1 }}
                transition={{ duration: 2.2, ease: EASE }}
              />
              {ADAPTIVE.map((step, i) => {
                const active = inView;
                return (
                  <motion.div
                    key={step.step}
                    initial={reduced ? false : { opacity: 0.25, x: -6 }}
                    animate={
                      active ? { opacity: 1, x: 0 } : { opacity: 0.25, x: -6 }
                    }
                    transition={{ duration: 0.45, delay: i * 0.28, ease: EASE }}
                    className="relative flex items-center gap-3 py-1.5"
                  >
                    <span className="relative z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_rgb(0_109_53/0.9)]" />
                    </span>
                    <span className="text-sm font-semibold text-pearl">{step.step}</span>
                    <span className="hidden font-mono text-[10px] uppercase tracking-wider text-fog sm:inline">
                      {step.note}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-neon-soft/70">
              Every path is different. No two interviews are the same.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
