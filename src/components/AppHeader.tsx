import { CreateRequestDialog } from "@/components/CreateRequestDialog";
import { StageManagerDialog } from "@/components/StageManagerDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useRequests";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ClipboardList, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AppHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <ClipboardList className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">Talep Yönetimi</h1>
            <p className="text-xs text-muted-foreground">Toplama · Puanlama · Geliştirme Süreci</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StageManagerDialog />
          <CreateRequestDialog />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
