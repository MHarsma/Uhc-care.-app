"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExerciseVideoModal } from "@/components/fitness/exercise-video-modal";
import { fitnessApi } from "@/lib/api/fitness";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Search,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import {
  DetailedExerciseVideo,
  EXERCISE_VIDEO_LIBRARY,
} from "@/lib/data/exercise-videos";
import { cn } from "@/lib/utils";

/* ================================================================== */
/* TYPES                                                               */
/* ================================================================== */

type ActiveTab = "muscle-focus" | "plans" | "library";

type WorkoutCategory =
  | "All"
  | "Bodyweight"
  | "Strength"
  | "Stretching"
  | "Core"
  | "Cardio"
  | "Mobility";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  difficulty: Difficulty;
  category: Exclude<WorkoutCategory, "All">;
  exerciseIds: string[];
  icon: string;
  coverImage: string;
}

interface MuscleFocusDay {
  id: string;
  dayLabel: string;
  focusName: string;
  tagline: string;
  durationMin: number;
  muscles: string[];
  coverImage: string;
  exerciseIds: string[];
  icon: string;
  difficulty: Difficulty;
}

/* ================================================================== */
/* EXERCISE CATEGORISATION                                             */
/* ================================================================== */

const STRETCH_IDS = new Set([
  "childs_pose",
  "cat_cow",
  "butterfly",
  "legs_wall",
  "chin_tuck",
  "trap_stretch",
  "pigeon_pose",
  "cobra_stretch",
  "downward_dog",
  "forward_fold",
  "side_lunge",
]);

const CORE_IDS = new Set([
  "pilates_100",
  "bird_dog",
  "deadbug",
  "bicycle_crunches",
  "forearm_plank",
  "reverse_crunches",
  "superman",
]);

const CARDIO_IDS = new Set([
  "jumping_jacks",
  "mountain_climbers",
  "jump_squat",
]);

const STRENGTH_IDS = new Set([
  "rdl",
  "db_chest_press",
  "lateral_raise",
  "db_row",
]);

const MOBILITY_IDS = new Set([
  "cat_cow",
  "childs_pose",
  "pigeon_pose",
  "downward_dog",
  "side_lunge",
]);

function getWorkoutCategory(
  exercise: DetailedExerciseVideo,
): Exclude<WorkoutCategory, "All"> {
  if (STRETCH_IDS.has(exercise.id)) return "Stretching";
  if (CORE_IDS.has(exercise.id)) return "Core";
  if (CARDIO_IDS.has(exercise.id)) return "Cardio";
  if (STRENGTH_IDS.has(exercise.id)) return "Strength";
  if (MOBILITY_IDS.has(exercise.id)) return "Mobility";
  return "Bodyweight";
}

const ALL_EXERCISES = Object.values(EXERCISE_VIDEO_LIBRARY).map((ex) => ({
  ...ex,
  workoutCategory: getWorkoutCategory(ex),
}));

const CATEGORY_META: Record<
  Exclude<WorkoutCategory, "All">,
  { icon: string; label: string }
> = {
  Bodyweight: { icon: "💪", label: "Bodyweight" },
  Strength: { icon: "🏋️", label: "Strength" },
  Stretching: { icon: "🧘", label: "Stretching" },
  Core: { icon: "🎯", label: "Core" },
  Cardio: { icon: "🔥", label: "Cardio" },
  Mobility: { icon: "🤸", label: "Mobility" },
};

const CATEGORIES: WorkoutCategory[] = [
  "All",
  "Stretching",
  "Bodyweight",
  "Strength",
  "Core",
  "Cardio",
  "Mobility",
];

/* ================================================================== */
/* DEDICATED MUSCLE FOCUS (DAY-BY-DAY SPLIT)                           */
/* ================================================================== */

