import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Globe } from "lucide-react";
import { useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook, WEBHOOK_EVENTS } from "@/hooks/useWebhooks";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WebhookManagerDialog({ boardId, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { data: webhooks = [], isLoading } = useWebhooks(boardId);
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();

  const [newUrl, setNewUrl] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);

  const toggleEvent = (key: string) => {
    setNewEvents((prev) => (prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]));
  };

  const handleAdd = () => {
    if (!newUrl || newEvents.length === 0 || !user) return;
    createWebhook.mutate({
      board_id: boardId,
      url: newUrl,
      secret: newSecret || undefined,
      events: newEvents,
      created_by: user.id,
    });
    setNewUrl("");
    setNewSecret("");
    setNewEvents([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Webhook Yönetimi
          </DialogTitle>
          <DialogDescription>
            Dış sistemlere otomatik bildirim göndermek için webhook URL'leri ekleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor...</p>}
          {webhooks.map((wh) => (
            <div key={wh.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono truncate flex-1">{wh.url}</span>
                <Switch
                  checked={wh.is_active}
                  onCheckedChange={(checked) =>
                    updateWebhook.mutate({ id: wh.id, board_id: boardId, is_active: checked })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteWebhook.mutate({ id: wh.id, board_id: boardId })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(wh.events as string[]).map((ev) => {
                  const label = WEBHOOK_EVENTS.find((e) => e.key === ev)?.label ?? ev;
                  return (
                    <span key={ev} className="text-xs bg-muted px-2 py-0.5 rounded">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-medium">Yeni Webhook Ekle</h4>
          <div className="space-y-2">
            <Label htmlFor="wh-url">URL</Label>
            <Input
              id="wh-url"
              placeholder="https://example.com/webhook"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-secret">Secret (opsiyonel)</Label>
            <Input
              id="wh-secret"
              placeholder="HMAC imza anahtarı"
              value={newSecret}
              onChange={(e) => setNewSecret(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Olaylar</Label>
            <div className="grid grid-cols-1 gap-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <div key={ev.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`new-${ev.key}`}
                    checked={newEvents.includes(ev.key)}
                    onCheckedChange={() => toggleEvent(ev.key)}
                  />
                  <Label htmlFor={`new-${ev.key}`} className="text-sm font-normal cursor-pointer">
                    {ev.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!newUrl || newEvents.length === 0} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Webhook Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
