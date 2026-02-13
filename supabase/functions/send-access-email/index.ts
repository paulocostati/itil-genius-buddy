import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, product_title, type } = await req.json();
    if (!user_id) throw new Error("user_id é obrigatório");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      return new Response(
        JSON.stringify({ success: false, reason: "RESEND_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) throw new Error("Usuário não encontrado");

    const email = userData.user.email;
    const displayName = userData.user.user_metadata?.display_name || email;

    const isSubscription = type === "subscription";
    const subject = isSubscription
      ? "Sua assinatura foi ativada! - EXAMTIS"
      : `Acesso liberado: ${product_title || "Simulado"} - EXAMTIS`;

    const body = isSubscription
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">🎉 Assinatura Ativada!</h2>
          <p>Olá, <strong>${displayName}</strong>!</p>
          <p>Sua assinatura na plataforma <strong>EXAMTIS</strong> foi aprovada e já está ativa.</p>
          <p>Agora você tem acesso completo a todos os simulados disponíveis na plataforma.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://itilv4.lovable.app/catalog" 
               style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Acessar Simulados
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">EXAMTIS - Plataforma de Simulados</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">🎉 Acesso Liberado!</h2>
          <p>Olá, <strong>${displayName}</strong>!</p>
          <p>Seu acesso ao simulado <strong>${product_title || ""}</strong> na plataforma <strong>EXAMTIS</strong> foi liberado com sucesso!</p>
          <p>Você já pode começar a praticar agora mesmo.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://itilv4.lovable.app/catalog" 
               style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Começar Simulado
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">EXAMTIS - Plataforma de Simulados</p>
        </div>
      `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "EXAMTIS <noreply@examtis.com.br>",
        to: [email],
        subject,
        html: body,
      }),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData?.message || "Erro ao enviar e-mail");

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
