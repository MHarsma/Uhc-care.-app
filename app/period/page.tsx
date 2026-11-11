"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  periodApi,
  PeriodEntry,
  ActiveCycleSummary,
} from "@/lib/api/period";
import { symptomApi } from "@/lib/api/symptoms";
import { api } from "@/lib/api/client";
import {
  CalendarHeart,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Check,
  Clock,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Heart,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Flame,
  Sun,
  Moon,
  Smile,
  Activity,
  Info,
  CheckCircle2,
  Feather,
  Zap,
  Coffee,
  BedDouble,
  Dumbbell,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CycleDietSection } from "@/components/period/cycle-diet-section";

// ============================================================================
// FLO-INSPIRED CYCLE PHASE DEFINITIONS & METADATA
// ============================================================================
type PhaseType = "menstrual" | "follicular" | "ovulation" | "luteal";

interface PhaseInfo {
  type: PhaseType;
  title: string;
  subtitle: string;
  dayRange: string;
  startDay: number;
  endDay: number;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  energyLevel: string;
  fertilityChance: string;
  pregnancyRisk: "Low" | "Medium" | "Peak" | "Very Low";
  icon: string;
  description: string;
  nutritionTip: string;
  exerciseTip: string;
  partnerTip: string;
  salahStatus: "Exempt (Paused)" | "Obligatory (Active)";
}

const CYCLE_PHASES: Record<PhaseType, PhaseInfo> = {
  menstrual: {
    type: "menstrual",
    title: "Menstrual Phase",
    subtitle: "Rest, Reset & Renewal",
    dayRange: "Days 1 – 5",
    startDay: 1,
    endDay: 5,
    colorHex: "#F43F5E",
    badgeBg: "bg-rose-500/15 border-rose-500/30",
    badgeText: "text-rose-600 dark:text-rose-400",
    gradient: "from-rose-500 via-pink-600 to-rose-700",
    energyLevel: "Lowest • Prioritize gentle rest",
    fertilityChance: "Very Low",
    pregnancyRisk: "Very Low",
    icon: "🩸",
    description: "The uterine lining sheds. Estrogen and progesterone are at their baseline. Your body is directing its energy inward.",
    nutritionTip: "Rich iron foods, warm broths, ginger tea, dark chocolate, and plenty of electrolytes.",
    exerciseTip: "Gentle stretching, restorative yoga, relaxed walks, and guilt-free sleep.",
    partnerTip: "Offer back massages, prepare warm herbal tea, and handle demanding chores without being asked 💕",
    salahStatus: "Exempt (Paused)",
  },
  follicular: {
    type: "follicular",
    title: "Follicular Phase",
    subtitle: "Rising Vitality & Creativity",
    dayRange: "Days 6 – 13",
    startDay: 6,
    endDay: 13,
    colorHex: "#8B5CF6",
    badgeBg: "bg-violet-500/15 border-violet-500/30",
    badgeText: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-600 via-indigo-600 to-purple-700",
    energyLevel: "Rising • Sharp focus & motivation",
    fertilityChance: "Low to Medium (Approaching fertile window)",
    pregnancyRisk: "Medium",
    icon: "🌱",
    description: "Estrogen climbs as follicles mature in the ovaries. Brain energy, mood, and optimism naturally increase.",
    nutritionTip: "Fermented foods, sprouted seeds, lean proteins, crisp salads, and citrus fruits.",
    exerciseTip: "Cardio, HIIT, strength building, and starting exciting new habits.",
    partnerTip: "Great time for romantic dates, trying new adventures together, and deep conversations ✨",
    salahStatus: "Obligatory (Active)",
  },
  ovulation: {
    type: "ovulation",
    title: "Ovulation Phase",
    subtitle: "Peak Vitality & High Fertility",
    dayRange: "Days 14 – 17",
    startDay: 14,
    endDay: 17,
    colorHex: "#F59E0B",
    badgeBg: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    energyLevel: "Peak • High confidence & radiance",
    fertilityChance: "Peak Fertility • Highest chance of conception",
    pregnancyRisk: "Peak",
    icon: "🌸",
    description: "An egg is released during a surge of Luteinizing Hormone (LH). Estrogen reaches its highest level.",
    nutritionTip: "Antioxidant-rich berries, asparagus, leafy greens, wild salmon, and zinc.",
    exerciseTip: "High intensity workouts, circuit training, dance sessions, and weight lifting.",
    partnerTip: "Maximum emotional connection! Flirt, compliment her glow, and express love deeply 💖",
    salahStatus: "Obligatory (Active)",
  },
  luteal: {
    type: "luteal",
    title: "Luteal Phase",
    subtitle: "Mindful Harmony & Comfort",
    dayRange: "Days 18 – 28",
    startDay: 18,
    endDay: 28,
    colorHex: "#06B6D4",
    badgeBg: "bg-cyan-500/15 border-cyan-500/30",
    badgeText: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-600 via-teal-600 to-indigo-700",
    energyLevel: "Gradual decline • PMS awareness",
    fertilityChance: "Low",
    pregnancyRisk: "Low",
    icon: "🌙",
    description: "Progesterone dominates to prepare the body. Metabolism speeds up slightly, but physical endurance lowers.",
    nutritionTip: "Magnesium-rich pumpkin seeds, sweet potatoes, complex grains, calming chamomile.",
    exerciseTip: "Moderate pilates, nature walks, calming breathwork, and early bedtime.",
    partnerTip: "Be extra patient, validate feelings without offering unsolicited solutions, and provide comfort foods 🫂",
    salahStatus: "Obligatory (Active)",
  },
};

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SYMPTOM_OPTIONS = [
  { id: "cramps", label: "Cramps", icon: "🩸" },
  { id: "headache", label: "Headache", icon: "🤕" },
  { id: "bloating", label: "Bloating", icon: "🎈" },
  { id: "acne", label: "Acne", icon: "💆" },
  { id: "tender_breasts", label: "Tender Breasts", icon: "🌸" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "backache", label: "Backache", icon: "⚡" },
  { id: "insomnia", label: "Insomnia", icon: "🌙" },
];

const MOOD_OPTIONS = [
  { id: "happy", label: "Happy", icon: "😊" },
  { id: "calm", label: "Calm", icon: "😌" },
  { id: "energetic", label: "Energetic", icon: "⚡" },
  { id: "sensitive", label: "Sensitive", icon: "🥺" },
  { id: "irritable", label: "Irritable", icon: "😤" },
  { id: "tired", label: "Exhausted", icon: "🥱" },
];

const FLOW_OPTIONS = [
  { id: "none", label: "No Flow", desc: "No discharge", drops: 0 },
  { id: "spotting", label: "Spotting", desc: "A few drops", drops: 1 },
  { id: "light", label: "Light", desc: "Minor flow", drops: 2 },
  { id: "medium", label: "Medium", desc: "Regular flow", drops: 3 },
  { id: "heavy", label: "Heavy", desc: "Heavy flow", drops: 4 },
];

// Helper to determine phase based on cycle day
function getPhaseForCycleDay(cycleDay: number, cycleLength = 28): PhaseInfo {
  const normDay = ((cycleDay - 1) % cycleLength) + 1;
  if (normDay <= 5) return CYCLE_PHASES.menstrual;
  if (normDay <= 13) return CYCLE_PHASES.follicular;
  if (normDay <= 17) return CYCLE_PHASES.ovulation;
  return CYCLE_PHASES.luteal;
}

