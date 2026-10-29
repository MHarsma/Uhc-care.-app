"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { periodApi, ActiveCycleSummary } from "@/lib/api/period";
import { fitnessApi, FitnessGoals, FitnessLogEntry } from "@/lib/api/fitness";
import {
  Dumbbell,
  Sparkles,
  Flame,
  Heart,
  Droplets,
  Activity,
  Zap,
  Check,
  Plus,
  Minus,
  Play,
  Pause,
  Clock,
  ShieldAlert,
  CalendarHeart,
  Info,
  Apple,
  RotateCcw,
  CheckCircle2,
  Brain,
  Coffee,
  Sun,
  Moon,
  Pencil,
  AlertTriangle,
  Smile,
  X,
  ChevronRight,
  ChevronLeft,
  Award,
  Video,
  Layers,
  Eye,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ExerciseVideoModal } from "@/components/fitness/exercise-video-modal";

// ============================================================================
// DATA MODELS & INTERFACES
// ============================================================================

type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface ExerciseDetail {
  id: string;
  name: string;
  durationSec: number;
  reps?: string;
  targetMuscles: string[];
  equipment: string;
  frontAngleCue: string;
  sideAngleCue: string;
  howTo: string[];
  benefits: string[];
  breathing: string;
  commonMistakes: string;
  svgType: "childs_pose" | "cat_cow" | "butterfly" | "bridge" | "legs_wall" | "chin_tuck" | "trap_stretch" | "squat" | "rdl" | "press" | "pilates_100" | "bird_dog";
}

interface WorkoutItem {
  id: string;
  title: string;
  category: "Cycle Sync" | "Strength" | "Yoga & Relief" | "Pilates" | "Quick 10-Min";
  phase: CyclePhase | "all";
  durationMinutes: number;
  calories: number;
  intensity: "Gentle (Restorative)" | "Moderate" | "Peak Vitality";
  equipment: string;
  targetMuscles: string[];
  icon: string;
  accentColor: string;
  description: string;
  exercises: ExerciseDetail[];
}

interface SymptomProtocol {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  quickNote: string;
  steps: {
    title: string;
    desc: string;
    durationMinutes: number;
    icon: string;
    tag: string;
  }[];
}

// ============================================================================
// EXERCISES & WORKOUTS DATABASE
// ============================================================================

