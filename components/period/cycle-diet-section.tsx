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
  Sparkles,
  Heart,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Flame,
  Leaf,
  Coffee,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleDietSectionProps {
  currentPhaseKey: "menstrual" | "follicular" | "ovulation" | "luteal";
}

export function CycleDietSection({ currentPhaseKey }: CycleDietSectionProps) {
  const [selectedPhase, setSelectedPhase] = React.useState<
    "menstrual" | "follicular" | "ovulation" | "luteal"
  >(currentPhaseKey);

  const [copiedGrocery, setCopiedGrocery] = React.useState(false);
  const [selectedMealIndex, setSelectedMealIndex] = React.useState(0);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = React.useState(false);
  const [activeModalMeal, setActiveModalMeal] = React.useState<MealIdea | null>(null);

  const handleOpenRecipe = (meal: MealIdea, idx: number) => {
    setSelectedMealIndex(idx);
    setActiveModalMeal(meal);
    setIsRecipeModalOpen(true);
  };

  // Sync if prop changes and user hasn't explicitly clicked away
  React.useEffect(() => {
    setSelectedPhase(currentPhaseKey);
  }, [currentPhaseKey]);

  const nutritionData: PhaseNutritionDetail =
    CYCLE_NUTRITION_DATA[selectedPhase] ||
    CYCLE_NUTRITION_DATA.follicular;

  const handleCopyGroceryList = async () => {
    const text = [
      `🛒 UHC Care — ${nutritionData.phaseName} Grocery List for My Partner:`,
      ...nutritionData.partnerGroceryList.map((item) => `• ${item}`),
      `\n💡 Focus: ${nutritionData.subtitle}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedGrocery(true);
      setTimeout(() => setCopiedGrocery(false), 2500);
    } catch {
      // Fallback
      console.warn("Failed to copy grocery list");
    }
  };

  const phaseColors: Record<
    string,
    {
      tabActive: string;
      badge: string;
      gradient: string;
      border: string;
    }
  > = {
    menstrual: {
      tabActive: "bg-rose-500 text-white shadow-md shadow-rose-500/25",
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
      border: "border-rose-500/30",
    },
    follicular: {
      tabActive: "bg-violet-600 text-white shadow-md shadow-violet-600/25",
      badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
      gradient: "from-violet-500/10 via-indigo-500/5 to-transparent",
      border: "border-violet-500/30",
    },
    ovulation: {
      tabActive: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      border: "border-amber-500/30",
    },
    luteal: {
      tabActive: "bg-cyan-600 text-white shadow-md shadow-cyan-600/25",
      badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      gradient: "from-cyan-500/10 via-teal-500/5 to-transparent",
      border: "border-cyan-500/30",
    },
  };

  const currentTheme = phaseColors[selectedPhase];

  return (
    <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-4 sm:p-8 shadow-sm glass-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Utensils className="h-4 w-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              Phase-Based Hormonal Nutrition & Diet Sanctuary
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Tailored meal plans, micronutrient cofactors, seed cycling, and couple grocery synergy based on natural endocrinology.
          </p>
        </div>

        {/* Phase Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
          {(["menstrual", "follicular", "ovulation", "luteal"] as const).map(
            (pKey) => {
              const info = CYCLE_NUTRITION_DATA[pKey];
              const isSelected = selectedPhase === pKey;
              const isCurrent = currentPhaseKey === pKey;

              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setSelectedPhase(pKey)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none",
                    isSelected
                      ? phaseColors[pKey].tabActive
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
                  )}
                >
                  <span>{info.icon}</span>
                  <span className="capitalize">{info.phaseName.replace(" Phase", "")}</span>
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Phase Overview Banner */}
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-5 bg-gradient-to-r transition-all space-y-3",
          currentTheme.border,
          currentTheme.gradient
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{nutritionData.icon}</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
                {nutritionData.phaseName}: {nutritionData.subtitle}
              </h3>
              <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                {nutritionData.hormoneStatus}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border",
              currentTheme.badge
            )}
          >
            <Sparkles className="h-3 w-3" />
            <span>Bio-Rhythm Active</span>
          </span>
        </div>

        <div className="flex items-start gap-2 pt-2 border-t border-[var(--glass-border)] text-xs text-[var(--text-secondary)]">
          <Flame className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[var(--text-primary)]">Metabolism Note:</strong>{" "}
            {nutritionData.metabolismNote}
          </p>
        </div>
      </div>

      {/* Grid: Seed Cycling Protocol & Key Micronutrients */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Seed Cycling Card */}
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Leaf className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Daily Seed Cycling Protocol
              </h4>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Naturopathic hormone modulation
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-2">
              {nutritionData.seedCycling.seeds.map((seed) => (
                <span
                  key={seed}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs font-bold"
                >
                  <span>✨</span>
                  <span>{seed}</span>
                </span>
              ))}
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
              <strong className="text-[var(--text-primary)]">Dosage:</strong>{" "}
              {nutritionData.seedCycling.dosage}.
            </p>

            <div className="rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-amber-600 dark:text-amber-400">Why it works: </span>
              {nutritionData.seedCycling.benefit}
            </div>
          </div>
        </div>

        {/* Micronutrients Matrix */}
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Key Micronutrients for {nutritionData.phaseName.replace(" Phase", "")}
              </h4>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Essential cellular cofactors for symptom prevention
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {nutritionData.micronutrients.map((micro) => (
              <div
                key={micro.nutrient}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {micro.nutrient}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {micro.role}
                </p>
                <div className="pt-1 text-[10px] text-[var(--text-muted)] truncate">
                  <span className="font-semibold text-[var(--text-tertiary)]">Sources: </span>
                  {micro.bestSources.slice(0, 3).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nourishing Foods vs Foods to Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What to Nourish with */}
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Nourishing Foods to Prioritize</span>
          </div>

          <div className="space-y-3">
            {nutritionData.nourishingFoods.map((group) => (
              <div key={group.category} className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {group.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="inline-block px-2.5 py-0.5 rounded-lg bg-[var(--bg-card)] border border-emerald-500/20 text-xs font-medium text-[var(--text-primary)] shadow-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to Limit */}
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Foods to Limit or Avoid</span>
          </div>

          <div className="space-y-2.5">
            {nutritionData.foodsToLimit.map((limitItem) => (
              <div
                key={limitItem.food}
                className="rounded-xl border border-rose-500/20 bg-[var(--bg-card)] p-3 space-y-0.5"
              >
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {limitItem.food}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {limitItem.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curated Daily Meal Plan & Recipes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Daily Hormone-Balancing Meal Guide
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Simple 15-minute whole-food recipes designed for your current hormone state.
            </p>
          </div>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nutritionData.meals.map((meal, idx) => {
            const isSelected = selectedMealIndex === idx;

            return (
              <button
                key={meal.mealType}
                type="button"
                onClick={() => handleOpenRecipe(meal, idx)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 group cursor-pointer active:scale-[0.99]",
                  isSelected
                    ? "border-emerald-500/50 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20"
                    : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-emerald-500/40 hover:bg-emerald-500/5"
                )}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    <span>{meal.mealType}</span>
                    <span className="flex items-center gap-1 text-[var(--text-tertiary)]">
                      <Clock className="h-3 w-3" />
                      {meal.prepTimeMinutes}m
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {meal.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[var(--glass-border)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                  <span>~{meal.caloriesApprox} kcal</span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-500/25 transition-colors">
                    View Recipe →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Meal Detailed Recipe Drawer / Card */}
        {nutritionData.meals[selectedMealIndex] && (
          <motion.div
            key={nutritionData.meals[selectedMealIndex].title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 sm:p-6 space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--glass-border)] pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {nutritionData.meals[selectedMealIndex].mealType} Recipe
                </span>
                <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {nutritionData.meals[selectedMealIndex].title}
                </h4>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Prep: {nutritionData.meals[selectedMealIndex].prepTimeMinutes} mins</span>
                </span>
                <span>•</span>
                <span>~{nutritionData.meals[selectedMealIndex].caloriesApprox} Calories</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
              {/* Ingredients */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Ingredients
                </span>
                <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {nutritionData.meals[selectedMealIndex].ingredients.map((ing) => (
                    <li key={ing} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions & Benefit */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Instructions
                  </span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {nutritionData.meals[selectedMealIndex].instructions}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                  <span className="font-bold">✨ Endocrine Benefit: </span>
                  {nutritionData.meals[selectedMealIndex].hormonalBenefit}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dedicated Interactive Recipe Popup Modal */}
        <AnimatePresence>
          {isRecipeModalOpen && activeModalMeal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsRecipeModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-2xl max-h-[88vh] overflow-y-auto space-y-5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[var(--glass-border)] pb-4">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      {activeModalMeal.mealType} • {activeModalMeal.prepTimeMinutes} mins
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-1.5 leading-snug">
                      {activeModalMeal.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      ~{activeModalMeal.caloriesApprox} kcal • Tailored for {nutritionData.phaseName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecipeModalOpen(false)}
                    className="rounded-full p-2 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4 text-[var(--text-secondary)]" />
                  </button>
                </div>

                {/* Ingredients */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Ingredients Checklist
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeModalMeal.ingredients.map((ing) => (
                      <div
                        key={ing}
                        className="flex items-center gap-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] px-3 py-2 text-xs text-[var(--text-primary)]"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooking Instructions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step-by-Step Preparation
                  </span>
                  <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] p-4 text-xs text-[var(--text-primary)] leading-relaxed">
                    {activeModalMeal.instructions}
                  </div>
                </div>

                {/* Endocrine Benefit */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  <span className="font-extrabold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    Hormone-Balancing Synergy:
                  </span>
                  {activeModalMeal.hormonalBenefit}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecipeModalOpen(false)}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
                  >
                    Done & Close Recipe
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Partner Grocery Synchronization Card */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-rose-600/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-violet-500" />
            <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
              Couple Grocery Synergy ({nutritionData.phaseName.replace(" Phase", "")})
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Send this curated shopping checklist to your partner with 1 tap, so they can bring home the right snacks, restorative teas, and ingredients for your exact cycle days.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyGroceryList}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all shrink-0"
        >
          {copiedGrocery ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Copied Grocery List!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy for Partner</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
