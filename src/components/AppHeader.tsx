import { CreateRequestDialog } from "@/components/CreateRequestDialog";
import { StageManagerDialog } from "@/components/StageManagerDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useRequests";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { data: profiles } = useProfiles();
  const navigate = useNavigate();

  const profile = profiles?.find((p) => p.user_id === user?.id);
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">Talep Yönetimi</h1>
            <p className="text-xs text-muted-foreground">Toplama · Puanlama · Geliştirme Süreci</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StageManagerDialog />
          <CreateRequestDialog />
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
                  <Avatar className="h-7 w-7 text-[10px]">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Profil" />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
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
      </div>
    </header>
  );
};
