"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface AndroidBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AndroidBottomSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  className,
}: AndroidBottomSheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
      {/* M3 Scrim / Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* M3 Bottom Sheet Container */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-[#FEF7FF] border border-[#E6E0E9] shadow-[0_8px_30px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom-6 duration-200 flex flex-col max-h-[85vh]",
          className
        )}
      >
        {/* M3 Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="h-1 w-8 rounded-full bg-[#79747E]/50" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-center justify-between border-b border-[#E6E0E9] px-6 py-3.5">
            <div>
              {title && (
                <h3 className="text-base font-bold text-[#1D1B20] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#49454F] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-[#49454F] hover:bg-black/5 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
