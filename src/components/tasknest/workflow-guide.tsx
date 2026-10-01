import { Check } from "lucide-react";
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
  },
  {
    number: 2 as const,
    title: "Masukkan ke jadwal",
    description: "Sisihkan waktu sesuai estimasi tugas",
    action: "Pilih tugas",
    target: "task-list",
  },
  {
    number: 3 as const,
    title: "Mulai fokus",
    description: "Kerjakan dengan siklus fokus otomatis",
    action: "Lihat jadwal",
    target: "daily-schedule",
  },
];

export function WorkflowGuide({ currentStep }: { currentStep: Step }) {
  function goTo(target: string) {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section aria-labelledby="workflow-title" className="rounded-lg border bg-card p-4 shadow-card">
      <h2 id="workflow-title" className="font-semibold">Langkah penggunaan</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {steps.map(({ number, title, description, action, target }) => {
          const completed = number < currentStep;
          const active = number === currentStep;

          return (
            <div
              key={number}
              className={cn(
                "flex items-center gap-3 rounded-md border p-3",
                active && "border-primary bg-primary/5",
                completed && "border-success/30 bg-success/5",
                number > currentStep && "bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold",
                  active && "border-primary bg-primary text-primary-foreground",
                  completed && "border-success bg-success text-success-foreground",
                  number > currentStep && "bg-card text-muted-foreground",
                )}
              >
                {completed ? <Check className="size-4" /> : number}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                {active ? <p className="text-xs text-muted-foreground">{description}</p> : null}
              </div>
              {active ? (
                <Button size="sm" variant="outline" onClick={() => goTo(target)}>
                  {action}
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}