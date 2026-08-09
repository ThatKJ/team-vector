"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "./motion";

const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Assessment", href: "#engine" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300",
        scrolled
          ? "border-carbon-line bg-carbon/90"
          : "border-transparent bg-carbon/60"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          aria-label="Intervu home"
          className="group flex items-center gap-3 rounded-md p-1 -ml-1 outline-none focus-visible:ring-2 focus-visible:ring-neon"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon font-heading text-base font-bold text-white transition-transform duration-200 group-hover:scale-105">
            I
          </span>
          <span className="font-heading text-[22px] font-semibold tracking-tight text-pearl">
            Intervu
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold tracking-[0.05em] text-mist transition-colors hover:text-pearl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.05em] text-mist">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
            </span>
            Online
          </span>
          <Link
            href="/candidates"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-neon px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-neon/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          >
            Start assessment
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/candidates"
            aria-label="Candidate profile"
            className="hidden h-8 w-8 overflow-hidden rounded-full ring-2 ring-carbon-line transition-transform duration-200 hover:scale-105 lg:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/candidate-headshot.png"
              alt=""
              className="h-full w-full object-cover"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-full p-2 text-pearl outline-none focus-visible:ring-2 focus-visible:ring-neon md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="border-b border-carbon-line bg-carbon/95 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1 px-6 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-full px-4 py-3 text-sm font-semibold text-mist hover:bg-carbon-raise hover:text-pearl"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3">
              <Link
                href="/candidates"
                onClick={() => setOpen(false)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neon text-sm font-semibold text-white"
              >
                Start assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
