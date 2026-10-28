"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { useTheme } from "@/components/theme-provider";
import { InstallAppCard } from "@/components/pwa-install-prompt";
import {
  settingsApi,
  UserProfile,
  PartnerSummary,
  CoupleSummary,
  NotificationSettings,
  PrayerTimeItem,
} from "@/lib/api/settings";
import { api, getApiBaseUrl } from "@/lib/api/client";
import {
  User,
  MapPin,
  Clock,
  KeyRound,
  Bell,
  Heart,
  Moon,
  Sun,
  Laptop,
  Palette,
  LogOut,
  UserX,
  Sparkles,
  Check,
  AlertTriangle,
  RefreshCw,
  Edit2,
  CalendarHeart,
  ShieldCheck,
  CheckCircle2,
  X,
  Save,
  Fingerprint,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isBiometricsSupported,
  getBiometricStatus,
  enrollBiometrics,
  testBiometrics,
  removeBiometrics,
} from "@/lib/auth/biometrics";
import {
  getNotificationPermission,
  requestNotificationPermission,
  triggerDeviceNotification,
} from "@/lib/api/notifications";

const PAKISTAN_CITIES = [
  "Talagang",
  "Dikhan",
  "Dera Ismail Khan",
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Quetta",
  "Faisalabad",
  "Multan",
  "Sialkot",
  "Abbottabad",
  "Chakwal",
  "Jhelum",
  "Attock",
  "Mianwali",
  "Kohat",
  "Bannu",
];

