import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "morning"
    | "health"
    | "study"
    | "work"
    | "deen"
    | "relationship"
    | "evening"
    | "fitness"
    | "other";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-[var(--glass-bg)] text-[var(--text-secondary)] border-[var(--glass-border)]",
    secondary: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    outline: "text-[var(--text-secondary)] border-[var(--glass-border)] bg-transparent",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    morning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    health: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    study: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    work: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    deen: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    relationship: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    evening: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    fitness: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    other: "bg-[var(--glass-bg)] text-[var(--text-secondary)] border-[var(--glass-border)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors capitalize",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
}
