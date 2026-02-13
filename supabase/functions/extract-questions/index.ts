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
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

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
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Convert PDF to base64 (chunked to avoid stack overflow)
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    console.log(`PDF size: ${bytes.length} bytes, base64 length: ${base64.length}`);

    // Fetch existing topics for mapping (filtered by category if provided)
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

Para cada questão, retorne um objeto JSON com TODOS estes campos preenchidos:
- statement: texto completo da pergunta (OBRIGATÓRIO - nunca deixe vazio)
- option_a: texto COMPLETO da alternativa A (OBRIGATÓRIO - nunca deixe vazio)
- option_b: texto COMPLETO da alternativa B (OBRIGATÓRIO - nunca deixe vazio)
- option_c: texto COMPLETO da alternativa C (OBRIGATÓRIO)
- option_d: texto COMPLETO da alternativa D (OBRIGATÓRIO)
- option_e: texto da alternativa E (se existir, senão null)
- correct_option: letra(s) da resposta correta em MAIÚSCULA (A, B, C, D, E, ou múltiplas como "DE")
- explanation: explicação da resposta (se disponível no PDF, senão deixe string vazia)
- question_type: tipo da questão (veja regras abaixo)
- topic_id: o ID do tópico mais adequado da lista abaixo, ou null se não conseguir mapear

TIPOS DE QUESTÃO:
- "standard": múltipla escolha padrão com 1 resposta correta (A, B, C ou D)
- "multi_select": quando pede 2+ respostas corretas (ex: "Each correct answer presents a complete solution"). correct_option deve conter as letras juntas (ex: "DE")
- "hotspot_yesno": questões HOTSPOT com tabela Yes/No. CONVERTA cada afirmação em uma questão separada: statement = a afirmação, option_a = "Yes", option_b = "No", option_c e option_d ficam vazios ("")
- "hotspot_complete": questões "complete the sentence" com lista de opções. Trate como standard.
- "list": se pedir 2 itens corretos de uma lista
- "missing_word": se tiver lacuna no texto
- "negative": se perguntar o que NÃO é correto

Tópicos disponíveis:
${topicsList}

REGRAS CRÍTICAS:
- Extraia TODAS as questões do documento, sem exceção
- Para HOTSPOT Yes/No: SEPARE cada afirmação da tabela em uma questão individual
- A letra da resposta correta DEVE ser MAIÚSCULA
- Mantenha o texto original exato das questões e alternativas
- Se o documento tiver gabarito/respostas separadas, use para preencher correct_option e explanation
- Para questões multi_select, correct_option deve conter TODAS as letras corretas (ex: "DE", "BCE")`;

    // Call AI with longer timeout
    console.log("Calling AI gateway...");
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

    console.log("AI response status:", aiResponse.status);

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Rate limit exceeded. Tente novamente em alguns minutos.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Créditos insuficientes para processar o PDF.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI processing failed (${aiResponse.status}): ${errText.substring(0, 200)}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response length:", content.length, "finish_reason:", aiData.choices?.[0]?.finish_reason);

    // Parse the JSON from the AI response
    let questions: any[];
    try {
      // Try to extract JSON array from response (may be wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in AI response");
      questions = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error(
        "Parse error:",
        parseErr,
        "Content preview:",
        content.substring(0, 500)
      );
      
      // If the response was truncated (finish_reason != "stop"), let the user know
      const finishReason = aiData.choices?.[0]?.finish_reason;
      const errorMsg = finishReason === "length" 
        ? "A resposta da IA foi truncada (PDF muito grande). Tente dividir o PDF em partes menores."
        : "Não foi possível extrair questões do PDF. Verifique o formato.";
      
      return new Response(
        JSON.stringify({
          error: errorMsg,
          raw: content.substring(0, 1000),
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully extracted ${questions.length} questions`);

    // Clean up the uploaded file
    await adminClient.storage.from("admin-uploads").remove([filePath]);

    return new Response(
      JSON.stringify({ questions, topics: topics || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-questions error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
