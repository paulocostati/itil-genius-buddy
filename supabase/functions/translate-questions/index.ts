const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { questionIds, targetLang } = await req.json();

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return new Response(JSON.stringify({ error: "questionIds required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["pt-BR", "en"].includes(targetLang)) {
      return new Response(JSON.stringify({ error: "targetLang must be 'pt-BR' or 'en'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch questions
    const { data: questions, error: qError } = await adminClient
      .from("questions")
      .select("id, statement, option_a, option_b, option_c, option_d, option_e, explanation")
      .in("id", questionIds);

    if (qError || !questions || questions.length === 0) {
      return new Response(JSON.stringify({ error: "Questions not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process in batches of 20
    const batchSize = 20;
    let translated = 0;
    const langLabel = targetLang === "pt-BR" ? "Português Brasileiro" : "English";

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);

      const prompt = `Translate the following exam questions to ${langLabel}. 
Return a JSON array where each object has: id, statement, option_a, option_b, option_c, option_d, option_e, explanation.
Keep the id unchanged. Translate all text fields accurately. For empty strings or null values, keep them as-is.
Return ONLY the JSON array.

Questions:
${JSON.stringify(batch)}`;

      const aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "user", content: prompt },
            ],
          }),
        }
      );

      if (!aiResponse.ok) {
        console.error("AI error:", aiResponse.status);
        return new Response(
          JSON.stringify({ error: `Translation failed at batch ${i / batchSize + 1}`, translated }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";

      let translatedBatch: any[];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array");
        translatedBatch = JSON.parse(jsonMatch[0]);
      } catch {
        console.error("Parse error for batch", i / batchSize + 1);
        continue;
      }

      // Update each question in DB
      for (const tq of translatedBatch) {
        if (targetLang === "pt-BR") {
          const updateData: any = {};
          if (tq.statement) updateData.statement_pt = tq.statement;
          if (tq.option_a) updateData.option_a_pt = tq.option_a;
          if (tq.option_b) updateData.option_b_pt = tq.option_b;
          if (tq.option_c !== undefined) updateData.option_c_pt = tq.option_c;
          if (tq.option_d !== undefined) updateData.option_d_pt = tq.option_d;
          if (tq.option_e !== undefined) updateData.option_e_pt = tq.option_e;
          if (tq.explanation !== undefined) updateData.explanation_pt = tq.explanation;

          if (Object.keys(updateData).length > 0) {
            await adminClient.from("questions").update(updateData).eq("id", tq.id);
          }
        } else {
          // If translating to English, the original columns ARE English
          // So we overwrite the main columns (original behavior)
          const updateData: any = {};
          if (tq.statement) updateData.statement = tq.statement;
          if (tq.option_a) updateData.option_a = tq.option_a;
          if (tq.option_b) updateData.option_b = tq.option_b;
          if (tq.option_c !== undefined) updateData.option_c = tq.option_c;
          if (tq.option_d !== undefined) updateData.option_d = tq.option_d;
          if (tq.option_e !== undefined) updateData.option_e = tq.option_e;
          if (tq.explanation !== undefined) updateData.explanation = tq.explanation;

          if (Object.keys(updateData).length > 0) {
            await adminClient.from("questions").update(updateData).eq("id", tq.id);
          }
        }
      }

      translated += translatedBatch.length;
    }

    console.log(`Translated ${translated} questions to ${targetLang}`);

    return new Response(
      JSON.stringify({ success: true, translated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("translate-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
