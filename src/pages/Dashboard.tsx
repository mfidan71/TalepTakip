import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { BoardProvider } from "@/contexts/BoardContext";

const DashboardInner = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <KanbanBoard />
    </div>
  );
};

const Dashboard = () => {
  const { boardId } = useParams<{ boardId: string }>();

  return (
    <BoardProvider initialBoardId={boardId || null}>
      <DashboardInner />
    </BoardProvider>
  );
};

export default Dashboard;
