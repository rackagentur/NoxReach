// supabase/functions/pro-upgrade-email/index.ts
// Triggered two ways:
// 1. DB webhook on profiles UPDATE (when is_pro flips to true)
// 2. Direct call with { email, display_name, username }

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "Gregorgus (GEEZ) via NoxReach <welcome@soundofgeez.com>";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function proUpgradeEmail(displayName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You're in.</title>
<style>
  body { margin: 0; padding: 0; background: #060608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #f0f0f0; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 48px 24px; }
  .card { background: #0f0f18; border: 1px solid #1c1c2e; border-radius: 16px; padding: 44px 40px; }
  .greeting { font-size: 18px; font-weight: 600; color: #9090a8; margin: 0 0 24px; }
  p { font-size: 15px; color: #9090a8; line-height: 1.85; margin: 0 0 18px; }
  p strong { color: #f0f0f0; font-weight: 600; }
  p.punch { font-size: 15px; color: #f0f0f0; font-weight: 600; margin: 0 0 28px; }
  .divider { border: none; border-top: 1px solid #1c1c2e; margin: 32px 0; }
  .action-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #6B2FD4; margin-bottom: 20px; }
  .action-list { margin: 0 0 8px; padding: 0; list-style: none; }
  .action-list li { font-size: 14px; color: #9090a8; padding: 14px 0; border-bottom: 1px solid #1c1c2e; display: flex; gap: 14px; align-items: flex-start; line-height: 1.65; }
  .action-list li:last-child { border-bottom: none; }
  .action-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
  .action-text strong { color: #f0f0f0; display: block; margin-bottom: 3px; font-size: 14px; font-weight: 700; }
  .cta-wrap { text-align: center; margin: 36px 0 0; }
  .btn { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #D4AF37, #f0c040); color: #000; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 10px; }
  .sig { margin-top: 36px; padding-top: 28px; border-top: 1px solid #1c1c2e; }
  .sig-name { font-size: 15px; font-weight: 700; color: #f0f0f0; margin-bottom: 3px; }
  .sig-title { font-size: 12px; color: #50506a; font-family: 'Courier New', monospace; }
  .footer { text-align: center; margin-top: 28px; font-size: 11px; color: #50506a; line-height: 1.7; }
  .footer a { color: #6B2FD4; text-decoration: none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="greeting">Hey ${displayName} —</div>
    <p>There was a point where I had the talent, the sets, the energy — and I still wasn't booking consistently.</p>
    <p>Not because the music wasn't right. Because I wasn't following up. I was managing outreach across Cologne, Amsterdam, and Berlin in a spreadsheet. Leads went cold. Venues moved on. Someone else got the slot.</p>
    <p>I built NoxReach to fix that. For myself first. Went from 1 booking per quarter to 3 — not because my sound improved, but because I stopped letting warm leads slip.</p>
    <p class="punch">That system is now yours.</p>
    <hr class="divider" />
    <div class="action-label">Where to start</div>
    <ul class="action-list">
      <li>
        <span class="action-icon">✉</span>
        <span class="action-text">
          <strong>Open Booking Desk first</strong>
          Every reply, every conversation, every contact log — in one place. When a venue responds, you'll have the full history and your EPK ready to send in seconds. The window to close a warm lead is short. Booking Desk makes sure you don't miss it.
        </span>
      </li>
      <li>
        <span class="action-icon">⏰</span>
        <span class="action-text">
          <strong>Let follow-ups run themselves</strong>
          Move leads to Contacted. The system schedules reminders at 5 and 14 days automatically. Check the Follow-ups tab every morning — that's your daily task list. Nothing slips.
        </span>
      </li>
      <li>
        <span class="action-icon">📈</span>
        <span class="action-text">
          <strong>Watch your funnel</strong>
          Dashboard → Conversion Funnel. It shows exactly where leads drop off. Not getting replies — the first message needs work. Getting replies but not booking — your follow-through does. The data tells the truth.
        </span>
      </li>
    </ul>
    <hr class="divider" />
    <p>If you get stuck, have feedback, or want to tell me what's working — just reply to this email. I read every one.</p>
    <p style="margin:0">See you on the floor.</p>
    <div class="cta-wrap">
      <a href="https://app.noxreach.com" class="btn">Open NoxReach Pro →</a>
    </div>
    <div class="sig">
      <div class="sig-name">Gregorgus (GEEZ)</div>
      <div class="sig-title">Founder, NoxReach · Tech House · Tribal Circuit · Cologne</div>
    </div>
  </div>
  <div class="footer">
    You're receiving this because you upgraded to NoxReach Pro.<br />
    <a href="mailto:hello@noxreach.io">hello@noxreach.io</a> · <a href="https://noxreach.com/privacy.html">Privacy Policy</a>
  </div>
</div>
</body>
</html>`;
}

async function sendProEmail(email: string, displayName: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: "You're in. Welcome to Pro 🎛️",
      html: proUpgradeEmail(displayName),
    }),
  });
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();

    let email: string;
    let displayName: string;

    // Handle DB webhook payload (profiles UPDATE)
    if (payload.record && payload.type === "UPDATE") {
      const record = payload.record;
      const oldRecord = payload.old_record;

      // Only fire when is_pro flips from false to true
      if (!record.is_pro || oldRecord?.is_pro === true) {
        console.log("Skipping — is_pro not newly set to true");
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get email from auth.users via admin client
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SERVICE_ROLE_KEY")!
      );

      const { data: { user } } = await supabase.auth.admin.getUserById(record.id);
      if (!user?.email) throw new Error("No email found for user");

      email = user.email;
      displayName = record.display_name || record.username || email.split("@")[0];

    } else {
      // Direct call with { email, display_name, username }
      email = payload.email;
      displayName = payload.display_name || payload.username || email?.split("@")[0] || "DJ";
    }

    if (!email) throw new Error("No email provided");

    const result = await sendProEmail(email, displayName);
    console.log("Pro upgrade email sent to:", email, result);

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("pro-upgrade-email error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
