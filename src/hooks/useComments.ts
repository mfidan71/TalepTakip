import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { dispatchWebhook } from "@/hooks/useWebhooks";

export const useComments = (requestId: string) => {
  return useQuery({
    queryKey: ["request_comments", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_comments")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ request_id, user_id, content, board_id, request_title }: { request_id: string; user_id: string; content: string; board_id?: string | null; request_title?: string }) => {
      const { data, error } = await supabase
        .from("request_comments")
        .insert({ request_id, user_id, content: content.trim() })
        .select()
        .single();
      if (error) throw error;
      return { ...data, board_id, request_title };
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["request_comments", vars.request_id] });
      if (data.board_id) {
        dispatchWebhook("comment.created", data.board_id, {
          comment_id: data.id,
          request_id: data.request_id,
          request_title: data.request_title ?? "",
          user_id: data.user_id,
          content: data.content,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, requestId }: { id: string; requestId: string }) => {
      const { error } = await supabase.from("request_comments").delete().eq("id", id);
      if (error) throw error;
      return requestId;
    },
    onSuccess: (requestId) => {
      qc.invalidateQueries({ queryKey: ["request_comments", requestId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
