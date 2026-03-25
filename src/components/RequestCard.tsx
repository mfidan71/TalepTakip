import { Request, useUpdateRequest, useDeleteRequest, useProfiles } from "@/hooks/useRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STAGES, getStageLabel } from "@/lib/stages";
import { ChevronRight, ChevronLeft, Trash2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const priorityLabels: Record<number, string> = {
  1: "Çok Düşük",
  2: "Düşük",
  3: "Orta",
  4: "Yüksek",
  5: "Kritik",
};

const priorityColors: Record<number, string> = {
  1: "bg-priority-1",
  2: "bg-priority-2",
  3: "bg-priority-3",
  4: "bg-priority-4",
  5: "bg-priority-5",
};

export const RequestCard = ({ request }: { request: Request }) => {
  const updateReq = useUpdateRequest();
  const deleteReq = useDeleteRequest();
  const { user } = useAuth();
  const { data: profiles } = useProfiles();

  const stageIndex = STAGES.findIndex((s) => s.key === request.stage);
  const canMoveForward = stageIndex < STAGES.length - 1;
  const canMoveBack = stageIndex > 0;
  const isCreator = user?.id === request.created_by;

  const creatorProfile = profiles?.find((p) => p.user_id === request.created_by);

  const moveStage = (dir: 1 | -1) => {
    const newStage = STAGES[stageIndex + dir]?.key;
    if (newStage) {
      updateReq.mutate({ id: request.id, stage: newStage });
    }
  };

  return (
    <Card className="group border-border hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight">{request.title}</h3>
          <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground ${priorityColors[request.priority]}`}>
            {request.priority}
          </span>
        </div>

        {request.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {request.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {request.category}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {priorityLabels[request.priority]}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{creatorProfile?.full_name ?? "?"}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canMoveBack && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStage(-1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
            )}
            {canMoveForward && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStage(1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
            {isCreator && (
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteReq.mutate(request.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
