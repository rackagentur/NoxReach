#!/usr/bin/env python3
"""
NoxReach — Add onboarding checklist to App.jsx
Run from repo root: python3 add_onboarding.py
"""

with open('src/App.jsx', 'r') as f:
    content = f.read()

original = content

# ─── FIX 1: Add onboarding state to NoxReachApp ──────────────────────────────
# Inject after the showWelcomePro state line
OLD1 = '  const [showWelcomePro, setShowWelcomePro] = useState(false);'
NEW1 = '''  const [showWelcomePro, setShowWelcomePro] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    try { return localStorage.getItem("noxreach_onboarding_done_" + user.id) === "true"; } catch { return false; }
  });'''
content = content.replace(OLD1, NEW1)

# ─── FIX 2: Add OnboardingBanner component before NoxReachApp ────────────────
ONBOARDING_COMPONENT = '''
// ─── Onboarding Banner ────────────────────────────────────────────────────────

function OnboardingBanner({ leads, assets, onNavigate, onDismiss }) {
  const hasLeads    = leads.filter(l => !l.archived).length >= 5;
  const hasSentMsg  = leads.filter(l => !l.archived && l.stage !== "target").length >= 1;
  const hasAssets   = assets && (assets.epk_url || assets.soundcloud || assets.booking_email);

  const steps = [
    {
      num: "01",
      title: "Add your first 5 leads",
      desc: "Venues, promoters, festivals — tier them A1 to A3.",
      done: hasLeads,
      action: () => onNavigate("pipeline"),
      cta: "Add Lead →",
    },
    {
      num: "02",
      title: "Send your first outreach",
      desc: "Use a template to start the conversation.",
      done: hasSentMsg,
      action: () => onNavigate("outreach"),
      cta: "Open Templates →",
      locked: !hasLeads,
    },
    {
      num: "03",
      title: "Fill in your asset kit",
      desc: "EPK, mix link, booking email — ready to paste.",
      done: hasAssets,
      action: () => onNavigate("assets"),
      cta: "Fill in now →",
      locked: !hasSentMsg,
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const allDone   = doneCount === 3;

  return (
    <div style={{
      background: allDone ? COLORS.greenDim : COLORS.purpleBg,
      border: `1px solid ${allDone ? COLORS.green + "44" : COLORS.purpleDim}`,
      borderRadius: 14, padding: "20px 24px", marginBottom: 24, position: "relative",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: allDone ? 8 : 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: allDone ? COLORS.green : COLORS.text, marginBottom: 3 }}>
            {allDone ? "✓ You're all set — now keep the momentum" : "Get started with NoxReach"}
          </div>
          {!allDone && (
            <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{doneCount} of 3 done</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Progress bar */}
          {!allDone && (
            <div style={{ width: 80, height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(doneCount / 3) * 100}%`, background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight})`, borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>
          )}
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>×</button>
        </div>
      </div>

      {/* Steps */}
      {!allDone && (
        <div style={{ display: "flex", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              flex: 1, background: step.done ? COLORS.green + "11" : step.locked ? "transparent" : COLORS.surface,
              border: `1px solid ${step.done ? COLORS.green + "44" : step.locked ? COLORS.border : COLORS.borderBright}`,
              borderRadius: 10, padding: "14px 16px", opacity: step.locked ? 0.4 : 1,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: step.done ? COLORS.green : COLORS.purpleBg,
                  border: `1.5px solid ${step.done ? COLORS.green : COLORS.purpleDim}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: step.done ? "#000" : COLORS.purple,
                }}>
                  {step.done ? "✓" : step.num}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: step.done ? COLORS.green : COLORS.text, textDecoration: step.done ? "line-through" : "none", opacity: step.done ? 0.7 : 1 }}>
                  {step.title}
                </div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{step.desc}</div>
              {!step.done && !step.locked && (
                <button onClick={step.action} style={{
                  fontSize: 11, fontWeight: 700, color: COLORS.purpleLight,
                  background: "none", border: `1px solid ${COLORS.purpleDim}`,
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                }}>
                  {step.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'''

# Insert before NoxReachApp function
OLD2 = 'function NoxReachApp({ user, session, supabase }) {'
NEW2 = ONBOARDING_COMPONENT + 'function NoxReachApp({ user, session, supabase }) {'
content = content.replace(OLD2, NEW2)

# ─── FIX 3: Load assets in NoxReachApp for onboarding check ──────────────────
OLD3 = '  const [customTags, setCustomTags]     = useState(() => loadCustomTags());'
NEW3 = '''  const [customTags, setCustomTags]     = useState(() => loadCustomTags());
  const [onboardingAssets, setOnboardingAssets] = useState(null);

  // Load assets for onboarding check
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("user_assets").select("epk_url,soundcloud,booking_email").eq("user_id", user.id).single()
      .then(({ data }) => setOnboardingAssets(data || {}));
  }, [user?.id]);'''
content = content.replace(OLD3, NEW3)

# ─── FIX 4: Dismiss handler ───────────────────────────────────────────────────
OLD4 = '  const [showWelcomePro, setShowWelcomePro] = useState(false);'
NEW4 = '''  const [showWelcomePro, setShowWelcomePro] = useState(false);'''
# Already handled above, skip

# ─── FIX 5: Inject banner into Dashboard view ─────────────────────────────────
OLD5 = '          {activeTab === "dashboard" && <DashboardView leads={leads} onNavigate={setActiveTab} isPro={isPro} onUpgradeClick={requestUpgrade} TAG_COLORS={TAG_COLORS} />}'
NEW5 = '''          {activeTab === "dashboard" && (
            <>
              {!onboardingDismissed && (
                <OnboardingBanner
                  leads={leads}
                  assets={onboardingAssets}
                  onNavigate={tab => { setActiveTab(tab); }}
                  onDismiss={() => {
                    setOnboardingDismissed(true);
                    try { localStorage.setItem("noxreach_onboarding_done_" + user.id, "true"); } catch {}
                  }}
                />
              )}
              <DashboardView leads={leads} onNavigate={setActiveTab} isPro={isPro} onUpgradeClick={requestUpgrade} TAG_COLORS={TAG_COLORS} />
            </>
          )}'''
content = content.replace(OLD5, NEW5)

with open('src/App.jsx', 'w') as f:
    f.write(content)

changed = content != original
print(f"Changed: {changed}")
print(f"OnboardingBanner component added: {'OnboardingBanner' in content}")
print(f"Banner injected into dashboard: {'onboardingDismissed' in content}")
print(f"Assets loaded for onboarding: {'onboardingAssets' in content}")
print(f"Step logic present: {'hasLeads' in content}")
