"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExerciseVideoModal } from "@/components/fitness/exercise-video-modal";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Dumbbell,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  DetailedExerciseVideo,
  EXERCISE_VIDEO_LIBRARY,
} from "@/lib/data/exercise-videos";
import { cn } from "@/lib/utils";

type ExerciseCategory =
  | "Bodyweight"
  | "Light weights"
  | "Stretching"
  | "Mobility"
  | "Core & Pilates"
  | "Cardio & conditioning";

type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface WorkoutPlan {
  id: string;
  title: string;
  duration: string;
  equipment: string;
  description: string;
  exerciseIds: string[];
  category: ExerciseCategory;
}

interface MovementGuide {
  title: string;
  summary: string;
  exerciseIds: string[];
}

const STRETCH_IDS = new Set([
  "childs_pose",
  "butterfly",
  "legs_wall",
  "chin_tuck",
  "trap_stretch",
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

const SYMPTOM_GUIDES: Record<string, MovementGuide> = {
  cramps: {
    title: "Period cramps",
    summary:
      "If gentle movement feels comfortable, try a short mobility break. Stop if it makes the pain worse; rest and warmth are also reasonable options.",
    exerciseIds: ["childs_pose", "cat_cow", "bridge", "legs_wall"],
  },
  back: {
    title: "Lower-back tension",
    summary:
      "Try a small, comfortable range of spinal movement and light hip strength. Skip any movement that increases pain or radiating symptoms.",
    exerciseIds: ["cat_cow", "bridge", "bird_dog", "childs_pose"],
  },
  neck: {
    title: "Neck and shoulder tension",
    summary:
      "Use gentle, pain-free neck and shoulder movement. Do not pull hard on your head or force a stretch.",
    exerciseIds: ["trap_stretch", "chin_tuck", "cat_cow"],
  },
  lowEnergy: {
    title: "Low energy",
    summary:
      "A few minutes of easy mobility may be enough, and taking a rest day is okay. Build up gradually when you feel ready.",
    exerciseIds: ["cat_cow", "bridge", "childs_pose"],
  },
  stress: {
    title: "Stress or needing a reset",
    summary:
      "Choose slow, comfortable movements and relaxed breathing. These are general movement ideas, not treatment for a health condition.",
    exerciseIds: ["childs_pose", "butterfly", "cat_cow", "trap_stretch"],
  },
  bloating: {
    title: "Bloating or feeling stiff",
    summary:
      "A relaxed walk or gentle mobility can be a comfortable option. Avoid movements that add pressure or discomfort.",
    exerciseIds: ["cat_cow", "childs_pose", "bridge"],
  },
};

const PHASE_GUIDES: Record<CyclePhase, MovementGuide> = {
  menstrual: {
    title: "Menstrual phase",
    summary:
      "If you have cramps or fatigue, choose gentle movement or rest according to comfort. There is no need to avoid strength training if it feels okay.",
    exerciseIds: ["childs_pose", "cat_cow", "bridge", "legs_wall"],
  },
  follicular: {
    title: "Follicular phase",
    summary:
      "If you feel well, this can be a convenient time for any routine you enjoy. Cycle phase alone does not determine your strength or readiness.",
    exerciseIds: ["squat", "rdl", "knee_pushup", "db_row"],
  },
  ovulation: {
    title: "Around ovulation",
    summary:
      "Choose your usual comfortable intensity; you do not need to push harder because of cycle timing. Adjust if you notice pain or other symptoms.",
    exerciseIds: ["squat", "walking_lunges", "db_chest_press", "bird_dog"],
  },
  luteal: {
    title: "Luteal phase",
    summary:
      "Symptoms and energy can vary. Keep your usual routine if it feels good, or shorten it and choose mobility when you prefer.",
    exerciseIds: ["bridge", "deadbug", "cat_cow", "wall_sit"],
  },
};

const CYCLE_PHASES: { id: CyclePhase; label: string }[] = [
  { id: "menstrual", label: "Menstrual" },
  { id: "follicular", label: "Follicular" },
  { id: "ovulation", label: "Ovulatory" },
  { id: "luteal", label: "Luteal" },
];

const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: "beginner",
    title: "Beginner full body",
    duration: "About 15 min",
    equipment: "No equipment",
    description:
      "A simple starting point with controlled bodyweight movements and easy-to-scale options.",
    exerciseIds: ["squat", "knee_pushup", "bridge", "bird_dog", "cat_cow"],
    category: "Bodyweight",
  },
  {
    id: "light-weights",
    title: "Light-weight strength",
    duration: "About 20 min",
    equipment: "Light dumbbells or household weights",
    description:
      "A balanced strength circuit for legs, chest, back, and shoulders. Start with a load you can control.",
    exerciseIds: [
      "squat",
      "rdl",
      "db_row",
      "db_chest_press",
      "lateral_raise",
    ],
    category: "Light weights",
  },
  {
    id: "lower-body",
    title: "Lower-body strength",
    duration: "About 15 min",
    equipment: "Bodyweight; optional light dumbbell",
    description:
      "Squat, hinge, and hip-strength options. Use a smaller range or hold a chair for balance if helpful.",
    exerciseIds: [
      "squat",
      "walking_lunges",
      "hip_thrust",
      "glute_kickback",
      "wall_sit",
    ],
    category: "Bodyweight",
  },
  {
    id: "core",
    title: "Core & Pilates basics",
    duration: "About 12 min",
    equipment: "Mat or carpet",
    description:
      "Steady core and stability movements. Use the easier variation or skip a move if it causes discomfort.",
    exerciseIds: ["deadbug", "bird_dog", "bridge", "forearm_plank", "pilates_100"],
    category: "Core & Pilates",
  },
  {
    id: "mobility",
    title: "Stretch & mobility reset",
    duration: "About 10 min",
    equipment: "Mat or comfortable floor space",
    description:
      "Gentle, unhurried stretches and spinal mobility. No bouncing or forcing end ranges.",
    exerciseIds: ["cat_cow", "childs_pose", "trap_stretch", "butterfly", "legs_wall"],
    category: "Stretching",
  },
  {
    id: "low-impact",
    title: "Low-impact movement",
    duration: "About 10 min",
    equipment: "No equipment",
    description:
      "A short, adjustable circuit. Use step-outs instead of jumping and pause whenever needed.",
    exerciseIds: ["jumping_jacks", "squat", "bridge", "cat_cow"],
    category: "Bodyweight",
  },
];

