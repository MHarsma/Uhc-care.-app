import { api } from "@/lib/api/client";

export interface NotificationItem {
  id: string;
  type: string;
  data: {
    type?: string;
    title?: string;
    message?: string;
    sender_id?: number;
    sender_name?: string;
    action?: string;
    period_id?: number;
    symptoms?: string[];
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationResponse> => {
    return api.get<NotificationResponse>("/notifications");
  },

  markAsRead: async (notificationId?: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>("/notifications/mark-read", {
      notification_id: notificationId || null,
    });
  },

  sendNudge: async (): Promise<{ message: string }> => {
    return api.post<{ message: string }>("/notifications/nudge", {});
  },

  registerDeviceToken: async (token: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>("/notifications/device-token", { token });
  },
};

/** Check device notification permission */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/** Request user permission for native device/browser notifications */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "unsupported";
  }
}

/** Trigger a system/browser notification across Desktop, Android, and iOS PWA */
export async function triggerDeviceNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    tag?: string;
    url?: string;
  } = {}
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const defaultIcon = "/icon-192.png";
  const notificationOptions = {
    body: options.body || "New update in UHC Care",
    icon: options.icon || defaultIcon,
    badge: defaultIcon,
    tag: options.tag || "uhc-notification",
    data: { url: options.url || "/dashboard" },
  };

  // Provide haptic feedback if device supports it
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch {}
  }

  // 1. Prefer Service Worker registration showNotification (works on Mobile PWA & Desktop)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch {
      // Fall through to window Notification
    }
  }

  // 2. Fall back to standard Notification constructor if granted
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, notificationOptions);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