// Timezone-safe UTC date difference calculation to prevent timezone offset shifts
function parseUtcDate(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function diffDaysUtc(fromStr: string, toStr: string): number {
  const t1 = parseUtcDate(fromStr);
  const t2 = parseUtcDate(toStr);
  return Math.round((t2 - t1) / 86400000);
}

function getLocalTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PeriodTrackingPage() {
  const [periods, setPeriods] = React.useState<PeriodEntry[]>([]);
  const [activeSummary, setActiveSummary] = React.useState<ActiveCycleSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [isFemale, setIsFemale] = React.useState<boolean>(false);
  const [isPartnerView, setIsPartnerView] = React.useState<boolean>(false);
  const [isPaired, setIsPaired] = React.useState<boolean>(false);
  const [targetName, setTargetName] = React.useState<string>("");
  const [periodTrackingEnabled, setPeriodTrackingEnabled] = React.useState<boolean>(true);

  // Strictly only the female partner has the rights to update, log, or delete period dates
  const canManagePeriods = React.useMemo(() => {
    return Boolean(isFemale);
  }, [isFemale]);

  // Calendar View State
  const [currentCalendarDate, setCurrentCalendarDate] = React.useState(new Date());
  const [selectedDayDate, setSelectedDayDate] = React.useState<string>(getLocalTodayStr());

  // Log / Edit Period Modal
  const [isPeriodModalOpen, setIsPeriodModalOpen] = React.useState(false);
  const [editingPeriodId, setEditingPeriodId] = React.useState<number | null>(null);
  const [modalStartDate, setModalStartDate] = React.useState("");
  const [modalEndDate, setModalEndDate] = React.useState("");
  const [modalIsOngoing, setModalIsOngoing] = React.useState(true);
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [cycleLogsFilter, setCycleLogsFilter] = React.useState<"all" | "month">("all");

  // Symptoms & Mood Sheet (Flo Daily Log)
  const [isSymptomDrawerOpen, setIsSymptomDrawerOpen] = React.useState(false);
  const [dailySymptomsMap, setDailySymptomsMap] = React.useState<Record<string, {
    flow?: string;
    mood?: string;
    symptoms?: string[];
    notes?: string;
  }>>({});

  const todayStr = React.useMemo(() => {
    return getLocalTodayStr();
  }, []);

  // Load saved symptom logs from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("uhc_period_symptoms_v2");
      if (saved) {
        setDailySymptomsMap(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch symptom log for selected day from server (supports both female user and partner view)
  React.useEffect(() => {
    let isCancelled = false;
    async function fetchSymptom() {
      try {
        const res = await symptomApi.getToday(selectedDayDate);
        if (res?.symptom && !isCancelled) {
          const s = res.symptom;
          setDailySymptomsMap((prev) => ({
            ...prev,
            [selectedDayDate]: {
              flow: s.flow_level ? s.flow_level.charAt(0).toUpperCase() + s.flow_level.slice(1) : undefined,
              mood: s.mood ? s.mood.charAt(0).toUpperCase() + s.mood.slice(1) : undefined,
              symptoms: s.symptoms || [],
              notes: s.notes || undefined,
            },
          }));
        }
      } catch (err) {
        // quiet fallback
      }
    }
    if (selectedDayDate) {
      fetchSymptom();
    }
    return () => {
      isCancelled = true;
    };
  }, [selectedDayDate]);

  const saveSymptomLog = async (
    dateStr: string,
    logData: { flow?: string; mood?: string; symptoms?: string[]; notes?: string }
  ) => {
    // 1. Optimistic update to local state & cache
    setDailySymptomsMap((prev) => {
      const next = { ...prev, [dateStr]: logData };
      try {
        localStorage.setItem("uhc_period_symptoms_v2", JSON.stringify(next));
      } catch {}
      return next;
    });
    setIsSymptomDrawerOpen(false);

    // 2. Persist to backend and dispatch real-time empathetic notification to partner
    try {
      await symptomApi.save({
        date: dateStr,
        flow_level: logData.flow?.toLowerCase(),
        mood: logData.mood?.toLowerCase(),
        symptoms: logData.symptoms,
        cramps_severity: logData.symptoms?.some((s) => s.toLowerCase().includes("cramp")) ? "moderate" : "none",
        notes: logData.notes,
      });
    } catch (err) {
      console.error("Failed to persist symptoms to server:", err);
    }
  };

  // Dedicated Daily Symptoms State & Quick-Log
  const [inlineFlow, setInlineFlow] = React.useState<string>("none");
  const [inlineMood, setInlineMood] = React.useState<string>("");
  const [inlineSymptoms, setInlineSymptoms] = React.useState<string[]>([]);
  const [inlineNotes, setInlineNotes] = React.useState<string>("");
  const [isSavingInlineSymptom, setIsSavingInlineSymptom] = React.useState(false);
  const [inlineSymptomToast, setInlineSymptomToast] = React.useState<string | null>(null);
  const [nudgeSentToast, setNudgeSentToast] = React.useState<string | null>(null);

  // Sync inline state whenever today's symptom data updates
  React.useEffect(() => {
    const todayLog = dailySymptomsMap[todayStr];
    if (todayLog) {
      if (todayLog.flow) setInlineFlow(todayLog.flow);
      if (todayLog.mood) setInlineMood(todayLog.mood);
      if (todayLog.symptoms) setInlineSymptoms(todayLog.symptoms);
      if (todayLog.notes) setInlineNotes(todayLog.notes);
    }
  }, [dailySymptomsMap, todayStr]);

  const toggleInlineSymptom = (label: string) => {
    setInlineSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleSaveInlineSymptom = async () => {
    setIsSavingInlineSymptom(true);
    try {
      await saveSymptomLog(todayStr, {
        flow: inlineFlow,
        mood: inlineMood,
        symptoms: inlineSymptoms,
        notes: inlineNotes,
      });
      setInlineSymptomToast("Check-in saved & synced with partner! 🌸");
      setTimeout(() => setInlineSymptomToast(null), 3500);
    } catch (err) {
      console.error("Failed to save daily symptoms:", err);
    } finally {
      setIsSavingInlineSymptom(false);
    }
  };

  const handleSendCaringNudge = async () => {
    try {
      await api.post("/notifications/nudge", {
        message: "Sending love! Hope you are feeling comfortable and cared for today 💕",
      });
      setNudgeSentToast("Caring nudge sent to your partner! ☕");
      setTimeout(() => setNudgeSentToast(null), 3500);
    } catch (err) {
      console.error("Failed to send nudge:", err);
    }
  };

  const loadData = React.useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const res = await periodApi.getPeriods();
      setPeriods(res.periods || []);
      setActiveSummary(res.active_summary || null);
      if (typeof res.is_female === "boolean") {
        setIsFemale(res.is_female);
      }
      setIsPartnerView(Boolean(res.is_partner_view));
      if (typeof res.is_paired === "boolean") {
        setIsPaired(res.is_paired);
      }
      setTargetName(res.target_name || "");
      if (typeof res.period_tracking_enabled === "boolean") {
        setPeriodTrackingEnabled(res.period_tracking_enabled);
      }
    } catch (err: any) {
      if (err?.status === 403) {
        setError("Cycle & Period tracking is exclusively available for female accounts.");
      } else {
        setError(err?.message || "Unable to load cycle history.");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Derive latest period date & cycle estimates
  const latestPeriod = React.useMemo(() => {
    if (periods.length === 0) return null;
    return periods.slice().sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
  }, [periods]);

  const cycleLength = 28; // Standard average or derived
  const periodLength = 5;

  // Calculate current cycle day relative to latest period start date
  const currentCycleDay = React.useMemo(() => {
    if (!latestPeriod) return null;
    const diffDays = diffDaysUtc(latestPeriod.start_date, todayStr) + 1;
    if (diffDays < 1) return 1;
    // Normalize cycle day to cycle length (1..cycleLength) so it doesn't run away past 28
    return ((diffDays - 1) % cycleLength) + 1;
  }, [latestPeriod, todayStr, cycleLength]);

  // Robust period active status check
  const isPeriodActive = React.useMemo(() => {
    if (activeSummary?.has_active_period || activeSummary?.is_active) return true;
    if (latestPeriod && (!latestPeriod.end_date || latestPeriod.is_ongoing)) {
      // If ongoing and started today or in the past
      return diffDaysUtc(latestPeriod.start_date, todayStr) >= 0;
    }
    return false;
  }, [activeSummary, latestPeriod, todayStr]);

  const currentPhase = React.useMemo(() => {
    if (!currentCycleDay) {
      return isPeriodActive ? CYCLE_PHASES.menstrual : CYCLE_PHASES.follicular;
    }
    if (isPeriodActive) {
      return CYCLE_PHASES.menstrual;
    }
    return getPhaseForCycleDay(currentCycleDay, cycleLength);
  }, [currentCycleDay, isPeriodActive, cycleLength]);

  const nextPeriodInDays = React.useMemo(() => {
    if (!currentCycleDay) return null;
    const normDay = ((currentCycleDay - 1) % cycleLength) + 1;
    const remaining = cycleLength - normDay + 1;
    return remaining > 0 ? remaining : 1;
  }, [currentCycleDay, cycleLength]);

  // Handlers for 1-Tap Period start / end
  const handleStartToday = async () => {
    setActionLoading(true);
    try {
      await periodApi.logPeriod({ start_date: todayStr, end_date: null });
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || "Failed to log period start.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndToday = async () => {
    if (!activeSummary?.active_period_id && !latestPeriod) return;
    const targetId = activeSummary?.active_period_id || latestPeriod?.id;
    if (!targetId) return;

    setActionLoading(true);
    try {
      await periodApi.updatePeriod(targetId, {
        end_date: todayStr,
      });
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || "Failed to end period.");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = (suggestedDate?: string, defaultDays?: number) => {
    setEditingPeriodId(null);
    const start = typeof suggestedDate === "string" ? suggestedDate : selectedDayDate || todayStr;
    setModalStartDate(start);
    if (defaultDays && defaultDays > 0) {
      const startMs = parseUtcDate(start);
      const endD = new Date(startMs + (defaultDays - 1) * 86400000);
      const endStr = `${endD.getUTCFullYear()}-${String(endD.getUTCMonth() + 1).padStart(2, "0")}-${String(endD.getUTCDate()).padStart(2, "0")}`;
      setModalEndDate(endStr);
      setModalIsOngoing(false);
    } else {
      setModalEndDate("");
      setModalIsOngoing(start === todayStr);
    }
    setModalError(null);
    setIsPeriodModalOpen(true);
  };

  const applyPresetDuration = (days: number) => {
    if (!modalStartDate) return;
    const startMs = parseUtcDate(modalStartDate);
    const endD = new Date(startMs + (days - 1) * 86400000);
    const endStr = `${endD.getUTCFullYear()}-${String(endD.getUTCMonth() + 1).padStart(2, "0")}-${String(endD.getUTCDate()).padStart(2, "0")}`;
    setModalEndDate(endStr);
    setModalIsOngoing(false);
  };

  const handleEditActiveStartDate = () => {
    const activePeriod = periods.find((p) => p.id === activeSummary?.active_period_id) || latestPeriod;
    if (activePeriod) {
      openEditModal(activePeriod);
    } else {
      openCreateModal();
    }
  };

  const openEditModal = (entry: PeriodEntry) => {
    setEditingPeriodId(entry.id);
    setModalStartDate(entry.start_date);
    setModalEndDate(entry.end_date || "");
    setModalIsOngoing(!entry.end_date);
    setModalError(null);
    setIsPeriodModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!canManagePeriods) {
      alert("Only the female partner has the rights to delete cycle records.");
      return;
    }
    if (!confirm("Delete this cycle record?")) return;
    setActionLoading(true);
    try {
      await periodApi.deletePeriod(id);
      // Immediately remove from local state so UI updates instantly
      setPeriods((prev) => prev.filter((p) => p.id !== id));
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || "Failed to delete period record.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePeriodModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePeriods) {
      setModalError("Only the female partner has rights to update or log cycle dates.");
      return;
    }
    setModalError(null);

    if (!modalStartDate) {
      setModalError("Start date is required.");
      return;
    }

    if (!modalIsOngoing && modalEndDate && modalEndDate < modalStartDate) {
      setModalError("End date cannot be before start date.");
      return;
    }

    setActionLoading(true);
    try {
      if (editingPeriodId) {
        const res = await periodApi.updatePeriod(editingPeriodId, {
          start_date: modalStartDate,
          end_date: modalIsOngoing ? null : modalEndDate || null,
        });
        if (res?.period) {
          setPeriods((prev) =>
            prev.map((p) => (p.id === editingPeriodId ? { ...p, ...res.period } : p))
          );
        }
      } else {
        const res = await periodApi.logPeriod({
          start_date: modalStartDate,
          end_date: modalIsOngoing ? null : modalEndDate || null,
        });
        if (res?.period) {
          setPeriods((prev) => [
            res.period,
            ...prev.filter((p) => p.start_date !== res.period.start_date),
          ]);
        }
      }
      setIsPeriodModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      setModalError(err?.message || "Failed to save cycle entry.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================================
  // CALENDAR GENERATION LOGIC
  // ==========================================================================
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthName = currentCalendarDate.toLocaleString("default", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Adjust so Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Find logged period covering the selected day (for past or present dates)
  const periodCoveringSelectedDay = React.useMemo(() => {
    if (!selectedDayDate) return null;
    return (
      periods.find((p) => {
        const sStr = p.start_date;
        const eStr = p.end_date || (p.is_ongoing ? todayStr : p.start_date);
        return selectedDayDate >= sStr && selectedDayDate <= eStr;
      }) || null
    );
  }, [periods, selectedDayDate, todayStr]);

  // Filter periods belonging to or spanning across the viewed calendar month
  const monthPeriodLogs = React.useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return periods.filter((p) => {
      const sPrefix = p.start_date.slice(0, 7);
      const ePrefix = p.end_date ? p.end_date.slice(0, 7) : monthPrefix;
      return monthPrefix >= sPrefix && monthPrefix <= ePrefix;
    });
  }, [periods, year, month]);

  const displayedPeriodLogs = React.useMemo(() => {
    if (cycleLogsFilter === "month") {
      return monthPeriodLogs;
    }
    return periods;
  }, [cycleLogsFilter, monthPeriodLogs, periods]);

  const calendarCells = React.useMemo(() => {
    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      dayName: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isPeriodDay: boolean;
      isPredictedPeriod: boolean;
      isOvulationDay: boolean;
      isFertileWindow: boolean;
      phase: PhaseInfo;
      cycleDayNumber: number | null;
      hasLoggedSymptoms: boolean;
    }> = [];

    // Pre-calculate logged period date ranges using UTC math
    const periodDates = new Set<string>();
    periods.forEach((p) => {
      const sStr = p.start_date;
      // If ongoing, only highlight the typical period duration (e.g. 5-7 days) or up to today, not indefinitely
      const eStr = p.end_date || (p.is_ongoing ? (diffDaysUtc(sStr, todayStr) > 7 ? todayStr : todayStr) : sStr);
      const totalSpan = diffDaysUtc(sStr, eStr);
      const startMs = parseUtcDate(sStr);
      for (let offset = 0; offset <= Math.max(0, totalSpan); offset++) {
        const dObj = new Date(startMs + offset * 86400000);
        const yStr = dObj.getUTCFullYear();
        const mStr = String(dObj.getUTCMonth() + 1).padStart(2, "0");
        const dayStr = String(dObj.getUTCDate()).padStart(2, "0");
        periodDates.add(`${yStr}-${mStr}-${dayStr}`);
      }
    });

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const d = new Date(year, month, day);
      const dayName = WEEKDAY_NAMES[(d.getDay() + 6) % 7];
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDayDate;
      const isPeriodDay = periodDates.has(dateStr);

      // Cycle day calculation for this cell using UTC date difference
      const isFuture = dateStr > todayStr;
      const relevantPeriod =
        periods.find((p) => p.start_date <= dateStr) || latestPeriod;
      const anchorDateStr =
        relevantPeriod?.start_date || `${year}-${String(month + 1).padStart(2, "0")}-01`;

      let cellCycleDay: number | null = null;
      const diffDays = diffDaysUtc(anchorDateStr, dateStr) + 1;
      if (diffDays >= 1) {
        cellCycleDay = ((diffDays - 1) % cycleLength) + 1;
      } else {
        // For days before the anchor, wrap backwards into a cycle
        const absDiff = Math.abs(diffDays - 1);
        cellCycleDay = cycleLength - (absDiff % cycleLength);
        if (cellCycleDay === 0) cellCycleDay = cycleLength;
      }

      const phase = cellCycleDay
        ? getPhaseForCycleDay(cellCycleDay, cycleLength)
        : isPeriodDay
        ? CYCLE_PHASES.menstrual
        : CYCLE_PHASES.follicular;

      const isOvulationDay = cellCycleDay === 14;
      const isFertileWindow = cellCycleDay !== null && cellCycleDay >= 12 && cellCycleDay <= 16;
      // Predicted period is ONLY for future dates that do not yet have a logged period
      // and NOT during an already active/ongoing period in the near future (e.g. within current 10 days)
      const isPredictedPeriod =
        isFuture &&
        !isPeriodDay &&
        !isPeriodActive &&
        cellCycleDay !== null &&
        cellCycleDay <= periodLength;
      const hasLoggedSymptoms = Boolean(dailySymptomsMap[dateStr]);

      cells.push({
        dateStr,
        dayNumber: day,
        dayName,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isPeriodDay,
        isPredictedPeriod,
        isOvulationDay,
        isFertileWindow,
        phase,
        cycleDayNumber: cellCycleDay,
        hasLoggedSymptoms,
      });
    }

    return cells;
  }, [year, month, daysInMonth, periods, latestPeriod, todayStr, selectedDayDate, dailySymptomsMap, cycleLength]);

  const selectedCellData = React.useMemo(() => {
    return calendarCells.find((c) => c.dateStr === selectedDayDate) || null;
  }, [calendarCells, selectedDayDate]);

  const selectedDateLogged = dailySymptomsMap[selectedDayDate] || {};

  return (
    <AppShell
      headerTitle="Cycle & Wellness"
      headerSubtitle="Smart cycle phases, calendar tracking & habit protection"
      headerAction={
        canManagePeriods && !isPeriodActive ? (
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-rose-500/20 active:scale-95 press-effect"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Log Period</span>
          </button>
        ) : null
      }
    >
      <div className="space-y-8 max-w-6xl pb-12">
        {loading ? (
          <div className="space-y-4">
            <div className="h-56 w-full rounded-3xl shimmer" />
            <div className="h-96 w-full rounded-3xl shimmer" />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto rounded-3xl border border-rose-500/25 bg-rose-500/5 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {error.includes("female") ? "Access Restricted" : "Unable to load cycle data"}
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              {error}
            </p>
            {!error.includes("female") && (
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
            )}
          </div>
        ) : !isFemale && !isPartnerView ? (
          <div className="max-w-lg mx-auto rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 text-3xl">
              🌸
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Cycle & Period Care
            </h2>
            {isPaired || targetName ? (
              <>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  You are paired with <strong className="text-[var(--text-primary)]">{targetName || "your partner"}</strong>.
                  Cycle tracking is customized for female profiles. If your partner is female, she can set her gender to &ldquo;Female&rdquo; in <strong>Settings → Profile</strong> and ensure <strong>Period Sharing</strong> is turned on so her real-time cycle phases, ovulation predictions, and care tips display here for you.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link
                    href="/partner"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Go to Partner Hub</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Cycle tracking and period management are customized for female accounts.
                  If your partner is female, pair with her in the Partner Space to view her cycle phases, daily care insights, and helpful suggestions on how to support her.
                </p>
                <div className="pt-2">
                  <Link
                    href="/pairing"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Pair with Partner</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : isPartnerView && !periodTrackingEnabled ? (
          /* Partner hasn't enabled period sharing yet */
          <div className="max-w-lg mx-auto rounded-3xl border border-amber-500/25 bg-amber-500/5 p-8 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 text-3xl">
              🔒
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Period Details Not Shared Yet
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">{targetName || "Your partner"}</strong> hasn’t enabled period sharing with you yet.
              Once she turns on <em>"Share my period details with partner"</em> in her <strong>Settings → Period Tracking</strong>, her cycle phases,
              daily symptoms, and care tips will automatically appear here.
            </p>
            <div className="mt-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 text-left">
              <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                What you’ll see once she shares:
              </p>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">•</span> Current cycle phase & day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">•</span> How she’s feeling (symptoms, mood, energy)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">•</span> Partner care tips for what she needs today
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">•</span> Nutrition & exercise guidance per phase
                </li>
              </ul>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] italic">
              Tip: Gently ask her to enable period sharing — it helps you support her better ❤️
            </p>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* 1. FLO-INSPIRED HERO CYCLE DIAL & STATUS BANNER              */}
            {/* ============================================================ */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-purple-800 p-6 sm:p-10 text-white shadow-2xl shadow-rose-500/25 border border-white/10">
              {/* Ambient Orbs */}
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
                {/* Left: Phase Title, Day Counter & Insight */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20">
                      <span>{currentPhase.icon}</span>
                      <span>{currentPhase.title}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                      <Clock className="h-3 w-3 text-rose-200" />
                      <span>{currentPhase.dayRange}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 border border-emerald-300/30 px-3 py-1 text-xs font-bold text-emerald-100">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Salah: {currentPhase.salahStatus}</span>
                    </span>

                    {isPartnerView && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/30 border border-amber-300/30 px-3 py-1 text-xs font-bold text-amber-100">
                        <Heart className="h-3 w-3 fill-amber-200" />
                        <span>Supporting {targetName || "Partner"}</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                    {currentCycleDay ? `Cycle Day ${currentCycleDay}` : "No Active Cycle"}
                  </h1>

                  <p className="mt-2 text-base font-bold text-rose-100">
                    {currentPhase.subtitle} • {currentPhase.fertilityChance}
                  </p>

                  <p className="mt-3 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
                    {currentPhase.description}
                  </p>

                  {/* Partner Guidance Tip if viewing as partner */}
                  {isPartnerView && (
                    <div className="mt-4 rounded-2xl bg-white/15 p-4 border border-white/20 backdrop-blur-md max-w-xl">
                      <p className="text-[11px] font-bold text-rose-200 uppercase tracking-wider">
                        How to support {targetName || "her"} today:
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {currentPhase.partnerTip}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons: Only for the female user herself (not partner view) */}
                  {canManagePeriods && (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {isPeriodActive ? (
                        <>
                          <button
                            type="button"
                            onClick={handleEndToday}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white text-rose-700 px-5 py-3 text-xs font-extrabold shadow-lg hover:bg-rose-50 active:scale-95 transition-all press-effect"
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>End Period Today</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleEditActiveStartDate}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/25 text-white px-4 py-3 text-xs font-bold backdrop-blur-md active:scale-95 transition-all"
                            title="Edit Period Start Date"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit Start Date</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleStartToday}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white text-rose-700 px-5 py-3 text-xs font-extrabold shadow-lg hover:bg-rose-50 active:scale-95 transition-all press-effect"
                          >
                            <Droplet className="h-4 w-4 fill-rose-600 text-rose-600" />
                            <span>Start Period Today</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openCreateModal()}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/25 text-white px-4 py-3 text-xs font-bold backdrop-blur-md active:scale-95 transition-all"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Choose Start Date...</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsSymptomDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition-all active:scale-95"
                      >
                        <Smile className="h-4 w-4" />
                        <span>Log Daily Symptoms</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Circular Phase Progress Dial */}
                <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-black/20 backdrop-blur-md border border-white/15 text-center">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/20"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-300 transition-all duration-700 ease-out"
                        strokeDasharray={`${Math.min(100, Math.round(((currentCycleDay || 1) / cycleLength) * 100))}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black">{currentCycleDay || "--"}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                        of {cycleLength} Days
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-bold text-amber-200">
                      {isPeriodActive
                       ? `Period Active • Day ${latestPeriod?.start_date ? Math.max(1, diffDaysUtc(latestPeriod.start_date, todayStr) + 1) : (activeSummary?.current_cycle_day || currentCycleDay || 1)}`
                       : nextPeriodInDays !== null ? `Period in ~${nextPeriodInDays} days` : "Regular 28-day model"}
                    </p>
                    <p className="text-[10px] text-white/70 mt-0.5">
                      Pregnancy chance: <strong className="text-white">{currentPhase.pregnancyRisk}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* DEDICATED DAILY SYMPTOMS & WELLNESS CHECK-IN HUB             */}
            {/* ============================================================ */}
            {!isPartnerView ? (
              /* For Her: Dedicated 1-Tap Daily Symptom & Mood Logger */
              <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-sm glass-card space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--glass-border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                        <Smile className="h-4 w-4" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                        Daily Symptoms & Mood Log 🌸
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Fast 1-tap check-in for today. Updates your calendar and syncs care advice for your partner.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {inlineSymptomToast && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {inlineSymptomToast}
                      </span>
                    )}
                    {dailySymptomsMap[todayStr]?.mood || dailySymptomsMap[todayStr]?.symptoms?.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2.5 py-0.5 text-xs font-bold">
                        <Check className="h-3 w-3 stroke-[3]" /> Logged Today
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
                        Pending Today
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. Blood Flow Intensity */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between">
                    <span>1. Blood Flow Intensity</span>
                    <span className="text-[11px] font-bold text-rose-500">
                      Selected: {inlineFlow ? inlineFlow : "None"}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {FLOW_OPTIONS.map((f) => {
                      const isSelected =
                        inlineFlow.toLowerCase() === f.label.toLowerCase() ||
                        inlineFlow.toLowerCase() === f.id.toLowerCase();
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setInlineFlow(f.label)}
                          className={cn(
                            "p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 active:scale-95 cursor-pointer min-h-[72px]",
                            isSelected
                              ? "border-rose-500 bg-rose-500 text-white font-black shadow-md shadow-rose-500/25 ring-2 ring-rose-300"
                              : "border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-rose-500/40 hover:bg-rose-500/5 font-semibold"
                          )}
                        >
                          <div className="flex items-center justify-center gap-0.5 h-5">
                            {f.drops === 0 ? (
                              <span className={cn("text-xs font-bold", isSelected ? "text-rose-100" : "text-[var(--text-muted)]")}>
                                —
                              </span>
                            ) : (
                              Array.from({ length: f.drops }).map((_, i) => (
                                <Droplet
                                  key={i}
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    isSelected
                                      ? "fill-white text-white drop-shadow-xs"
                                      : "fill-rose-500 text-rose-500"
                                  )}
                                />
                              ))
                            )}
                          </div>
                          <div className="text-center w-full">
                            <p className={cn("text-xs font-extrabold leading-tight", isSelected ? "text-white" : "text-[var(--text-primary)]")}>
                              {f.label}
                            </p>
                            <p className={cn("text-[10px] mt-0.5 leading-none", isSelected ? "text-rose-100" : "text-[var(--text-tertiary)]")}>
                              {f.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mood & Energy */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between">
                    <span>2. Mood & Sensations</span>
                    <span className="text-[11px] font-bold text-violet-500">{inlineMood || "Select mood"}</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {MOOD_OPTIONS.map((m) => {
                      const isSelected = inlineMood.toLowerCase() === m.label.toLowerCase();
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setInlineMood(m.label)}
                          className={cn(
                            "p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 active:scale-95",
                            isSelected
                              ? "border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-300 font-bold shadow-xs ring-2 ring-violet-500/20"
                              : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                          )}
                        >
                          <span className="text-xl">{m.icon}</span>
                          <span className="text-xs truncate w-full font-semibold">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Common Physical Symptoms */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between">
                    <span>3. Physical Symptoms</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">Tap all that apply ({inlineSymptoms.length})</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SYMPTOM_OPTIONS.map((s) => {
                      const isSelected = inlineSymptoms.includes(s.label);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleInlineSymptom(s.label)}
                          className={cn(
                            "p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 active:scale-95",
                            isSelected
                              ? "border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold ring-2 ring-rose-500/20"
                              : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                          )}
                        >
                          <span className="text-base">{s.icon}</span>
                          <span className="text-xs font-semibold truncate">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Quick Personal Note & Save */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={inlineNotes}
                    onChange={(e) => setInlineNotes(e.target.value)}
                    placeholder="Optional private note (e.g., cravings, headache intensity, energy)..."
                    className="flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                  <button
                    type="button"
                    onClick={handleSaveInlineSymptom}
                    disabled={isSavingInlineSymptom}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                  >
                    {isSavingInlineSymptom ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    )}
                    <span>{isSavingInlineSymptom ? "Saving..." : "Save Today's Check-in"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* For Him: Synced Partner Daily Health & Care Hub */
              <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-sm glass-card space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--glass-border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                        <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                        🌸 {targetName || "Partner"}&apos;s Daily Health & Sensations Today
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Live synced status so you always know how she feels and how to support her without having to ask.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {nudgeSentToast && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {nudgeSentToast}
                      </span>
                    )}
                    {dailySymptomsMap[todayStr]?.mood || dailySymptomsMap[todayStr]?.symptoms?.length || (dailySymptomsMap[todayStr]?.flow && dailySymptomsMap[todayStr]?.flow !== "none") ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
                        <Check className="h-3 w-3" /> Synced Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 text-[var(--text-tertiary)] border border-[var(--glass-border)] px-2.5 py-0.5 text-xs font-bold">
                        Awaiting Check-in
                      </span>
                    )}
                  </div>
                </div>

                {dailySymptomsMap[todayStr]?.mood || dailySymptomsMap[todayStr]?.symptoms?.length || (dailySymptomsMap[todayStr]?.flow && dailySymptomsMap[todayStr]?.flow !== "none") ? (
                  <div className="space-y-4">
                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {dailySymptomsMap[todayStr]?.flow && dailySymptomsMap[todayStr]?.flow !== "none" && (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-bold text-rose-700 dark:text-rose-300">
                          <span>Flow:</span>
                          <span>{dailySymptomsMap[todayStr].flow}</span>
                        </span>
                      )}
                      {dailySymptomsMap[todayStr]?.mood && (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 font-bold text-violet-700 dark:text-violet-300">
                          <span>Mood:</span>
                          <span>{dailySymptomsMap[todayStr].mood}</span>
                        </span>
                      )}
                    </div>

                    {/* Reported Symptoms Chips */}
                    {dailySymptomsMap[todayStr]?.symptoms && dailySymptomsMap[todayStr].symptoms.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Reported Sensations Today:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {dailySymptomsMap[todayStr].symptoms.map((symp) => (
                            <span
                              key={symp}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
                            >
                              <span>•</span> {symp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Partner Care Suggestion */}
                    <div className="rounded-2xl border border-rose-500/25 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-violet-500/10 p-4 space-y-2">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                        What She Needs From You Right Now:
                      </span>
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                        {dailySymptomsMap[todayStr]?.symptoms?.some((s) => s.toLowerCase().includes("cramp"))
                          ? `${targetName || "She"} has cramps today. Bring her a warm heating pad, brew chamomile or ginger tea, and take over any heavy chores so she can rest comfortably 💕`
                          : dailySymptomsMap[todayStr]?.symptoms?.some((s) => s.toLowerCase().includes("headache") || s.toLowerCase().includes("fatigue"))
                          ? `${targetName || "She"} is experiencing lower energy and tension today. Keep the atmosphere calming, dim bright lights, and encourage an early night of sleep.`
                          : `${targetName || "She"} is checking in with good energy. A sweet compliment, warm hug, and helping prepare dinner together will keep her smiling!`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleSendCaringNudge}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 transition-all"
                      >
                        <Heart className="h-3.5 w-3.5" />
                        <span>Send Love Nudge</span>
                      </button>
                      <Link
                        href="/notes"
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                      >
                        <span>Write Her a Sweet Note →</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-6 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 text-2xl">
                      🌸
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      {targetName || "Umaima"} hasn&apos;t checked in her symptoms today
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                      Once she opens her app and logs her mood, flow, or symptoms for today, her live updates and tailored partner care recommendations will appear right here for you.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleSendCaringNudge}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 transition-all"
                      >
                        <Coffee className="h-3.5 w-3.5" />
                        <span>Send Caring Check-in Nudge</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. THE 4 PHASES BREAKDOWN STRIP                              */}
            {/* ============================================================ */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    4 Menstrual Cycle Phases
                  </h3>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">
                  Natural hormonal rhythm & energy guide
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.values(CYCLE_PHASES).map((phase) => {
                  const isActive = currentPhase.type === phase.type;
                  return (
                    <div
                      key={phase.type}
                      className={cn(
                        "rounded-2xl p-4 border transition-all glass-card flex flex-col justify-between",
                        isActive
                          ? "border-rose-500/50 bg-rose-500/10 shadow-md ring-2 ring-rose-500/20"
                          : "border-[var(--glass-border)] bg-[var(--bg-card)] hover:border-violet-500/30"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{phase.icon}</span>
                          <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", phase.badgeBg, phase.badgeText)}>
                            {phase.dayRange}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                          {phase.title}
                        </h4>
                        <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">
                          {phase.subtitle}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-2 leading-relaxed">
                          {phase.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[var(--glass-border)] flex items-center justify-between text-[10px]">
                        <span className="text-[var(--text-muted)]">Energy</span>
                        <span className="font-bold text-[var(--text-secondary)]">{phase.energyLevel.split("•")[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================================ */}
            {/* 3. COMPACT CYCLE CALENDAR                                     */}
            {/* ============================================================ */}
            <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-sm glass-card space-y-4">
              {/* Calendar Header & Month Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentCalendarDate(new Date(year, month - 1, 1))}
                    className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] min-w-[140px] text-center">
                    {monthName} {year}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentCalendarDate(new Date(year, month + 1, 1))}
                    className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentCalendarDate(new Date());
                      setSelectedDayDate(todayStr);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-all ml-1 cursor-pointer"
                  >
                    Today
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {monthPeriodLogs.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <Droplet className="h-3 w-3 fill-rose-500 text-rose-500" />
                      <span>{monthPeriodLogs.length} cycle{monthPeriodLogs.length > 1 ? "s" : ""} logged</span>
                    </span>
                  )}

                  {canManagePeriods && (
                    <button
                      type="button"
                      onClick={() => openCreateModal(`${year}-${String(month + 1).padStart(2, "0")}-01`, 5)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Log Period in {monthName}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Color Code Legend — Exact 4-Phase Match */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>Period (Days 1–5)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-rose-400 bg-rose-500/15 text-rose-600 dark:text-rose-300 font-bold">
                  <span className="h-2 w-2 rounded-full border border-rose-400 border-dashed" />
                  <span>Predicted Period</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300 font-bold">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span>Follicular (Days 6–13)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/50 text-amber-800 dark:text-amber-200 font-bold">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Fertile Window</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-bold shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>Ovulation (Day 14)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span>Luteal (Days 18–28)</span>
                </span>
              </div>

              {/* Weekday Column Headers */}
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_NAMES.map((dayName) => (
                  <div
                    key={dayName}
                    className="py-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
                  >
                    {dayName.charAt(0)}{dayName.charAt(1)}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid — Enhanced Flo-Style Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Empty padding cells */}
                {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-12 sm:h-16" />
                ))}

                {/* Day cells */}
                {calendarCells.map((cell) => {
                  // Determine background & border matching 4-phase color system exactly
                  const cellBg = cell.isPeriodDay
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400 font-extrabold"
                    : cell.isPredictedPeriod
                    ? "bg-rose-500/10 border-2 border-dashed border-rose-400 text-rose-600 dark:text-rose-300 font-bold"
                    : cell.isOvulationDay
                    ? "bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-300"
                    : cell.isFertileWindow
                    ? "bg-amber-400/20 border border-amber-400/40 text-amber-800 dark:text-amber-200 font-semibold"
                    : cell.phase.type === "ovulation"
                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold"
                    : cell.phase.type === "follicular"
                    ? "bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300 font-semibold"
                    : cell.phase.type === "luteal"
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : cell.phase.type === "menstrual"
                    ? "bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold"
                    : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] font-semibold";

                  const selectedRing = cell.isSelected
                    ? cell.isPeriodDay
                      ? "ring-2 ring-white ring-offset-2 ring-offset-rose-500 scale-105 z-10 shadow-lg"
                      : cell.isOvulationDay
                      ? "ring-2 ring-white ring-offset-2 ring-offset-amber-500 scale-105 z-10 shadow-lg"
                      : "ring-2 ring-violet-500 ring-offset-2 ring-offset-[var(--bg-card)] scale-105 z-10 shadow-lg"
                    : "";

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => setSelectedDayDate(cell.dateStr)}
                      className={cn(
                        "relative flex flex-col items-center justify-center h-12 sm:h-16 rounded-2xl transition-all focus:outline-none select-none",
                        cellBg,
                        selectedRing,
                        cell.isToday && !cell.isPeriodDay && !cell.isOvulationDay && "ring-2 ring-violet-500/70"
                      )}
                    >
                      {/* Date number */}
                      <span className={cn(
                        "text-xs sm:text-base font-black leading-none",
                        cell.isPeriodDay || cell.isOvulationDay ? "text-white" : ""
                      )}>
                        {cell.dayNumber}
                      </span>

                      {/* Small cycle day label */}
                      {cell.cycleDayNumber && (
                        <span className={cn(
                          "text-[8px] sm:text-[10px] font-bold leading-none mt-1",
                          cell.isPeriodDay
                            ? "text-rose-100"
                            : cell.isOvulationDay
                            ? "text-amber-100"
                            : "text-[var(--text-muted)]"
                        )}>
                          D{cell.cycleDayNumber}
                        </span>
                      )}

                      {/* Period droplet icon */}
                      {cell.isPeriodDay && (
                        <Droplet className="absolute top-1 right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 fill-white text-white drop-shadow-xs" />
                      )}

                      {/* Ovulation flower/star icon */}
                      {cell.isOvulationDay && (
                        <Sparkles className="absolute top-1 right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-white fill-white drop-shadow-xs" />
                      )}

                      {/* Symptom logged indicator dot */}
                      {cell.hasLoggedSymptoms && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-violet-400 ring-1 ring-white" />
                      )}

                      {/* Today badge */}
                      {cell.isToday && (
                        <span className={cn(
                          "absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full shadow-xs",
                          cell.isPeriodDay || cell.isOvulationDay
                            ? "bg-white text-slate-900"
                            : "bg-violet-600 text-white"
                        )}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================================ */}
            {/* 4. SELECTED DAY FLO INSIGHT & WELLNESS CARD                  */}
            {/* ============================================================ */}
            {selectedCellData && (
              <motion.div
                key={selectedCellData.dateStr}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm glass-card space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--glass-border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedCellData.phase.icon}</span>
                      <div>
                        <h3 className="text-lg font-black text-[var(--text-primary)]">
                          {selectedCellData.dayName}, {selectedCellData.dateStr}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {selectedCellData.cycleDayNumber
                            ? `Cycle Day ${selectedCellData.cycleDayNumber} • ${selectedCellData.phase.title}`
                            : selectedCellData.phase.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/workout"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-3.5 py-2 text-xs font-bold text-violet-700 dark:text-violet-300 transition-colors shadow-xs"
                    >
                      <Dumbbell className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      <span>Start Today&apos;s Workout →</span>
                    </Link>

                    {!isPartnerView ? (
                      <button
                        type="button"
                        onClick={() => setIsSymptomDrawerOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all"
                      >
                        <Smile className="h-3.5 w-3.5" />
                        <span>{selectedDateLogged.mood || selectedDateLogged.symptoms?.length ? "Edit Daily Log" : "Log Symptoms"}</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                        <span>{targetName ? `${targetName}'s Daily Wellness` : "Partner's Daily Wellness"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day-Level Period Actions (Allows Editing or Adding Period for Female User; Read-Only for Partner) */}
                {canManagePeriods ? (
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {periodCoveringSelectedDay ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
                            <Droplet className="h-5 w-5 fill-white text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                Period Logged: {periodCoveringSelectedDay.start_date} → {periodCoveringSelectedDay.end_date || "Ongoing"}
                              </span>
                              {!periodCoveringSelectedDay.end_date && (
                                <span className="rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 text-[10px]">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                              {periodCoveringSelectedDay.end_date
                                ? `${diffDaysUtc(periodCoveringSelectedDay.start_date, periodCoveringSelectedDay.end_date) + 1} days recorded flow duration`
                                : "Currently active ongoing flow"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(periodCoveringSelectedDay)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] transition-all active:scale-95 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit This Period</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(periodCoveringSelectedDay.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10 text-[var(--text-tertiary)]">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">
                              No period cycle recorded on {selectedCellData.dateStr}.
                            </span>
                            <p className="text-[10px] text-[var(--text-tertiary)]">
                              Want to log a past period for this date?
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openCreateModal(selectedCellData.dateStr, 5)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Log 5-Day Period Here</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openCreateModal(selectedCellData.dateStr)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Custom Dates...</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  periodCoveringSelectedDay && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
                          <Droplet className="h-5 w-5 fill-white text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {targetName || "Partner"}&apos;s Period: {periodCoveringSelectedDay.start_date} → {periodCoveringSelectedDay.end_date || "Ongoing"}
                            </span>
                            {!periodCoveringSelectedDay.end_date && (
                              <span className="rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 text-[10px]">
                                Active Flow
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            {periodCoveringSelectedDay.end_date
                              ? `${diffDaysUtc(periodCoveringSelectedDay.start_date, periodCoveringSelectedDay.end_date) + 1} days recorded flow duration`
                              : "Currently active ongoing flow"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--glass-border)] px-2.5 py-1 rounded-lg self-start sm:self-auto">
                        Partner Read-Only View
                      </span>
                    </div>
                  )
                )}

                {/* 3 Wellness Guidance Cards with Deep Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Nutrition */}
                  <div className="rounded-2xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Coffee className="h-4 w-4" />
                        <span>Phase Nutrition</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {selectedCellData.phase.nutritionTip}
                      </p>
                    </div>
                    <Link
                      href="/workout"
                      className="mt-2 inline-flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors group"
                    >
                      <span>Log Water & Minerals</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Exercise */}
                  <div className="rounded-2xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-400">
                        <Zap className="h-4 w-4" />
                        <span>Workout & Energy</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {selectedCellData.phase.exerciseTip}
                      </p>
                    </div>
                    <Link
                      href="/workout"
                      className="mt-2 inline-flex items-center justify-between rounded-xl border border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300 transition-colors group"
                    >
                      <span>Start Guided Session & Form</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Partner Caring Tip */}
                  <div className="rounded-2xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] flex flex-col justify-between space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                      <span>Partner Synergy</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {selectedCellData.phase.partnerTip}
                    </p>
                  </div>
                </div>

                {/* Logged Symptoms on this day */}
                {selectedDateLogged.mood || selectedDateLogged.symptoms?.length || selectedDateLogged.notes ? (
                  <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                        {isPartnerView ? `${targetName || "Partner"}'s Logged Symptoms:` : "Logged for this day:"}
                      </h4>
                      {isPartnerView && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-0.5">
                          Synced Real-Time
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedDateLogged.mood && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2.5 py-1 font-bold text-[var(--text-primary)]">
                          <span>Mood:</span> {selectedDateLogged.mood}
                        </span>
                      )}
                      {selectedDateLogged.flow && selectedDateLogged.flow !== "None" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2.5 py-1 font-bold text-[var(--text-primary)]">
                          <span>Flow:</span> {selectedDateLogged.flow}
                        </span>
                      )}
                      {selectedDateLogged.symptoms?.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 font-bold text-rose-600 dark:text-rose-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {selectedDateLogged.notes && (
                      <p className="text-xs text-[var(--text-secondary)] italic mt-1">
                        &ldquo;{selectedDateLogged.notes}&rdquo;
                      </p>
                    )}

                    {/* Empathetic Partner Advice when Partner is viewing */}
                    {isPartnerView && (
                      <div className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                        <strong className="block font-bold mb-1">💕 Gentle Support Suggestion for You:</strong>
                        {selectedDateLogged.symptoms?.some((s) => s.toLowerCase().includes("cramp"))
                          ? `She noted cramps today — preparing a warm herbal tea, bringing a heating pad, or offering a gentle back massage will bring her immense comfort.`
                          : selectedDateLogged.mood?.toLowerCase().includes("exhaust") || selectedDateLogged.mood?.toLowerCase().includes("tired")
                          ? `She is running low on energy today — taking over dinner or evening chores so she can rest will mean the world.`
                          : `Stay attentive, offer caring words, and let her know you're there for whatever she needs today.`}
                      </div>
                    )}
                  </div>
                ) : isPartnerView ? (
                  <div className="p-3.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs text-[var(--text-tertiary)] flex items-center gap-2">
                    <Info className="h-4 w-4 text-[var(--text-secondary)]" />
                    <span>No specific symptoms logged by {targetName || "your partner"} for this date.</span>
                  </div>
                ) : null}
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* 4. REBUILT HORMONAL NUTRITION & DIET SANCTUARY               */}
            {/* ============================================================ */}
            <CycleDietSection currentPhaseKey={currentPhase.type} />

            {/* ============================================================ */}
            {/* 5. CYCLE HISTORY & MANAGEMENT                                */}
            {/* ============================================================ */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Past Cycle Logs ({periods.length})
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Review and edit past menstruation cycles, start dates, and durations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter tabs */}
                  <div className="inline-flex rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setCycleLogsFilter("all")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer",
                        cycleLogsFilter === "all"
                          ? "bg-rose-500 text-white font-bold shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      All ({periods.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCycleLogsFilter("month")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer",
                        cycleLogsFilter === "month"
                          ? "bg-rose-500 text-white font-bold shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {monthName} {year} ({monthPeriodLogs.length})
                    </button>
                  </div>

                  {canManagePeriods && (
                    <button
                      type="button"
                      onClick={() => openCreateModal(selectedDayDate || `${year}-${String(month + 1).padStart(2, "0")}-01`, 5)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Log Past Period</span>
                    </button>
                  )}
                </div>
              </div>

              {displayedPeriodLogs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[var(--glass-border)] glass-card p-10 text-center text-xs text-[var(--text-tertiary)] space-y-2">
                  <p>No cycle entries recorded {cycleLogsFilter === "month" ? `for ${monthName} ${year}` : "yet"}.</p>
                  {canManagePeriods && (
                    <button
                      type="button"
                      onClick={() => openCreateModal(`${year}-${String(month + 1).padStart(2, "0")}-01`, 5)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Log Period for {monthName} {year}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayedPeriodLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 glass-card flex items-center justify-between transition-all hover:border-rose-500/30"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {entry.start_date} → {entry.end_date || "Ongoing"}
                            </span>
                            {!entry.end_date && (
                              <span className="rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold px-2 py-0.5 text-[10px]">
                                Active Period
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                            {entry.duration_days
                              ? `${entry.duration_days} days total flow duration`
                              : entry.end_date
                              ? `${diffDaysUtc(entry.start_date, entry.end_date) + 1} days flow duration`
                              : "Currently ongoing active phase"}
                          </p>
                        </div>
                      </div>

                      {canManagePeriods && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(entry)}
                            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
                            title="Edit Period Dates"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* 6. LOG / EDIT PERIOD MODAL                                   */}
      {/* ============================================================ */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-card p-6 shadow-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] animate-fade-scale">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingPeriodId ? "Edit Period Dates" : "Log Period Start Date"}
              </h3>
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSavePeriodModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                  Period Start Date
                </label>
                <input
                  type="date"
                  value={modalStartDate}
                  onChange={(e) => setModalStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-rose-500 focus:bg-rose-500/5 focus:outline-none transition-all"
                  required
                />
                <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                  Select the exact date your flow began (today or any past date).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ongoing-check"
                  checked={modalIsOngoing}
                  onChange={(e) => setModalIsOngoing(e.target.checked)}
                  className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-[var(--glass-border)] bg-[var(--glass-bg)]"
                />
                <label htmlFor="ongoing-check" className="text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">
                  This period is currently ongoing
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Quick Duration Helpers (for Past Cycles)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[4, 5, 6, 7, 8].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => applyPresetDuration(days)}
                      className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:border-rose-500/50 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {!modalIsOngoing && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={modalEndDate}
                    onChange={(e) => setModalEndDate(e.target.value)}
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-rose-500 focus:bg-rose-500/5 focus:outline-none transition-all"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-[var(--glass-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPeriodModalOpen(false)}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all press-effect"
                >
                  {actionLoading ? "Saving..." : "Save Dates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. FLO-STYLE DAILY SYMPTOMS & MOOD LOG MODAL                 */}
      {/* ============================================================ */}
      {isSymptomDrawerOpen && (
        <SymptomLogModal
          dateStr={selectedDayDate}
          existingData={selectedDateLogged}
          onClose={() => setIsSymptomDrawerOpen(false)}
          onSave={(data) => saveSymptomLog(selectedDayDate, data)}
        />
      )}
    </AppShell>
  );
}

// ============================================================================
// FLO-STYLE DAILY SYMPTOMS MODAL SUBCOMPONENT
// ============================================================================
function SymptomLogModal({
  dateStr,
  existingData,
  onClose,
  onSave,
}: {
  dateStr: string;
  existingData: { flow?: string; mood?: string; symptoms?: string[]; notes?: string };
  onClose: () => void;
  onSave: (data: { flow?: string; mood?: string; symptoms?: string[]; notes?: string }) => void;
}) {
  const [flow, setFlow] = React.useState(existingData.flow || "none");
  const [mood, setMood] = React.useState(existingData.mood || "");
  const [symptoms, setSymptoms] = React.useState<string[]>(existingData.symptoms || []);
  const [notes, setNotes] = React.useState(existingData.notes || "");

  const toggleSymptom = (label: string) => {
    setSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl glass-card p-6 shadow-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] max-h-[90vh] overflow-y-auto animate-fade-scale space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Flo Daily Log • {dateStr}
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Track flow intensity, body sensations & emotions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Flow Intensity */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Flow Intensity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FLOW_OPTIONS.map((f) => {
              const isSelected =
                (flow || "").toLowerCase() === f.label.toLowerCase() ||
                (flow || "").toLowerCase() === f.id.toLowerCase();
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlow(f.label)}
                  className={cn(
                    "p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 active:scale-95 cursor-pointer min-h-[72px]",
                    isSelected
                      ? "border-rose-500 bg-rose-500 text-white font-black shadow-md shadow-rose-500/25 ring-2 ring-rose-300"
                      : "border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-rose-500/40 hover:bg-rose-500/5 font-semibold"
                  )}
                >
                  <div className="flex items-center justify-center gap-0.5 h-5">
                    {f.drops === 0 ? (
                      <span className={cn("text-xs font-bold", isSelected ? "text-rose-100" : "text-[var(--text-muted)]")}>
                        —
                      </span>
                    ) : (
                      Array.from({ length: f.drops }).map((_, i) => (
                        <Droplet
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            isSelected
                              ? "fill-white text-white drop-shadow-xs"
                              : "fill-rose-500 text-rose-500"
                          )}
                        />
                      ))
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className={cn("text-xs font-extrabold leading-tight", isSelected ? "text-white" : "text-[var(--text-primary)]")}>
                      {f.label}
                    </p>
                    <p className={cn("text-[10px] mt-0.5 leading-none", isSelected ? "text-rose-100" : "text-[var(--text-tertiary)]")}>
                      {f.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Mood Tracker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Mood & Emotions
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.label)}
                className={cn(
                  "p-2 rounded-xl border text-center transition-all flex flex-col items-center",
                  mood === m.label
                    ? "border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-300 font-bold"
                    : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-[10px] mt-1 truncate w-full">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Physical Symptoms */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Physical Symptoms
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {SYMPTOM_OPTIONS.map((s) => {
              const isSelected = symptoms.includes(s.label);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSymptom(s.label)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all flex items-center gap-2",
                    isSelected
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  )}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Personal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today? Any specific cravings or physical notes..."
            rows={2}
            className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 resize-none transition-all"
          />
        </div>

        <div className="pt-3 border-t border-[var(--glass-border)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ flow, mood, symptoms, notes })}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/20 active:scale-95 transition-all press-effect"
          >
            Save Daily Log
          </button>
        </div>
      </div>
    </div>
  );
}
