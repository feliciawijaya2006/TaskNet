import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Pause, Play, RotateCcw } from "lucide-react";
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
  startSignal,
  onAddFocusSeconds,
  onComplete,
}: {
  task: Task | null;
  startSignal: number;
  onAddFocusSeconds: (seconds: number) => void;
  onComplete: () => void;
}) {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const addRef = useRef(onAddFocusSeconds);
  addRef.current = onAddFocusSeconds;
  // Timestamp-based so the timer stays correct when the tab is in the background
  const endAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const pendingMsRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;

  const targetCycles = task ? Math.max(1, Math.ceil(task.duration / 25)) : 1;
  const total = mode === "work" ? WORK_SECONDS : BREAK_SECONDS;

  const reset = useCallback(() => {
    setRunning(false);
    setMode("work");
    setRemaining(WORK_SECONDS);
  }, []);

  // New task selected → reset cycle counter
  useEffect(() => {
    reset();
    setSessions(0);
  }, [task?.id, reset]);

  // "Start Focus" clicked → auto-start timer
  useEffect(() => {
    if (startSignal > 0 && task) {
      setRunning(false);
      setMode("work");
      setRemaining(WORK_SECONDS);
      remainingRef.current = WORK_SECONDS;
      setTimeout(() => setRunning(true), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal]);

  // Tick (based on real clock time)
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    endAtRef.current = start + remainingRef.current * 1000;
    lastTickRef.current = start;
    const tick = () => {
      const now = Date.now();
      if (modeRef.current === "work") {
        const to = Math.min(now, endAtRef.current);
        pendingMsRef.current += Math.max(0, to - lastTickRef.current);
        const s = Math.floor(pendingMsRef.current / 1000);
        if (s > 0) {
          addRef.current(s);
          pendingMsRef.current -= s * 1000;
        }
      }
      lastTickRef.current = now;
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - now) / 1000)));
    };
    const id = window.setInterval(tick, 1000);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running]);

  // Phase transitions (automatic, catches up after background time)
  useEffect(() => {
    if (remaining > 0 || !running) return;
    playAlert();
    const phaseEnd = endAtRef.current;
    const nextRemaining = (dur: number) => {
      endAtRef.current = phaseEnd + dur * 1000;
      return Math.max(1, Math.ceil((endAtRef.current - Date.now()) / 1000));
    };
    if (mode === "work") {
      const done = sessions + 1;
      setSessions(done);
      if (done >= targetCycles) {
        setRunning(false);
        setMode("work");
        setRemaining(WORK_SECONDS);
        toast.success(`Semua ${targetCycles} cycle selesai!`, {
          description: "Estimasi durasi task tercapai. Tandai selesai atau lanjut 1 cycle lagi.",
        });
        return;
      }
      setMode("break");
      setRemaining(nextRemaining(BREAK_SECONDS));
      toast.success(`Cycle ${done}/${targetCycles} selesai!`, {
        description: "Istirahat 5 menit dimulai otomatis.",
      });
    } else {
      lastTickRef.current = phaseEnd;
      setMode("work");
      setRemaining(nextRemaining(WORK_SECONDS));
      toast("Istirahat selesai", { description: `Cycle ${sessions + 1}/${targetCycles} dimulai.` });
    }
  }, [remaining, running, mode, sessions, targetCycles]);

  return (
    <Card className="card-lift scroll-mt-6" id="focus-timer">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            3
          </span>
          Sesi fokus
        </CardTitle>
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
              Timer akan aktif setelah Anda membuat, menjadwalkan, lalu memilih “Mulai fokus” pada sebuah tugas.
            </p>
          )}
        </div>

        {task ? <div className="text-center">
          <p className="font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
            {formatClock(remaining)}
          </p>
          <Progress value={((total - remaining) / total) * 100} className="mt-4" />
          <p className="mt-2 text-xs text-muted-foreground">
            {task
              ? `Cycle ${Math.min(sessions + (mode === "work" ? 1 : 0), targetCycles) || 1} dari ${targetCycles} · ${sessions} selesai`
              : "Belum ada task aktif"}
          </p>
          {task ? (
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: targetCycles }).map((_, i) => (
                <span
                  key={i}
                  className={`size-2 rounded-full ${i < sessions ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          ) : null}
        </div> : null}

        {task ? <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => setRunning((r) => !r)} disabled={!task}>
            {running ? <Pause /> : <Play />}
            {running ? "Jeda" : "Lanjutkan"}
          </Button>
          <Button variant="outline" onClick={reset} disabled={!task}>
            <RotateCcw /> Ulangi
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
            <CheckCircle2 /> Tandai selesai
          </Button>
        </div> : null}
      </CardContent>
    </Card>
  );
}
