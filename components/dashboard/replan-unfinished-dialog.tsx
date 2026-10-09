"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { replanApi, UnfinishedTask, ReplanAction } from "@/lib/api/replan";
import {
  Sparkles,
  CheckCircle2,
  CalendarHeart,
  ArrowRight,
  X,
  Clock,
  Send,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ReplanUnfinishedDialog() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["unfinishedYesterday"],
    queryFn: replanApi.getUnfinishedYesterday,
    staleTime: 1000 * 60 * 5,
  });

  const [activeTaskForLeave, setActiveTaskForLeave] = React.useState<UnfinishedTask | null>(null);
  const [leaveReason, setLeaveReason] = React.useState("");
  const [dismissedTaskIds, setDismissedTaskIds] = React.useState<number[]>([]);
  const [isBannerDismissed, setIsBannerDismissed] = React.useState(false);

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
        date: data?.date,
        reason,
      }),
    onSuccess: (_, variables) => {
      setDismissedTaskIds((prev) => [...prev, variables.taskId]);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["unfinishedYesterday"] });
      setActiveTaskForLeave(null);
      setLeaveReason("");
    },
    onError: (err) => {
      console.error("Replan failed:", err);
    },
  });

  const tasks = (data?.tasks ?? []).filter(
    (t) => !dismissedTaskIds.includes(t.id)
  );

  if (isLoading || isBannerDismissed || tasks.length === 0) {
    return null;
  }

  return (
    <>
      {/* Replan / Morning Review Banner */}
      <section className="relative overflow-hidden rounded-2xl glass-card p-4 space-y-3 animate-slide-up border border-[var(--glass-border)] bg-[var(--bg-card)]">
        {/* Accent glow */}
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Review Yesterday&apos;s Routine
              </h2>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {data?.date_label} • {tasks.length} unfinished {tasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBannerDismissed(true)}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            title="Dismiss review"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task List with Quick Replan Actions */}
        <div className="relative z-10 space-y-2 pt-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl bg-[var(--glass-bg)] p-3 border border-[var(--glass-border)]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">{task.icon || "✨"}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {task.title}
                  </p>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                    {task.category || "General"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                {/* Complete */}
                <button
                  type="button"
                  disabled={replanMutation.isPending}
                  onClick={() =>
                    replanMutation.mutate({
                      taskId: task.id,
                      action: "complete",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
                  title="Mark done yesterday"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Done</span>
                </button>

                {/* Request Leave / Pass */}
                <button
                  type="button"
                  disabled={replanMutation.isPending}
                  onClick={() => setActiveTaskForLeave(task)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-500 hover:bg-rose-500/20 active:scale-95 transition-all"
                  title="Request partner pass"
                >
                  <CalendarHeart className="h-3.5 w-3.5" />
                  <span>Pass</span>
                </button>

                {/* Move to Today */}
                <button
                  type="button"
                  disabled={replanMutation.isPending}
                  onClick={() =>
                    replanMutation.mutate({
                      taskId: task.id,
                      action: "move_to_today",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 active:scale-95 transition-all"
                  title="Move to today's agenda"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Today</span>
                </button>

                {/* Dismiss */}
                <button
                  type="button"
                  disabled={replanMutation.isPending}
                  onClick={() =>
                    replanMutation.mutate({
                      taskId: task.id,
                      action: "dismiss",
                    })
                  }
                  className="inline-flex items-center p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
                  title="Dismiss from review"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leave Request Dialog for Replan */}
      {activeTaskForLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl glass-card p-5 shadow-2xl space-y-4 animate-fade-scale border border-[var(--glass-border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-rose-500/15 p-2 text-rose-500">
                  <CalendarHeart className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Request Pass for Yesterday
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveTaskForLeave(null);
                  setLeaveReason("");
                }}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg p-1.5 hover:bg-[var(--bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Ask your partner for an approved pass on{" "}
              <strong className="text-[var(--text-primary)]">{activeTaskForLeave.title}</strong> so your streak stays protected.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Reason (Optional)
              </label>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="e.g. Was feeling unwell, traveled late..."
                rows={2}
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 resize-none transition-all"
              />
            </div>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5">
              {["Feeling unwell", "Traveling", "Family emergency", "Rest day"].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setLeaveReason(quick)}
                    className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors"
                  >
                    {quick}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTaskForLeave(null);
                  setLeaveReason("");
                }}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 active:scale-95 press-effect transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
