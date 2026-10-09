import { api } from "./client";

export type TaskRecurrence =
  | "once"
  | "daily"
  | "weekdays"
  | "weekends"
  | "specific_days";

export type TaskPayload = {
  title: string;
  category?: string;
  icon?: string;
  recurrence?: TaskRecurrence | string;
  recurrence_type?: string;
  time_of_day?: string | null;
  specific_days?: number[];
  notes?: string | null;
  duration_minutes?: number | null;
};

export type TaskItem = {
  id: number;
  owner_id: number;
  title: string;
  category?: string;
  icon?: string;
  recurrence_type?: string;
  recurrence?: string;
  time_of_day?: string | null;
  specific_days?: number[];
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function sanitizePayload(payload: TaskPayload): TaskPayload {
  const recurrence = payload.recurrence_type || payload.recurrence || "daily";
  const mappedRecurrence = recurrence === "once" ? "one_time" : recurrence;

  let timeOfDay = payload.time_of_day;
  if (timeOfDay && typeof timeOfDay === "string") {
    // Keep only HH:mm (first 5 chars)
    timeOfDay = timeOfDay.slice(0, 5);
  }

  return {
    ...payload,
    recurrence_type: mappedRecurrence,
    category: payload.category ? payload.category.charAt(0).toUpperCase() + payload.category.slice(1) : "Other",
    time_of_day: timeOfDay || null,
  };
}

export const tasksApi = {
  getTasks: () => api.get<{ tasks: TaskItem[] }>("/tasks"),

  createTask: (payload: TaskPayload) =>
    api.post<{ task: TaskItem }>("/tasks", sanitizePayload(payload)),

  updateTask: (id: number, payload: Partial<TaskPayload>) =>
    api.patch<{ task: TaskItem }>(`/tasks/${id}`, sanitizePayload(payload as TaskPayload)),

  deleteTask: (id: number) => api.delete<{ message: string }>(`/tasks/${id}`),

  toggleTask: (id: number) =>
    api.post<{ status: string; log: any }>(`/tasks/${id}/toggle`),

  batchCreateTasks: async (tasks: TaskPayload[]): Promise<TaskItem[]> => {
    const sanitized = tasks.map(sanitizePayload);
    try {
      const response = await api.post<{ tasks: TaskItem[] }>("/tasks/batch", { tasks: sanitized });
      return response?.tasks || [];
    } catch (err) {
      console.warn("Direct batch failed, falling back to iterative create:", err);
      const results: TaskItem[] = [];
      for (const t of sanitized) {
        try {
          const res = await tasksApi.createTask(t);
          if (res?.task) results.push(res.task);
        } catch (e) {
          console.error("Failed to add task:", t.title, e);
        }
      }
      return results;
    }
  },
};
