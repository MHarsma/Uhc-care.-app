"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, CheckCircle2 } from "lucide-react";

interface EmptyRoutineStateProps {
  onOpenLibrary: () => void;
  onOpenQuickAdd: () => void;
}

export function EmptyRoutineState({
  onOpenLibrary,
  onOpenQuickAdd,
}: EmptyRoutineStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-8 sm:p-12 text-center backdrop-blur-xs">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-100 to-indigo-100 text-violet-600 shadow-inner mb-4">
        <Sparkles className="h-8 w-8 text-violet-600" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
        No routine items scheduled for today
      </h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-slate-500">
        Build healthy daily momentum. Pick from our pre-built Routine Library or create your own custom daily tasks.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="primary"
          onClick={onOpenLibrary}
          className="w-full sm:w-auto"
        >
          <Sparkles className="h-4 w-4 text-violet-200" />
          <span>Browse Routine Library</span>
        </Button>

        <Button
          variant="outline"
          onClick={onOpenQuickAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Custom Task</span>
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-4 text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Pre-made Deen & Morning routines</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>1-tap checkable</span>
        </div>
      </div>
    </div>
  );
}
