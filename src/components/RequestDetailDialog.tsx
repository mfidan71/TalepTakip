import { Request, useProfiles } from "@/hooks/useRequests";
import { useStages } from "@/hooks/useStages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  ArrowDown,
  ArrowDownRight,
  Minus,
  ArrowUpRight,
  Flame,
  Layers,
} from "lucide-react";
import { getCategoryConfig } from "@/lib/categories";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const priorityConfig: Record<number, { label: string; icon: React.ElementType; className: string }> = {
  1: { label: "Çok Düşük", icon: ArrowDown, className: "text-priority-1" },
  2: { label: "Düşük", icon: ArrowDownRight, className: "text-priority-2" },
  3: { label: "Orta", icon: Minus, className: "text-priority-3" },
  4: { label: "Yüksek", icon: ArrowUpRight, className: "text-priority-4" },
  5: { label: "Kritik", icon: Flame, className: "text-priority-5" },
};

interface Props {
  request: Request;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestDetailDialog = ({ request, open, onOpenChange }: Props) => {
  const { data: profiles } = useProfiles();
  const { data: stages } = useStages();

  const creatorProfile = profiles?.find((p) => p.user_id === request.created_by);
  const assigneeProfile = profiles?.find((p) => p.user_id === request.assigned_to);
  const stage = stages?.find((s) => s.key === request.stage);
  const prio = priorityConfig[request.priority] ?? priorityConfig[3];
  const PrioIcon = prio.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg leading-snug pr-6">
            {request.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mt-1">
          {stage && (
            <Badge variant="secondary" className="gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `hsl(${stage.color})` }}
              />
              {stage.label}
            </Badge>
          )}
          <Badge variant="outline" className={`gap-1 ${prio.className}`}>
            <PrioIcon className="h-3.5 w-3.5" />
            {prio.label}
          </Badge>
          {request.category && (() => {
            const catConf = getCategoryConfig(request.category);
            const CatIcon = catConf.icon;
            return (
              <Badge variant="outline" className={`gap-1 ${catConf.bgClassName}`}>
                <CatIcon className="h-3.5 w-3.5" />
                {request.category}
              </Badge>
            );
          })()}
        </div>

        <Separator />

        {request.description ? (
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Açıklama
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {request.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Açıklama eklenmemiş.</p>
        )}

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Oluşturan
            </span>
            <p className="font-medium text-foreground">{creatorProfile?.full_name ?? "Bilinmiyor"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Atanan
            </span>
            <p className="font-medium text-foreground">{assigneeProfile?.full_name ?? "Atanmamış"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Oluşturulma
            </span>
            <p className="font-medium text-foreground">
              {format(new Date(request.created_at), "d MMM yyyy, HH:mm", { locale: tr })}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Güncellenme
            </span>
            <p className="font-medium text-foreground">
              {format(new Date(request.updated_at), "d MMM yyyy, HH:mm", { locale: tr })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
