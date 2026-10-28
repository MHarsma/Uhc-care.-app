"use client";

import * as React from "react";
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
  ExternalLink,
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

  const previousIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync notification permission state
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

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

  // Helper icon for notification type
  const renderIcon = (type: string, data: any) => {
    const notifType = (data?.type || type || "").toLowerCase();
    if (notifType.includes("nudge")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
          <Heart className="h-4 w-4 fill-rose-500" />
        </div>
      );
    }
    if (notifType.includes("period") || notifType.includes("cycle")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500">
          <Droplet className="h-4 w-4 fill-pink-500" />
        </div>
      );
    }
    if (notifType.includes("symptom")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
          <Activity className="h-4 w-4" />
        </div>
      );
    }
    if (notifType.includes("note")) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
          <FileText className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
        <Bell className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Real-time Floating Notification Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-16 right-4 sm:right-8 z-50 max-w-sm rounded-2xl border border-rose-500/30 bg-[var(--bg-card)]/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
          >
            <div className="flex items-start gap-3">
              {renderIcon(activeToast.type, activeToast.data)}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[var(--text-primary)]">
                  {activeToast.data?.title || "New Partner Notification"}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                  {activeToast.data?.message}
                </p>
                <span className="text-[10px] text-[var(--text-tertiary)] mt-1 block">
                  {formatRelativeTime(activeToast.created_at)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(true);
        }}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer",
          isOpen
            ? "border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-400"
            : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-4 py-3 bg-[var(--glass-bg)]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-500" />
                <h3 className="text-xs font-bold text-[var(--text-primary)]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Browser Permission Prompt Banner */}
            {permission !== "granted" && permission !== "unsupported" && (
              <div className="flex items-center justify-between gap-2 border-b border-[var(--glass-border)] bg-amber-500/10 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Volume2 className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] text-[var(--text-secondary)] truncate">
                    Enable device alerts for nudges
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleEnablePermissions}
                  className="shrink-0 rounded-lg bg-amber-500 text-white font-bold px-2.5 py-1 text-[10px] hover:bg-amber-600 active:scale-95 transition-all cursor-pointer"
                >
                  Allow
                </button>
              </div>
            )}

            {/* Quick Action: Send Love Nudge */}
            {partnerName && (
              <div className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  Quick Care Nudge
                </span>
                <button
                  type="button"
                  onClick={handleSendNudge}
                  disabled={sendingNudge}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                  <span>{sendingNudge ? "Sending..." : `Nudge ${partnerName}`}</span>
                </button>
              </div>
            )}

            {nudgeFeedback && (
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {nudgeFeedback}
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--glass-border)]">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--glass-bg)] text-[var(--text-tertiary)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-secondary)]">
                    All caught up!
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Nudges, cycle updates, and notes from your partner will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const isUnread = !item.read_at;
                  return (
                    <div
                      key={item.id}
                      onClick={() => isUnread && handleMarkSingleRead(item.id)}
                      className={cn(
                        "flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-[var(--bg-hover)]",
                        isUnread ? "bg-rose-500/5 dark:bg-rose-500/10" : ""
                      )}
                    >
                      {renderIcon(item.type, item.data)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={cn(
                              "text-xs truncate",
                              isUnread
                                ? "font-bold text-[var(--text-primary)]"
                                : "font-medium text-[var(--text-secondary)]"
                            )}
                          >
                            {item.data?.title || "Notification"}
                          </p>
                          <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.data?.message}
                        </p>
                      </div>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
