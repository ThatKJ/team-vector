"use client";

import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Adaptive engine", href: "#engine" },
  { label: "How it works", href: "#scripted" },
  { label: "Try the demo", href: "#try" },
];

const APP_LINKS = [
  { label: "Candidates", href: "/candidates" },
  { label: "History", href: "/history" },
  { label: "Judge demo", href: "/demo" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-carbon-line bg-carbon-raise/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-pearl font-heading text-sm font-black text-carbon">
                I
              </span>
              <span className="font-heading text-base font-bold tracking-[0.2em] uppercase text-pearl">
                Intervu
              </span>
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
              An interview that thinks.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">Product</p>
              {PRODUCT_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-mist transition-colors hover:text-pearl"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">App</p>
              {APP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-mist transition-colors hover:text-pearl"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-carbon-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
            © 2026 Team Vector · Vicodathon
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
            Built for technical interviews
          </p>
        </div>
      </div>
    </footer>
  );
}
