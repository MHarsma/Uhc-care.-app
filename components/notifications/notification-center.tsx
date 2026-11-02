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
  BellRing,
  Clock,
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

/* ───────────────── Time formatting (12-hour AM/PM) ────────────────── */
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
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

type TabFilter = "all" | "unread" | "love";

export function NotificationCenter({
  partnerName,
}: {
  partnerName?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const loadNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await notificationsApi.getNotifications();
      const items = res.notifications || [];
      const count = res.unread_count || 0;
      setNotifications(items);
      setUnreadCount(count);
    } catch {
      // Ignore network errors gracefully
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadNotifications(true);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Click outside to close popover
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

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read_at;
    if (activeTab === "love") {
      const t = (n.data?.type || n.type || "").toLowerCase();
      return t.includes("nudge") || t.includes("love") || t.includes("heart") || t.includes("partner");
    }
    return true;
  });

  const renderIcon = (type: string, data: any) => {
    const notifType = (data?.type || type || "").toLowerCase();
    if (notifType.includes("nudge") || notifType.includes("love")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
          <Heart className="h-4 w-4 fill-rose-500" />
        </div>
      );
    }
    if (notifType.includes("period") || notifType.includes("cycle")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500">
          <Droplet className="h-4 w-4 fill-pink-500" />
        </div>
      );
    }
    if (notifType.includes("task") || notifType.includes("routine")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
        <Bell className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(true);
        }}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer",
          isOpen
            ? "border-violet-500 bg-violet-500/15 text-violet-500"
            : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-[var(--bg-primary)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Classic Notification Dropdown Panel anchored right directly beneath the bell icon */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--glass-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 px-2 py-0.5 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-violet-500 hover:text-violet-400 px-2 py-1 rounded-lg hover:bg-violet-500/10 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-2 border-b border-[var(--glass-border)] flex items-center gap-1 bg-[var(--bg-secondary)]">
              {(["all", "unread", "love"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-1 px-2 rounded-lg text-[11px] font-bold capitalize transition-colors text-center",
                    activeTab === tab
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  {tab === "love" ? "❤️ Love" : tab}
                </button>
              ))}
            </div>

            {/* Notifications Feed */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-[var(--glass-border)]">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {activeTab === "unread" ? "No unread alerts" : "No notifications yet"}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    You're completely up to date.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const isUnread = !item.read_at;
                  return (
                    <div
                      key={item.id}
                      onClick={() => isUnread && handleMarkSingleRead(item.id)}
                      className={cn(
                        "p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[var(--bg-hover)]",
                        isUnread ? "bg-violet-500/[0.04]" : ""
                      )}
                    >
                      {renderIcon(item.type, item.data)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={cn("text-xs leading-snug", isUnread ? "font-bold text-[var(--text-primary)]" : "font-medium text-[var(--text-secondary)]")}>
                            {item.data?.title || "Notification"}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.data?.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-[var(--glass-border)] bg-[var(--bg-secondary)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-muted)] px-2">
                {notifications.length} total
              </span>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="font-bold text-violet-500 hover:text-violet-400 px-2 py-1"
              >
                Clear Unread
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
