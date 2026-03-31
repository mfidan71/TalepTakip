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
  board_id: string | null;
};

export const useStages = (boardId?: string | null) => {
  return useQuery({
    queryKey: ["stages", boardId],
    queryFn: async () => {
      let query = supabase
        .from("stages")
        .select("*")
        .order("sort_order", { ascending: true });
      if (boardId) {
        query = query.eq("board_id", boardId);
      } else {
        query = query.is("board_id", null);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Stage[];
    },
    enabled: boardId !== undefined,
  });
};

export const useCreateStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stage: { key: string; label: string; color?: string; sort_order: number; board_id?: string }) => {
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

export const useReorderStages = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: { id: string; sort_order: number }[]) => {
      const promises = orderedIds.map(({ id, sort_order }) =>
        supabase.from("stages").update({ sort_order }).eq("id", id)
      );
      const results = await Promise.all(promises);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onMutate: async (orderedIds) => {
      await qc.cancelQueries({ queryKey: ["stages"] });
      const allQueries = qc.getQueriesData<Stage[]>({ queryKey: ["stages"] });
      allQueries.forEach(([key, data]) => {
        if (data) {
          const orderMap = new Map(orderedIds.map((o) => [o.id, o.sort_order]));
          const updated = data
            .map((s) => ({ ...s, sort_order: orderMap.get(s.id) ?? s.sort_order }))
            .sort((a, b) => a.sort_order - b.sort_order);
          qc.setQueryData(key, updated);
        }
      });
      return { allQueries };
    },
    onError: (e: Error, _vars, context) => {
      context?.allQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data);
      });
      toast.error(e.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["stages"] });
    },
  });
};
