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

  // We'll stream SSE events back to the client for progress
  const encoder = new TextEncoder();
  
  function sendEvent(controller: ReadableStreamDefaultController, type: string, data: any) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          sendEvent(controller, "error", { error: "Unauthorized" });
          controller.close();
          return;
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
          sendEvent(controller, "error", { error: "Unauthorized" });
          controller.close();
          return;
        }

        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        const { data: isAdmin } = await adminClient.rpc("has_role", {
          _user_id: user.id, _role: "admin",
        });
        if (!isAdmin) {
          sendEvent(controller, "error", { error: "Forbidden: admin only" });
          controller.close();
          return;
        }

        const { filePath, categoryId, syllabusUrl } = await req.json();

        sendEvent(controller, "progress", { message: "Baixando PDF do storage..." });

        const { data: fileData, error: fileError } = await adminClient.storage
          .from("admin-uploads").download(filePath);
        if (fileError || !fileData) {
          sendEvent(controller, "error", { error: "Failed to download file" });
          controller.close();
          return;
        }

        sendEvent(controller, "progress", { message: "Convertendo PDF para base64..." });

        const arrayBuffer = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);

        sendEvent(controller, "progress", { message: `PDF processado (${(bytes.length / 1024 / 1024).toFixed(1)} MB). Carregando tópicos...` });

        let topicsQuery = adminClient.from("topics").select("id, name, area");
        if (categoryId && categoryId !== "all") {
          topicsQuery = topicsQuery.eq("category_id", categoryId);
        }
        let { data: topics } = await topicsQuery;

        // Fetch syllabus content if URL provided
        let syllabusContent = "";
        if (syllabusUrl) {
          sendEvent(controller, "progress", { message: `📖 Buscando syllabus de ${syllabusUrl}...` });
          try {
            const syllabusRes = await fetch(syllabusUrl, { 
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(15000),
            });
            if (syllabusRes.ok) {
              const html = await syllabusRes.text();
              syllabusContent = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 15000);
              sendEvent(controller, "progress", { message: `📖 Syllabus carregado (${syllabusContent.length} chars)` });
            } else {
              sendEvent(controller, "progress", { message: `⚠️ Não foi possível acessar o syllabus (${syllabusRes.status})` });
            }
          } catch (e) {
            sendEvent(controller, "progress", { message: `⚠️ Erro ao buscar syllabus: ${e instanceof Error ? e.message : 'timeout'}` });
          }
        }

        // Auto-create topics from syllabus if none exist for the category
        if ((!topics || topics.length === 0) && syllabusContent && categoryId && categoryId !== "all") {
          sendEvent(controller, "progress", { message: "🧠 Nenhum tópico encontrado. Gerando tópicos a partir do syllabus..." });
          
          const topicGenResponse = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                max_tokens: 8000,
                messages: [
                  {
                    role: "system",
                    content: `Você é um especialista em certificações de TI. Analise o conteúdo do syllabus abaixo e extraia os tópicos/domínios do exame.

Para cada tópico retorne um objeto JSON com:
- name: nome do tópico (ex: "Describe Cloud Concepts")
- area: área/domínio principal (ex: "Cloud Concepts")  
- weight: peso relativo no exame (1.0 a 3.0, baseado na importância)
- blooms_level: "BL1" para recall/memorização, "BL2" para compreensão/aplicação
- description: breve descrição do que o tópico cobre

Retorne APENAS um array JSON, sem markdown ou texto adicional.
Crie entre 4 e 15 tópicos que cubram todo o syllabus.`
                  },
                  {
                    role: "user",
                    content: `Extraia os tópicos deste syllabus:\n\n${syllabusContent}`
                  }
                ],
              }),
            }
          );

          if (topicGenResponse.ok) {
            const topicGenData = await topicGenResponse.json();
            const topicContent = topicGenData.choices?.[0]?.message?.content || "";
            try {
              const arrayStart = topicContent.indexOf("[");
              const arrayEnd = topicContent.lastIndexOf("]");
              if (arrayStart !== -1 && arrayEnd !== -1) {
                const generatedTopics = JSON.parse(topicContent.substring(arrayStart, arrayEnd + 1));
                
                // Insert topics into DB
                const topicRows = generatedTopics.map((t: any) => ({
                  name: t.name,
                  area: t.area || t.name,
                  weight: t.weight || 1,
                  blooms_level: t.blooms_level || "BL2",
                  description: t.description || null,
                  category_id: categoryId,
                }));

                const { data: insertedTopics, error: topicError } = await adminClient
                  .from("topics")
                  .insert(topicRows)
                  .select("id, name, area");

                if (topicError) {
                  sendEvent(controller, "progress", { message: `⚠️ Erro ao criar tópicos: ${topicError.message}` });
                } else {
                  topics = insertedTopics;
                  sendEvent(controller, "progress", { message: `✅ ${insertedTopics.length} tópicos criados automaticamente a partir do syllabus!` });
                }
              }
            } catch (parseErr) {
              sendEvent(controller, "progress", { message: `⚠️ Não foi possível interpretar tópicos do syllabus` });
            }
          }
        }

        const topicsList = (topics || [])
          .map((t: any) => `- ID: ${t.id} | Nome: ${t.name} | Área: ${t.area}`)
          .join("\n");

        sendEvent(controller, "progress", { message: `${(topics || []).length} tópicos encontrados. Enviando para IA...` });

        const systemPrompt = `Você é um extrator de questões de exame de certificação a partir de PDFs.
Analise o documento PDF e extraia TODAS as questões encontradas.

Para cada questão, retorne um objeto JSON com estes campos:
- statement: texto completo da pergunta (OBRIGATÓRIO)
- option_a: alternativa A (OBRIGATÓRIO)
- option_b: alternativa B (OBRIGATÓRIO)
- option_c: alternativa C (se existir, senão null)
- option_d: alternativa D (se existir, senão null)
- option_e: alternativa E (se existir, senão null)
- correct_option: letra(s) da resposta correta em MAIÚSCULA
- explanation: explicação (se disponível, senão "")
- question_type: "standard", "multi_select", "hotspot_yesno", "hotspot_complete", "list", "missing_word", ou "negative"
- topic_id: o ID do tópico mais adequado da lista abaixo, ou null

IMPORTANTE sobre opções:
- Questões Yes/No têm APENAS option_a="Yes" e option_b="No" (option_c=null, option_d=null)
- Questões com 3 alternativas: option_d=null
- NUNCA retorne a string "null", retorne o valor null do JSON

TIPOS:
- "standard": múltipla escolha padrão (1 resposta)
- "multi_select": 2+ respostas corretas (correct_option = "DE")
- "hotspot_yesno": SEPARE cada afirmação Yes/No em questão individual (option_a="Yes", option_b="No", option_c="", option_d="")
- "hotspot_complete": complete-a-frase, trate como standard
- "list": 2 itens corretos de uma lista
- "missing_word": lacuna no texto
- "negative": o que NÃO é correto

Tópicos cadastrados:
${topicsList || "(nenhum tópico cadastrado ainda — crie topic_id=null e sugira um nome de tópico no campo explanation)"}
${syllabusContent ? `
CONTEXTO DO SYLLABUS OFICIAL DA CERTIFICAÇÃO:
${syllabusContent}

