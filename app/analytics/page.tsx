"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, AnalyticsData } from "@/lib/api/analytics";
import { AppShell } from "@/components/layout/app-shell";
import {
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  BarChart3,
  Layers,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsApi.getAnalytics,
    staleTime: 1000 * 60,
  });

  const [selectedHeatmapDay, setSelectedHeatmapDay] = React.useState<string | null>(null);

  const overview = analytics?.overview;
  const weeklyTrend = analytics?.weekly_trend ?? [];
  const monthlyHeatmap = analytics?.monthly_heatmap ?? [];
  const categories = analytics?.category_breakdown ?? [];
  const partner = analytics?.partner;

  return (
    <AppShell
      headerTitle="Analytics & Insights"
      headerSubtitle="Habit consistency, couple streaks & completion trends"
    >
      <div className="space-y-6 max-w-6xl">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-44 rounded-3xl shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 rounded-3xl shimmer" />
              <div className="h-64 rounded-3xl shimmer" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-500 space-y-3">
            <p className="font-bold text-base">Failed to load analytics</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* 1. Hero Streak & Stats Bar with High-Contrast Workout Glow */}
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 p-6 sm:p-8 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden border border-white/20">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-rose-500/25 blur-3xl" />
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Streak */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                    <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>Current Streak</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      {overview?.current_streak ?? 0}
                    </span>
                    <span className="text-sm font-semibold text-indigo-200">days</span>
                  </div>
                </div>

                {/* 7-Day Completion Rate */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                    <TrendingUp className="h-4 w-4 text-emerald-300" />
                    <span>7-Day Completion</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      {overview?.weekly_completion_rate ?? 0}%
                    </span>
                    <span className="text-sm font-semibold text-indigo-200">rate</span>
                  </div>
                </div>

                {/* Best Streak / Lifetime */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                    <Trophy className="h-4 w-4 fill-amber-300 text-amber-300" />
                    <span>Best Streak</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      {overview?.best_streak ?? 0}
                    </span>
                    <span className="text-sm font-semibold text-indigo-200">days max</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly 7-Day Performance Trend */}
              <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-sm glass-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        7-Day Routine Trend
                      </h3>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        Daily completion percentages
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-300">
                    {overview?.weekly_completion_rate ?? 0}% Avg
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2">
                  {weeklyTrend.map((day) => {
                    const percent = day.completion_percent;
                    const isToday = day.is_today;

                    return (
                      <div
                        key={day.date}
                        className={cn(
                          "flex flex-col items-center p-2.5 rounded-2xl transition-all border",
                          isToday
                            ? "bg-violet-500/10 border-violet-500/40 shadow-xs"
                            : "bg-[var(--glass-bg)] border-[var(--glass-border)]"
                        )}
                      >
                        <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                          {day.day_name}
                        </span>

                        {/* Visual Progress Bar */}
                        <div className="my-3 h-20 w-3 rounded-full bg-[var(--bg-hover)] flex flex-col justify-end overflow-hidden">
                          <div
                            style={{ height: `${percent}%` }}
                            className={cn(
                              "w-full transition-all duration-500 rounded-full",
                              percent === 100
                                ? "bg-emerald-500"
                                : percent > 50
                                ? "bg-violet-500"
                                : "bg-amber-500"
                            )}
                          />
                        </div>

                        <span className="text-[11px] font-extrabold text-[var(--text-primary)]">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Heatmap */}
              <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-sm glass-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        28-Day Consistency Heatmap
                      </h3>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        Past 4 weeks activity overview
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-1">
                  {monthlyHeatmap.map((day) => {
                    const levelColors = [
                      "bg-[var(--glass-bg)] text-[var(--text-tertiary)] border border-[var(--glass-border)]",
                      "bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/30",
                      "bg-violet-500/40 text-violet-800 dark:text-violet-200 border border-violet-500/50",
                      "bg-violet-600 text-white shadow-xs",
                      "bg-violet-700 text-white shadow-sm font-black",
                    ];
                    const isSelected = selectedHeatmapDay === day.date;

                    return (
                      <button
                        type="button"
                        key={day.date}
                        onClick={() =>
                          setSelectedHeatmapDay(isSelected ? null : day.date)
                        }
                        className={cn(
                          "relative flex flex-col items-center justify-center h-10 rounded-xl font-bold text-xs transition-transform active:scale-95 focus:outline-none",
                          levelColors[day.level] || levelColors[0],
                          day.is_today && "ring-2 ring-violet-500 ring-offset-2 ring-offset-[var(--bg-primary)]",
                          isSelected && "scale-105 shadow-md"
                        )}
                        title={`${day.date}: ${day.completed_count}/${day.total_count} routines (${day.completion_percent}%)`}
                      >
                        <span>{day.day_number}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedHeatmapDay && (
                  (() => {
                    const sel = monthlyHeatmap.find((d) => d.date === selectedHeatmapDay);
                    if (!sel) return null;
                    return (
                      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-xs text-[var(--text-primary)] flex items-center justify-between animate-fade-scale">
                        <div>
                          <span className="font-bold text-violet-600 dark:text-violet-400">{sel.date}</span>: {sel.completed_count} of {sel.total_count} routines completed ({sel.completion_percent}%)
                        </div>
                        <button
                          onClick={() => setSelectedHeatmapDay(null)}
                          className="text-[10px] font-bold text-violet-500 hover:text-violet-600 underline ml-2"
                        >
                          Close
                        </button>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            {categories.length > 0 && (
              <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-sm glass-card space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Performance by Category
                    </h3>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      Completion rate across different habit types
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] capitalize">
                          {cat.category}
                        </span>
                        <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                          {cat.completion_percent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-hover)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                          style={{ width: `${cat.completion_percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
