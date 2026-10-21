import { api } from "./client";

export type UnfinishedTask = {
  id: number;
  title: string;
  category?: string;
  icon?: string;
  time_of_day?: string | null;
  is_prayer?: boolean;
};

export type UnfinishedYesterdayResponse = {
  date: string;
  date_label: string;
  tasks: UnfinishedTask[];
};

export type ReplanAction = "complete" | "request_leave" | "move_to_today" | "dismiss";

export const replanApi = {
  getUnfinishedYesterday: async (): Promise<UnfinishedYesterdayResponse> => {
    return api.get<UnfinishedYesterdayResponse>("/tasks/unfinished-yesterday");
  },

  getUnfinishedForDate: async (date: string): Promise<UnfinishedYesterdayResponse> => {
    return api.get<UnfinishedYesterdayResponse>(
      `/tasks/unfinished-yesterday?date=${encodeURIComponent(date)}`
    );
  },

  replanTask: async (
    taskId: number,
    payload: {
      action: ReplanAction;
      date?: string;
      reason?: string;
    }
  ): Promise<{ message: string; action: string; task_id: number }> => {
    return api.post<{ message: string; action: string; task_id: number }>(
      `/tasks/${taskId}/replan`,
      payload
    );
  },
};
