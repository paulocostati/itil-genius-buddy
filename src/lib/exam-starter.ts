import { supabase } from "@/integrations/supabase/client";
import { distributeByWeight } from "./exam-generator";

export async function startExam(userId: string, productId: string, productSlug: string, isDemo: boolean = false) {
    // 1. Get Product info to know category/technology
    const { data: product } = await (supabase.from as any)('products')
        .select('category_id, question_count')
        .eq('id', productId)
        .single();

    if (!product) throw new Error("Product not found");

    // 2. Fetch Topics for this Category
    // If product.category_id is null/undefined (e.g. legacy), we might fetch all?
    // But our schema enforces linkage ideally.
    let query = (supabase.from as any)('topics').select('*');

    if (product.category_id) {
        query = query.eq('category_id', product.category_id);
    }

    const { data: topics } = await query;

    if (!topics || topics.length === 0) {
        throw new Error("No topics found for this exam.");
    }

    // 3. Fetch Questions for these Topics
    const topicIds = topics.map(t => t.id);
    const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .in('topic_id', topicIds);

    if (!questions || questions.length === 0) {
        throw new Error("No questions found for this exam.");
    }

    // 4. Group questions by topic
    const questionsByTopic = new Map<string, any[]>();
    for (const q of questions) {
        const arr = questionsByTopic.get(q.topic_id) || [];
        arr.push(q);
        questionsByTopic.set(q.topic_id, arr);
    }

    // 5. Generate Exam (select questions)
    // Limit to 20 if it's a demo, otherwise use product count (default 40)
    const count = isDemo ? Math.min(product.question_count || 40, 20) : (product.question_count || 40);
    const selected = distributeByWeight(topics as any[], questionsByTopic, count);

    // 6. Create Exam Record
    const { data: exam, error: examError } = await (supabase.from as any)('exams')
        .insert({
            user_id: userId,
            total_questions: selected.length,
            product_id: productId,
            is_demo: isDemo
        })
        .select()
        .single();

    if (examError || !exam) throw examError || new Error("Failed to create exam");

    // 7. Insert Exam Questions
    const examQuestions = selected.map((q, i) => ({
        exam_id: exam.id,
        question_id: q.id,
        question_order: i + 1,
    }));

    const { error: eqError } = await supabase.from('exam_questions').insert(examQuestions);
    if (eqError) throw eqError;

    return exam.id;
}
