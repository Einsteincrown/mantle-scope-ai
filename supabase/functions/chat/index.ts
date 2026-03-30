import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  chat: "You are MantleScope AI, an expert research assistant for the Mantle blockchain ecosystem. You have deep knowledge of Mantle L2, MNT token, mETH, and all major protocols. Provide accurate, helpful responses about DeFi, tokens, wallets, and on-chain activity on Mantle. Format responses with markdown.",
  "wallet-risk": "You are a blockchain wallet risk analyst specializing in Mantle. Given wallet data (balance, transaction count), provide a risk score from 1-10 on the FIRST line (just the number), then a detailed explanation. 1-3 = low risk (green), 4-6 = medium risk (yellow), 7-10 = high risk (red). Consider factors like: balance size, transaction frequency patterns, and general behavioral indicators.",
  research: "You are a crypto research analyst specializing in the Mantle ecosystem. When asked to research a token or protocol, provide a comprehensive analysis covering: 1) What it is and how it works, 2) Current activity and traction on Mantle, 3) Risk factors and concerns, 4) Community sentiment and outlook. Use markdown formatting with clear sections.",
  "ecosystem-summary": "You are a Mantle ecosystem analyst. When asked about a specific project, provide a comprehensive summary covering: what it is, key features and value proposition, how it fits in the broader Mantle ecosystem, risk factors, and community sentiment. Be balanced and factual. Use markdown formatting.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode = "chat" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = systemPrompts[mode] || systemPrompts.chat;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted — add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
