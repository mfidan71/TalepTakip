import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BoardStats = {
  board_id: string;
  request_count: number;
  last_updated: string | null;
  recent_user_ids: string[];
};

export const useBoardStats = () => {
  return useQuery({
    queryKey: ["board-stats"],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from("requests")
        .select("board_id, updated_at, created_by, assigned_to")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const statsMap = new Map<string, BoardStats>();

      for (const req of requests ?? []) {
        if (!req.board_id) continue;
        let stat = statsMap.get(req.board_id);
        if (!stat) {
          stat = { board_id: req.board_id, request_count: 0, last_updated: null, recent_user_ids: [] };
          statsMap.set(req.board_id, stat);
        }
        stat.request_count++;
        if (!stat.last_updated || req.updated_at > stat.last_updated) {
          stat.last_updated = req.updated_at;
        }
        // Collect unique user ids (created_by + assigned_to)
        if (req.created_by && !stat.recent_user_ids.includes(req.created_by)) {
          stat.recent_user_ids.push(req.created_by);
        }
        if (req.assigned_to && !stat.recent_user_ids.includes(req.assigned_to)) {
          stat.recent_user_ids.push(req.assigned_to);
        }
      }

      // Keep only last 5 users per board
      statsMap.forEach((stat) => {
        stat.recent_user_ids = stat.recent_user_ids.slice(0, 5);
      });

      return statsMap;
    },
  });
};
