import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload = await req.json();
    
    // Support both direct calls and database webhook format
    const record = payload.record || payload;
    const email = record.display_name?.includes("@") 
      ? record.display_name 
      : null;
    const displayName = record.display_name || "Estudante";
    const userId = record.user_id;

    // If no email in profile, try to get from auth
    let userEmail = email;
    if (!userEmail && userId) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email;
    }

    if (!userEmail) {
      console.log("No email found for user, skipping welcome email");
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:1px;">EXAMTIS</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#8892b0;letter-spacing:2px;text-transform:uppercase;">Plataforma de Certificação</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#1a1a2e;">Bem-vindo(a), ${displayName}! 🎯</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
                Estamos muito felizes em ter você conosco! Sua conta no <strong>EXAMTIS</strong> foi criada com sucesso.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
                Agora você pode começar a se preparar para suas certificações com nossos simulados profissionais.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="https://itilv4.lovable.app/catalog"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 40px;border-radius:8px;letter-spacing:0.5px;">
                      Explorar Simulados
                    </a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;border-radius:8px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a2e;">O que você terá acesso:</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr><td style="padding:6px 0;font-size:14px;color:#555;">✅ Simulados no padrão oficial das certificações</td></tr>
                      <tr><td style="padding:6px 0;font-size:14px;color:#555;">✅ Questões com explicação detalhada</td></tr>
                      <tr><td style="padding:6px 0;font-size:14px;color:#555;">✅ Relatórios de desempenho por área</td></tr>
                      <tr><td style="padding:6px 0;font-size:14px;color:#555;">✅ Modo prática ilimitado (demo)</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f9fc;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#999;">
                © 2026 EXAMTIS — Plataforma de Certificação<br>
                <a href="https://itilv4.lovable.app" style="color:#6366f1;text-decoration:none;">itilv4.lovable.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EXAMTIS <onboarding@resend.dev>",
        to: [userEmail],
        subject: "Bem-vindo(a) ao EXAMTIS! 🎯 Sua jornada começa agora",
        html: htmlContent,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", result);
      throw new Error(`Resend error: ${JSON.stringify(result)}`);
    }

    console.log("Welcome email sent to:", userEmail);
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