const EXERCISE_LIBRARY: Record<string, ExerciseDetail> = {
  childs_pose: {
    id: "childs_pose",
    name: "Child's Pose with Abdominal Expansion",
    durationSec: 90,
    targetMuscles: ["Lower Back", "Pelvic Floor", "Hip Joints"],
    equipment: "Yoga Mat / Soft Carpet",
    frontAngleCue: "Knees wide at mat width, big toes touching together, arms extended forward.",
    sideAngleCue: "Hips sink back towards heels, spine elongated, forehead gently resting on mat.",
    howTo: [
      "Begin on hands and knees, then open your knees wide and bring your big toes together.",
      "Send your hips back toward your heels and melt your chest downward.",
      "Extend your arms long in front of you, spreading fingertips softly.",
      "Breathe deeply into your lower abdomen and lower back, letting the pelvic floor soften on every exhale.",
    ],
    benefits: [
      "Relieves uterine cramping and lower back compression during days 1–5.",
      "Stimulates parasympathetic relaxation to soothe tension headaches.",
      "Gently decompresses sacral nerves without straining joints.",
    ],
    breathing: "Inhale 4s deeply down into belly; exhale 6s slowly letting all tension leave your shoulders.",
    commonMistakes: "Holding breath or keeping knees too narrow, which pinches the hip flexors.",
    svgType: "childs_pose",
  },
  cat_cow: {
    id: "cat_cow",
    name: "Cat-Cow Dynamic Spine Mobilization",
    durationSec: 60,
    reps: "10 rhythmic cycles",
    targetMuscles: ["Thoracic Spine", "Cervical Spine", "Abdominal Wall"],
    equipment: "No Equipment",
    frontAngleCue: "Wrists directly beneath shoulders, fingers spread evenly.",
    sideAngleCue: "Inhale arching gently with chest opening; exhale tucking tailbone and rounding upper back.",
    howTo: [
      "Start on all fours with shoulders over wrists and hips directly over knees.",
      "Inhale (Cow): Drop your belly softly, gently lift your gaze, and broaden across collarbones.",
      "Exhale (Cat): Draw your navel toward your spine, round through your shoulder blades, and release your head.",
      "Move fluidly with your breath, never forcing end ranges.",
    ],
    benefits: [
      "Improves cerebral spinal fluid circulation to lift mental brain fog.",
      "Eases stiffness in the mid-back and lumbar area.",
      "Mobilizes the vagus nerve for emotional grounding.",
    ],
    breathing: "Inhale completely on extension (Cow); exhale smoothly on flexion (Cat).",
    commonMistakes: "Crunching the back of the neck instead of lengthening the whole spine.",
    svgType: "cat_cow",
  },
  butterfly: {
    id: "butterfly",
    name: "Reclined Butterfly (Supta Baddha Konasana)",
    durationSec: 120,
    targetMuscles: ["Inner Thighs", "Pelvic Floor", "Groin Flexors"],
    equipment: "Cushion / Blanket (Optional)",
    frontAngleCue: "Soles of feet together, knees dropping open like wings with zero force.",
    sideAngleCue: "Lower back flat and relaxed against the mat, arms resting open beside hips.",
    howTo: [
      "Lie comfortably on your back with arms relaxed at your sides, palms facing upward.",
      "Bend your knees and draw the soles of your feet together, letting knees fall open.",
      "Place folded pillows under outer thighs if inner thighs feel tight.",
      "Close your eyes and breathe rhythmically into your lower pelvis.",
    ],
    benefits: [
      "Relaxes pelvic diaphragm spasms responsible for menstrual aches.",
      "Boosts arterial circulation to ovaries and uterus.",
      "Helps lower blood pressure and nervous system restlessness.",
    ],
    breathing: "Natural diaphragmatic breathing — expand your ribcage 360 degrees.",
    commonMistakes: "Forcing knees down with hands; let gravity do the work gently.",
    svgType: "butterfly",
  },
  bridge: {
    id: "bridge",
    name: "Gentle Supported Glute Bridge",
    durationSec: 90,
    reps: "8 slow reps or hold",
    targetMuscles: ["Gluteus Maximus", "Hamstrings", "Pelvic Stabilizers"],
    equipment: "Mat",
    frontAngleCue: "Feet hip-width apart and parallel, knees tracking over second toes.",
    sideAngleCue: "Hips elevate until a straight line forms from knees to shoulders.",
    howTo: [
      "Lie on your back with knees bent and feet planted flat on the floor, fingertips brushing heels.",
      "Press through your heels to gently peel your spine off the mat.",
      "Engage glutes softly at the peak without hyperextending your lower back.",
      "Lower down slowly, vertebra by vertebra.",
    ],
    benefits: [
      "Activates glutes and pelvic stabilizers without spike in fatigue.",
      "Counteracts prolonged sitting and relieves sacral pressure.",
      "Promotes healthy pelvic venous drainage.",
    ],
    breathing: "Inhale on the floor; exhale as you lift hips; inhale as you lower.",
    commonMistakes: "Arching through the lower back instead of squeezing glutes.",
    svgType: "bridge",
  },
  legs_wall: {
    id: "legs_wall",
    name: "Viparita Karani (Legs-Up-The-Wall Rest)",
    durationSec: 180,
    targetMuscles: ["Hamstrings", "Lymphatic System", "Lower Back"],
    equipment: "Wall or Headboard",
    frontAngleCue: "Legs resting together vertically against wall, arms open at 45 degrees.",
    sideAngleCue: "Sit bones close to wall base, lumbar spine fully supported by mat.",
    howTo: [
      "Scoot one hip next to the wall, then swing your legs up as you recline back onto the floor.",
      "Rest your arms out to the sides with palms up.",
      "Allow legs to be completely passive with soft knees.",
      "Stay in this posture and let gravity assist venous and lymphatic return.",
    ],
    benefits: [
      "Dramatic reduction in leg heaviness, water retention, and bloating.",
      "Directly lowers sympathetic tone, easing tension and hormonal headaches.",
      "Restores restful balance to adrenal glands.",
    ],
    breathing: "Slow, elongated exhales to deepen parasympathetic healing.",
    commonMistakes: "Straining to keep legs completely locked; keep a micro-bend in knees.",
    svgType: "legs_wall",
  },
  chin_tuck: {
    id: "chin_tuck",
    name: "Suboccipital Nerve Decompression Chin Tucks",
    durationSec: 60,
    reps: "12 reps",
    targetMuscles: ["Deep Neck Flexors", "Suboccipital Base", "Upper Trapezius"],
    equipment: "No Equipment",
    frontAngleCue: "Head upright, eyes looking straight ahead, jaw relaxed.",
    sideAngleCue: "Draw head straight back like creating a double chin, lengthening back of neck.",
    howTo: [
      "Sit tall with your shoulders relaxed away from your ears.",
      "Look straight forward at eye level.",
      "Gently glide your chin straight back as if sliding a drawer into a desk.",
      "Feel the stretch at the base of your skull; hold for 3 seconds, then return to neutral.",
    ],
    benefits: [
      "Direct relief for morning headaches, temple throbbing, and eye strain.",
      "Decompresses the greater occipital nerve roots.",
      "Corrects forward-head posture from phone and laptop usage.",
    ],
    breathing: "Inhale neutral; exhale as you glide chin back and lengthen skull base.",
    commonMistakes: "Tilting head downward like looking at chest; keep chin parallel to floor.",
    svgType: "chin_tuck",
  },
  trap_stretch: {
    id: "trap_stretch",
    name: "Upper Trapezius & Levator Scapulae Stretch",
    durationSec: 120,
    targetMuscles: ["Upper Traps", "Scalenes", "Levator Scapulae"],
    equipment: "No Equipment",
    frontAngleCue: "Tilt left ear to left shoulder, right arm relaxed or reaching toward floor.",
    sideAngleCue: "Spine remains vertical without leaning torso; gentle hand guidance.",
    howTo: [
      "Sit tall with spine aligned and shoulders dropped.",
      "Gently tip your right ear toward your right shoulder.",
      "Rest your right hand lightly on the left side of your head for gentle assistance.",
      "Hold for 30–45 seconds, breathing into the tight lateral neck band, then switch sides.",
    ],
    benefits: [
      "Releases the primary muscle culprit for cervicogenic and tension headaches.",
      "Enhances cranial blood flow to reduce throbbing sensations.",
      "Releases stress stored in the neck and shoulder girdle.",
    ],
    breathing: "Exhale into the feeling of release with every cycle.",
    commonMistakes: "Pulling hard on head; use only feather-light guidance.",
    svgType: "trap_stretch",
  },
  squat: {
    id: "squat",
    name: "Goblet Squat with Hip Drive",
    durationSec: 60,
    reps: "12 reps",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Core Core"],
    equipment: "Dumbbell / Kettlebell (Optional)",
    frontAngleCue: "Feet slightly wider than shoulders, toes angled out 15-30 degrees.",
    sideAngleCue: "Hips travel back and down, chest stays elevated, spine neutral throughout.",
    howTo: [
      "Hold a weight at your chest or keep hands clasped together.",
      "Brace your core, hinge at your hips, and bend knees to lower down smoothly.",
      "Descend until thighs are parallel to the ground while keeping heels planted.",
      "Drive through your midfoot and heels to stand back up, squeezing glutes at the top.",
    ],
    benefits: [
      "Builds lower-body bone density and lean muscle during Follicular estrogen surge.",
      "Improves insulin sensitivity and metabolic efficiency.",
      "Strengthens core and pelvic stability for daily energy.",
    ],
    breathing: "Inhale on the descent; exhale with power as you stand up.",
    commonMistakes: "Allowing knees to cave inward or heels to lift off floor.",
    svgType: "squat",
  },
  rdl: {
    id: "rdl",
    name: "Romanian Deadlift (RDL)",
    durationSec: 60,
    reps: "10-12 reps",
    targetMuscles: ["Hamstrings", "Glutes", "Erector Spinae"],
    equipment: "Dumbbells",
    frontAngleCue: "Feet hip-width apart, dumbbells resting on front of thighs.",
    sideAngleCue: "Hips push straight back toward the wall behind you, slight knee bend, flat back.",
    howTo: [
      "Stand tall holding dumbbells in front of thighs with shoulders retracted.",
      "With a soft bend in your knees, push your hips straight back.",
      "Glide the weights close to your shins until you feel a deep hamstring stretch.",
      "Drive hips forward to return to standing, locking in glutes.",
    ],
    benefits: [
      "Develops the posterior chain and eliminates lower back vulnerability.",
      "High calorie burn and postural reinforcement.",
      "Tones hamstrings and glutes cleanly.",
    ],
    breathing: "Inhale as hips push back; exhale as you push the ground away to stand.",
    commonMistakes: "Rounding the upper back or squatting with too much knee bend.",
    svgType: "rdl",
  },
  pilates_100: {
    id: "pilates_100",
    name: "Pilates Hundred Deep Core Activation",
    durationSec: 90,
    targetMuscles: ["Transverse Abdominis", "Pelvic Floor", "Intercostals"],
    equipment: "Mat",
    frontAngleCue: "Legs in tabletop (or extended 45 deg), arms hovering beside hips.",
    sideAngleCue: "Head and shoulders curled off mat, lower back imprinted into floor.",
    howTo: [
      "Lie on your back, bring knees into tabletop position (shins parallel to floor).",
      "Curl your head and chest up, drawing your ribs toward your pelvis.",
      "Reach arms forward and pump them rhythmically up and down 6 inches.",
      "Inhale for 5 pumps, exhale for 5 pumps, completing 10 full cycles.",
    ],
    benefits: [
      "Deep core tone without high-impact spinal compression.",
      "Oxygenates the bloodstream and strengthens the transverse girdle.",
      "Ideal for Luteal phase progesterone support.",
    ],
    breathing: "Breathe in through the nose for 5 counts; breathe out through mouth for 5 counts.",
    commonMistakes: "Straining through neck; keep gaze focused at thighs to maintain neck alignment.",
    svgType: "pilates_100",
  },
  bird_dog: {
    id: "bird_dog",
    name: "Bird-Dog Core & Posterior Stabilizer",
    durationSec: 90,
    reps: "10 reps per side",
    targetMuscles: ["Erector Spinae", "Gluteus Medius", "Deep Core"],
    equipment: "Mat",
    frontAngleCue: "Neutral neck looking down at mat, hips level and squared to floor.",
    sideAngleCue: "Opposite arm and leg extend simultaneously in a straight line with spine.",
    howTo: [
      "Begin on hands and knees with flat tabletop spine.",
      "Simultaneously reach your right arm straight forward and left leg straight back.",
      "Hold for 2 seconds, keeping hips level without tipping sideways.",
      "Return to starting position and switch to left arm and right leg.",
    ],
    benefits: [
      "Improves rotary stability and prevents sacroiliac joint discomfort.",
      "Safe and highly effective for core strengthening across all cycle days.",
      "Enhances balance and neuromuscular coordination.",
    ],
    breathing: "Exhale as you extend; inhale as you return to center.",
    commonMistakes: "Arching lower back at peak extension or rotating hips open.",
    svgType: "bird_dog",
  },
};

