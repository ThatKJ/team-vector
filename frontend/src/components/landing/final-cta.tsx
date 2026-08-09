"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, Reveal } from "./motion";

export function FinalCta() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-carbon-line py-28 md:py-40">
      <div className="landing-grid absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-[130px]"
      />
      <motion.div
        aria-hidden
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-7 px-4 text-center sm:px-6"
      >
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-soft">
            Your interview begins with one answer
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-heading text-[clamp(2.5rem,6.5vw,4.5rem)] font-semibold leading-[1] tracking-tight text-pearl">
            Ready to see how you think?
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-xl text-base leading-relaxed text-mist md:text-lg">
            Your next technical interview shouldn’t be predictable.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href="/candidates"
            className="group inline-flex h-14 items-center gap-3 rounded-[10px] bg-pearl px-9 text-base font-semibold text-carbon transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_48px_rgb(0_109_53/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          >
            Start Your Interview
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
            No preparation required.
          </p>
        </Reveal>
      </motion.div>
    </section>
  );
}
