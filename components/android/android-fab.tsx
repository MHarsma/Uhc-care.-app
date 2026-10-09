"use client";

import * as React from "react";
import { Plus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AndroidFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label?: string;
  variant?: "primary" | "surface" | "tertiary";
  size?: "small" | "default" | "large";
}

export function AndroidFab({
  icon: Icon = Plus,
  label,
  variant = "primary",
  size = "default",
  className,
  ...props
}: AndroidFabProps) {
  const variantStyles = {
    primary:
      "bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-[0_6px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_22px_rgba(79,70,229,0.45)] hover:from-indigo-500 hover:to-violet-600",
    surface:
      "bg-[#ECE6F0] text-[#1D1B20] border border-[#CAC4D0] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-[#E6E0E9]",
    tertiary:
      "bg-[#FFD8E4] text-[#31111D] shadow-[0_6px_16px_rgba(125,82,96,0.25)] hover:bg-[#FFD0DE]",
  };

  const sizeStyles = {
    small: "h-10 w-10 rounded-[12px]",
    default: "h-14 w-14 rounded-[18px]",
    large: "h-16 w-16 rounded-[22px]",
  };

  const iconSizes = {
    small: "h-5 w-5",
    default: "h-6 w-6",
    large: "h-7 w-7",
  };

  // If label is present, render an M3 Extended FAB
  if (label) {
    return (
      <button
        type="button"
        className={cn(
          "group inline-flex items-center gap-2.5 px-5 h-14 rounded-[18px] font-semibold text-sm transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className={cn("transition-transform duration-200 group-hover:rotate-90", iconSizes[size])} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "group flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <Icon className={cn("transition-transform duration-200 group-hover:rotate-90", iconSizes[size])} />
    </button>
  );
}
