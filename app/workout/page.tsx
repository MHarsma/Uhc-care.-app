"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExerciseVideoModal } from "@/components/fitness/exercise-video-modal";
import { periodApi } from "@/lib/api/period";
import { fitnessApi } from "@/lib/api/fitness";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Filter,
  Flame,
  Heart,
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
  color: string;
}

/* ================================================================== */
/* EXERCISE CATEGORISATION (derived from shared library)               */
/* ================================================================== */

const STRETCH_IDS = new Set([
  "childs_pose",
  "butterfly",
  "legs_wall",
  "chin_tuck",
  "trap_stretch",
  "cat_cow",
]);

const CORE_IDS = new Set([
  "pilates_100",
  "bird_dog",
  "deadbug",
  "bicycle_crunches",
  "forearm_plank",
  "reverse_crunches",
]);

const CARDIO_IDS = new Set(["jumping_jacks", "mountain_climbers"]);

const STRENGTH_IDS = new Set([
  "rdl",
  "db_chest_press",
  "lateral_raise",
  "db_row",
]);

const MOBILITY_IDS = new Set(["cat_cow", "childs_pose"]);

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

/* Build exercises from the shared library so they stay in sync */
const ALL_EXERCISES = Object.values(EXERCISE_VIDEO_LIBRARY).map((ex) => ({
  ...ex,
  workoutCategory: getWorkoutCategory(ex),
}));

/* ================================================================== */
/* CATEGORY METADATA                                                   */
/* ================================================================== */

const CATEGORY_META: Record<
  Exclude<WorkoutCategory, "All">,
  { icon: string; color: string; label: string }
> = {
  Bodyweight: { icon: "💪", color: "violet", label: "Bodyweight" },
  Strength: { icon: "🏋️", color: "rose", label: "Strength" },
  Stretching: { icon: "🧘", color: "emerald", label: "Stretching" },
  Core: { icon: "🎯", color: "amber", label: "Core" },
  Cardio: { icon: "🔥", color: "orange", label: "Cardio" },
  Mobility: { icon: "🤸", color: "cyan", label: "Mobility" },
};

const CATEGORIES: WorkoutCategory[] = [
  "All",
  "Bodyweight",
  "Strength",
  "Stretching",
  "Core",
  "Cardio",
  "Mobility",
];

/* ================================================================== */
/* WORKOUT PLANS                                                       */
/* ================================================================== */

const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: "full-body-beginner",
    title: "Full Body Starter",
    description:
      "Bodyweight movements to build a foundation. Great for beginners.",
    durationMin: 15,
    difficulty: "Beginner",
    category: "Bodyweight",
    exerciseIds: ["squat", "knee_pushup", "bridge", "bird_dog", "cat_cow"],
    icon: "🌱",
    color: "emerald",
  },
  {
    id: "stretch-recovery",
    title: "Stretch & Recovery",
    description:
      "Gentle stretches to release tension, improve flexibility, and recover.",
    durationMin: 12,
    difficulty: "Beginner",
    category: "Stretching",
    exerciseIds: [
      "childs_pose",
      "cat_cow",
      "butterfly",
      "trap_stretch",
      "legs_wall",
    ],
    icon: "🧘",
    color: "teal",
  },
  {
    id: "light-strength",
    title: "Light Strength Circuit",
    description:
      "Balanced strength circuit for legs, chest, back, and shoulders.",
    durationMin: 20,
    difficulty: "Intermediate",
    category: "Strength",
    exerciseIds: ["squat", "rdl", "db_row", "db_chest_press", "lateral_raise"],
    icon: "🏋️",
    color: "rose",
  },
  {
    id: "lower-body-burn",
    title: "Lower Body Burn",
    description:
      "Target glutes, quads, and hamstrings with progressive overload.",
    durationMin: 18,
    difficulty: "Intermediate",
    category: "Bodyweight",
    exerciseIds: [
      "squat",
      "walking_lunges",
      "hip_thrust",
      "glute_kickback",
      "wall_sit",
    ],
    icon: "🦵",
    color: "violet",
  },
  {
    id: "core-pilates",
    title: "Core & Pilates Basics",
    description:
      "Steady core stability work. Great for posture and spinal health.",
    durationMin: 12,
    difficulty: "Beginner",
    category: "Core",
    exerciseIds: [
      "deadbug",
      "bird_dog",
      "bridge",
      "forearm_plank",
      "pilates_100",
    ],
    icon: "🎯",
    color: "amber",
  },
  {
    id: "cardio-burst",
    title: "Quick Cardio Burst",
    description:
      "Short, high-energy circuit to get your heart rate up fast.",
    durationMin: 10,
    difficulty: "Intermediate",
    category: "Cardio",
    exerciseIds: [
      "jumping_jacks",
      "mountain_climbers",
      "squat",
      "bicycle_crunches",
    ],
    icon: "🔥",
    color: "orange",
  },
  {
    id: "upper-body-tone",
    title: "Upper Body Tone",
    description:
      "Push, pull, and shoulder work for balanced upper-body strength.",
    durationMin: 15,
    difficulty: "Intermediate",
    category: "Strength",
    exerciseIds: [
      "knee_pushup",
      "db_chest_press",
      "db_row",
      "lateral_raise",
      "superman",
    ],
    icon: "💪",
    color: "rose",
  },
  {
    id: "neck-shoulder-relief",
    title: "Neck & Shoulder Relief",
    description:
      "Gentle stretches for desk workers and tension headaches.",
    durationMin: 8,
    difficulty: "Beginner",
    category: "Stretching",
    exerciseIds: ["chin_tuck", "trap_stretch", "cat_cow", "childs_pose"],
    icon: "🌿",
    color: "emerald",
  },
  {
    id: "mobility-flow",
    title: "Mobility Flow",
    description:
      "Unhurried spinal mobility and hip openers. No forcing.",
    durationMin: 10,
    difficulty: "Beginner",
    category: "Mobility",
    exerciseIds: ["cat_cow", "childs_pose", "butterfly", "bridge", "legs_wall"],
    icon: "🤸",
    color: "cyan",
  },
  {
    id: "advanced-full-body",
    title: "Advanced Full Body",
    description:
      "Compound movements at higher intensity for experienced users.",
    durationMin: 25,
    difficulty: "Advanced",
    category: "Bodyweight",
    exerciseIds: [
      "squat",
      "walking_lunges",
      "mountain_climbers",
      "forearm_plank",
      "bicycle_crunches",
      "superman",
    ],
    icon: "⚡",
    color: "violet",
  },
];