function getExerciseCategory(exercise: DetailedExerciseVideo): ExerciseCategory {
  if (STRETCH_IDS.has(exercise.id)) {
    return "Stretching";
  }

  if (exercise.id === "cat_cow") {
    return "Mobility";
  }

  if (CORE_IDS.has(exercise.id)) {
    return "Core & Pilates";
  }

  if (CARDIO_IDS.has(exercise.id)) {
    return "Cardio & conditioning";
  }

  if (
    ["rdl", "db_chest_press", "lateral_raise", "db_row"].includes(exercise.id)
  ) {
    return "Light weights";
  }

  return "Bodyweight";
}

const EXERCISES = Object.values(EXERCISE_VIDEO_LIBRARY).map((exercise) => ({
  ...exercise,
  workoutCategory: getExerciseCategory(exercise),
}));

const EXERCISE_CATEGORIES: ("All" | ExerciseCategory)[] = [
  "All",
  "Bodyweight",
  "Light weights",
  "Stretching",
  "Mobility",
  "Core & Pilates",
  "Cardio & conditioning",
];

export default function WorkoutPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<"All" | ExerciseCategory>(
    "All",
  );
  const [selectedSymptom, setSelectedSymptom] = React.useState<string | null>(
    null,
  );
  const [selectedPhase, setSelectedPhase] = React.useState<CyclePhase | null>(
    null,
  );
  const [tutorialExerciseId, setTutorialExerciseId] = React.useState<
    string | null
  >(null);

  const symptomGuide = selectedSymptom
    ? SYMPTOM_GUIDES[selectedSymptom]
    : null;
  const phaseGuide = selectedPhase ? PHASE_GUIDES[selectedPhase] : null;
  const filteredExercises = EXERCISES.filter((exercise) => {
    const matchesSearch =
      !search ||
      `${exercise.name} ${exercise.targetMuscles.join(" ")} ${exercise.equipment}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || exercise.workoutCategory === category;
    const matchesSymptom =
      !symptomGuide || symptomGuide.exerciseIds.includes(exercise.id);

    return matchesSearch && matchesCategory && matchesSymptom;
  });

  const getExercise = (id: string) => EXERCISE_VIDEO_LIBRARY[id];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 pb-16">
        <section className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-xs sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <Sparkles className="h-3.5 w-3.5" />
                At-home movement library
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Move in a way that feels right
              </h1>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                Browse bodyweight and light-weight strength, stretching,
                mobility, core, and low-impact routines. Every exercise has a
                tutorial video and simple form cues.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {EXERCISES.length} guided exercises
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Start gently; progress at your pace
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Choose a quick routine
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              These are flexible menus, not prescriptions. Open any movement
              for its tutorial.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {WORKOUT_PLANS.map((plan) => (
              <article
                key={plan.id}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[var(--text-primary)]">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {plan.duration} · {plan.equipment}
                    </p>
                  </div>
                  <span className="rounded-xl bg-violet-500/10 p-2 text-violet-500">
                    {plan.category === "Light weights" ? (
                      <Dumbbell className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {plan.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.exerciseIds.map((id) => {
                    const exercise = getExercise(id);
                    if (!exercise) {
                      return null;
                    }

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTutorialExerciseId(id)}
                        className="rounded-full border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2.5 py-1 text-left text-xs font-medium text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:text-violet-500"
                      >
                        {exercise.name}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <h2 className="font-bold text-[var(--text-primary)]">
                Find a comfortable option
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              These are general movement ideas for common symptoms, not
              diagnosis or treatment. Choose only what feels comfortable.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SYMPTOM_GUIDES).map(([id, guide]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selectedSymptom === id}
                  onClick={() =>
                    setSelectedSymptom(selectedSymptom === id ? null : id)
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    selectedSymptom === id
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                      : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {guide.title}
                </button>
              ))}
            </div>
            {symptomGuide && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {symptomGuide.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {symptomGuide.summary}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <h2 className="font-bold text-[var(--text-primary)]">
                Optional cycle-aware ideas
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Cycle length, ovulation timing, symptoms, and energy vary. Phase
              labels are not a readiness score or a rule about what you can do.
            </p>
            <div className="flex flex-wrap gap-2">
              {CYCLE_PHASES.map((phase) => (
                <button
                  key={phase.id}
                  type="button"
                  aria-pressed={selectedPhase === phase.id}
                  onClick={() =>
                    setSelectedPhase(
                      selectedPhase === phase.id ? null : phase.id,
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    selectedPhase === phase.id
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                      : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {phase.label}
                </button>
              ))}
            </div>
            {phaseGuide && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {phaseGuide.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {phaseGuide.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {phaseGuide.exerciseIds.map((id) => {
                    const exercise = getExercise(id);
                    if (!exercise) {
                      return null;
                    }

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTutorialExerciseId(id)}
                        className="rounded-full border border-violet-500/20 bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-300"
                      >
                        {exercise.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Exercise library
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Select a category or search by exercise, equipment, or muscle
                group.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search exercises"
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
              />
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {EXERCISE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  category === item
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {selectedSymptom && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-[var(--text-secondary)]">
              <span>
                Showing comfortable options for {symptomGuide?.title.toLowerCase()}.
              </span>
              <button
                type="button"
                onClick={() => setSelectedSymptom(null)}
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-rose-600 dark:text-rose-300"
              >
                Clear <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {filteredExercises.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredExercises.map((exercise) => (
                <article
                  key={exercise.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-xs transition hover:border-violet-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                        {exercise.workoutCategory}
                      </span>
                      <h3 className="font-bold leading-snug text-[var(--text-primary)]">
                        {exercise.name}
                      </h3>
                    </div>
                    <span className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
                      <Dumbbell className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--text-secondary)]">
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
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  >
                    <Activity className="h-4 w-4" />
                    Watch tutorial
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--glass-border)] bg-[var(--bg-card)] p-10 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                No exercises match those filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setSelectedSymptom(null);
                }}
                className="mt-3 text-sm font-semibold text-violet-600 dark:text-violet-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="font-bold text-[var(--text-primary)]">
              Train safely and flexibly
            </h2>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Use a load and range you can control, breathe normally, and stop
              if you feel sharp or worsening pain, dizziness, chest pain, or
              unusual shortness of breath. For severe or unusual period pain,
              seek medical advice. This library is general education, not
              medical care; pregnancy, postpartum recovery, injury, or a health
              condition may require individualized guidance.
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              As a general benchmark, adults can work toward 150 minutes of
              moderate activity per week and strength training on at least 2
              days, adjusted to ability and health.{" "}
              <a
                href="https://www.cdc.gov/physical-activity-basics/guidelines/adults.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-violet-600 underline decoration-violet-500/40 underline-offset-2 dark:text-violet-300"
              >
                CDC adult activity guidance
              </a>
            </p>
          </div>
        </section>

        <div className="sr-only" aria-live="polite">
          {filteredExercises.length} exercises shown
        </div>

        {tutorialExerciseId && (
          <ExerciseVideoModal
            key={tutorialExerciseId}
            exerciseId={tutorialExerciseId}
            onClose={() => setTutorialExerciseId(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
