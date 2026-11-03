"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { dashboardApi, DashboardData, DashboardTask } from "@/lib/api/dashboard";
import { tasksApi } from "@/lib/api/tasks";
import {
  getRoutineCategoryLabel,
  normalizeRoutineCategory,
  ROUTINE_CATEGORIES,
} from "@/lib/templates/routines";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { LeaveRequestDialog } from "@/components/dashboard/leave-request-dialog";
import { RoutineLibraryModal } from "@/components/routine-library/routine-library-modal";
import { QuickAddTaskDialog } from "@/components/routine-library/quick-add-task-dialog";
import {
  Sparkles,
  Plus,
  Heart,
  BellRing,
  CheckCircle2,
  Clock,
  CalendarOff,
  CalendarHeart,
  Flame,
  Check,
  ArrowRight,
  Sun,
  Sunrise,
  Sunset,
  Pencil,
  Trash2,
  AlertTriangle,
  Target,
  Quote,
} from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function DashboardShell() {
  const queryClient = useQueryClient();

  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [leaveTask, setLeaveTask] = React.useState<DashboardTask | null>(null);
  const [editTask, setEditTask] = React.useState<DashboardTask | null>(null);
  const [deleteTask, setDeleteTask] = React.useState<DashboardTask | null>(null);
  const [nudgeSent, setNudgeSent] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = React.useState<string>("all");

  // TanStack Query for Dashboard Data
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getDashboard,
    staleTime: 1000 * 30,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 1;
    },
  });

  React.useEffect(() => {
    if ((dashboardError as any)?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("uhc_logged_in");
      }
      window.location.href = "/login";
    }
  }, [dashboardError]);

  // TanStack Query for Partner Data
  const { data: partnerData } = useQuery({
    queryKey: ["partnerSummary"],
    queryFn: dashboardApi.getPartnerSummary,
    staleTime: 1000 * 60,
  });

  // Instant 0ms Optimistic Task Toggle
  const handleToggleTask = async (taskId: number) => {
    queryClient.setQueryData(["dashboard"], (old: DashboardData | undefined) => {
      if (!old) return old;
      const updatedTasks = old.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );
      const completedCount = updatedTasks.filter((t) => t.done).length;
      const totalCount = old.stats.total_tasks || updatedTasks.length;
      const newPercent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      return {
        ...old,
        tasks: updatedTasks,
        stats: {
          ...old.stats,
          completed_tasks: completedCount,
          progress_percent: newPercent,
        },
      };
    });

    try {
      await tasksApi.toggleTask(taskId);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      console.error("Failed to toggle task:", err);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      throw err;
    }
  };

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["partnerSummary"] });
  };

  const handleSendNudge = async () => {
    try {
      await api.post("/notifications/nudge", {
        message: "Thinking of you! Keep up the routine 💪",
      });
      setNudgeSent(true);
      setTimeout(() => setNudgeSent(false), 3000);
    } catch (err) {
      console.error("Failed to send nudge:", err);
    }
  };

  const tasks = dashboard?.tasks ?? [];
  const existingTitles = tasks.map((t) => t.title);
  const user = dashboard?.user;
  const partner = partnerData?.partner;
  const stats = dashboard?.stats;
  const streakDays = stats?.streak_days ?? 0;
  const progressPercent = stats?.progress_percent ?? 0;
  const completedTasks =
    stats?.completed_tasks ?? tasks.filter((t) => t.done).length;
  const totalTasks = stats?.total_tasks ?? tasks.length;

  // Time-based greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Filter and sort tasks chronologically (Time-of-day order)
  const filteredTasks = React.useMemo(() => {
    const list = tasks.filter((t) => {
      if (
        selectedCategory !== "all" &&
        normalizeRoutineCategory(t.category) !== selectedCategory
      ) {
        return false;
      }
      if (selectedTimeOfDay !== "all") {
        if (!t.time_of_day) return false;
        const hour = parseInt(t.time_of_day.split(":")[0], 10);
        if (selectedTimeOfDay === "morning" && (hour < 5 || hour >= 12)) return false;
        if (selectedTimeOfDay === "afternoon" && (hour < 12 || hour >= 17)) return false;
        if (selectedTimeOfDay === "evening" && hour < 17) return false;
      }
      return true;
    });

    // Helper to get minutes from midnight for sorting
    const getTaskMinutes = (t: DashboardTask): number => {
      if (t.time_of_day) {
        const parts = t.time_of_day.split(":");
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1] || "0", 10);
        if (!isNaN(h)) return h * 60 + (isNaN(m) ? 0 : m);
      }
      const titleLower = t.title.toLowerCase();
      if (titleLower.includes("fajr")) return 5 * 60 + 15;
      if (titleLower.includes("dhuhr")) return 13 * 60;
      if (titleLower.includes("asr")) return 16 * 60 + 30;
      if (titleLower.includes("maghrib")) return 18 * 60 + 25;
      if (titleLower.includes("isha")) return 20 * 60;
      if (titleLower.includes("morning") || titleLower.includes("wake")) return 7 * 60;
      if (titleLower.includes("night") || titleLower.includes("sleep") || titleLower.includes("bed")) return 22 * 60;
      return 12 * 60; // Default midday
    };

    return [...list].sort((a, b) => getTaskMinutes(a) - getTaskMinutes(b));
  }, [tasks, selectedCategory, selectedTimeOfDay]);

  // Group by purpose while preserving scheduled-time ordering inside each category.
  const categoryGroupedTasks = React.useMemo(() => {
    const groups = new Map<string, DashboardTask[]>();

    filteredTasks.forEach((task) => {
      const categoryKey = normalizeRoutineCategory(task.category);
      const categoryTasks = groups.get(categoryKey) ?? [];
      categoryTasks.push(task);
      groups.set(categoryKey, categoryTasks);
    });

    const categoryKeys = [
      ...ROUTINE_CATEGORIES.map((category) => category.key).filter((key) =>
        groups.has(key)
      ),
      ...Array.from(groups.keys())
        .filter((key) => !ROUTINE_CATEGORIES.some((category) => category.key === key))
        .sort(),
    ];

    return categoryKeys.map((key) => {
      const category = ROUTINE_CATEGORIES.find((item) => item.key === key);

      return {
        key,
        label: category?.label ?? getRoutineCategoryLabel(key),
        icon: category?.icon ?? "✨",
        description: category?.description ?? "Other routines and tasks",
        tasks: groups.get(key) ?? [],
      };
    });
  }, [filteredTasks]);

  // Unique categories list for tab filters
  const availableCategories = React.useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => {
      cats.add(normalizeRoutineCategory(t.category));
    });
    return [
      ...ROUTINE_CATEGORIES.map((category) => category.key).filter((key) =>
        cats.has(key)
      ),
      ...Array.from(cats)
        .filter((key) => !ROUTINE_CATEGORIES.some((category) => category.key === key))
        .sort(),
    ];
  }, [tasks]);

  if (isDashboardLoading) {
    return (
      <AppShell headerTitle="Today's Overview" headerSubtitle="Loading your habits...">
        <div className="space-y-6 max-w-6xl">
          <div className="h-44 w-full rounded-3xl shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-28 w-full rounded-2xl shimmer" />
              <div className="h-28 w-full rounded-2xl shimmer" />
              <div className="h-28 w-full rounded-2xl shimmer" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-56 w-full rounded-2xl shimmer" />
              <div className="h-40 w-full rounded-2xl shimmer" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerTitle="Today's Overview"
      headerSubtitle={`${greeting}, ${user?.name?.split(" ")[0] || "there"} 👋`}
    >
      {/* MOBILE COUPLE SYNC HEADER (< lg) */}
      {partner ? (
        <div className="lg:hidden rounded-2xl glass-card p-3.5 border border-rose-500/25 bg-rose-500/5 mb-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white font-bold text-xs ring-2 ring-[var(--bg-card)]">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-xs ring-2 ring-[var(--bg-card)]">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {partner.name}
                  </span>
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                    {partnerData?.stats?.percentage ?? 0}%
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                  {partnerData?.stats?.completed ?? 0} of {partnerData?.stats?.total ?? 0} completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={nudgeSent}
                className="flex items-center gap-1 rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-500 active:scale-95 transition-all"
              >
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <span>{nudgeSent ? "Sent!" : "Nudge"}</span>
              </button>
            </div>
          </div>

          {/* Dual mini progress bars */}
          <div className="mt-2.5 grid grid-cols-2 gap-3 text-[10px]">
            <div>
              <div className="flex justify-between text-[var(--text-tertiary)] mb-1">
                <span>You</span>
                <span className="font-bold text-[var(--text-primary)]">{progressPercent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--glass-border)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[var(--text-tertiary)] mb-1">
                <span className="truncate">{partner.name}</span>
                <span className="font-bold text-rose-500">{partnerData?.stats?.percentage ?? 0}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--glass-border)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${partnerData?.stats?.percentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="lg:hidden rounded-2xl glass-card p-3.5 border border-violet-500/20 bg-violet-500/5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Pair with Partner</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Sync routines & habits together</p>
            </div>
          </div>
          <Link
            href="/pairing"
            className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs"
          >
            Pair Now
          </Link>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: ROUTINES & DAILY HABITS (8 cols)                 */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-5">
          {/* Sleek, Compact Hero Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl glass-card p-4 sm:p-6 relative overflow-hidden shadow-lg border border-[var(--glass-border)]"
          >
            {/* Ambient decorative glow */}
            <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-violet-500/12 blur-3xl pointer-events-none" />
            <div className="absolute right-20 -top-10 h-32 w-32 rounded-full bg-rose-500/8 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-muted)] border border-[var(--glass-border)] px-2.5 py-0.5 text-[11px] font-bold text-violet-500 dark:text-violet-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Today&apos;s Momentum</span>
                  </span>
                  {streakDays > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-500">
                      <Flame className="h-3 w-3 fill-amber-500" />
                      <span>{streakDays}d Streak 🔥</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                  {completedTasks} of {totalTasks} Completed
                </h2>
                
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-snug line-clamp-2">
                  {progressPercent === 100
                    ? "🌟 All routines crushed today!"
                    : totalTasks === 0
                    ? "Add your first routine to start building habits together."
                    : `${totalTasks - completedTasks} routines remaining today. Keep going!`}
                </p>

                {/* Atomic Habits Quote - hidden on tiny screens to save height */}
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)] italic pt-0.5">
                  <Quote className="h-3 w-3 shrink-0 opacity-70" />
                  <span className="truncate">&ldquo;You fall to the level of your systems.&rdquo;</span>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="flex items-center shrink-0">
                <div className="relative flex h-16 w-16 sm:h-22 sm:w-22 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path
                      className="text-[var(--glass-border)]"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* User Progress Ring */}
                    <path
                      className="text-violet-500 transition-all duration-700 ease-out"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      style={{ filter: "drop-shadow(0 0 6px rgba(124, 92, 252, 0.35))" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base sm:text-xl font-black tracking-tight gradient-text">
                      {progressPercent}%
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Done
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="relative z-10 mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--glass-border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 shadow-xs"
              />
            </div>
          </motion.div>

          {/* Cycle Status Banner (When Active) */}
          {dashboard?.cycle_status?.is_active && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:p-5 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md">
                  <CalendarHeart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-rose-500 dark:text-rose-400">
                    Cycle Active • Day {dashboard.cycle_status.cycle_day || 1}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Prayer routines are paused and streak is safeguarded automatically.
                  </p>
                </div>
              </div>
              <Link
                href="/period"
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-all press-effect"
              >
                <span>Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}

          {/* Time and category filters are separate; categories describe task purpose. */}
          <div className="space-y-3">
            {/* Time of Day Tabs */}
            <div className="space-y-1.5">
              <p className="px-1 text-[11px] font-bold text-[var(--text-secondary)]">
                Filter by time of day
              </p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: "all", label: "All Day", icon: Sparkles },
                { key: "morning", label: "Morning", icon: Sunrise },
                { key: "afternoon", label: "Afternoon", icon: Sun },
                { key: "evening", label: "Evening", icon: Sunset },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = selectedTimeOfDay === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedTimeOfDay(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 press-effect",
                      active
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                        : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              </div>
            </div>

            {/* Quick Category Jump Bar */}
            {availableCategories.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] px-1">
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-violet-500" />
                    <span>Filter by category:</span>
                  </span>
                  {selectedCategory !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="text-violet-500 hover:underline cursor-pointer"
                    >
                      Clear Filter (Show All)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 press-effect cursor-pointer flex items-center gap-1.5",
                      selectedCategory === "all"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                        : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <span>All ({tasks.length})</span>
                  </button>
                  {availableCategories.map((catKey) => {
                    const count = tasks.filter(
                      (t) => normalizeRoutineCategory(t.category) === catKey
                    ).length;
                    const meta = ROUTINE_CATEGORIES.find((c) => c.key === catKey);
                    const icon = meta?.icon || "✨";
                    const label = meta?.label || catKey;
                    const isActive = selectedCategory === catKey;

                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedCategory(catKey)}
                        className={cn(
                          "rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition-all shrink-0 press-effect cursor-pointer flex items-center gap-1.5",
                          isActive
                            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px]",
                          isActive ? "bg-white/20 text-white" : "bg-[var(--bg-card)] text-[var(--text-tertiary)]"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Routine Task List */}
          {isDashboardLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 w-full rounded-2xl shimmer" />
              ))}
            </div>
          ) : dashboardError ? (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="text-sm text-rose-500 font-semibold">
                {(dashboardError as any)?.status === 0
                  ? "Unable to reach the server"
                  : "Could not load routines"}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto leading-relaxed">
                {(dashboardError as any)?.message ||
                  "Your session may have timed out or connection was interrupted. Try reconnecting or signing in again."}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleRefetch}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                >
                  Retry Connection
                </button>
                <Link
                  href="/login"
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  Sign In Again
                </Link>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-dashed border-[var(--glass-border)] glass-card p-10 sm:p-12 text-center shadow-xs"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-violet-500 mb-4 shadow-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {tasks.length === 0
                  ? "No routines scheduled for today"
                  : "No routines match the current filter"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto leading-relaxed">
                Build healthy habits together with your partner. Browse our pre-built routine packs or create your own custom daily rituals.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/20 press-effect transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Browse Routine Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-3 text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all press-effect"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Custom Task</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {categoryGroupedTasks.map((category, groupIdx) => {
                const catCompleted = category.tasks.filter((t) => t.done).length;
                const catTotal = category.tasks.length;

                return (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.06, duration: 0.35 }}
                    className="space-y-3"
                  >
                    {/* Category Section Header */}
                    <div className="flex items-center justify-between px-1 text-xs font-bold">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                            {category.label}
                          </h3>
                          <p className="text-[11px] font-normal text-[var(--text-tertiary)] -mt-0.5">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                        {catCompleted} / {catTotal} completed
                      </span>
                    </div>

                    {/* Task Cards List */}
                    <div className="space-y-2.5">
                      {category.tasks.map((task, taskIdx) => (
                        <ModernTaskCard
                          key={task.id}
                          task={task}
                          index={taskIdx}
                          onToggle={handleToggleTask}
                          onRequestLeave={(t) => setLeaveTask(t)}
                          onEdit={(t) => setEditTask(t)}
                          onDelete={(t) => setDeleteTask(t)}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: PARTNER SYNC, STREAKS & WIDGETS (4 cols)        */}
        {/* ============================================================ */}
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          {/* Partner Status Card */}
          {partner ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="rounded-2xl lg:rounded-3xl glass-card p-4 sm:p-5 lg:p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                    <Heart className="h-4 w-4 fill-rose-500" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Partner Sync
                  </h3>
                </div>
                <Link
                  href="/partner"
                  className="text-xs font-semibold text-violet-500 hover:text-violet-400 transition-colors"
                >
                  View Details →
                </Link>
              </div>

              {/* Partner Profile */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--glass-border)]">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-sm shadow-sm">
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-card)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {partner.name}
                  </h4>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                    {partnerData?.stats?.percentage ?? 0}% completed today
                  </p>
                </div>
              </div>

              {/* Partner Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-[var(--text-secondary)]">Partner Progress</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {partnerData?.stats?.completed ?? 0} /{" "}
                    {partnerData?.stats?.total ?? 0}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--glass-border)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                    style={{
                      width: `${partnerData?.stats?.percentage ?? 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Nudge Action */}
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={nudgeSent}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs sm:text-sm font-bold text-rose-500 hover:bg-rose-500/15 active:scale-[0.99] transition-all press-effect"
              >
                {nudgeSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">Love Nudge Sent! 💕</span>
                  </>
                ) : (
                  <>
                    <BellRing className="h-4 w-4" />
                    <span>Send Nudge to {partner.name}</span>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="rounded-2xl lg:rounded-3xl glass-card p-4 sm:p-5 lg:p-6 shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white mb-4 shadow-lg glow-accent">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Pair with your Partner
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Share daily progress, approve day passes, and maintain consistency together.
              </p>
              <Link
                href="/pairing"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/20 press-effect transition-all"
              >
                <span>Get Pairing Code</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}

          {/* Consistency Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-2xl lg:rounded-3xl glass-card p-4 sm:p-5 lg:p-6 shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Flame className="h-6 w-6 fill-amber-500 text-amber-500 animate-fire" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                  Consistency Streak
                </span>
                <h4 className="text-xl font-extrabold text-[var(--text-primary)]">
                  {streakDays} Days in a row
                </h4>
              </div>
            </div>

            <p className="mt-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {streakDays > 3
                ? "🔥 Excellent momentum! Complete today's routines to keep your streak alive."
                : "Check off your daily routines to build your streak together."}
            </p>
          </motion.div>

          {/* Routine Library Quick Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="rounded-2xl lg:rounded-3xl glass-card p-4 sm:p-5 lg:p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Routine Library
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
              Explore curated routine templates for couples, Salah, health, and relationship check-ins.
            </p>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] py-3 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-all press-effect"
            >
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span>Explore Templates</span>
            </button>
          </motion.div>
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <RoutineLibraryModal
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onTasksAdded={handleRefetch}
        existingTaskTitles={existingTitles}
      />

      <QuickAddTaskDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onTaskCreated={handleRefetch}
      />

      <LeaveRequestDialog
        task={leaveTask}
        open={Boolean(leaveTask)}
        onOpenChange={(open) => {
          if (!open) setLeaveTask(null);
        }}
        onSubmitted={handleRefetch}
      />

      {editTask && (
        <EditTaskDialog
          task={editTask}
          open={Boolean(editTask)}
          onOpenChange={(open) => {
            if (!open) setEditTask(null);
          }}
          onSaved={() => {
            setEditTask(null);
            handleRefetch();
          }}
        />
      )}

      {deleteTask && (
        <DeleteTaskDialog
          task={deleteTask}
          open={Boolean(deleteTask)}
          onOpenChange={(open) => {
            if (!open) setDeleteTask(null);
          }}
          onDeleted={() => {
            queryClient.setQueryData(["dashboard"], (old: DashboardData | undefined) => {
              if (!old) return old;
              return {
                ...old,
                tasks: old.tasks.filter((t) => t.id !== deleteTask.id),
              };
            });
            setDeleteTask(null);
            handleRefetch();
          }}
        />
      )}
    </AppShell>
  );
}

// Helper to format and resolve time for routines and prayers
function resolveTaskTime(task: {
  title: string;
  time_of_day?: string | null;
  is_prayer?: boolean;
}): { timeString: string; isPrayer: boolean } | null {
  const titleLower = task.title.toLowerCase();
  const isPrayer =
    Boolean(task.is_prayer) ||
    titleLower.includes("fajr") ||
    titleLower.includes("dhuhr") ||
    titleLower.includes("asr") ||
    titleLower.includes("maghrib") ||
    titleLower.includes("isha");

  let raw = task.time_of_day;

  // Fallback to recognized prayer times or title timestamps
  if (!raw || raw.trim() === "") {
    if (titleLower.includes("fajr")) raw = "05:15";
    else if (titleLower.includes("dhuhr")) raw = "13:00";
    else if (titleLower.includes("asr")) raw = "16:30";
    else if (titleLower.includes("maghrib")) raw = "18:25";
    else if (titleLower.includes("isha")) raw = "20:00";
    else {
      const match = task.title.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
      if (match) return { timeString: match[1].trim(), isPrayer: false };
      return null;
    }
  }

  try {
    const parts = raw.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parts[1].slice(0, 2) : "00";
    if (isNaN(hours)) return { timeString: raw, isPrayer };
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return { timeString: `${hours}:${minutes} ${ampm}`, isPrayer };
  } catch {
    return { timeString: raw, isPrayer };
  }
}

/**
 * Modern Task Card — Bigger, Presentable, Adaptive Dark/Light Mode
 */
function ModernTaskCard({
  task,
  index,
  onToggle,
  onRequestLeave,
  onEdit,
  onDelete,
}: {
  task: DashboardTask;
  index: number;
  onToggle: (taskId: number) => Promise<void>;
  onRequestLeave?: (task: DashboardTask) => void;
  onEdit?: (task: DashboardTask) => void;
  onDelete?: (task: DashboardTask) => void;
}) {
  const [isDone, setIsDone] = React.useState(task.done);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setIsDone(task.done);
  }, [task.done]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending || task.is_paused) return;

    const nextDone = !isDone;
    setIsDone(nextDone);
    setIsPending(true);

    try {
      await onToggle(task.id);
    } catch (err) {
      setIsDone(!nextDone);
      console.error("Failed to toggle task:", err);
    } finally {
      setIsPending(false);
    }
  };

  const timeInfo = React.useMemo(() => resolveTaskTime(task), [task]);

  if (task.is_paused) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-[var(--text-tertiary)]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
            <CalendarHeart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {task.icon && <span className="text-base">{task.icon}</span>}
              <p className="text-sm sm:text-base font-semibold text-[var(--text-secondary)] truncate">
                {task.title}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-md">
                Paused for Cycle
              </span>
              {timeInfo && (
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeInfo.timeString}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      onClick={handleToggle}
      className={cn(
        "group flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border transition-all duration-200 cursor-pointer select-none relative shadow-xs",
        isDone
          ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5"
          : "border-[var(--glass-border)] bg-[var(--bg-card)] hover:border-violet-500/30 hover:shadow-sm"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
        {/* Animated Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 active:scale-90",
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white shadow-xs glow-success"
              : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-transparent group-hover:border-violet-500/50"
          )}
          aria-label={isDone ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        >
          <Check
            className={cn(
              "h-3.5 w-3.5 stroke-[3] transition-all duration-200",
              isDone ? "scale-100 opacity-100 animate-check" : "scale-50 opacity-0"
            )}
          />
        </button>

        {/* Task Title & Meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {task.icon && (
              <span className="text-base shrink-0 select-none">
                {task.icon}
              </span>
            )}
            <p
              className={cn(
                "text-xs sm:text-sm font-semibold truncate transition-all duration-150",
                isDone
                  ? "text-[var(--text-muted)] line-through font-normal"
                  : "text-[var(--text-primary)]"
              )}
            >
              {task.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            {task.category && (
              <span className="inline-block rounded-md bg-[var(--bg-hover)] border border-[var(--glass-border)] px-2 py-0.2 text-[9px] font-bold text-[var(--text-secondary)] capitalize">
                {task.category}
              </span>
            )}

            {timeInfo && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border",
                  timeInfo.isPrayer
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
                    : "bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300"
                )}
              >
                <Clock className="h-3 w-3" />
                <span>{timeInfo.timeString}</span>
              </span>
            )}

            {isDone && (
              <span className="text-emerald-500 font-bold text-[11px] flex items-center gap-1">
                ✓ Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isDone && onRequestLeave && !task.is_prayer && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestLeave(task);
            }}
            className="flex items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-violet-500 hover:bg-violet-500/10 hover:border-violet-500/20 transition-all mr-0.5"
            title="Ask partner for a day pass"
          >
            <CalendarOff className="h-3 w-3" />
            <span className="hidden sm:inline">Day Pass</span>
          </button>
        )}

        {/* Edit Button */}
        {onEdit && !task.is_prayer && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-violet-500 hover:bg-violet-500/10 transition-all"
            title="Edit Routine"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete Button */}
        {onDelete && !task.is_prayer && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            title="Delete Routine"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Edit Routine Dialog
 */
function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSaved,
}: {
  task: DashboardTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState(task.title);
  const [category, setCategory] = React.useState(task.category || "Health");
  const [icon, setIcon] = React.useState(task.icon || "✨");
  const [timeOfDay, setTimeOfDay] = React.useState(
    task.time_of_day ? task.time_of_day.slice(0, 5) : ""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const CATEGORIES = ["Health", "Deen", "Study", "Work", "Fitness", "Other"];
  const ICONS = ["✨", "💧", "🕌", "🏃", "📚", "💼", "🌙", "🍎", "🧘", "✍️", "🥗", "🎯"];

  const inputClasses =
    "w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a routine title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await tasksApi.updateTask(task.id, {
        title: title.trim(),
        category,
        icon,
        time_of_day: timeOfDay || undefined,
      });
      onSaved();
    } catch (err: any) {
      setError(err?.message || "Failed to update routine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSave}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Edit Routine</DialogTitle>
          <DialogDescription>
            Update routine details, category, or scheduled time.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Routine Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning workout"
              className={inputClasses}
              required
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-base border transition-all",
                    icon === ic
                      ? "border-violet-500 bg-violet-500/15 scale-105"
                      : "border-[var(--glass-border)] bg-[var(--bg-hover)] hover:border-violet-500/30"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    category.toLowerCase() === cat.toLowerCase()
                      ? "border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-300"
                      : "border-[var(--glass-border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-violet-500/30"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Scheduled Time (Optional)
            </label>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 press-effect transition-all"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

/**
 * Delete Routine Confirmation Dialog
 */
function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
  onDeleted,
}: {
  task: DashboardTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await tasksApi.deleteTask(task.id);
      onDeleted();
    } catch (err: any) {
      if (
        err?.status === 404 ||
        err?.message?.toLowerCase().includes("no query results") ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        onDeleted();
        return;
      }
      setError(err?.message || "Failed to delete routine.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-rose-500/15 p-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Delete Routine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this routine?
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="p-6">
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-medium mb-3">
            {error}
          </div>
        )}
        <p className="text-sm text-[var(--text-secondary)]">
          This will permanently remove <strong className="text-[var(--text-primary)]">&ldquo;{task.title}&rdquo;</strong> from your daily schedule.
        </p>
      </div>

      <DialogFooter>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 disabled:opacity-50 press-effect transition-all"
        >
          {isDeleting ? "Deleting..." : "Delete Routine"}
        </button>
      </DialogFooter>
    </Dialog>
  );
}
