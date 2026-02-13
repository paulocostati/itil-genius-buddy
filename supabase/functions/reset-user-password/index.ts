import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify calling user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is admin using their token
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Não autorizado");

    const { data: isAdmin } = await callerClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado: apenas administradores");

    const { target_user_id } = await req.json();
    if (!target_user_id) throw new Error("target_user_id é obrigatório");

    // Use service role to update password and get user email
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: targetUser, error: getUserError } = await adminClient.auth.admin.getUserById(target_user_id);
    if (getUserError || !targetUser?.user) throw new Error("Usuário não encontrado");

    const newPassword = generatePassword();

    const { error: updateError } = await adminClient.auth.admin.updateUserById(target_user_id, {
      password: newPassword,
    });
    if (updateError) throw new Error("Erro ao redefinir senha: " + updateError.message);

    // Send email with new password via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const userEmail = targetUser.user.email;

    if (resendKey && userEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "EXAMTIS <noreply@examtis.com.br>",
          to: [userEmail],
          subject: "Sua senha foi redefinida - EXAMTIS",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a2e;">Senha Redefinida</h2>
              <p>Olá! Sua senha na plataforma EXAMTIS foi redefinida pelo administrador.</p>
              <p><strong>Sua nova senha:</strong></p>
              <div style="background: #f0f0f5; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 1px; text-align: center; margin: 16px 0;">
                ${newPassword}
              </div>
              <p>Recomendamos que você altere sua senha após o próximo login.</p>
              <p style="color: #666; font-size: 12px; margin-top: 24px;">EXAMTIS - Plataforma de Simulados</p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, email_sent: !!resendKey && !!userEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
