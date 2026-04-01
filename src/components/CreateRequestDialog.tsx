import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCreateRequest, useProfiles } from "@/hooks/useRequests";
import { useStages } from "@/hooks/useStages";
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

interface Props {
  defaultStage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateRequestDialog = ({ defaultStage, open: controlledOpen, onOpenChange: controlledOnOpenChange }: Props) => {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(3);
  const [assignedTo, setAssignedTo] = useState("");
  const createReq = useCreateRequest();
  const { user } = useAuth();
  const { activeBoardId } = useActiveBoard();
  const { data: stages } = useStages(activeBoardId);
  const { data: profiles } = useProfiles();

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority(3);
      setAssignedTo("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    const stageKey = defaultStage ?? stages?.[0]?.key ?? "talep";
    createReq.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        priority,
        created_by: user.id,
        board_id: activeBoardId ?? undefined,
        stage: stageKey,
        assigned_to: assignedTo || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const trigger = !isControlled ? (
    <DialogTrigger asChild>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Yeni Talep
      </Button>
    </DialogTrigger>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
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
            <Label>Atanan Kişi</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Kişi seçin" />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.full_name ?? p.user_id}
                  </SelectItem>
                ))}
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
