"use client";

import * as React from "react";
import {
  ROUTINE_CATEGORIES,
  SUGGESTED_ROUTINES,
  RoutineTemplate,
} from "@/lib/templates/routines";
import { tasksApi, TaskPayload } from "@/lib/api/tasks";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoutineLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksAdded: () => void;
  existingTaskTitles?: string[];
}

export function RoutineLibraryModal({
  open,
  onOpenChange,
  onTasksAdded,
  existingTaskTitles = [],
}: RoutineLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedTemplateIds, setSelectedTemplateIds] = React.useState<
    Set<string>
  >(new Set());
  const [justAddedTitles, setJustAddedTitles] = React.useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Normalize existing titles for duplicate checking
  const existingSet = React.useMemo(() => {
    const set = new Set(
      existingTaskTitles.map((t) => t.trim().toLowerCase())
    );
    justAddedTitles.forEach((t) => set.add(t));
    return set;
  }, [existingTaskTitles, justAddedTitles]);

  const filteredTemplates = React.useMemo(() => {
    if (selectedCategory === "all") return SUGGESTED_ROUTINES;
    return SUGGESTED_ROUTINES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const toggleSelect = (id: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSingle = async (template: RoutineTemplate) => {
    try {
      setIsSubmitting(true);
      setActionError(null);
      await tasksApi.createTask({
        title: template.title,
        category: template.category,
        icon: template.icon,
        recurrence: template.recurrence,
        recurrence_type: template.recurrence,
        time_of_day: template.suggestedTime ? template.suggestedTime : null,
      });
      setJustAddedTitles((prev) => new Set([...prev, template.title.trim().toLowerCase()]));
      onTasksAdded();
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.toLowerCase?.().includes("unauthenticated")) {
        setActionError("Your session has expired or you are not signed in. Redirecting to sign in...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
        return;
      }
      setActionError(error?.message || "Failed to add routine item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchAdd = async () => {
    if (selectedTemplateIds.size === 0) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      const templatesToAdd = SUGGESTED_ROUTINES.filter((t) =>
        selectedTemplateIds.has(t.id)
      );

      const payloads: TaskPayload[] = templatesToAdd.map((t) => ({
        title: t.title,
        category: t.category,
        icon: t.icon,
        recurrence: t.recurrence,
        recurrence_type: t.recurrence,
        time_of_day: t.suggestedTime ? t.suggestedTime : null,
      }));

      await tasksApi.batchCreateTasks(payloads);
      setJustAddedTitles((prev) => {
        const next = new Set(prev);
        templatesToAdd.forEach((t) => next.add(t.title.trim().toLowerCase()));
        return next;
      });
      setSelectedTemplateIds(new Set());
      onTasksAdded();
      setTimeout(() => onOpenChange(false), 400);
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.toLowerCase?.().includes("unauthenticated")) {
        setActionError("Your session has expired or you are not signed in. Redirecting to sign in...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
        return;
      }
      setActionError(error?.message || "Failed to add routines. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-[rgba(124,92,252,0.15)] p-2 text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Routine & Task Library</DialogTitle>
            <DialogDescription>
              Pick pre-built habits & routines to add to your daily schedule in 1 tap
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {actionError && (
        <div className="mx-6 mt-3 rounded-xl bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.15)] p-3 text-xs text-rose-400 font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-400 hover:text-rose-300 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Categories Bar */}
      <div className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 px-6 overflow-x-auto scrollbar-none flex gap-1.5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all",
            selectedCategory === "all"
              ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-600 dark:text-violet-300 border border-violet-500/30"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-transparent"
          )}
        >
          All ({SUGGESTED_ROUTINES.length})
        </button>
        {ROUTINE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
              selectedCategory === cat.key
                ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-600 dark:text-violet-300 border border-violet-500/30"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-transparent"
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <DialogContent className="max-h-[50vh] overflow-y-auto space-y-2 p-6 py-4">
        {filteredTemplates.map((template) => {
          const isAlreadyAdded = existingSet.has(
            template.title.trim().toLowerCase()
          );
          const isSelected = selectedTemplateIds.has(template.id);

          return (
            <div
              key={template.id}
              className={cn(
                "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150",
                isSelected
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-[var(--glass-border)] hover:border-violet-500/30 hover:bg-[var(--bg-hover)]",
                isAlreadyAdded && "opacity-50"
              )}
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 mr-3"
                onClick={() => {
                  if (!isAlreadyAdded) toggleSelect(template.id);
                }}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all group-hover:scale-105",
                    isSelected ? "bg-violet-500 text-white" : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                  )}
                >
                  {isSelected ? <Check className="h-5 w-5" /> : template.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                    {template.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={template.category as any}>
                      {template.category}
                    </Badge>
                    {template.suggestedTime && (
                      <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                        ⏰ {template.suggestedTime}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)]">
                      • {template.recurrence}
                    </span>
                  </div>
                </div>
              </div>

              {isAlreadyAdded ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-lg shrink-0 border border-emerald-500/20">
                  Added ✓
                </span>
              ) : (
                <Button
                  size="sm"
                  variant={isSelected ? "primary" : "secondary"}
                  disabled={isSubmitting}
                  onClick={() => handleAddSingle(template)}
                  className="shrink-0 text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              )}
            </div>
          );
        })}
      </DialogContent>

      <DialogFooter>
        <div className="flex w-full items-center justify-between">
          <p className="text-xs text-[var(--text-tertiary)] font-medium">
            {selectedTemplateIds.size > 0
              ? `${selectedTemplateIds.size} routine(s) selected`
              : "Click routine items to select multiple"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {selectedTemplateIds.size > 0 && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleBatchAdd}
              >
                Add {selectedTemplateIds.size} to Today
              </Button>
            )}
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
