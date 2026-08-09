"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/candidates", label: "Candidates" },
    { href: "/history", label: "History" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-carbon-line bg-carbon/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          aria-label="Intervu home"
          className="group -ml-1 flex items-center gap-3 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-neon"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon font-heading text-base font-bold text-white transition-transform duration-200 group-hover:scale-105">
            I
          </span>
          <span className="font-heading text-[22px] font-semibold tracking-tight text-pearl">
            Intervu
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold tracking-[0.05em] transition-colors rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-neon",
                pathname?.startsWith(link.href)
                  ? "text-neon"
                  : "text-mist hover:text-pearl"
              )}
            >
              {link.label}
            </Link>
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
            className="inline-flex h-11 items-center gap-2 rounded-full bg-neon px-6 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-neon/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          >
            Start assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon">
            <User className="h-[18px] w-[18px] text-white" />
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="rounded-full p-2 text-pearl outline-none focus-visible:ring-2 focus-visible:ring-neon md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-b border-carbon-line bg-carbon/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-6 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-full px-4 py-3 text-sm font-semibold",
                  pathname?.startsWith(link.href)
                    ? "text-neon"
                    : "text-mist hover:bg-carbon-raise hover:text-pearl"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <Link
                href="/candidates"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neon text-sm font-semibold text-white"
              >
                Start assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
