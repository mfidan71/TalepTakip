import { useState } from "react";
import { Request, useUpdateRequest, useDeleteRequest, useProfiles } from "@/hooks/useRequests";
import { useStages } from "@/hooks/useStages";
import { useActiveBoard } from "@/contexts/BoardContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRequestVotes, useToggleVote, useVoteHelpers } from "@/hooks/useVotes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryConfig } from "@/lib/categories";

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
  const { activeBoardId } = useActiveBoard();
  const { data: stages } = useStages(activeBoardId);
  const { data: votes } = useRequestVotes();
  const toggleVote = useToggleVote();
  const { voteCount, hasVoted } = useVoteHelpers(request.id, user?.id, votes);

  const stageIndex = stages?.findIndex((s) => s.key === request.stage) ?? -1;
  const canMoveForward = stages ? stageIndex < stages.length - 1 : false;
  const canMoveBack = stageIndex > 0;
  const isCreator = user?.id === request.created_by;

  const creatorProfile = profiles?.find((p) => p.user_id === request.created_by);
  const assignedProfile = profiles?.find((p) => p.user_id === request.assigned_to);
  const prio = priorityConfig[request.priority] ?? priorityConfig[3];
  const PrioIcon = prio.icon;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const moveStage = (dir: 1 | -1) => {
    const newStage = stages?.[stageIndex + dir]?.key;
    if (newStage) {
      updateReq.mutate({ id: request.id, stage: newStage });
    }
  };

  return (
    <>
      <Card
        className="group border-border hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
        onClick={() => setDetailOpen(true)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Top: user avatar + name + priority icon */}
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted shrink-0">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground truncate">{creatorProfile?.full_name ?? "?"}</span>
            <div className={`ml-auto shrink-0 flex items-center gap-0.5 ${prio.className}`} title={prio.label}>
              <PrioIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-foreground leading-tight">{request.title}</h3>

          {request.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1">
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

          {/* Bottom: action buttons with tooltips */}
          <div className="flex items-center pt-1.5 border-t border-border gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-6 w-6 ${hasVoted ? "text-primary" : "text-muted-foreground"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user) toggleVote.mutate({ requestId: request.id, userId: user.id });
                  }}
                >
                  <ThumbsUp className="h-3 w-3" fill={hasVoted ? "currentColor" : "none"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Oy Ver</TooltipContent>
            </Tooltip>
            {voteCount > 0 && (
              <span className={`text-[10px] font-semibold ${hasVoted ? "text-primary" : "text-muted-foreground"}`}>
                {voteCount}
              </span>
            )}
            <div className="flex items-center gap-0.5 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Düzenle</TooltipContent>
              </Tooltip>
              {canMoveBack && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); moveStage(-1); }}>
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Geri Taşı</TooltipContent>
                </Tooltip>
              )}
              {canMoveForward && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); moveStage(1); }}>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>İleri Taşı</TooltipContent>
                </Tooltip>
              )}
              {isCreator && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={(e) => { e.stopPropagation(); deleteReq.mutate(request.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sil</TooltipContent>
                </Tooltip>
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
