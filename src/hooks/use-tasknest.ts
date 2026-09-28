import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_KEY,
  initialState,
  type Task,
  type TaskNestState,
  type TaskStatus,
} from "@/lib/tasknest";

function loadState(): TaskNestState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<TaskNestState>;
    return {
      tasks: Array.isArray(parsed.tasks) ? (parsed.tasks as Task[]) : [],
      dailyBudgetHours:
        typeof parsed.dailyBudgetHours === "number" ? parsed.dailyBudgetHours : 6,
      activeTaskId: parsed.activeTaskId ?? null,
    };
  } catch {
    return initialState;
  }
}

export function useTaskNest() {
  const [state, setState] = useState<TaskNestState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const addTask = useCallback((input: Omit<Task, "id" | "status" | "scheduled" | "focusSeconds" | "createdAt">) => {
    setState((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          ...input,
          id: crypto.randomUUID(),
          status: "todo" as TaskStatus,
          scheduled: false,
          focusSeconds: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
      activeTaskId: prev.activeTaskId === id ? null : prev.activeTaskId,
    }));
  }, []);

  const toggleScheduled = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, scheduled: !t.scheduled } : t)),
    }));
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      activeTaskId: status === "done" && prev.activeTaskId === id ? null : prev.activeTaskId,
    }));
  }, []);

  const setActiveTask = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      activeTaskId: id,
      tasks: prev.tasks.map((t) =>
        t.id === id && t.status === "todo" ? { ...t, status: "in-progress" } : t,
      ),
    }));
  }, []);

  const addFocusSeconds = useCallback((id: string, seconds: number) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, focusSeconds: t.focusSeconds + seconds } : t,
      ),
    }));
  }, []);

  const setDailyBudgetHours = useCallback((hours: number) => {
    setState((prev) => ({ ...prev, dailyBudgetHours: hours }));
  }, []);

  return {
    ...state,
    hydrated,
    addTask,
    updateTask,
    removeTask,
    toggleScheduled,
    setStatus,
    setActiveTask,
    addFocusSeconds,
    setDailyBudgetHours,
  };
}