const MUSCLE_FOCUS_DAYS: MuscleFocusDay[] = [
  {
    id: "chest-triceps",
    dayLabel: "Day 1 (Push)",
    focusName: "Chest & Triceps Focus",
    tagline:
      "All push-up variations and light dumbbell press to tone pectorals and firm arms.",
    durationMin: 20,
    difficulty: "Intermediate",
    muscles: ["Pectorals", "Triceps Brachii", "Anterior Deltoids", "Core"],
    coverImage:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "incline_pushup",
      "knee_pushup",
      "standard_pushup",
      "wide_pushup",
      "diamond_pushup",
      "db_chest_press",
    ],
    icon: "💪",
  },
  {
    id: "back-posture",
    dayLabel: "Day 2 (Pull & Posture)",
    focusName: "Back, Wings & Rear Delts",
    tagline:
      "Sculpt the posterior chain, reverse rounded shoulders, and strengthen the back.",
    durationMin: 22,
    difficulty: "Intermediate",
    muscles: ["Lats", "Rhomboids", "Erector Spinae", "Rear Delts"],
    coverImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    exerciseIds: ["db_row", "lateral_raise", "superman", "bird_dog", "rdl"],
    icon: "🦅",
  },
  {
    id: "legs-glutes",
    dayLabel: "Day 3 (Legs & Glutes)",
    focusName: "Glutes & Lower Body Power",
    tagline:
      "Different squats, lunges, and glute-builders for tone, firmness, and stamina.",
    durationMin: 25,
    difficulty: "Advanced",
    muscles: ["Gluteus Maximus", "Quadriceps", "Hamstrings", "Adductors"],
    coverImage:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "squat",
      "sumo_squat",
      "jump_squat",
      "bulgarian_split_squat",
      "walking_lunges",
      "hip_thrust",
      "glute_kickback",
      "wall_sit",
    ],
    icon: "🔥",
  },
  {
    id: "core-waist",
    dayLabel: "Day 4 (Core & Abs)",
    focusName: "Deep Core & Waistline Alignment",
    tagline:
      "Deep transverse core activation, pelvic stabilization, and abdominal endurance.",
    durationMin: 18,
    difficulty: "Intermediate",
    muscles: [
      "Transverse Abdominis",
      "Rectus Abdominis",
      "Obliques",
      "Pelvic Floor",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "forearm_plank",
      "deadbug",
      "bicycle_crunches",
      "pilates_100",
      "reverse_crunches",
      "bridge",
    ],
    icon: "🎯",
  },
  {
    id: "stretching-mobility",
    dayLabel: "Day 5 & Rest Days (Stretching)",
    focusName: "Full Body Decompression & Stretch",
    tagline:
      "Targeted hip openers, spinal traction, and soothing stretches to release all tension.",
    durationMin: 20,
    difficulty: "Beginner",
    muscles: ["Hip Flexors", "Hamstrings", "Piriformis", "Spine", "Shoulders"],
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "pigeon_pose",
      "cobra_stretch",
      "downward_dog",
      "childs_pose",
      "cat_cow",
      "forward_fold",
      "side_lunge",
      "legs_wall",
    ],
    icon: "🧘",
  },
];

/* ================================================================== */
/* READY-MADE WORKOUT PLANS                                            */
/* ================================================================== */

