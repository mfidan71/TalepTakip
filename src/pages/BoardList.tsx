import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards, useCreateBoard, useDeleteBoard, useUpdateBoard } from "@/hooks/useBoards";
import { useBoardStats } from "@/hooks/useBoardStats";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, LogOut, ClipboardList, FileText, Clock } from "lucide-react";
import { BoardIconPicker, DynamicBoardIcon } from "@/components/BoardIconPicker";
import type { BoardIconName } from "@/lib/boardIcons";

const BoardList = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profiles } = useProfiles();
  const { data: boards, isLoading } = useBoards();
  const { data: statsMap } = useBoardStats();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const updateBoard = useUpdateBoard();

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<BoardIconName>("clipboard-list");
  const [createOpen, setCreateOpen] = useState(false);

  const profile = profiles?.find((p) => p.user_id === user?.id);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleCreate = () => {
    if (!newName.trim() || !user) return;
    createBoard.mutate(
      { name: newName.trim(), created_by: user.id, icon: newIcon },
      { onSuccess: () => { setNewName(""); setNewIcon("clipboard-list"); setCreateOpen(false); } }
    );
  };

  const handleDelete = (id: string) => deleteBoard.mutate(id);
  const handleIconChange = (boardId: string, icon: BoardIconName) => updateBoard.mutate({ id: boardId, icon });

  const formatRelativeDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa önce`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}g önce`;
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">Talep Yönetimi</h1>
              <p className="text-xs text-muted-foreground">Panolarınız</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
                  <Avatar className="h-7 w-7 text-[10px]">
                    {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Profil" /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-muted-foreground">{profile?.full_name ?? user?.email}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Profil Ayarları</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Board grid */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Panolar</h2>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Yeni Pano
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Pano Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="Pano adı"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">İkon Seçin</p>
                    <BoardIconPicker value={newIcon} onChange={setNewIcon} />
                  </div>
                  <Button onClick={handleCreate} className="w-full gap-1" disabled={createBoard.isPending || !newName.trim()}>
                    <Plus className="h-4 w-4" /> Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : boards && boards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {boards.map((board) => (
                <Card
                  key={board.id}
                  className="group relative cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200"
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 pt-8 pb-6 min-h-[176px]">
                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-4">
                      <DynamicBoardIcon name={(board as any).icon || "clipboard-list"} className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-foreground text-center text-base">{board.name}</h3>
                    {board.description && (
                      <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">{board.description}</p>
                    )}
                  </CardContent>
                  {user?.id === board.created_by && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <BoardIconPicker
                        value={(board as any).icon || "clipboard-list"}
                        onChange={(icon) => handleIconChange(board.id, icon)}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            <DynamicBoardIcon name={(board as any).icon || "clipboard-list"} className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Panoyu Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{board.name}" panosunu silmek istediğinize emin misiniz?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(board.id)}>Sil</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-4">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Henüz pano yok. İlk panonuzu oluşturun!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BoardList;
