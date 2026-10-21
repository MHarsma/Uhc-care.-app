"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { dashboardApi, DashboardData, DashboardTask } from "@/lib/api/dashboard";
import { replanApi, UnfinishedTask, ReplanAction } from "@/lib/api/replan";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  X,
  History,
} from "lucide-react";

function getIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RoutineHistoryPage() {
  const queryClient = useQueryClient();

  const yesterdayStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getIsoDate(d);
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<string>(yesterdayStr);
  const [activeTaskForLeave, setActiveTaskForLeave] = React.useState<UnfinishedTask | null>(null);
  const [leaveReason, setLeaveReason] = React.useState("");

  // Quick preset dates
  const presets = React.useMemo(() => {
    const today = new Date();
    const list: { label: string; date: string }[] = [];

    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    list.push({ label: "Yesterday", date: getIsoDate(y) });

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    list.push({ label: "2 Days Ago", date: getIsoDate(twoDaysAgo) });

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    list.push({ label: "3 Days Ago", date: getIsoDate(threeDaysAgo) });

    return list;
  }, []);

  // Fetch Dashboard / Tasks for selected date
  const {
    data: dayData,
    isLoading: isDayLoading,
    refetch: refetchDay,
  } = useQuery({
    queryKey: ["routineHistory", selectedDate],
    queryFn: () => dashboardApi.getDashboardForDate(selectedDate),
    staleTime: 1000 * 60 * 2,
  });

  // Fetch Unfinished / Replan items for selected date
  const {
    data: replanData,
    isLoading: isReplanLoading,
    refetch: refetchReplan,
  } = useQuery({
    queryKey: ["unfinishedHistory", selectedDate],
    queryFn: () => replanApi.getUnfinishedForDate(selectedDate),
    staleTime: 1000 * 60 * 2,
  });

  const replanMutation = useMutation({
    mutationFn: ({
      taskId,
      action,
      reason,
    }: {
      taskId: number;
      action: ReplanAction;
      reason?: string;
    }) =>
      replanApi.replanTask(taskId, {
        action,
        date: selectedDate,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineHistory", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["unfinishedHistory", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setActiveTaskForLeave(null);
      setLeaveReason("");
    },
  });

  const tasks: DashboardTask[] = dayData?.tasks || [];
  const unfinishedTasks: UnfinishedTask[] = replanData?.tasks || [];
  const stats = dayData?.stats;

  const navigateDay = (offset: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);
    setSelectedDate(getIsoDate(date));
  };

  return (
    <AppShell
      headerTitle="Routine History & Review"
      headerSubtitle="Inspect any past day's routines, completion rates, and unfinished task replans"
    >
      <div className="mx-auto max-w-5xl space-y-6 pb-16 pt-2">
        {/* Date Selector Banner */}
        <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 sm:p-6 glass-card shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateDay(-1)}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div>
                <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {formatDisplayDate(selectedDate)}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {selectedDate === yesterdayStr ? "Yesterday's Routine" : `Viewing record for ${selectedDate}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigateDay(1)}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                title="Next Day"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Custom Date Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="history-date-picker" className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-violet-500" />
                <span>Jump to Date:</span>
              </label>
              <input
                id="history-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--glass-border)]">
            <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Quick Select:
            </span>
            {presets.map((p) => (
              <button
                key={p.date}
                type="button"
                onClick={() => setSelectedDate(p.date)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                  selectedDate === p.date
                    ? "bg-violet-600 text-white shadow-xs"
                    : "border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Day Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 glass-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Completed
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-500">
                {stats.completed_tasks} / {stats.total_tasks}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 glass-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Success Rate
              </span>
              <p className="mt-1 text-2xl font-black text-violet-500">
                {stats.progress_percent}%
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 glass-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Active Streak
              </span>
              <p className="mt-1 text-2xl font-black text-amber-500">
                {stats.streak_days} Days
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 glass-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Unfinished Tasks
              </span>
              <p className="mt-1 text-2xl font-black text-rose-500">
                {unfinishedTasks.length}
              </p>
            </div>
          </div>
        )}

        {/* Unfinished Tasks Replan Review Section (Only if unfinished tasks exist on that date) */}
        {unfinishedTasks.length > 0 && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Unfinished Tasks Review for {formatDisplayDate(selectedDate)}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Replan or excuse these unfinished routines to keep your streak accurate.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {unfinishedTasks.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 space-y-3 glass-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{t.title}</h4>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        {t.category || "General Routine"} {t.time_of_day ? `• ${t.time_of_day}` : ""}
                      </p>
                    </div>
                    {t.is_prayer && (
                      <span className="rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                        Salah
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--glass-border)]">
                    <button
                      type="button"
                      disabled={replanMutation.isPending}
                      onClick={() =>
                        replanMutation.mutate({
                          taskId: t.id,
                          action: "complete",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors"
                      title="Mark as completed yesterday"
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Did it</span>
                    </button>

                    <button
                      type="button"
                      disabled={replanMutation.isPending}
                      onClick={() =>
                        replanMutation.mutate({
                          taskId: t.id,
                          action: "move_to_today",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2.5 py-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 transition-colors"
                      title="Move to today's schedule"
                    >
                      <ArrowRight className="h-3 w-3" />
                      <span>Move to Today</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTaskForLeave(t)}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 transition-colors"
                      title="Submit partner leave request"
                    >
                      <CalendarHeart className="h-3 w-3" />
                      <span>Ask Leave</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Routines List for Selected Day */}
        <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 space-y-4 glass-card">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="h-4 w-4 text-violet-500" />
              <span>Routines on this Day ({tasks.length})</span>
            </h3>
            <span className="text-xs text-[var(--text-tertiary)]">
              {stats?.completed_tasks ?? 0} marked done
            </span>
          </div>

          {isDayLoading ? (
            <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
              Loading routines for {selectedDate}...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--glass-border)] rounded-2xl">
              No routines scheduled or found for this date.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-2xl border transition-all",
                    task.done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[var(--glass-border)] bg-[var(--bg-secondary)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-xl border text-xs font-bold",
                        task.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-400 dark:border-slate-600 text-[var(--text-tertiary)]"
                      )}
                    >
                      {task.done ? <Check className="h-4 w-4 stroke-[3]" /> : "•"}
                    </div>

                    <div>
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-bold",
                          task.done
                            ? "text-[var(--text-primary)] line-through opacity-70"
                            : "text-[var(--text-primary)]"
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        {task.category || "General"} {task.time_of_day ? `• ${task.time_of_day}` : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider",
                      task.done
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-500/15 text-[var(--text-secondary)]"
                    )}
                  >
                    {task.done ? "Completed" : "Unfinished"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Request Dialog */}
        {activeTaskForLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl glass-card p-6 shadow-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-2">
                  <CalendarHeart className="h-5 w-5 text-rose-500" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Request Partner Leave
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTaskForLeave(null)}
                  className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Asking partner to excuse: <strong className="text-[var(--text-primary)]">{activeTaskForLeave.title}</strong> for {formatDisplayDate(selectedDate)}.
                </p>
              </div>

              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Reason (e.g. Worked late, felt unwell, headache)..."
                rows={3}
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-xs text-[var(--text-primary)] focus:border-violet-500 focus:outline-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTaskForLeave(null)}
                  className="rounded-xl border border-[var(--glass-border)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={replanMutation.isPending}
                  onClick={() =>
                    replanMutation.mutate({
                      taskId: activeTaskForLeave.id,
                      action: "request_leave",
                      reason: leaveReason || undefined,
                    })
                  }
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:opacity-90 transition-opacity"
                >
                  {replanMutation.isPending ? "Sending..." : "Submit Leave Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
