import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filePath, categoryId } = await req.json();

    // Download the PDF from storage
    const { data: fileData, error: fileError } = await adminClient.storage
      .from("admin-uploads")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert PDF to base64 for the AI (chunked to avoid stack overflow)
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    // Fetch existing topics for mapping (filtered by category if provided)
    let topicsQuery = adminClient.from("topics").select("id, name, area");
    if (categoryId && categoryId !== 'all') {
      topicsQuery = topicsQuery.eq("category_id", categoryId);
    }
    const { data: topics } = await topicsQuery;

    const topicsList = (topics || [])
      .map((t: any) => `- ID: ${t.id} | Nome: ${t.name} | Área: ${t.area}`)
      .join("\n");

    const systemPrompt = `Você é um extrator de questões de exame ITIL 4 a partir de PDFs.
Analise o documento PDF e extraia TODAS as questões encontradas.

Para cada questão, retorne um objeto JSON com TODOS estes campos preenchidos:
- statement: texto completo da pergunta (OBRIGATÓRIO - nunca deixe vazio)
- option_a: texto COMPLETO da alternativa A (OBRIGATÓRIO - nunca deixe vazio)
- option_b: texto COMPLETO da alternativa B (OBRIGATÓRIO - nunca deixe vazio)
- option_c: texto COMPLETO da alternativa C (OBRIGATÓRIO - nunca deixe vazio)
- option_d: texto COMPLETO da alternativa D (OBRIGATÓRIO - nunca deixe vazio)
- correct_option: letra da resposta correta em MAIÚSCULA (A, B, C ou D)
- explanation: explicação da resposta (se disponível no PDF, senão deixe string vazia)
- question_type: "standard" (ou "list" se pedir 2 itens corretos, "missing_word" se tiver lacuna, "negative" se perguntar o que NÃO é correto)
- topic_id: o ID do tópico mais adequado da lista abaixo, ou null se não conseguir mapear

Tópicos disponíveis:
${topicsList}

REGRAS CRÍTICAS:
- Extraia TODAS as questões do documento, sem exceção
- TODOS os campos option_a, option_b, option_c, option_d DEVEM conter o texto real das alternativas do PDF
- A letra da resposta correta DEVE ser MAIÚSCULA (A, B, C ou D)
- Mantenha o texto original exato das questões e alternativas
- Se o documento tiver gabarito/respostas separadas, use para preencher correct_option e explanation
- NÃO retorne alternativas vazias - cada questão DEVE ter 4 alternativas com texto`;

    // Call Lovable AI with the PDF
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
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para processar o PDF." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let questions: any[];
    try {
      // Try to extract JSON array from response (may be wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      questions = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("Parse error:", parseErr, "Content:", content.substring(0, 500));
      return new Response(
        JSON.stringify({
          error: "Não foi possível extrair questões do PDF. Verifique o formato.",
          raw: content.substring(0, 1000),
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up the uploaded file
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
