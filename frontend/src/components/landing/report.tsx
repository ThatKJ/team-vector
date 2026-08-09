"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { EASE, SectionHeading } from "./motion";

const BARS = [
  { label: "Technical Depth", value: 92 },
  { label: "Problem Solving", value: 88 },
  { label: "System Design", value: 84 },
  { label: "Communication", value: 81 },
  { label: "Fundamentals", value: 90 },
];

const ASSESSMENT = [
  "Strong understanding of distributed systems, with correct reasoning about leases, caching, and failure modes.",
  "Demonstrates sound reasoning under pressure — adapts claims when challenged.",
  "Needs deeper understanding of consistency models and their practical trade-offs.",
];

export function ReportSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  const R = 42;
  const CIRC = 2 * Math.PI * R;

  return (
    <section className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The outcome"
          title="A structured assessment. Not a guess."
          sub="When the interview ends, Intervu delivers an evidence-first report — every score traceable to a moment in the conversation."
        />

        <div ref={ref} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-2xl border border-carbon-line bg-carbon-card/70 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
                Interview complete
              </span>
              <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-mint">
                Strong hire
              </span>
            </div>

            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
              <div className="relative h-32 w-32 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r={R}
                    fill="none"
                    stroke="rgb(20 24 22 / 0.1)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={R}
                    fill="none"
                    stroke="rgb(0 109 53)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    initial={{ strokeDashoffset: CIRC }}
                    animate={{ strokeDashoffset: CIRC * (1 - 0.87) }}
                    transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-semibold text-pearl">87</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
                    / 100
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3.5">
                {BARS.map((bar, i) => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-xs text-mist sm:w-36">{bar.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                      <motion.div
                        className="h-full rounded-full bg-neon"
                        initial={{ width: "0%" }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: EASE }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-xs text-neon-soft">
                      {bar.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 border-t border-carbon-line pt-4 font-mono text-[9px] uppercase tracking-widest text-fog">
              Score is deterministic — computed from evaluated evidence, not vibes
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex-1 rounded-2xl border border-carbon-line bg-carbon-card/70 p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
                  AI assessment
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
                  Evidence-cited
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {ASSESSMENT.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={reduced ? false : { opacity: 0, x: 12 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.2, ease: EASE }}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-mist"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon" />
                    {line}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-neon/25 bg-neon/5 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-soft">
                Recommended level
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold text-pearl">
                Senior Backend Engineer
              </p>
              <p className="mt-1 text-xs text-fog">
                Based on demonstrated evidence across 8 competencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
