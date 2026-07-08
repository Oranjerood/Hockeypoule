import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn(
        "mb-1.5 block text-sm font-medium text-foreground",
        props.className
      )}
    />
  );
}

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow",
        className
      )}
      {...props}
    />
  );
}
