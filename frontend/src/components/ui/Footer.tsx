export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-heading text-lg font-black tracking-widest uppercase">Intervu</span>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              AI Technical Interview Platform
            </p>
          </div>
          <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase text-[var(--color-muted-foreground)]">
            <span>© 2026 Team Vector</span>
            <span>Vicodathon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
