"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { tasksApi, TaskPayload, TaskRecurrence } from "@/lib/api/tasks";
import { ApiError } from "@/lib/api/client";
import { ROUTINE_CATEGORIES } from "@/lib/templates/routines";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface QuickAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

const RECURRENCES: { id: TaskRecurrence; label: string }[] = [
  { id: "daily", label: "Every day" },
  { id: "weekdays", label: "Weekdays (Mon-Fri)" },
  { id: "weekends", label: "Weekends (Sat-Sun)" },
  { id: "once", label: "One-time" },
];

const inputClasses =
  "w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-violet-500/50 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/20";

export function QuickAddTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
}: QuickAddTaskDialogProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("health");
  const [icon, setIcon] = React.useState("✨");
  const [recurrence, setRecurrence] = React.useState<TaskRecurrence>("daily");
  const [timeOfDay, setTimeOfDay] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a routine or task title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: TaskPayload = {
        title: title.trim(),
        category,
        icon: icon || "✨",
        recurrence,
        recurrence_type: recurrence,
        time_of_day: timeOfDay || null,
        notes: notes.trim() || undefined,
      };

      await tasksApi.createTask(payload);
      setTitle("");
      setTimeOfDay("");
      setNotes("");
      onTaskCreated();
      onOpenChange(false);
    } catch (err: unknown) {
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.message.toLowerCase().includes("unauthenticated"))
      ) {
        setError("Your session has expired or you are not signed in. Redirecting to sign in...");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create task. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-violet-500/10 p-2 text-violet-500 dark:text-violet-400">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>New Daily Routine Item</DialogTitle>
              <DialogDescription>
                Create a custom routine item, habit, or daily goal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogContent className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-medium">
              {error}
            </div>
          )}

          {/* Title & Icon */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Routine Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-12 h-11 text-center text-xl rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50"
                title="Icon / Emoji"
              />
              <input
                type="text"
                placeholder="e.g. Morning walk, Read 2 pages, Gym..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className={`flex-1 h-11 ${inputClasses}`}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ROUTINE_CATEGORIES.filter((cat) => cat.key !== "other").map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setCategory(cat.key);
                    setIcon(cat.icon);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.key
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold"
                      : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <span className="text-base mb-0.5">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                className={`h-10 ${inputClasses}`}
              >
                {RECURRENCES.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Time (Optional)
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className={`h-10 ${inputClasses}`}
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add extra instructions, targets, or details..."
              rows={2}
              className={`resize-none ${inputClasses}`}
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
            Create Routine Item
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