const WORKOUT_DATABASE: WorkoutItem[] = [
  {
    id: "w-restorative-flow",
    title: "Restorative Pelvic & Spine Flow",
    category: "Yoga & Relief",
    phase: "menstrual",
    durationMinutes: 12,
    calories: 65,
    intensity: "Gentle (Restorative)",
    equipment: "Yoga Mat / Soft Carpet",
    targetMuscles: ["Lower Back", "Pelvic Floor", "Hips"],
    icon: "🧘‍♀️",
    accentColor: "from-rose-500 to-pink-500",
    description: "Tailored for Days 1–5 to soothe uterine cramps, decompress the lumbar spine, and restore parasympathetic calm.",
    exercises: [
      EXERCISE_LIBRARY.childs_pose,
      EXERCISE_LIBRARY.cat_cow,
      EXERCISE_LIBRARY.butterfly,
      EXERCISE_LIBRARY.bridge,
      EXERCISE_LIBRARY.legs_wall,
    ],
  },
  {
    id: "w-headache-relief",
    title: "Suboccipital & Cervical Headache Relief",
    category: "Quick 10-Min",
    phase: "all",
    durationMinutes: 10,
    calories: 40,
    intensity: "Gentle (Restorative)",
    equipment: "No Equipment",
    targetMuscles: ["Neck", "Base of Skull", "Upper Trapezius"],
    icon: "💆‍♀️",
    accentColor: "from-amber-500 to-orange-500",
    description: "Rapid relief for morning tension headaches, neck tightness, or supplement-induced vascular discomfort.",
    exercises: [
      EXERCISE_LIBRARY.chin_tuck,
      EXERCISE_LIBRARY.trap_stretch,
      EXERCISE_LIBRARY.cat_cow,
      EXERCISE_LIBRARY.legs_wall,
    ],
  },
  {
    id: "w-follicular-sculpt",
    title: "Progressive Lower & Core Sculpt",
    category: "Strength",
    phase: "follicular",
    durationMinutes: 25,
    calories: 180,
    intensity: "Moderate",
    equipment: "Dumbbells / Mat",
    targetMuscles: ["Glutes", "Hamstrings", "Quadriceps", "Core"],
    icon: "⚡",
    accentColor: "from-violet-500 to-indigo-500",
    description: "Capitalize on rising estrogen during Days 6–13 to sculpt lean muscle tone, improve posture, and build strength.",
    exercises: [
      EXERCISE_LIBRARY.squat,
      EXERCISE_LIBRARY.rdl,
      EXERCISE_LIBRARY.bridge,
      EXERCISE_LIBRARY.bird_dog,
    ],
  },
  {
    id: "w-luteal-pilates",
    title: "Low-Impact Deep Core & Glute Pilates",
    category: "Pilates",
    phase: "luteal",
    durationMinutes: 18,
    calories: 110,
    intensity: "Moderate",
    equipment: "Mat",
    targetMuscles: ["Deep Transverse Core", "Glutes", "Inner Thighs"],
    icon: "🌙",
    accentColor: "from-indigo-500 to-purple-500",
    description: "Controlled pilates movements that tone without elevating cortisol or straining joints during Days 18–28.",
    exercises: [
      EXERCISE_LIBRARY.pilates_100,
      EXERCISE_LIBRARY.bridge,
      EXERCISE_LIBRARY.bird_dog,
      EXERCISE_LIBRARY.butterfly,
    ],
  },
];

const SYMPTOM_PROTOCOLS: SymptomProtocol[] = [
  {
    id: "headache",
    name: "Morning or Tension Headache",
    icon: "💆‍♀️",
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    borderClass: "border-amber-500/30",
    quickNote: "Commonly triggered by taking mineral supplements on an empty stomach, dehydration, or suboccipital neck tightness.",
    steps: [
      {
        title: "Immediate Electrolyte Hydration",
        desc: "Drink 500ml of room-temperature water with a pinch of mineral salt or lemon to rebalance cellular fluid volume.",
        durationMinutes: 1,
        icon: "💧",
        tag: "Hydration",
      },
      {
        title: "Buffer with Gentle Breakfast",
        desc: "Eat a slice of whole-grain toast, an egg, or a handful of almonds to soothe gastric lining irritation.",
        durationMinutes: 3,
        icon: "🥑",
        tag: "Nutrition",
      },
      {
        title: "Suboccipital Chin Tucks",
        desc: "Perform 12 gentle chin tucks to immediately release compression on the greater occipital nerve.",
        durationMinutes: 2,
        icon: "🧘‍♀️",
        tag: "Movement",
      },
      {
        title: "Temples & Forehead Cool Compress",
        desc: "Apply a cool damp cloth to forehead while lightly massaging temples in slow outward circles.",
        durationMinutes: 3,
        icon: "🧊",
        tag: "Relief",
      },
    ],
  },
  {
    id: "nausea",
    name: "Morning Nausea & Stomach Distress",
    icon: "🤢",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    borderClass: "border-emerald-500/30",
    quickNote: "Taking Zinc, Iron, or Vitamin C without food directly irritates gastric mucosa, creating nausea and cramping.",
    steps: [
      {
        title: "Sip Warm Ginger or Mint Tea",
        desc: "Gingerol compounds naturally relax stomach smooth-muscle contractions within minutes.",
        durationMinutes: 3,
        icon: "🍵",
        tag: "Herbal",
      },
      {
        title: "Starch & Complex Carb Buffer",
        desc: "Eat 2-3 plain crackers, half a banana, or a bowl of warm oats to neutralize stomach acids.",
        durationMinutes: 3,
        icon: "🍌",
        tag: "Food",
      },
      {
        title: "Adjust Supplement Timing",
        desc: "Always take morning minerals halfway through breakfast, never on an empty stomach.",
        durationMinutes: 1,
        icon: "💊",
        tag: "Routine",
      },
    ],
  },
  {
    id: "cramps",
    name: "Uterine & Lower Back Cramps",
    icon: "🩸",
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/10 dark:bg-rose-500/15",
    borderClass: "border-rose-500/30",
    quickNote: "Prostaglandin-mediated contractions are most effectively relieved by localized warmth and pelvic decompression.",
    steps: [
      {
        title: "Targeted Heat Therapy",
        desc: "Place a warm heating pad or hot water bottle across the lower abdomen or sacrum.",
        durationMinutes: 10,
        icon: "🔥",
        tag: "Therapy",
      },
      {
        title: "Child's Pose Breathing",
        desc: "Sink into Child's Pose with wide knees and breathe deeply to loosen pelvic floor muscles.",
        durationMinutes: 4,
        icon: "🧘‍♀️",
        tag: "Stretch",
      },
      {
        title: "Evening Magnesium Glycinate",
        desc: "Take 200–300mg Magnesium Glycinate before bed to naturally relax smooth muscle tissue.",
        durationMinutes: 1,
        icon: "🌙",
        tag: "Mineral",
      },
    ],
  },
  {
    id: "fatigue",
    name: "Low Energy & Hormonal Brain Fog",
    icon: "😴",
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/15",
    borderClass: "border-violet-500/30",
    quickNote: "Common in Luteal and Menstrual phases due to progesterone elevation and iron loss.",
    steps: [
      {
        title: "Natural Morning Sunlight Exposure",
        desc: "Spend 5–10 minutes near a sunlit window or outdoors to naturally stimulate cortisol & alertness.",
        durationMinutes: 5,
        icon: "☀️",
        tag: "Circadian",
      },
      {
        title: "Electrolytes & B-Complex Boost",
        desc: "Recharge cellular energy pathways without caffeine spikes and energy crashes.",
        durationMinutes: 2,
        icon: "⚡",
        tag: "Nutrients",
      },
      {
        title: "Gentle Incline Walk or Mobility",
        desc: "A relaxed 10-minute walk boosts cerebral circulation and lifts mental fog.",
        durationMinutes: 10,
        icon: "🚶‍♀️",
        tag: "Pacing",
      },
    ],
  },
];

// ============================================================================
// EXERCISE VISUAL ILLUSTRATION COMPONENT (SVG Angles)
// ============================================================================

