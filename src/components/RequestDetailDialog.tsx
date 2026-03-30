import { useState } from "react";
import { Request, useProfiles } from "@/hooks/useRequests";
import { useStages } from "@/hooks/useStages";
import { useRequestVotes, useToggleVote, useVoteHelpers } from "@/hooks/useVotes";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  ArrowDown,
  ArrowDownRight,
  Minus,
  ArrowUpRight,
  Flame,
  Layers,
  ThumbsUp,
  MessageSquare,
  Send,
  Trash2,
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
  const { user } = useAuth();
  const { data: profiles } = useProfiles();
  const { data: stages } = useStages();
  const { data: votes } = useRequestVotes();
  const toggleVote = useToggleVote();
  const { voteCount, hasVoted } = useVoteHelpers(request.id, user?.id, votes);
  const { data: comments } = useComments(request.id);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [commentText, setCommentText] = useState("");

  const creatorProfile = profiles?.find((p) => p.user_id === request.created_by);
  const assigneeProfile = profiles?.find((p) => p.user_id === request.assigned_to);
  const stage = stages?.find((s) => s.key === request.stage);
  const prio = priorityConfig[request.priority] ?? priorityConfig[3];
  const PrioIcon = prio.icon;

  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;
    createComment.mutate(
      { request_id: request.id, user_id: user.id, content: commentText },
      { onSuccess: () => setCommentText("") }
    );
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

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
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${stage.color})` }} />
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

        <Separator />

        <div className="flex items-center gap-3">
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (user) toggleVote.mutate({ requestId: request.id, userId: user.id });
            }}
          >
            <ThumbsUp className="h-4 w-4" fill={hasVoted ? "currentColor" : "none"} />
            {hasVoted ? "Oy Verildi" : "Oy Ver"}
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            {voteCount} oy
          </span>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Yorumlar {comments && comments.length > 0 && `(${comments.length})`}
          </h4>

          {comments && comments.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map((comment) => {
                const profile = profiles?.find((p) => p.user_id === comment.user_id);
                const isOwn = user?.id === comment.user_id;
                return (
                  <div key={comment.id} className="flex gap-2.5 group/comment">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {profile?.full_name ?? "Bilinmiyor"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(comment.created_at), "d MMM, HH:mm", { locale: tr })}
                        </span>
                        {isOwn && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 opacity-0 group-hover/comment:opacity-100 transition-opacity text-destructive"
                            onClick={() => deleteComment.mutate({ id: comment.id, requestId: request.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Henüz yorum yok.</p>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Yorum yaz..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={2000}
              rows={2}
              className="text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              size="icon"
              className="shrink-0 self-end"
              disabled={!commentText.trim() || createComment.isPending}
              onClick={handleSubmitComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
