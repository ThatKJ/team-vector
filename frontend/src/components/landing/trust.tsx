"use client";

import {
  GitBranch,
  ListChecks,
  BrainCircuit,
  Layers,
  Fingerprint,
  FileCheck2,
} from "lucide-react";
import { Reveal, SectionHeading } from "./motion";

const CONCEPTS = [
  {
    icon: GitBranch,
    title: "Adaptive questioning",
    text: "Each question is generated from the candidate's last response.",
  },
  {
    icon: ListChecks,
    title: "Structured evaluation",
    text: "Consistent dimensions, deterministically scored across sessions.",
  },
  {
    icon: BrainCircuit,
    title: "Technical reasoning",
    text: "Evaluated on demonstrated evidence — not memorized phrasing.",
  },
  {
    icon: Layers,
    title: "Persistent interview context",
    text: "The full conversation shapes every subsequent decision.",
  },
  {
    icon: Fingerprint,
    title: "Candidate intelligence",
    text: "A live model of knowledge, confidence, and misconceptions.",
  },
  {
    icon: FileCheck2,
    title: "Evidence-based assessment",
    text: "Every claim in the report points back to the transcript.",
  },
];

export function TrustSection() {
  return (
    <section className="relative border-t border-carbon-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The technology"
          title="Built for technical interviews."
          sub="No fake hiring metrics. No magic. Intervu is a deterministic assessment engine with a single source of truth for every decision it makes."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((concept, i) => (
            <Reveal key={concept.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-carbon-line bg-carbon-card/50 p-6 transition-all duration-300 hover:border-black/20 hover:bg-carbon-card">
                <concept.icon className="h-5 w-5 text-neon-soft" />
                <h3 className="mt-4 text-sm font-semibold text-pearl">{concept.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">{concept.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-2xl border border-carbon-line bg-carbon-card/40 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
            <span>12 adaptive strategies</span>
            <span className="text-carbon-line">|</span>
            <span>evidence-cited reports</span>
            <span className="text-carbon-line">|</span>
            <span>no pre-scripted questions</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