/* ================================================================== */
/* WORKOUT SESSION COMPONENT                                           */
/* ================================================================== */

function WorkoutSession({
  plan,
  onComplete,
  onClose,
  onShowTutorial,
}: {
  plan: WorkoutPlan;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{plan.icon}</span>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">
                {plan.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {completed.size}/{plan.exerciseIds.length} exercises
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
              <span className="text-xs font-semibold">⏸</span>
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Exercise List */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-2">
          {plan.exerciseIds.map((id) => {
            const exercise = EXERCISE_VIDEO_LIBRARY[id];
            if (!exercise) return null;
            const isDone = completed.has(id);

            return (
              <div
                key={id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition",
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[var(--glass-border)] bg-[var(--bg-card)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleExercise(id)}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition",
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--glass-border)] text-transparent hover:border-violet-500/50",
                  )}
                >
                  {isDone && <CheckCircle2 className="h-4 w-4" />}
                </button>
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
                    {exercise.reps || `${exercise.durationSec}s`} ·{" "}
                    {exercise.targetMuscles.slice(0, 2).join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowTutorial(id)}
                  className="shrink-0 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold text-violet-500 transition hover:bg-violet-500/20"
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
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            <Trophy className="inline h-4 w-4 mr-2" />
            Complete Workout ({completed.size}/{plan.exerciseIds.length})
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
  /* ---------- state ---------- */
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<WorkoutCategory>("All");
  const [tutorialExerciseId, setTutorialExerciseId] = React.useState<
    string | null
  >(null);
  const [activePlan, setActivePlan] = React.useState<WorkoutPlan | null>(null);
  const [loggedToast, setLoggedToast] = React.useState(false);

  /* ---------- dynamic data ---------- */
  const [exerciseMinutes, setExerciseMinutes] = React.useState(0);
  const [activeCalories, setActiveCalories] = React.useState(0);

  React.useEffect(() => {
    fitnessApi
      .getData()
      .then((data) => {
        setExerciseMinutes(data.log.exercise_minutes);
        setActiveCalories(data.log.active_calories);
      })
      .catch(() => {});
  }, []);

  /* ---------- derived ---------- */
  const filteredExercises = ALL_EXERCISES.filter((ex) => {
    const matchSearch =
      !search ||
      `${ex.name} ${ex.targetMuscles.join(" ")} ${ex.equipment}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchCat =
      category === "All" || ex.workoutCategory === category;
    return matchSearch && matchCat;
  });

  const filteredPlans =
    category === "All"
      ? WORKOUT_PLANS
      : WORKOUT_PLANS.filter((p) => p.category === category);

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
      /* silently fail */
    }
    setActivePlan(null);
  };

  const difficultyColor = (d: Difficulty) => {
    if (d === "Beginner") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (d === "Intermediate") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  /* ================================================================== */
  /* RENDER                                                              */
  /* ================================================================== */
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 pb-20">
        {/* ── HERO HEADER ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-gradient-to-br from-[var(--bg-card)] to-violet-500/5 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-rose-500/6 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">
                <Dumbbell className="h-3.5 w-3.5" />
                Workout Library
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Your Workout Space
              </h1>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                Browse {ALL_EXERCISES.length} exercises across{" "}
                {Object.keys(CATEGORY_META).length} categories. Pick a ready-made
                plan or explore individual exercises with video tutorials.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4">
                <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {activeCalories}
                  </p>
                  <p className="text-[10px] font-medium text-[var(--text-tertiary)]">
                    Calories today
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {exerciseMinutes}m
                  </p>
                  <p className="text-[10px] font-medium text-[var(--text-tertiary)]">
                    Active today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORY FILTER BAR ─────────────────────────────── */}
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
                {cat === "All" ? "All" : meta?.label}
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive
                      ? "bg-white/20"
                      : "bg-[var(--bg-secondary)]",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── WORKOUT PLANS ──────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {category === "All"
                  ? "Ready-Made Plans"
                  : `${CATEGORY_META[category as Exclude<WorkoutCategory, "All">]?.label ?? ""} Plans`}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Tap a plan to start a guided session with progress tracking.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Target className="h-3.5 w-3.5" />
              {filteredPlans.length} plans
            </div>
          </div>

          {filteredPlans.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPlans.map((plan) => (
                <article
                  key={plan.id}
                  className="group flex flex-col rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-sm transition hover:border-violet-500/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-lg">
                        {plan.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] leading-tight">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                            <Clock3 className="h-3 w-3" />
                            {plan.durationMin} min
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              difficultyColor(plan.difficulty),
                            )}
                          >
                            {plan.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[var(--text-secondary)] mb-4">
                    {plan.description}
                  </p>

                  {/* Exercise chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {plan.exerciseIds.map((id) => {
                      const ex = EXERCISE_VIDEO_LIBRARY[id];
                      if (!ex) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTutorialExerciseId(id)}
                          className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:text-violet-500"
                        >
                          {ex.name.length > 25
                            ? ex.name.slice(0, 22) + "…"
                            : ex.name}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePlan(plan)}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    <Play className="h-4 w-4" />
                    Start Workout
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-card)] p-8 text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No plans in this category yet.
              </p>
              <button
                type="button"
                onClick={() => setCategory("All")}
                className="mt-2 text-xs font-semibold text-violet-500"
              >
                View all plans
              </button>
            </div>
          )}
        </section>

        {/* ── EXERCISE LIBRARY ───────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Exercise Library
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Each exercise has a video tutorial, form cues, and breathing
                guide.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, muscle, or equipment…"
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
              />
            </label>
          </div>

          {filteredExercises.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredExercises.map((exercise) => {
                const catMeta =
                  CATEGORY_META[
                    exercise.workoutCategory as Exclude<WorkoutCategory, "All">
                  ];

                return (
                  <article
                    key={exercise.id}
                    className="group flex flex-col rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-sm transition hover:border-violet-500/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                          {catMeta?.icon} {exercise.workoutCategory}
                        </span>
                        <h3 className="font-bold leading-snug text-[var(--text-primary)]">
                          {exercise.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                        {exercise.reps || `${exercise.durationSec} seconds`}
                      </p>
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">
                          Equipment:
                        </span>{" "}
                        {exercise.equipment}
                      </p>
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">
                          Focus:
                        </span>{" "}
                        {exercise.targetMuscles.join(", ")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTutorialExerciseId(exercise.id)}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                      <Play className="h-4 w-4" />
                      Watch Tutorial
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-card)] p-10 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                No exercises match your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-3 text-sm font-semibold text-violet-500"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* ── ACCESSIBILITY LIVE REGION ────────────────────────── */}
        <div className="sr-only" aria-live="polite">
          {filteredExercises.length} exercises shown
        </div>

        {/* ── LOGGED TOAST ────────────────────────────────────── */}
        {loggedToast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 shadow-xl backdrop-blur-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Workout logged!
              </span>
            </div>
          </div>
        )}

        {/* ── MODALS ──────────────────────────────────────────── */}
        {tutorialExerciseId && (
          <ExerciseVideoModal
            key={tutorialExerciseId}
            exerciseId={tutorialExerciseId}
            onClose={() => setTutorialExerciseId(null)}
          />
        )}

        {activePlan && (
          <WorkoutSession
            plan={activePlan}
            onComplete={handleCompleteWorkout}
            onClose={() => setActivePlan(null)}
            onShowTutorial={(id) => setTutorialExerciseId(id)}
          />
        )}
      </div>
    </AppShell>
  );
}
