import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStages, useCreateStage, useDeleteStage } from "@/hooks/useStages";
import { Settings2, Trash2, Plus } from "lucide-react";

export const StageManagerDialog = () => {
  const { data: stages } = useStages();
  const createStage = useCreateStage();
  const deleteStage = useDeleteStage();
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");

  const handleAdd = () => {
    if (!label.trim() || !key.trim()) return;
    const nextOrder = (stages?.length ?? 0);
    createStage.mutate(
      { key: key.trim().toLowerCase(), label: label.trim(), sort_order: nextOrder },
      { onSuccess: () => { setLabel(""); setKey(""); } }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Aşamalar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Aşama Yönetimi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stages?.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${stage.color})` }}
                  />
                  <span className="text-sm font-medium text-foreground">{stage.label}</span>
                  <span className="text-xs text-muted-foreground">({stage.key})</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteStage.mutate(stage.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <Label className="text-sm font-semibold">Yeni Aşama Ekle</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Anahtar (ör: review)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <Input
                placeholder="Etiket (ör: İnceleme)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} className="w-full gap-2" disabled={createStage.isPending}>
              <Plus className="h-4 w-4" />
              Aşama Ekle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
