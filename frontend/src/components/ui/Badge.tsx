import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "neutral" | "warning" | "outline";
}

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-sans tracking-wide transition-colors uppercase",
        {
          "border-transparent bg-[#e0f2e5] text-[#00441e]": variant === "success",
          "border-transparent bg-[#eeeeeb] text-[#3e4a3f]": variant === "neutral",
          "border-transparent bg-[#fdf3d7] text-[#7a4d00]": variant === "warning",
          "border-[var(--color-border)] text-[var(--color-foreground)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
