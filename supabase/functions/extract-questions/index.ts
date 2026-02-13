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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filePath, categoryId } = await req.json();

    // Download the PDF
    const { data: fileData, error: fileError } = await adminClient.storage
      .from("admin-uploads").download(filePath);
    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert PDF to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    console.log(`PDF size: ${bytes.length} bytes`);

    // Fetch topics
    let topicsQuery = adminClient.from("topics").select("id, name, area");
    if (categoryId && categoryId !== "all") {
      topicsQuery = topicsQuery.eq("category_id", categoryId);
    }
    const { data: topics } = await topicsQuery;

    const topicsList = (topics || [])
      .map((t: any) => `- ID: ${t.id} | Nome: ${t.name} | Área: ${t.area}`)
      .join("\n");

    const systemPrompt = `Você é um extrator de questões de exame de certificação a partir de PDFs.
Analise o documento PDF e extraia TODAS as questões encontradas.

Para cada questão, retorne um objeto JSON com estes campos:
- statement: texto completo da pergunta (OBRIGATÓRIO)
- option_a: alternativa A (OBRIGATÓRIO)
- option_b: alternativa B (OBRIGATÓRIO)
- option_c: alternativa C (OBRIGATÓRIO)
- option_d: alternativa D (OBRIGATÓRIO)
- option_e: alternativa E (se existir, senão null)
- correct_option: letra(s) da resposta correta em MAIÚSCULA
- explanation: explicação (se disponível, senão "")
- question_type: "standard", "multi_select", "hotspot_yesno", "hotspot_complete", "list", "missing_word", ou "negative"
- topic_id: o ID do tópico mais adequado da lista abaixo, ou null

TIPOS:
- "standard": múltipla escolha padrão (1 resposta)
- "multi_select": 2+ respostas corretas (correct_option = "DE")
- "hotspot_yesno": SEPARE cada afirmação Yes/No em questão individual (option_a="Yes", option_b="No", option_c="", option_d="")
- "hotspot_complete": complete-a-frase, trate como standard
- "list": 2 itens corretos de uma lista
- "missing_word": lacuna no texto
- "negative": o que NÃO é correto

Tópicos:
${topicsList}

REGRAS:
- Extraia TODAS as questões sem exceção
- Para HOTSPOT Yes/No: SEPARE cada afirmação em questão individual
- Letra correta em MAIÚSCULA
- Mantenha texto original
- Use gabarito se disponível`;

    // Use streaming to avoid wall clock timeout
    console.log("Calling AI gateway with streaming...");
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: 100000,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extraia todas as questões deste PDF e retorne como um array JSON. Retorne APENAS o array JSON, sem markdown ou texto adicional.",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:application/pdf;base64,${base64}` },
                },
              ],
            },
          ],
        }),
      }
    );

    console.log("AI response status:", aiResponse.status);

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      const status = aiResponse.status;
      const msg = status === 429 ? "Rate limit. Tente em alguns minutos."
        : status === 402 ? "Créditos insuficientes."
        : `AI error (${status})`;
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read SSE stream and accumulate content
    let fullContent = "";
    const reader = aiResponse.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) fullContent += delta;
        } catch {
          // skip malformed chunks
        }
      }
    }

    console.log("AI stream complete, content length:", fullContent.length);

    // Parse JSON
    let questions: any[];
    try {
      const jsonMatch = fullContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      questions = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("Parse error:", parseErr, "Content preview:", fullContent.substring(0, 500));
      return new Response(
        JSON.stringify({
          error: "Não foi possível extrair questões do PDF. Verifique o formato.",
          raw: fullContent.substring(0, 1000),
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracted ${questions.length} questions`);

    // Clean up file
    await adminClient.storage.from("admin-uploads").remove([filePath]);

    return new Response(
      JSON.stringify({ questions, topics: topics || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
