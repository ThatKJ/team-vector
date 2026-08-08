"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./Button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1 -ml-1">
            <div className="h-8 w-8 rounded-md bg-[var(--color-primary)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-heading font-bold text-lg">I</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">Intervu</span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/candidates" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
            Candidates
          </Link>
          <Link href="/history" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
            History
          </Link>
          <Link href="/candidates" tabIndex={-1}>
            <Button size="sm">Start Assessment</Button>
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            type="button" 
            className="p-2 -mr-2 text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link 
              href="/candidates" 
              className="block px-3 py-2 text-base font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Candidates
            </Link>
            <Link 
              href="/history" 
              className="block px-3 py-2 text-base font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
            <div className="pt-2">
              <Link href="/candidates" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center">Start Assessment</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
