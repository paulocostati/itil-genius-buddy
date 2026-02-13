import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { exam_id, answers } = await req.json();
    // answers: Record<exam_question_id, selected_option>

    if (!exam_id) {
      return new Response(JSON.stringify({ error: "exam_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify exam belongs to user
    const { data: exam, error: examError } = await adminClient.from("exams")
      .select("id, user_id, completed")
      .eq("id", exam_id)
      .single();

    if (examError || !exam) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (exam.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (exam.completed) {
      return new Response(JSON.stringify({ error: "Exam already completed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch exam questions with correct answers (using service role)
    const { data: examQuestions } = await adminClient.from("exam_questions")
      .select("id, question_id, selected_option")
      .eq("exam_id", exam_id);

    if (!examQuestions || examQuestions.length === 0) {
      return new Response(JSON.stringify({ error: "No questions found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch correct answers
    const questionIds = examQuestions.map(eq => eq.question_id);
    const { data: correctData } = await adminClient.from("questions")
      .select("id, correct_option")
      .in("id", questionIds);

    const correctMap = new Map<string, string>();
    correctData?.forEach((q: any) => correctMap.set(q.id, q.correct_option));

    // Grade each question
    let score = 0;
    const updates: Promise<any>[] = [];

    for (const eq of examQuestions) {
      // Use provided answer or the already-saved selected_option
      const selected = answers?.[eq.id] ?? eq.selected_option ?? null;
      const correct = correctMap.get(eq.question_id);

      const isCorrect = selected && correct
        ? selected.split("").sort().join("") === correct.split("").sort().join("")
        : selected === correct;

      if (isCorrect) score++;

      updates.push(
        adminClient.from("exam_questions")
          .update({ is_correct: isCorrect, selected_option: selected })
          .eq("id", eq.id)
      );
    }

    await Promise.all(updates);

    // Mark exam as completed
    await adminClient.from("exams").update({
      completed: true,
      score,
      finished_at: new Date().toISOString(),
    }).eq("id", exam_id);

    return new Response(JSON.stringify({ score, total: examQuestions.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
