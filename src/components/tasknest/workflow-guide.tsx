import { CalendarPlus, Check, ListPlus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const steps = [
  {
    number: 1 as const,
    title: "Tambah tugas",
    description: "Tulis pekerjaan yang ingin diselesaikan",
    action: "Buat tugas",
    target: "task-form",
    icon: ListPlus,
  },
  {
    number: 2 as const,
    title: "Masukkan ke jadwal",
    description: "Sisihkan waktu sesuai estimasi tugas",
    action: "Pilih tugas",
    target: "task-list",
    icon: CalendarPlus,
  },
  {
    number: 3 as const,
    title: "Mulai fokus",
    description: "Kerjakan dengan siklus fokus otomatis",
    action: "Lihat jadwal",
    target: "daily-schedule",
    icon: Play,
  },
];

export function WorkflowGuide({ currentStep }: { currentStep: Step }) {
  function goTo(target: string) {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section aria-labelledby="workflow-title" className="workflow-panel">
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">Mulai dari sini</p>
        <h2 id="workflow-title" className="mt-1 text-2xl font-bold sm:text-3xl">
          Selesaikan tugas dalam 3 langkah
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Ikuti langkah yang disorot. TaskNest akan menunjukkan tindakan berikutnya.
        </p>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {steps.map(({ number, title, description, action, target, icon: Icon }) => {
          const completed = number < currentStep;
          const active = number === currentStep;

          return (
            <div
              key={number}
              className={cn(
                "relative flex min-h-44 flex-col rounded-lg border p-5 transition-colors",
                active && "border-primary bg-primary/5 shadow-card",
                completed && "border-success/30 bg-success/5",
                number > currentStep && "bg-muted/30 text-muted-foreground",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full border text-sm font-bold",
                    active && "border-primary bg-primary text-primary-foreground",
                    completed && "border-success bg-success text-success-foreground",
                    number > currentStep && "border-border bg-card",
                  )}
                >
                  {completed ? <Check className="size-4" /> : number}
                </span>
                <Icon className={cn("size-5", active && "text-primary", completed && "text-success")} />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
              {active ? (
                <Button className="mt-4 w-full" onClick={() => goTo(target)}>
                  {action}
                </Button>
              ) : (
                <p className="mt-4 text-xs font-semibold">
                  {completed ? "Selesai" : "Setelah langkah sebelumnya"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}