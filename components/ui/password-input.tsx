"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  icon?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, label, error, icon = true, id, required, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none"
          >
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        </div>
      )}

      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-violet-400 transition-colors">
            <Lock className="h-4 w-4" />
          </div>
        )}

        <input
          {...props}
          id={inputId}
          ref={ref}
          type={showPassword ? "text" : "password"}
          required={required}
          className={cn(
            "w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-3 pr-11 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none transition-all duration-200",
            "focus:border-violet-500/50 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/20",
            "hover:border-violet-500/30",
            icon ? "pl-10" : "pl-4",
            error && "border-rose-500/30 bg-rose-500/5 focus:border-rose-500/50 focus:ring-rose-500/20",
            className
          )}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-tertiary)] hover:text-violet-400 active:scale-95 focus:outline-none transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-violet-400 transition-transform" />
          ) : (
            <Eye className="h-4 w-4 transition-transform hover:scale-110" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-400 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
