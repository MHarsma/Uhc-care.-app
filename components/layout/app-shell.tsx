"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardApi } from "@/lib/api/dashboard";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ListOrdered,
  HeartHandshake,
  FileText,
  BarChart3,
  Settings,
  Heart,
  Plus,
  BellRing,
  CheckCircle2,
  LogOut,
  Sparkles,
  Flame,
  Menu,
  X,
  CalendarHeart,
  Dumbbell,
} from "lucide-react";
import { QuickAddTaskDialog } from "@/components/routine-library/quick-add-task-dialog";
import { RoutineLibraryModal } from "@/components/routine-library/routine-library-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AppShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerAction?: React.ReactNode;
}

export function AppShell({
  children,
  headerTitle,
  headerSubtitle,
  headerAction,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const [nudgeSent, setNudgeSent] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch Dashboard & Partner Data
  const {
    data: dashboard,
    error: dashboardError,
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getDashboard,
    staleTime: 1000 * 30,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 1;
    },
  });

  const isAuthError = (dashboardError as any)?.status === 401;

  React.useEffect(() => {
    if (isAuthError) {
      router.push("/login");
    }
  }, [isAuthError, router]);

  const { data: partnerData } = useQuery({
    queryKey: ["partnerSummary"],
    queryFn: dashboardApi.getPartnerSummary,
    staleTime: 1000 * 60,
  });

  const user = dashboard?.user;
  const partner = partnerData?.partner;
  const streakDays = dashboard?.stats?.streak_days ?? 0;
  const pendingLeaves = partnerData?.pending_leave_requests?.length ?? 0;
  const existingTitles = (dashboard?.tasks ?? []).map((t) => t.title);

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

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["partnerSummary"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const navItems = [
    {
      id: "today",
      label: "Today's Routine",
      shortLabel: "Today",
      href: "/dashboard",
      icon: CalendarCheck,
    },
    {
      id: "tasks",
      label: "All Routines",
      shortLabel: "Routines",
      href: "/tasks",
      icon: ListOrdered,
    },
    {
      id: "partner",
      label: "Partner Space",
      shortLabel: "Partner",
      href: "/partner",
      icon: HeartHandshake,
      badge: pendingLeaves > 0 ? pendingLeaves : undefined,
    },
    {
      id: "notes",
      label: "Shared Notes",
      shortLabel: "Notes",
      href: "/notes",
      icon: FileText,
    },
    {
      id: "period",
      label: "Cycle & Care",
      shortLabel: "Cycle",
      href: "/period",
      icon: CalendarHeart,
      show: user?.is_female || dashboard?.cycle_status?.is_active,
      badge: dashboard?.cycle_status?.is_active ? "Active" : undefined,
    },
    {
      id: "fitness",
      label: "Fitness & Health",
      shortLabel: "Fitness",
      href: "/fitness",
      icon: Dumbbell,
    },
    {
      id: "analytics",
      label: "Analytics & Streaks",
      shortLabel: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      shortLabel: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.show !== false);

  // Today formatted string
  const todayFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col lg:flex-row antialiased transition-colors duration-200">
      {/* ============================================================ */}
      {/* DESKTOP & TABLET SIDEBAR (>= lg)                             */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col w-[245px] shrink-0 border-r border-[var(--glass-border)] bg-[var(--bg-card)] sticky top-0 h-screen z-30 transition-colors duration-200">
        {/* Brand Header */}
        <div className="p-4 pb-3 border-b border-[var(--glass-border)] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 text-white font-black text-base shadow-md glow-accent group-hover:scale-105 transition-transform">
              U
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                  UHC Care
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 pulse-live" />
              </div>
              <p className="text-[10px] font-medium text-[var(--text-tertiary)]">
                Couple Routine OS
              </p>
            </div>
          </Link>
        </div>

        {/* Partner Connection Widget */}
        <div className="px-3 pt-4 pb-2">
          {partner ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-xs shadow-sm">
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--bg-card)] text-[9px]">
                      ❤️
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {partner.name}
                    </p>
                    <p className="text-[11px] font-medium text-rose-500">
                      {partnerData?.stats?.percentage ?? 0}% today
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendNudge}
                  disabled={nudgeSent}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 active:scale-95 transition-all"
                  title="Send quick nudge"
                >
                  {nudgeSent ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  )}
                </button>
              </div>

              {/* Mini progress bar */}
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-rose-500/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${partnerData?.stats?.percentage ?? 0}%` }}
                />
              </div>
            </div>
          ) : (
            <Link
              href="/pairing"
              className="group flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    Pair with Partner
                  </p>
                  <p className="text-[11px] text-violet-500 font-medium">
                    Sync routines →
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Primary Navigation Menu */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-all group-hover:scale-105",
                      isActive ? "text-violet-500 stroke-[2.2]" : "text-[var(--text-tertiary)]"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[9px] font-bold",
                      isActive
                        ? "bg-violet-500/20 text-violet-600 dark:text-violet-300"
                        : "bg-rose-500/20 text-rose-500"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Add Action */}
        <div className="p-3 border-t border-[var(--glass-border)] space-y-1.5">
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 press-effect transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Routine</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
          >
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span>Browse Library</span>
          </button>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 pt-2 border-t border-[var(--glass-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold text-xs border border-[var(--glass-border)]">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {user?.name || "Account"}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                {user?.city || "Active"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE TOP BAR (< lg)                                        */}
      {/* ============================================================ */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-black text-sm shadow-sm">
              U
            </div>
            <span className="font-bold text-sm text-[var(--text-primary)]">UHC Care</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {streakDays > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-500">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-fire" />
              <span>{streakDays}d</span>
            </div>
          )}

          {partner && (
            <button
              type="button"
              onClick={handleSendNudge}
              disabled={nudgeSent}
              className="flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-500 active:scale-95 transition-all"
            >
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
              <span>{nudgeSent ? "Sent!" : "Nudge"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm active:scale-95"
            aria-label="Add routine"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE DRAWER OVERLAY (< lg)                                 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-72 bg-[var(--bg-card)] h-full shadow-2xl flex flex-col relative z-10 border-r border-[var(--glass-border)]"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold">
                    U
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">UHC Care</h3>
                    <p className="text-[11px] text-[var(--text-tertiary)]">Couple Routine</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Navigation */}
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-none">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/20 font-semibold"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isActive ? "text-violet-500" : "text-[var(--text-tertiary)]")} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-[10px] font-bold text-rose-500">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--glass-border)] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold text-xs border border-[var(--glass-border)]">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {user?.name || "Account"}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MAIN CONTENT WORKSPACE                                       */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Desktop Sticky Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-3 backdrop-blur-xl transition-colors duration-200">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
              {headerTitle || "Dashboard"}
            </h1>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">
              {headerSubtitle || todayFormatted}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {/* Streak Pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-500">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-fire" />
              <span>{streakDays} Day Streak</span>
            </div>

            {/* Send Nudge Button */}
            {partner && (
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={nudgeSent}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-500 hover:bg-rose-500/15 active:scale-95 transition-all"
              >
                {nudgeSent ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Nudge Sent!</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                    <span>Send Love Nudge</span>
                  </>
                )}
              </button>
            )}

            {/* Custom Header Action or Default Add Routine CTA */}
            {headerAction ? (
              headerAction
            ) : (
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>New Routine</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-6xl w-full mx-auto pb-20 lg:pb-10">
          {children}
        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION (< lg)                              */}
      {/* ============================================================ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl px-2 py-1.5 transition-colors duration-200">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: "today", label: "Today", href: "/dashboard", icon: CalendarCheck },
            { id: "tasks", label: "Routines", href: "/tasks", icon: ListOrdered },
            {
              id: "partner",
              label: "Partner",
              href: "/partner",
              icon: HeartHandshake,
              badge: pendingLeaves > 0 ? pendingLeaves : undefined,
            },
            { id: "fitness", label: "Fitness", href: "/fitness", icon: Dumbbell },
            { id: "notes", label: "Notes", href: "/notes", icon: FileText },
            { id: "settings", label: "Settings", href: "/settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all",
                  isActive
                    ? "text-violet-500 font-bold"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-all",
                      isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                    )}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Routine Library Modal */}
      <RoutineLibraryModal
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onTasksAdded={handleRefetch}
        existingTaskTitles={existingTitles}
      />

      {/* Quick Add Task Dialog */}
      <QuickAddTaskDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onTaskCreated={handleRefetch}
      />
    </div>
  );
}
