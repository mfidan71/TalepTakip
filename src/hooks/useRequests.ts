import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Request = Tables<"requests">;

export const useRequests = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
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
    mutationFn: async (req: { title: string; description?: string; category?: string; priority: number; created_by: string }) => {
      const { data, error } = await supabase.from("requests").insert(req).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Talep oluşturuldu");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Request> & { id: string }) => {
      const { error } = await supabase.from("requests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Talep silindi");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
