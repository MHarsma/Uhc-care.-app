"use client";

import * as React from "react";
import { DashboardTask } from "@/lib/api/dashboard";
import { api } from "@/lib/api/client";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarOff } from "lucide-react";

interface LeaveRequestDialogProps {
  task: DashboardTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

export function LeaveRequestDialog({
  task,
  open,
  onOpenChange,
  onSubmitted,
}: LeaveRequestDialogProps) {
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/tasks/${task.id}/leave-requests`, {
        reason: reason.trim() || undefined,
      });
      setReason("");
      onSubmitted();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[rgba(124,92,252,0.15)] p-2 text-violet-400">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Request Leave / Pass</DialogTitle>
              <DialogDescription>
                Ask your partner for an approved day off for this routine
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogContent className="space-y-4">
          {error && (
            <div className="rounded-xl bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.15)] p-3 text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-[var(--glass-bg)] p-3.5 border border-[var(--glass-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
              Routine Item
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base">{task.icon || "✨"}</span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {task.title}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Feeling under the weather, working late tonight..."
              rows={3}
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 resize-none transition-all"
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Submit to Partner
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
