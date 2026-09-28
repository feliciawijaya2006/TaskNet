import { CheckCircle2, ListTodo, Loader2, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMinutes, type Task } from "@/lib/tasknest";

export function Dashboard({ tasks }: { tasks: Task[] }) {
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const focusMinutes = Math.round(tasks.reduce((s, t) => s + t.focusSeconds, 0) / 60);
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const stats = [
    { label: "To Do", value: todo, icon: ListTodo },
    { label: "In Progress", value: inProgress, icon: Loader2 },
    { label: "Done", value: done, icon: CheckCircle2 },
    { label: "Waktu fokus", value: formatMinutes(focusMinutes), icon: Timer },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="card-lift">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress penyelesaian</span>
            <span className="text-muted-foreground">{completion}%</span>
          </div>
          <Progress value={completion} className="mt-3" />
        </CardContent>
      </Card>
    </div>
  );
}