const TIMEZONES = [
  { value: "Asia/Karachi", label: "Asia/Karachi (UTC+5 · Islamabad)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Denver", label: "America/Denver" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [partner, setPartner] = React.useState<PartnerSummary | null>(null);
  const [couple, setCouple] = React.useState<CoupleSummary | null>(null);
  const [notifications, setNotifications] = React.useState<NotificationSettings>({
    task_completed_realtime: true,
    note_reactions: true,
    streak_milestones: true,
    daily_digest: true,
  });
  const [periodSharing, setPeriodSharing] = React.useState(false);
  const [prayers, setPrayers] = React.useState<PrayerTimeItem[]>([]);

  // Form states
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [customCityMode, setCustomCityMode] = React.useState(false);
  const [timezone, setTimezone] = React.useState("Asia/Karachi");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);

  // Prayer sync state
  const [prayersSyncing, setPrayersSyncing] = React.useState(false);
  const [prayerSyncMessage, setPrayerSyncMessage] = React.useState<string | null>(null);

  // Prayer edit modal
  const [editingPrayer, setEditingPrayer] = React.useState<PrayerTimeItem | null>(null);
  const [customPrayerTime, setCustomPrayerTime] = React.useState("");
  const [savingPrayerOverride, setSavingPrayerOverride] = React.useState(false);
  const [prayerOverrideError, setPrayerOverrideError] = React.useState<string | null>(null);

  // Unpair dialog state
  const [showUnpairModal, setShowUnpairModal] = React.useState(false);
  const [unpairingLoading, setUnpairingLoading] = React.useState(false);
  const [unpairMessage, setUnpairMessage] = React.useState<string | null>(null);

  // Sign out confirmation modal state
  const [showSignoutModal, setShowSignoutModal] = React.useState(false);
  const [signoutLoading, setSignoutLoading] = React.useState(false);

  // Biometrics state
  const [biometricSupported, setBiometricSupported] = React.useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = React.useState(false);
  const [biometricEnrolling, setBiometricEnrolling] = React.useState(false);
  const [biometricTesting, setBiometricTesting] = React.useState(false);
  const [biometricMsg, setBiometricMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Device Notifications state
  const [deviceNotifPermission, setDeviceNotifPermission] = React.useState<NotificationPermission | "unsupported">("unsupported");
  const [deviceNotifMsg, setDeviceNotifMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      if (typeof window !== "undefined") {
        setDeviceNotifPermission(getNotificationPermission());
        isBiometricsSupported().then((sup) => {
          setBiometricSupported(sup);
          const st = getBiometricStatus();
          setBiometricEnrolled(st.isEnrolled);
        });
      }

      const [profRes, notifRes, periodRes, prayerRes] = await Promise.allSettled([
        settingsApi.getProfile(),
        settingsApi.getNotificationSettings(),
        settingsApi.getPeriodSettings(),
        settingsApi.getPrayerTimes(),
      ]);

      if (profRes.status === "fulfilled") {
        setProfile(profRes.value.user);
        setName(profRes.value.user.name);
        const userCity = profRes.value.user.city || "";
        setCity(userCity);
        setCustomCityMode(
          userCity !== "" && !PAKISTAN_CITIES.some((c) => c.toLowerCase() === userCity.toLowerCase())
        );
        setTimezone(profRes.value.user.timezone || "Asia/Karachi");
        setPartner(profRes.value.partner);
        setCouple(profRes.value.couple);
      } else {
        const reason: any = profRes.reason;
        if (reason?.status === 401) {
          router.push("/login");
          return;
        }
        setLoadError(reason?.message || "Failed to load user profile and settings.");
      }

      if (notifRes.status === "fulfilled") {
        setNotifications(notifRes.value.settings);
      }

      if (periodRes.status === "fulfilled") {
        setPeriodSharing(periodRes.value.sharing.enabled);
      }

      if (prayerRes.status === "fulfilled") {
        setPrayers(prayerRes.value.prayer_times);
      }
    } catch (err: any) {
      console.error("Failed to load settings:", err);
      setLoadError(err?.message || "An unexpected error occurred while loading settings.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await settingsApi.updateProfile({ name, city, timezone });
      setProfile(res.user);
      setProfileMessage({ type: "success", text: "Profile updated successfully ✨" });
      setTimeout(() => setProfileMessage(null), 3000);

      const updatedPrayers = await settingsApi.getPrayerTimes();
      setPrayers(updatedPrayers.prayer_times);
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err?.message || "Failed to update profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const res = await settingsApi.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordMessage({ type: "success", text: res.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordMessage(null);
        setShowPasswordForm(false);
      }, 2500);
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err?.message || "Failed to change password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleToggleNotification = async (key: keyof NotificationSettings) => {
    const nextVal = !notifications[key];
    const updated = { ...notifications, [key]: nextVal };
    setNotifications(updated);

    try {
      await settingsApi.updateNotificationSettings({ [key]: nextVal });
    } catch {
      setNotifications(notifications);
    }
  };

  const handleTogglePeriodSharing = async () => {
    const nextVal = !periodSharing;
    setPeriodSharing(nextVal);

    try {
      await settingsApi.updatePeriodSettings(nextVal);
    } catch {
      setPeriodSharing(!nextVal);
    }
  };

  const handleSyncPrayers = async () => {
    setPrayersSyncing(true);
    setPrayerSyncMessage(null);

    try {
      const res = await settingsApi.syncPrayersToRoutines();
      setPrayerSyncMessage(res.message);
      setTimeout(() => setPrayerSyncMessage(null), 3500);
    } catch (err: any) {
      setPrayerSyncMessage(err?.message || "Failed to sync prayer routines.");
    } finally {
      setPrayersSyncing(false);
    }
  };

  const handleOpenPrayerEdit = (prayer: PrayerTimeItem) => {
    setEditingPrayer(prayer);
    setPrayerOverrideError(null);
    setCustomPrayerTime(prayer.custom_time ? prayer.custom_time.slice(0, 5) : "");
  };

  const handleSavePrayerOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrayer) return;

    setSavingPrayerOverride(true);
    setPrayerOverrideError(null);
    try {
      await settingsApi.overridePrayerTime(
        editingPrayer.prayer_name,
        customPrayerTime ? `${customPrayerTime}:00` : null
      );
      setEditingPrayer(null);
      const updatedPrayers = await settingsApi.getPrayerTimes();
      setPrayers(updatedPrayers.prayer_times);
    } catch (err: any) {
      setPrayerOverrideError(err?.message || "Failed to update prayer time.");
    } finally {
      setSavingPrayerOverride(false);
    }
  };

  const handleUnpair = async () => {
    setUnpairingLoading(true);
    try {
      await settingsApi.requestUnpair();
      setShowUnpairModal(false);
      setUnpairMessage("Couple connection unlinked.");
      await loadData();
    } catch (err: any) {
      setUnpairMessage(err?.message || "Failed to unpair.");
    } finally {
      setUnpairingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <AppShell
      headerTitle="Settings"
      headerSubtitle="Profile, couple pairing, reminders & preferences"
    >
      <div className="space-y-6 max-w-5xl">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 rounded-3xl shimmer" />
            <div className="h-44 rounded-3xl shimmer" />
          </div>
        ) : loadError && !profile ? (
          <div className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-8 text-center space-y-4 max-w-xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">
              Unable to load settings
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              {loadError}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => void loadData()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* ============================================================ */}
            {/* COLUMN 1: PROFILE & COUPLE PAIRING                          */}
            {/* ============================================================ */}
            <div className="space-y-6">
              {/* Appearance & Theme Card */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Appearance & Theme
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Customize your visual experience
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all",
                      theme === "light"
                        ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-2 ring-violet-500/20"
                        : "border-[var(--glass-border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-violet-500/30"
                    )}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all",
                      theme === "dark"
                        ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-2 ring-violet-500/20"
                        : "border-[var(--glass-border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-violet-500/30"
                    )}
                  >
                    <Moon className="h-5 w-5 text-indigo-400" />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all",
                      theme === "system"
                        ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-2 ring-violet-500/20"
                        : "border-[var(--glass-border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-violet-500/30"
                    )}
                  >
                    <Laptop className="h-5 w-5 text-sky-400" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Profile Details
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Personal info and local city
                    </p>
                  </div>
                </div>

                {profileMessage && (
                  <div
                    className={cn(
                      "mb-4 rounded-xl border p-3 text-xs font-bold flex items-center gap-2",
                      profileMessage.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
                    )}
                  >
                    {profileMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-violet-500 focus:bg-[var(--bg-elevated)] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-tertiary)] cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        City (for Salah times)
                      </label>
                      {customCityMode ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Type your city name"
                            className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:bg-[var(--bg-elevated)] focus:outline-none transition-colors pr-16"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCityMode(false);
                              setCity(profile?.gender === "female" ? "Dikhan" : "Talagang");
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors"
                          >
                            List
                          </button>
                        </div>
                      ) : (
                        <select
                          value={city}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setCustomCityMode(true);
                              setCity("");
                            } else {
                              setCity(e.target.value);
                            }
                          }}
                          className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-violet-500 focus:bg-[var(--bg-elevated)] focus:outline-none transition-colors"
                        >
                          <option value="" disabled>
                            Select your city
                          </option>
                          {PAKISTAN_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                          <option value="__custom__">✏️ Other (type manually)</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-violet-500 focus:bg-[var(--bg-elevated)] focus:outline-none transition-colors"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>{profileSaving ? "Saving..." : "Save Profile"}</span>
                  </button>
                </form>
              </div>

              {/* Couple & Partner Management Card */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                      <Heart className="h-4 w-4 fill-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Couple Connection
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Shared accountability status
                      </p>
                    </div>
                  </div>
                </div>

                {partner ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-sm">
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">
                            {partner.name}
                          </p>
                          <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                            Connected & Synced ❤️
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowUnpairModal(true)}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all"
                      >
                        Unpair
                      </button>
                    </div>

                    {profile?.is_female && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            Share Cycle Status with Partner
                          </p>
                          <p className="text-[11px] text-[var(--text-tertiary)]">
                            Allows partner to see when you are in resting phase
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleTogglePeriodSharing}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                            periodSharing ? "bg-rose-500" : "bg-[var(--text-muted)]"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition",
                              periodSharing ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center space-y-2">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      You are not currently paired with a partner.
                    </p>
                    <Link
                      href="/pairing"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                    >
                      <span>Pair with Partner</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMN 2: PRAYERS, NOTIFICATIONS & SECURITY                 */}
            {/* ============================================================ */}
            <div className="space-y-6">
              {/* Prayer Times & Sync Card */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400">
                      <Moon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Prayer Times (Salah)
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Calculated automatically for {city || "your city"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncPrayers}
                    disabled={prayersSyncing}
                    className="flex items-center gap-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  >
                    <RefreshCw className={cn("h-3 w-3", prayersSyncing && "animate-spin")} />
                    <span>{prayersSyncing ? "Syncing..." : "Sync Routines"}</span>
                  </button>
                </div>

                {prayerSyncMessage && (
                  <div className="mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {prayerSyncMessage}
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {prayers.map((prayer) => (
                    <button
                      type="button"
                      key={prayer.prayer_name}
                      onClick={() => handleOpenPrayerEdit(prayer)}
                      className="flex flex-col items-center p-2.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-violet-500/30 transition-all text-center group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        {prayer.display_name}
                      </span>
                      <span className="text-xs font-black text-[var(--text-primary)] mt-1">
                        {prayer.effective_time.slice(0, 5)}
                      </span>
                      <span className="text-[9px] text-violet-600 dark:text-violet-400 font-semibold group-hover:underline mt-0.5">
                        Edit
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Notifications
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Alerts and daily reminders
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "task_completed_realtime" as const,
                      label: "Partner Routine Updates",
                      desc: "Instant notice when your partner completes a routine",
                    },
                    {
                      key: "note_reactions" as const,
                      label: "Note Love Reactions",
                      desc: "When your partner reacts to your shared note",
                    },
                    {
                      key: "streak_milestones" as const,
                      label: "Streak Milestones",
                      desc: "Celebrations for 7-day, 30-day streak wins",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    >
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleNotification(item.key)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                          notifications[item.key] ? "bg-violet-600" : "bg-[var(--text-muted)]"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition",
                            notifications[item.key] ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Device & Browser Native Notifications Integration */}
                <div className="mt-4 pt-4 border-t border-[var(--glass-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Phone & System Alerts
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">
                        Direct vibration & banner alerts for love nudges & cycle updates
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                        deviceNotifPermission === "granted"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : deviceNotifPermission === "denied"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {deviceNotifPermission === "granted"
                        ? "Active"
                        : deviceNotifPermission === "denied"
                        ? "Blocked by Browser"
                        : "Permission Needed"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {deviceNotifPermission !== "granted" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await requestNotificationPermission();
                          setDeviceNotifPermission(res);
                          if (res === "granted") {
                            setDeviceNotifMsg("Device notifications enabled!");
                            triggerDeviceNotification("UHC Care Connected ❤️", {
                              body: "Native notifications are active on this device.",
                            });
                          } else {
                            setDeviceNotifMsg("Notification permission was not granted.");
                          }
                          setTimeout(() => setDeviceNotifMsg(null), 4000);
                        }}
                        className="rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        Enable Phone Alerts
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setDeviceNotifMsg("Sending test notification...");
                          const ok = await triggerDeviceNotification("UHC Care Test Alert ❤️", {
                            body: "Notifications and haptics are working smoothly on your device!",
                          });
                          if (ok) {
                            setDeviceNotifMsg("Test alert sent! Check your notification center.");
                          } else {
                            setDeviceNotifMsg("Notification triggered in browser.");
                          }
                          setTimeout(() => setDeviceNotifMsg(null), 4000);
                        }}
                        className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
                      >
                        Send Test Notification
                      </button>
                    )}
                  </div>

                  {deviceNotifMsg && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {deviceNotifMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* Cycle & Period Care Sharing Card */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                      <CalendarHeart className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Cycle & Period Care Sharing
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Partner sync & cycle visibility
                      </p>
                    </div>
                  </div>

                  {profile?.gender === "female" && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        periodSharing
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                          : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)]"
                      )}
                    >
                      {periodSharing ? "Sharing Active" : "Private"}
                    </span>
                  )}
                </div>

                {profile?.gender === "female" ? (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="max-w-[75%]">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Share period details with partner
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                        {partner
                          ? `Allows ${partner.name} to view your cycle phase, wellness tips, and know how best to support you.`
                          : "Allows your future paired partner to view your cycle phase and support tips."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTogglePeriodSharing}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                        periodSharing ? "bg-rose-500" : "bg-[var(--text-muted)]"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition",
                          periodSharing ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-1.5">
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      Partner Cycle Sync
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {partner
                        ? `When ${partner.name} enables period sharing in her settings, her cycle phases, ovulation calendar, and partner care suggestions will automatically display in your Cycle & Care tab and Partner Hub.`
                        : "Once you pair with a female partner and she enables period sharing in her settings, her cycle phases and care suggestions will appear for you."}
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile PWA Install Card */}
              <InstallAppCard />

              {/* Password & Security Card */}
              <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--glass-bg)] text-[var(--text-secondary)]">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Password & Security
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Update your login credentials
                      </p>
                    </div>
                  </div>

                  {!showPasswordForm && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                      className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {passwordMessage && (
                  <div
                    className={cn(
                      "mb-3 rounded-xl p-3 text-xs font-bold",
                      passwordMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300"
                    )}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                {showPasswordForm && (
                  <form onSubmit={handleSavePassword} className="space-y-3 pt-2">
                    <PasswordInput
                      label="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />

                    <PasswordInput
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <PasswordInput
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="rounded-xl border border-[var(--glass-border)] px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-xs"
                      >
                        {passwordSaving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Biometric & Fingerprint Security Section */}
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-xs glass-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Fingerprint & Biometric Quick ID
                      </h3>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        {biometricEnrolled
                          ? "Device biometric authentication active (Fingerprint / Touch ID)"
                          : biometricSupported
                          ? "Supported by your device. Enable for fast 1-tap unlock."
                          : "WebAuthn platform authenticator detected on modern browsers."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {biometricEnrolled ? (
                      <>
                        <button
                          type="button"
                          disabled={biometricTesting}
                          onClick={async () => {
                            setBiometricTesting(true);
                            setBiometricMsg(null);
                            try {
                              await testBiometrics();
                              setBiometricMsg({
                                type: "success",
                                text: "Sensor verified! Fingerprint is active and functioning correctly.",
                              });
                            } catch (err: any) {
                              setBiometricMsg({
                                type: "error",
                                text: err?.message || "Sensor test failed or cancelled.",
                              });
                            } finally {
                              setBiometricTesting(false);
                            }
                          }}
                          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] active:scale-95 transition-all cursor-pointer"
                        >
                          {biometricTesting ? "Scanning..." : "Test Sensor"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            removeBiometrics();
                            setBiometricEnrolled(false);
                            setBiometricMsg({ type: "success", text: "Fingerprint ID disabled for this device." });
                          }}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 active:scale-95 transition-all cursor-pointer"
                        >
                          Disable Biometrics
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={biometricEnrolling}
                        onClick={async () => {
                          const targetEmail = profile?.email || (typeof window !== "undefined" ? localStorage.getItem("uhc_biometric_user") || localStorage.getItem("uhc_user_email") : null);
                          if (!targetEmail) {
                            setBiometricMsg({
                              type: "error",
                              text: "Profile email is still loading. Please wait a moment or tap Retry.",
                            });
                            return;
                          }
                          setBiometricEnrolling(true);
                          setBiometricMsg(null);
                          try {
                            await enrollBiometrics(targetEmail, profile?.name || targetEmail.split("@")[0]);
                            setBiometricEnrolled(true);
                            setBiometricMsg({
                              type: "success",
                              text: "Fingerprint enrolled! You can now unlock the app with 1 tap.",
                            });
                          } catch (err: any) {
                            setBiometricMsg({
                              type: "error",
                              text: err?.message || "Failed to register fingerprint scanner. Ensure your browser has permission.",
                            });
                          } finally {
                            setBiometricEnrolling(false);
                          }
                        }}
                        className="rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
                      >
                        {biometricEnrolling ? "Detecting Sensor..." : "Enable Fingerprint ID"}
                      </button>
                    )}
                  </div>
                </div>

                {biometricMsg && (
                  <p
                    className={cn(
                      "text-xs px-3 py-2 rounded-xl border font-semibold",
                      biometricMsg.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    )}
                  >
                    {biometricMsg.text}
                  </p>
                )}
              </div>

              {/* Sign Out Section */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Sign Out</h3>
                      <p className="text-[11px] text-[var(--text-tertiary)]">Sign out of your account on this device</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignoutModal(true)}
                    className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prayer Time Edit Modal */}
      {editingPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] p-6 shadow-2xl border border-[var(--glass-border)] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Adjust {editingPrayer.display_name} Time
              </h3>
              <button
                type="button"
                onClick={() => setEditingPrayer(null)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrayerOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Custom Prayer Time (HH:MM)
                </label>
                <input
                  type="time"
                  value={customPrayerTime}
                  onChange={(e) => setCustomPrayerTime(e.target.value)}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-violet-500 focus:bg-[var(--bg-elevated)] focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Leave empty to restore automated calculation.
                </p>
              </div>

              {prayerOverrideError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{prayerOverrideError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPrayer(null)}
                  className="rounded-xl border border-[var(--glass-border)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrayerOverride}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Save Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unpair Confirmation Modal */}
      {showUnpairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] p-6 shadow-2xl border border-[var(--glass-border)] text-center animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 mb-3">
              <UserX className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Unpair from {partner?.name}?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              You will no longer share routine percentages or leave passes. You can pair again anytime.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowUnpairModal(false)}
                className="rounded-xl border border-[var(--glass-border)] py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnpair}
                disabled={unpairingLoading}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                {unpairingLoading ? "Unpairing..." : "Confirm Unpair"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] p-6 shadow-2xl border border-[var(--glass-border)] text-center animate-in zoom-in-95 duration-150 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
              <LogOut className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Sign Out of UHC Care?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                You will need your password or fingerprint to sign back into your account on this device.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignoutModal(false)}
                disabled={signoutLoading}
                className="rounded-xl border border-[var(--glass-border)] py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={signoutLoading}
                onClick={async () => {
                  setSignoutLoading(true);
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("uhc_logged_in");
                      localStorage.removeItem("uhc_auth_token");
                    }
                    await api.post("/auth/logout");
                    router.push("/login");
                  } catch {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("uhc_logged_in");
                      localStorage.removeItem("uhc_auth_token");
                    }
                    router.push("/login");
                  } finally {
                    setSignoutLoading(false);
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                {signoutLoading ? "Signing out..." : "Yes, Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
