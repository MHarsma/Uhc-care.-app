"use client";

import * as React from "react";
import { DashboardTask } from "@/lib/api/dashboard";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: DashboardTask;
  onToggle: (taskId: number) => Promise<void>;
  onRequestLeave?: (task: DashboardTask) => void;
}

export function TaskItem({ task, onToggle, onRequestLeave }: TaskItemProps) {
  const [isDone, setIsDone] = React.useState(task.done);
  const [isPending, setIsPending] = React.useState(false);

  // Sync state if task prop changes externally
  React.useEffect(() => {
    setIsDone(task.done);
  }, [task.done]);

  const handleToggle = async () => {
    if (isPending) return;

    // Optimistic update
    const nextDone = !isDone;
    setIsDone(nextDone);
    setIsPending(true);

    try {
      await onToggle(task.id);
    } catch (err) {
      // Revert on failure
      setIsDone(!nextDone);
      console.error("Failed to toggle task status:", err);
    } finally {
      setIsPending(false);
    }
  };

  const formattedTime = React.useMemo(() => {
    if (!task.time_of_day) return null;
    return task.time_of_day.slice(0, 5);
  }, [task.time_of_day]);

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 select-none",
        isDone
          ? "border-slate-200/60 bg-slate-50/70 text-slate-400"
          : "border-slate-200/90 bg-white text-slate-800 hover:border-violet-300 hover:shadow-xs shadow-2xs"
      )}
    >
      {/* Left side: Checkbox + Title + Meta */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white shadow-xs shadow-emerald-500/20"
              : "border-slate-300 hover:border-violet-400 bg-white text-transparent hover:bg-violet-50/40"
          )}
          aria-label={isDone ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
        >
          <Check
            className={cn(
              "h-4 w-4 stroke-[3] transition-transform duration-200",
              isDone ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
          />
        </button>

        {/* Task Title and Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {task.icon && (
              <span className="text-base shrink-0 select-none">{task.icon}</span>
            )}
            <h4
              onClick={handleToggle}
              className={cn(
                "cursor-pointer text-sm font-semibold truncate transition-all duration-150",
                isDone ? "line-through text-slate-400 font-normal" : "text-slate-800"
              )}
            >
              {task.title}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.category && (
              <Badge variant={task.category as any} className="text-[10px] px-2 py-0">
                {task.category}
              </Badge>
            )}

            {formattedTime && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>{formattedTime}</span>
              </span>
            )}

            {isDone && task.completed_at && (
              <span className="text-[10px] text-emerald-600 font-medium">
                ✓ Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Leave Request / Pass Action */}
      {!isDone && onRequestLeave && (
        <button
          type="button"
          onClick={() => onRequestLeave(task)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-violet-600 px-2.5 py-1 rounded-lg hover:bg-violet-50"
          title="Request partner leave / pass for today"
        >
          <CalendarOff className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Pass</span>
        </button>
      )}
    </div>
  );
}
