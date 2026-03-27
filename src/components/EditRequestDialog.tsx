import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Request, useUpdateRequest } from "@/hooks/useRequests";
import { CATEGORIES, getCategoryConfig } from "@/lib/categories";

const priorityLabels: Record<number, string> = {
  1: "Çok Düşük",
  2: "Düşük",
  3: "Orta",
  4: "Yüksek",
  5: "Kritik",
};

interface Props {
  request: Request;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditRequestDialog = ({ request, open, onOpenChange }: Props) => {
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description ?? "");
  const [category, setCategory] = useState(request.category ?? "");
  const [priority, setPriority] = useState(request.priority);
  const updateReq = useUpdateRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateReq.mutate(
      {
        id: request.id,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        priority,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Talebi Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Başlık *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Açıklama</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3} />
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
            <Slider value={[priority]} onValueChange={([v]) => setPriority(v)} min={1} max={5} step={1} className="py-2" />
          </div>
          <Button type="submit" className="w-full" disabled={updateReq.isPending}>
            {updateReq.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
