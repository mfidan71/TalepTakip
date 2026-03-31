import { useState } from "react";
import { useBoards, useCreateBoard, useDeleteBoard } from "@/hooks/useBoards";
import { useActiveBoard } from "@/contexts/BoardContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, LayoutDashboard, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const BoardSelector = () => {
  const { data: boards, isLoading } = useBoards();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const { activeBoardId, setActiveBoardId } = useActiveBoard();
  const { user } = useAuth();
  const [newName, setNewName] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Auto-select the first board if none is selected
  useEffect(() => {
    if (!activeBoardId && boards && boards.length > 0) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId, setActiveBoardId]);

  const handleCreate = () => {
    if (!newName.trim() || !user) return;
    createBoard.mutate(
      { name: newName.trim(), created_by: user.id },
      {
        onSuccess: (data) => {
          setNewName("");
          setAddOpen(false);
          setActiveBoardId(data.id);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteBoard.mutate(id, {
      onSuccess: () => {
        if (activeBoardId === id) {
          const remaining = boards?.filter((b) => b.id !== id);
          setActiveBoardId(remaining?.[0]?.id ?? null);
        }
      },
    });
  };

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-card overflow-x-auto">
      <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
      {boards?.map((board) => (
        <div key={board.id} className="flex items-center gap-0.5 group/board shrink-0">
          <Button
            variant={activeBoardId === board.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs font-medium",
              activeBoardId === board.id && "shadow-sm"
            )}
            onClick={() => setActiveBoardId(board.id)}
          >
            {board.name}
          </Button>
          {user?.id === board.created_by && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover/board:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Panoyu Sil</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{board.name}" panosunu ve içindeki tüm aşamaları/talepleri silmek istediğinize emin misiniz?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(board.id)}>Sil</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ))}
      <Popover open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 border-dashed text-xs text-muted-foreground shrink-0">
            <Plus className="h-3 w-3" />
            Yeni Pano
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 space-y-2">
          <Input
            placeholder="Pano adı"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} className="w-full gap-1" size="sm" disabled={createBoard.isPending}>
            <Plus className="h-3 w-3" /> Oluştur
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
