import { api } from "./client";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  gender: "female" | "male";
  city: string;
  timezone: string;
  period_tracking_enabled: boolean;
  is_female: boolean;
}

export interface PartnerSummary {
  id: number;
  name: string;
  email: string;
}

export interface CoupleSummary {
  id: number;
  paired_at: string | null;
  unpair_requested_by: number | null;
  unpair_pending: boolean;
  unpair_requested_by_me: boolean;
}

export interface ProfileResponse {
  user: UserProfile;
  partner: PartnerSummary | null;
  couple: CoupleSummary | null;
}

export interface NotificationSettings {
  task_completed_realtime: boolean;
  note_reactions: boolean;
  streak_milestones: boolean;
  daily_digest: boolean;
}

export interface PeriodSettings {
  sharing: {
    enabled: boolean;
    label: string;
  };
}

export interface PrayerTimeItem {
  id: number;
  prayer_name: string;
  display_name?: string;
  api_time: string;
  custom_time: string | null;
  effective_time: string;
  reminder_offset_minutes?: number;
}

export const settingsApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    return api.get<ProfileResponse>("/profile");
  },

  updateProfile: async (data: {
    name?: string;
    city?: string;
    timezone?: string;
  }): Promise<{ message: string; user: UserProfile }> => {
    return api.put<{ message: string; user: UserProfile }>("/profile", data);
  },

  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    return api.post<{ message: string }>("/profile/password", data);
  },

  getNotificationSettings: async (): Promise<{ settings: NotificationSettings }> => {
    return api.get<{ settings: NotificationSettings }>("/notifications/settings");
  },

  updateNotificationSettings: async (
    settings: Partial<NotificationSettings>
  ): Promise<{ settings: NotificationSettings }> => {
    return api.put<{ settings: NotificationSettings }>(
      "/notifications/settings",
      settings
    );
  },

  getPeriodSettings: async (): Promise<PeriodSettings> => {
    return api.get<PeriodSettings>("/periods/settings");
  },

  updatePeriodSettings: async (enabled: boolean): Promise<PeriodSettings> => {
    return api.put<PeriodSettings>("/periods/settings", { enabled });
  },

  getPrayerTimes: async (): Promise<{ prayer_times: PrayerTimeItem[] }> => {
    return api.get<{ prayer_times: PrayerTimeItem[] }>("/prayer-times");
  },

  updatePrayerOverride: async (
    prayerName: string,
    customTime: string | null
  ): Promise<{ prayer_time: PrayerTimeItem }> => {
    return api.post<{ prayer_time: PrayerTimeItem }>(
      `/prayer-times/${prayerName.toLowerCase()}`,
      { custom_time: customTime }
    );
  },

  overridePrayerTime: async (
    prayerName: string,
    customTime: string | null
  ): Promise<{ prayer_time: PrayerTimeItem }> => {
    return settingsApi.updatePrayerOverride(prayerName, customTime);
  },

  syncPrayersToRoutines: async (): Promise<{
    message: string;
    tasks: Array<{ id: number; title: string; prayer_name: string; time_of_day: string | null }>;
  }> => {
    return api.post<{
      message: string;
      tasks: Array<{ id: number; title: string; prayer_name: string; time_of_day: string | null }>;
    }>("/prayer-times/sync-routines");
  },

  unpair: async (): Promise<{
    message: string;
    status: "pending_confirmation" | "unpaired";
    unpair_requested_by?: number;
  }> => {
    return api.post<{
      message: string;
      status: "pending_confirmation" | "unpaired";
      unpair_requested_by?: number;
    }>("/couple/unpair");
  },

  requestUnpair: async (): Promise<{
    message: string;
    status: "pending_confirmation" | "unpaired";
    unpair_requested_by?: number;
  }> => {
    return settingsApi.unpair();
  },

  cancelUnpair: async (): Promise<{ message: string; status: "active" }> => {
    return api.post<{ message: string; status: "active" }>("/couple/unpair/cancel");
  },

  logout: async (): Promise<void> => {
    return api.post("/auth/logout");
  },
};
