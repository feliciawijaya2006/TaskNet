import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Coffee, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatClock, formatMinutes, type Task } from "@/lib/tasknest";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function playAlert() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
    gain.connect(ctx.destination);
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.4);
    });
    setTimeout(() => void ctx.close(), 1600);
  } catch {
    /* audio not available */
  }
}

export function FocusTimer({
  task,
  onAddFocusSeconds,
  onComplete,
}: {
  task: Task | null;
  onAddFocusSeconds: (seconds: number) => void;
  onComplete: () => void;
}) {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const total = mode === "work" ? WORK_SECONDS : BREAK_SECONDS;

  const reset = useCallback(() => {
    setRunning(false);
    setMode("work");
    setRemaining(WORK_SECONDS);
  }, []);

  useEffect(() => {
    reset();
  }, [task?.id, reset]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) {
          if (modeRef.current === "work") onAddFocusSeconds(1);
          return prev - 1;
        }
        if (modeRef.current === "work") {
          onAddFocusSeconds(1);
          setSessions((s) => s + 1);
          setMode("break");
          playAlert();
          toast.success("Sesi fokus selesai!", { description: "Waktunya istirahat 5 menit." });
          return BREAK_SECONDS;
        }
        setMode("work");
        playAlert();
        toast("Istirahat selesai", { description: "Siap lanjut 25 menit lagi?" });
        return WORK_SECONDS;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, onAddFocusSeconds]);

  return (
    <Card className="card-lift">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Focus Mode</CardTitle>
        <Badge variant={mode === "work" ? "default" : "secondary"}>
          {mode === "work" ? "Kerja 25 menit" : "Istirahat 5 menit"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-lg border bg-secondary/50 p-3 text-sm">
          {task ? (
            <>
              <p className="font-medium">{task.title}</p>
              <p className="text-muted-foreground">
                Total fokus: {formatMinutes(Math.round(task.focusSeconds / 60))} · Estimasi{" "}
                {formatMinutes(task.duration)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Pilih “Start Focus” pada salah satu task untuk mulai sesi Pomodoro.
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
            {formatClock(remaining)}
          </p>
          <Progress value={((total - remaining) / total) * 100} className="mt-4" />
          <p className="mt-2 text-xs text-muted-foreground">
            {sessions} sesi Pomodoro selesai hari ini
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => setRunning((r) => !r)} disabled={!task}>
            {running ? <Pause /> : <Play />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={reset} disabled={!task}>
            <RotateCcw /> Reset
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setRunning(false);
              setMode((m) => (m === "work" ? "break" : "work"));
              setRemaining(mode === "work" ? BREAK_SECONDS : WORK_SECONDS);
            }}
            disabled={!task}
          >
            <Coffee /> Ganti mode
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRunning(false);
              onComplete();
              toast.success("Task ditandai selesai");
            }}
            disabled={!task}
          >
            <CheckCircle2 /> Complete Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
