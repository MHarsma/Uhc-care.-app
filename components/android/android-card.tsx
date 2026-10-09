"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AndroidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "filled" | "outlined";
  children: React.ReactNode;
  className?: string;
}

export function AndroidCard({
  variant = "filled",
  children,
  className,
  ...props
}: AndroidCardProps) {
  const variantStyles = {
    elevated:
      "bg-[#FEF7FF] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] border border-[#E6E0E9]/60",
    filled: "bg-[#F3EDF7] border border-transparent",
    outlined: "bg-[#FEF7FF] border border-[#CAC4D0]",
  };

  return (
    <div
      className={cn(
        "rounded-[24px] p-5 text-[#1D1B20] transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
