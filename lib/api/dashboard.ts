import { api } from "./client";

export type DashboardTask = {
  id: number;
  title: string;
  category?: string;
  icon?: string;
  time_of_day?: string | null;
  is_prayer?: boolean;
  is_paused?: boolean;
  done: boolean;
  completed_at?: string | null;
};

export type DashboardData = {
  user: {
    id: number;
    name: string;
    email: string;
    city?: string;
    timezone: string;
    is_female?: boolean;
  };
  cycle_status?: {
    is_active: boolean;
    cycle_day: number | null;
    is_ongoing: boolean;
  } | null;
  stats: {
    total_tasks: number;
    completed_tasks: number;
    progress_percent: number;
    streak_days: number;
  };
  tasks: DashboardTask[];
};

export type PartnerData = {
  partner: {
    id: number;
    name: string;
    timezone: string;
  } | null;
  partner_cycle_status?: {
    is_resting: boolean;
    label: string;
  } | null;
  stats: {
    total: number;
    completed: number;
    percentage: number;
  } | null;
  pending_leave_requests?: Array<{
    id: number;
    reason?: string | null;
    status: string;
    task: {
      id: number;
      title: string;
    };
  }>;
};

export const dashboardApi = {
  getDashboard: () => api.get<DashboardData>("/dashboard"),
  getDashboardForDate: (date: string) =>
    api.get<DashboardData>(`/dashboard?date=${encodeURIComponent(date)}`),
  getPartnerSummary: () => api.get<PartnerData>("/partner"),
};
