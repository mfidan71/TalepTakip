import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCreateRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveBoard } from "@/contexts/BoardContext";
import { CATEGORIES, getCategoryConfig } from "@/lib/categories";
import { Plus } from "lucide-react";

const priorityLabels: Record<number, string> = {
  1: "Çok Düşük",
  2: "Düşük",
  3: "Orta",
  4: "Yüksek",
  5: "Kritik",
};

export const CreateRequestDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(3);
  const createReq = useCreateRequest();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    createReq.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        priority,
        created_by: user.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setCategory("");
          setPriority(3);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Talep
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Yeni Talep Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Talep başlığı"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Açıklama</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detaylı açıklama..."
              maxLength={2000}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => {
                  const conf = getCategoryConfig(c);
                  const Icon = conf.icon;
                  return (
                    <SelectItem key={c} value={c}>
                      <span className={`inline-flex items-center gap-1.5 ${conf.className}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {c}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Öncelik: {priority} - {priorityLabels[priority]}</Label>
            <Slider
              value={[priority]}
              onValueChange={([v]) => setPriority(v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Çok Düşük</span>
              <span>Kritik</span>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createReq.isPending}>
            {createReq.isPending ? "Oluşturuluyor..." : "Talep Oluştur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
