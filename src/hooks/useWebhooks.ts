import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WEBHOOK_EVENTS = [
  { key: "request.created", label: "Talep oluşturuldu" },
  { key: "request.updated", label: "Talep güncellendi" },
  { key: "request.deleted", label: "Talep silindi" },
  { key: "request.stage_changed", label: "Aşama değişti" },
  { key: "comment.created", label: "Yorum eklendi" },
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]["key"];

export const useWebhooks = (boardId: string | null) => {
  return useQuery({
    queryKey: ["webhooks", boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("board_id", boardId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!boardId,
  });
};

export const useCreateWebhook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (wh: { board_id: string; url: string; secret?: string; events: string[]; created_by: string }) => {
      const { data, error } = await supabase.from("webhooks").insert(wh).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["webhooks", vars.board_id] });
      toast.success("Webhook eklendi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateWebhook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, board_id, ...updates }: { id: string; board_id: string; url?: string; secret?: string; events?: string[]; is_active?: boolean }) => {
      const { error } = await supabase.from("webhooks").update(updates).eq("id", id);
      if (error) throw error;
      return board_id;
    },
    onSuccess: (boardId) => {
      qc.invalidateQueries({ queryKey: ["webhooks", boardId] });
      toast.success("Webhook güncellendi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteWebhook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, board_id }: { id: string; board_id: string }) => {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
      return board_id;
    },
    onSuccess: (boardId) => {
      qc.invalidateQueries({ queryKey: ["webhooks", boardId] });
      toast.success("Webhook silindi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const dispatchWebhook = async (event: string, boardId: string, data: Record<string, any>) => {
  try {
    await supabase.functions.invoke("webhook-dispatch", {
      body: { event, board_id: boardId, data },
    });
  } catch (err) {
    console.error("Webhook dispatch failed:", err);
  }
};
