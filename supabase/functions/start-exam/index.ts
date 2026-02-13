import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Topic {
  id: string;
  name: string;
  area: string;
  weight: number;
}

interface Question {
  id: string;
  topic_id: string;
}

function distributeByWeight(
  topics: Topic[],
  questionsByTopic: Map<string, Question[]>,
  totalQuestions: number
): Question[] {
  const totalWeight = topics.reduce((sum, t) => sum + Number(t.weight), 0);
  const distribution: { topicId: string; count: number; remainder: number }[] = [];
  let allocated = 0;

  for (const topic of topics) {
    const available = questionsByTopic.get(topic.id)?.length || 0;
    if (available === 0) continue;
    const ideal = (Number(topic.weight) / totalWeight) * totalQuestions;
    const floor = Math.floor(ideal);
    const count = Math.min(floor, available);
    distribution.push({ topicId: topic.id, count, remainder: ideal - floor });
    allocated += count;
  }

  let remaining = totalQuestions - allocated;
  distribution.sort((a, b) => b.remainder - a.remainder);
  for (const d of distribution) {
    if (remaining <= 0) break;
    const available = questionsByTopic.get(d.topicId)?.length || 0;
    if (d.count < available) { d.count++; remaining--; }
  }
  if (remaining > 0) {
    for (const d of distribution) {
      if (remaining <= 0) break;
      const available = questionsByTopic.get(d.topicId)?.length || 0;
      while (d.count < available && remaining > 0) { d.count++; remaining--; }
    }
  }

  const selected: Question[] = [];
  for (const d of distribution) {
    const pool = questionsByTopic.get(d.topicId) || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, d.count));
  }

  const topicOrder = new Map<string, number>();
  const sortedTopics = [...topics].sort((a, b) => Number(b.weight) - Number(a.weight));
  sortedTopics.forEach((t, i) => topicOrder.set(t.id, i));
  selected.sort((a, b) => {
    const orderA = topicOrder.get(a.topic_id) ?? 999;
    const orderB = topicOrder.get(b.topic_id) ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return Math.random() - 0.5;
  });

  return selected;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { product_id, is_demo = false, is_practice = false, topic_ids, question_types, question_count: requestedCount } = body;

    const adminClient = createClient(supabaseUrl, serviceKey);

    let categoryId: string | null = null;
    let productQuestionCount = 40;
    let topicIdsToUse: string[] = topic_ids || [];

    if (product_id) {
      const { data: product } = await adminClient.from("products").select("category_id, question_count").eq("id", product_id).single();
      if (!product) {
        return new Response(JSON.stringify({ error: "Product not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      categoryId = product.category_id;
      productQuestionCount = product.question_count || 40;
    }

    // Fetch topics
    let topicsQuery = adminClient.from("topics").select("id, name, area, weight, category_id");
    if (categoryId) {
      topicsQuery = topicsQuery.eq("category_id", categoryId);
    } else if (topicIdsToUse.length > 0) {
      topicsQuery = topicsQuery.in("id", topicIdsToUse);
    }
    const { data: topics } = await topicsQuery;
    if (!topics || topics.length === 0) {
      return new Response(JSON.stringify({ error: "No topics found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch questions using service role (bypasses RLS)
    const tIds = topicIdsToUse.length > 0 ? topicIdsToUse : topics.map((t: any) => t.id);
    let questionsQuery = adminClient.from("questions").select("id, topic_id, question_type").in("topic_id", tIds);
    if (question_types && question_types.length > 0) {
      questionsQuery = questionsQuery.in("question_type", question_types);
    }
    const { data: questions } = await questionsQuery;
    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ error: "No questions found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by topic
    const questionsByTopic = new Map<string, Question[]>();
    for (const q of questions) {
      const arr = questionsByTopic.get(q.topic_id) || [];
      arr.push(q);
      questionsByTopic.set(q.topic_id, arr);
    }

    // Determine count
    let count: number;
    if (is_practice && requestedCount) {
      count = requestedCount;
    } else if (is_demo) {
      count = Math.min(productQuestionCount, 20);
    } else {
      count = productQuestionCount;
    }

    const selected = distributeByWeight(topics as Topic[], questionsByTopic, count);

    // Create exam record (using user's context for RLS)
    const { data: exam, error: examError } = await adminClient.from("exams").insert({
      user_id: user.id,
      total_questions: selected.length,
      product_id: product_id || null,
      is_demo,
      is_practice,
    }).select().single();

    if (examError || !exam) {
      return new Response(JSON.stringify({ error: "Failed to create exam", details: examError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert exam questions
    const examQuestions = selected.map((q, i) => ({
      exam_id: exam.id,
      question_id: q.id,
      question_order: i + 1,
    }));
    const { error: eqError } = await adminClient.from("exam_questions").insert(examQuestions);
    if (eqError) {
      return new Response(JSON.stringify({ error: "Failed to create exam questions", details: eqError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ exam_id: exam.id, total_questions: selected.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
