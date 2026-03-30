import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRequestVotes = () => {
  return useQuery({
    queryKey: ["request_votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("request_votes").select("*");
      if (error) throw error;
      return data;
    },
  });
};

export const useToggleVote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, userId }: { requestId: string; userId: string }) => {
      // Check if vote exists
      const { data: existing } = await supabase
        .from("request_votes")
        .select("id")
        .eq("request_id", requestId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("request_votes").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      } else {
        const { error } = await supabase
          .from("request_votes")
          .insert({ request_id: requestId, user_id: userId });
        if (error) throw error;
        return { action: "added" as const };
      }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["request_votes"] });
      toast.success(result.action === "added" ? "Oy verildi" : "Oy geri alındı");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useVoteHelpers = (requestId: string, userId: string | undefined, votes: any[] | undefined) => {
  const voteCount = votes?.filter((v) => v.request_id === requestId).length ?? 0;
  const hasVoted = votes?.some((v) => v.request_id === requestId && v.user_id === userId) ?? false;
  return { voteCount, hasVoted };
};
