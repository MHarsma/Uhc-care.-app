"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CYCLE_NUTRITION_DATA,
  PhaseNutritionDetail,
  MealIdea,
} from "@/lib/data/cycle-nutrition";
import {
  Utensils,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Leaf,
  ShieldCheck,
  AlertCircle,
  Clock,
  Heart,
  Droplet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleDietSectionProps {
  currentPhaseKey: "menstrual" | "follicular" | "ovulation" | "luteal";
  defaultOpen?: boolean;
}

export function CycleDietSection({
  currentPhaseKey,
  defaultOpen = false,
}: CycleDietSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [selectedPhase, setSelectedPhase] = React.useState<
    "menstrual" | "follicular" | "ovulation" | "luteal"
  >(currentPhaseKey);
  const [activeMealTab, setActiveMealTab] = React.useState<number>(0);

  // Sync with current phase
  React.useEffect(() => {
    setSelectedPhase(currentPhaseKey);
  }, [currentPhaseKey]);

  const nutritionData: PhaseNutritionDetail =
    CYCLE_NUTRITION_DATA[selectedPhase] || CYCLE_NUTRITION_DATA.menstrual;

  const phaseThemes: Record<
    string,
    {
      pillActive: string;
      accentBg: string;
      accentText: string;
      border: string;
      gradient: string;
    }
  > = {
    menstrual: {
      pillActive: "bg-rose-500 text-white shadow-sm shadow-rose-500/30",
      accentBg: "bg-rose-500/10",
      accentText: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/30",
      gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    },
    follicular: {
      pillActive: "bg-violet-600 text-white shadow-sm shadow-violet-600/30",
      accentBg: "bg-violet-500/10",
      accentText: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/30",
      gradient: "from-violet-500/10 via-indigo-500/5 to-transparent",
    },
    ovulation: {
      pillActive: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
      accentBg: "bg-amber-500/10",
      accentText: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    },
    luteal: {
      pillActive: "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30",
      accentBg: "bg-cyan-500/10",
      accentText: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/30",
      gradient: "from-cyan-500/10 via-teal-500/5 to-transparent",
    },
  };

  const theme = phaseThemes[selectedPhase];

  return (
    <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-sm glass-card overflow-hidden transition-all">
      {/* Dropdown Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-[var(--bg-hover)] transition-colors select-none cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                Cycle Nutrition & Meal Guide
              </h3>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border", theme.accentBg, theme.accentText, theme.border)}>
                {nutritionData.icon} {nutritionData.phaseName}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Exact foods to eat, meal ideas & hormonal nourishment for her current cycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-xs font-bold text-violet-600 dark:text-violet-400">
            {isOpen ? "Collapse Menu" : "View Meals & Foods"}
          </span>
          <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-secondary)]">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-[var(--glass-border)] p-4 sm:p-6 space-y-6 overflow-hidden"
          >
            {/* Phase Selector Pills (Allows viewing other phases while defaulting to current) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                {(["menstrual", "follicular", "ovulation", "luteal"] as const).map((pKey) => {
                  const pData = CYCLE_NUTRITION_DATA[pKey];
                  const isSelected = selectedPhase === pKey;
                  const isCurrent = currentPhaseKey === pKey;

                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        setSelectedPhase(pKey);
                        setActiveMealTab(0);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? phaseThemes[pKey].pillActive
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <span>{pData.icon}</span>
                      <span>{pData.phaseName.replace(" Phase", "")}</span>
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Synchronized with natural biology</span>
              </div>
            </div>

            {/* Targeted Phase Nutrition Overview Banner */}
            <div className={cn("rounded-2xl border p-4 sm:p-5 bg-gradient-to-r space-y-2", theme.border, theme.gradient)}>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  {nutritionData.subtitle}
                </h4>
                <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", theme.accentBg, theme.accentText)}>
                  Metabolism & Hormones
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {nutritionData.hormoneStatus} {nutritionData.metabolismNote}
              </p>
            </div>

            {/* 1. Exactly What to Eat Right Now (Food Categories) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                <span>Recommended Foods for this Phase</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {nutritionData.nourishingFoods.map((group) => (
                  <div
                    key={group.category}
                    className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3.5 space-y-2"
                  >
                    <p className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{group.category}</span>
                    </p>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                          <span className="text-[10px] text-emerald-500">✔</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Suggested Daily Meal Plate (Breakfast, Lunch, Dinner, Snack) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                  <Utensils className="h-3.5 w-3.5 text-violet-500" />
                  <span>Curated Daily Meal Plate</span>
                </h4>
                <div className="flex items-center gap-1">
                  {nutritionData.meals.map((meal, idx) => (
                    <button
                      key={meal.mealType}
                      type="button"
                      onClick={() => setActiveMealTab(idx)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        activeMealTab === idx
                          ? "bg-violet-600 text-white shadow-xs"
                          : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]"
                      )}
                    >
                      {meal.mealType.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {nutritionData.meals[activeMealTab] && (
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--glass-border)] pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        {nutritionData.meals[activeMealTab].mealType}
                      </span>
                      <h5 className="text-base font-extrabold text-[var(--text-primary)]">
                        {nutritionData.meals[activeMealTab].title}
                      </h5>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~{nutritionData.meals[activeMealTab].prepTimeMinutes} mins</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] font-bold text-[var(--text-secondary)]">
                        ~{nutritionData.meals[activeMealTab].caloriesApprox} kcal
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-[var(--text-secondary)] mb-1.5">Key Ingredients:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {nutritionData.meals[activeMealTab].ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] font-semibold text-[var(--text-primary)]"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-secondary)] mb-1">Hormonal Benefit:</p>
                      <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--glass-bg)] p-2.5 rounded-xl border border-[var(--glass-border)]">
                        {nutritionData.meals[activeMealTab].hormonalBenefit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Key Micronutrients & Foods to Limit */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
              {/* Essential Micronutrients */}
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-2.5">
                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Essential Micronutrients Needed Now:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {nutritionData.micronutrients.slice(0, 4).map((micro) => (
                    <div key={micro.nutrient} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] space-y-1">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{micro.nutrient}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{micro.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foods to Limit */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2.5">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span>Foods to Minimize This Phase:</span>
                </p>
                <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {nutritionData.foodsToLimit.map((limit) => (
                    <li key={limit.food} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <div>
                        <strong className="text-[var(--text-primary)]">{limit.food}:</strong>{" "}
                        <span className="text-[11px] text-[var(--text-tertiary)]">{limit.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
