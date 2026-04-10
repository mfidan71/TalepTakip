import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { dispatchWebhook } from "@/hooks/useWebhooks";

export type Request = Tables<"requests">;

export const useRequests = (boardId?: string | null) => {
  return useQuery({
    queryKey: ["requests", boardId],
    queryFn: async () => {
      let query = supabase
        .from("requests")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (boardId) {
        query = query.eq("board_id", boardId);
      } else {
        query = query.is("board_id", null);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: boardId !== undefined,
  });
};

export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: { title: string; description?: string; category?: string; priority: number; created_by: string; board_id?: string; stage?: string; assigned_to?: string }) => {
      const { data, error } = await supabase.from("requests").insert(req).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Talep oluşturuldu");
      if (data.board_id) {
        dispatchWebhook("request.created", data.board_id, data);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Request> & { id: string }) => {
      // Get previous state for stage_changed detection
      const allQueries = qc.getQueriesData<Request[]>({ queryKey: ["requests"] });
      let previousRequest: Request | undefined;
      allQueries.forEach(([, data]) => {
        const found = data?.find((r) => r.id === id);
        if (found) previousRequest = found;
      });
      const { error } = await supabase.from("requests").update(updates).eq("id", id);
      if (error) throw error;
      return { id, updates, previousRequest };
    },
    onMutate: async ({ id, ...updates }) => {
      await qc.cancelQueries({ queryKey: ["requests"] });
      const allQueries = qc.getQueriesData<Request[]>({ queryKey: ["requests"] });
      allQueries.forEach(([key, data]) => {
        if (data) {
          qc.setQueryData<Request[]>(key, data.map((r) => (r.id === id ? { ...r, ...updates } : r)));
        }
      });
      return { allQueries };
    },
    onSuccess: (result) => {
      const { updates, previousRequest } = result;
      if (previousRequest?.board_id) {
        const boardId = previousRequest.board_id;
        const merged = { ...previousRequest, ...updates };
        if (updates.stage && updates.stage !== previousRequest.stage) {
          dispatchWebhook("request.stage_changed", boardId, {
            ...merged,
            previous_stage: previousRequest.stage,
          });
        } else {
          dispatchWebhook("request.updated", boardId, merged);
        }
      }
    },
    onError: (e: Error, _vars, context) => {
      context?.allQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data);
      });
      toast.error(e.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
};

export const useDeleteRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, board_id }: { id: string; board_id?: string | null }) => {
      const { error } = await supabase.from("requests").delete().eq("id", id);
      if (error) throw error;
      return { id, board_id };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Talep silindi");
      if (result.board_id) {
        dispatchWebhook("request.deleted", result.board_id, { id: result.id });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
