export interface RoutineTemplate {
  id: string;
  title: string;
  category:
    | "morning"
    | "health"
    | "fitness"
    | "study"
    | "work"
    | "deen"
    | "relationship"
    | "evening"
    | "sleep"
    | "home";
  icon: string;
  suggestedTime?: string;
  recurrence: "daily" | "weekdays" | "weekends";
  description?: string;
}

export interface RoutineCategoryInfo {
  key: RoutineTemplate["category"];
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const ROUTINE_CATEGORIES: RoutineCategoryInfo[] = [
  {
    key: "morning",
    label: "Morning",
    icon: "🌅",
    color: "from-amber-500/20 to-orange-500/20 text-amber-900 border-amber-200",
    description: "Start the day intentional and energised",
  },
  {
    key: "deen",
    label: "Deen & Spiritual",
    icon: "🕌",
    color: "from-teal-500/20 to-emerald-500/20 text-teal-900 border-teal-200",
    description: "Daily prayers, Quran, adhkar, and reflection",
  },
  {
    key: "health",
    label: "Health & Wellness",
    icon: "💧",
    color: "from-emerald-500/20 to-green-500/20 text-emerald-900 border-emerald-200",
    description: "Hydration, nutrition, and daily vitality",
  },
  {
    key: "fitness",
    label: "Fitness",
    icon: "💪",
    color: "from-orange-500/20 to-red-500/20 text-orange-900 border-orange-200",
    description: "Workouts, movement, and physical stamina",
  },
  {
    key: "study",
    label: "Study & Learning",
    icon: "📚",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-900 border-blue-200",
    description: "Focused study blocks, reading, and revision",
  },
  {
    key: "work",
    label: "Work & Focus",
    icon: "💼",
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-900 border-indigo-200",
    description: "High-priority tasks and deep work sessions",
  },
  {
    key: "relationship",
    label: "Relationship & Couple",
    icon: "💖",
    color: "from-rose-500/20 to-pink-500/20 text-rose-900 border-rose-200",
    description: "Meaningful check-ins, appreciation, and shared moments",
  },
  {
    key: "evening",
    label: "Evening & Wind Down",
    icon: "🌙",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-900 border-purple-200",
    description: "Unwind, review the day, and prepare for tomorrow",
  },
  {
    key: "sleep",
    label: "Sleep & Recovery",
    icon: "😴",
    color: "from-slate-500/20 to-slate-600/20 text-slate-800 border-slate-200",
    description: "Consistent sleep schedule and restorative rest",
  },
];

export const SUGGESTED_ROUTINES: RoutineTemplate[] = [
  // Morning
  {
    id: "m1",
    title: "Wake up by 6:30 AM",
    category: "morning",
    icon: "⏰",
    suggestedTime: "06:30",
    recurrence: "daily",
  },
  {
    id: "m2",
    title: "Drink a large glass of water",
    category: "morning",
    icon: "💧",
    suggestedTime: "06:35",
    recurrence: "daily",
  },
  {
    id: "m3",
    title: "Make bed & tidy space",
    category: "morning",
    icon: "🛏️",
    suggestedTime: "06:45",
    recurrence: "daily",
  },
  {
    id: "m4",
    title: "Morning skincare & wash face",
    category: "morning",
    icon: "✨",
    suggestedTime: "07:00",
    recurrence: "daily",
  },
  {
    id: "m5",
    title: "Nutritious breakfast & vitamins",
    category: "morning",
    icon: "🍳",
    suggestedTime: "07:30",
    recurrence: "daily",
  },
  {
    id: "m6",
    title: "Review daily schedule & goals",
    category: "morning",
    icon: "📋",
    suggestedTime: "08:00",
    recurrence: "weekdays",
  },
  {
    id: "m7",
    title: "15 min morning stretch or walk",
    category: "morning",
    icon: "🚶",
    suggestedTime: "07:15",
    recurrence: "daily",
  },

  // Deen
  {
    id: "d1",
    title: "Fajr Prayer",
    category: "deen",
    icon: "🕌",
    suggestedTime: "05:15",
    recurrence: "daily",
  },
  {
    id: "d2",
    title: "Morning Adhkar",
    category: "deen",
    icon: "📿",
    suggestedTime: "06:00",
    recurrence: "daily",
  },
  {
    id: "d3",
    title: "Dhuhr Prayer",
    category: "deen",
    icon: "🕌",
    suggestedTime: "12:45",
    recurrence: "daily",
  },
  {
    id: "d4",
    title: "Asr Prayer",
    category: "deen",
    icon: "🕌",
    suggestedTime: "16:15",
    recurrence: "daily",
  },
  {
    id: "d5",
    title: "Maghrib Prayer",
    category: "deen",
    icon: "🕌",
    suggestedTime: "18:45",
    recurrence: "daily",
  },
  {
    id: "d6",
    title: "Isha Prayer",
    category: "deen",
    icon: "🕌",
    suggestedTime: "20:15",
    recurrence: "daily",
  },
  {
    id: "d7",
    title: "Read Quran (1-2 pages)",
    category: "deen",
    icon: "📖",
    suggestedTime: "06:15",
    recurrence: "daily",
  },
  {
    id: "d8",
    title: "Evening Adhkar",
    category: "deen",
    icon: "📿",
    suggestedTime: "17:30",
    recurrence: "daily",
  },

  // Health
  {
    id: "h1",
    title: "Drink at least 2L of water",
    category: "health",
    icon: "💧",
    recurrence: "daily",
  },
  {
    id: "h2",
    title: "Take daily vitamins / medication",
    category: "health",
    icon: "💊",
    suggestedTime: "08:30",
    recurrence: "daily",
  },
  {
    id: "h3",
    title: "Eat fruit or fresh vegetables",
    category: "health",
    icon: "🥗",
    recurrence: "daily",
  },
  {
    id: "h4",
    title: "Avoid sugary drinks today",
    category: "health",
    icon: "🚫",
    recurrence: "daily",
  },

  // Fitness
  {
    id: "f1",
    title: "Daily workout / gym session",
    category: "fitness",
    icon: "🏋️",
    suggestedTime: "17:00",
    recurrence: "weekdays",
  },
  {
    id: "f2",
    title: "Hit 8,000 to 10,000 steps",
    category: "fitness",
    icon: "👟",
    recurrence: "daily",
  },
  {
    id: "f3",
    title: "Post-workout mobility & stretching",
    category: "fitness",
    icon: "🧘",
    suggestedTime: "18:00",
    recurrence: "daily",
  },

  // Study
  {
    id: "s1",
    title: "2-hour focused study block",
    category: "study",
    icon: "📚",
    suggestedTime: "10:00",
    recurrence: "weekdays",
  },
  {
    id: "s2",
    title: "Review lecture notes & flashcards",
    category: "study",
    icon: "📝",
    suggestedTime: "14:00",
    recurrence: "weekdays",
  },
  {
    id: "s3",
    title: "Practice coding or problem solving",
    category: "study",
    icon: "💻",
    suggestedTime: "15:30",
    recurrence: "weekdays",
  },

  // Work
  {
    id: "w1",
    title: "Deep work session (no distractions)",
    category: "work",
    icon: "⚡",
    suggestedTime: "09:30",
    recurrence: "weekdays",
  },
  {
    id: "w2",
    title: "Clear inbox & priority messages",
    category: "work",
    icon: "✉️",
    suggestedTime: "16:30",
    recurrence: "weekdays",
  },
  {
    id: "w3",
    title: "Plan top 3 tasks for tomorrow",
    category: "work",
    icon: "📌",
    suggestedTime: "17:30",
    recurrence: "weekdays",
  },

  // Relationship
  {
    id: "r1",
    title: "Check in with partner & ask about their day",
    category: "relationship",
    icon: "💬",
    suggestedTime: "13:00",
    recurrence: "daily",
  },
  {
    id: "r2",
    title: "Send an appreciation note or love text",
    category: "relationship",
    icon: "💌",
    recurrence: "daily",
  },
  {
    id: "r3",
    title: "Spend 30 min quality time together",
    category: "relationship",
    icon: "☕",
    suggestedTime: "20:30",
    recurrence: "daily",
  },
  {
    id: "r4",
    title: "Make sincere dua for each other",
    category: "relationship",
    icon: "🤲",
    recurrence: "daily",
  },

  // Evening & Sleep
  {
    id: "e1",
    title: "Review today's routine progress",
    category: "evening",
    icon: "📊",
    suggestedTime: "21:30",
    recurrence: "daily",
  },
  {
    id: "e2",
    title: "Clean desk & prep tomorrow's clothes",
    category: "evening",
    icon: "👔",
    suggestedTime: "22:00",
    recurrence: "daily",
  },
  {
    id: "sl1",
    title: "Screens off 30 min before bed",
    category: "sleep",
    icon: "📵",
    suggestedTime: "22:30",
    recurrence: "daily",
  },
  {
    id: "sl2",
    title: "Sleep by 11:00 PM for 7-8 hours",
    category: "sleep",
    icon: "😴",
    suggestedTime: "23:00",
    recurrence: "daily",
  },
];
