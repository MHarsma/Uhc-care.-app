import { api } from "./client";

// ============================
// Types
// ============================

export interface FitnessGoals {
  target_calories: number;
  target_exercise_minutes: number;
  target_mindful_minutes: number;
  target_water_glasses: number;
}

export interface FitnessLogEntry {
  id: number;
  date: string;
  active_calories: number;
  exercise_minutes: number;
  mindful_minutes: number;
  water_glasses: number;
}

export interface PartnerFitnessLog {
  partner_name: string;
  active_calories: number;
  exercise_minutes: number;
  water_glasses: number;
}

export interface FitnessDataResponse {
  goals: FitnessGoals;
  log: FitnessLogEntry;
  partner_log?: PartnerFitnessLog | null;
}

export interface GoalUpdatePayload {
  target_calories?: number;
  target_exercise_minutes?: number;
  target_mindful_minutes?: number;
  target_water_glasses?: number;
}

export interface LogUpdatePayload {
  active_calories?: number;
  exercise_minutes?: number;
  mindful_minutes?: number;
  water_glasses?: number;
}

// ============================
// API
// ============================

export const fitnessApi = {
  getData: async (): Promise<FitnessDataResponse> => {
    return api.get<FitnessDataResponse>("/fitness");
  },

  updateGoals: async (data: GoalUpdatePayload): Promise<{ goals: FitnessGoals }> => {
    return api.put<{ goals: FitnessGoals }>("/fitness/goals", data);
  },

  updateLog: async (data: LogUpdatePayload): Promise<{ log: FitnessLogEntry }> => {
    return api.put<{ log: FitnessLogEntry }>("/fitness/log", data);
  },
};
