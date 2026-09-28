export type Importance = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string | undefined;
  deadline: string; // ISO datetime
  importance: Importance;
  duration: number; // minutes
  category: string;
  status: TaskStatus;
  scheduled: boolean;
  focusSeconds: number;
  createdAt: string;
}

export interface TaskNestState {
  tasks: Task[];
  dailyBudgetHours: number;
  activeTaskId: string | null;
}

export const STORAGE_KEY = "tasknest.state.v1";

export const initialState: TaskNestState = {
  tasks: [],
  dailyBudgetHours: 6,
  activeTaskId: null,
};

export const IMPORTANCE_SCORE: Record<Importance, number> = {
  high: 100,
  medium: 60,
  low: 30,
};

/** Deadline Weight (1-100): the closer the deadline, the closer to 100. */
export function deadlineWeight(deadline: string, now = new Date()): number {
  const hours = (new Date(deadline).getTime() - now.getTime()) / 3_600_000;
  if (Number.isNaN(hours)) return 50;
  if (hours <= 0) return 100; // overdue
  if (hours <= 24) return 100 - (hours / 24) * 10; // 90-100
  if (hours <= 72) return 90 - ((hours - 24) / 48) * 20; // 70-90
  if (hours <= 168) return 70 - ((hours - 72) / 96) * 30; // 40-70
  return Math.max(5, 40 - ((hours - 168) / 168) * 35);
}

/** Effort Factor (1-100): shorter tasks (quick wins) score higher. */
export function effortFactor(duration: number): number {
  if (duration <= 15) return 100;
  if (duration >= 240) return 10;
  return Math.round(100 - ((duration - 15) / (240 - 15)) * 90);
}

/** Priority Score = Deadline×0.45 + Importance×0.35 + Effort×0.20 (1-100) */
export function priorityScore(task: Task, now = new Date()): number {
  const score =
    deadlineWeight(task.deadline, now) * 0.45 +
    IMPORTANCE_SCORE[task.importance] * 0.35 +
    effortFactor(task.duration) * 0.2;
  return Math.max(1, Math.min(100, Math.round(score)));
}

export type PriorityLevel = "high" | "medium" | "low";

export function priorityLevel(score: number): PriorityLevel {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function sortByPriority(tasks: Task[], now = new Date()): Task[] {
  return [...tasks].sort((a, b) => priorityScore(b, now) - priorityScore(a, now));
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h && m) return `${h}j ${m}m`;
  if (h) return `${h} jam`;
  return `${m} menit`;
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function deadlineLabel(deadline: string, now = new Date()): string {
  const diffMs = new Date(deadline).getTime() - now.getTime();
  if (Number.isNaN(diffMs)) return "Tanpa deadline";
  const abs = Math.abs(diffMs);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const text = hours < 24 ? `${hours} jam` : `${days} hari`;
  return diffMs < 0 ? `Terlambat ${text}` : `${text} lagi`;
}
