import { AppHeader } from "@/components/AppHeader";
import { KanbanBoard } from "@/components/KanbanBoard";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <KanbanBoard />
    </div>
  );
};

export default Dashboard;
