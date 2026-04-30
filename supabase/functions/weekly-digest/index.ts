import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ckttttvgvpvflgjzkbmy.supabase.co";

Deno.serve(async () => {
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL, supabaseKey!);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const dateLabel = now.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    // Fetch all users with emails
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, display_name");
    if (usersError) throw usersError;

    // Fetch auth emails via admin API
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const emailMap: Record<string, string> = {};
    for (const u of authUsers.users) {
      if (u.email) emailMap[u.id] = u.email;
    }

    const results = [];

    for (const profile of users) {
      const email = emailMap[profile.id];
      if (!email) continue;

      // Fetch this user's leads
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", profile.id)
        .eq("archived", false);
      if (leadsError || !leads || leads.length === 0) continue;

      const overdue = leads.filter(l =>
        l.follow_up_date && l.follow_up_date < todayStr &&
        !["booked","archived","declined"].includes(l.stage)
      );
      const dueToday = leads.filter(l =>
        l.follow_up_date === todayStr &&
        !["booked","archived","declined"].includes(l.stage)
      );
      const allDue = [...overdue, ...dueToday];
      const replied = leads.filter(l => l.stage === "replied");
      const bookedRecent = leads.filter(l => {
        if (l.stage !== "booked") return false;
        const d = l.last_contact ? new Date(l.last_contact) : null;
        if (!d || isNaN(d.getTime())) return false;
        return (now.getTime() - d.getTime()) / 86400000 <= 7;
      });
      const active = leads.filter(l => !["archived","declined"].includes(l.stage));
      const bookedAll = leads.filter(l => l.stage === "booked" && !l.archived);
      const totalFees = bookedAll.reduce((sum, l) => sum + (l.fee || 0), 0);
      const depositDue = bookedAll.filter(l => l.fee && !l.deposit_paid).length;

      // Skip users with nothing to report
      if (allDue.length === 0 && replied.length === 0 && bookedRecent.length === 0) continue;

      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "—";
        const hours = Math.round((now.getTime() - d.getTime()) / 3600000);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.round(hours / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      };

      const leadRow = (l: any, tagText: string, tagColor: string, tagTextColor: string, dotColor: string, dateText: string) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
            <table cellpadding="0" cellspacing="0" style="width:100%"><tr>
              <td style="width:14px;vertical-align:middle;padding-right:10px">
                <div style="width:7px;height:7px;border-radius:50%;background:${dotColor}"></div>
              </td>
              <td style="vertical-align:middle;font-size:14px;color:rgba(255,255,255,0.85)">${l.name}</td>
              <td style="vertical-align:middle;text-align:right;padding-left:12px;white-space:nowrap">
                <span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:4px;background:${tagColor};color:${tagTextColor}">${tagText}</span>
              </td>
              <td style="vertical-align:middle;font-size:11px;color:rgba(255,255,255,0.3);text-align:right;padding-left:12px;white-space:nowrap;min-width:56px">${dateText}</td>
            </tr></table>
          </td>
        </tr>`;

      const followupRows = allDue.map(l => {
        const isOverdue = l.follow_up_date < todayStr;
        const dateText = isOverdue
          ? `${Math.round((now.getTime() - new Date(l.follow_up_date).getTime()) / 86400000)}d overdue`
          : "Today";
        return leadRow(l,
          isOverdue ? "Overdue" : "Due today",
          isOverdue ? "rgba(239,68,68,0.12)" : "rgba(212,175,55,0.12)",
          isOverdue ? "#f87171" : "#D4AF37",
          isOverdue ? "#ef4444" : "#D4AF37",
          dateText
        );
      }).join("");

      const repliedRows = replied.map(l =>
        leadRow(l, "Replied", "rgba(139,92,246,0.12)", "#a78bfa", "#8B5CF6", formatDate(l.last_contact))
      ).join("");

      const bookedRows = bookedRecent.map(l =>
        leadRow(l, "Confirmed", "rgba(74,222,128,0.12)", "#4ade80", "#4ade80", formatDate(l.last_contact))
      ).join("");

      const sectionBlock = (label: string, rows: string, emptyMsg: string) => `
        <tr><td style="padding:24px 36px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:14px">${label}</div>
          ${rows
            ? `<table cellpadding="0" cellspacing="0" style="width:100%">${rows}</table>`
            : `<div style="font-size:13px;color:rgba(255,255,255,0.25);font-style:italic">${emptyMsg}</div>`
          }
        </td></tr>`;

      const displayName = profile.display_name || email.split("@")[0];

      const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif">
<table cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;margin:24px auto;background:#0a0a0a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">

  <tr><td style="padding:32px 36px 24px;border-bottom:1px solid rgba(255,255,255,0.07)">
    <table cellpadding="0" cellspacing="0" style="margin-bottom:18px"><tr>
      <td><img src="https://rackagentur.github.io/NoxReach/public/nr-icon.png" width="38" height="38" style="border-radius:10px;display:block" alt="NR"></td>
      <td style="padding-left:10px"><img src="https://rackagentur.github.io/NoxReach/public/nr-wordmark.png" height="20" style="display:block" alt="NoxReach"></td>
    </tr></table>
    <div style="font-size:22px;font-weight:600;color:#fff;letter-spacing:-0.4px;margin-bottom:4px">Your weekly pipeline digest</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.4)">${dateLabel}</div>
  </td></tr>

  <tr><td>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-bottom:1px solid rgba(255,255,255,0.07)"><tr>
      <td style="width:16%;padding:20px 16px;text-align:center;border-right:1px solid rgba(255,255,255,0.05)">
        <div style="font-size:26px;font-weight:600;color:${allDue.length > 0 ? "#f97316" : "#D4AF37"};letter-spacing:-1px;line-height:1;margin-bottom:4px">${allDue.length}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3">Follow-ups due</div>
      </td>
      <td style="width:16%;padding:20px 16px;text-align:center;border-right:1px solid rgba(255,255,255,0.05)">
        <div style="font-size:26px;font-weight:600;color:#8B5CF6;letter-spacing:-1px;line-height:1;margin-bottom:4px">${replied.length}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3">Replied — act</div>
      </td>
      <td style="width:16%;padding:20px 16px;text-align:center;border-right:1px solid rgba(255,255,255,0.05)">
        <div style="font-size:26px;font-weight:600;color:#4ade80;letter-spacing:-1px;line-height:1;margin-bottom:4px">${bookedRecent.length}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3">Booked this week</div>
      </td>
      <td style="width:16%;padding:20px 16px;text-align:center">
        <div style="font-size:26px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:-1px;line-height:1;margin-bottom:4px">${active.length}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3">Active leads</div>
      </td>
      <td style="width:16%;padding:20px 16px;text-align:center;border-left:1px solid rgba(255,255,255,0.05)">
        <div style="font-size:26px;font-weight:600;color:#D4AF37;letter-spacing:-1px;line-height:1;margin-bottom:4px">€${totalFees.toLocaleString()}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3">Total fees</div>
      </td>
      <td style="width:16%;padding:20px 16px;text-align:center;border-left:1px solid rgba(255,255,255,0.05)">
        <div style="font-size:26px;font-weight:600;color:${depositDue > 0 ? "#f97316" : "rgba(255,255,255,0.45)"};letter-spacing:-1px;line-height:1;margin-bottom:4px">${depositDue}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3">Deposit due</div>
      </td>
    </tr></table>
  </td></tr>

  ${sectionBlock("Follow-ups due", followupRows, "No follow-ups due — you're ahead of the pipeline.")}
  ${sectionBlock("Replied — needs your response", repliedRows, "No replied leads waiting.")}
  ${sectionBlock("Booked this week", bookedRows, "No new bookings this week — keep pushing.")}

  <tr><td style="background:#0a0a0a;padding:28px 36px;text-align:center">
    <a href="https://noxreach-nox.vercel.app" style="display:inline-block;background:#D4AF37;color:#0a0a0a;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.01em;margin-bottom:14px">Open NoxReach →</a>
    <div style="font-size:12px;color:rgba(255,255,255,0.25)">Your pipeline is waiting</div>
  </td></tr>

  <tr><td style="padding:14px 36px 24px;border-top:1px solid rgba(255,255,255,0.05);text-align:center">
    <div style="font-size:11px;color:rgba(255,255,255,0.2);letter-spacing:0.04em">Weekly digest · NoxReach · <a href="https://noxreach-nox.vercel.app" style="color:rgba(255,255,255,0.2)">Unsubscribe</a></div>
  </td></tr>

</table>
</body></html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "NoxReach <digest@soundofgeez.com>",
          to: [email],
          subject: `NoxReach digest — ${allDue.length} follow-up${allDue.length !== 1 ? "s" : ""} due · ${dateLabel}`,
          html,
        }),
      });

      const result = await res.json();
      results.push({ email, result });
    }

    return new Response(JSON.stringify({ ok: true, sent: results.length, results }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
