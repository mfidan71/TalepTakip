import { useState } from "react";
import { useRequests, useUpdateRequest } from "@/hooks/useRequests";
import { useStages, useCreateStage, useDeleteStage } from "@/hooks/useStages";
import { RequestCard } from "@/components/RequestCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Minus } from "lucide-react";

export const KanbanBoard = () => {
  const { data: requests, isLoading: loadingReqs } = useRequests();
  const { data: stages, isLoading: loadingStages } = useStages();
  const updateReq = useUpdateRequest();
  const createStage = useCreateStage();
  const deleteStage = useDeleteStage();
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const handleAddStage = () => {
    if (!newKey.trim() || !newLabel.trim()) return;
    createStage.mutate(
      { key: newKey.trim().toLowerCase(), label: newLabel.trim(), sort_order: stages?.length ?? 0 },
      { onSuccess: () => { setNewKey(""); setNewLabel(""); setAddOpen(false); } }
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStage = destination.droppableId;
    const request = requests?.find((r) => r.id === draggableId);
    if (!request || request.stage === newStage) return;
    updateReq.mutate({ id: draggableId, stage: newStage });
  };

  if (loadingReqs || loadingStages) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const cols = (stages?.length ?? 6) + 1;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 overflow-x-auto">
        <div
          className="grid gap-4 p-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(180px, 1fr))`,
            minWidth: cols * 180,
          }}
        >
          {stages?.map((stage) => {
            const stageRequests = requests?.filter((r) => r.stage === stage.key) ?? [];
            return (
              <div key={stage.key} className="flex flex-col min-h-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${stage.color})` }}
                  />
                  <h2 className="font-display text-sm font-semibold text-foreground">{stage.label}</h2>
                  <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {stageRequests.length}
                  </span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Aşamayı Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{stage.label}" aşamasını silmek istediğinize emin misiniz? Bu aşamadaki talepler etkilenebilir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteStage.mutate(stage.id)}>Sil</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <Droppable droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-lg p-1 transition-colors ${snapshot.isDraggingOver ? "bg-accent/50" : ""}`}
                    >
                      <div className="space-y-2">
                        {stageRequests.map((req, index) => (
                          <Draggable key={req.id} draggableId={req.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? "opacity-80" : ""}
                              >
                                <RequestCard request={req} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {stageRequests.length === 0 && !snapshot.isDraggingOver && (
                          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                            <p className="text-xs text-muted-foreground">Talep yok</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          {/* Add stage shortcut */}
          <div className="flex flex-col min-h-[200px]">
            <Popover open={addOpen} onOpenChange={setAddOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-full gap-1 border-dashed text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" />
                  Aşama Ekle
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-3">
                <Input placeholder="Anahtar (ör: review)" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
                <Input placeholder="Etiket (ör: İnceleme)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                <Button onClick={handleAddStage} className="w-full gap-1" size="sm" disabled={createStage.isPending}>
                  <Plus className="h-3.5 w-3.5" /> Ekle
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};
