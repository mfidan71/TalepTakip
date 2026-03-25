import { useRequests } from "@/hooks/useRequests";
import { RequestCard } from "@/components/RequestCard";
import { STAGES } from "@/lib/stages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const stageColorMap: Record<string, string> = {
  talep: "bg-stage-talep",
  degerlendirme: "bg-stage-degerlendirme",
  planlama: "bg-stage-planlama",
  gelistirme: "bg-stage-gelistirme",
  test: "bg-stage-test",
  canli: "bg-stage-canli",
};

export const KanbanBoard = () => {
  const { data: requests, isLoading } = useRequests();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
        {STAGES.map((s) => (
          <div key={s.key} className="space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 min-w-[900px]">
        {STAGES.map((stage) => {
          const stageRequests = requests?.filter((r) => r.stage === stage.key) ?? [];
          return (
            <div key={stage.key} className="flex flex-col min-h-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2.5 w-2.5 rounded-full ${stageColorMap[stage.key]}`} />
                <h2 className="font-display text-sm font-semibold text-foreground">{stage.label}</h2>
                <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {stageRequests.length}
                </span>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-1">
                  {stageRequests.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                  {stageRequests.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                      <p className="text-xs text-muted-foreground">Talep yok</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
};
