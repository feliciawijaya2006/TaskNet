import { AlertTriangle, CalendarRange, Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatMinutes, type Task } from "@/lib/tasknest";

export function DailySchedule({
  tasks,
  budgetHours,
  onRemove,
  onStartFocus,
}: {
  tasks: Task[];
  budgetHours: number;
  onRemove: (id: string) => void;
  onStartFocus: (id: string) => void;
}) {
  const budgetMinutes = budgetHours * 60;
  const used = tasks.reduce((s, t) => s + t.duration, 0);
  const over = used > budgetMinutes;

  let cursor = 0;
  const slots = tasks.map((task) => {
    const start = cursor;
    cursor += task.duration;
    const fits = cursor <= budgetMinutes;
    return { task, start, end: cursor, fits };
  });

  function slotTime(minutesFromStart: number) {
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    const d = new Date(base.getTime() + minutesFromStart * 60_000);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <Card className="card-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="size-4" /> Daily Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatMinutes(used)} dari {formatMinutes(budgetMinutes)} terpakai
            </span>
            <Badge variant={over ? "destructive" : "secondary"}>
              {over ? "Melebihi kapasitas" : `Sisa ${formatMinutes(Math.max(0, budgetMinutes - used))}`}
            </Badge>
          </div>
          <Progress value={Math.min(100, (used / budgetMinutes) * 100)} className="mt-3" />
        </div>

        {slots.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada task di jadwal. Tekan “Jadwalkan” pada task prioritas teratas.
          </p>
        ) : (
          <ul className="grid gap-2">
            {slots.map(({ task, start, end, fits }) => (
              <li
                key={task.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3",
                  !fits && "border-destructive/40 bg-destructive/5",
                  task.status === "done" && "opacity-60",
                )}
              >
                <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                  {slotTime(start)}–{slotTime(end)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-medium", task.status === "done" && "line-through")}>
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatMinutes(task.duration)}</span>
                </span>
                {!fits ? <AlertTriangle className="size-4 shrink-0 text-destructive" /> : null}
                <Button size="icon" variant="ghost" onClick={() => onStartFocus(task.id)} aria-label="Start focus">
                  <Play />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onRemove(task.id)} aria-label="Keluarkan dari jadwal">
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
