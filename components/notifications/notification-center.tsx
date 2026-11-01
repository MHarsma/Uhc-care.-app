"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Heart,
  Droplet,
  FileText,
  Activity,
  CheckCircle2,
  X,
  Volume2,
  CalendarHeart,
  Sparkles,
  BellOff,
  BellRing,
  Clock,
  Trash2,
  Filter,
  ChevronDown,
  Shield,
  Smartphone,
  Info,
  ArrowRight,
  Settings,
  Send,
  Flame,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  notificationsApi,
  NotificationItem,
  getNotificationPermission,
  requestNotificationPermission,
  triggerDeviceNotification,
} from "@/lib/api/notifications";

/* ───────────────── Time formatting ────────────────── */
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
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getTimeGroup(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just Now";
    if (diffHours < 24) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This Week";
    return "Earlier";
  } catch {
    return "Earlier";
  }
}

type TabFilter = "all" | "unread" | "love";

/* ───────────────── Main component ────────────────── */
export function NotificationCenter({
  partnerName,
}: {
  partnerName?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingNudge, setSendingNudge] = useState(false);
  const [nudgeFeedback, setNudgeFeedback] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);

  const previousIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync notification permission state
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (activeToast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setActiveToast(null), 5000);
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [activeToast]);

  // Fetch notifications from server
  const loadNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await notificationsApi.getNotifications();
      const items = res.notifications || [];
      const count = res.unread_count || 0;

      // Detect brand new notifications to show toast & trigger device alert
      if (!initialLoadRef.current) {
        const newUnread = items.filter(
          (n) => !n.read_at && !previousIdsRef.current.has(n.id)
        );

        if (newUnread.length > 0) {
          const newest = newUnread[0];
          setActiveToast(newest);

          const title = newest.data?.title || "New Notification";
          const body = newest.data?.message || "You have a new update in UHC Care.";
          triggerDeviceNotification(title, { body, url: "/dashboard" });
        }
      }

      // Update seen IDs
      const currentIds = new Set<string>();
      items.forEach((n) => currentIds.add(n.id));
      previousIdsRef.current = currentIds;
      initialLoadRef.current = false;

      setNotifications(items);
      setUnreadCount(count);
    } catch {
      // Continue silently if offline
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Poll for new notifications every 25 seconds
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadNotifications(true);
      }
    }, 25000);

    const handleFocus = () => loadNotifications(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {}
  };

  // Mark single as read
  const handleMarkSingleRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  // Request browser permission
  const handleEnablePermissions = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === "granted") {
      triggerDeviceNotification("Notifications Enabled! ❤️", {
        body: "You'll now receive instant alerts whenever your partner sends love or updates.",
      });
    }
  };

  // Quick Send Love Nudge
  const handleSendNudge = async () => {
    setSendingNudge(true);
    setNudgeFeedback(null);
    try {
      const res = await notificationsApi.sendNudge();
      setNudgeFeedback(res.message || "Love nudge sent!");
      setTimeout(() => setNudgeFeedback(null), 3500);
      loadNotifications(true);
    } catch (err: any) {
      setNudgeFeedback(err?.message || "Failed to send nudge.");
      setTimeout(() => setNudgeFeedback(null), 3500);
    } finally {
      setSendingNudge(false);
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read_at;
    if (activeTab === "love") {
      const t = (n.data?.type || n.type || "").toLowerCase();
      return t.includes("nudge") || t.includes("love") || t.includes("heart");
    }
    return true;
  });

  // Group by time
  const grouped = new Map<string, NotificationItem[]>();
  filteredNotifications.forEach((n) => {
    const group = getTimeGroup(n.created_at);
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(n);
  });

  // Helper icon for notification type
  const renderIcon = (type: string, data: any) => {
    const notifType = (data?.type || type || "").toLowerCase();
    if (notifType.includes("nudge") || notifType.includes("love")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/25">
          <Heart className="h-4 w-4 fill-white" />
        </div>
      );
    }
    if (notifType.includes("period") || notifType.includes("cycle")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-sm shadow-pink-500/25">
          <Droplet className="h-4 w-4 fill-white" />
        </div>
      );
    }
    if (notifType.includes("symptom")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/25">
          <Activity className="h-4 w-4" />
        </div>
      );
    }
    if (notifType.includes("note")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/25">
          <FileText className="h-4 w-4" />
        </div>
      );
    }
    if (notifType.includes("task") || notifType.includes("routine") || notifType.includes("streak")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm shadow-indigo-500/25">
        <Bell className="h-4 w-4" />
      </div>
    );
  };

  const tabItems: { key: TabFilter; label: string; icon?: React.ReactNode }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "love", label: "Love", icon: <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ─── Real-time Floating Notification Toast ─── */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed top-4 right-4 sm:right-8 z-[60] max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
          >
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-start gap-3">
                {renderIcon(activeToast.type, activeToast.data)}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-snug">
                    {activeToast.data?.title || "New Partner Notification"}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                    {activeToast.data?.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {formatRelativeTime(activeToast.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveToast(null);
                        setIsOpen(true);
                      }}
                      className="text-[10px] font-bold text-violet-500 hover:text-violet-400 transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-violet-500 rounded-b-2xl origin-left"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bell Icon Trigger Button ─── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(true);
        }}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer",
          isOpen
            ? "border-violet-500/40 bg-violet-500/15 text-violet-500 shadow-sm shadow-violet-500/10"
            : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-1 text-[9px] font-black text-white shadow-md shadow-rose-500/30 ring-2 ring-[var(--bg-primary)]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* ─── Slide-In Notification Panel (Full right side on desktop, overlay on mobile) ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:bg-black/15"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel — slides in from right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] border-l border-[var(--glass-border)] bg-[var(--bg-primary)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* ─── Header ─── */}
              <div className="shrink-0 px-5 pt-5 pb-4 border-b border-[var(--glass-border)] bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-primary)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
                      <Bell className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[var(--text-primary)] leading-none tracking-tight">
                        Notifications
                      </h3>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-medium">
                        {unreadCount > 0
                          ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                          : "You're all caught up ✨"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-violet-500 hover:text-violet-400 px-2.5 py-1.5 rounded-xl hover:bg-violet-500/10 transition-all"
                        title="Mark all as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* ─── Tab Filters ─── */}
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all",
                        activeTab === tab.key
                          ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--glass-border)]"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                      )}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.key === "unread" && unreadCount > 0 && (
                        <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-white px-1 text-[9px] font-black">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Browser Permission Banner ─── */}
              {permission !== "granted" && permission !== "unsupported" && (
                <div className="shrink-0 mx-4 mt-3 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/8 to-orange-500/8 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Enable Push Notifications
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 leading-relaxed">
                        Get instant alerts for partner nudges & updates
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleEnablePermissions}
                      className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-3.5 py-2 text-[10px] hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                      Allow
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Quick Action: Send Love Nudge ─── */}
              {partnerName && (
                <div className="shrink-0 mx-4 mt-3">
                  <div className="flex items-center justify-between rounded-2xl border border-rose-500/15 bg-gradient-to-r from-rose-500/5 to-pink-500/5 p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-sm shadow-rose-500/20">
                        <Heart className="h-3.5 w-3.5 fill-white text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                          Quick Care Nudge
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                          Let {partnerName} know you&apos;re thinking of them
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendNudge}
                      disabled={sendingNudge}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-3.5 py-2 text-[11px] font-bold text-white shadow-sm shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 hover:shadow-md hover:shadow-rose-500/30"
                    >
                      <Heart className="h-3 w-3 fill-white" />
                      <span>{sendingNudge ? "Sending..." : "Nudge"}</span>
                    </button>
                  </div>
                  <AnimatePresence>
                    {nudgeFeedback && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 px-3 py-2 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ {nudgeFeedback}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ─── Notifications List ─── */}
              <div className="flex-1 overflow-y-auto overscroll-contain mt-2">
                {loading && notifications.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="mx-auto h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <p className="text-xs text-[var(--text-tertiary)]">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-[var(--text-tertiary)]">
                      {activeTab === "unread" ? (
                        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                      ) : activeTab === "love" ? (
                        <Heart className="h-7 w-7 text-rose-400" />
                      ) : (
                        <Sparkles className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-secondary)]">
                        {activeTab === "unread"
                          ? "All caught up!"
                          : activeTab === "love"
                          ? "No love nudges yet"
                          : "No notifications yet"}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                        {activeTab === "unread"
                          ? "You've read all your notifications. Great job staying connected!"
                          : activeTab === "love"
                          ? "Send a nudge to your partner to get started 💕"
                          : "Nudges, cycle updates, and notes will appear here."}
                      </p>
                    </div>
                  </div>
                ) : (
                  Array.from(grouped.entries()).map(([groupLabel, items]) => (
                    <div key={groupLabel}>
                      {/* Time group header */}
                      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/95 backdrop-blur-md px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-widest">
                            {groupLabel}
                          </span>
                          <div className="h-[1px] flex-1 bg-[var(--glass-border)]" />
                          <span className="text-[9px] text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-full px-2 py-0.5 font-bold">
                            {items.length}
                          </span>
                        </div>
                      </div>

                      {/* Notification items */}
                      {items.map((item, idx) => {
                        const isUnread = !item.read_at;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => isUnread && handleMarkSingleRead(item.id)}
                            className={cn(
                              "flex items-start gap-3 px-5 py-3.5 transition-all cursor-pointer group relative mx-2 mb-1 rounded-xl",
                              isUnread
                                ? "bg-violet-500/[0.05] hover:bg-violet-500/[0.08]"
                                : "hover:bg-[var(--bg-hover)]"
                            )}
                          >
                            {/* Unread indicator dot */}
                            {isUnread && (
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gradient-to-b from-rose-500 to-violet-500 shadow-sm shadow-rose-500/30" />
                            )}

                            {renderIcon(item.type, item.data)}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={cn(
                                    "text-[13px] leading-snug",
                                    isUnread
                                      ? "font-extrabold text-[var(--text-primary)]"
                                      : "font-medium text-[var(--text-secondary)]"
                                  )}
                                >
                                  {item.data?.title || "Notification"}
                                </p>
                                <span className="text-[10px] text-[var(--text-muted)] shrink-0 mt-0.5 font-medium">
                                  {formatRelativeTime(item.created_at)}
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2 leading-relaxed">
                                {item.data?.message}
                              </p>

                              {/* Action hint for unread */}
                              {isUnread && (
                                <span className="text-[9px] font-bold text-violet-500/60 mt-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to mark as read
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* ─── Footer ─── */}
              <div className="shrink-0 border-t border-[var(--glass-border)] bg-[var(--bg-elevated)] px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {permission === "granted" && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500/80">
                        <BellRing className="h-3 w-3" />
                        <span className="font-semibold">Push active</span>
                      </div>
                    )}
                    {permission === "denied" && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-500/80">
                        <BellOff className="h-3 w-3" />
                        <span className="font-semibold">Push blocked</span>
                      </div>
                    )}
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {notifications.length > 0
                        ? `${notifications.length} total`
                        : ""}
                    </span>
                  </div>
                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
