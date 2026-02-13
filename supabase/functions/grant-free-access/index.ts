import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) throw new Error("Não autorizado");

    const { order_id } = await req.json();
    if (!order_id) throw new Error("order_id é obrigatório");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify the order belongs to the user, is APPROVED, and has amount_cents = 0
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user.id)
      .eq("status", "APPROVED")
      .eq("amount_cents", 0)
      .single();

    if (orderError || !order) {
      throw new Error("Pedido não encontrado ou não elegível para acesso gratuito");
    }

    // Check if entitlement already exists
    const { data: existingList } = await adminClient
      .from("entitlements")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", order.product_id)
      .eq("status", "ACTIVE")
      .limit(1);

    const existing = existingList && existingList.length > 0;

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Acesso já liberado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Grant entitlement
    const { error: entError } = await adminClient
      .from("entitlements")
      .insert({
        user_id: user.id,
        product_id: order.product_id,
        source_order_id: order.id,
        status: "ACTIVE",
      });

    if (entError) throw new Error("Erro ao liberar acesso: " + entError.message);

    // Get product title for the email
    const { data: productData } = await adminClient
      .from("products")
      .select("title")
      .eq("id", order.product_id)
      .single();

    // Send access email (fire-and-forget)
    fetch(`${supabaseUrl}/functions/v1/send-access-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        user_id: user.id,
        product_title: productData?.title || "Simulado",
        type: "product",
      }),
    }).catch((e) => console.error("Email error:", e));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
