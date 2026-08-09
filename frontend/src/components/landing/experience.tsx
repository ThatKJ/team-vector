"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { BrainCircuit, GitBranch, Radar, Timer } from "lucide-react";
import { EASE, Reveal, SectionHeading } from "./motion";

const STEPS = [
  {
    who: "Interviewer",
    text: "Explain how you would handle a distributed lock without losing writes under node failure.",
  },
  {
    who: "Candidate",
    text: "I'd use a lease-based lock — acquire it, and renew it before expiry. If the node dies, the lease expires and another worker can take over…",
    kind: "muted",
  },
  {
    who: "Engine",
    text: "Evaluating → strong depth, lease semantics correct. Uncertainty: low. Probing application.",
    kind: "engine",
  },
  {
    who: "Interviewer",
    text: "Your lease prevents stale locks. Now — how does your design behave when a client stalls mid-transaction?",
  },
];

const POINTS = [
  { icon: BrainCircuit, title: "Reads your reasoning", text: "Not keywords — the structure of your argument." },
  { icon: GitBranch, title: "Follows what's interesting", text: "A good answer is explored. A suspicious one is challenged." },
  { icon: Radar, title: "Tracks uncertainty", text: "Confident gaps and honest uncertainty are treated differently." },
  { icon: Timer, title: "Calibrates in real time", text: "Difficulty moves with every response, not after a script." },
];

export function ExperienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  return (
    <section className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div ref={ref} className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-carbon-line bg-carbon-card/70">
              <div className="flex items-center justify-between border-b border-carbon-line px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                  Live session · turn 6/8
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-mint">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                  Active
                </span>
              </div>
              <div className="flex min-h-[300px] flex-col gap-4 p-5">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={reduced ? false : { opacity: 0, y: 14 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, delay: i * 0.7, ease: EASE }}
                    className="flex items-start gap-3"
                  >
                    <span
                      className={
                        "mt-0.5 shrink-0 rounded-md px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest " +
                        (step.kind === "engine"
                          ? "bg-neon/15 text-neon-soft"
                          : step.kind === "muted"
                            ? "bg-pearl/10 text-pearl"
                            : "bg-pearl/10 text-mist")
                      }
                    >
                      {step.who}
                    </span>
                    <p
                      className={
                        "text-[13px] leading-relaxed " +
                        (step.kind === "muted" ? "text-mist" : step.kind === "engine" ? "text-neon-soft" : "text-pearl")
                      }
                    >
                      {step.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="The experience"
              title="From answer to insight in milliseconds."
              sub="Every exchange runs through the same loop: understand, evaluate, adapt. The candidate just talks — the system does the rest."
            />
            <div className="flex flex-col gap-5">
              {POINTS.map((point, i) => (
                <Reveal key={point.title} delay={i * 0.08} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-carbon-line bg-carbon-card text-neon-soft">
                    <point.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-pearl">{point.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-mist">{point.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
