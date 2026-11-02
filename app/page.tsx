"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { api } from "@/lib/api/client";
import {
  Heart,
  Flame,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  CalendarHeart,
  Dumbbell,
  CheckCircle2,
  BellRing,
  Moon,
  Sun,
  Activity,
  Droplets,
  Zap,
  Users,
  Compass,
  ChevronRight,
  Clock,
  Award,
  Layers,
  Smile,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// INTERACTIVE HERO PREVIEWS DATA
// ============================================================================

type PreviewTab = "couple" | "vitality" | "prayer" | "partner";

const PREVIEWS = {
  couple: {
    tabId: "couple",
    badge: "💑 Daily Couple Synchronization",
    title: "Live Shared Routines & Fire Streaks",
    description: "Build harmonious morning and evening rituals together. Celebrate daily wins, stay accountable, and keep your flame alive.",
    component: (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-md shadow-violet-500/25">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-[var(--text-primary)]">Ahmed Khan</span>
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="h-3.5 w-3.5 fill-current" /> 14 Day Streak
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">8 of 9 routines completed today (89%)</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Active Now
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-lg shadow-md shadow-rose-500/25">
              FK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-[var(--text-primary)]">Fatima Khan</span>
                <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Heart className="h-3.5 w-3.5 fill-current" /> Follicular Day 8
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Morning movement + hydration completed</p>
            </div>
          </div>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300 border border-violet-500/30">
            Synced
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-xs font-medium text-violet-700 dark:text-violet-300">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-bounce" />
            <span>Ahmed sent a love nudge: &quot;Proud of your consistency today! 💕&quot;</span>
          </div>
          <span className="text-[11px] font-bold">2m ago</span>
        </div>
      </div>
    ),
  },

  vitality: {
    tabId: "vitality",
    badge: "🌸 Hormonal Movement & Symptom Care",
    title: "Cycle-Adapted Fitness & Headache Relief",
    description: "Smart movement calibrated to her 28-day hormonal rhythm, with guided headache stretches and morning supplement safety.",
    component: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3.5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Daily Movement</span>
            <div className="text-xl font-black text-[var(--text-primary)]">185 / 300 kcal</div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 w-[62%]" />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3.5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Hydration Volume</span>
            <div className="text-xl font-black text-[var(--text-primary)]">1,750 / 2,000 ml</div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[85%]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🍳</span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Morning Mineral Supplement</p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300">Taken with avocado toast — zero morning headache</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-bold">
            Logged
          </span>
        </div>

        <div className="rounded-2xl border border-violet-500/30 bg-violet-50/60 dark:bg-violet-500/10 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧘‍♀️</span>
            <div>
              <span className="font-bold text-[var(--text-primary)]">Restorative Pelvic & Spine Flow</span>
              <p className="text-[11px] text-[var(--text-secondary)]">12 mins • Multi-Angle Video Guide</p>
            </div>
          </div>
          <span className="rounded-lg bg-violet-600 px-3 py-1 font-bold text-white text-[11px]">Play Guide</span>
        </div>
      </div>
    ),
  },

  prayer: {
    tabId: "prayer",
    badge: "🕌 Spiritual Alignment & Prayer Tracker",
    title: "Salah Synchronization & Auto-Exemption",
    description: "Never miss prayer times together with real-time prayer calculations and compassionate cycle auto-pause features.",
    component: (
      <div className="space-y-3">
        {[
          { name: "Fajr", time: "5:18 AM", status: "Completed", icon: "🌅", done: true },
          { name: "Dhuhr", time: "12:32 PM", status: "Completed", icon: "☀️", done: true },
          { name: "Asr", time: "3:58 PM", status: "Completed", icon: "🌤️", done: true },
          { name: "Maghrib", time: "6:24 PM", status: "Next in 42m", icon: "🌇", done: false },
          { name: "Isha", time: "7:48 PM", status: "Upcoming", icon: "🌙", done: false },
        ].map((p) => (
          <div
            key={p.name}
            className={cn(
              "flex items-center justify-between rounded-2xl border p-3.5 transition-colors",
              p.done
                ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/10"
                : "border-[var(--glass-border)] bg-[var(--bg-secondary)]"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{p.icon}</span>
              <div>
                <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-2 font-mono font-medium">{p.time}</span>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                p.done
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-200/80 dark:bg-white/10 text-[var(--text-secondary)]"
              )}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },

  partner: {
    tabId: "partner",
    badge: "💌 Intimate Partner Space & Shared Notes",
    title: "Empathetic Connection & Day Passes",
    description: "Coordinate leave requests when feeling unwell, share thoughtful notes, and manage mutual chores with ease.",
    component: (
      <div className="space-y-3">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold">
              Rest Day Pass Requested
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">Today</span>
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            Fatima requested leave from cooking & chores due to mild cramping.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="rounded-xl bg-rose-600 px-3.5 py-1 text-xs font-bold text-white shadow-xs">
              Approved by Ahmed 💕
            </span>
            <span className="text-xs text-[var(--text-secondary)]">&quot;Rest up, dinner is on me tonight!&quot;</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2">
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            Shared Grocery & Meal Note
          </span>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            🛒 Spinach, avocados, magnesium glycinate & electrolyte powder for cycle recovery.
          </p>
        </div>
      </div>
    ),
  },
};

// ============================================================================
// MAIN LANDING COMPONENT
// ============================================================================

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<PreviewTab>("couple");
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Direct users to login or dashboard immediately
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hasToken = Boolean(localStorage.getItem("uhc_auth_token"));
      const hasFlag = localStorage.getItem("uhc_logged_in") === "true";
      if (hasToken || hasFlag) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
      return;
    }

    api
      .get("/auth/user")
      .then((res) => {
        if (res?.user || res?.id) {
          if (typeof window !== "undefined") {
            localStorage.setItem("uhc_logged_in", "true");
          }
          router.replace("/dashboard");
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("uhc_logged_in");
          }
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("uhc_logged_in");
        }
        setIsCheckingAuth(false);
      });
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-rose-500 text-white font-black text-xl shadow-lg shadow-violet-500/25 animate-pulse">
            U
          </div>
          <p className="text-xs font-semibold text-[var(--text-tertiary)]">Loading UHC Care...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative transition-colors duration-300">
      {/* Dynamic Ambient Background Blur Lights */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-violet-600/15 to-purple-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-[35%] -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-rose-500/12 to-pink-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-[20%] h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/8 blur-[130px]" />

      {/* ==================================================================== */}
      {/* NAVIGATION BAR */}
      {/* ==================================================================== */}
      <header className="relative z-30 mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <nav className="flex items-center justify-between rounded-2xl sm:rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)]/80 px-3 py-2.5 sm:px-6 sm:py-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/icon-192.png"
              alt="UHC Care"
              className="h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-xl sm:rounded-2xl shadow-lg object-contain"
            />
            <div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-primary)]">
                UHC Care
              </span>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] hidden sm:block">
                Couple Routine & Wellness OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-xl px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-600/25 hover:shadow-violet-600/40 hover:opacity-95 transition-all"
            >
              <span className="hidden sm:inline">Open Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ==================================================================== */}
      {/* HERO SECTION WITH INTERACTIVE 4-IN-1 LIVE PREVIEW */}
      {/* ==================================================================== */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 pt-6 pb-12 sm:pt-10 sm:pb-20 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column: Headline & CTA */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-violet-700 dark:text-violet-300"
            >
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              The Private Operating System for Couples Growing in Harmony
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-[1.1]"
            >
              Build a calmer,{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-rose-500 bg-clip-text text-transparent">
                healthier life
              </span>{" "}
              together every single day.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl text-sm sm:text-lg text-[var(--text-secondary)] leading-relaxed font-normal"
            >
              Sync daily habits, mutual prayer routines, full 28-day hormonal fitness, headache prevention, and heartfelt accountability in one private, beautifully encrypted haven.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-violet-600/30 hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex-1 sm:flex-initial"
              >
                <span>Launch Your Space</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-5 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all flex-1 sm:flex-initial"
              >
                <span>Sign In</span>
              </Link>
            </motion.div>

            {/* Quick Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4 text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)]"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>End-to-End SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-violet-500" />
                <span>Zero Ads • 100% Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500 fill-current" />
                <span>Cycle-Adapted Wellness</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive 4-in-1 Showcase Card — Hidden on mobile for clean layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl"
          >
            {/* Interactive Tab Selectors */}
            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-1.5 mb-6">
              {[
                { id: "couple", label: "Couple Sync", icon: Users },
                { id: "vitality", label: "Cycle & Fitness", icon: Dumbbell },
                { id: "prayer", label: "Salah Habits", icon: Moon },
                { id: "partner", label: "Care Notes", icon: Heart },
              ].map((t) => {
                const Icon = t.icon;
                const isCurrent = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as PreviewTab)}
                    className={cn(
                      "flex items-center gap-1.5 flex-1 justify-center rounded-xl py-2 px-2.5 text-xs font-bold transition-all select-none",
                      isCurrent
                        ? "bg-violet-600 text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Card Content Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    {PREVIEWS[activeTab].badge}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                    {PREVIEWS[activeTab].title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
                    {PREVIEWS[activeTab].description}
                  </p>
                </div>

                <div className="pt-2">{PREVIEWS[activeTab].component}</div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3 CORE PILLARS OVERVIEW */}
      {/* ==================================================================== */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[var(--glass-border)]">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="rounded-full bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider border border-violet-500/20">
            A Thoughtful Complete System
          </span>
          <h2 className="text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
            Everything you need to thrive as a couple.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Designed to replace scattered apps, forgotten reminders, and missed check-ins with an intuitive, unified sanctuary.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Pillar 1 */}
          <div className="card-interactive rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-8 space-y-4 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Shared Routines & Streak OS
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Design daily morning, evening, and weekend routines. Track mutual habit streaks with friendly nudges and celebratory milestones.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-semibold text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Custom recurrence (daily, weekdays, specific days)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Interactive routine library with 1-tap prebuilts</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="card-interactive rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-8 space-y-4 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30">
              <CalendarHeart className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Cycle-Synced Fitness & Relief
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Adaptive workouts matched to her 4 hormonal phases (Menstrual, Follicular, Ovulatory, Luteal), with multi-angle form tutorials and headache prevention.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-semibold text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Front & side angle exercise form video guides</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Morning mineral supplement safety protocol</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="card-interactive rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-8 space-y-4 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
              <Moon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Salah Tracking & Rest Passes
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Never miss daily prayers together. Automatic cycle prayer pauses ensure complete peace of mind, alongside compassionate leave requests.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-semibold text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Automatic exemption during menstrual days</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Request and approve rest day passes in 1 tap</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FINAL INVITATION CALL TO ACTION */}
      {/* ==================================================================== */}
      <section className="relative z-20 mx-auto max-w-5xl px-4 py-12 sm:py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-rose-600/10 p-6 sm:p-14 text-center backdrop-blur-xl shadow-xl">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="rounded-full bg-violet-600 text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Start Free Today
            </span>
            <h2 className="text-2xl font-black text-[var(--text-primary)] sm:text-4xl">
              Ready to elevate your daily routine together?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Step into your private couple sanctuary. Track your streaks, nurture each other&apos;s wellness, and celebrate consistency every single day.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-600/30 hover:opacity-95 transition-all"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-7 py-4 text-base font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                Create Couple Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* MINIMAL FOOTER */}
      {/* ==================================================================== */}
      <footer className="relative z-20 mx-auto max-w-7xl px-4 py-8 border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-secondary)] gap-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
            U
          </div>
          <span>UHC Care — Couple Routine & Wellness OS</span>
        </div>
        <p>© 2026 UHC Care. Handcrafted for love, health & spiritual consistency.</p>
      </footer>
    </main>
  );
}
