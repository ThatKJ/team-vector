"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE, SectionHeading } from "./motion";

const DIMENSIONS = [
  { label: "Technical Depth", value: 86 },
  { label: "Problem Solving", value: 91 },
  { label: "System Design", value: 74 },
  { label: "Communication", value: 88 },
  { label: "Fundamentals", value: 81 },
];

function CountUp({ to, active }: { to: number; active: boolean }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 900, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, active]);
  return <>{n}%</>;
}

const GRAPH_NODES = [
  { label: "Arrays", x: 16, y: 30 },
  { label: "Algorithms", x: 50, y: 8 },
  { label: "Complexity", x: 84, y: 28 },
  { label: "System Design", x: 50, y: 56 },
  { label: "Caching", x: 20, y: 82 },
  { label: "Distributed Systems", x: 80, y: 84 },
];

const GRAPH_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [3, 5],
];

export function IntelligenceSection() {
  const barsRef = useRef<HTMLDivElement>(null);
  const barsInView = useInView(barsRef, { once: true, amount: 0.35 });
  const graphRef = useRef<HTMLDivElement>(null);
  const graphInView = useInView(graphRef, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  return (
    <section className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Candidate intelligence"
          title="It understands how you think."
          sub="Intervu builds a live model of the candidate: what they know, how confidently they reason, and which concepts are still fragile."
        />

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div ref={barsRef} className="flex flex-col gap-6 rounded-2xl border border-carbon-line bg-carbon-card/60 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
                Live assessment state
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-mint">
                <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                Updating
              </span>
            </div>
            {DIMENSIONS.map((d, i) => (
              <div key={d.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-mist">{d.label}</span>
                  <span className="font-mono text-xs text-neon-soft">
                    {barsInView && <CountUp to={d.value} active={!reduced} />}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                  <motion.div
                    className="h-full rounded-full bg-neon"
                    initial={{ width: "0%" }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 1.1, delay: i * 0.12, ease: EASE }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="hidden rounded-2xl border border-carbon-line bg-carbon-card/60 p-6 md:block">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
                  Candidate knowledge graph
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
                  6 nodes · live
                </span>
              </div>
              <div ref={graphRef} className="relative aspect-[16/10] w-full">
                <svg
                  aria-hidden
                  viewBox="0 0 100 62.5"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  {GRAPH_EDGES.map(([a, b], i) => (
                    <motion.line
                      key={i}
                      x1={GRAPH_NODES[a].x}
                      y1={GRAPH_NODES[a].y}
                      x2={GRAPH_NODES[b].x}
                      y2={GRAPH_NODES[b].y}
                      stroke="rgb(0 109 53 / 0.35)"
                      strokeWidth="0.35"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
                    />
                  ))}
                </svg>
                {GRAPH_NODES.map((node, i) => (
                  <motion.div
                    key={node.label}
                    initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                    animate={
                      graphInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
                    }
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.18, ease: EASE }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <div className="flex items-center gap-1.5 rounded-full border border-carbon-line bg-carbon-raise px-2.5 py-1">
                      <span
                        className={
                          "h-1 w-1 rounded-full " +
                          (graphInView ? "bg-neon" : "bg-black/20")
                        }
                      />
                      <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-wider text-mist">
                        {node.label}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-carbon-line bg-carbon-card/60 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
                What the engine tracks
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-mist">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neon" /> Confidence per concept
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neon" /> Misconceptions and contradictions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neon" /> Demonstrated evidence, not claims
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neon" /> Uncertainty — and how it changes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
