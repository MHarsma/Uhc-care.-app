"use client";

import * as React from "react";
import { DashboardTask } from "@/lib/api/dashboard";
import { TaskItem } from "./task-item";
import {
  normalizeRoutineCategory,
  ROUTINE_CATEGORIES,
} from "@/lib/templates/routines";

interface TaskCategoryGroupProps {
  tasks: DashboardTask[];
  onToggleTask: (taskId: number) => Promise<void>;
  onRequestLeave?: (task: DashboardTask) => void;
}

export function TaskCategoryGroup({
  tasks,
  onToggleTask,
  onRequestLeave,
}: TaskCategoryGroupProps) {
  const [activeFilter, setActiveFilter] = React.useState<"all" | "pending" | "completed">("all");

  const filteredTasks = React.useMemo(() => {
    if (activeFilter === "pending") return tasks.filter((t) => !t.done);
    if (activeFilter === "completed") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, activeFilter]);

  // Group by category
  const groupedTasks = React.useMemo(() => {
    const map = new Map<string, DashboardTask[]>();

    filteredTasks.forEach((task) => {
      const cat = normalizeRoutineCategory(task.category);
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(task);
    });

    return Array.from(map.entries());
  }, [filteredTasks]);

  const pendingCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      {/* Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Today&apos;s Routine
          </h2>
          <p className="text-xs text-slate-500">
            {pendingCount === 0
              ? "All caught up for today!"
              : `${pendingCount} routine item${pendingCount === 1 ? "" : "s"} left to complete`}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeFilter === "pending"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("completed")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeFilter === "completed"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Grouped Category Sections */}
      {groupedTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-xs">
          No tasks match the selected filter.
        </div>
      ) : (
        groupedTasks.map(([categoryKey, categoryTasks]) => {
          const categoryMeta = ROUTINE_CATEGORIES.find(
            (c) => c.key === categoryKey
          );
          const catCompleted = categoryTasks.filter((t) => t.done).length;
          const catTotal = categoryTasks.length;
          const catIcon = categoryMeta?.icon || "✨";
          const catTitle =
            categoryMeta?.label ||
            categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

          return (
            <div key={categoryKey} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{catIcon}</span>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    {catTitle}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {catCompleted} of {catTotal} done
                </span>
              </div>

              {/* Tasks in Category */}
              <div className="grid gap-2.5">
                {categoryTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onRequestLeave={onRequestLeave}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