const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: "pushup-progression",
    title: "Push-Up Mastery Lab",
    description:
      "From gentle elevation to diamond precision. Train chest, triceps, and upper posture.",
    durationMin: 16,
    difficulty: "Intermediate",
    category: "Bodyweight",
    exerciseIds: [
      "incline_pushup",
      "knee_pushup",
      "standard_pushup",
      "wide_pushup",
      "diamond_pushup",
    ],
    icon: "💪",
    coverImage:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "squat-sculptor",
    title: "Complete Squat & Glute Circuit",
    description:
      "Compound squats and single-leg movements targeting every angle of your legs.",
    durationMin: 20,
    difficulty: "Intermediate",
    category: "Bodyweight",
    exerciseIds: [
      "squat",
      "sumo_squat",
      "bulgarian_split_squat",
      "jump_squat",
      "hip_thrust",
    ],
    icon: "⚡",
    coverImage:
      "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stretch-deep-release",
    title: "Deep Full-Body Stretch & Release",
    description:
      "Reclined and gentle yoga postures to relieve back tightness, tight hips, and fatigue.",
    durationMin: 18,
    difficulty: "Beginner",
    category: "Stretching",
    exerciseIds: [
      "childs_pose",
      "cat_cow",
      "pigeon_pose",
      "cobra_stretch",
      "downward_dog",
      "forward_fold",
      "legs_wall",
    ],
    icon: "🧘",
    coverImage:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "full-body-beginner",
    title: "Full Body Foundation",
    description:
      "Gentle bodyweight moves to establish safe technique and joint stability.",
    durationMin: 15,
    difficulty: "Beginner",
    category: "Bodyweight",
    exerciseIds: ["squat", "knee_pushup", "bridge", "bird_dog", "cat_cow"],
    icon: "🌱",
    coverImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "light-strength-circuit",
    title: "Dumbbell Sculpt & Strength",
    description:
      "Balanced weights circuit for upper body definition and posterior chain strength.",
    durationMin: 22,
    difficulty: "Intermediate",
    category: "Strength",
    exerciseIds: ["rdl", "db_row", "db_chest_press", "lateral_raise", "superman"],
    icon: "🏋️",
    coverImage:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "core-pilates-pro",
    title: "Pilates Core & Alignment",
    description:
      "Steady spinal stability, pelvic floor recruitment, and waist control.",
    durationMin: 14,
    difficulty: "Beginner",
    category: "Core",
    exerciseIds: [
      "deadbug",
      "bird_dog",
      "forearm_plank",
      "pilates_100",
      "reverse_crunches",
    ],
    icon: "🎯",
    coverImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cardio-burst",
    title: "Metabolic HIIT & Cardio",
    description:
      "High energy bodyweight intervals to elevate heart rate and maximize calorie burn.",
    durationMin: 12,
    difficulty: "Advanced",
    category: "Cardio",
    exerciseIds: [
      "jumping_jacks",
      "jump_squat",
      "mountain_climbers",
      "bicycle_crunches",
    ],
    icon: "🔥",
    coverImage:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "neck-shoulder-desk",
    title: "Neck, Trap & Upper Back Relief",
    description:
      "Designed specifically for desk posture, tension headaches, and neck stiffness.",
    durationMin: 10,
    difficulty: "Beginner",
    category: "Stretching",
    exerciseIds: ["chin_tuck", "trap_stretch", "cat_cow", "childs_pose"],
    icon: "🌿",
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  },
];

/* ================================================================== */
/* WORKOUT SESSION MODAL                                               */
/* ================================================================== */

