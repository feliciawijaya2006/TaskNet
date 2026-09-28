import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ListChecks, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskNest } from "@/hooks/use-tasknest";
import { sortByPriority } from "@/lib/tasknest";
import { TaskForm } from "@/components/tasknest/task-form";
import { TaskCard } from "@/components/tasknest/task-card";
import { DailySchedule } from "@/components/tasknest/daily-schedule";
import { FocusTimer } from "@/components/tasknest/focus-timer";
import { Dashboard } from "@/components/tasknest/dashboard";

const title = "TaskNest — Personal Task & Focus Planner";
const description =
  "Masukkan tugas, tentukan prioritas otomatis, susun jadwal harian sesuai kapasitas waktu, lalu fokus mengerjakannya dengan Pomodoro Timer.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const nest = useTaskNest();
  const {
    tasks,
    dailyBudgetHours,
    activeTaskId,
    addTask,
    removeTask,
    toggleScheduled,
    setStatus,
    setActiveTask,
    addFocusSeconds,
    setDailyBudgetHours,
  } = nest;

  const sorted = useMemo(() => sortByPriority(tasks), [tasks]);
  const activeList = sorted.filter((t) => t.status !== "done");
  const doneList = sorted.filter((t) => t.status === "done");
  const scheduled = useMemo(
    () => sortByPriority(tasks.filter((t) => t.scheduled)),
    [tasks],
  );
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ListChecks className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">TaskNest</h1>
              <p className="text-xs text-muted-foreground">
                Masukkan tugas, tentukan prioritas, susun jadwal, lalu fokus mengerjakannya.
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="budget" className="text-xs">
                Daily time budget (jam)
              </Label>
              <Input
                id="budget"
                type="number"
                min={1}
                max={16}
                step={0.5}
                value={dailyBudgetHours}
                onChange={(e) => setDailyBudgetHours(Number(e.target.value) || 1)}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <Dashboard tasks={tasks} />

          <section className="grid gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="font-semibold">Smart Task List</h2>
              <span className="text-xs text-muted-foreground">
                Diurutkan otomatis: deadline 45% · importance 35% · effort 20%
              </span>
            </div>
            {activeList.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada task aktif. Tambahkan task pertama Anda di Task Inbox.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {activeList.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isActive={task.id === activeTaskId}
                    onStartFocus={() => setActiveTask(task.id)}
                    onToggleScheduled={() => toggleScheduled(task.id)}
                    onComplete={() => setStatus(task.id, "done")}
                    onRemove={() => removeTask(task.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <DailySchedule
            tasks={scheduled}
            budgetHours={dailyBudgetHours}
            onRemove={toggleScheduled}
            onStartFocus={setActiveTask}
          />

          {doneList.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selesai ({doneList.length})</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {doneList.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isActive={false}
                    onStartFocus={() => setActiveTask(task.id)}
                    onToggleScheduled={() => toggleScheduled(task.id)}
                    onComplete={() => setStatus(task.id, "done")}
                    onRemove={() => removeTask(task.id)}
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="grid content-start gap-6">
          <FocusTimer
            task={activeTask}
            onAddFocusSeconds={(s) => activeTaskId && addFocusSeconds(activeTaskId, s)}
            onComplete={() => activeTaskId && setStatus(activeTaskId, "done")}
          />
          <TaskForm onAdd={addTask} />
        </aside>
      </main>
    </div>
  );
}
