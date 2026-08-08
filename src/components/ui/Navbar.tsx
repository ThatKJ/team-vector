import Link from "next/link";
import { Button } from "./Button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo placeholder, will use real asset later if available */}
            <div className="h-8 w-8 rounded-md bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">I</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">Intervu</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/candidates">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="sm">History</Button>
          </Link>
          <Link href="/candidates">
            <Button size="sm">Start Assessment</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
