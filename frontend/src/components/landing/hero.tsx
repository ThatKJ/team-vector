"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight, BarChart3, Bot, CheckCircle2, MicOff } from "lucide-react";
import { EASE, Reveal } from "./motion";

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glowX = useSpring(mx, { stiffness: 60, damping: 20 });
  const glowY = useSpring(my, { stiffness: 60, damping: 20 });

  return (
    <section
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left - rect.width / 2);
        my.set(e.clientY - rect.top - rect.height / 2);
      }}
      className="relative flex min-h-[90vh] items-center overflow-hidden pb-16 pt-36 lg:pb-20 lg:pt-44"
    >
      <div className="landing-grid absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="absolute -right-1/4 top-1/4 h-[800px] w-[800px] rounded-full bg-neon/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -left-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-neon/10 blur-[100px]"
      />
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/6 blur-[120px]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neon underline underline-offset-8 decoration-neon/60">
              AI-powered technical interviews
            </span>
          </Reveal>

          <div className="flex flex-col gap-2">
            <Reveal delay={0.08}>
              <h1 className="font-heading text-[clamp(2.6rem,5.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-pearl">
                Know how someone engineers.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="font-heading text-[clamp(2.2rem,4.6vw,3rem)] font-bold leading-[1.1] tracking-tight text-mist opacity-80">
                Not how well they interview.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.24}>
            <p className="max-w-xl text-lg leading-relaxed text-mist">
              Intervu conducts adaptive technical interviews based on what candidates
              actually learned, built, and struggled with.
            </p>
          </Reveal>

          <Reveal delay={0.32} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/candidates"
              className="group inline-flex h-14 items-center gap-2 rounded-full bg-neon px-8 py-4 text-base font-semibold text-white shadow-md shadow-neon/20 transition-all duration-200 hover:scale-[1.02] hover:bg-neon/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              Start an assessment
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-carbon-raise bg-white px-8 py-4 text-base font-semibold text-pearl transition-all duration-200 hover:scale-[1.02] hover:bg-carbon-raise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              See how it works
              <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
          </Reveal>

          <Reveal delay={0.4}>
            <ul className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-mist">
              {["Adaptive questions", "Evidence-based", "8+ questions"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-neon" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.25} y={36} amount={0.2} className="flex justify-center lg:justify-end">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[520px] pb-10 pr-4 sm:pr-10">
      <div className="relative z-10 flex flex-col gap-6 rounded-[24px] border border-carbon-line bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-carbon-raise">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/candidate-headshot.png"
                alt="Candidate avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold leading-tight text-pearl">
                Aarav Sharma
              </h3>
              <p className="text-sm text-mist">AI Engineer Assessment</p>
            </div>
          </div>
          <span className="rounded-full bg-neon/15 px-3 py-1 text-xs font-semibold text-neon-soft">
            04:12 elapsed
          </span>
        </div>

        <div className="flex gap-2" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.12, ease: EASE }}
              className={
                "h-1 flex-1 origin-left rounded-full " +
                (i < 3 ? "bg-neon" : i === 3 ? "animate-pulse bg-neon" : "bg-carbon-raise")
              }
            />
          ))}
        </div>

        <div className="relative rounded-[16px] bg-carbon-raise p-6">
          <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-neon shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-neon-soft">
            Current topic: Retrieval-Augmented Generation
          </p>
          <p className="font-heading text-xl leading-snug text-pearl">
            “You mentioned using retrieval in your project. How would you determine
            whether the problem is retrieval quality or generation quality?”
          </p>
          <div className="mt-6 flex items-center gap-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-white shadow-sm"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="h-2 w-2 rounded-full bg-mist" />
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-mist transition-colors hover:text-pearl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-full"
          >
            <MicOff className="h-4 w-4" /> Mute
          </button>
          <span className="rounded-full bg-carbon-raise px-6 py-2 text-sm font-semibold text-pearl transition-colors hover:bg-carbon-raise/70">
            Submit Answer
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
        className="absolute -bottom-2 right-0 z-20 w-64 rounded-xl border border-carbon-line bg-white p-4 shadow-xl transition-transform duration-300 hover:-translate-y-2"
      >
        <div className="mb-2 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-neon" />
          <span className="text-sm font-semibold text-pearl">Live Context Analysis</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-carbon-raise">
          <motion.div
            className="h-full rounded-full bg-neon"
            initial={{ width: "0%" }}
            animate={{ width: "85%" }}
            transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
          />
        </div>
        <p className="mt-2 truncate font-mono text-xs text-mist">
          Adapting to: Vector DB indexing strategies
        </p>
      </motion.div>
    </div>
  );
}
