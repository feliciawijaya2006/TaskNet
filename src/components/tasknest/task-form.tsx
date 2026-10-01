import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Importance, Task } from "@/lib/tasknest";

type NewTask = Omit<Task, "id" | "status" | "scheduled" | "focusSeconds" | "createdAt">;

function defaultDeadline() {
  const d = new Date(Date.now() + 24 * 3_600_000);
  d.setMinutes(0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function TaskForm({
  onAdd,
  isFirstTask = false,
}: {
  onAdd: (task: NewTask) => void;
  isFirstTask?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [importance, setImportance] = useState<Importance>("medium");
  const [duration, setDuration] = useState("60");
  const [category, setCategory] = useState("Umum");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul task wajib diisi");
      return;
    }
    const minutes = Number(duration);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.error("Estimasi durasi harus lebih dari 0 menit");
      return;
    }
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: new Date(deadline).toISOString(),
      importance,
      duration: minutes,
      category: category.trim() || "Umum",
    });
    toast.success("Tugas berhasil dibuat", {
      description: "Selanjutnya, masukkan tugas ini ke jadwal.",
    });
    setTitle("");
    setDescription("");
    setDuration("60");
  }

  return (
    <Card className="card-lift scroll-mt-6" id="task-form">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          <div>
            <CardTitle className="text-base">
              {isFirstTask ? "Buat tugas pertama" : "Tambah tugas baru"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Cukup isi judul, deadline, dan perkiraan waktunya.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Apa yang ingin Anda selesaikan?</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Revisi laporan magang"
              autoFocus={isFirstTask}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Catatan tambahan (opsional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail singkat pekerjaan"
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="importance">Seberapa penting?</Label>
              <Select value={importance} onValueChange={(v) => setImportance(v as Importance)}>
                <SelectTrigger id="importance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Sangat penting</SelectItem>
                  <SelectItem value="medium">Cukup penting</SelectItem>
                  <SelectItem value="low">Tidak mendesak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Perkiraan waktu (menit)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori (opsional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kuliah, Klien, Rutin"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            <Plus /> {isFirstTask ? "Buat tugas pertama" : "Tambah tugas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
