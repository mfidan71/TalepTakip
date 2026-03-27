import { useState } from "react";
import { Request, useUpdateRequest, useDeleteRequest, useProfiles } from "@/hooks/useRequests";
import { useStages } from "@/hooks/useStages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditRequestDialog } from "@/components/EditRequestDialog";
import { RequestDetailDialog } from "@/components/RequestDetailDialog";
import {
  ChevronRight,
  ChevronLeft,
  Trash2,
  User,
  Pencil,
  ArrowDown,
  ArrowDownRight,
  Minus,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const priorityConfig: Record<number, { label: string; icon: React.ElementType; className: string }> = {
  1: { label: "Çok Düşük", icon: ArrowDown, className: "text-priority-1" },
  2: { label: "Düşük", icon: ArrowDownRight, className: "text-priority-2" },
  3: { label: "Orta", icon: Minus, className: "text-priority-3" },
  4: { label: "Yüksek", icon: ArrowUpRight, className: "text-priority-4" },
  5: { label: "Kritik", icon: Flame, className: "text-priority-5" },
};

export const RequestCard = ({ request }: { request: Request }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const updateReq = useUpdateRequest();
  const deleteReq = useDeleteRequest();
  const { user } = useAuth();
  const { data: profiles } = useProfiles();
  const { data: stages } = useStages();

  const stageIndex = stages?.findIndex((s) => s.key === request.stage) ?? -1;
  const canMoveForward = stages ? stageIndex < stages.length - 1 : false;
  const canMoveBack = stageIndex > 0;
  const isCreator = user?.id === request.created_by;

  const creatorProfile = profiles?.find((p) => p.user_id === request.created_by);
  const prio = priorityConfig[request.priority] ?? priorityConfig[3];
  const PrioIcon = prio.icon;

  const moveStage = (dir: 1 | -1) => {
    const newStage = stages?.[stageIndex + dir]?.key;
    if (newStage) {
      updateReq.mutate({ id: request.id, stage: newStage });
    }
  };

  return (
    <>
      <Card
        className="group border-border hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground leading-tight">{request.title}</h3>
            <div className={`shrink-0 flex items-center gap-1 ${prio.className}`} title={prio.label}>
              <PrioIcon className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </div>

          {request.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {request.category && (() => {
              const catConf = getCategoryConfig(request.category);
              const CatIcon = catConf.icon;
              return (
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${catConf.bgClassName}`}>
                  <CatIcon className="h-3 w-3" />
                  {request.category}
                </Badge>
              );
            })()}
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${prio.className}`}>
              <PrioIcon className="h-3 w-3 mr-0.5" />
              {prio.label}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{creatorProfile?.full_name ?? "?"}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
              {canMoveBack && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveStage(-1); }}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              )}
              {canMoveForward && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveStage(1); }}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
              {isCreator && (
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteReq.mutate(request.id); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <RequestDetailDialog request={request} open={detailOpen} onOpenChange={setDetailOpen} />
      <EditRequestDialog request={request} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
};
