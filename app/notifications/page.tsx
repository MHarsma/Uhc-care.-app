"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  Droplet,
  FileText,
  Activity,
  CheckCircle2,
  Volume2,
  CalendarHeart,
  Sparkles,
  BellOff,
  BellRing,
  Clock,
  Filter,
  Shield,
  Smartphone,
  Info,
  RefreshCw,
  Search,
  Check,
  Send,
  ExternalLink,
  ChevronRight,
  Flame,
  Coffee,
  AlertCircle,
  Settings,
  ArrowLeft,
  Inbox,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  notificationsApi,
  NotificationItem,
  getNotificationPermission,
  requestNotificationPermission,
  triggerDeviceNotification,
} from "@/lib/api/notifications";

type TabFilter = "all" | "unread" | "love" | "habits" | "system";

const PRESET_NUDGES = [
  { text: "Thinking of you ❤️", emoji: "❤️" },
  { text: "Sending you a warm hug 🤗", emoji: "🤗" },
  { text: "Stay hydrated & drink water! 💧", emoji: "💧" },
  { text: "So proud of your efforts today ✨", emoji: "✨" },
  { text: "Take a deep breath and smile 😊", emoji: "😊" },
];

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

function getTimeGroup(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This Week";
    return "Earlier";
  } catch {
    return "Earlier";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("unsupported");
  const [sendingNudge, setSendingNudge] = React.useState(false);
  const [nudgeFeedback, setNudgeFeedback] = React.useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = React.useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = React.useState<string | null>(null);

  // Sync notification permissions
  React.useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const loadNotifications = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await notificationsApi.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnablePermissions = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === "granted") {
      triggerDeviceNotification("UHC Care Alerts Connected ❤️", {
        body: "Realtime updates, love nudges, and routine syncs will appear here instantly.",
      });
    }
  };

  const handleTestAlert = async () => {
    setTestNotificationFeedback("Sending test alert...");
    const ok = await triggerDeviceNotification("UHC Care Test Alert ❤️", {
      body: "Haptics, sound, and notification delivery are working perfectly on this device!",
    });
    if (ok) {
      setTestNotificationFeedback("Test alert sent to your device tray!");
    } else {
      setTestNotificationFeedback("Alert triggered in browser.");
    }
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  const handleSendNudge = async (presetText?: string) => {
    setSendingNudge(true);
    setNudgeFeedback(null);
    try {
      const res = await notificationsApi.sendNudge();
      setNudgeFeedback(
        presetText
          ? `Sent "${presetText}" to your partner!`
          : res.message || "Love nudge sent!"
      );
      loadNotifications(true);
    } catch (err: any) {
      setNudgeFeedback(err?.message || "Could not send nudge right now.");
    } finally {
      setSendingNudge(false);
      setTimeout(() => setNudgeFeedback(null), 4000);
    }
  };

  // Filter calculations
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === "unread" && item.read_at) return false;
      if (activeTab === "love") {
        const t = (item.data?.type || item.type || "").toLowerCase();
        if (!t.includes("nudge") && !t.includes("love") && !t.includes("heart") && !t.includes("partner")) {
          return false;
        }
      }
      if (activeTab === "habits") {
        const t = (item.data?.type || item.type || "").toLowerCase();
        if (!t.includes("task") && !t.includes("routine") && !t.includes("streak") && !t.includes("fitness")) {
          return false;
        }
      }
      if (activeTab === "system") {
        const t = (item.data?.type || item.type || "").toLowerCase();
        if (t.includes("nudge") || t.includes("love") || t.includes("task") || t.includes("routine")) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (item.data?.title || "").toLowerCase();
        const msg = (item.data?.message || "").toLowerCase();
        const sender = (item.data?.sender_name || "").toLowerCase();
        if (!title.includes(q) && !msg.includes(q) && !sender.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const loveCount = notifications.filter((n) => {
      const t = (n.data?.type || n.type || "").toLowerCase();
      return t.includes("nudge") || t.includes("love") || t.includes("heart");
    }).length;

    const habitCount = notifications.filter((n) => {
      const t = (n.data?.type || n.type || "").toLowerCase();
      return t.includes("task") || t.includes("routine") || t.includes("streak");
    }).length;

    return {
      total: notifications.length,
      unread: unreadCount,
      love: loveCount,
      habits: habitCount,
    };
  }, [notifications, unreadCount]);

  // Group by time category
  const groupedNotifications = React.useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {};
    for (const item of filteredNotifications) {
      const group = getTimeGroup(item.created_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    }
    return groups;
  }, [filteredNotifications]);

  const renderIcon = (type: string, data: any, size: "sm" | "md" = "md") => {
    const notifType = (data?.type || type || "").toLowerCase();
    const sz = size === "sm" ? "h-9 w-9" : "h-11 w-11";
    const iconSz = size === "sm" ? "h-4 w-4" : "h-5 w-5";

    if (notifType.includes("nudge") || notifType.includes("love")) {
      return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20", sz)}>
          <Heart className={cn(iconSz, "fill-white")} />
        </div>
      );
    }
    if (notifType.includes("period") || notifType.includes("cycle")) {
      return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/20", sz)}>
          <CalendarHeart className={iconSz} />
        </div>
      );
    }
    if (notifType.includes("task") || notifType.includes("routine")) {
      return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20", sz)}>
          <CheckCircle2 className={iconSz} />
        </div>
      );
    }
    if (notifType.includes("streak")) {
      return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20", sz)}>
          <Flame className={iconSz} />
        </div>
      );
    }
    if (notifType.includes("water") || notifType.includes("hydrate")) {
      return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-500/20", sz)}>
          <Droplet className={iconSz} />
        </div>
      );
    }
    if (notifType.includes("note")) {
      return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20", sz)}>
          <FileText className={iconSz} />
        </div>
      );
    }
    return (
      <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20", sz)}>
        <Bell className={iconSz} />
      </div>
    );
  };

  const tabData = [
    { id: "all", label: "All", count: stats.total },
    { id: "unread", label: "Unread", count: stats.unread },
    { id: "love", label: "❤️ Love", count: stats.love },
    { id: "habits", label: "🌿 Habits", count: stats.habits },
    { id: "system", label: "🔔 System" },
  ];

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">

        {/* ─── Page Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Notifications
                </h1>
                <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
                  Stay connected with partner updates, routines & reminders
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15 px-3 py-2 text-xs font-bold text-violet-600 dark:text-violet-300 transition-all cursor-pointer active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Read all</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSendNudge()}
              disabled={sendingNudge}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Heart className="h-3.5 w-3.5 fill-white" />
              <span>{sendingNudge ? "Sending..." : "Send Nudge"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        <AnimatePresence>
          {nudgeFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3.5 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{nudgeFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNudgeFeedback(null)}
                  className="text-emerald-500 hover:text-emerald-400 p-1 rounded-lg hover:bg-emerald-500/10 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, icon: <Inbox className="h-4 w-4" />, color: "text-[var(--text-tertiary)]" },
            { label: "Unread", value: stats.unread, icon: <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />, color: "text-violet-500" },
            { label: "Partner", value: stats.love, icon: <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />, color: "text-rose-500" },
            { label: "Habits", value: stats.habits, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, color: "text-emerald-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 flex items-center justify-between group hover:border-violet-500/20 transition-colors"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {stat.label}
                </p>
                <p className={cn("text-2xl font-black mt-1", stat.color)}>
                  {stat.value}
                </p>
              </div>
              <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Push Permission Card ─── */}
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-violet-500/8 to-transparent" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md",
                  permission === "granted"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                    : permission === "denied"
                    ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20"
                    : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                )}
              >
                {permission === "granted" ? (
                  <BellRing className="h-5 w-5 text-white" />
                ) : permission === "denied" ? (
                  <BellOff className="h-5 w-5 text-white" />
                ) : (
                  <Smartphone className="h-5 w-5 text-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Device Alerts
                  </h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
                      permission === "granted"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : permission === "denied"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {permission === "granted"
                      ? "Active"
                      : permission === "denied"
                      ? "Blocked"
                      : "Not Set"}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed max-w-md">
                  {permission === "granted"
                    ? "Instant push notifications are enabled for this device."
                    : permission === "denied"
                    ? "Notifications blocked by browser. Tap 'How to fix' below."
                    : "Enable browser alerts for real-time partner nudges and reminders."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {permission !== "granted" ? (
                <button
                  type="button"
                  onClick={handleEnablePermissions}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Enable Alerts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTestAlert}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 px-3.5 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 active:scale-95 transition-all cursor-pointer"
                >
                  Test Alert
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPermissionModal(true)}
                className="flex items-center gap-1 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-3 py-2.5 text-[11px] font-semibold text-[var(--text-secondary)] transition-all cursor-pointer"
              >
                <Info className="h-3.5 w-3.5 text-violet-500" />
                <span className="hidden sm:inline">How it works</span>
              </button>
            </div>
          </div>

          {testNotificationFeedback && (
            <p className="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ {testNotificationFeedback}
            </p>
          )}
        </div>

        {/* ─── Quick Nudges ─── */}
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                Quick Nudges
              </h3>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
              One-tap warmth
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_NUDGES.map((preset) => (
              <button
                key={preset.text}
                type="button"
                onClick={() => handleSendNudge(preset.text)}
                disabled={sendingNudge}
                className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-rose-500/30 hover:bg-rose-500/5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer group"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">
                  {preset.emoji}
                </span>
                <span className="truncate">{preset.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {tabData.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabFilter)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] pl-9 pr-8 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Notifications Feed ─── */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 animate-pulse flex items-center gap-4"
                >
                  <div className="h-11 w-11 rounded-2xl bg-[var(--bg-hover)]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-1/3 rounded-lg bg-[var(--bg-hover)]" />
                    <div className="h-3 w-2/3 rounded-lg bg-[var(--bg-hover)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-14 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                {activeTab === "unread" ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                ) : (
                  <Sparkles className="h-8 w-8 text-[var(--text-tertiary)]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {searchQuery
                    ? "No Results"
                    : activeTab === "unread"
                    ? "All Caught Up!"
                    : "No Notifications"}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] max-w-xs mx-auto leading-relaxed mt-1.5">
                  {searchQuery
                    ? "Try a different search term or clear the filter."
                    : activeTab === "unread"
                    ? "Everything is up to date. Great job staying connected!"
                    : "Partner nudges, routine syncs, and alerts will appear here."}
                </p>
              </div>
              {(activeTab !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setSearchQuery("");
                  }}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                >
                  View All
                </button>
              )}
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([groupName, items]) => (
              <div key={groupName} className="space-y-2">
                {/* Time group header */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">
                    {groupName}
                  </span>
                  <div className="h-[1px] flex-1 bg-[var(--glass-border)]" />
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                {/* Notification cards */}
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const isUnread = !item.read_at;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          if (isUnread) handleMarkSingleRead(item.id);
                        }}
                        className={cn(
                          "group relative rounded-2xl border transition-all p-4 flex items-start gap-3.5 cursor-pointer",
                          isUnread
                            ? "border-violet-500/25 bg-violet-500/[0.03] hover:border-violet-500/40 hover:bg-violet-500/[0.06]"
                            : "border-[var(--glass-border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
                        )}
                      >
                        {/* Unread dot */}
                        {isUnread && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gradient-to-b from-rose-500 to-violet-600 shadow-sm shadow-rose-500/30" />
                        )}

                        {renderIcon(item.type, item.data)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <h4
                                className={cn(
                                  "text-[13px] leading-snug",
                                  isUnread
                                    ? "font-extrabold text-[var(--text-primary)]"
                                    : "font-semibold text-[var(--text-secondary)]"
                                )}
                              >
                                {item.data?.title || "Notification"}
                              </h4>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium mt-0.5">
                              {formatRelativeTime(item.created_at)}
                            </span>
                          </div>

                          <p className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-relaxed line-clamp-2">
                            {item.data?.message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[var(--glass-border)]/50">
                            <div>
                              {item.data?.sender_name && (
                                <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                                  From {item.data.sender_name}
                                </span>
                              )}
                            </div>

                            <div>
                              {isUnread ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkSingleRead(item.id);
                                  }}
                                  className="text-[10px] font-bold text-violet-500 hover:text-violet-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Mark as read
                                </button>
                              ) : (
                                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Permission Modal ─── */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-md rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/20">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      How Permissions Work
                    </h3>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      PWA, Chrome & OS settings
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3.5 space-y-1.5">
                  <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 text-[11px]">
                    <Smartphone className="h-3.5 w-3.5 text-violet-500" />
                    Why linked to Chrome?
                  </h4>
                  <p className="text-[11px]">
                    UHC Care is a <strong>Progressive Web App (PWA)</strong>. Chrome manages notification permissions since it's the host engine.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3.5 space-y-1.5">
                  <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    How to get standalone icon?
                  </h4>
                  <p className="text-[11px]">
                    Click <strong>&ldquo;Install App&rdquo;</strong> in Chrome. On Android, a WebAPK gives UHC Care its own app icon. On Windows, it pins to your Taskbar.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3.5 space-y-1.5">
                  <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 text-[11px]">
                    <Volume2 className="h-3.5 w-3.5 text-sky-500" />
                    Fix blocked alerts (2 steps)
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-[11px] text-[var(--text-tertiary)]">
                    <li>Tap the <strong>padlock / tune icon</strong> in Chrome&apos;s URL bar → toggle Notifications to <strong>Allow</strong>.</li>
                    <li>Check OS Settings → Notifications → ensure Chrome isn&apos;t silenced.</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