function WorkoutSession({
  plan,
  onComplete,
  onClose,
  onShowTutorial,
}: {
  plan: { title: string; icon: string; exerciseIds: string[] };
  onComplete: (durationMin: number) => void;
  onClose: () => void;
  onShowTutorial: (id: string) => void;
}) {
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [elapsed, setElapsed] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(true);

  React.useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleExercise = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = Math.round(
    (completed.size / plan.exerciseIds.length) * 100,
  );
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{plan.icon}</span>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">
                {plan.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {completed.size}/{plan.exerciseIds.length} exercises completed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Timer & Progress */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/50">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[var(--text-primary)]">
            <Timer className="h-4 w-4 text-violet-500" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-rose-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-violet-500">{progress}%</span>
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition"
          >
            {isRunning ? (
              <span className="text-xs font-semibold">Pause</span>
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Exercise List */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-2.5">
          {plan.exerciseIds.map((id) => {
            const exercise = EXERCISE_VIDEO_LIBRARY[id];
            if (!exercise) return null;
            const isDone = completed.has(id);

            return (
              <div
                key={id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 transition",
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[var(--glass-border)] bg-[var(--bg-card)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleExercise(id)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition",
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--glass-border)] text-transparent hover:border-violet-500/50",
                  )}
                >
                  {isDone && <CheckCircle2 className="h-5 w-5" />}
                </button>

                {/* Thumbnail */}
                <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                  <img
                    src={exercise.videoPoster}
                    alt={exercise.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate",
                      isDone
                        ? "text-emerald-600 dark:text-emerald-400 line-through"
                        : "text-[var(--text-primary)]",
                    )}
                  >
                    {exercise.name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {exercise.reps || `${exercise.durationSec}s`} •{" "}
                    {exercise.targetMuscles.slice(0, 2).join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowTutorial(id)}
                  className="shrink-0 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-bold text-violet-500 transition hover:bg-violet-500/20"
                >
                  Tutorial
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--glass-border)] p-4">
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              onComplete(Math.max(1, Math.round(elapsed / 60)));
            }}
            disabled={completed.size === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-rose-500 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-40 shadow-lg shadow-violet-500/20"
          >
            <Trophy className="inline h-4 w-4 mr-2" />
            Finish & Log Workout ({completed.size}/{plan.exerciseIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* MAIN PAGE                                                           */
/* ================================================================== */

export default function WorkoutPage() {
  /* ---------- navigation tabs ---------- */
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("muscle-focus");

  /* ---------- filters & search ---------- */
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<WorkoutCategory>("All");
  const [selectedMuscle, setSelectedMuscle] = React.useState<string>("All");

  /* ---------- modals & active session ---------- */
  const [tutorialExerciseId, setTutorialExerciseId] = React.useState<
    string | null
  >(null);
  const [activeSession, setActiveSession] = React.useState<{
    title: string;
    icon: string;
    exerciseIds: string[];
  } | null>(null);
  const [loggedToast, setLoggedToast] = React.useState(false);

  /* ---------- dynamic data from backend API ---------- */
  const [exerciseMinutes, setExerciseMinutes] = React.useState(0);
  const [activeCalories, setActiveCalories] = React.useState(0);

  React.useEffect(() => {
    fitnessApi
      .getData()
      .then((data) => {
        setExerciseMinutes(data.log?.exercise_minutes || 0);
        setActiveCalories(data.log?.active_calories || 0);
      })
      .catch(() => {});
  }, []);

  /* ---------- derived exercises ---------- */
  const filteredExercises = ALL_EXERCISES.filter((ex) => {
    const matchSearch =
      !search ||
      `${ex.name} ${ex.targetMuscles.join(" ")} ${ex.equipment}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchCat = category === "All" || ex.workoutCategory === category;
    const matchMuscle =
      selectedMuscle === "All" ||
      ex.targetMuscles.some((m) =>
        m.toLowerCase().includes(selectedMuscle.toLowerCase()),
      );
    return matchSearch && matchCat && matchMuscle;
  });

  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const ex of ALL_EXERCISES) {
      map[ex.workoutCategory] = (map[ex.workoutCategory] || 0) + 1;
    }
    return map;
  }, []);

  /* ---------- handlers ---------- */
  const handleCompleteWorkout = async (durationMin: number) => {
    try {
      const calsBurned = durationMin * 7;
      await fitnessApi.updateLog({
        exercise_minutes: exerciseMinutes + durationMin,
        active_calories: activeCalories + calsBurned,
      });
      setExerciseMinutes((m) => m + durationMin);
      setActiveCalories((c) => c + calsBurned);
      setLoggedToast(true);
      setTimeout(() => setLoggedToast(false), 3000);
    } catch {
      /* fallback */
    }
    setActiveSession(null);
  };

  const difficultyBadge = (d: Difficulty) => {
    if (d === "Beginner")
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (d === "Intermediate")
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7 pb-20">
        {/* ── TOP HERO HEADER ────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-violet-500/10 p-6 sm:p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">
                <Dumbbell className="h-3.5 w-3.5" />
                Intelligent Workout Suite
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Daily Workouts & Muscle Focus
              </h1>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                Train 1–2 target muscle groups daily with guided push-ups, squats,
                and restorative stretches. Clean, structured, and matched with
                verified technique tutorials.
              </p>
            </div>

            {/* Dynamic Real-Time Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)]/90 backdrop-blur-md p-4 shadow-sm">
                <div className="rounded-xl bg-rose-500/15 p-2.5 text-rose-500">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {activeCalories} <span className="text-xs font-normal text-[var(--text-tertiary)]">kcal</span>
                  </p>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                    Burned Today
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)]/90 backdrop-blur-md p-4 shadow-sm">
                <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {exerciseMinutes} <span className="text-xs font-normal text-[var(--text-tertiary)]">min</span>
                  </p>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                    Active Time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TAB NAVIGATION (COMPACT, NO GIANT SCROLL) ─────────────────── */}
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("muscle-focus")}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition shadow-sm",
                activeTab === "muscle-focus"
                  ? "bg-violet-600 text-white shadow-violet-500/25"
                  : "border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-500/40",
              )}
            >
              <Calendar className="h-4 w-4" />
              Daily Muscle Focus
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                5 Days
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("plans")}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition shadow-sm",
                activeTab === "plans"
                  ? "bg-violet-600 text-white shadow-violet-500/25"
                  : "border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-500/40",
              )}
            >
              <Target className="h-4 w-4" />
              Workout Plans
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {WORKOUT_PLANS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition shadow-sm",
                activeTab === "library"
                  ? "bg-violet-600 text-white shadow-violet-500/25"
                  : "border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-500/40",
              )}
            >
              <Layers className="h-4 w-4" />
              Exercise Vault
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {ALL_EXERCISES.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: DAILY MUSCLE FOCUS SPLIT ─────────────────────────── */}
        {activeTab === "muscle-focus" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Weekly Muscle-Specific Splits
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Train 1 to 2 targeted muscle groups daily with balanced push, pull,
                  leg sculpt, and full-body restorative mobility.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-500">
                <Sparkles className="h-4 w-4" /> Structured for Women&apos;s Health
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {MUSCLE_FOCUS_DAYS.map((split) => (
                <article
                  key={split.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-lg transition hover:border-violet-500/40 hover:shadow-xl"
                >
                  {/* Visual Banner Cover */}
                  <div className="relative aspect-[21/9] w-full overflow-hidden bg-[var(--bg-secondary)]">
                    <img
                      src={split.coverImage}
                      alt={split.focusName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                        {split.dayLabel}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md",
                          difficultyBadge(split.difficulty),
                        )}
                      >
                        {split.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{split.icon}</span>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                          {split.focusName}
                        </h3>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-violet-600/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                        <Clock3 className="h-3.5 w-3.5" />
                        {split.durationMin} min
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="flex flex-1 flex-col p-5 space-y-4">
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                      {split.tagline}
                    </p>

                    {/* Targeted Muscle Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {split.muscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>

                    {/* Movements with Visual Thumbnails */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Curated Exercises ({split.exerciseIds.length} Movements):
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {split.exerciseIds.map((id) => {
                          const ex = EXERCISE_VIDEO_LIBRARY[id];
                          if (!ex) return null;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setTutorialExerciseId(id)}
                              className="flex items-center gap-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)]/60 p-2 text-left transition hover:border-violet-500/50 hover:bg-violet-500/5 group/btn"
                            >
                              <div className="relative h-9 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                                <img
                                  src={ex.videoPoster}
                                  alt={ex.name}
                                  className="h-full w-full object-cover transition group-hover/btn:scale-105"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-[var(--text-primary)] group-hover/btn:text-violet-400">
                                  {ex.name}
                                </p>
                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                  {ex.reps || `${ex.durationSec}s`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Start Action Button */}
                    <div className="pt-2 mt-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSession({
                            title: split.focusName,
                            icon: split.icon,
                            exerciseIds: split.exerciseIds,
                          })
                        }
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-rose-500 py-3 text-sm font-bold text-white transition hover:opacity-95 shadow-md shadow-violet-500/20"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Start Day Split Workout
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: READY-MADE WORKOUT PLANS ──────────────────────────── */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Complete Ready-to-Follow Plans
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Pick a guided workout routine by goal, phase, or desired training
                  intensity.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition shrink-0",
                      category === cat
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                        : "border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {WORKOUT_PLANS.filter(
                (p) => category === "All" || p.category === category,
              ).map((plan) => (
                <article
                  key={plan.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-lg transition hover:border-violet-500/40 hover:shadow-xl"
                >
                  {/* Card Cover Visual */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-secondary)]">
                    <img
                      src={plan.coverImage}
                      alt={plan.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                        {plan.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md",
                          difficultyBadge(plan.difficulty),
                        )}
                      >
                        {plan.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded-full bg-violet-600/80 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                      <Clock3 className="h-3 w-3" />
                      {plan.durationMin} min
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{plan.icon}</span>
                      <h3 className="font-bold text-[var(--text-primary)]">
                        {plan.title}
                      </h3>
                    </div>

                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                      {plan.description}
                    </p>

                    {/* Exercise Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {plan.exerciseIds.map((id) => {
                        const ex = EXERCISE_VIDEO_LIBRARY[id];
                        if (!ex) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setTutorialExerciseId(id)}
                            className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)]/80 px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:text-violet-400"
                          >
                            {ex.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Start Button */}
                    <div className="pt-3 mt-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSession({
                            title: plan.title,
                            icon: plan.icon,
                            exerciseIds: plan.exerciseIds,
                          })
                        }
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-500 shadow-md shadow-violet-500/20"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Start Session ({plan.exerciseIds.length} Moves)
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: EXERCISE VAULT (ALL 39 MOVEMENTS) ─────────────────── */}
        {activeTab === "library" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Exercise Vault ({filteredExercises.length} Movements)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Every exercise includes verified video tutorials, posture checks,
                  and breathing techniques.
                </p>
              </div>

              {/* Search Bar */}
              <label className="relative block w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pushup, squat, abs..."
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
                />
              </label>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                const meta = cat !== "All" ? CATEGORY_META[cat] : null;
                const count =
                  cat === "All" ? ALL_EXERCISES.length : categoryCounts[cat] || 0;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition",
                      isActive
                        ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                        : "border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-violet-500/30 hover:text-[var(--text-primary)]",
                    )}
                  >
                    {meta && <span>{meta.icon}</span>}
                    {cat === "All" ? "All Exercises" : meta?.label}
                    <span
                      className={cn(
                        "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px]",
                        isActive ? "bg-white/20" : "bg-[var(--bg-secondary)]",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Exercises with Rich Visual Cover Photos */}
            {filteredExercises.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredExercises.map((exercise) => {
                  const catMeta =
                    CATEGORY_META[
                      exercise.workoutCategory as Exclude<WorkoutCategory, "All">
                    ];

                  return (
                    <article
                      key={exercise.id}
                      className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-md transition hover:border-violet-500/40 hover:shadow-xl"
                    >
                      {/* Cover Photo */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-secondary)]">
                        <img
                          src={exercise.videoPoster}
                          alt={exercise.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/40" />

                        <div className="absolute top-2.5 left-2.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                            {catMeta?.icon} {exercise.workoutCategory}
                          </span>
                        </div>

                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                            {exercise.reps || `${exercise.durationSec}s`}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col p-4 space-y-2.5">
                        <h3 className="font-bold leading-snug text-sm text-[var(--text-primary)]">
                          {exercise.name}
                        </h3>

                        <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                          <p className="truncate">
                            <span className="font-semibold text-[var(--text-primary)]">
                              Equipment:
                            </span>{" "}
                            {exercise.equipment}
                          </p>
                          <p className="truncate">
                            <span className="font-semibold text-[var(--text-primary)]">
                              Target:
                            </span>{" "}
                            {exercise.targetMuscles.slice(0, 3).join(", ")}
                          </p>
                        </div>

                        {/* Watch Tutorial Button */}
                        <div className="pt-2 mt-auto">
                          <button
                            type="button"
                            onClick={() => setTutorialExerciseId(exercise.id)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500/10 py-2.5 text-xs font-bold text-violet-600 dark:text-violet-400 transition hover:bg-violet-600 hover:text-white"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Watch Tutorial
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-card)] p-12 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  No exercises found matching &quot;{search}&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-3 text-xs font-bold text-violet-500 hover:underline"
                >
                  Clear search & reset filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── LOGGED TOAST NOTIFICATION ──────────────────────────────── */}
        {loggedToast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-5 py-2.5 shadow-xl backdrop-blur-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                Workout session completed & stats updated!
              </span>
            </div>
          </div>
        )}

        {/* ── TUTORIAL VIDEO MODAL ────────────────────────────────────── */}
        {tutorialExerciseId && (
          <ExerciseVideoModal
            key={tutorialExerciseId}
            exerciseId={tutorialExerciseId}
            onClose={() => setTutorialExerciseId(null)}
          />
        )}

        {/* ── ACTIVE WORKOUT SESSION MODAL ───────────────────────────── */}
        {activeSession && (
          <WorkoutSession
            plan={activeSession}
            onComplete={handleCompleteWorkout}
            onClose={() => setActiveSession(null)}
            onShowTutorial={(id) => setTutorialExerciseId(id)}
          />
        )}
      </div>
    </AppShell>
  );
}
