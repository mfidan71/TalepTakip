import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { event, board_id, data } = await req.json();

    if (!event || !board_id) {
      return new Response(JSON.stringify({ error: "event and board_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: webhooks, error } = await supabaseAdmin
      .from("webhooks")
      .select("*")
      .eq("board_id", board_id)
      .eq("is_active", true)
      .contains("events", [event]);

    if (error) {
      console.error("Failed to fetch webhooks:", error);
      return new Response(JSON.stringify({ error: "db error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(JSON.stringify({ dispatched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({ event, timestamp, board_id, data });

    const results = await Promise.allSettled(
      webhooks.map(async (wh: any) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Webhook-Event": event,
        };

        if (wh.secret) {
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(wh.secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
          const hex = Array.from(new Uint8Array(signature))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          headers["X-Webhook-Signature"] = `sha256=${hex}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const res = await fetch(wh.url, {
            method: "POST",
            headers,
            body: payload,
            signal: controller.signal,
          });
          console.log(`Webhook ${wh.id} -> ${wh.url}: ${res.status}`);
          return { id: wh.id, status: res.status };
        } finally {
          clearTimeout(timeout);
        }
      })
    );

    const dispatched = results.filter((r) => r.status === "fulfilled").length;
    return new Response(JSON.stringify({ dispatched, total: webhooks.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("webhook-dispatch error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
