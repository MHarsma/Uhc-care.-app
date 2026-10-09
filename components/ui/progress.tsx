import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "rainbow";
  showLabel?: boolean;
}

export function Progress({
  value,
  size = "md",
  variant = "primary",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const fillVariants = {
    primary: "bg-gradient-to-r from-violet-500 to-indigo-600",
    success: "bg-gradient-to-r from-emerald-400 to-teal-500",
    rainbow:
      "bg-gradient-to-r from-violet-500 via-indigo-500 via-pink-500 to-emerald-400",
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>Daily Completion</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 shadow-inner",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out shadow-xs",
            fillVariants[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
