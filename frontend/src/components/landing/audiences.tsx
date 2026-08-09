"use client";

import Link from "next/link";
import {
  ArrowRight,
  Gauge,
  MessageSquareText,
  Scale,
  Activity,
  ShieldCheck,
  FileSearch,
  Quote,
} from "lucide-react";
import { Reveal, SectionHeading } from "./motion";

const CANDIDATE_POINTS = [
  {
    icon: MessageSquareText,
    title: "Adaptive questioning",
    text: "The next question depends on your last answer — never a fixed list.",
  },
  {
    icon: Gauge,
    title: "Personalized difficulty",
    text: "Prove yourself and the bar rises. No filler questions at your level.",
  },
  {
    icon: Activity,
    title: "Technical reasoning",
    text: "You are scored on how you think through problems, not memorized answers.",
  },
  {
    icon: Scale,
    title: "Fair evaluation",
    text: "Everyone is measured by the same evidence standard — the questions differ.",
  },
];

const TEAM_POINTS = [
  {
    icon: FileSearch,
    title: "Evidence, not impressions",
    text: "Every strength and gap is cited to a specific moment in the transcript.",
  },
  {
    icon: ShieldCheck,
    title: "Structured, comparable scores",
    text: "Deterministic scoring across dimensions — consistent across every candidate.",
  },
  {
    icon: Quote,
    title: "Reasoning quality signals",
    text: "Confidence, uncertainty, and contradiction patterns you can act on.",
  },
];

const STRENGTHS = ["Distributed systems", "Caching & CDNs", "Reasoning under pressure"];
const GAPS = ["Consistency models", "Async error handling"];

export function AudiencesSection() {
  return (
    <>
      <section id="candidates" className="relative border-t border-carbon-line py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                align="left"
                eyebrow="For candidates"
                title={
                  <>
                    Stop preparing for questions.
                    <br />
                    <span className="text-neon-soft">Start preparing to think.</span>
                  </>
                }
                sub="You won't be judged on whether you guessed a prepared answer. Intervu adapts to you — and evaluates the reasoning behind every response."
              />
              <div className="flex flex-col gap-6">
                {CANDIDATE_POINTS.map((point, i) => (
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
              <Reveal delay={0.2} className="mt-10">
                <Link
                  href="/candidates"
                  className="group inline-flex h-12 items-center gap-2 rounded-[8px] bg-pearl px-7 text-sm font-semibold text-carbon transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_32px_rgb(0_109_53/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                >
                  Practice with Intervu
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-carbon-line bg-carbon-card/70">
                <div className="flex items-center justify-between border-b border-carbon-line px-4 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                    Candidate view
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-mint">
                    3 of 8
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <div className="rounded-xl border border-carbon-line bg-carbon-raise p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-neon-soft">
                      Interviewer
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-pearl">
                      “You said you’d use a cache. When would caching actually make this
                      system worse?”
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-carbon-line bg-carbon-raise px-4 py-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
                      Responding
                    </span>
                    <span className="flex gap-1">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-mint" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-mint [animation-delay:120ms]" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-mint [animation-delay:240ms]" />
                    </span>
                  </div>
                  <div className="rounded-xl border border-carbon-line bg-carbon-raise p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-fog">
                      Engine
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-neon-soft">
                      detected: strong trade-off awareness
                      <br />
                      strategy: CHALLENGE_ASSUMPTION
                      <br />
                      difficulty: 5 → 6
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="teams" className="relative border-t border-carbon-line py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal delay={0.15} className="order-2 lg:order-1">
              <div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-carbon-line bg-carbon-card/70">
                <div className="flex items-center justify-between border-b border-carbon-line px-4 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                    Hiring review
                  </span>
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-mint">
                    Verdict: strong hire
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neon/15 font-heading text-base font-semibold text-neon-soft">
                      S
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-pearl">Samira R.</p>
                      <p className="font-mono text-[10px] text-fog">Backend · 92 technical</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-mint">
                      Strengths
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STRENGTHS.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-carbon-line bg-carbon-raise px-2.5 py-1 text-[11px] text-mist"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neon-soft">
                      Gaps
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {GAPS.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-neon/25 bg-neon/5 px-2.5 py-1 text-[11px] text-neon-soft"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-carbon-line bg-carbon-raise p-3">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-fog">
                      Citation
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-mist">
                      “T6: explained lease expiry trade-off — depth: strong”
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow="For teams"
                title="See beyond the resume."
                sub="Interviews become structured signals: competency breakdowns, reasoning quality, confidence indicators, and cited evidence — not gut feel."
              />
              <div className="flex flex-col gap-6">
                {TEAM_POINTS.map((point, i) => (
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
    </>
  );
}
