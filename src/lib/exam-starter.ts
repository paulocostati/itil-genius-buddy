import { supabase } from "@/integrations/supabase/client";

export async function startExam(userId: string, productId: string, productSlug: string, isDemo: boolean = false) {
    const { data, error } = await supabase.functions.invoke('start-exam', {
        body: { product_id: productId, is_demo: isDemo },
    });

    if (error) throw new Error(error.message || "Failed to start exam");
    if (data?.error) throw new Error(data.error);
    
    return data.exam_id;
}
