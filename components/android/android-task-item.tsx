"use client";

import * as React from "react";
import { DashboardTask } from "@/lib/api/dashboard";
import { Check, Clock, CalendarOff, CalendarHeart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AndroidTaskItemProps {
  task: DashboardTask;
  onToggle: (taskId: number) => Promise<void>;
  onRequestLeave?: (task: DashboardTask) => void;
}

export function AndroidTaskItem({
  task,
  onToggle,
  onRequestLeave,
}: AndroidTaskItemProps) {
  const [isDone, setIsDone] = React.useState(task.done);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setIsDone(task.done);
  }, [task.done]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    const nextDone = !isDone;
    setIsDone(nextDone);
    setIsPending(true);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore devices where vibrate is restricted
      }
    }

    try {
      await onToggle(task.id);
    } catch (err) {
      setIsDone(!nextDone);
      console.error("Failed to toggle task:", err);
    } finally {
      setIsPending(false);
    }
  };

  const formattedTime = React.useMemo(() => {
    if (!task.time_of_day) return null;
    return task.time_of_day.slice(0, 5);
  }, [task.time_of_day]);

  /** Format server-authoritative completed_at into a readable local time string. */
  const formattedCompletedAt = React.useMemo(() => {
    if (!task.completed_at) return null;
    try {
      const date = new Date(task.completed_at);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return null;
    }
  }, [task.completed_at]);

  if (task.is_paused) {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-[18px] border border-[#E6E0E9] bg-[#FFD8E4]/20 text-[#49454F] select-none">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[#B3261E]/30 bg-[#FFD8E4] text-[#B3261E]">
            <CalendarHeart className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {task.icon && <span className="text-sm shrink-0">{task.icon}</span>}
              <p className="text-sm font-medium text-[#49454F] truncate">{task.title}</p>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-extrabold text-[#B3261E] bg-[#FFD8E4] px-2 py-0.2 rounded-md">
                Paused for Cycle
              </span>
              {formattedTime && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#79747E]">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{formattedTime}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "group relative flex items-center justify-between p-3.5 rounded-[18px] border transition-all duration-150 cursor-pointer select-none active:scale-[0.99]",
        isDone
          ? "border-[#E6E0E9] bg-[#ECE6F0]/60 text-[#49454F]"
          : "border-[#CAC4D0]/80 bg-white hover:border-[#6750A4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      )}
    >
      {/* Left: Material Rounded Square Checkbox + Details */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-2">
        {/* M3 Rounded-Square Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 transition-all duration-200 active:scale-90",
            isDone
              ? "border-[#6750A4] bg-[#6750A4] text-white shadow-xs"
              : "border-[#49454F] bg-transparent text-transparent hover:border-[#6750A4]"
          )}
          aria-label={isDone ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        >
          <Check
            className={cn(
              "h-4 w-4 stroke-[3] transition-transform duration-200",
              isDone ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
          />
        </button>

        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {task.icon && (
              <span className="text-sm shrink-0 select-none">{task.icon}</span>
            )}
            <p
              className={cn(
                "text-sm font-semibold truncate transition-all duration-150",
                isDone ? "text-[#79747E] line-through font-normal" : "text-[#1D1B20]"
              )}
            >
              {task.title}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-[#49454F]">
            {task.category && (
              <span className="inline-block rounded-md bg-[#E8DEF8] px-2 py-0.2 text-[10px] font-bold text-[#1D192B] capitalize">
                {task.category}
              </span>
            )}

            {formattedTime && (
              <span className="flex items-center gap-0.5 text-[#49454F]">
                <Clock className="h-2.5 w-2.5" />
                <span>{formattedTime}</span>
              </span>
            )}

            {isDone && task.completed_at && (
              <span className="text-[#386A20] font-semibold text-[10px]">
                ✓ {formattedCompletedAt ? `Done at ${formattedCompletedAt}` : "Completed"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Leave / Pass Action */}
      {!isDone && onRequestLeave && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestLeave(task);
          }}
          className="shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#49454F] hover:text-[#6750A4] hover:bg-[#EADDFF]/50 transition-colors"
          title="Request leave / day pass"
        >
          <CalendarOff className="h-3.5 w-3.5" />
          <span>Pass</span>
        </button>
      )}
    </div>
  );
}
