"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  Heart,
  BellRing,
  Check,
  X,
  UserCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  CalendarOff,
  CalendarHeart,
  Send,
  MessageCircleHeart,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Flame,
  Activity,
  Droplets,
  Dumbbell,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { periodApi, PeriodsResponse } from "@/lib/api/period";
import { cn } from "@/lib/utils";

type PartnerTask = {
  id: number;
  title: string;
  category?: string | null;
  time_of_day?: string | null;
  is_prayer?: boolean;
  is_paused?: boolean;
  done: boolean;
  completed_at?: string | null;
};

type PartnerData = {
  partner: { id?: number; name: string } | null;
  stats: { total: number; completed: number; percentage: number } | null;
  partner_cycle_status?: { is_resting?: boolean; label?: string } | null;
  partner_tasks?: PartnerTask[];
  partner_fitness?: {
    active_calories: number;
    exercise_minutes: number;
    water_glasses: number;
  } | null;
  pending_leave_requests: Array<{
    id: number;
    reason: string | null;
    task?: { title: string; category?: string };
  }>;
};

function formatCompletedAt(completedAt: string | null | undefined): string | null {
  if (!completedAt) return null;
  try {
    const date = new Date(completedAt);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return null;
  }
}

export default function PartnerPage() {
  const [data, setData] = React.useState<PartnerData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [nudgeSent, setNudgeSent] = React.useState(false);
  const [customNudge, setCustomNudge] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState<number | null>(null);

  const [partnerPeriod, setPartnerPeriod] = React.useState<PeriodsResponse | null>(null);

  const loadPartnerData = React.useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const [partnerRes, periodRes] = await Promise.allSettled([
        api.get<PartnerData>("/partner"),
        periodApi.getPeriods(),
      ]);

      if (partnerRes.status === "fulfilled") {
        setData(partnerRes.value);
      } else {
        throw partnerRes.reason;
      }

      if (periodRes.status === "fulfilled") {
        setPartnerPeriod(periodRes.value);
      }
    } catch (err) {
      setData(null);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Unable to load partner data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPartnerData();
  }, [loadPartnerData]);

  const handleSendNudge = async (customMessage?: string) => {
    try {
      await api.post("/notifications/nudge", {
        message: customMessage || customNudge || "Thinking of you! Keep up the routine 💪",
      });
      setNudgeSent(true);
      setCustomNudge("");
      setTimeout(() => setNudgeSent(false), 3500);
    } catch (err) {
      console.error("Failed to send nudge:", err);
    }
  };

  const handleRespondLeave = async (
    leaveRequestId: number,
    status: "approved" | "rejected"
  ) => {
    setActionLoading(leaveRequestId);
    try {
      await api.patch(`/leave-requests/${leaveRequestId}`, { status });
      await loadPartnerData();
    } catch (err) {
      console.error("Failed to update leave request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const partner = data?.partner;
  const stats = data?.stats;
  const percentage = stats?.percentage ?? 0;
  const partnerTasks = data?.partner_tasks ?? [];
  const pendingRequests = data?.pending_leave_requests ?? [];

  const isPartnerOnActivePeriod = Boolean(
    partnerPeriod?.active_summary?.has_active_period || data?.partner_cycle_status?.is_resting
  );

  const visiblePartnerTasks = React.useMemo(() => {
    if (!isPartnerOnActivePeriod) return partnerTasks;
    return partnerTasks.filter((t) => !t.is_prayer);
  }, [partnerTasks, isPartnerOnActivePeriod]);

  const presetNudges = [
    "Thinking of you! Keep going strong 💕",
    "Time for your afternoon habit check-in ✨",
    "Proud of your consistency today! 🌟",
    "Don't forget to take a break and hydrate 💧",
  ];

  return (
    <AppShell
      headerTitle="Partner Hub"
      headerSubtitle="Couple accountability, real-time routines & love nudges"
      headerAction={
        partner ? (
          <Link
            href="/pairing"
            className="flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-3.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>Pairing Settings</span>
          </Link>
        ) : null
      }
    >
      {loading ? (
        <div className="space-y-6 max-w-4xl">
          <div className="h-44 w-full rounded-3xl shimmer" />
          <div className="h-32 w-full rounded-3xl shimmer" />
        </div>
      ) : loadError ? (
        /* Error State Card */
        <div className="max-w-2xl mx-auto rounded-3xl border border-rose-500/25 bg-rose-500/5 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">
            Unable to load partner data
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] max-w-md mx-auto leading-relaxed">
            {loadError}
          </p>
          <div className="pt-2">
            <button
              onClick={() => loadPartnerData()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      ) : !partner ? (
        /* Not Paired Card */
        <div className="max-w-2xl mx-auto rounded-3xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-card)] p-10 text-center shadow-sm glass-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white mb-4 shadow-lg shadow-rose-500/25">
            <Heart className="h-8 w-8 fill-white" />
          </div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
            No partner paired yet
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-1 max-w-md mx-auto leading-relaxed">
            Track daily spiritual and wellness routines together, share streak progress, and approve day passes for each other.
          </p>
          <div className="mt-6">
            <Link
              href="/pairing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all press-effect"
            >
              <span>Pair with Partner Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl">
          {/* ============================================================ */}
          {/* LEFT: PARTNER PROGRESS & LEAVE REQUESTS (7 cols)             */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hero Partner Overview Card */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white font-black text-2xl backdrop-blur-md border border-white/30 shadow-inner">
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] ring-4 ring-rose-500 shadow-xs">
                      ✓
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        {partner.name}
                      </h2>
                    </div>
                    <p className="text-xs text-rose-100 mt-0.5">
                      {percentage === 100
                        ? "🌟 All daily routines completed today!"
                        : `${stats?.completed ?? 0} of ${stats?.total ?? 0} routines completed today`}
                    </p>
                  </div>
                </div>

                {/* Circular Percentage Ring */}
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center self-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/20"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-white transition-all duration-700 ease-out"
                      strokeDasharray={`${percentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-base font-black tracking-tight text-white">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Partner's Live Daily Movement & Fitness Card */}
            <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {partner.name}&apos;s Daily Movement & Fitness
                    </h3>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      Live sync of workouts, active calories, and hydration
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 p-3 sm:p-4">
                  <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-extrabold text-amber-500">
                    <Flame className="h-4 w-4" />
                    <span>{data?.partner_fitness?.active_calories ?? 0}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">Calories</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Active kcal burned</p>
                </div>

                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 p-3 sm:p-4">
                  <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-extrabold text-emerald-500">
                    <Activity className="h-4 w-4" />
                    <span>{data?.partner_fitness?.exercise_minutes ?? 0}m</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">Movement</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Exercise minutes</p>
                </div>

                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 p-3 sm:p-4">
                  <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-extrabold text-sky-400">
                    <Droplets className="h-4 w-4" />
                    <span>{data?.partner_fitness?.water_glasses ?? 0}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">Hydration</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Glasses of water</p>
                </div>
              </div>
            </div>

            {/* Partner Cycle & Care Widget */}
            {partnerPeriod?.is_partner_view && (
              <div className="rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-transparent p-5 sm:p-6 shadow-sm glass-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                      <CalendarHeart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {partner.name}&apos;s Cycle & Wellness Care
                      </h3>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        {partnerPeriod.period_tracking_enabled
                          ? "Real-time cycle sync & support guidance"
                          : "Period sharing is currently disabled"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/period"
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    <span>Full Calendar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {partnerPeriod.period_tracking_enabled ? (
                  partnerPeriod.periods.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-300">
                          <span>🌸</span>
                          <span>
                            {partnerPeriod.active_summary?.has_active_period
                              ? `Active Period • Day ${(() => {
                                  const sDate = (partnerPeriod.active_summary as any)?.start_date || partnerPeriod.periods[0]?.start_date;
                                  if (sDate) {
                                    const [y, m, d] = String(sDate).split("-").map(Number);
                                    const startUtc = Date.UTC(y, m - 1, d);
                                    const now = new Date();
                                    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
                                    const diff = Math.floor((todayUtc - startUtc) / 86400000) + 1;
                                    if (diff >= 1) return diff;
                                  }
                                  return partnerPeriod.active_summary.current_cycle_day || 1;
                                })()}`
                              : partnerPeriod.active_summary?.current_cycle_day
                              ? `Cycle Day ${partnerPeriod.active_summary.current_cycle_day}`
                              : "Cycle Active"}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                          <Heart className="h-3 w-3 fill-violet-400 text-violet-400" />
                          <span>Supporting Her</span>
                        </span>
                      </div>

                      <div className="rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3.5">
                        <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                          Care suggestion for today:
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {partnerPeriod.active_summary?.has_active_period
                            ? `Be extra caring today. Offer a warm drink, help with evening chores, and give ${partner.name} space to rest.`
                            : `Check in with ${partner.name} today and share an encouraging note or compliment on her daily consistency!`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3.5 text-xs text-[var(--text-tertiary)]">
                      {partner.name} has enabled period sharing. Once she logs her period start date in Cycle Care, her real-time cycle phase and support tips will appear here.
                    </div>
                  )
                ) : (
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-700 dark:text-amber-300">
                    {partner.name} hasn&apos;t turned on Period Sharing yet. Gently ask her to enable it in <strong>Settings → Cycle & Period Care Sharing</strong> if she would like you to see her cycle updates.
                  </div>
                )}
              </div>
            )}

            {/* Pending Leave Passes Section */}
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                      <CalendarOff className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Day Pass Requests ({pendingRequests.length})
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Requested Pass
                          </span>
                          <h4 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                            {req.task?.title || "Routine Item"}
                          </h4>
                          {req.reason && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                              &ldquo;{req.reason}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRespondLeave(req.id, "approved")}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespondLeave(req.id, "rejected")}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-[var(--bg-card)] hover:bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-500 transition-all disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner's Live Routines Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {partner.name}&apos;s Daily Checklist ({visiblePartnerTasks.length})
                </h3>
              </div>

              {visiblePartnerTasks.length === 0 ? (
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 text-center text-xs text-[var(--text-tertiary)] glass-card">
                  No routines found for {partner.name} today.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visiblePartnerTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-2xl border transition-all glass-card",
                        task.done
                          ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
                          : "border-[var(--glass-border)] bg-[var(--bg-card)]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs",
                            task.done
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-transparent"
                          )}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>

                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-xs font-semibold truncate",
                              task.done ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"
                            )}
                          >
                            {task.title}
                          </p>
                          {task.category && (
                            <span className="text-[10px] text-[var(--text-tertiary)] capitalize">
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {task.done && task.completed_at && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          ✓ {formatCompletedAt(task.completed_at)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: LOVE NUDGES & INTERACTIONS (5 cols)                  */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Nudges Box */}
            <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-sm glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                    <MessageCircleHeart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Send Love Nudge
                    </h3>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      Send instant appreciation to {partner.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Quick Presets
                </span>
                <div className="flex flex-col gap-2">
                  {presetNudges.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendNudge(preset)}
                      className="w-full text-left rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] hover:border-rose-500/30 p-3 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center justify-between group active:scale-[0.99]"
                    >
                      <span>{preset}</span>
                      <Send className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-rose-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Nudge Form */}
              <div className="pt-2 border-t border-[var(--glass-border)]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                  Custom Message
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customNudge}
                    onChange={(e) => setCustomNudge(e.target.value)}
                    placeholder="Write something sweet..."
                    className="flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendNudge(customNudge)}
                    disabled={!customNudge.trim()}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 disabled:opacity-40 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-violet-500/20 active:scale-95"
                  >
                    Send
                  </button>
                </div>
              </div>

              {nudgeSent && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-scale">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Nudge successfully sent to {partner.name}! 💕</span>
                </div>
              )}
            </div>

            {/* Couple Notes Quick Link */}
            <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-sm glass-card flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Shared Moments & Notes
                </h4>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Leave cute reminders, memories, and shared to-do lists.
                </p>
              </div>
              <Link
                href="/notes"
                className="flex items-center gap-1 rounded-xl bg-violet-500/10 border border-violet-500/20 px-3.5 py-2 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-all shrink-0"
              >
                <span>Open Notes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
