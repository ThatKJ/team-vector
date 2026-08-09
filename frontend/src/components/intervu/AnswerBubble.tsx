import { cn } from "@/lib/utils";

export function AnswerBubble({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex w-full flex-col items-end gap-2 mb-6", className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Candidate</span>
      <div className="rounded-[16px] rounded-tr-none bg-[var(--color-background)] border border-[var(--color-border)] px-5 py-4 max-w-[85%]">
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
