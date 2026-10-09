import { api } from "./client";

export type WeeklyTrendDay = {
  date: string;
  day_name: string;
  day_label: string;
  is_today: boolean;
  total_tasks: number;
  completed_tasks: number;
  completion_percent: number;
  status: "perfect" | "good" | "missed" | "exempt" | "normal";
};

export type MonthlyHeatmapDay = {
  date: string;
  day_number: number;
  day_name: string;
  completion_percent: number;
  completed_count: number;
  total_count: number;
  level: number; // 0: 0%, 1: 1-39%, 2: 40-74%, 3: 75-99%, 4: 100%
  is_today: boolean;
};

export type CategoryBreakdownItem = {
  category: string;
  key: string;
  icon: string;
  due_count: number;
  completed_count: number;
  completion_percent: number;
};

export type PartnerSynergyStats = {
  partner_name: string;
  partner_streak: number;
  partner_today_percent: number;
  partner_completed_today: number;
  partner_total_today: number;
  couple_synergy_score: number;
};

export type AnalyticsOverview = {
  current_streak: number;
  best_streak: number;
  weekly_completion_rate: number;
  monthly_completion_rate: number;
  total_completed_lifetime: number;
  active_tasks_count: number;
};

export type AnalyticsData = {
  overview: AnalyticsOverview;
  weekly_trend: WeeklyTrendDay[];
  monthly_heatmap: MonthlyHeatmapDay[];
  category_breakdown: CategoryBreakdownItem[];
  partner: PartnerSynergyStats | null;
};

export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    return api.get<AnalyticsData>("/analytics");
  },
};
