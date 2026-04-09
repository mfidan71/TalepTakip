import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Board = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export const useBoards = () => {
  return useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Board[];
    },
  });
};

export const useCreateBoard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (board: { name: string; description?: string; created_by: string; icon?: string }) => {
      const { data, error } = await supabase.from("boards").insert(board).select().single();
      if (error) throw error;
      return data as Board;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Pano oluşturuldu");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteBoard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("boards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Pano silindi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateBoard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; icon?: string }) => {
      const { error } = await supabase.from("boards").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
