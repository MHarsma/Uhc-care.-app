"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center gap-2 rounded-xl p-2 transition-all duration-200",
        "border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)]",
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95",
        className
      )}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-indigo-400"
            >
              <Moon className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-amber-500"
            >
              <Sun className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}
