"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Flame, Sparkles, Plus, Heart } from "lucide-react";
import { PartnerData } from "@/lib/api/dashboard";
import Link from "next/link";

interface DashboardHeaderProps {
  userName: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  streakDays: number;
  partnerData?: PartnerData | null;
  onOpenLibrary: () => void;
  onOpenQuickAdd: () => void;
}

export function DashboardHeader({
  userName,
  totalTasks,
  completedTasks,
  progressPercent,
  streakDays,
  partnerData,
  onOpenLibrary,
  onOpenQuickAdd,
}: DashboardHeaderProps) {
  // Contextual greeting based on hour
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  const motivationalSnippet = React.useMemo(() => {
    if (totalTasks === 0) return "Ready to plan your daily routine?";
    if (progressPercent === 100) return "🌟 Incredible job! All daily routines completed!";
    if (progressPercent >= 75) return "🔥 Almost there! Keep up this great energy.";
    if (progressPercent >= 50) return "💪 Halfway through today's goals!";
    if (progressPercent > 0) return "🚀 Great momentum so far!";
    return "🌅 Start with one small win this morning.";
  }, [totalTasks, progressPercent]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top bar: Greeting, Date, Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                {formattedDate}
              </span>
              {streakDays > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                  <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>{streakDays} day streak</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              {greeting}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {motivationalSnippet}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenLibrary}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              <Sparkles className="h-4 w-4 text-violet-300" />
              <span>Routine Library</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenQuickAdd}
              className="bg-violet-500 hover:bg-violet-600 shadow-md shadow-violet-500/30"
            >
              <Plus className="h-4 w-4" />
              <span>Add Routine</span>
            </Button>
          </div>
        </div>

        {/* Middle: Progress Meter & Stats */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 backdrop-blur-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Today&apos;s Progress</span>
              <span className="text-xs text-slate-400">
                ({completedTasks} of {totalTasks} completed)
              </span>
            </div>
            <span className="font-black text-violet-300 text-base sm:text-lg">
              {progressPercent}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Banner: Partner Accountability Glance */}
        {partnerData?.partner && (
          <div className="flex items-center justify-between rounded-xl bg-violet-500/15 border border-violet-400/20 px-4 py-2.5 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-400/20 text-violet-200 font-bold text-[10px]">
                {partnerData.partner.name.charAt(0).toUpperCase()}
              </span>
              <span>
                <strong>{partnerData.partner.name}&apos;s</strong> routine:{" "}
                <span className="text-violet-300 font-medium">
                  {partnerData.stats?.completed ?? 0} of{" "}
                  {partnerData.stats?.total ?? 0} done (
                  {partnerData.stats?.percentage ?? 0}%)
                </span>
              </span>
            </div>
            <Link
              href="/partner"
              className="text-xs font-semibold text-violet-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Heart className="h-3 w-3 text-pink-400" />
              <span>View Partner</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
