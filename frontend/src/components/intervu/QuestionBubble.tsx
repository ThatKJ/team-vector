import { cn } from "@/lib/utils";

export function QuestionBubble({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex w-full flex-col items-start gap-2 mb-6", className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">Intervu</span>
      <div className="rounded-[16px] rounded-tl-none border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm max-w-[85%]">
        <p className="text-[var(--color-foreground)] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
