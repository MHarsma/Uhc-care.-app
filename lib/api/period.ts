import { api } from "./client";

export interface PeriodEntry {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string | null;
  is_ongoing: boolean;
  cycle_day?: number;
  duration_days?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveCycleSummary {
  has_active_period?: boolean;
  is_active?: boolean;
  current_cycle_day?: number | null;
  cycle_day?: number | null;
  active_period_id?: number | null;
  is_ongoing?: boolean;
}

export interface PeriodsResponse {
  periods: PeriodEntry[];
  active_summary: ActiveCycleSummary;
  is_female?: boolean;
  is_partner_view?: boolean;
  target_name?: string;
  period_tracking_enabled?: boolean;
}

export const periodApi = {
  getPeriods: async (): Promise<PeriodsResponse> => {
    return api.get<PeriodsResponse>("/periods");
  },

  logPeriod: async (data: {
    start_date: string;
    end_date?: string | null;
  }): Promise<{ period: PeriodEntry }> => {
    return api.post<{ period: PeriodEntry }>("/periods", data);
  },

  updatePeriod: async (
    periodId: number,
    data: {
      start_date?: string;
      end_date?: string | null;
    }
  ): Promise<{ period: PeriodEntry }> => {
    return api.put<{ period: PeriodEntry }>(`/periods/${periodId}`, data);
  },

  deletePeriod: async (periodId: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/periods/${periodId}`);
  },
};
