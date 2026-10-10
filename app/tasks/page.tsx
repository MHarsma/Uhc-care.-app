"use client";

import * as React from "react";
import Link from "next/link";
import { FormEvent, useEffect, useState, useMemo } from "react";
import type { Task, TaskLog } from "@/types/task";
import { AppShell } from "@/components/layout/app-shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
  Calendar,
  X,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  Flame,
  Check,
  Timer,
  Search,
  Filter,
  History,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api/client";

const apiUrl = getApiBaseUrl();

const ICONS = ["✨", "🏃", "💧", "📖", "🧘", "🌙", "💼", "🍎", "📚", "✍️", "🎯", "🧹", "💊", "🌿", "🚶", "🥗"];
const CATEGORIES = ["All", "Health", "Study", "Deen", "Work", "Prayer", "Other"];
const WEEKDAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const inputClasses =
  "w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-violet-500/50 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/20";

const emptyForm = {
  title: "",
  icon: "✨",
  category: "Health",
  recurrence_type: "daily",
  recurrence_days: [] as string[],
  time_of_day: "",
  duration_minutes: "" as string | number,
  notes: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [historyLogs, setHistoryLogs] = useState<TaskLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadTasks(): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/tasks`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const result: { tasks: Task[] } = await response.json();
        setTasks(result.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesCat =
        selectedCategory === "All" ||
        (t.category || "Other").toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [tasks, selectedCategory, searchQuery]);

  function openCreateForm(): void {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function startEdit(task: Task): void {
    setEditingId(task.id);
    setForm({
      title: task.title,
      icon: task.icon ?? "✨",
      category: task.category ?? "Health",
      recurrence_type: task.recurrence_type ?? "daily",
      recurrence_days: task.recurrence_days ?? [],
      time_of_day: task.time_of_day ? task.time_of_day.slice(0, 5) : "",
      duration_minutes: task.duration_minutes ?? "",
      notes: task.notes ?? "",
    });
    setIsFormOpen(true);
  }

  async function toggleActive(task: Task): Promise<void> {
    const nextActive = !task.is_active;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_active: nextActive } : t))
    );

    try {
      const response = await fetch(`${apiUrl}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: nextActive }),
      });
      if (!response.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, is_active: !nextActive } : t))
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_active: !nextActive } : t))
      );
    }
  }

  async function saveTask(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      title: form.title,
      icon: form.icon,
      category: form.category,
      recurrence_type: form.recurrence_type,
      recurrence_days: form.recurrence_type === "custom" ? form.recurrence_days : [],
      time_of_day: form.time_of_day ? `${form.time_of_day}:00` : null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      notes: form.notes || null,
    };

    try {
      const url = editingId ? `${apiUrl}/tasks/${editingId}` : `${apiUrl}/tasks`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Unable to save routine.");

      await loadTasks();
      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setMessage({
        type: "success",
        text: editingId ? "Routine updated successfully!" : "Routine created successfully!",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save routine.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!taskToDelete) return;
    setDeleting(true);

    try {
      const response = await fetch(`${apiUrl}/tasks/${taskToDelete.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete routine.");

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
      setMessage({ type: "success", text: "Routine deleted." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Delete failed.",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function viewHistory(task: Task): Promise<void> {
    setHistoryTask(task);
    setHistoryLoading(true);
    try {
      const response = await fetch(`${apiUrl}/tasks/${task.id}/history`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const result: { logs: TaskLog[] } = await response.json();
        setHistoryLogs(result.logs);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <AppShell
      headerTitle="All Routines"
      headerSubtitle="Manage daily habits, schedules & reminders"
      headerAction={
        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Routine</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* Alert Feedback */}
        {message && (
          <div
            className={cn(
              "rounded-xl p-4 text-xs font-bold flex items-center gap-2.5",
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? tasks.length
                  : tasks.filter(
                      (t) => (t.category || "Other").toLowerCase() === cat.toLowerCase()
                    ).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 press-effect border",
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-600 dark:text-violet-300 border-violet-500/30"
                      : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routines..."
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-9 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Routines Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-2xl shimmer" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--glass-border)] glass-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 dark:text-violet-400 mb-4">
              <ListTodo className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No routines found
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No habits matching "${searchQuery}".`
                : "You don't have any routines in this category yet."}
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/15 press-effect transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Routine</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                className={cn(
                  "rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 glass-card transition-all duration-200 flex flex-col justify-between hover:border-violet-500/30",
                  !task.is_active && "opacity-50"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl select-none">{task.icon || "✨"}</span>
                      <span className="inline-block rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)] capitalize">
                        {task.category || "General"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleActive(task)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        task.is_active ? "bg-emerald-500" : "bg-[var(--glass-border)]"
                      )}
                      title={task.is_active ? "Active routine" : "Paused routine"}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          task.is_active ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <h4 className="mt-3 text-base font-bold text-[var(--text-primary)] leading-snug">
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p className="mt-1 text-xs text-[var(--text-tertiary)] line-clamp-2">
                      {task.notes}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                    {task.time_of_day && (
                      <span className="flex items-center gap-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1">
                        <Clock className="h-3 w-3 text-[var(--text-tertiary)]" />
                        <span>{task.time_of_day.slice(0, 5)}</span>
                      </span>
                    )}
                    {task.duration_minutes && (
                      <span className="flex items-center gap-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1">
                        <Timer className="h-3 w-3 text-[var(--text-tertiary)]" />
                        <span>{task.duration_minutes}m</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1 capitalize">
                      <Calendar className="h-3 w-3 text-[var(--text-tertiary)]" />
                      <span>{task.recurrence_type || "Daily"}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => viewHistory(task)}
                    className="flex items-center gap-1 text-xs font-semibold text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>History</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(task)}
                      className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-violet-500 hover:bg-violet-500/10 transition-colors"
                      title="Edit routine"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete routine"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT ROUTINE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 shadow-2xl animate-fade-scale max-h-[90vh] overflow-y-auto border border-[var(--glass-border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {editingId ? "Edit Routine" : "Create New Routine"}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Configure habit schedule and details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Routine Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Morning Quran Reading"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Select Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl text-lg border transition-all",
                        form.icon === emoji
                          ? "border-violet-500/50 bg-violet-500/15 scale-110"
                          : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClasses}
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Time of Day
                  </label>
                  <input
                    type="time"
                    value={form.time_of_day}
                    onChange={(e) => setForm({ ...form, time_of_day: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Recurrence
                </label>
                <select
                  value={form.recurrence_type}
                  onChange={(e) => setForm({ ...form, recurrence_type: e.target.value })}
                  className={inputClasses}
                >
                  <option value="daily" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Every Day (Daily)</option>
                  <option value="weekdays" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Weekdays (Mon - Fri)</option>
                  <option value="weekends" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Weekends (Sat - Sun)</option>
                  <option value="custom" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Custom Days</option>
                </select>
              </div>

              {form.recurrence_type === "custom" && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Repeat on Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const isSelected = form.recurrence_days.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? form.recurrence_days.filter((d) => d !== day.key)
                              : [...form.recurrence_days, day.key];
                            setForm({ ...form, recurrence_days: next });
                          }}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-bold transition-all border",
                            isSelected
                              ? "border-violet-500/40 bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-600 dark:text-violet-300"
                              : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional context or target..."
                  rows={2}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <div className="pt-3 border-t border-[var(--glass-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 disabled:opacity-50 press-effect"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Routine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl glass-card p-6 shadow-2xl text-center animate-fade-scale border border-[var(--glass-border)] bg-[var(--bg-card)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Delete Routine?
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Are you sure you want to delete &ldquo;{taskToDelete.title}&rdquo;? Past completion logs will be preserved.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/15 press-effect"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY / LOGS MODAL */}
      {historyTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-card p-6 shadow-2xl animate-fade-scale max-h-[85vh] flex flex-col border border-[var(--glass-border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{historyTask.icon || "✨"}</span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {historyTask.title} History
                  </h3>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Recent completion logs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryTask(null)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {historyLoading ? (
                <div className="text-center py-8 text-xs text-[var(--text-tertiary)]">
                  Loading history logs...
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--text-tertiary)]">
                  No completion logs recorded yet.
                </div>
              ) : (
                historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs"
                  >
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{log.date}</p>
                      <span className="text-[10px] text-[var(--text-tertiary)] capitalize">
                        Status: {log.status}
                      </span>
                    </div>
                    {log.completed_at && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        ✓ Done
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
