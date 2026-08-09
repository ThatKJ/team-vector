"use client";

import { motion } from "framer-motion";

export function TypingIndicator({ text = "Evaluating reasoning..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)] mb-6 py-2 px-4 rounded-full border border-[var(--color-border)] w-fit bg-[var(--color-surface)]">
      <div className="flex gap-1 items-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }} className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
      </div>
      <span className="font-mono text-xs">{text}</span>
    </div>
  );
}
