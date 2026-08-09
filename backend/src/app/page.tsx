export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
          INTERVU API
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Adaptive Interview Engine</h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          This is the Intervu backend. Interview sessions, AI evaluation, and
          assessment reports are served through the REST API below.
        </p>
        <ul className="mt-4 w-full space-y-2 rounded-xl border border-zinc-200 p-5 text-left font-mono text-xs dark:border-zinc-800">
          <li><span className="text-emerald-600">POST</span> /api/interview — start / continue a session</li>
          <li><span className="text-emerald-600">GET</span> /api/candidates — available candidates</li>
          <li>
            <span className="text-emerald-600">POST</span> /api/interviews/[id]/finalize — generate report
          </li>
          <li>
            <span className="text-emerald-600">GET</span> /api/interviews/[id]/report — fetch report
          </li>
        </ul>
      </div>
    </main>
  );
}
