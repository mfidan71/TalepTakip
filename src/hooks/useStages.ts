import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Stage = {
  id: string;
  key: string;
  label: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export const useStages = () => {
  return useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Stage[];
    },
  });
};

export const useCreateStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stage: { key: string; label: string; color?: string; sort_order: number }) => {
      const { data, error } = await supabase.from("stages").insert(stage).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stages"] });
      toast.success("Aşama eklendi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stages"] });
      toast.success("Aşama silindi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
