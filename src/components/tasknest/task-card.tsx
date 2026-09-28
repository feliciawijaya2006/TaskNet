import { CalendarClock, CheckCircle2, Play, Timer, Trash2, CalendarPlus, CalendarMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  deadlineLabel,
  formatMinutes,
  priorityLevel,
  priorityScore,
  type Task,
} from "@/lib/tasknest";

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning-foreground border-warning/40",
  low: "bg-success/15 text-success-foreground border-success/40",
};

const priorityLabel: Record<string, string> = {
  high: "Prioritas tinggi",
  medium: "Prioritas sedang",
  low: "Prioritas rendah",
};

export function TaskCard({
  task,
  isActive,
  onStartFocus,
  onToggleScheduled,
  onComplete,
  onRemove,
}: {
  task: Task;
  isActive: boolean;
  onStartFocus: () => void;
  onToggleScheduled: () => void;
  onComplete: () => void;
  onRemove: () => void;
}) {
  const score = priorityScore(task);
  const level = priorityLevel(score);
  const overdue = new Date(task.deadline).getTime() < Date.now() && task.status !== "done";

  return (
    <Card
      className={cn(
        "card-lift",
        isActive && "ring-2 ring-primary",
        task.status === "done" && "opacity-70",
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-semibold",
                task.status === "done" && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </h3>
            {task.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
            ) : null}
          </div>
          <Badge variant="outline" className={cn("shrink-0", priorityStyles[level])}>
            {score}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className={priorityStyles[level]}>
            {priorityLabel[level]}
          </Badge>
          <Badge variant="secondary">{task.category}</Badge>
          <span className={cn("inline-flex items-center gap-1", overdue && "text-destructive")}>
            <CalendarClock className="size-3.5" /> {deadlineLabel(task.deadline)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Timer className="size-3.5" /> {formatMinutes(task.duration)}
          </span>
          {task.status === "in-progress" ? <Badge>Sedang dikerjakan</Badge> : null}
          {task.status === "done" ? <Badge variant="secondary">Done</Badge> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {task.status !== "done" ? (
            <>
              <Button size="sm" onClick={onStartFocus}>
                <Play /> Start Focus
              </Button>
              <Button size="sm" variant="outline" onClick={onToggleScheduled}>
                {task.scheduled ? <CalendarMinus /> : <CalendarPlus />}
                {task.scheduled ? "Keluarkan" : "Jadwalkan"}
              </Button>
              <Button size="sm" variant="ghost" onClick={onComplete}>
                <CheckCircle2 /> Selesai
              </Button>
            </>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={`Hapus ${task.title}`}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
