export function Footer() {
  return (
    <footer className="mt-auto border-t border-carbon-line bg-carbon-raise py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-10">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neon font-heading text-xs font-bold text-white">
              I
            </span>
            <span className="font-heading text-base font-semibold tracking-tight text-mist">
              Intervu
            </span>
          </div>
          <p className="text-sm text-fog">AI Technical Interview Platform</p>
        </div>
        <div className="flex gap-6 text-xs font-semibold tracking-[0.05em] text-fog">
          <span>© 2026 Team Vector</span>
          <span>Vicodathon</span>
        </div>
      </div>
    </footer>
  );
}
