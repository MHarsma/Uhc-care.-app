import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 select-none";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 press-effect",
      secondary:
        "bg-[var(--glass-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--glass-border)]",
      outline:
        "border border-[var(--glass-border)] text-[var(--text-secondary)] bg-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
      ghost:
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
      danger:
        "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 press-effect",
      subtle:
        "bg-violet-500/10 text-violet-500 dark:text-violet-400 hover:bg-violet-500/15 border border-violet-500/20",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