Use este conteúdo para:
- Mapear cada questão ao tópico mais adequado
- Se não houver tópicos cadastrados, use topic_id=null mas inclua na explanation qual área/domínio do syllabus a questão pertence
- Entender o peso e importância de cada área do exame
` : ''}
REGRAS:
- Extraia TODAS as questões sem exceção
- Para HOTSPOT Yes/No: SEPARE cada afirmação em questão individual
- Letra correta em MAIÚSCULA
- Mantenha texto original
- Use gabarito se disponível`;

        sendEvent(controller, "progress", { message: "🤖 IA analisando o PDF... isto pode levar 1-3 min" });

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

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error("AI error:", aiResponse.status, errText);
          const status = aiResponse.status;
          const msg = status === 429 ? "Rate limit. Tente em alguns minutos."
            : status === 402 ? "Créditos insuficientes."
            : `AI error (${status})`;
          sendEvent(controller, "error", { error: msg });
          controller.close();
          return;
        }

        sendEvent(controller, "progress", { message: "🤖 IA respondendo... recebendo dados" });

        // Read SSE stream, count questions as they appear, and forward progress
        let fullContent = "";
        const reader = aiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let aiBuffer = "";
        let questionCount = 0;
        let lastReportedCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          aiBuffer += decoder.decode(value, { stream: true });
          const lines = aiBuffer.split("\n");
          aiBuffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                // Count how many complete questions we have so far
                const matches = fullContent.match(/"statement"\s*:/g);
                questionCount = matches ? matches.length : 0;
                if (questionCount > lastReportedCount) {
                  lastReportedCount = questionCount;
                  sendEvent(controller, "progress", { 
                    message: `🤖 Extraindo... ${questionCount} questões encontradas até agora`,
                    questionsFound: questionCount 
                  });
                }
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        sendEvent(controller, "progress", { message: `✅ IA finalizou. ${questionCount} questões detectadas. Processando JSON...` });

        // Parse JSON - handle truncated responses
        let questions: any[];
        try {
          // Find the start of JSON array
          const arrayStart = fullContent.indexOf("[");
          if (arrayStart === -1) throw new Error("No JSON array found in response");
          
          let jsonStr = fullContent.substring(arrayStart);
          
          // Try parsing as-is first
          try {
            questions = JSON.parse(jsonStr);
          } catch {
            // Response likely truncated - try to fix it
            // Remove any trailing incomplete object
            const lastComplete = jsonStr.lastIndexOf("}");
            if (lastComplete === -1) throw new Error("No complete JSON objects found");
            
            jsonStr = jsonStr.substring(0, lastComplete + 1);
            
            // Ensure array is closed
            if (!jsonStr.trimEnd().endsWith("]")) {
              // Remove trailing comma if present
              jsonStr = jsonStr.replace(/,\s*$/, "");
              jsonStr += "]";
            }
            
            questions = JSON.parse(jsonStr);
            sendEvent(controller, "progress", { 
              message: `⚠️ Resposta da IA foi truncada. ${questions.length} questões recuperadas parcialmente.` 
            });
          }
        } catch (parseErr) {
          console.error("Parse error:", parseErr, "Content preview:", fullContent.substring(0, 500));
          sendEvent(controller, "error", { 
            error: "Não foi possível extrair questões do PDF. Tente novamente ou use um PDF menor.",
            raw: fullContent.substring(0, 1000) 
          });
          controller.close();
          return;
        }

        // Clean up questions: fix "null" strings and validate topic_ids
        const validTopicIds = new Set((topics || []).map((t: any) => t.id));
        let fixedCount = 0;
        for (const q of questions) {
          // Convert string "null" to actual null for options
          for (const field of ['option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'explanation', 'topic_id']) {
            if (q[field] === 'null' || q[field] === 'NULL' || q[field] === 'None' || q[field] === '') {
              q[field] = null;
            }
          }
          if (q.topic_id && !validTopicIds.has(q.topic_id)) {
            q.topic_id = null;
            fixedCount++;
          }
        }
        if (fixedCount > 0) {
          sendEvent(controller, "progress", { message: `⚠️ ${fixedCount} questões tinham tópicos inválidos (corrigidos para seleção manual)` });
        }

        sendEvent(controller, "progress", { message: `✅ ${questions.length} questões extraídas com sucesso!` });

        // Clean up file
        await adminClient.storage.from("admin-uploads").remove([filePath]);

        // Send final result
        sendEvent(controller, "done", { questions, topics: topics || [] });
        controller.close();

      } catch (e) {
        console.error("extract-questions error:", e);
        sendEvent(controller, "error", { error: e instanceof Error ? e.message : "Unknown error" });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
