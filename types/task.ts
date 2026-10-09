export type TaskLog = {
  id: number;
  task_id: number;
  date: string;
  status: "done" | "pending" | "missed" | "approved_leave" | "pending_leave";
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Task = {
  id: number;
  title: string;
  icon?: string | null;
  category?: string;
  recurrence_type: string;
  recurrence_days?: string[] | null;
  time_of_day?: string | null;
  duration_minutes?: number | null;
  notes?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_prayer?: boolean;
  prayer_name?: string | null;
  is_active?: boolean;
  logs?: TaskLog[];
};

