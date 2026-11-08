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
  RotateCcw,
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
  | "Stretching"
  | "Bodyweight"
  | "Strength"
  | "Core"
  | "Cardio"
  | "Mobility";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface MuscleFocusDay {
  id: string;
  dayNumber: number; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  dayName: string;
  dayShort: string;
  focusTitle: string;
  tagline: string;
  durationMin: number;
  estCalories: number;
  difficulty: Difficulty;
  muscles: string[];
  coverImage: string;
  exerciseIds: string[];
  icon: string;
}

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
/* DEDICATED 7-DAY MUSCLE FOCUS SPLIT                                  */
/* ================================================================== */

const WEEKLY_MUSCLE_SPLITS: MuscleFocusDay[] = [
  {
    id: "monday-push",
    dayNumber: 1,
    dayName: "Monday",
    dayShort: "Mon",
    focusTitle: "Chest, Triceps & Push Power",
    tagline:
      "All push-up variations, joint-friendly incline, and light dumbbell presses for upper body definition.",
    durationMin: 20,
    estCalories: 140,
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
    id: "tuesday-pull",
    dayNumber: 2,
    dayName: "Tuesday",
    dayShort: "Tue",
    focusTitle: "Back, Wings, Rear Delts & Posture",
    tagline:
      "Reverse desk slump, sculpt the posterior chain, and strengthen upper back & rhomboids.",
    durationMin: 22,
    estCalories: 155,
    difficulty: "Intermediate",
    muscles: ["Latissimus Dorsi", "Rhomboids", "Erector Spinae", "Rear Delts"],
    coverImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    exerciseIds: ["db_row", "lateral_raise", "superman", "bird_dog", "rdl"],
    icon: "🦅",
  },
  {
    id: "wednesday-legs",
    dayNumber: 3,
    dayName: "Wednesday",
    dayShort: "Wed",
    focusTitle: "Glutes, Squats & Lower Body Power",
    tagline:
      "Targeted air squats, Bulgarian split squats, jump squats, and glute bridges for lower body firmness.",
    durationMin: 25,
    estCalories: 190,
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
    id: "thursday-core",
    dayNumber: 4,
    dayName: "Thursday",
    dayShort: "Thu",
    focusTitle: "Deep Core, Abs & Waistline Alignment",
    tagline:
      "Transverse abdominal recruitment, pelvic floor activation, and safe spinal stabilization.",
    durationMin: 18,
    estCalories: 130,
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
    id: "friday-arms",
    dayNumber: 5,
    dayName: "Friday",
    dayShort: "Fri",
    focusTitle: "Shoulders, Arms & Metabolic Sculpt",
    tagline:
      "Full upper body toning combining lateral raises, chest press, and light cardio stamina.",
    durationMin: 20,
    estCalories: 160,
    difficulty: "Intermediate",
    muscles: ["Deltoids", "Biceps", "Triceps", "Cardiovascular"],
    coverImage:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "lateral_raise",
      "diamond_pushup",
      "db_row",
      "jumping_jacks",
      "mountain_climbers",
    ],
    icon: "⚡",
  },
  {
    id: "saturday-stretch",
    dayNumber: 6,
    dayName: "Saturday",
    dayShort: "Sat",
    focusTitle: "Deep Hip & Pelvic Release Flow",
    tagline:
      "Soothing hip openers and restorative stretches to release tension and improve lower mobility.",
    durationMin: 18,
    estCalories: 90,
    difficulty: "Beginner",
    muscles: ["Hip Flexors", "Piriformis", "Adductors", "Lower Back"],
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "pigeon_pose",
      "side_lunge",
      "butterfly",
      "childs_pose",
      "legs_wall",
    ],
    icon: "🧘",
  },
  {
    id: "sunday-recovery",
    dayNumber: 0,
    dayName: "Sunday",
    dayShort: "Sun",
    focusTitle: "Full-Body Spine & Mobility Flow",
    tagline:
      "Gentle spinal decompression, neck tension release, and restorative yoga for the upcoming week.",
    durationMin: 20,
    estCalories: 85,
    difficulty: "Beginner",
    muscles: ["Spine", "Hamstrings", "Trapezius", "Diaphragm"],
    coverImage:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    exerciseIds: [
      "cat_cow",
      "cobra_stretch",
      "downward_dog",
      "forward_fold",
      "chin_tuck",
      "trap_stretch",
      "childs_pose",
    ],
    icon: "🌿",
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
      "From elevated beginners to diamond precision. Build chest, triceps, and upper posture.",
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
/* WORKOUT SESSION RUNNER (MODAL)                                      */
/* ================================================================== */

function WorkoutSession({
  plan,
  completed,
  onToggleExercise,
  onResetCompleted,
  onComplete,
  onClose,
  onShowTutorial,
}: {
  plan: { title: string; icon: string; exerciseIds: string[] };
  completed: Set<string>;
  onToggleExercise: (id: string) => void;
  onResetCompleted: () => void;
  onComplete: (durationMin: number) => void;
  onClose: () => void;
  onShowTutorial: (id: string) => void;
}) {
  const [elapsed, setElapsed] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(true);

  React.useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const planCompletedCount = plan.exerciseIds.filter((id) =>
    completed.has(id),
  ).length;
  const progress = Math.round(
    (planCompletedCount / plan.exerciseIds.length) * 100,
  );
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{plan.icon}</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                {plan.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {planCompletedCount} of {plan.exerciseIds.length} exercises finished
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {planCompletedCount > 0 && (
              <button
                type="button"
                onClick={onResetCompleted}
                title="Reset completed exercises"
                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Timer & Progress Bar */}
        <div className="flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-4 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/50">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)]">
            <Timer className="h-4 w-4 text-violet-500" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-rose-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-violet-500">{progress}%</span>
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="rounded-lg px-2 py-1 bg-[var(--bg-card)] border border-[var(--glass-border)] text-xs font-semibold text-[var(--text-primary)]"
          >
            {isRunning ? "Pause" : "Resume"}
          </button>
        </div>

        {/* Exercise List */}
        <div className="max-h-[50vh] overflow-y-auto p-3 sm:p-4 space-y-2.5">
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
                  onClick={() => onToggleExercise(id)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition",
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--glass-border)] text-transparent hover:border-violet-500/50",
                  )}
                >
                  {isDone && <CheckCircle2 className="h-5 w-5" />}
                </button>

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
                      "text-xs sm:text-sm font-semibold leading-tight",
                      isDone
                        ? "text-emerald-600 dark:text-emerald-400 line-through"
                        : "text-[var(--text-primary)]",
                    )}
                  >
                    {exercise.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    {exercise.reps || `${exercise.durationSec}s`} •{" "}
                    {exercise.targetMuscles.slice(0, 2).join(", ")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onShowTutorial(id)}
                  className="shrink-0 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-bold text-violet-500 transition hover:bg-violet-500/20"
                >
                  Form
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
            disabled={planCompletedCount === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-rose-500 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-40 shadow-lg shadow-violet-500/20"
          >
            <Trophy className="inline h-4 w-4 mr-2" />
            Complete & Log Workout ({planCompletedCount}/{plan.exerciseIds.length})
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
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("muscle-focus");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<WorkoutCategory>("All");

  // Detect current day of week dynamically
  const currentDayIndex = React.useMemo(() => new Date().getDay(), []);
  const [selectedDayNumber, setSelectedDayNumber] =
    React.useState<number>(currentDayIndex);

  // Active workout session & tutorial modal
  const [tutorialExerciseId, setTutorialExerciseId] = React.useState<
    string | null
  >(null);
  const [activeSession, setActiveSession] = React.useState<{
    title: string;
    icon: string;
    exerciseIds: string[];
  } | null>(null);
  const [loggedToast, setLoggedToast] = React.useState(false);

  // Dynamic user data from API
  const [exerciseMinutes, setExerciseMinutes] = React.useState(0);
  const [activeCalories, setActiveCalories] = React.useState(0);
  const [completedSessionsCount, setCompletedSessionsCount] = React.useState(0);

  // Completed exercise IDs persistence (keyed by date so it persists across closes and refreshes)
  const [completedExerciseIds, setCompletedExerciseIds] = React.useState<
    Set<string>
  >(new Set());

  React.useEffect(() => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(
        `uhc_completed_workout_exercises_${todayKey}`,
      );
      if (saved) {
        setCompletedExerciseIds(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  const handleToggleExercise = (id: string) => {
    setCompletedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        localStorage.setItem(
          `uhc_completed_workout_exercises_${todayKey}`,
          JSON.stringify(Array.from(next)),
        );
      } catch {}
      return next;
    });
  };

  const handleResetCompleted = () => {
    setCompletedExerciseIds(new Set());
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`uhc_completed_workout_exercises_${todayKey}`);
    } catch {}
  };

  React.useEffect(() => {
    fitnessApi
      .getData()
      .then((data) => {
        setExerciseMinutes(data.log?.exercise_minutes || 0);
        setActiveCalories(data.log?.active_calories || 0);
      })
      .catch(() => {});
  }, []);

  // Today's specific split
  const activeDaySplit = React.useMemo(() => {
    return (
      WEEKLY_MUSCLE_SPLITS.find((s) => s.dayNumber === selectedDayNumber) ||
      WEEKLY_MUSCLE_SPLITS[0]
    );
  }, [selectedDayNumber]);

  const isTodaySelected = selectedDayNumber === currentDayIndex;

  // Filtered exercises for Vault
  const filteredExercises = React.useMemo(() => {
    return ALL_EXERCISES.filter((ex) => {
      const matchSearch =
        !search ||
        `${ex.name} ${ex.targetMuscles.join(" ")} ${ex.equipment}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchCat = category === "All" || ex.workoutCategory === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  // Handlers
  const handleCompleteWorkout = async (durationMin: number) => {
    try {
      const calsBurned = durationMin * 7;
      await fitnessApi.updateLog({
        exercise_minutes: exerciseMinutes + durationMin,
        active_calories: activeCalories + calsBurned,
      });
      setExerciseMinutes((m) => m + durationMin);
      setActiveCalories((c) => c + calsBurned);
      setCompletedSessionsCount((c) => c + 1);
      setLoggedToast(true);
      setTimeout(() => setLoggedToast(false), 3500);
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
      <div className="mx-auto max-w-5xl space-y-6 pb-24 px-1 sm:px-2">
        {/* ── TOP HERO HEADER & DYNAMIC STATS ───────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-violet-500/10 p-5 sm:p-7 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">
                <Dumbbell className="h-3.5 w-3.5" />
                Adaptive Workout Suite
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Daily Workouts & Muscle Focus
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Personalized 1–2 muscle daily splits, push-up progressions, deep
                stretches, and full exercise tutorials.
              </p>
            </div>

            {/* Dynamic Activity Metrics */}
            <div className="flex gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)]/90 backdrop-blur-md px-4 py-3 shadow-xs">
                <div className="rounded-xl bg-rose-500/15 p-2 text-rose-500">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    {activeCalories}{" "}
                    <span className="text-[10px] font-normal text-[var(--text-tertiary)]">
                      kcal
                    </span>
                  </p>
                  <p className="text-[10px] font-medium text-[var(--text-tertiary)]">
                    Burned Today
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)]/90 backdrop-blur-md px-4 py-3 shadow-xs">
                <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-500">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    {exerciseMinutes}{" "}
                    <span className="text-[10px] font-normal text-[var(--text-tertiary)]">
                      min
                    </span>
                  </p>
                  <p className="text-[10px] font-medium text-[var(--text-tertiary)]">
                    Active Time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-SECTION SEGMENTED CONTROL TABS (FIXED UI & SCROLLING) ── */}
        <div className="w-full">
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("muscle-focus")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-1 sm:px-3 text-xs sm:text-sm font-bold transition",
                activeTab === "muscle-focus"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
              )}
            >
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Daily Focus</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("plans")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-1 sm:px-3 text-xs sm:text-sm font-bold transition",
                activeTab === "plans"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
              )}
            >
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Plans ({WORKOUT_PLANS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-1 sm:px-3 text-xs sm:text-sm font-bold transition",
                activeTab === "library"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
              )}
            >
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Vault ({ALL_EXERCISES.length})</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: DAILY MUSCLE FOCUS SPLIT ─────────────────────────── */}
        {activeTab === "muscle-focus" && (
          <div className="space-y-6">
            {/* Day Selector Pills Bar (Mon - Sun) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-violet-500" />
                  Weekly Cadence: Select Day
                </span>
                {isTodaySelected && (
                  <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                    Showing Today&apos;s Split
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {[
                  { num: 1, short: "Mon" },
                  { num: 2, short: "Tue" },
                  { num: 3, short: "Wed" },
                  { num: 4, short: "Thu" },
                  { num: 5, short: "Fri" },
                  { num: 6, short: "Sat" },
                  { num: 0, short: "Sun" },
                ].map(({ num, short }) => {
                  const isSelected = selectedDayNumber === num;
                  const isActualToday = currentDayIndex === num;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedDayNumber(num)}
                      className={cn(
                        "relative flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-2xl border transition-all text-center",
                        isSelected
                          ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-500/20"
                          : "border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:text-[var(--text-primary)]",
                      )}
                    >
                      <span className="text-[11px] sm:text-xs font-bold">
                        {short}
                      </span>
                      {isActualToday && (
                        <span
                          className={cn(
                            "mt-0.5 h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-white" : "bg-violet-500",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day's Focus Card & Full-Width Exercises */}
            <article className="overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-xl transition space-y-5">
              {/* Cover Banner */}
              <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full overflow-hidden bg-[var(--bg-secondary)]">
                <img
                  src={activeDaySplit.coverImage}
                  alt={activeDaySplit.focusTitle}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/50 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                    {activeDaySplit.dayName}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md",
                      difficultyBadge(activeDaySplit.difficulty),
                    )}
                  >
                    {activeDaySplit.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-xl sm:text-2xl mr-2">
                      {activeDaySplit.icon}
                    </span>
                    <h2 className="text-base sm:text-xl font-extrabold text-[var(--text-primary)] inline">
                      {activeDaySplit.focusTitle}
                    </h2>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-violet-600/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                    <Clock3 className="h-3.5 w-3.5" />
                    {activeDaySplit.durationMin} min
                  </span>
                </div>
              </div>

              {/* Tagline & Muscle Targets */}
              <div className="px-4 sm:px-6 space-y-3">
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {activeDaySplit.tagline}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {activeDaySplit.muscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full-Width Exercise Rows (NO MORE CUTOFF NAMES!) */}
              <div className="px-4 sm:px-6 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[var(--glass-border)]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Target Exercises ({activeDaySplit.exerciseIds.length}{" "}
                    Movements)
                  </p>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    Tap to preview technique
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeDaySplit.exerciseIds.map((id, idx) => {
                    const ex = EXERCISE_VIDEO_LIBRARY[id];
                    if (!ex) return null;

                    return (
                      <div
                        key={id}
                        className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)]/50 p-3 sm:p-3.5 transition hover:border-violet-500/40 hover:bg-violet-500/5 shadow-xs"
                      >
                        {/* Step Number */}
                        <span className="text-xs font-mono font-bold text-[var(--text-tertiary)] w-4 text-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Thumbnail with direct play trigger */}
                        <div
                          onClick={() => setTutorialExerciseId(id)}
                          className="relative h-14 w-16 sm:h-16 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-card)] cursor-pointer"
                        >
                          <img
                            src={ex.videoPoster}
                            alt={ex.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                            <Play className="h-4 w-4 text-white fill-white opacity-85 group-hover:opacity-100" />
                          </div>
                        </div>

                        {/* Full Exercise Name & Cues (PROPERLY DISPLAYED, NO ELLIPSIS) */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4
                              onClick={() => setTutorialExerciseId(id)}
                              className="font-bold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-violet-400 transition cursor-pointer leading-snug break-words"
                            >
                              {ex.name}
                            </h4>
                            {completedExerciseIds.has(id) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" /> Done
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            <span className="text-[11px] font-semibold text-violet-500">
                              {ex.reps || `${ex.durationSec}s`}
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)] hidden xs:inline">
                              •
                            </span>
                            <span className="text-[11px] text-[var(--text-tertiary)] truncate">
                              {ex.targetMuscles.slice(0, 2).join(", ")}
                            </span>
                          </div>
                        </div>

                        {/* Direct Watch Tutorial Button */}
                        <button
                          type="button"
                          onClick={() => setTutorialExerciseId(id)}
                          className="shrink-0 rounded-xl bg-violet-500/10 hover:bg-violet-600 hover:text-white px-3 py-2 text-xs font-bold text-violet-500 transition"
                        >
                          Form
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start Day's Guided Workout Button */}
              <div className="p-4 sm:p-6 border-t border-[var(--glass-border)] bg-[var(--bg-card)]">
                <button
                  type="button"
                  onClick={() =>
                    setActiveSession({
                      title: `${activeDaySplit.dayName}: ${activeDaySplit.focusTitle}`,
                      icon: activeDaySplit.icon,
                      exerciseIds: activeDaySplit.exerciseIds,
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-rose-500 py-3.5 text-sm sm:text-base font-bold text-white transition hover:opacity-95 shadow-lg shadow-violet-500/25"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start {activeDaySplit.dayName} Workout Session
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>
        )}

        {/* ── TAB 2: READY-MADE WORKOUT PLANS ──────────────────────────── */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                Targeted Workout Circuits
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Complete pre-built programs for specific goals, push-up mastery,
                lower body toning, and deep mobility.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {WORKOUT_PLANS.map((plan) => (
                <article
                  key={plan.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-lg transition hover:border-violet-500/40 hover:shadow-xl"
                >
                  {/* Card Visual Banner */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-secondary)]">
                    <img
                      src={plan.coverImage}
                      alt={plan.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
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
                    <div className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded-full bg-violet-600/90 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                      <Clock3 className="h-3 w-3" />
                      {plan.durationMin} min
                    </div>
                  </div>

                  {/* Plan Content */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{plan.icon}</span>
                      <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                        {plan.title}
                      </h3>
                    </div>

                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                      {plan.description}
                    </p>

                    {/* Exercises Included */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {plan.exerciseIds.map((id) => {
                        const ex = EXERCISE_VIDEO_LIBRARY[id];
                        if (!ex) return null;
                        const isDone = completedExerciseIds.has(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setTutorialExerciseId(id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition",
                              isDone
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold"
                                : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:text-violet-400",
                            )}
                          >
                            {isDone && (
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                            )}
                            <span>{ex.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Start Action */}
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
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-violet-500 shadow-md shadow-violet-500/20"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Start Plan ({plan.exerciseIds.length} Moves)
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                  Exercise Vault ({filteredExercises.length} Movements)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Every exercise contains verified posture checkpoints and video
                  tutorials.
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
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-violet-500/50"
                />
              </label>
            </div>

            {/* Category Filter Pills Bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                    category === cat
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                      : "border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Exercise Vault List / Grid with Full Names & Cover Thumbnails */}
            {filteredExercises.length > 0 ? (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {filteredExercises.map((exercise) => (
                  <article
                    key={exercise.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-3 sm:p-3.5 shadow-sm transition hover:border-violet-500/40 hover:shadow-md"
                  >
                    {/* Visual Cover Thumbnail */}
                    <div
                      onClick={() => setTutorialExerciseId(exercise.id)}
                      className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-secondary)] cursor-pointer"
                    >
                      <img
                        src={exercise.videoPoster}
                        alt={exercise.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className="inline-block rounded-md bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-500 mb-1">
                        {exercise.workoutCategory}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          onClick={() => setTutorialExerciseId(exercise.id)}
                          className="font-bold text-xs sm:text-sm text-[var(--text-primary)] hover:text-violet-400 transition cursor-pointer leading-snug break-words"
                        >
                          {exercise.name}
                        </h4>
                        {completedExerciseIds.has(exercise.id) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-500">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Done
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                        {exercise.reps || `${exercise.durationSec}s`} •{" "}
                        {exercise.targetMuscles.slice(0, 2).join(", ")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTutorialExerciseId(exercise.id)}
                      className="shrink-0 rounded-xl bg-violet-500/10 hover:bg-violet-600 hover:text-white px-3 py-2 text-xs font-bold text-violet-500 transition"
                    >
                      Form
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-card)] p-10 text-center">
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  No exercises found matching &quot;{search}&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-2 text-xs font-bold text-violet-500 hover:underline"
                >
                  Clear search
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
              <span className="text-xs sm:text-sm font-semibold text-emerald-300">
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

        {/* ── ACTIVE WORKOUT SESSION RUNNER ──────────────────────────── */}
        {activeSession && (
          <WorkoutSession
            plan={activeSession}
            completed={completedExerciseIds}
            onToggleExercise={handleToggleExercise}
            onResetCompleted={handleResetCompleted}
            onComplete={handleCompleteWorkout}
            onClose={() => setActiveSession(null)}
            onShowTutorial={(id) => setTutorialExerciseId(id)}
          />
        )}
      </div>
    </AppShell>
  );
}
