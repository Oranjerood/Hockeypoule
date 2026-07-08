import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-black/5 text-foreground dark:bg-white/10",
  success: "bg-success/10 text-success",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-danger/10 text-danger",
  primary: "bg-primary/10 text-primary",
};

export default function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