function ExerciseIllustration({
  type,
  angle = "front",
  className,
}: {
  type: ExerciseDetail["svgType"];
  angle?: "front" | "side";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/60 dark:from-slate-900/80 dark:to-slate-950/90 border border-slate-200/80 dark:border-white/10 p-4 transition-all",
        className
      )}
    >
      <div className="absolute top-2 right-2 rounded-full bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
        {angle === "front" ? "Front Angle" : "Side Angle"}
      </div>

      <svg
        viewBox="0 0 200 120"
        className="h-28 w-44 stroke-current text-violet-600 dark:text-violet-400"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "childs_pose" && (
          angle === "front" ? (
            <g>
              <circle cx="100" cy="55" r="14" className="fill-violet-500/20" />
              <path d="M70 75 Q100 65 130 75" />
              <path d="M55 90 L85 85 L100 95 L115 85 L145 90" />
              <path d="M45 40 L75 60 L125 60 L155 40" strokeDasharray="2 2" />
            </g>
          ) : (
            <g>
              {/* Head */}
              <circle cx="50" cy="80" r="12" className="fill-violet-500/20" />
              {/* Torso & hips resting on heels */}
              <path d="M62 82 Q90 65 140 78" />
              <path d="M140 78 L160 95 L125 100" />
              {/* Arms extended forward */}
              <path d="M68 82 L20 86" />
            </g>
          )
        )}

        {type === "chin_tuck" && (
          <g>
            <circle cx="100" cy="45" r="18" className="fill-amber-500/20 text-amber-500 dark:text-amber-400" />
            <path d="M100 63 L100 100" className="text-amber-500 dark:text-amber-400" />
            <path d="M80 80 L100 70 L120 80" className="text-amber-500 dark:text-amber-400" />
            <path d="M90 48 Q100 52 110 48" className="text-amber-500 dark:text-amber-400" strokeWidth="2.5" />
            {/* Guide arrow */}
            <path d="M125 45 L145 45 M140 40 L145 45 L140 50" strokeWidth="2" className="text-rose-400" />
          </g>
        )}

        {type === "squat" && (
          angle === "front" ? (
            <g>
              <circle cx="100" cy="30" r="14" className="fill-violet-500/20" />
              <path d="M100 44 L100 70" />
              <path d="M75 52 L100 60 L125 52" />
              <path d="M100 70 L70 90 L65 110" />
              <path d="M100 70 L130 90 L135 110" />
            </g>
          ) : (
            <g>
              <circle cx="115" cy="32" r="14" className="fill-violet-500/20" />
              <path d="M115 46 Q105 65 85 75" />
              <path d="M85 75 L120 80 L115 110" />
              <path d="M115 54 L135 65" />
            </g>
          )
        )}

        {type === "bridge" && (
          <g>
            <circle cx="45" cy="90" r="12" className="fill-pink-500/20 text-pink-500 dark:text-pink-400" />
            <path d="M57 90 Q90 60 135 65" className="text-pink-500 dark:text-pink-400" />
            <path d="M135 65 L155 95 L140 100" className="text-pink-500 dark:text-pink-400" />
            <path d="M57 95 L105 95" className="text-pink-500 dark:text-pink-400" />
          </g>
        )}

        {type === "legs_wall" && (
          <g>
            <circle cx="70" cy="95" r="12" className="fill-blue-500/20 text-blue-500 dark:text-blue-400" />
            <path d="M82 95 L130 95" className="text-blue-500 dark:text-blue-400" />
            <path d="M130 95 L130 20" className="text-blue-500 dark:text-blue-400" />
            {/* Wall line */}
            <path d="M136 10 L136 110" strokeWidth="2" strokeDasharray="3 3" className="text-slate-400" />
          </g>
        )}

        {type === "butterfly" && (
          <g>
            <circle cx="100" cy="30" r="14" className="fill-rose-500/20 text-rose-500 dark:text-rose-400" />
            <path d="M100 44 L100 80" className="text-rose-500 dark:text-rose-400" />
            <path d="M100 80 Q65 75 60 95 Q80 100 100 95" className="text-rose-500 dark:text-rose-400" />
            <path d="M100 80 Q135 75 140 95 Q120 100 100 95" className="text-rose-500 dark:text-rose-400" />
          </g>
        )}

        {/* Fallback generic silhouette */}
        {!["childs_pose", "chin_tuck", "squat", "bridge", "legs_wall", "butterfly"].includes(type) && (
          <g>
            <circle cx="100" cy="35" r="14" className="fill-violet-500/20" />
            <path d="M100 50 L100 85" />
            <path d="M75 60 L100 65 L125 60" />
            <path d="M100 85 L80 110" />
            <path d="M100 85 L120 110" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function MovementAndVitalityPage() {
  const [cycleData, setCycleData] = React.useState<ActiveCycleSummary | null>(null);
  const [isLoadingCycle, setIsLoadingCycle] = React.useState(true);
  const [cycleDay, setCycleDay] = React.useState<number>(8);

  // Activity Ring Metric States — fetched from API
  const [activeCalories, setActiveCalories] = React.useState(0);
  const [exerciseMinutes, setExerciseMinutes] = React.useState(0);
  const [mindfulMinutes, setMindfulMinutes] = React.useState(0);
  const [waterGlasses, setWaterGlasses] = React.useState(0);

  // Customizable Fitness Goals — fetched from API
  const [targetCalories, setTargetCalories] = React.useState(300);
  const [targetExercise, setTargetExercise] = React.useState(30);
  const [targetMindful, setTargetMindful] = React.useState(15);
  const [targetWaterGlasses, setTargetWaterGlasses] = React.useState(8);

  // Goals Modal State
  const [isGoalsModalOpen, setIsGoalsModalOpen] = React.useState(false);
  const [draftGoals, setDraftGoals] = React.useState({ target_calories: 300, target_exercise_minutes: 30, target_mindful_minutes: 15, target_water_glasses: 8 });
  const [isSavingGoals, setIsSavingGoals] = React.useState(false);

  // Morning Supplement Safety Checklist
  const [tookSupplementWithFood, setTookSupplementWithFood] = React.useState(false);
  const [eveningMagnesiumEnabled, setEveningMagnesiumEnabled] = React.useState(true);
  const [supplementToast, setSupplementToast] = React.useState<string | null>(null);

  // Symptom Protocol State
  const [activeSymptom, setActiveSymptom] = React.useState<SymptomProtocol | null>(null);

  // Exercise Detail / Tutorial Modal State
  const [tutorialExercise, setTutorialExercise] = React.useState<ExerciseDetail | null>(null);
  const [tutorialAngle, setTutorialAngle] = React.useState<"front" | "side">("front");
  const [isPlayingTutorial, setIsPlayingTutorial] = React.useState(true);
  const [tutorialTimer, setTutorialTimer] = React.useState(0);

  // Workout Session State
  const [selectedWorkout, setSelectedWorkout] = React.useState<WorkoutItem | null>(null);
  const [workoutCategoryFilter, setWorkoutCategoryFilter] = React.useState<string>("All");
  const [isWorkoutActive, setIsWorkoutActive] = React.useState(false);
  const [completedExerciseIndexes, setCompletedExerciseIndexes] = React.useState<Set<number>>(new Set());

  const [isFemale, setIsFemale] = React.useState<boolean>(true);
  const [isPartnerView, setIsPartnerView] = React.useState<boolean>(false);
  const [targetName, setTargetName] = React.useState<string>("");

  // Load Cycle Information
  React.useEffect(() => {
    async function loadCycle() {
      try {
        setIsLoadingCycle(true);
        const res = await periodApi.getPeriods();
        if (typeof res?.is_female === "boolean") {
          setIsFemale(res.is_female);
        }
        setIsPartnerView(Boolean(res?.is_partner_view));
        setTargetName(res?.target_name || "");
        const summary = res?.active_summary;
        let day: number | null = summary?.cycle_day ?? summary?.current_cycle_day ?? null;

        // If backend summary didn't calculate day, calculate using UTC difference from latest period
        if (!day && res?.periods && res.periods.length > 0) {
          const latest = res.periods[0];
          if (latest?.start_date) {
            const [y, m, d] = latest.start_date.split("-").map(Number);
            const startMs = Date.UTC(y, m - 1, d);
            const now = new Date();
            const nowMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
            const diffDays = Math.round((nowMs - startMs) / 86400000) + 1;
            if (diffDays >= 1) {
              day = ((diffDays - 1) % 28) + 1;
            }
          }
        }

        setCycleDay(day || 1);
        setCycleData(summary || null);
      } catch (err) {
        console.error("Failed to load cycle data:", err);
      } finally {
        setIsLoadingCycle(false);
      }
    }
    loadCycle();
  }, []);

  // Load Fitness Goals & Today's Log from API
  React.useEffect(() => {
    async function loadFitness() {
      try {
        const res = await fitnessApi.getData();
        if (res.goals) {
          setTargetCalories(res.goals.target_calories);
          setTargetExercise(res.goals.target_exercise_minutes);
          setTargetMindful(res.goals.target_mindful_minutes);
          setTargetWaterGlasses(res.goals.target_water_glasses);
          setDraftGoals({
            target_calories: res.goals.target_calories,
            target_exercise_minutes: res.goals.target_exercise_minutes,
            target_mindful_minutes: res.goals.target_mindful_minutes,
            target_water_glasses: res.goals.target_water_glasses,
          });
        }
        if (res.log) {
          setActiveCalories(res.log.active_calories);
          setExerciseMinutes(res.log.exercise_minutes);
          setMindfulMinutes(res.log.mindful_minutes);
          setWaterGlasses(res.log.water_glasses);
        }
      } catch (err) {
        console.error("Failed to load fitness data:", err);
      }
    }
    loadFitness();
  }, []);

  // Load supplement checklist from localStorage
  React.useEffect(() => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const savedTook = localStorage.getItem(`uhc_supp_taken_${todayKey}`);
      if (savedTook !== null) {
        setTookSupplementWithFood(savedTook === "true");
      }
      const savedMag = localStorage.getItem("uhc_magnesium_enabled");
      if (savedMag !== null) {
        setEveningMagnesiumEnabled(savedMag === "true");
      }
    } catch {}
  }, []);

  const handleToggleTookWithFood = () => {
    const next = !tookSupplementWithFood;
    setTookSupplementWithFood(next);
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`uhc_supp_taken_${todayKey}`, String(next));
    } catch {}
    if (next) {
      setSupplementToast("Logged! Morning stomach protected with breakfast 🍳");
      setTimeout(() => setSupplementToast(null), 3500);
    }
  };

  const handleToggleMagnesium = () => {
    const next = !eveningMagnesiumEnabled;
    setEveningMagnesiumEnabled(next);
    try {
      localStorage.setItem("uhc_magnesium_enabled", String(next));
    } catch {}
    setSupplementToast(
      next
        ? "Evening Magnesium reminder active for 8:00 PM 🌙"
        : "Evening Magnesium reminder disabled"
    );
    setTimeout(() => setSupplementToast(null), 3500);
  };

  // Compute Hormonal Phase
  const currentPhase: CyclePhase = React.useMemo(() => {
    if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
    if (cycleDay >= 6 && cycleDay <= 13) return "follicular";
    if (cycleDay >= 14 && cycleDay <= 17) return "ovulation";
    return "luteal";
  }, [cycleDay]);

  // Dynamic Daily Energy Readiness based on precise cycleDay progression
  const dailyReadiness = React.useMemo(() => {
    let score = 80;
    let title = "Rising Vitality & Progressive Tone";
    let phaseTitle = "Follicular Phase";
    let advice = "Your energy and hormonal rhythm are in balance.";
    let color = "text-violet-500";
    let badgeBg = "bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400";
    let recommendedWorkoutId = "w-follicular-sculpt";

    if (cycleDay >= 1 && cycleDay <= 5) {
      phaseTitle = "Menstrual Phase";
      color = "text-rose-500";
      badgeBg = "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400";
      recommendedWorkoutId = "w-restorative-flow";
      if (cycleDay === 1) {
        score = 52;
        title = "Restorative Pacing & Baseline Rest";
        advice = "Estrogen & progesterone are at baseline. Prioritize warm hydration, low-impact mobility, and restorative decompression.";
      } else if (cycleDay === 2) {
        score = 55;
        title = "Gentle Decompression & Pelvic Relief";
        advice = "Peak flow relief. Keep workouts very gentle: restorative stretching, magnesium, and restorative breathing.";
      } else if (cycleDay === 3) {
        score = 58;
        title = "Flow Easing & Gentle Walking";
        advice = "Cramping naturally tapers. Low-stress 15-minute gentle walks and gentle spinal twists enhance circulation.";
      } else if (cycleDay === 4) {
        score = 63;
        title = "Light Re-awakening & Mobility";
        advice = "Energy begins gentle upward trend. Joint mobility, gentle core activation, and mineral hydration.";
      } else {
        score = 68;
        title = "Menstrual Tail & Fresh Vitality";
        advice = "Bleeding ends. Clean renewal of energy and cellular stamina preparing for the follicular rise.";
      }
    } else if (cycleDay >= 6 && cycleDay <= 13) {
      phaseTitle = "Follicular Phase";
      color = "text-violet-500";
      badgeBg = "bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400";
      recommendedWorkoutId = "w-follicular-sculpt";
      if (cycleDay <= 8) {
        score = 75 + (cycleDay - 6) * 4;
        title = "Rising Vitality & Progressive Tone";
        advice = "Rising estrogen enhances insulin sensitivity and stamina. Ideal for progressive strength and sculpting.";
      } else if (cycleDay <= 11) {
        score = 85 + (cycleDay - 9) * 3;
        title = "High Energy & Dynamic Resistance";
        advice = "Strong cellular resilience and mental clarity. Push resistance training, glute sculpting, and brisk power cardio.";
      } else {
        score = 93 + (cycleDay - 12) * 2;
        title = "Pre-Ovulation Energy Surge";
        advice = "Estrogen reaches near peak levels. High muscle recruitment, fast recovery, and superior coordination.";
      }
    } else if (cycleDay >= 14 && cycleDay <= 17) {
      phaseTitle = "Ovulatory Phase";
      color = "text-emerald-500";
      badgeBg = "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
      recommendedWorkoutId = "w-follicular-sculpt";
      if (cycleDay === 14) {
        score = 98;
        title = "Peak Ovulatory Power & Stamina";
        advice = "Peak metabolic efficiency and highest pain tolerance of the month. Great for power intervals and peak personal bests.";
      } else if (cycleDay === 15) {
        score = 95;
        title = "Sustained Peak Vitality";
        advice = "High muscular coordination and strength. Keep heart rate elevated and maintain consistent electrolytes.";
      } else if (cycleDay === 16) {
        score = 90;
        title = "Active Ovulation Transition";
        advice = "Ovulation completes. Transition into controlled strength, core stability, and antioxidant-rich meals.";
      } else {
        score = 86;
        title = "Post-Ovulation Pacing";
        advice = "Early progesterone begins rising. Focus on steady resistance and pelvic floor endurance.";
      }
    } else {
      phaseTitle = "Luteal Phase";
      color = "text-indigo-500";
      badgeBg = "bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400";
      recommendedWorkoutId = "w-luteal-pilates";
      if (cycleDay <= 21) {
        score = 80 - (cycleDay - 18) * 3;
        title = "Early Luteal Tone & Steady Pacing";
        advice = "Progesterone is climbing. Choose steady resistance, controlled pilates, and avoid over-exhaustion.";
      } else if (cycleDay <= 24) {
        score = 70 - (cycleDay - 22) * 3;
        title = "Mid-Luteal Core & Gentle Recovery";
        advice = "Body temperature is higher. Slower cadence, pelvic stabilization, and magnesium-rich evening recovery.";
      } else {
        score = 62 - (cycleDay - 25) * 2;
        title = "Pre-Menstrual Calm & Deep Stretch";
        advice = "Hormones preparing for next cycle. Gentle yin yoga, lower back decompression, and restorative pacing.";
      }
    }

    return {
      score,
      title,
      phaseTitle,
      advice,
      color,
      badgeBg,
      recommendedWorkoutId,
    };
  }, [cycleDay]);

  // Filtered Workout List
  const filteredWorkouts = React.useMemo(() => {
    if (workoutCategoryFilter === "All") return WORKOUT_DATABASE;
    return WORKOUT_DATABASE.filter((w) => w.category === workoutCategoryFilter);
  }, [workoutCategoryFilter]);

  // Persist log to API (debounced helper)
  const persistLog = React.useCallback(async (patch: Record<string, number>) => {
    try {
      await fitnessApi.updateLog(patch);
    } catch (err) {
      console.error("Failed to persist fitness log:", err);
    }
  }, []);

  const [goalsSavedToast, setGoalsSavedToast] = React.useState<string | null>(null);

  // Water Increment & Decrement — persisted
  const handleAddWater = () => {
    setWaterGlasses((prev) => {
      const next = Math.min(prev + 1, 50);
      persistLog({ water_glasses: next });
      return next;
    });
  };

  const handleRemoveWater = () => {
    setWaterGlasses((prev) => {
      const next = Math.max(0, prev - 1);
      persistLog({ water_glasses: next });
      return next;
    });
  };

  // Direct Interactive Quick-Add for Calories, Exercise & Mindfulness
  const handleAdjustCalories = (delta: number) => {
    setActiveCalories((prev) => {
      const next = Math.max(0, prev + delta);
      persistLog({ active_calories: next });
      return next;
    });
  };

  const handleAdjustExercise = (deltaMinutes: number) => {
    setExerciseMinutes((prev) => {
      const next = Math.max(0, prev + deltaMinutes);
      persistLog({ exercise_minutes: next });
      return next;
    });
  };

  const handleAdjustMindful = (deltaMinutes: number) => {
    setMindfulMinutes((prev) => {
      const next = Math.max(0, prev + deltaMinutes);
      persistLog({ mindful_minutes: next });
      return next;
    });
  };

  // Quick Preset Selector for Goal Setting
  const handleApplyPreset = (preset: "starter" | "balanced" | "athlete") => {
    if (preset === "starter") {
      setDraftGoals({
        target_calories: 300,
        target_exercise_minutes: 20,
        target_mindful_minutes: 10,
        target_water_glasses: 6,
      });
    } else if (preset === "balanced") {
      setDraftGoals({
        target_calories: 500,
        target_exercise_minutes: 30,
        target_mindful_minutes: 15,
        target_water_glasses: 8,
      });
    } else {
      setDraftGoals({
        target_calories: 750,
        target_exercise_minutes: 45,
        target_mindful_minutes: 25,
        target_water_glasses: 10,
      });
    }
  };

  // Toggle Exercise Completion
  const handleToggleExercise = (idx: number) => {
    setCompletedExerciseIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Complete Workout Session — persisted
  const handleFinishWorkout = () => {
    if (selectedWorkout) {
      const newCal = activeCalories + selectedWorkout.calories;
      const newMin = exerciseMinutes + selectedWorkout.durationMinutes;
      setActiveCalories(newCal);
      setExerciseMinutes(newMin);
      persistLog({ active_calories: newCal, exercise_minutes: newMin });
    }
    setIsWorkoutActive(false);
    setSelectedWorkout(null);
    setCompletedExerciseIndexes(new Set());
  };

  // Save Goals from Modal with Confirmation
  const handleSaveGoals = async () => {
    setIsSavingGoals(true);
    try {
      const res = await fitnessApi.updateGoals(draftGoals);
      if (res.goals) {
        setTargetCalories(res.goals.target_calories);
        setTargetExercise(res.goals.target_exercise_minutes);
        setTargetMindful(res.goals.target_mindful_minutes);
        setTargetWaterGlasses(res.goals.target_water_glasses);
      }
      setIsGoalsModalOpen(false);
      setGoalsSavedToast("Targets confirmed & locked in! 🎯");
      setTimeout(() => setGoalsSavedToast(null), 4000);
    } catch (err) {
      console.error("Failed to save fitness goals:", err);
    } finally {
      setIsSavingGoals(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 pb-16 pt-2">
        {/* ==================================================================== */}
        {/* POLISHED HERO HEADER & ENERGY READINESS BAR */}
        {/* ==================================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xs transition-colors">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                {isPartnerView ? `Supporting ${targetName || "Partner"}'s Wellness & Activity` : "Adaptive Movement, Vitality & Recovery"}
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {isPartnerView ? `Movement, Wellness & Care for ${targetName || "Partner"} 🌸` : "Daily Movement, Energy & Vitality Care 🌸"}
              </h1>

              <p className="max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {isPartnerView
                  ? `Keep track of ${targetName || "her"} hormonal phase, energy levels, hydration, and instant recovery protocols so you can support her effortlessly.`
                  : "Personalized daily movement, energy pacing, hydration, and soothing relief tailored to your daily rhythm."}
              </p>
            </div>

            {/* Daily Energy & Readiness Dial Card */}
            {(isFemale || isPartnerView) && (
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 shadow-sm">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-500 text-white shadow-md shadow-violet-500/20">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-xl font-black">{dailyReadiness.score}%</span>
                    <span className="text-[9px] uppercase font-bold opacity-90 tracking-wider">Readiness</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", dailyReadiness.badgeBg)}>
                      {dailyReadiness.phaseTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Day {cycleDay} of 28
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{dailyReadiness.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{dailyReadiness.advice}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* POLISHED ACTIVITY RINGS & HYDRATION TILES (INTERACTIVE LOGGING) */}
        {/* ==================================================================== */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tile 1: Movement Calories */}
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-xs transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Active Calories Burned
                  </span>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Daily Energy Output</p>
                </div>
                <div className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-[var(--text-primary)]">{activeCalories}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]"> / {targetCalories} kcal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeCalories >= targetCalories && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" /> Met!
                    </span>
                  )}
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {Math.round((activeCalories / targetCalories) * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (activeCalories / targetCalories) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Action Steppers */}
            <div className="mt-4 flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--glass-border)]/60">
              <button
                type="button"
                onClick={() => handleAdjustCalories(-50)}
                disabled={activeCalories <= 0}
                className="flex items-center justify-center h-7 w-7 rounded-lg border border-[var(--glass-border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-all active:scale-95"
                title="Subtract 50 kcal"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCalories(50)}
                className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-all active:scale-95"
                title="Quick add 50 kcal"
              >
                <Plus className="h-3 w-3" /> 50
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCalories(100)}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-rose-500 transition-all active:scale-95"
                title="Quick add 100 kcal"
              >
                <Plus className="h-3 w-3" /> 100
              </button>
            </div>
          </div>

          {/* Tile 2: Exercise Minutes */}
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-xs transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Workout & Exercise Time
                  </span>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Daily Fitness Duration</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-[var(--text-primary)]">{exerciseMinutes}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]"> / {targetExercise} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {exerciseMinutes >= targetExercise && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" /> Met!
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((exerciseMinutes / targetExercise) * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (exerciseMinutes / targetExercise) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Action Steppers */}
            <div className="mt-4 flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--glass-border)]/60">
              <button
                type="button"
                onClick={() => handleAdjustExercise(-10)}
                disabled={exerciseMinutes <= 0}
                className="flex items-center justify-center h-7 w-7 rounded-lg border border-[var(--glass-border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-all active:scale-95"
                title="Subtract 10 mins"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustExercise(10)}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all active:scale-95"
                title="Quick add 10 mins"
              >
                <Plus className="h-3 w-3" /> 10m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustExercise(20)}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all active:scale-95"
                title="Quick add 20 mins"
              >
                <Plus className="h-3 w-3" /> 20m
              </button>
            </div>
          </div>

          {/* Tile 3: Mindfulness & Stretches */}
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-xs transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Mindful Breathing & Stretching
                  </span>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Restorative Relaxation</p>
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-500">
                  <Heart className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-[var(--text-primary)]">{mindfulMinutes}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]"> / {targetMindful} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {mindfulMinutes >= targetMindful && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                      <Check className="h-3 w-3" /> Met!
                    </span>
                  )}
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    {Math.round((mindfulMinutes / targetMindful) * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (mindfulMinutes / targetMindful) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Action Steppers */}
            <div className="mt-4 flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--glass-border)]/60">
              <button
                type="button"
                onClick={() => handleAdjustMindful(-5)}
                disabled={mindfulMinutes <= 0}
                className="flex items-center justify-center h-7 w-7 rounded-lg border border-[var(--glass-border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-all active:scale-95"
                title="Subtract 5 mins"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMindful(5)}
                className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all active:scale-95"
                title="Quick add 5 mins"
              >
                <Plus className="h-3 w-3" /> 5m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMindful(10)}
                className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-cyan-500 transition-all active:scale-95"
                title="Quick add 10 mins"
              >
                <Plus className="h-3 w-3" /> 10m
              </button>
            </div>
          </div>

          {/* Tile 4: Water Hydration Tracker */}
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-xs transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Daily Water Intake
                  </span>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Hydration & Electrolytes</p>
                </div>
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
                  <Droplets className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-[var(--text-primary)]">{waterGlasses * 250}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]"> / {targetWaterGlasses * 250} ml</span>
                </div>
                {waterGlasses >= targetWaterGlasses && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <Check className="h-3 w-3" /> Met!
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: targetWaterGlasses }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 flex-1 rounded-full transition-all duration-300",
                      i < waterGlasses
                        ? "bg-blue-500 dark:bg-blue-400 shadow-xs shadow-blue-500/40"
                        : "bg-slate-200/80 dark:bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Quick Action Steppers */}
            <div className="mt-4 flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--glass-border)]/60">
              <button
                type="button"
                onClick={handleRemoveWater}
                disabled={waterGlasses <= 0}
                className="flex items-center justify-center h-7 w-7 rounded-lg border border-[var(--glass-border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-all active:scale-95"
                title="Subtract 1 glass (250ml)"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleAddWater}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition-all active:scale-95"
                title="Quick add 250ml"
              >
                <Plus className="h-3.5 w-3.5" /> +250ml
              </button>
            </div>
          </div>
        </div>

        {/* Customize Goals Button & Confirmation Toast */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Targets are personalized to your goals. Adjust anytime.
            </p>
            {goalsSavedToast && (
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {goalsSavedToast}
              </motion.span>
            )}
          </div>
          <button
            onClick={() => {
              setDraftGoals({
                target_calories: targetCalories,
                target_exercise_minutes: targetExercise,
                target_mindful_minutes: targetMindful,
                target_water_glasses: targetWaterGlasses,
              });
              setIsGoalsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 transition-all active:scale-95 shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
            Customize My Goals
          </button>
        </div>

        {/* ==================================================================== */}
        {/* POLISHED MORNING MINERAL SUPPLEMENT SAFETY ALERT */}
        {/* ==================================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 dark:from-[#0f172a] dark:via-[#1e1b2e] dark:to-[#17132a] p-6 sm:p-7 shadow-xl backdrop-blur-xl transition-all">
          {/* Ambient Lighting Accents */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 dark:bg-amber-400/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-violet-500/10 dark:bg-violet-500/[0.08] blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-inner">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Morning Supplement Protocol
                  </span>
                  <span className="text-xs font-semibold text-amber-700/80 dark:text-amber-400/80">
                    Headache & Nausea Prevention
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Take Morning Minerals With Food — Never on an Empty Stomach 🍳
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Taking minerals (such as Zinc, Iron, or Vitamin C) first thing in the morning without food irritates the gastric lining, causing stomach distress and rebound morning tension headaches.
                  <strong className="font-semibold text-amber-800 dark:text-amber-300"> Recommendation:</strong> Take morning minerals with eggs, toast, or avocado. Shift <strong className="font-semibold text-violet-600 dark:text-violet-400">Magnesium Glycinate to 8:00 PM</strong> to naturally relax muscles, relieve tension headaches, and deepen sleep!
                </p>

                {supplementToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{supplementToast}</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleToggleTookWithFood}
                className={cn(
                  "w-full sm:w-[220px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border shadow-xs select-none",
                  tookSupplementWithFood
                    ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/50 shadow-emerald-500/10"
                    : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30 dark:border-amber-500/40"
                )}
              >
                {tookSupplementWithFood ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Plus className="h-4 w-4 shrink-0" />}
                <span className="truncate">{tookSupplementWithFood ? "Logged: With Food" : "Log: Taken With Food"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMagnesium}
                className={cn(
                  "w-full sm:w-[230px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border shadow-xs select-none",
                  eveningMagnesiumEnabled
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500/40 shadow-md shadow-violet-500/20 hover:opacity-95"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                )}
              >
                <Moon className="h-4 w-4 shrink-0" />
                <span className="truncate">{eveningMagnesiumEnabled ? "Evening Magnesium (8 PM)" : "Enable Evening Magnesium"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* POLISHED REAL-TIME SYMPTOM TACTICAL RELIEF PROTOCOLS */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Instant Symptom Relief Protocols 💡
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isPartnerView
                  ? `Tap whatever ${targetName || "she"} is experiencing right now for rapid 3-minute guided recovery steps.`
                  : "Tap whatever you are experiencing right now for rapid 3-minute guided recovery steps."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SYMPTOM_PROTOCOLS.map((proto) => {
              const isSelected = activeSymptom?.id === proto.id;
              return (
                <button
                  key={proto.id}
                  onClick={() => setActiveSymptom(isSelected ? null : proto)}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 bg-[var(--bg-card)] shadow-xs",
                    isSelected
                      ? "border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/50 dark:bg-violet-500/10 shadow-md"
                      : "border-[var(--glass-border)] hover:border-violet-400/50 hover:bg-[var(--bg-hover)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{proto.icon}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", proto.bgClass, proto.colorClass, proto.borderClass)}>
                      Instant Protocol
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{proto.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{proto.quickNote}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400">
                    {isSelected ? "Close Protocol" : "View Relief Steps"} <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded Symptom Drawer */}
          <AnimatePresence mode="wait">
            {activeSymptom && (
              <motion.div
                key={activeSymptom.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border-2 border-violet-500/40 bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl transition-colors"
              >
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeSymptom.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {activeSymptom.name} — Step-by-Step Relief Plan
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">{activeSymptom.quickNote}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSymptom(null)}
                    className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {activeSymptom.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{step.icon}</span>
                        <span className="rounded-full bg-violet-500/10 dark:bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                          Step {idx + 1} • {step.durationMinutes}m
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{step.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================================================================== */}
        {/* WORKOUTS COLLECTION & INTERACTIVE EXERCISE TUTORIALS */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                Cycle-Adapted Movement Library
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Tap any exercise to view front and side video tutorial angles, proper form, and hormonal benefits.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-1.5 shadow-xs">
              {["All", "Cycle Sync", "Strength", "Yoga & Relief", "Pilates", "Quick 10-Min"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setWorkoutCategoryFilter(cat)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                    workoutCategoryFilter === cat
                      ? "bg-violet-600 text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Workouts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-xs transition-all hover:border-violet-500/40 hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{workout.icon}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                        {workout.category}
                      </span>
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300 capitalize">
                        {workout.phase === "all" ? "All Phases" : `${workout.phase} Phase`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {workout.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {workout.description}
                    </p>
                  </div>

                  {/* Muscle Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {workout.targetMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>

                  {/* Exercise Mini Previews (Tap to open tutorial!) */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Included Exercises (Tap for angles & tutorial):
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {workout.exercises.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => {
                            setTutorialExercise(ex);
                            setTutorialAngle("front");
                            setTutorialTimer(ex.durationSec);
                            setIsPlayingTutorial(true);
                          }}
                          className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-2 text-left hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors group/item"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <Video className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[var(--text-primary)] group-hover/item:text-violet-600 dark:group-hover/item:text-violet-400">
                              {ex.name}
                            </p>
                            <span className="text-[10px] text-[var(--text-secondary)]">
                              {ex.reps || `${ex.durationSec}s`} • See Form
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workout Card Footer */}
                <div className="mt-6 border-t border-[var(--glass-border)] pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      {workout.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-rose-500" />
                      {workout.calories} kcal
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedWorkout(workout);
                      setIsWorkoutActive(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-violet-600/30 hover:bg-violet-500 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Start Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* DEDICATED EXERCISE POSTURE VIDEO & BIOMECHANICS MODAL */}
        {/* ==================================================================== */}
        {tutorialExercise && (
          <ExerciseVideoModal
            exerciseId={tutorialExercise.id}
            onClose={() => setTutorialExercise(null)}
          />
        )}

        {/* ==================================================================== */}
        {/* INTERACTIVE WORKOUT SESSION PLAYER */}
        {/* ==================================================================== */}
        <AnimatePresence>
          {isWorkoutActive && selectedWorkout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedWorkout.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedWorkout.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {selectedWorkout.durationMinutes} mins • {selectedWorkout.calories} kcal • {selectedWorkout.equipment}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsWorkoutActive(false)}
                    className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                    <span>Exercise Progress</span>
                    <span>
                      {completedExerciseIndexes.size} of {selectedWorkout.exercises.length} Completed
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-rose-500 transition-all duration-300"
                      style={{
                        width: `${(completedExerciseIndexes.size / selectedWorkout.exercises.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Exercise Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Session Exercises (Tap circle when finished)
                  </h4>
                  {selectedWorkout.exercises.map((ex, idx) => {
                    const isDone = completedExerciseIndexes.has(idx);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 transition-all",
                          isDone
                            ? "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-500/10"
                            : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-violet-500/40"
                        )}
                      >
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => handleToggleExercise(idx)}
                        >
                          <div
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                              isDone
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <span className="text-xs">{idx + 1}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{ex.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{ex.targetMuscles.join(", ")}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setTutorialExercise(ex);
                              setTutorialAngle("front");
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-500/10"
                          >
                            <Eye className="h-3 w-3" /> Form
                          </button>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-300">
                              {ex.durationSec}s
                            </span>
                            {ex.reps && <p className="text-[10px] text-[var(--text-secondary)]">{ex.reps}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
                  <button
                    onClick={() => setIsWorkoutActive(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinishWorkout}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/30 hover:opacity-90 transition-opacity"
                  >
                    <Award className="h-4 w-4" />
                    Complete & Log Session
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================================================================== */}
        {/* FITNESS GOALS CUSTOMIZATION MODAL */}
        {/* ==================================================================== */}
        <AnimatePresence>
          {isGoalsModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsGoalsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
                  <div>
                    <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Goal Set, Check & Confirm 🎯</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Customize and lock in your 4 daily wellness targets</p>
                  </div>
                  <button
                    onClick={() => setIsGoalsModalOpen(false)}
                    className="rounded-full p-2 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-[var(--text-secondary)]" />
                  </button>
                </div>

                {/* Quick Presets Selection */}
                <div className="mt-4 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Quick Preset Targets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("starter")}
                      className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2.5 py-2 text-left hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs"
                    >
                      <span className="block font-bold text-emerald-600 dark:text-emerald-400">🌱 Starter</span>
                      <span className="block text-[10px] text-[var(--text-tertiary)]">300kcal • 20m</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("balanced")}
                      className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2.5 py-2 text-left hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-xs"
                    >
                      <span className="block font-bold text-violet-600 dark:text-violet-400">⚡ Balanced</span>
                      <span className="block text-[10px] text-[var(--text-tertiary)]">500kcal • 30m</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("athlete")}
                      className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2.5 py-2 text-left hover:border-rose-500/50 hover:bg-rose-500/5 transition-all text-xs"
                    >
                      <span className="block font-bold text-rose-600 dark:text-rose-400">🔥 High Energy</span>
                      <span className="block text-[10px] text-[var(--text-tertiary)]">750kcal • 45m</span>
                    </button>
                  </div>
                </div>

                {/* The 4 Customize Options with Interactive Stepper, Check & Confirm */}
                <div className="mt-5 space-y-4">
                  {/* Option 1: Calories Goal */}
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <Flame className="h-4 w-4" />
                        <span>1. Active Calories Target</span>
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <Check className="h-3 w-3" /> {draftGoals.target_calories} kcal
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_calories: Math.max(50, p.target_calories - 50) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={50}
                        max={5000}
                        step={50}
                        value={draftGoals.target_calories}
                        onChange={(e) => setDraftGoals((p) => ({ ...p, target_calories: Number(e.target.value) }))}
                        className="flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-3 py-2 text-center text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_calories: Math.min(5000, p.target_calories + 50) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Exercise Minutes Goal */}
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Activity className="h-4 w-4" />
                        <span>2. Exercise Time Target</span>
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> {draftGoals.target_exercise_minutes} mins
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_exercise_minutes: Math.max(5, p.target_exercise_minutes - 5) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        step={5}
                        value={draftGoals.target_exercise_minutes}
                        onChange={(e) => setDraftGoals((p) => ({ ...p, target_exercise_minutes: Number(e.target.value) }))}
                        className="flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-3 py-2 text-center text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_exercise_minutes: Math.min(300, p.target_exercise_minutes + 5) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Option 3: Mindful Minutes Goal */}
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        <Heart className="h-4 w-4" />
                        <span>3. Mindful Breathing & Stretching</span>
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                        <Check className="h-3 w-3" /> {draftGoals.target_mindful_minutes} mins
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_mindful_minutes: Math.max(1, p.target_mindful_minutes - 5) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        step={5}
                        value={draftGoals.target_mindful_minutes}
                        onChange={(e) => setDraftGoals((p) => ({ ...p, target_mindful_minutes: Number(e.target.value) }))}
                        className="flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-3 py-2 text-center text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_mindful_minutes: Math.min(120, p.target_mindful_minutes + 5) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Option 4: Water Goal */}
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Droplets className="h-4 w-4" />
                        <span>4. Daily Water Intake Target</span>
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        <Check className="h-3 w-3" /> {draftGoals.target_water_glasses} glasses ({draftGoals.target_water_glasses * 250}ml)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_water_glasses: Math.max(1, p.target_water_glasses - 1) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        step={1}
                        value={draftGoals.target_water_glasses}
                        onChange={(e) => setDraftGoals((p) => ({ ...p, target_water_glasses: Number(e.target.value) }))}
                        className="flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] px-3 py-2 text-center text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setDraftGoals((p) => ({ ...p, target_water_glasses: Math.min(30, p.target_water_glasses + 1) }))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Check & Confirm Action Footer */}
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[var(--glass-border)]">
                  <button
                    onClick={() => setIsGoalsModalOpen(false)}
                    className="flex-1 rounded-xl border border-[var(--glass-border)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGoals}
                    disabled={isSavingGoals}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:opacity-95 transition-all disabled:opacity-50 active:scale-[0.99]"
                  >
                    {isSavingGoals ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {isSavingGoals ? "Locking In..." : "Check & Confirm 4 Goals"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
