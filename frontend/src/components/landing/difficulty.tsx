"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { SectionHeading } from "./motion";

const LEVELS = 8;

const ZONES = [
  { label: "Foundation", start: 1, end: 2 },
  { label: "Intermediate", start: 3, end: 5 },
  { label: "Advanced", start: 6, end: 7 },
  { label: "Expert", start: 8, end: 8 },
];

function Lane({
  label,
  path,
  tone,
  reduced,
}: {
  label: string;
  path: number[];
  tone: "up" | "down";
  reduced: boolean;
}) {
  const pct = (level: number) => `${((level - 1) / (LEVELS - 1)) * 100}%`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
          {label}
        </span>
        <span
          className={
            "flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest " +
            (tone === "up" ? "text-mint" : "text-neon-soft")
          }
        >
          {tone === "up" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {path.join(" → ")}
        </span>
      </div>

      <div className="relative h-8 rounded-lg border border-carbon-line bg-carbon-card/50">
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/15" />
        {Array.from({ length: LEVELS }).map((_, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25"
            style={{ left: pct(i + 1) }}
          />
        ))}
        <motion.div
          className="absolute inset-y-0 flex items-center"
          style={{ left: pct(path[0]) }}
          animate={
            reduced
              ? { left: pct(path[path.length - 1]) }
              : {
                  left: path.map(pct),
                }
          }
          transition={{
            duration: 4.2,
            times: path.map((_, i) => i / (path.length - 1)),
            repeat: reduced ? 0 : Infinity,
            repeatDelay: 0.8,
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          <span
            className={
              "h-2.5 w-2.5 rounded-full shadow-[0_0_12px_rgb(0_109_53/0.8)] " +
              (tone === "up" ? "bg-mint" : "bg-neon")
            }
          />
        </motion.div>
      </div>
    </div>
  );
}

export function DifficultySection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Calibration"
          title="Never too easy. Never unfairly hard."
          sub="Intervu continuously calibrates the interview to the candidate's demonstrated ability — raising the bar after strong answers, and rebuilding foundations when needed."
        />

        <div className="flex flex-col gap-10">
          <Lane label="Strong answer" path={[4, 5, 7]} tone="up" reduced={!!reduced} />
          <Lane label="Struggling answer" path={[7, 6, 5]} tone="down" reduced={!!reduced} />

          <div className="grid grid-cols-4 gap-2">
            {ZONES.map((zone) => (
              <div
                key={zone.label}
                className="rounded-lg border border-carbon-line bg-carbon-card/40 px-3 py-2.5 text-center"
              >
                <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
                  L{zone.start}
                  {zone.end !== zone.start ? `–${zone.end}` : ""}
                </span>
                <p className="mt-0.5 text-xs font-semibold text-pearl">{zone.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
