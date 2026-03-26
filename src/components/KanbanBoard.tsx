import { useRequests, useUpdateRequest } from "@/hooks/useRequests";
import { useStages } from "@/hooks/useStages";
import { RequestCard } from "@/components/RequestCard";
import { Skeleton } from "@/components/ui/skeleton";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export const KanbanBoard = () => {
  const { data: requests, isLoading: loadingReqs } = useRequests();
  const { data: stages, isLoading: loadingStages } = useStages();
  const updateReq = useUpdateRequest();

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

  const cols = stages?.length ?? 6;

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
                  <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {stageRequests.length}
                  </span>
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
        </div>
      </div>
    </DragDropContext>
  );
};
