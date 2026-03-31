import { AppHeader } from "@/components/AppHeader";
import { BoardSelector } from "@/components/BoardSelector";
import { KanbanBoard } from "@/components/KanbanBoard";
import { BoardProvider } from "@/contexts/BoardContext";

const Dashboard = () => {
  return (
    <BoardProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <BoardSelector />
        <KanbanBoard />
      </div>
    </BoardProvider>
  );
};

export default Dashboard;
