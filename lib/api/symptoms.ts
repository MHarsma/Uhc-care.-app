import { api } from "./client";

// ============================
// Types
// ============================

export interface SymptomEntry {
  id: number;
  date: string;
  mood: string | null;
  flow_level: string | null;
  cramps_severity: string | null;
  energy_level: number | null;
  symptoms: string[];
  notes: string | null;
}

export interface SymptomResponse {
  symptom: SymptomEntry | null;
  is_female?: boolean;
  is_partner_view?: boolean;
  target_name?: string;
}

export interface SymptomPayload {
  date?: string;
  mood?: string | null;
  flow_level?: string | null;
  cramps_severity?: string | null;
  energy_level?: number | null;
  symptoms?: string[];
  notes?: string | null;
}

// ============================
// API
// ============================

export const symptomApi = {
  getToday: async (date?: string): Promise<SymptomResponse> => {
    const params = date ? `?date=${date}` : "";
    return api.get<SymptomResponse>(`/period-symptoms${params}`);
  },

  save: async (data: SymptomPayload): Promise<{ symptom: SymptomEntry }> => {
    return api.post<{ symptom: SymptomEntry }>("/period-symptoms", data);
  },
};
