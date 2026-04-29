import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://ckttttvgvpvflgjzkbmy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdHR0dHZndnB2ZmxnanprYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODc4MzcsImV4cCI6MjA5MjQ2MzgzN30.25WvWNkI3ULQZuelqfv_V6YlsBFT74AjPhVua6tB4KU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);


// ── Auth Styles (injected once) ───────────────────────────────────────────────
const AUTH_CSS = `
  @keyframes authFadeIn  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes authGlow    { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes authSpin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes authPulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes gridScroll  { from { transform: translateY(0); } to { transform: translateY(80px); } }
`;

// ── LoginScreen ───────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }) {
  const [mode, setMode]       = useState("login"); // login | signup | reset
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const C = {
    bg: "#060608", surface: "#0f0f18", border: "#1c1c2e", border2: "#252538",
    purple: "#6B2FD4", purpleL: "#8B4FFF", cyan: "#00D4FF",
    text: "#f0f0f0", text2: "#9090a8", text3: "#50506a",
    gold: "#D4AF37", green: "#22C55E", red: "#ef4444",
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    background: C.surface, border: `1px solid ${C.border2}`,
    borderRadius: 10, color: C.text, fontSize: 14, outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
    WebkitBoxShadow: `0 0 0 1000px ${C.surface} inset`,
WebkitTextFillColor: C.text,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth(data.session, data.user);
      } else if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name.trim() } }
        });
        if (err) throw err;
        if (data.session) {
          onAuth(data.session, data.user);
        } else {
          setSuccess("Account created! Check your email to confirm, then log in.");
          setMode("login");
        }
      } else if (mode === "reset") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (err) throw err;
        setSuccess("Password reset email sent. Check your inbox.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, position: "relative", overflow: "hidden",
    }}>
      <style>{AUTH_CSS}</style>

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        animation: "gridScroll 8s linear infinite",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        width: 700, height: 500,
        background: "radial-gradient(ellipse, rgba(107,47,212,0.15) 0%, rgba(0,212,255,0.04) 50%, transparent 70%)",
        pointerEvents: "none", animation: "authGlow 4s ease infinite",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 420, padding: "0 24px",
        animation: "authFadeIn 0.5s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="https://rackagentur.github.io/NoxReach/public/nr-icon.png" width="52" height="52" style={{ borderRadius: 13, marginBottom: 14, display: "block", margin: "0 auto 14px" }} alt="NR" />
          <img src="https://rackagentur.github.io/NoxReach/public/nr-wordmark.png" height="18" style={{ display: "block", margin: "0 auto 6px", opacity: 0.9 }} alt="NoxReach" />
          <div style={{ fontSize: 11, color: C.cyan, letterSpacing: "0.14em", opacity: 0.8, marginTop: 2 }}>NIGHTLIFE OS</div>
        </div>

        {/* Form card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border2}`,
          borderRadius: 16, padding: "32px 28px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}>
          {/* Tab switcher */}
          {mode !== "reset" && (
            <div style={{
              display: "flex", gap: 2, marginBottom: 28,
              background: "#0a0a10", borderRadius: 10, padding: 3,
            }}>
              {[["login", "Log in"], ["signup", "Sign up"]].map(([m, label]) => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    background: mode === m ? C.purple : "transparent",
                    color: mode === m ? "#fff" : C.text2,
                    transition: "all 0.15s",
                  }}
                >{label}</button>
              ))}
            </div>
          )}

          {mode === "reset" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Reset password</div>
              <div style={{ fontSize: 13, color: C.text2 }}>Enter your email and we'll send a reset link.</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>Name</div>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your DJ name or full name"
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = C.purple}
                  onBlur={e => e.target.style.borderColor = C.border2}
                />
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>Email</div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle} required
                onFocus={e => e.target.style.borderColor = C.purple}
                onBlur={e => e.target.style.borderColor = C.border2}
              />
            </div>

            {mode !== "reset" && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>Password</div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = C.purple}
                  onBlur={e => e.target.style.borderColor = C.border2}
                />
              </div>
            )}

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                color: C.red, fontSize: 13, lineHeight: 1.5,
              }}>{error}</div>
            )}
            {success && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                color: C.green, fontSize: 13, lineHeight: 1.5,
              }}>{success}</div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "13px 0", borderRadius: 10, border: "none",
              background: loading ? C.purpleL + "88" : `linear-gradient(135deg, ${C.purple}, ${C.purpleL})`,
              color: "#fff", fontSize: 14, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading ? "none" : "0 4px 20px rgba(107,47,212,0.4)",
              transition: "all 0.15s",
            }}>
              {loading ? (
                <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff6", borderTopColor: "#fff", borderRadius: "50%", animation: "authSpin 0.7s linear infinite" }} /> Processing...</>
              ) : mode === "login" ? "Log in →" : mode === "signup" ? "Create account →" : "Send reset link →"}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: 20, textAlign: "center", display: "flex", justifyContent: "center", gap: 20 }}>
            {mode === "login" && (
              <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: C.text3, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Forgot password?
              </button>
            )}
            {mode === "reset" && (
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: C.text3, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                ← Back to log in
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.text3 }}>
          Built for DJs who book with intent.
        </div>
      </div>
    </div>
  );
}

// ── AuthGate ─────────────────────────────────────────────────────────────────
// Wraps the whole app — shows login screen until authenticated
function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [user, setUser]       = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (session === undefined) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#060608", flexDirection: "column", gap: 16,
      }}>
        <style>{AUTH_CSS}</style>
        <div style={{
          width: 40, height: 40, border: "2px solid #1c1c2e",
          borderTopColor: "#6B2FD4", borderRadius: "50%",
          animation: "authSpin 0.7s linear infinite",
        }} />
        <div style={{ fontSize: 12, color: "#50506a", letterSpacing: "0.1em" }}>LOADING NOXREACH</div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <LoginScreen onAuth={(s, u) => { setSession(s); setUser(u); }} />;
  }

  // Logged in — render the app with user context
  return children({ user, session, supabase });
}


const COLORS = {
  bg: "#0A0A0A", surface: "#111111", surfaceHover: "#181818",
  border: "#1E1E1E", borderBright: "#2A2A2A",
  purple: "#6B2FD4", purpleLight: "#8B4FFF", purpleDim: "#3A1A80", purpleBg: "#0F0820",
  gold: "#D4AF37", goldDim: "#8A7020",
  text: "#F0F0F0", textSecondary: "#888888", textMuted: "#444444",
  green: "#22C55E", greenDim: "#0F4A25", red: "#EF4444",
};

const STAGES = [
  { id: "target",    label: "Target",      color: "#444444" },
  { id: "contacted", label: "Contacted",   color: "#7B3FE4" },
  { id: "followup1", label: "Follow-up 1", color: "#9B5FFF" },
  { id: "followup2", label: "Follow-up 2", color: "#D4AF37" },
  { id: "replied",   label: "Replied",     color: "#22C55E" },
  { id: "booked",    label: "Booked",      color: "#22C55E" },
];

const TEMPLATES = [
  { id: "berlin",   label: "Berlin",   tone: "Underground / Tech-House", icon: "◼", text: `Hey [Name],\n\nI've been building a sound around peak-hour Tech House — tribal-driven, energetic but controlled. Been playing [venue/night] lately and the response has been strong.\n\nWould love to get on your radar. Happy to send a recent mix + EPK.\n\n— GEEZ` },
  { id: "circuit",  label: "Circuit",  tone: "High energy / Tribal",     icon: "◈", text: `Hey [Name],\n\nI play circuit and tribal Tech House — the kind of sets that lock a room in for 4+ hours. I've played [events] and the energy has been incredible every time.\n\nWould love to discuss what a booking could look like. I can send my latest mix.\n\n— GEEZ` },
  { id: "disco",    label: "Disco",    tone: "Groovy / Soulful",         icon: "◇", text: `Hey [Name],\n\nI blend Disco soul with Tech House drive — it's a sound built for rooms that want to move without losing the groove. My recent sets at [venue] connected really well with that crowd.\n\nWould love to explore a potential booking. EPK and mix available on request.\n\n— GEEZ` },
  { id: "leverage", label: "Leverage", tone: "Warm connection",          icon: "◉", text: `Hey [Name],\n\n[Mutual contact] suggested I reach out — they thought my sound and your events would align.\n\nI play peak-hour Tech House and tribal circuit sets. I've been [recent gig/achievement] and would love to explore what a booking might look like.\n\nLet me know if you'd like a mix or EPK.\n\n— GEEZ` },
];

const INITIAL_LEADS = []; // New users start with empty pipeline

const TIER_COLORS = { A1: COLORS.gold, A2: COLORS.purple, A3: COLORS.textSecondary };

// Leads + Gigs now live in Supabase (per user), not localStorage
// localStorage kept only for settings, pro status, tags

const STORAGE_KEY_SETTINGS = "noxreach_settings_v1";
const DEFAULT_SETTINGS = { followup1Days: 5, followup2Days: 14 };
function loadSettings() { try { const r = localStorage.getItem(STORAGE_KEY_SETTINGS); if (r) return { ...DEFAULT_SETTINGS, ...JSON.parse(r) }; } catch {} return DEFAULT_SETTINGS; }
function saveSettings(s) { try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s)); } catch {} }

const STORAGE_KEY_PRO = "noxreach_pro_v1";
function loadIsPro(userId) { try { return localStorage.getItem(STORAGE_KEY_PRO + "_" + userId) === "true"; } catch { return false; } }
function saveIsPro(v, userId) { try { localStorage.setItem(STORAGE_KEY_PRO + "_" + userId, String(v)); } catch {} }
const FREE_LIMITS = { leads: 9999, gigs: 9999, templates: 9999 };

const STORAGE_KEY_TAGS = "noxreach_tags_v1";
const DEFAULT_TAGS = ["Tech-House", "Disco", "Festival"];
const TAG_PALETTE   = ["#7B3FE4","#3B82F6","#EC4899","#F59E0B","#F43F5E","#22C55E","#F97316","#14B8A6","#8B5CF6","#EAB308"];
function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}
function loadCustomTags() { try { const r = localStorage.getItem(STORAGE_KEY_TAGS); if (r) return JSON.parse(r); } catch {} return [...DEFAULT_TAGS]; }
function saveCustomTags(t) { try { localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(t)); } catch {} }

// Build a date string relative to today for sample data
const relDate = (daysFromNow) => { const d = new Date(); d.setDate(d.getDate() + daysFromNow); return d.toISOString().split("T")[0]; };

const INITIAL_GIGS = []; // New users start with empty calendar

const formatShortDate = (isoStr) => {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};



// ─── Primitives ──────────────────────────────────────────────────────────────

function Badge({ children, color = COLORS.purple }) {
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 4, background: color + "22", color, border: `1px solid ${color}44`, textTransform: "uppercase" }}>{children}</span>;
}

function FilterPill({ label, active, color = COLORS.purple, onClick, onClear }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20,
      cursor: "pointer", fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: "0.04em",
      background: active ? color + "33" : "transparent",
      border: `1px solid ${active ? color : COLORS.border}`,
      color: active ? color : COLORS.textSecondary, transition: "all 0.15s",
    }}>
      {label}
      {active && (
        <span onClick={e => { e.stopPropagation(); onClear(); }} style={{ marginLeft: 2, opacity: 0.7, fontWeight: 800, fontSize: 12, lineHeight: 1 }}>×</span>
      )}
    </button>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const icons  = { success: "✓", schedule: "⏰", info: "◈" };
  const colors = { success: COLORS.green, schedule: COLORS.gold, info: COLORS.purple };
  const color  = colors[toast.type] || COLORS.purple;
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 2000, animation: "toastIn 0.25s ease", background: COLORS.surface, border: `1px solid ${color}55`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`, minWidth: 260 }}>
      <style>{`@keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color, fontWeight: 800 }}>{icons[toast.type]}</div>
      <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{toast.msg}</span>
    </div>
  );
}

function Logo({ size = 24 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0F0820"/>
      {/* N */}
      <path d="M3 23V9h2.8l5.6 9.2V9H14v14h-2.8L5.6 13.8V23H3z" fill="url(#nl)"/>
      {/* R */}
      <path d="M16 9h5.2c2.1 0 3.8 1.7 3.8 3.8 0 1.5-.8 2.8-2.1 3.4L26 23h-3.2l-2.6-7.4H19V23h-3V9z M19 11.8v3.4h2.1c.7 0 1.3-.6 1.3-1.3v-.8c0-.7-.6-1.3-1.3-1.3H19z" fill="url(#rl)"/>
      {/* cyan reach line through center */}
      <line x1="10" y1="16" x2="22" y2="16" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.7"/>
      <defs>
        <linearGradient id="nl" x1="3" y1="9" x2="14" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B4FFF"/>
          <stop offset="100%" stopColor="#6B2FD4"/>
        </linearGradient>
        <linearGradient id="rl" x1="16" y1="9" x2="26" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D4FF"/>
          <stop offset="100%" stopColor="#8B4FFF"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Search + Filter Bar ─────────────────────────────────────────────────────

function SearchFilterBar({ search, setSearch, filters, setFilters, resultCount, totalCount, customTags, TAG_COLORS }) {
  const inputRef = useRef(null);
  const hasAnyFilter = search || filters.tier || filters.tag || filters.stage;
  const isFiltered = hasAnyFilter && resultCount < totalCount;
  const TIERS = ["A1", "A2", "A3"];

  const toggle = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? null : val }));
  const clearAll = () => { setSearch(""); setFilters({ tier: null, tag: null, stage: null }); };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Search row */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted, fontSize: 14, pointerEvents: "none" }}>⌕</span>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search venues, contacts, notes…"
            style={{
              width: "100%", padding: "9px 12px 9px 34px",
              background: COLORS.surface, border: `1px solid ${search ? COLORS.purple : COLORS.border}`,
              borderRadius: 9, color: COLORS.text, fontSize: 13, outline: "none",
              fontFamily: "inherit", transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = COLORS.purple}
            onBlur={e => { if (!search) e.target.style.borderColor = COLORS.border; }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
          )}
        </div>
        {hasAnyFilter && (
          <button onClick={clearAll} style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 9, color: COLORS.textSecondary, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            Clear all
          </button>
        )}
      </div>

      {/* Filter pills row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
        <span style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 }}>Filter</span>

        {TIERS.map(t => (
          <FilterPill key={t} label={t} active={filters.tier === t} color={TIER_COLORS[t]}
            onClick={() => toggle("tier", t)} onClear={() => toggle("tier", t)} />
        ))}

        <div style={{ width: 1, height: 16, background: COLORS.border, margin: "0 2px" }} />

        {customTags.map(t => (
          <FilterPill key={t} label={t} active={filters.tag === t} color={TAG_COLORS[t] || COLORS.purple}
            onClick={() => toggle("tag", t)} onClear={() => toggle("tag", t)} />
        ))}

        <div style={{ width: 1, height: 16, background: COLORS.border, margin: "0 2px" }} />

        {[
          { id: "target",    label: "Target",    color: "#444444", stages: ["target"] },
          { id: "contacted", label: "Contacted", color: "#7B3FE4", stages: ["contacted"] },
          { id: "followup",  label: "Follow-up", color: "#9B5FFF", stages: ["followup1","followup2"] },
          { id: "replied",   label: "Replied",   color: "#22C55E", stages: ["replied"] },
          { id: "booked",    label: "Booked",    color: "#D4AF37", stages: ["booked"] },
        ].map(s => (
          <FilterPill key={s.id} label={s.label} active={filters.stage === s.id} color={s.color}
            onClick={() => toggle("stage", s.id)} onClear={() => toggle("stage", s.id)} />
        ))}
      </div>

      {/* Result count */}
      {hasAnyFilter && (
        <div style={{ marginTop: 10, fontSize: 11, color: isFiltered ? COLORS.purple : COLORS.textMuted }}>
          {isFiltered
            ? `${resultCount} of ${totalCount} leads match`
            : `Showing all ${totalCount} leads`}
        </div>
      )}
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, onMove, onSelect, isSelected, onArchive, searchQuery, TAG_COLORS, onUpdateLead }) {
  const showInline = !lead.archived && ["contacted","followup1","followup2"].includes(lead.stage);
  const [contactLog, setContactLog] = useState(lead.contactLog || "");
  const [logSaved, setLogSaved] = useState(false);
  const METHODS = [
    { id: "email",     emoji: "📧", label: "Email", color: "#6B2FD4" },
    { id: "instagram", emoji: "📸", label: "DM",    color: "#E1306C" },
    { id: "phone",     emoji: "📞", label: "Phone", color: "#22C55E" },
    { id: "other",     emoji: "✶", label: "Other", color: "#D4AF37" },
  ];
  const handleMethod = (e, methodId) => { e.stopPropagation(); onUpdateLead && onUpdateLead(lead.id, { outreachMethod: methodId }); };
  const handleLogBlur = () => { if (contactLog !== (lead.contactLog || "")) { onUpdateLead && onUpdateLead(lead.id, { contactLog }); setLogSaved(true); setTimeout(() => setLogSaved(false), 1500); } };
  const stageIndex = STAGES.findIndex(s => s.id === lead.stage);
  const isOverdue  = lead.followUpDate && new Date(lead.followUpDate) <= new Date();
  const STAGE_COLORS = {
    target:    "#444444",
    contacted: "#3B82F6",
    followup1: "#7B3FE4",
    followup2: "#7B3FE4",
    replied:   "#00D4FF",
    booked:    "#D4AF37",
  };
  const stageBorder = STAGE_COLORS[lead.stage] || COLORS.border;

  // Highlight matching text
  const highlight = (text) => {
    if (!searchQuery || !text) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: COLORS.purple + "55", color: COLORS.purpleLight, borderRadius: 2, padding: "0 1px" }}>
          {text.slice(idx, idx + searchQuery.length)}
        </mark>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
        <div onClick={(e) => { if (e.target === e.currentTarget || !e.target.closest('button')) { onSelect(isSelected ? null : lead); } }} style={{

      background: isSelected ? COLORS.purpleBg : COLORS.surface,
      border: `1px solid ${isSelected ? COLORS.purple : lead.is_inbound && !lead.archived ? "#00D4FF" : isOverdue && !lead.archived ? COLORS.gold : lead.archived ? COLORS.border : stageBorder + "99"}`,
      borderRadius: 10, padding: "14px 16px", cursor: "pointer",
      transition: "all 0.15s ease", position: "relative", overflow: "hidden",
      opacity: lead.archived ? 0.45 : 1,
    }}>
      {isOverdue && !lead.archived && (
        <div style={{ position: "absolute", top: 0, right: 0, background: COLORS.gold, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderBottomLeftRadius: 6, letterSpacing: "0.1em" }}>FOLLOW UP</div>
      )}
      {lead.archived && (
        <div style={{ position: "absolute", top: 0, right: 0, background: COLORS.textMuted, color: COLORS.bg, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderBottomLeftRadius: 6, letterSpacing: "0.1em" }}>ARCHIVED</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingRight: (isOverdue && !lead.archived) ? 72 : 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{highlight(lead.name)}</div>
        {lead.stage === "followup1" && <Badge color="#9B5FFF">F1</Badge>}
        {lead.stage === "followup2" && <Badge color={COLORS.gold}>F2</Badge>}
        <Badge color={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <Badge color={TAG_COLORS[lead.tag] || COLORS.textSecondary}>{lead.tag}</Badge>
        {lead.is_inbound && <Badge color="#00D4FF" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF" }}>⬇ Inbound</Badge>}
      </div>
      {lead.notes && (
        <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.4, marginBottom: 10 }}>
          {highlight(lead.notes.slice(0, 60))}{lead.notes.length > 60 ? "…" : ""}
        </div>
      )}
      {!lead.archived ? (
        <div style={{ display: "flex", gap: 6 }}>
          {stageIndex > 0 && (
            <button onClick={e => { e.stopPropagation(); onMove(lead.id, STAGES[stageIndex - 1].id); }} style={{ flex: 1, padding: "5px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textSecondary, fontSize: 11, cursor: "pointer" }}>← Back</button>
          )}
          {stageIndex < STAGES.length - 1 && (
            <button onClick={e => { e.stopPropagation(); onMove(lead.id, STAGES[stageIndex + 1].id); }} style={{ flex: 2, padding: "5px", background: stageIndex === STAGES.length - 2 ? "rgba(0,212,255,0.15)" : COLORS.purple + "33", border: `1px solid ${stageIndex === STAGES.length - 2 ? "rgba(0,212,255,0.5)" : COLORS.purple + "66"}`, borderRadius: 6, color: stageIndex === STAGES.length - 2 ? "#00D4FF" : COLORS.purpleLight, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
              {stageIndex === STAGES.length - 2 ? "✓ Book" : "Advance →"}
            </button>
          )}
          {lead.stage === "replied" ? (
            <button onClick={e => { e.stopPropagation(); onArchive(lead.id); }} style={{ padding: "5px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 6, color: COLORS.red, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 }}>Not this time</button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onArchive(lead.id); }} title="Archive" style={{ padding: "5px 8px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textMuted, fontSize: 11, cursor: "pointer" }}>◻</button>
          )}
        </div>
      ) : (
        <button onClick={e => { e.stopPropagation(); onArchive(lead.id); }} style={{ width: "100%", padding: "5px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textSecondary, fontSize: 11, cursor: "pointer" }}>↩ Restore</button>
      )}
      {showInline && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>How did you reach out?</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {METHODS.map(m => {
              const active = lead.outreachMethod === m.id;
              return (
                <button key={m.id} onClick={e => handleMethod(e, m.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, cursor: "pointer", background: active ? m.color + "33" : COLORS.bg, border: `1px solid ${active ? m.color : COLORS.border}`, color: active ? m.color : COLORS.textSecondary, fontSize: 11, fontWeight: active ? 700 : 500, transition: "all 0.15s" }}><span style={{ fontSize: 13 }}>{m.emoji}</span><span>{m.label}</span></button>
              );
            })}
          </div>
          <textarea value={contactLog} onChange={e => setContactLog(e.target.value)} onBlur={handleLogBlur} onClick={e => e.stopPropagation()} placeholder="How did it go? Quick note..." rows={2} style={{ width: "100%", background: COLORS.bg, border: `1px solid ${logSaved ? COLORS.green : COLORS.border}`, borderRadius: 6, padding: "6px 8px", color: COLORS.text, fontSize: 11, outline: "none", fontFamily: "inherit", resize: "none", lineHeight: 1.5, transition: "border-color 0.2s" }} />
          {logSaved && <div style={{ fontSize: 9, color: COLORS.green, marginTop: 3 }}>Saved</div>}
        </div>
      )}
    </div>
  );
}

// ─── Pipeline View ────────────────────────────────────────────────────────────

function PipelineView({ leads, onMove, onSelect, selectedLead, onArchive, search, filters, TAG_COLORS, customTags, onUpdateLead }) {
  const [showArchived, setShowArchived] = useState(false);

  const applyFilters = (list) => list.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      const hit = [l.name, l.contact, l.instagram, l.notes, l.tag, l.tier].some(f => f && f.toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (filters.tier  && l.tier    !== filters.tier)  return false;
    if (filters.tag   && l.tag     !== filters.tag)   return false;
    if (filters.stage) {
      const stageMap = { followup: ["followup1","followup2"] };
      const allowed = stageMap[filters.stage] || [filters.stage];
      if (!allowed.includes(l.stage)) return false;
    }
    return true;
  });

  const activeLeads   = applyFilters(leads.filter(l => !l.archived));
  const archivedLeads = applyFilters(leads.filter(l =>  l.archived));
  const hasFilter     = search || filters.tier || filters.tag || filters.stage;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setShowArchived(false)} style={{ padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: !showArchived ? COLORS.purpleBg : "transparent", border: `1px solid ${!showArchived ? COLORS.purple : COLORS.border}`, color: !showArchived ? COLORS.purpleLight : COLORS.textSecondary }}>
          Active <span style={{ fontFamily: "'DM Mono', monospace", marginLeft: 4 }}>{leads.filter(l => !l.archived).length}</span>
        </button>
        <button onClick={() => setShowArchived(true)} style={{ padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: showArchived ? COLORS.surface : "transparent", border: `1px solid ${showArchived ? COLORS.borderBright : COLORS.border}`, color: showArchived ? COLORS.textSecondary : COLORS.textMuted }}>
          Archived <span style={{ fontFamily: "'DM Mono', monospace", marginLeft: 4 }}>{leads.filter(l => l.archived).length}</span>
        </button>
        {hasFilter && (
          <div style={{ marginLeft: 4, fontSize: 11, color: COLORS.purple }}>
            {(showArchived ? archivedLeads : activeLeads).length} result{(showArchived ? archivedLeads : activeLeads).length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showArchived ? (
        <div>
          {archivedLeads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: COLORS.textMuted, fontSize: 13 }}>
              {hasFilter ? "No archived leads match your filters" : "No archived leads yet"}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {archivedLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onMove={onMove} onSelect={onSelect} isSelected={selectedLead?.id === lead.id} onArchive={onArchive} searchQuery={search} TAG_COLORS={TAG_COLORS} onUpdateLead={onUpdateLead} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {[
            { id: "target",    label: "Target",    color: "#444444", stages: ["target"] },
            { id: "contacted", label: "Contacted", color: "#7B3FE4", stages: ["contacted"] },
            { id: "followup",  label: "Follow-up", color: "#9B5FFF", stages: ["followup1","followup2"] },
            { id: "replied",   label: "Replied",   color: "#22C55E", stages: ["replied"] },
            { id: "booked",    label: "Booked",    color: "#D4AF37", stages: ["booked"] },
          ].map(col => {
            const isFiltered = filters.stage && !col.stages.includes(filters.stage);
            const colLeads = activeLeads.filter(l => col.stages.includes(l.stage));
            return (
              <div key={col.id} style={{ minWidth: 220, flex: 1, opacity: isFiltered ? 0.3 : 1, transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: colLeads.length > 0 ? COLORS.textSecondary : COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>{colLeads.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 100 }}>
                  {colLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onMove={onMove} onSelect={onSelect} isSelected={selectedLead?.id === lead.id} onArchive={onArchive} searchQuery={search} TAG_COLORS={TAG_COLORS} onUpdateLead={onUpdateLead} />
                  ))}
                  {colLeads.length === 0 && (
                    <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 10, padding: "20px 14px", textAlign: "center" }}>
                      {hasFilter ? (
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>No matches</div>
                      ) : col.id === "replied" ? (
                        <>
                          <div style={{ fontSize: 16, marginBottom: 6 }}>✉</div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>No replies yet</div>
                          <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 4 }}>Keep following up — replies come with persistence</div>
                        </>
                      ) : col.id === "booked" ? (
                        <>
                          <div style={{ fontSize: 16, marginBottom: 6 }}>📅</div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>No bookings yet</div>
                          <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 4 }}>Your first confirmed gig starts with one follow-up</div>
                        </>
                      ) : col.id === "target" ? (
                        <>
                          <div style={{ fontSize: 11, color: COLORS.textMuted }}>Add your first lead →</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>Empty</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Lead Detail ──────────────────────────────────────────────────────────────

function AssetCopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{label}</span>
      <button onClick={copy} style={{
        fontSize: 10, fontWeight: 700, cursor: "pointer",
        color: copied ? COLORS.green : COLORS.purple,
        background: copied ? COLORS.green + "15" : "none",
        border: `1px solid ${copied ? COLORS.green + "55" : COLORS.purpleDim}`,
        borderRadius: 5, padding: "2px 8px",
        transition: "all 0.2s",
      }}>{copied ? "✓ Copied!" : "Copy →"}</button>
    </div>
  );
}

function LeadDetail({ lead, onClose, onMove, onArchive, onDelete, supabase, userId, onUpdate, TAG_COLORS, assets }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: lead.name || "",
    contact: lead.contact || "",
    instagram: lead.instagram || "",
    notes: lead.notes || "",
    follow_up_date: lead.follow_up_date || "",
  });
  const [saving, setSaving] = useState(false);

  // Keep form in sync if lead changes (switching cards)
  useEffect(() => {
    setForm({
      name: lead.name || "",
      contact: lead.contact || "",
      instagram: lead.instagram || "",
      notes: lead.notes || "",
      follow_up_date: lead.follow_up_date || "",
    });
    setEditing(false);
  }, [lead.id]);

  const stageIndex = STAGES.findIndex(s => s.id === lead.stage);
  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) <= new Date();

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        name: form.name.trim(),
        contact: form.contact.trim(),
        instagram: form.instagram.trim(),
        notes: form.notes.trim(),
        follow_up_date: form.follow_up_date || null,
      };
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", lead.id)
        .eq("user_id", userId);
      if (!error) {
        onUpdate({ ...lead, ...updates });
        setEditing(false);
      }
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

   const inputStyle = {
  width: "100%",
  background: COLORS.bg,
  WebkitBoxShadow: `0 0 0 1000px ${COLORS.bg} inset`,
  WebkitTextFillColor: COLORS.text,
  colorScheme: "dark",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: "6px 10px",
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    marginTop: 3,
  };

  const labelStyle = {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: 12,
  };

  return (
    <div style={{
      width: 280,
      borderLeft: `1px solid ${COLORS.border}`,
      background: COLORS.surface,
      display: "flex",
      flexDirection: "column",
      padding: "14px 16px",
      overflowY: "auto",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoComplete="off" style={{ ...inputStyle, fontSize: 14, fontWeight: 700, marginTop: 0 }}
              autoFocus
            />
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, lineHeight: 1.3 }}>{lead.name}</div>
          )}
          <Badge color={TIER_COLORS[lead.tier]} style={{ marginTop: 4 }}>{lead.tier}</Badge>
          {lead.tag && <Badge color={TAG_COLORS?.[lead.tag] || COLORS.purple} style={{ marginTop: 4, marginLeft: 4 }}>{lead.tag}</Badge>}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ fontSize: 11, padding: "4px 10px", background: COLORS.purple, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                {saving ? "…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setForm({ name: lead.name || "", contact: lead.contact || "", instagram: lead.instagram || "", notes: lead.notes || "", follow_up_date: lead.follow_up_date || "" }); }}
                style={{ fontSize: 11, padding: "4px 8px", background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{ fontSize: 11, padding: "4px 10px", background: "transparent", color: COLORS.textSecondary, border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer" }}
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}
          >×</button>
        </div>
      </div>

      {/* Follow-up overdue badge */}
      {isOverdue && !lead.archived && (
        <div style={{ background: COLORS.gold + "22", border: `1px solid ${COLORS.gold}44`, borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: COLORS.gold, fontWeight: 600 }}>Follow-up overdue</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted }}>{formatShortDate(lead.follow_up_date)}</div>
        </div>
      )}

      {/* Post-booking mini-pipeline */}
      {!lead.archived && lead.stage === "booked" && (() => {
        const BOOKING_STEPS = [
          { id: "fee_confirmed",    label: "Fee confirmed",   required: true },
          { id: "contract_sent",    label: "Contract sent",   required: false },
          { id: "contract_signed",  label: "Contract signed", required: false },
          { id: "confirmed",        label: "Confirmed",       required: false },
        ];
        const status = lead.bookingStatus || [];
        const allDone = BOOKING_STEPS.every(s => status.includes(s.id));
        const toggle = async (stepId) => {
          const next = status.includes(stepId)
            ? status.filter(s => s !== stepId)
            : [...status, stepId];
          const { error } = await supabase.from("leads").update({ booking_status: next }).eq("id", lead.id).eq("user_id", userId);
          if (!error) onUpdate({ ...lead, bookingStatus: next });
        };
        return (
          <div style={{ background: allDone ? COLORS.gold + "11" : COLORS.surface, border: `1px solid ${allDone ? COLORS.gold + "44" : COLORS.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: allDone ? COLORS.gold : COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
              {allDone ? "✓ Booking complete" : "Booking checklist"}
            </div>
            {BOOKING_STEPS.map((step, i) => {
              const done = status.includes(step.id);
              return (
                <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < BOOKING_STEPS.length - 1 ? `1px solid ${COLORS.border}22` : "none" }}>
                  <button
                    onClick={() => toggle(step.id)}
                    style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${done ? COLORS.gold : COLORS.border}`, background: done ? COLORS.gold : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >
                    {done && <span style={{ fontSize: 10, color: "#000", fontWeight: 700 }}>✓</span>}
                  </button>
                  <span style={{ fontSize: 12, color: done ? COLORS.text : COLORS.textMuted, textDecoration: done ? "none" : "none", fontWeight: done ? 600 : 400 }}>{step.label}</span>
                  {!step.required && !done && <span style={{ fontSize: 9, color: COLORS.textMuted, marginLeft: "auto", opacity: 0.6 }}>optional</span>}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Mark as Contacted */}
      {!lead.archived && lead.stage === "target" && (
        <button
          onClick={() => onMove(lead.id, "contacted")}
          style={{ width: "100%", padding: "8px 0", background: COLORS.purple, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 12 }}
        >
          Mark as Contacted
          <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Follow-up reminder in 5 days</div>
        </button>
      )}

      {/* EPK prompt on Replied */}
      {!lead.archived && lead.stage === "replied" && assets && (assets?.epk_url || assets?.soundcloud || assets?.booking_email) && (
        <div style={{ background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", marginBottom: 8 }}>✓ They replied — send your kit</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              assets?.epk_url      && { label: "EPK PDF",       value: assets.epk_url },
              assets?.soundcloud   && { label: "SoundCloud",    value: assets.soundcloud },
              assets?.booking_email && { label: "Booking email", value: assets.booking_email },
            ].filter(Boolean).map(item => (
              <AssetCopyRow key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      )}

      {/* Fields */}
      <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Contact Info</div>

      <div style={labelStyle}>Email</div>
      {editing ? (
        <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} style={inputStyle} placeholder="booking@venue.com" />
      ) : (
        <div style={{ fontSize: 12, color: COLORS.text, marginTop: 3 }}>{lead.contact || <span style={{ color: COLORS.textMuted }}>—</span>}</div>
      )}

      <div style={labelStyle}>Instagram</div>
      {editing ? (
        <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} style={inputStyle} placeholder="https://instagram.com/venue" />
      ) : (
        <div style={{ fontSize: 12, color: COLORS.text, marginTop: 3, wordBreak: "break-all" }}>{lead.instagram || <span style={{ color: COLORS.textMuted }}>—</span>}</div>
      )}

      <div style={labelStyle}>Follow-up Date</div>
      {editing ? (
        <input type="date" value={form.follow_up_date} onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} style={{ ...inputStyle, colorScheme: "dark" }} />
      ) : (
        <div style={{ fontSize: 12, color: COLORS.text, marginTop: 3 }}>{lead.follow_up_date ? formatShortDate(lead.follow_up_date) : <span style={{ color: COLORS.textMuted }}>Not set</span>}</div>
      )}

      <div style={labelStyle}>Last Contact</div>
      <div style={{ fontSize: 12, color: COLORS.text, marginTop: 3 }}>{lead.last_contact || <span style={{ color: COLORS.textMuted }}>Never</span>}</div>

      {/* Fee — booked leads only */}
      {lead.stage === "booked" && (
        <div style={{ display: "flex", gap: 10, marginTop: 14, marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...labelStyle }}>Fee (€)</div>
            <input
              type="number"
              key={lead.id + "fee"}
              defaultValue={lead.fee || ""}
              onBlur={async e => { const v = parseInt(e.target.value); if (!isNaN(v)) { await supabase.from("leads").update({ fee: v }).eq("id", lead.id).eq("user_id", userId); onUpdate({ ...lead, fee: v }); } }}
              placeholder="e.g. 800"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "7px 10px", color: COLORS.text, fontSize: 13, marginTop: 3, colorScheme: "dark" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...labelStyle }}>Deposit</div>
            <div
              onClick={async () => { const newVal = !lead.deposit_paid; await supabase.from("leads").update({ deposit_paid: newVal }).eq("id", lead.id).eq("user_id", userId); onUpdate({ ...lead, deposit_paid: newVal }); }}
              style={{ cursor: "pointer", marginTop: 3, background: lead.deposit_paid ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${lead.deposit_paid ? "rgba(74,222,128,0.35)" : COLORS.border}`, borderRadius: 6, padding: "7px 10px", fontSize: 13, color: lead.deposit_paid ? "#4ade80" : COLORS.textMuted, textAlign: "center", userSelect: "none" }}
            >
              {lead.deposit_paid ? "Deposit received ✓" : "No deposit yet"}
            </div>
          </div>
        </div>
      )}
      {/* Notes */}
      <div style={{ ...labelStyle, marginTop: 14 }}>Notes</div>
      {editing ? (
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          autoComplete="off" style={{ ...inputStyle, minHeight: 72, resize: "vertical", marginTop: 3, colorScheme: "dark" }}
          placeholder="Context, connections, vibe of the venue…"
        />
      ) : (
        lead.notes ? (
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, color: COLORS.text, marginTop: 3, lineHeight: 1.5 }}>{lead.notes}</div>
        ) : (
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>—</div>
        )
      )}

      {/* Contact Log */}
      {(lead.contactLog || lead.outreachMethod) && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Contact Log</div>
          {lead.outreachMethod && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Via</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.purpleLight, textTransform: "capitalize" }}>{lead.outreachMethod === "instagram" ? "Instagram DM" : lead.outreachMethod}</span>
            </div>
          )}
          {lead.contactLog && (
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, color: COLORS.text, lineHeight: 1.5 }}>{lead.contactLog}</div>
          )}
        </div>
      )}

      {/* Stage tracker */}
      <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 16, marginBottom: 6 }}>All Stages</div>
      {STAGES.map(s => (
        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${COLORS.border}22` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
            <div style={{ fontSize: 12, color: lead.stage === s.id ? COLORS.text : COLORS.textMuted, fontWeight: lead.stage === s.id ? 600 : 400 }}>{s.label}</div>
          </div>
          {lead.stage === s.id && <span style={{ fontSize: 10, color: COLORS.purple, fontWeight: 600 }}>← current</span>}
        </div>
      ))}

      {/* Archive / Delete */}
      {!lead.archived && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={() => onArchive(lead.id)}
            style={{ fontSize: 11, padding: "6px 0", background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer" }}
          >
            ☐ Archive lead
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            style={{ fontSize: 11, padding: "6px 0", background: "transparent", color: COLORS.red, border: `1px solid ${COLORS.red}44`, borderRadius: 6, cursor: "pointer" }}
          >
            × Delete permanently
          </button>
        </div>
      )}
    </div>
  );
}


// ─── Add Lead Modal ───────────────────────────────────────────────────────────

function Input({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: COLORS.purple, marginLeft: 3 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit", transition: "border-color 0.15s", WebkitBoxShadow: `0 0 0 1000px ${COLORS.bg} inset`, WebkitTextFillColor: COLORS.text }}
        onFocus={e => e.target.style.borderColor = COLORS.purple}
        onBlur={e => e.target.style.borderColor = COLORS.border} />
    </div>
  );
}

function SelectPill({ options, value, onChange, colorMap }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map(opt => {
        const color  = colorMap?.[opt] || COLORS.purple;
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.15s", background: active ? color + "33" : "transparent", border: `1px solid ${active ? color : COLORS.border}`, color: active ? color : COLORS.textSecondary }}>{opt}</button>
        );
      })}
    </div>
  );
}

function AddGenreRow({ onAdd }) {
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handle = () => {
    const clean = input.trim();
    if (!clean) { setAdding(false); setError(""); return; }
    if (clean.length > 20) { setError("Max 20 characters"); return; }
    const ok = onAdd(clean);
    if (ok === false) { setError("Already exists"); return; }
    setInput(""); setAdding(false); setError("");
  };

  if (!adding) return (
    <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "transparent", border: `1px dashed ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 12, cursor: "pointer", width: "100%", textAlign: "left" }}>
      <span style={{ fontSize: 14 }}>+</span> Add genre
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          autoFocus
          value={input}
          onChange={e => { setInput(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") handle(); if (e.key === "Escape") { setAdding(false); setInput(""); setError(""); } }}
          placeholder="e.g. Afrobeats, Reggaeton…"
          style={{ flex: 1, padding: "9px 12px", background: COLORS.bg, border: `1px solid ${error ? COLORS.red : COLORS.purple}`, borderRadius: 8, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={handle} style={{ padding: "9px 16px", background: COLORS.purple, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
        <button onClick={() => { setAdding(false); setInput(""); setError(""); }} style={{ padding: "9px 10px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textSecondary, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>✕</button>
      </div>
      {error && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function GenreSelector({ tags, value, onChange, TAG_COLORS, onAddTag }) {
  const [adding, setAdding] = useState(false);
  const [input, setInput]   = useState("");
  const inputRef = useRef(null);

  const handleAdd = () => {
    const clean = input.trim();
    if (!clean) { setAdding(false); return; }
    onAddTag(clean);
    onChange(clean);
    setInput("");
    setAdding(false);
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {tags.map(tag => {
        const color  = TAG_COLORS[tag] || tagColor(tag);
        const active = value === tag;
        return (
          <button key={tag} onClick={() => onChange(tag)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.15s",
            background: active ? color + "33" : "transparent",
            border: `1px solid ${active ? color : COLORS.border}`,
            color: active ? color : COLORS.textSecondary,
          }}>{tag}</button>
        );
      })}
      {adding ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setInput(""); } }}
            placeholder="e.g. Afrobeats"
            style={{ padding: "5px 10px", background: COLORS.bg, border: `1px solid ${COLORS.purple}`, borderRadius: 20, color: COLORS.text, fontSize: 12, outline: "none", width: 110, fontFamily: "inherit" }}
          />
          <button onClick={handleAdd} style={{ padding: "5px 10px", background: COLORS.purple, border: "none", borderRadius: 20, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Add</button>
          <button onClick={() => { setAdding(false); setInput(""); }} style={{ padding: "5px 8px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 20, color: COLORS.textSecondary, fontSize: 11, cursor: "pointer" }}>✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{
          padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          cursor: "pointer", background: "transparent",
          border: `1px dashed ${COLORS.border}`, color: COLORS.textMuted,
          transition: "all 0.15s",
        }}>+ Add genre</button>
      )}
    </div>
  );
}

function AddLeadModal({ onClose, onAdd, customTags, TAG_COLORS, onAddTag }) {
  const EMPTY = { name: "", contact: "", instagram: "", tier: "A2", tag: "Tech-House", stage: "target", notes: "" };
  const [form, setForm]   = useState(EMPTY);
  const [step, setStep]   = useState(1);
  const [errors, setErrors] = useState({});
  const set = key => val  => setForm(f => ({ ...f, [key]: val }));
  const validateStep1 = () => { const e = {}; if (!form.name.trim()) e.name = "Venue name is required"; if (!form.contact.trim() && !form.instagram.trim()) e.contact = "Add at least one contact method"; setErrors(e); return !Object.keys(e).length; };
  const handleNext   = () => { if (validateStep1()) setStep(2); };
    const handleSubmit = () => { onAdd({ ...form, id: crypto.randomUUID(), followUpDate: null, lastContact: null }); onClose(); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderBright}`, borderRadius: 18, width: 480, maxWidth: "95vw", boxShadow: "0 0 60px rgba(123,63,228,0.15), 0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden", animation: "slideUp 0.2s ease" }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`}</style>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: COLORS.purple }}>+</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>New Lead</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 1 }}>Step {step} of 2 — {step === 1 ? "Contact info" : "Classification"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 5 }}>{[1,2].map(s => <div key={s} style={{ width: s === step ? 16 : 6, height: 6, borderRadius: 3, background: s === step ? COLORS.purple : s < step ? COLORS.purpleDim : COLORS.border, transition: "all 0.2s" }} />)}</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>
        </div>
        {step === 1 && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Venue / Promoter Name" value={form.name} onChange={set("name")} placeholder="e.g. Tresor Berlin" required />
            {errors.name    && <div style={{ fontSize: 11, color: COLORS.red, marginTop: -10 }}>{errors.name}</div>}
            <Input label="Email"     value={form.contact}   onChange={set("contact")}   placeholder="booking@venue.com" type="email" />
            <Input label="Instagram" value={form.instagram} onChange={set("instagram")} placeholder="@venuename" />
            {errors.contact && <div style={{ fontSize: 11, color: COLORS.red, marginTop: -10 }}>{errors.contact}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Notes</label>
              <textarea value={form.notes} onChange={e => set("notes")(e.target.value)} placeholder="Context, connections, vibe of the venue..." rows={3}
                style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 13, outline: "none", width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = COLORS.purple} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
          </div>
        )}
        {step === 2 && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Priority Tier <span style={{ color: COLORS.purple }}>*</span></label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ tier: "A1", desc: "Dream venues", color: COLORS.gold }, { tier: "A2", desc: "Strong targets", color: COLORS.purple }, { tier: "A3", desc: "Long shots", color: COLORS.textSecondary }].map(({ tier, desc, color }) => (
                  <button key={tier} onClick={() => set("tier")(tier)} style={{ flex: 1, padding: "12px 10px", borderRadius: 10, cursor: "pointer", background: form.tier === tier ? color + "22" : COLORS.bg, border: `1px solid ${form.tier === tier ? color : COLORS.border}`, transition: "all 0.15s", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: form.tier === tier ? color : COLORS.textSecondary }}>{tier}</div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 3 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Scene / Genre <span style={{ color: COLORS.purple }}>*</span></label>
              <GenreSelector tags={customTags} value={form.tag} onChange={set("tag")} TAG_COLORS={TAG_COLORS} onAddTag={(tag) => { if (onAddTag(tag)) set("tag")(tag); }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Pipeline Stage</label>
              <SelectPill options={STAGES.map(s => s.label)} value={STAGES.find(s => s.id === form.stage)?.label} onChange={label => set("stage")(STAGES.find(s => s.label === label)?.id)} colorMap={Object.fromEntries(STAGES.map(s => [s.label, s.color]))} />
            </div>
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Preview</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{form.name || "Venue Name"}</div>
                <div style={{ display: "flex", gap: 6 }}><Badge color={TIER_COLORS[form.tier]}>{form.tier}</Badge><Badge color={TAG_COLORS[form.tag]}>{form.tag}</Badge></div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{form.contact || form.instagram || "No contact yet"}</div>
            </div>
          </div>
        )}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
          {step === 1
            ? <button onClick={onClose}      style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 9, color: COLORS.textSecondary, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            : <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 9, color: COLORS.textSecondary, fontSize: 13, cursor: "pointer" }}>← Back</button>}
          {step === 1
            ? <button onClick={handleNext}   style={{ padding: "10px 28px", background: COLORS.purple, border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next →</button>
            : <button onClick={handleSubmit} style={{ padding: "10px 28px", background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`, border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(123,63,228,0.4)" }}>Add to Pipeline ✓</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Other Views (Outreach, Follow-ups, Dashboard, Assets) ───────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: "calc(50% - 7px)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent || COLORS.purple, opacity: 0.7 }} />
      <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent || COLORS.purple, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function DashboardView({ leads, onNavigate, isPro, onUpgradeClick }) {
  const today    = new Date();
  const active   = leads.filter(l => !l.archived);
  const booked   = active.filter(l => l.stage === "booked").length;
  const bookedLeadsAll = active.filter(l => l.stage === "booked");
  const totalRevenue = bookedLeadsAll.reduce((sum, l) => sum + (l.fee || 0), 0);
  const unpaidCount  = bookedLeadsAll.filter(l => l.fee && !l.deposit_paid).length;
  const replied  = active.filter(l => l.stage === "replied" || l.stage === "booked").length;
  const contacted = active.filter(l => l.stage !== "target").length;
  const replyRate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0;

  // Next Actions — leads that need action today, sorted by urgency
  const nextActions = active
    .filter(l => l.stage !== "booked" && l.stage !== "target")
    .map(l => {
      const daysAgo = l.followUpDate
        ? Math.ceil((today - new Date(l.followUpDate)) / (1000 * 60 * 60 * 24))
        : null;
      const isOverdue = daysAgo !== null && daysAgo >= 0;
      const stageIdx  = STAGES.findIndex(s => s.id === l.stage);
      const stageLabel = l.stage === "contacted" ? "F1" : l.stage === "followup1" ? "F2" : l.stage === "followup2" ? "F3" : l.stage === "replied" ? "Reply" : "?";
      const daysLabel  = l.followUpDate ? (isOverdue ? (daysAgo === 0 ? "Today" : `${daysAgo}d overdue`) : (Math.abs(daysAgo) === 1 ? "Tomorrow" : `in ${Math.abs(daysAgo)}d`)) : "No date set";
      const urgency    = isOverdue ? 0 : daysAgo !== null && Math.abs(daysAgo) <= 2 ? 1 : daysAgo === null ? 3 : 2;
      const urgencyColor = isOverdue ? COLORS.red : (daysAgo !== null && Math.abs(daysAgo) <= 2) ? COLORS.gold : COLORS.textSecondary;
      return { ...l, stageLabel, daysLabel, isOverdue, urgency, urgencyColor, stageIdx };
    })
    .sort((a, b) => a.urgency - b.urgency || (a.followUpDate || "z").localeCompare(b.followUpDate || "z"))
    .slice(0, 5);

  // Conversion funnel
  const total      = active.length;
  const fContacted = active.filter(l => l.stage !== "target").length;
  const fReplied   = active.filter(l => ["replied","booked"].includes(l.stage)).length;
  const fBooked    = active.filter(l => l.stage === "booked").length;
  const funnel = [
    { label: "Total Leads",  count: total,      color: COLORS.textSecondary, pct: 100 },
    { label: "Contacted",    count: fContacted, color: COLORS.purple,        pct: total > 0 ? Math.round(fContacted / total * 100) : 0 },
    { label: "Replied",      count: fReplied,   color: COLORS.purpleLight,   pct: total > 0 ? Math.round(fReplied / total * 100) : 0 },
    { label: "Booked",       count: fBooked,    color: COLORS.gold,          pct: total > 0 ? Math.round(fBooked / total * 100) : 0 },
  ];
  // Drop-off rates between stages
  const dropoffs = [
    fContacted > 0 ? Math.round((1 - fReplied / fContacted) * 100) : null,
    fReplied   > 0 ? Math.round((1 - fBooked  / fReplied)   * 100) : null,
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat row */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard label="Total Leads"   value={total}           sub="in pipeline"                                         accent={COLORS.textSecondary} />
        <StatCard label="Outreach Sent" value={contacted}       sub={`${active.filter(l => l.stage === "target").length} still in target`} accent={COLORS.purple} />
        <StatCard label="Reply Rate"    value={`${replyRate}%`} sub={`${replied} replies`}                                accent={COLORS.purpleLight} />
        <StatCard label="Booked"        value={booked}          sub="confirmed gigs"                                      accent={COLORS.gold} />
        {totalRevenue > 0 && <StatCard label="Total Fees" value={`€${totalRevenue.toLocaleString()}`} sub="booked gigs" accent={COLORS.gold} />}
        {unpaidCount > 0 && <StatCard label="Deposit Due" value={unpaidCount} sub="awaiting deposit" accent={COLORS.red} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ProGate isPro={isPro} reason="funnel" onUpgradeClick={onUpgradeClick} label="Next Actions — Pro feature">
          {/* ── Next Actions ── */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Next Actions</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>What to do today</div>
              </div>
              <button onClick={() => onNavigate("followups")} style={{ fontSize: 11, color: COLORS.purple, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
            </div>
            {nextActions.length === 0 ? (
              <div style={{ padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>All caught up — add more leads to grow your pipeline</div>
              </div>
            ) : (
              <div>
                {nextActions.map((lead, i) => (
                  <div key={lead.id} onClick={() => onNavigate("pipeline")} style={{ padding: "13px 20px", borderBottom: i < nextActions.length - 1 ? `1px solid ${COLORS.border}` : "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: lead.urgencyColor + "22", border: `1px solid ${lead.urgencyColor + "55"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: lead.urgencyColor, letterSpacing: "0.04em" }}>{lead.stageLabel}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                      {lead.name}
                      {lead.stage === "booked" && lead.fee && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: lead.deposit_paid ? "#4ade80" : COLORS.gold, background: lead.deposit_paid ? "rgba(74,222,128,0.1)" : "rgba(212,175,55,0.1)", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>
                          €{lead.fee}{lead.deposit_paid ? " ✓" : ""}
                        </span>
                      )}
                    </div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                        {lead.stage === "replied" ? "They replied — close this booking" :
                         lead.stage === "contacted" ? "Send follow-up 1" :
                         lead.stage === "followup1" ? "Send follow-up 2" :
                         lead.stage === "followup2" ? "Final follow-up — last attempt" : "Take action"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: lead.urgencyColor }}>{lead.daysLabel}</div>
                      <Badge color={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ProGate>

        <ProGate isPro={isPro} reason="funnel" onUpgradeClick={onUpgradeClick} label="Conversion Funnel — Pro feature">
          {/* ── Conversion Funnel ── */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Conversion Funnel</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Where leads drop off</div>
            </div>
            {funnel.map((stage, i) => (
              <div key={stage.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: stage.color }} />
                    <span style={{ fontSize: 12, color: COLORS.text }}>{stage.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Mono', monospace" }}>{stage.count}</span>
                    <span style={{ fontSize: 11, color: stage.color, fontFamily: "'DM Mono', monospace", minWidth: 36, textAlign: "right" }}>{stage.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 6, background: COLORS.bg, borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${stage.pct}%`, background: stage.color, borderRadius: 4, transition: "width 0.7s ease", opacity: 0.85 }} />
                </div>
                {i < funnel.length - 1 && dropoffs[i] !== null && dropoffs[i] > 0 && dropoffs[i] < 100 && total >= 3 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 8px 14px" }}>
                    <div style={{ width: 1, height: 12, background: COLORS.border }} />
                    <span style={{ fontSize: 10, color: dropoffs[i] > 50 ? COLORS.red : COLORS.textMuted }}>↓ {dropoffs[i]}% drop-off</span>
                  </div>
                )}
                {i < funnel.length - 1 && (dropoffs[i] === null || dropoffs[i] === 0) && <div style={{ height: 12, marginBottom: 8 }} />}
              </div>
            ))}
            <div style={{ marginTop: 12, padding: "12px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 9, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Overall Conversion</div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>Target → Booked</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.gold, fontFamily: "'DM Mono', monospace" }}>
                {total >= 3 ? `${Math.round(fBooked / total * 100)}%` : "—"}
              </div>
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 7 }}>
              <span style={{ fontSize: 11, color: "#00D4FF" }}>↗</span>
              <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Industry avg reply rate: <strong style={{ color: "#00D4FF" }}>18%</strong></span>
              <span style={{ fontSize: 10, color: COLORS.textMuted, marginLeft: "auto" }}>DJ outreach benchmark</span>
            </div>
          </div>
        </ProGate>
      </div>
    </div>
  );
}

function FollowUpsView({ leads, onNavigate }) {
  const today    = new Date();
  const active   = leads.filter(l => !l.archived);
  const due      = active.filter(l => l.followUpDate && new Date(l.followUpDate) <= today);
  const upcoming = active.filter(l => l.followUpDate && new Date(l.followUpDate) > today);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.gold, boxShadow: `0 0 8px ${COLORS.gold}` }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>Due Now</span>
          <Badge color={COLORS.gold}>{due.length}</Badge>
        </div>
        {due.length === 0 ? (
          <div style={{ padding: "20px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 12, textAlign: "center" }}>All caught up ✓</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {due.map(lead => (
              <div key={lead.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.gold}44`, borderRadius: 10, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{lead.name}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Badge color={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
                    <Badge color={COLORS.textSecondary}>{STAGES.find(s => s.id === lead.stage)?.label}</Badge>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: COLORS.gold, fontWeight: 700, marginBottom: 6 }}>Follow up today</div>
                  <button onClick={() => onNavigate("outreach")} style={{ padding: "7px 14px", background: COLORS.purple, border: "none", borderRadius: 7, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Get Template →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.textSecondary }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Upcoming</span>
          <Badge color={COLORS.textSecondary}>{upcoming.length}</Badge>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcoming.map(lead => {
            const daysLeft = Math.ceil((new Date(lead.followUpDate) - today) / (1000 * 60 * 60 * 24));
            const nudge = daysLeft <= 2
              ? { text: "Get your message ready", color: COLORS.purpleLight }
              : daysLeft <= 5
              ? { text: "Coming up soon", color: COLORS.textSecondary }
              : { text: "On track", color: COLORS.textMuted };
            return (
              <div key={lead.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{lead.name}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Badge color={COLORS.textSecondary}>{STAGES.find(s => s.id === lead.stage)?.label}</Badge>
                    <span style={{ fontSize: 11, color: nudge.color }}>{nudge.text}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: daysLeft <= 2 ? COLORS.purpleLight : COLORS.textSecondary, fontFamily: "'DM Mono', monospace" }}>
                    {daysLeft === 1 ? "Tomorrow" : `${daysLeft}d`}
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{formatShortDate(lead.followUpDate)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OutreachView({ isPro, onUpgradeClick }) {
  const [selected, setSelected] = useState("berlin");
  const template = TEMPLATES.find(t => t.id === selected);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(template.text); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const freeTemplateIds = ["berlin", "circuit"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, padding: "0 4px" }}>Message Templates</div>
        {TEMPLATES.map(t => {
          const locked = !isPro && !freeTemplateIds.includes(t.id);
          return (
            <button key={t.id} onClick={() => locked ? onUpgradeClick("templates") : setSelected(t.id)} style={{ padding: "14px 16px", borderRadius: 10, textAlign: "left", cursor: "pointer", background: selected === t.id ? COLORS.purpleBg : COLORS.surface, border: `1px solid ${selected === t.id ? COLORS.purple : COLORS.border}`, transition: "all 0.15s", position: "relative", opacity: locked ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 16, color: locked ? COLORS.textMuted : COLORS.purple }}>{t.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{t.label}</span>
                {locked && <span style={{ marginLeft: "auto", fontSize: 9, color: COLORS.gold, background: COLORS.gold + "22", border: `1px solid ${COLORS.gold}44`, borderRadius: 4, padding: "1px 6px", fontWeight: 800, letterSpacing: "0.06em" }}>PRO</span>}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: "0.04em" }}>{t.tone}</div>
            </button>
          );
        })}
      </div>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>{template.label} Template</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{template.tone}</div>
          </div>
          <button onClick={copy} style={{ padding: "8px 16px", background: copied ? COLORS.green + "22" : COLORS.purple, border: copied ? `1px solid ${COLORS.green}` : "none", borderRadius: 8, color: copied ? COLORS.green : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "✓ Copied!" : "Copy Template"}
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ fontFamily: "inherit", fontSize: 13, color: COLORS.text, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{template.text}</pre>
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.purpleBg }}>
          <div style={{ fontSize: 11, color: COLORS.purple }}>💡 Replace [bracketed text] with your actual details before sending</div>
        </div>
      </div>
    </div>
  );
}

function AssetLink({ icon, label, sublabel, href, accent, actionLabel = "Open" }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = accent} onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + "22", border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{label}</div>
          {sublabel && <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{sublabel}</div>}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, padding: "5px 12px", background: accent + "18", border: `1px solid ${accent}44`, borderRadius: 6, flexShrink: 0 }}>{actionLabel} →</div>
      </div>
    </a>
  );
}

function CopyBlock({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
      <button onClick={copy} style={{ padding: "5px 12px", background: copied ? COLORS.green + "22" : "transparent", border: `1px solid ${copied ? COLORS.green : COLORS.border}`, borderRadius: 6, color: copied ? COLORS.green : COLORS.textSecondary, fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
        {copied ? "✓" : "Copy"}
      </button>
    </div>
  );
}

function AssetsView({ supabase, userId }) {
  const [assets, setAssets] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("epk");

  const SECTIONS = [
    { id: "epk",   label: "EPK",         icon: "📄" },
    { id: "mixes", label: "Mixes",       icon: "🎧" },
    { id: "bio",   label: "Bio & Press", icon: "✦"  },
    { id: "links", label: "Quick Links", icon: "🔗" },
  ];

  useEffect(() => {
    if (!userId) return;
    supabase.from("user_assets").select("*").eq("user_id", userId).maybeSingle()
      .then(({ data }) => setAssets(data || {}));
  }, [userId]);

  const set = (field) => (e) => setAssets(a => ({ ...a, [field]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const payload = { ...assets, user_id: userId };
    const { error } = assets?.id
      ? await supabase.from("user_assets").update(payload).eq("id", assets.id)
      : await supabase.from("user_assets").insert([payload]);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const incomplete = !saved && (!assets?.artist_name || !assets?.epk_url || !assets?.soundcloud || !assets?.booking_email);

  const inputStyle = {
    width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "8px 10px", color: COLORS.text, fontSize: 12,
    fontFamily: "'DM Sans', sans-serif", outline: "none", marginTop: 4,
    colorScheme: "dark",
  };
  const labelStyle = { fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 12, display: "block" };

  if (assets === null) return <div style={{ padding: 40, color: COLORS.textMuted, fontSize: 13 }}>Loading assets...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {incomplete && (
        <div style={{ background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 20 }}>📋</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 3 }}>Complete your asset kit</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.5 }}>Venues will ask for your EPK, mix link, and booking email. Fill these in once and they're ready to paste into any outreach.</div>
          </div>
          <button onClick={() => setActiveSection("epk")} style={{ padding: "7px 14px", background: COLORS.purple, border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Fill in now →</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, padding: "0 4px" }}>Your Assets</div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ padding: "12px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer", background: activeSection === s.id ? COLORS.purpleBg : COLORS.surface, border: `1px solid ${activeSection === s.id ? COLORS.purple : COLORS.border}`, color: activeSection === s.id ? COLORS.purpleLight : COLORS.textSecondary, fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
          <button onClick={save} disabled={saving} style={{ marginTop: 12, padding: "10px", background: saved ? COLORS.green : COLORS.purple, border: "none", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Assets"}
          </button>
        </div>

        <div>
          {activeSection === "epk" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>EPK & Identity</div>
              <label style={labelStyle}>Artist Name</label>
              <input style={inputStyle} value={assets.artist_name || ""} onChange={set("artist_name")} placeholder="e.g. GEEZ" />
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={assets.location || ""} onChange={set("location")} placeholder="e.g. Cologne, DE" />
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={assets.tagline || ""} onChange={set("tagline")} placeholder="e.g. Peak-driven Tech House. Tribal energy." />
              <label style={labelStyle}>EPK PDF URL</label>
              <input style={inputStyle} value={assets.epk_url || ""} onChange={set("epk_url")} placeholder="https://yoursite.com/epk.pdf" />
              <label style={labelStyle}>Press Photos URL (ZIP or folder)</label>
              <input style={inputStyle} value={assets.press_photos_url || ""} onChange={set("press_photos_url")} placeholder="https://yoursite.com/press_photos.zip" />
              <label style={labelStyle}>Booking Email</label>
              <input style={inputStyle} value={assets.booking_email || ""} onChange={set("booking_email")} placeholder="booking@yoursite.com" />
              {assets.epk_url && <div style={{ marginTop: 12 }}><CopyBlock label="EPK PDF URL" value={assets.epk_url} /></div>}
            </div>
          )}
          {activeSection === "mixes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Mixes & Audio</div>
              <label style={labelStyle}>SoundCloud URL</label>
              <input style={inputStyle} value={assets.soundcloud || ""} onChange={set("soundcloud")} placeholder="https://soundcloud.com/yourname" />
              <label style={labelStyle}>Spotify URL</label>
              <input style={inputStyle} value={assets.spotify || ""} onChange={set("spotify")} placeholder="https://open.spotify.com/artist/..." />
              <label style={labelStyle}>Mix Link 1</label>
              <input style={inputStyle} value={assets.mix_link_1 || ""} onChange={set("mix_link_1")} placeholder="https://soundcloud.com/yourname/mix-1" />
              <label style={labelStyle}>Mix Link 2</label>
              <input style={inputStyle} value={assets.mix_link_2 || ""} onChange={set("mix_link_2")} placeholder="https://soundcloud.com/yourname/mix-2" />
              {assets.soundcloud && <div style={{ marginTop: 12 }}><CopyBlock label="SoundCloud" value={assets.soundcloud} /></div>}
              {assets.mix_link_1 && <CopyBlock label="Mix Link 1" value={assets.mix_link_1} />}
              <div style={{ background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 12, padding: "14px 18px", marginTop: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.purple, fontWeight: 700, marginBottom: 6 }}>💡 Outreach tip</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6 }}>Don't lead with the mix link. Send the initial message first — build curiosity. Drop the SoundCloud link only when they ask or in follow-up 1.</div>
              </div>
            </div>
          )}
          {activeSection === "bio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Bio & Press</div>
              <label style={labelStyle}>Official Bio</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical", colorScheme: "dark" }} value={assets.bio || ""} onChange={set("bio")} placeholder="Your artist bio — use this in outreach, EPKs, and social bios." />
              {assets.bio && (
                <button onClick={() => navigator.clipboard.writeText(assets.bio)} style={{ alignSelf: "flex-start", marginTop: 4, padding: "5px 12px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textSecondary, fontSize: 11, cursor: "pointer" }}>Copy Bio</button>
              )}
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} value={assets.website || ""} onChange={set("website")} placeholder="https://yoursite.com" />
              <label style={labelStyle}>Genres (comma separated)</label>
              <input style={inputStyle} value={assets.genres || ""} onChange={set("genres")} placeholder="e.g. Tech House, Tribal, Circuit" />
            </div>
          )}
          {activeSection === "links" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Quick Links</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>Everything ready to paste into an outreach message.</div>
              {assets.website      && <CopyBlock label="Website"       value={assets.website} />}
              {assets.epk_url      && <CopyBlock label="EPK (PDF)"     value={assets.epk_url} />}
              {assets.soundcloud   && <CopyBlock label="SoundCloud"    value={assets.soundcloud} />}
              {assets.booking_email && <CopyBlock label="Booking Email" value={assets.booking_email} />}
              {assets.press_photos_url && <CopyBlock label="Press Photos" value={assets.press_photos_url} />}
              {assets.mix_link_1   && <CopyBlock label="Mix Link 1"    value={assets.mix_link_1} />}
              {assets.mix_link_2   && <CopyBlock label="Mix Link 2"    value={assets.mix_link_2} />}
              {!assets.website && !assets.epk_url && !assets.soundcloud && (
                <div style={{ padding: "24px", textAlign: "center", color: COLORS.textMuted, fontSize: 12, border: `1px dashed ${COLORS.border}`, borderRadius: 10 }}>
                  No links saved yet. Fill in your EPK and Mixes tabs first.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose, onUpgrade, reason }) {
  const reasons = {
    leads:        { title: "You're building momentum",      desc: "Your pipeline is growing. Upgrade to keep adding venues — no cap, no friction.", icon: "⬛" },
    gigs:         { title: "Your calendar is filling up",   desc: "More gigs means more to track. Upgrade to add every confirmed date.", icon: "📅" },
    templates:    { title: "More scenes, more bookings",    desc: "Unlock all 4 outreach templates — Disco, Leverage and more. The right message for every room.", icon: "✦" },
    autoschedule: { title: "Stop losing gigs to timing",    desc: "Pro schedules your follow-ups automatically — 5 days, 14 days, done. You focus on the music.", icon: "⏰" },
    settings:     { title: "Own your outreach cadence",     desc: "Set your own follow-up timing. Every scene moves differently — your workflow should too.", icon: "⚙" },
    funnel:       { title: "See exactly where to focus",    desc: "Know which stage is costing you bookings. Fix the leak before opportunities go cold.", icon: "▣" },
  };
  const r = reasons[reason] || reasons.leads;

  const PRO_FEATURES = [
    "Track every venue — no lead cap",
    "Follow-ups schedule themselves at 5 and 14 days",
    "All 4 outreach templates — right message, right room",
    "Next Actions queue — know who to message today",
    "Conversion Funnel — see where bookings drop off",
    "Set your own follow-up cadence",
    "Cloud sync — your pipeline everywhere",
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 20, width: 440, maxWidth: "95vw", overflow: "hidden", boxShadow: `0 0 80px rgba(123,63,228,0.2), 0 32px 80px rgba(0,0,0,0.7)`, animation: "slideUp 0.2s ease" }}>
        {/* Top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight}, ${COLORS.gold})` }} />

        <div style={{ padding: "28px 28px 0" }}>
          {/* Trigger reason */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px 16px", background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: COLORS.purple + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{r.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>{r.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2, lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>NoxReach Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Mono', monospace" }}>€19</span>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>/month</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.green }}>€152/year (€15/mo) — save 20%</div>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: COLORS.green + "22", border: `1px solid ${COLORS.green}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, color: COLORS.green, fontWeight: 800 }}>✓</span>
                </div>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => onUpgrade("monthly")} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 24px rgba(123,63,228,0.45)", letterSpacing: "0.01em" }}>
            Upgrade to Pro →
          </button>
          <button onClick={onClose} style={{ width: "100%", padding: "10px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>
            Stay on Free
          </button>
          <div style={{ textAlign: "center", fontSize: 10, color: COLORS.textMuted }}>Cancel anytime · No contracts</div>
        </div>
      </div>
    </div>
  );
}

// Inline gate — blurs content and shows a lock overlay
function ProGate({ children, isPro, reason, onUpgradeClick, label = "Pro feature" }) {
  if (isPro) return children;
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none", opacity: 0.4 }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,10,0.6)", backdropFilter: "blur(2px)", cursor: "pointer" }}
        onClick={() => onUpgradeClick(reason)}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.purpleBg, border: `1px solid ${COLORS.purple}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 16 }}>🔒</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.purpleLight, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: COLORS.purple, fontWeight: 600 }}>Upgrade to Pro →</div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function InboundView({ leads, user, supabase }) {
  const inbound = leads.filter(l => !l.archived && l.stage === "replied" && l.contact && l.contact.includes("@"));
  const [username, setUsername] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("username").eq("id", user.id).single()
      .then(({ data }) => { if (data?.username) setUsername(data.username); });
  }, [user?.id]);

  const bookingLink = username ? `https://noxreach-nox.vercel.app/book/${username}` : "Loading...";
  const copy = () => { if (!username) return; navigator.clipboard.writeText(bookingLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 40px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Inbound Requests</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary }}>Booking requests from your public form</div>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Your booking link</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: COLORS.textSecondary, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bookingLink}</div>
          <button onClick={copy} style={{ background: copied ? "rgba(74,222,128,0.15)" : COLORS.purpleBg, border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : COLORS.purpleDim}`, borderRadius: 8, padding: "10px 16px", color: copied ? "#4ade80" : COLORS.purpleLight, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>Share this link in your Instagram bio — promoters fill it out and requests land here automatically.</div>
      </div>

      {inbound.length === 0 ? (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⬇</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>No inbound requests yet</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary }}>Share your booking link to start receiving requests from promoters.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {inbound.map(lead => (
            <div key={lead.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 3 }}>{lead.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{lead.contact}</div>
                  {lead.instagram && <div style={{ fontSize: 12, color: COLORS.purple }}>{lead.instagram}</div>}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{lead.last_contact || "—"}</div>
              </div>
              {lead.notes && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 8, padding: "8px 10px", background: COLORS.bg, borderRadius: 6 }}>{lead.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── GDPR Right to Deletion ────────────────────────────────────────────────
function DeleteAccountButton() {
  const [step, setStep] = React.useState("idle"); // idle | confirm | deleting | done | error
  const [error, setError] = React.useState("");

  const handleDelete = async () => {
    setStep("deleting");
    try {
      // 1. Delete all user data from leads, gigs, settings tables
      const uid = supabase.auth.getUser ? (await supabase.auth.getUser()).data?.user?.id : null;
      if (!uid) throw new Error("Not authenticated");

      // Delete in order respecting FK constraints
      for (const table of ["gigs", "leads", "profiles"]) {
        const { error: e } = await supabase.from(table).delete().eq("user_id", uid);
        if (e) console.warn("Delete from", table, e.message);
      }

      // 2. Sign out — account deletion from auth requires server-side edge function
      // For now we clear data and sign out; full auth deletion queued server-side
      await supabase.auth.signOut();
      setStep("done");
    } catch (e) {
      setError(e.message || "Something went wrong. Email hello@noxreach.io to request deletion.");
      setStep("error");
    }
  };

  if (step === "done") return (
    <div style={{ padding: "14px 18px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, fontSize: 13, color: "#4ade80" }}>
      ✓ Your data has been deleted and you have been signed out. For full account removal from our auth system, email <a href="mailto:hello@noxreach.io" style={{ color: "#4ade80" }}>hello@noxreach.io</a>.
    </div>
  );

  if (step === "error") return (
    <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#ef4444" }}>
      {error}
    </div>
  );

  if (step === "confirm") return (
    <div style={{ padding: "18px 20px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", marginBottom: 8 }}>Are you absolutely sure?</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
        This will permanently erase all your leads, gigs, settings, and profile data. You cannot undo this.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleDelete}
          style={{ padding: "10px 20px", background: "#ef4444", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Yes, delete everything
        </button>
        <button onClick={() => setStep("idle")}
          style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textSecondary, fontSize: 13, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <button onClick={() => setStep("confirm")}
      style={{ padding: "10px 20px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      Delete my account and all data
    </button>
  );
}

function SettingsView({ settings, onSave, isPro, onUpgradeClick, customTags, defaultTags, onAddTag, onRemoveTag, supabase, user }) {
  const [local, setLocal] = useState({ ...settings });
  const [saved,  setSaved]  = useState(false);
  const [username, setUsername] = useState("");
  const [usernameSaved, setUsernameSaved] = useState(false);
  const [usernameError, setUsernameError] = useState("");



  const [displayName, setDisplayName] = useState("");
  const [displayNameSaved, setDisplayNameSaved] = useState(false);

  useEffect(() => {
    if (!user?.id || !supabase) return;
    supabase.from("profiles").select("username, display_name").eq("id", user.id).single()
      .then(({ data }) => {
        if (data?.username) setUsername(data.username);
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user?.id]);

  const saveUsername = async () => {
    setUsernameError("");
    const clean = username.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!clean) { setUsernameError("Username can only contain letters and numbers"); return; }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, username: clean, display_name: displayName || user.email?.split("@")[0] });
    if (error) { setUsernameError(error.message.includes("unique") ? "That username is taken" : error.message); return; }
    setUsername(clean);
    setUsernameSaved(true);
    setTimeout(() => setUsernameSaved(false), 2000);
  };

  const saveDisplayName = async () => {
    if (!displayName.trim()) return;
    await supabase.from("profiles").upsert({ id: user.id, display_name: displayName.trim(), username });
    setDisplayNameSaved(true);
    setTimeout(() => setDisplayNameSaved(false), 2000);
  };

  const set = key => val => setLocal(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isDirty = local.followup1Days !== settings.followup1Days || local.followup2Days !== settings.followup2Days;
  const bookingLink = username ? `https://noxreach-nox.vercel.app/book/${username}` : "";

  const SliderRow = ({ label, desc, stateKey, min, max, unit = "days" }) => {
    const val = local[stateKey];
    const pct = ((val - min) / (max - min)) * 100;
    return (
      <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{label}</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 3 }}>{desc}</div>
          </div>
          <div style={{ padding: "4px 12px", background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 20, fontSize: 13, fontWeight: 800, color: COLORS.purpleLight, fontFamily: "'DM Mono', monospace", flexShrink: 0, marginLeft: 12 }}>
            {val} {unit}
          </div>
        </div>
        <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: COLORS.border, borderRadius: 4 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight})`, borderRadius: 4 }} />
          </div>
          <input type="range" min={min} max={max} value={val} onChange={e => set(stateKey)(Number(e.target.value))}
            style={{ position: "relative", width: "100%", appearance: "none", background: "transparent", cursor: "pointer", height: 20 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: COLORS.textMuted }}>{min}d</span>
          <span style={{ fontSize: 10, color: COLORS.textMuted }}>{max}d</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <style>{`input[type=range]::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${COLORS.purple}; border: 2px solid ${COLORS.purpleLight}; box-shadow: 0 0 8px rgba(123,63,228,0.5); cursor: pointer; }`}</style>

      {/* Booking Link */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Your booking link</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <div style={{ display: "flex", flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "10px 12px", fontSize: 12, color: COLORS.textMuted, borderRight: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>noxreach.app/book/</span>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameError(""); }}
              onKeyDown={e => e.key === "Enter" && saveUsername()}
              placeholder="yourname"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "10px 12px", fontSize: 13, color: COLORS.text, colorScheme: "dark" }}
            />
          </div>
          <button onClick={saveUsername} style={{ background: usernameSaved ? "rgba(74,222,128,0.15)" : COLORS.purpleBg, border: `1px solid ${usernameSaved ? "rgba(74,222,128,0.3)" : COLORS.purpleDim}`, borderRadius: 8, padding: "10px 16px", color: usernameSaved ? "#4ade80" : COLORS.purpleLight, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {usernameSaved ? "Saved ✓" : "Save"}
          </button>
        </div>
        {usernameError && <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 6 }}>{usernameError}</div>}
        {bookingLink && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Share in your Instagram bio — promoters fill it out and land in your pipeline automatically.</div>}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Artist / display name</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveDisplayName()}
              placeholder="e.g. DJ GEEZ"
              style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: COLORS.text, outline: "none", colorScheme: "dark" }}
            />
            <button onClick={saveDisplayName} style={{ background: displayNameSaved ? "rgba(74,222,128,0.15)" : COLORS.purpleBg, border: `1px solid ${displayNameSaved ? "rgba(74,222,128,0.3)" : COLORS.purpleDim}`, borderRadius: 8, padding: "10px 16px", color: displayNameSaved ? "#4ade80" : COLORS.purpleLight, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {displayNameSaved ? "Saved ✓" : "Save"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>This is what promoters see on your booking form — "Book [name]"</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Follow-up intervals */}
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Follow-up Intervals</div>
          <ProGate isPro={isPro} reason="settings" onUpgradeClick={onUpgradeClick} label="Custom intervals — Pro feature">
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                  When you mark a lead as <strong style={{ color: COLORS.text }}>Contacted</strong> or advance through follow-up stages, reminders are automatically scheduled. Set how many days out each reminder fires.
                </div>
              </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <SliderRow label="Follow-up 1" desc="Days after initial contact before first nudge" stateKey="followup1Days" min={1} max={14} />
                <SliderRow label="Follow-up 2" desc="Days after Follow-up 1 before final attempt" stateKey="followup2Days" min={7} max={30} />
              </div>
            </div>
          </ProGate>
        </div>

        {/* Preview */}
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Schedule Preview</div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {[
                { label: "Outreach sent", day: "Day 0", color: COLORS.textSecondary },
                { label: `Follow-up 1`, day: `Day ${local.followup1Days}`, color: COLORS.purple },
                { label: `Follow-up 2`, day: `Day ${local.followup1Days + local.followup2Days}`, color: COLORS.gold },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, margin: "0 auto 6px", boxShadow: i > 0 ? `0 0 8px ${item.color}88` : "none" }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: item.color, whiteSpace: "nowrap" }}>{item.day}</div>
                    <div style={{ fontSize: 10, color: COLORS.textSecondary, whiteSpace: "nowrap", marginTop: 2 }}>{item.label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: COLORS.border, margin: "0 8px", marginBottom: 28 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline stages (read-only info) */}
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Pipeline Stages</div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
            {STAGES.map((s, i) => (
              <div key={s.id} style={{ padding: "12px 18px", borderBottom: i < STAGES.length - 1 ? `1px solid ${COLORS.border}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  {s.id === "contacted"  && `Reminder in ${local.followup1Days} days`}
                  {s.id === "followup1"  && `2nd nudge in ${local.followup2Days} days`}
                  {s.id === "followup2"  && "Final attempt"}
                  {s.id === "target"     && "Not yet contacted"}
                  {s.id === "replied"    && "Close the booking"}
                  {s.id === "booked"     && "✓ Done"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Management */}
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Genres & Scenes</div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                These genres appear in lead and gig forms, and as filter pills in your pipeline. Add any scene that fits your sound.
              </div>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {customTags.map(tag => {
                const isDefault = defaultTags.includes(tag);
                const color = tagColor(tag);
                return (
                  <div key={tag} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{tag}</span>
                      {isDefault && <span style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", background: COLORS.border, padding: "1px 6px", borderRadius: 3 }}>default</span>}
                    </div>
                    {!isDefault && (
                      <button onClick={() => onRemoveTag(tag)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 4px" }}
                        onMouseEnter={e => e.target.style.color = COLORS.red}
                        onMouseLeave={e => e.target.style.color = COLORS.textMuted}>✕</button>
                    )}
                  </div>
                );
              })}

              {/* Add new genre inline */}
              <AddGenreRow onAdd={onAddTag} />
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={handleSave} style={{ padding: "11px 28px", background: isDirty ? COLORS.purple : COLORS.border, border: "none", borderRadius: 10, color: isDirty ? "#fff" : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: isDirty ? "pointer" : "default", transition: "all 0.2s", boxShadow: isDirty ? "0 4px 20px rgba(123,63,228,0.35)" : "none" }}>
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
          {isDirty && (
            <button onClick={() => setLocal({ ...settings })} style={{ padding: "11px 18px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textSecondary, fontSize: 13, cursor: "pointer" }}>
              Discard
            </button>
          )}
          {!isDirty && !saved && <span style={{ fontSize: 11, color: COLORS.textMuted }}>No unsaved changes</span>}
          {saved && <span style={{ fontSize: 11, color: COLORS.green }}>Changes applied to all future reminders</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Gig Calendar ─────────────────────────────────────────────────────────────


// ── DB ↔ App data converters ──────────────────────────────────────────────────
function dbToLead(r) {
  return {
    id:            r.id,
    name:          r.name || "",
    contact:       r.contact || "",
    instagram:     r.instagram || "",
    tier:          r.tier || "A2",
    tag:           r.tag || "Tech-House",
    stage:         r.stage || "target",
    notes:         r.notes || "",
    followUpDate:  r.follow_up_date || null,
    lastContact:   r.last_contact || null,
    archived:      r.archived || false,
    bookingStatus: r.booking_status || [],
  };
}
function leadToDb(lead, userId) {
  return {
    id:             typeof lead.id === "number" ? undefined : lead.id, // let DB generate uuid for new
    user_id:        userId,
    name:           lead.name,
    contact:        lead.contact || "",
    instagram:      lead.instagram || "",
    tier:           lead.tier || "A2",
    tag:            lead.tag || "Tech-House",
    stage:          lead.stage || "target",
    notes:          lead.notes || "",
    follow_up_date: lead.followUpDate || null,
    last_contact:   lead.lastContact || null,
    archived:       lead.archived || false,
    booking_status: lead.bookingStatus || [],
  };
}
function dbToGig(r) {
  return {
    id:     r.id,
    venue:  r.venue || "",
    city:   r.city || "",
    date:   r.date || "",
    status: r.status || "pending",
    fee:    r.fee || "",
    tag:    r.tag || "",
    notes:  r.notes || "",
  };
}
function gigToDb(gig, userId) {
  const obj = {
    user_id: userId,
    venue:   gig.venue,
    city:    gig.city || "",
    date:    gig.date || null,
    status:  gig.status || "pending",
    fee:     gig.fee || "",
    tag:     gig.tag || "",
    notes:   gig.notes || "",
  };
  if (gig.id && typeof gig.id === "string") obj.id = gig.id;
  return obj;
   
}

function GigCalendarView({ leads, gigs, setGigs, showToast, isPro, onUpgradeClick, customTags, TAG_COLORS, supabase, onDateClick, userId }) {
  const today    = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState({ venue: "", city: "", date: "", status: "confirmed", fee: "", tag: "Tech-House", notes: "" });

  const monthStart  = new Date(viewYear, viewMonth, 1);
  const monthEnd    = new Date(viewYear, viewMonth + 1, 0);
  const startPad    = monthStart.getDay();
  const totalCells  = Math.ceil((startPad + monthEnd.getDate()) / 7) * 7;
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const gigsThisMonth = gigs.filter(g => {
    const d = new Date(g.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  const gigsByDate = {};
  gigs.forEach(g => { gigsByDate[g.date] = [...(gigsByDate[g.date] || []), g]; });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const addGig = async () => {
    if (!addForm.venue || !addForm.date) return;
    if (!isPro && gigs.length >= FREE_LIMITS.gigs) { onUpgradeClick("gigs"); return; }
    try {
      const { data, error } = await supabase.from("gigs").insert([gigToDb({ ...addForm }, userId)]).select().single();
      if (error) throw error;
      setGigs(prev => [...prev, dbToGig(data)]);
      showToast(`${addForm.venue} added to calendar`, "success");
      setShowAdd(false);
      setAddForm({ venue: "", city: "", date: "", status: "confirmed", fee: "", tag: "Tech-House", notes: "" });
    } catch (err) {
      showToast("Failed to save gig. Try again.", "info");
      console.error(err);
    }
  };

  const deleteGig = async (id) => {
    setGigs(prev => prev.filter(g => g.id !== id));
    setSelected(null);
    showToast("Gig removed", "info");
    try {
      await supabase.from("gigs").delete().eq("id", id).eq("user_id", userId);
    } catch (err) { console.error("deleteGig sync failed:", err); }
  };

  const upcoming = gigs.filter(g => new Date(g.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past     = gigs.filter(g => new Date(g.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Booked leads that aren't gigs yet
  const bookedLeads = leads.filter(l => l.stage === "booked" && !l.archived);

  return (
    <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 300px", gap: 20 }}>
      {/* Left: Calendar + upcoming list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Calendar */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
          {/* Month nav */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={prevMonth} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 7, color: COLORS.textSecondary, cursor: "pointer", padding: "5px 10px", fontSize: 14 }}>‹</button>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
            <button onClick={nextMonth} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 7, color: COLORS.textSecondary, cursor: "pointer", padding: "5px 10px", fontSize: 14 }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${COLORS.border}` }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.08em" }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum  = i - startPad + 1;
              const valid   = dayNum >= 1 && dayNum <= monthEnd.getDate();
              const dateStr = valid ? `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}` : null;
              const dayGigs = dateStr ? (gigsByDate[dateStr] || []) : [];
              const isToday = dateStr === today.toISOString().split("T")[0];
              const hasGig  = dayGigs.length > 0;
              const confirmed = dayGigs.some(g => g.status === "confirmed");
              const pending   = dayGigs.some(g => g.status === "pending");

              return (
                <div key={i} onClick={() => { if (!valid) return; if (hasGig) setSelected(dayGigs[0]); else { setAddForm(f => ({ ...f, date: dateStr })); setShowAdd(true); } }}
  style={{ padding: "8px 4px", minHeight: 52, borderBottom: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, cursor: valid && hasGig ? "pointer" : "default", background: hasGig && selected?.date === dateStr ? COLORS.purpleBg : "transparent", transition: "background 0.15s" }}>
                  {valid && (
                    <>
                      <div style={{ textAlign: "center", fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? COLORS.purple : COLORS.text, width: isToday ? 22 : "auto", height: isToday ? 22 : "auto", borderRadius: isToday ? "50%" : 0, background: isToday ? COLORS.purpleBg : "transparent", border: isToday ? `1px solid ${COLORS.purple}` : "none", margin: isToday ? "0 auto" : 0, display: isToday ? "flex" : "block", alignItems: "center", justifyContent: "center" }}>{dayNum}</div>
                      {hasGig && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4, flexWrap: "wrap" }}>
                          {dayGigs.map((g, gi) => (
                            <div key={gi} style={{ width: 6, height: 6, borderRadius: "50%", background: g.status === "confirmed" ? COLORS.gold : COLORS.textSecondary, boxShadow: g.status === "confirmed" ? `0 0 4px ${COLORS.gold}88` : "none" }} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ padding: "12px 20px", display: "flex", gap: 20, borderTop: `1px solid ${COLORS.border}` }}>
            {[["confirmed", COLORS.gold, "Confirmed"], ["pending", COLORS.textSecondary, "Pending"]].map(([s, c, l]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: s === "confirmed" ? `0 0 5px ${c}88` : "none" }} />
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{l}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 11, color: COLORS.textMuted }}>{gigsThisMonth.length} gig{gigsThisMonth.length !== 1 ? "s" : ""} this month</div>
          </div>
        </div>

        {/* Upcoming list */}
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Upcoming Gigs</div>
          {upcoming.length === 0 ? (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "20px", textAlign: "center", color: COLORS.textMuted, fontSize: 12 }}>No upcoming gigs — start booking!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map(gig => {
                const d        = new Date(gig.date);
                const daysLeft = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                return (
                  <div key={gig.id} onClick={() => setSelected(gig)} style={{ background: COLORS.surface, border: `1px solid ${selected?.id === gig.id ? COLORS.purple : COLORS.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s" }}>
                    <div style={{ textAlign: "center", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px", minWidth: 48, flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{MONTH_NAMES[d.getMonth()].slice(0, 3)}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Mono', monospace", lineHeight: 1.2 }}>{d.getDate()}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 3 }}>{gig.venue}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{gig.city}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: gig.status === "confirmed" ? COLORS.gold + "22" : COLORS.border, color: gig.status === "confirmed" ? COLORS.gold : COLORS.textSecondary, border: `1px solid ${gig.status === "confirmed" ? COLORS.gold + "44" : COLORS.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{gig.status}</span>
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.textMuted }}>{daysLeft === 0 ? "Today" : `in ${daysLeft}d`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past gigs (collapsed) */}
        {past.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Past Gigs <span style={{ fontFamily: "'DM Mono', monospace", marginLeft: 4 }}>{past.length}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {past.slice(0, 3).map(gig => (
                <div key={gig.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.55 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{gig.venue}</span>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary, marginLeft: 8 }}>{gig.city}</span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>{gig.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Detail panel / Add form */}
      <div>
        {/* Booked leads hint */}
        {bookedLeads.length > 0 && !selected && !showAdd && (
          <div style={{ background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: COLORS.purple, fontWeight: 700, marginBottom: 8 }}>📌 {bookedLeads.length} booked lead{bookedLeads.length > 1 ? "s" : ""} not on calendar</div>
            {bookedLeads.map(l => (
              <button key={l.id} onClick={() => { setShowAdd(true); setAddForm(f => ({ ...f, venue: l.name, tag: l.tag })); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: `1px solid ${COLORS.purpleDim}`, borderRadius: 7, padding: "7px 10px", color: COLORS.purpleLight, fontSize: 12, cursor: "pointer", marginBottom: 4 }}>
                + Add {l.name} to calendar →
              </button>
            ))}
          </div>
        )}

        {/* Add gig form */}
        {showAdd ? (
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Add Gig</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Venue", "venue", "text", "e.g. Club Space Miami"], ["City", "city", "text", "e.g. Berlin, DE"], ["Date", "date", "date", ""], ["Fee", "fee", "text", "€500"]].map(([label, key, type, ph]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>
                  <input type={type} value={addForm[key]} onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                    style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "8px 12px", color: COLORS.text, fontSize: 12, outline: "none", fontFamily: "inherit" }}
                    onFocus={e => e.target.style.borderColor = COLORS.purple} onBlur={e => e.target.style.borderColor = COLORS.border} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Genre</label>
                <GenreSelector tags={customTags} value={addForm.tag} onChange={v => setAddForm(f => ({ ...f, tag: v }))} TAG_COLORS={TAG_COLORS} onAddTag={() => {}} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Status</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["confirmed", "pending"].map(s => (
                    <button key={s} onClick={() => setAddForm(f => ({ ...f, status: s }))} style={{ flex: 1, padding: "7px", borderRadius: 7, cursor: "pointer", background: addForm.status === s ? (s === "confirmed" ? COLORS.gold + "22" : COLORS.purpleBg) : "transparent", border: `1px solid ${addForm.status === s ? (s === "confirmed" ? COLORS.gold : COLORS.purple) : COLORS.border}`, color: addForm.status === s ? (s === "confirmed" ? COLORS.gold : COLORS.purpleLight) : COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Notes</label>
                <textarea value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Set time, rider notes..."
                  style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "8px 12px", color: COLORS.text, fontSize: 12, outline: "none", fontFamily: "inherit", resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = COLORS.purple} onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textSecondary, fontSize: 12, cursor: "pointer" }}>Cancel</button>
              <button onClick={addGig} style={{ flex: 2, padding: "9px", background: COLORS.purple, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add to Calendar ✓</button>
            </div>
          </div>
        ) : selected ? (
          /* Gig detail */
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, position: "sticky", top: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>{selected.venue}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{selected.city}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[["Date", selected.date], ["Fee", selected.fee || "—"], ["Status", selected.status], ["Genre", selected.tag]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: COLORS.textSecondary, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontSize: 12, color: k === "Status" ? (v === "confirmed" ? COLORS.gold : COLORS.textSecondary) : COLORS.text, fontWeight: k === "Status" ? 700 : 400, textTransform: k === "Status" ? "capitalize" : "none" }}>{v}</span>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{selected.notes}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={async () => {
                const newStatus = selected.status === "confirmed" ? "pending" : "confirmed";
                setGigs(prev => prev.map(g => g.id === selected.id ? { ...g, status: newStatus } : g));
                setSelected(prev => ({ ...prev, status: newStatus }));
                try { await supabase.from("gigs").update({ status: newStatus }).eq("id", selected.id).eq("user_id", userId); } catch(e) { console.error(e); }
              }}
                style={{ flex: 1, padding: "8px", background: selected.status === "confirmed" ? COLORS.gold + "22" : COLORS.purpleBg, border: `1px solid ${selected.status === "confirmed" ? COLORS.gold + "44" : COLORS.purpleDim}`, borderRadius: 8, color: selected.status === "confirmed" ? COLORS.gold : COLORS.purpleLight, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {selected.status === "confirmed" ? "Mark Pending" : "Confirm ✓"}
              </button>
              <button onClick={() => deleteGig(selected.id)} style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.red + "AA", fontSize: 11, cursor: "pointer" }}>✕</button>
            </div>
          </div>
        ) : (
          <div style={{ background: COLORS.surface, border: `1px dashed ${COLORS.border}`, borderRadius: 14, padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 1.6 }}>Click a date on the calendar<br />or add a new gig</div>
            {!isPro && (
              <div style={{ fontSize: 11, color: gigs.length >= FREE_LIMITS.gigs ? COLORS.red : COLORS.textMuted, marginBottom: 12 }}>
                {gigs.length} / {FREE_LIMITS.gigs} gigs used on Free
              </div>
            )}
            <button onClick={() => !isPro && gigs.length >= FREE_LIMITS.gigs ? onUpgradeClick("gigs") : setShowAdd(true)}
              style={{ padding: "9px 20px", background: COLORS.purple, border: "none", borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {!isPro && gigs.length >= FREE_LIMITS.gigs ? "Upgrade to Add More" : "+ Add Gig"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reply Hub ─────────────────────────────────────────────────────────────────

function ReplyHubView({ leads, onMove, showToast, TAG_COLORS }) {
  const [filter, setFilter]   = useState("all"); // all | unread | replied
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("noxreach_read_replies") || "[]")); } catch { return new Set(); }
  });

  const markRead = (id) => {
    setReadIds(prev => { const n = new Set(prev); n.add(id); try { localStorage.setItem("noxreach_read_replies", JSON.stringify([...n])); } catch {} return n; });
  };

  // Replied leads are the "inbox" — they represent inbound promoter interest
  const repliedLeads = leads.filter(l => !l.archived && !l.is_inbound && (l.stage === "replied" || l.stage === "booked"));

  // Simulate some message previews based on lead data
  const getMessage = (lead) => {
    const msgs = {
      "The BPM Festival": { subject: "Re: GEEZ Booking Inquiry", preview: "Hey, thanks for reaching out! We listened to your mix and we'd love to discuss a slot on the Terrace stage. Can you send your rider and confirm your dates?", time: "2h ago", location: "Playa del Carmen, MX" },
      "Alegria NYC":      { subject: "Booking Confirmed — March 15th", preview: "Hi! Confirming your slot for March 15th. 1am to 3am opening set. Please send tech rider to production@alegria.com by the 1st.", time: "1d ago", location: "New York, US" },
    };
    return msgs[lead.name] || { subject: `Re: Booking Inquiry`, preview: `Thanks for getting in touch. We'd like to discuss possible dates for a booking. Can you share your availability for Q2?`, time: "3d ago", location: lead.instagram || "—" };
  };

  const filtered = repliedLeads.filter(l => {
    if (filter === "unread") return !readIds.has(l.id);
    if (filter === "replied") return l.stage === "booked";
    return true;
  });

  const unreadCount = repliedLeads.filter(l => !readIds.has(l.id)).length;

  const copyReply = () => {
    if (!replyText.trim()) return;
    navigator.clipboard.writeText(replyText);
    showToast("Reply copied to clipboard", "success");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 0, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", minHeight: 500 }}>

      {/* Left: message list */}
      <div style={{ borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
        {/* Filter tabs */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 6 }}>
          {[["all", "All"], ["unread", `Unread`], ["replied", "Booked"]].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 7, cursor: "pointer", background: filter === id ? COLORS.purpleBg : "transparent", border: `1px solid ${filter === id ? COLORS.purple : COLORS.border}`, color: filter === id ? COLORS.purpleLight : COLORS.textSecondary, fontSize: 11, fontWeight: filter === id ? 700 : 500, position: "relative" }}>
              {label}
              {id === "unread" && unreadCount > 0 && (
                <span style={{ marginLeft: 4, background: COLORS.gold, color: "#000", borderRadius: 8, padding: "0 5px", fontSize: 9, fontWeight: 800 }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: COLORS.textMuted, fontSize: 12 }}>
              {filter === "unread" ? "All caught up ✓" : "No messages yet"}
            </div>
          ) : (
            filtered.map(lead => {
              const msg      = getMessage(lead);
              const isUnread = !readIds.has(lead.id);
              const isActive = selected?.id === lead.id;
              return (
                <div key={lead.id} onClick={() => { setSelected(lead); markRead(lead.id); setReplyText(""); }}
                  style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", background: isActive ? COLORS.purpleBg : "transparent", borderLeft: `3px solid ${isActive ? COLORS.purple : isUnread ? COLORS.gold : "transparent"}`, transition: "background 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isUnread && <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.gold, flexShrink: 0 }} />}
                      <div style={{ fontSize: 13, fontWeight: isUnread ? 800 : 600, color: COLORS.text }}>{lead.name}</div>
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, flexShrink: 0, marginLeft: 6 }}>{msg.time}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: isUnread ? 700 : 400, color: isUnread ? COLORS.text : COLORS.textSecondary, marginBottom: 3 }}>{msg.subject}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.preview}</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                    <Badge color={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
                    <Badge color={lead.stage === "booked" ? COLORS.gold : COLORS.green}>{lead.stage === "booked" ? "Booked" : "Replied"}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {repliedLeads.length === 0 && (
          <div style={{ padding: "16px", borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6, textAlign: "center" }}>
              Leads that reply to your outreach will appear here. Move leads to <strong style={{ color: COLORS.textSecondary }}>Replied</strong> in the Pipeline.
            </div>
          </div>
        )}
      </div>

      {/* Right: message detail + reply composer */}
      {selected ? (() => {
        const msg  = getMessage(selected);
        const hint = selected.stage === "replied"
          ? { action: "Confirm booking", next: "booked", color: COLORS.gold }
          : null;
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Message header */}
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>{msg.subject}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: COLORS.textSecondary }}>from <strong style={{ color: COLORS.text }}>{selected.name}</strong></span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>· {msg.location}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>· {msg.time}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Badge color={TIER_COLORS[selected.tier]}>{selected.tier}</Badge>
                  <Badge color={TAG_COLORS[selected.tag] || COLORS.purple}>{selected.tag}</Badge>
                </div>
              </div>
            </div>

            {/* Message body */}
            <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
              <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "18px 20px", fontSize: 13, color: COLORS.text, lineHeight: 1.8, marginBottom: 20 }}>
                {msg.preview}
              </div>

              {/* Pipeline action */}
              {hint && (
                <button onClick={() => { onMove(selected.id, hint.next); setSelected(prev => ({ ...prev, stage: hint.next })); }}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, cursor: "pointer", marginBottom: 16, background: COLORS.gold + "18", border: `1px solid ${COLORS.gold}44`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.gold }}>{hint.action}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>Move this lead to Booked in the pipeline</div>
                  </div>
                  <span style={{ fontSize: 18, color: COLORS.gold }}>→</span>
                </button>
              )}
              {selected.stage === "booked" && (
                <div style={{ padding: "10px 14px", background: COLORS.gold + "18", border: `1px solid ${COLORS.gold}44`, borderRadius: 8, fontSize: 12, color: COLORS.gold, fontWeight: 600, marginBottom: 16 }}>
                  ✓ Booking confirmed — this gig is locked in
                </div>
              )}

              {/* Reply composer */}
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.textSecondary, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Draft Reply to <strong style={{ color: COLORS.text }}>{selected.name}</strong></span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Interested", "Need more info", "Confirm"].map(t => (
                      <button key={t} onClick={() => setReplyText(`Thanks for your message!\n\n${t === "Interested" ? "I'm very interested in this booking opportunity. Could we discuss the details further?" : t === "Need more info" ? "I'd need a bit more information before confirming — could you share the event details, capacity, and set time?" : "Happy to confirm! I'll send my tech rider and availability confirmation shortly."}`)}
                        style={{ padding: "3px 8px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.textSecondary, fontSize: 10, cursor: "pointer" }}>{t}</button>
                    ))}
                  </div>
                </div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply..." rows={4}
                  style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "inherit", lineHeight: 1.7, resize: "none" }} />
                <div style={{ padding: "10px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>Copy to send via email or Instagram</div>
                  <button onClick={copyReply} style={{ padding: "7px 16px", background: COLORS.purple, border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Copy Reply</button>
                </div>
              </div>
            </div>
          </div>
        );
      })() : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: 10, padding: 40 }}>
          <div style={{ fontSize: 32 }}>✉</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: "center", lineHeight: 1.6 }}>Select a message to read and reply</div>
        </div>
      )}
    </div>
  );
}


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
      action: () => onNavigate("bookingkit"),
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

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function MobileBottomNav({ activeTab, setActiveTab, dueCount, unreadCount, inboundCount }) {
  const NAV_ITEMS = [
    { id: 'dashboard', icon: String.fromCharCode(9635), label: 'Home' },
    { id: 'pipeline',  icon: String.fromCharCode(11035), label: 'Pipeline' },
    { id: 'followups', icon: String.fromCharCode(9200), label: 'Follow-ups', badge: dueCount },
    { id: 'bookingdesk',  icon: String.fromCharCode(9993), label: 'Reply', badge: unreadCount },
    { id: 'inbound',   icon: '⬇', label: 'Inbound', badge: inboundCount },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: '#111111', borderTop: '1px solid #1E1E1E',
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {NAV_ITEMS.map(item => {
        const active = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
            flex: 1, padding: '10px 4px 8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            position: 'relative',
          }}>
            {item.badge > 0 && (
              <div style={{
                position: 'absolute', top: 6, right: '50%', marginRight: -18,
                background: '#D4AF37', color: '#000',
                borderRadius: 8, padding: '0 4px',
                fontSize: 9, fontWeight: 800, lineHeight: '14px',
                minWidth: 14, textAlign: 'center',
              }}>{item.badge}</div>
            )}
            <span style={{ fontSize: 18, lineHeight: 1, opacity: active ? 1 : 0.4 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#8B4FFF' : '#888' }}>{item.label}</span>
            {active && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: '#8B4FFF', borderRadius: 2 }} />}
          </button>
        );
      })}
    </div>
  );
}


function ReviewNudgeModal({ lead, onClose, reviewEmail }) {
  const subject = encodeURIComponent(`NoxReach feedback — ${lead.name} booked!`);
  const body = encodeURIComponent(
`Hey,

I just booked ${lead.name} using NoxReach and wanted to share my experience.

[Write one or two sentences about how NoxReach helped you get this booking]

Feel free to use this as a testimonial on the site.

— [Your name / DJ handle]`
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`}</style>
      <div style={{
        background: "#111111",
        border: `1px solid ${COLORS.purpleDim}`,
        borderRadius: 20, width: 420, maxWidth: "95vw",
        overflow: "hidden",
        boxShadow: `0 0 80px rgba(212,175,55,0.15), 0 32px 80px rgba(0,0,0,0.7)`,
        animation: "slideUp 0.2s ease",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple}, ${COLORS.purpleLight})` }} />
        <div style={{ padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
            {lead.name} is booked!
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.7, marginBottom: 24 }}>
            Congrats on the booking. Would you take 30 seconds to share what helped?
            Your feedback helps NoxReach grow — and gets you featured on the site.
          </div>
          <div style={{
            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: "14px 16px", marginBottom: 24, textAlign: "left",
          }}>
            <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>What happens</div>
            {[
              "Opens your email with the message pre-filled",
              "You edit and hit send — takes 30 seconds",
              "Best quotes get featured on NoxReach.io",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.gold + "22", border: `1px solid ${COLORS.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 8, color: COLORS.gold, fontWeight: 800 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href={`mailto:${reviewEmail}?subject=${subject}&body=${body}`}
              onClick={onClose}
              style={{
                display: "block", padding: "13px",
                background: `linear-gradient(135deg, ${COLORS.gold}, #f0c040)`,
                borderRadius: 12, color: "#000",
                fontSize: 14, fontWeight: 800,
                textDecoration: "none", textAlign: "center",
                boxShadow: "0 4px 20px rgba(212,175,55,0.4)",
              }}>
              Share my experience →
            </a>
            <button onClick={onClose} style={{
              padding: "10px", background: "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12, color: COLORS.textMuted,
              fontSize: 12, cursor: "pointer",
            }}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function OutreachMethodModal({ lead, onClose, onSelect, templates }) {
  const METHODS = [
    { id: "email",    icon: "📧", label: "Email",        hasTemplate: true  },
    { id: "instagram",icon: "📸", label: "Instagram DM", hasTemplate: false },
    { id: "whatsapp", icon: "💬", label: "WhatsApp",     hasTemplate: false },
    { id: "phone",    icon: "📞", label: "Phone",        hasTemplate: false },
    { id: "other",    icon: "✦",  label: "Other",        hasTemplate: false },
  ];

  const buildMailto = () => {
    const template = templates.find(t => t.id === "berlin");
    const body = template ? template.text : "Hey,\n\nI wanted to reach out about a potential booking.\n\n— GEEZ";
    const subject = encodeURIComponent("Booking Inquiry — GEEZ");
    const encodedBody = encodeURIComponent(body.replace("[Name]", lead.name));
    const email = lead.contact || "";
    return "mailto:" + email + "?subject=" + subject + "&body=" + encodedBody;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`}</style>
      <div style={{
        background: COLORS.surface, border: "1px solid " + COLORS.purpleDim,
        borderRadius: 20, width: 400, maxWidth: "95vw",
        overflow: "hidden", animation: "slideUp 0.2s ease",
        boxShadow: "0 0 60px rgba(107,47,212,0.15), 0 32px 80px rgba(0,0,0,0.7)",
      }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, " + COLORS.purple + ", " + COLORS.purpleLight + ")" }} />
        <div style={{ padding: "28px 28px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
            How did you reach out?
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 20 }}>
            {lead.name} · log your outreach method
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {METHODS.map(method => (
              <button key={method.id}
                onClick={() => {
                  if (method.id === "email") {
                    window.open(buildMailto(), "_blank");
                  }
                  onSelect(method.id);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 16px", borderRadius: 10, cursor: "pointer",
                  background: COLORS.bg, border: "1px solid " + COLORS.border,
                  transition: "all 0.15s", textAlign: "left",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = COLORS.purple;
                  e.currentTarget.style.background = COLORS.purpleBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.background = COLORS.bg;
                }}
              >
                <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{method.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{method.label}</div>
                  {method.hasTemplate && (
                    <div style={{ fontSize: 11, color: COLORS.purple, marginTop: 2 }}>Opens email with template pre-filled →</div>
                  )}
                </div>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>›</span>
              </button>
            ))}
          </div>

          <button onClick={onClose} style={{
            width: "100%", marginTop: 12, padding: "10px",
            background: "transparent", border: "1px solid " + COLORS.border,
            borderRadius: 10, color: COLORS.textMuted, fontSize: 12, cursor: "pointer",
          }}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function NoxReachApp({ user, session, supabase }) {
  const userEmail = user?.email || "";
  const userName  = user?.user_metadata?.full_name || userEmail.split("@")[0] || "DJ";
  const isMobile  = useIsMobile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const [activeTab, setActiveTab]       = useState("pipeline");
  const [leads, setLeads]               = useState([]);
  const [gigs,  setGigs]                = useState([]);
  const [dataLoading, setDataLoading]   = useState(true);
  const [settings, setSettings]         = useState(() => loadSettings());
  const [isPro, setIsPro]               = useState(() => loadIsPro(user.id));React.useEffect(function() {
    if (!user) return;
    supabase.from("profiles").select("is_pro").eq("id", user.id).single()
      .then(function(r) {
        if (r.data && r.data.is_pro) {
          setIsPro(true);
          saveIsPro(true, user.id);
        }
      });
  }, [user]);
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [customTags, setCustomTags]     = useState(() => loadCustomTags());
  const [onboardingAssets, setOnboardingAssets] = useState(null);

  // Load assets for onboarding check
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("user_assets").select("epk_url,soundcloud,booking_email").eq("user_id", user.id).maybeSingle()
      .then(({ data, error }) => setOnboardingAssets(error ? {} : (data || {})));
  }, [user?.id]);

  // ── Load user's leads + gigs from Supabase on mount ─────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const loadData = async () => {
      setDataLoading(true);
      try {
        const [leadsRes, gigsRes] = await Promise.all([
          supabase.from("leads").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("gigs").select("*").eq("user_id", user.id).order("date", { ascending: true }),
        ]);
        if (leadsRes.data) setLeads(leadsRes.data.map(dbToLead));
        if (gigsRes.data)  setGigs(gigsRes.data.map(dbToGig));
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  // Derived — always up to date with customTags
  const TAG_COLORS = Object.fromEntries(customTags.map(t => [t, tagColor(t)]));

  const addCustomTag = (tag) => {
    const clean = tag.trim();
    if (!clean || customTags.includes(clean)) return false;
    const next = [...customTags, clean];
    setCustomTags(next);
    saveCustomTags(next);
    return true;
  };

  const removeCustomTag = (tag) => {
    if (DEFAULT_TAGS.includes(tag)) return; // can't remove built-ins
    const next = customTags.filter(t => t !== tag);
    setCustomTags(next);
    saveCustomTags(next);
  }; // null or reason string
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reviewNudge, setReviewNudge] = useState(null);
  const [toast, setToast]               = useState(null);

  // Search + filter state lives here so header can own the bar
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ tier: null, tag: null, stage: null });

  // Leads + gigs are saved to Supabase on each mutation (see addLead, moveLead, etc.)

  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const [showWelcomePro, setShowWelcomePro] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    try { return localStorage.getItem("noxreach_onboarding_done_" + user.id) === "true"; } catch { return false; }
  });
  const requestUpgrade = (reason) => setUpgradeModal(reason);

  const handleUpgrade = async (plan = "monthly") => {
    try {
      showToast("Opening checkout...", "info");
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) { showToast("Please sign in first", "error"); return; }
      const res = await fetch(
        `${supabase.supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ plan }),
        }
      );
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { showToast(data.error || "Checkout failed", "error"); }
    } catch (e) { showToast("Checkout error: " + e.message, "error"); }
  };


  const addLead = async (lead) => {
    const activeCount = leads.filter(l => !l.archived).length;
    if (!isPro && activeCount >= FREE_LIMITS.leads) { requestUpgrade("leads"); return; }
    try {
      const { data, error } = await supabase.from("leads").insert([leadToDb(lead, user.id)]).select().single();
      if (error) throw error;
      setLeads(prev => [dbToLead(data), ...prev]);
      setActiveTab("pipeline");
      showToast(`${lead.name} added to pipeline`, "success");
    } catch (err) {
      showToast("Failed to save lead. Try again.", "info");
      console.error(err);
    }
  };

  const getAutoFollowUpDate = (newStage) => {
    const today = new Date();
    const add = d => { const x = new Date(today); x.setDate(x.getDate() + d); return x.toISOString().split("T")[0]; };
    if (newStage === "contacted") return add(settings.followup1Days);
    if (newStage === "followup1") return add(settings.followup2Days);
    if (newStage === "followup2") return add(settings.followup2Days);
    return null;
  };

  const FOLLOWUP_MESSAGES = {
    contacted: `Follow-up 1 scheduled in ${settings.followup1Days} days`,
    followup1: `Follow-up 2 scheduled in ${settings.followup2Days} days`,
    followup2: "Final follow-up scheduled", replied: "Nice — they replied! Close this one.", booked: "🎉 Booked! You're on the lineup."
  };

  const saveSettingsHandler = (newSettings) => {
    if (!isPro) { requestUpgrade("settings"); return; }
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast("Settings saved", "success");
  };

  const moveLead = async (leadId, newStage) => {
    const today    = new Date().toISOString().split("T")[0];
    const autoDate = (!isPro && ["contacted","followup1","followup2"].includes(newStage)) ? null : getAutoFollowUpDate(newStage);
    const update   = l => ({ ...l, stage: newStage, lastContact: ["contacted","followup1","followup2"].includes(newStage) ? today : l.lastContact, followUpDate: autoDate !== undefined ? autoDate : l.followUpDate });
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? update(l) : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => update(prev));
    if (!isPro && ["contacted","followup1","followup2"].includes(newStage)) {
      showToast("Stage updated · Auto-scheduling is a Pro feature", "info");
    } else if (FOLLOWUP_MESSAGES[newStage]) {
      showToast(FOLLOWUP_MESSAGES[newStage], ["booked","replied"].includes(newStage) ? "success" : "schedule");
    }
    if (newStage === "booked") {
      const bookedLead = leads.find(l => l.id === leadId) || { id: leadId, name: "this venue" };
      setReviewNudge(bookedLead);
    }
    // Persist to Supabase
    try {
      const updated = update(leads.find(l => l.id === leadId) || {});
      await supabase.from("leads").update({
        stage: newStage,
        last_contact: updated.lastContact,
        follow_up_date: updated.followUpDate,
      }).eq("id", leadId).eq("user_id", user.id);
    } catch (err) { console.error("moveLead sync failed:", err); }
  };

  const updateLeadField = async (leadId, fields) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...fields } : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => ({ ...prev, ...fields }));
    try {
      const dbFields = {};
      if (fields.outreachMethod !== undefined) dbFields.outreach_method = fields.outreachMethod;
      if (fields.contactLog !== undefined) dbFields.contact_log = fields.contactLog;
      if (fields.fee !== undefined) dbFields.fee = fields.fee;
      if (fields.deposit_paid !== undefined) dbFields.deposit_paid = fields.deposit_paid;
      if (Object.keys(dbFields).length > 0) {
        await supabase.from("leads").update(dbFields).eq("id", leadId).eq("user_id", user.id);
      }
    } catch (err) { console.error("updateLeadField failed:", err); }
  };

  const archiveLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const nowArchived = !lead?.archived;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, archived: nowArchived } : l));
    showToast(nowArchived ? "Lead archived" : "Lead restored to pipeline", nowArchived ? "info" : "success");
    try {
      await supabase.from("leads").update({ archived: nowArchived }).eq("id", leadId).eq("user_id", user.id);
    } catch (err) { console.error("archiveLead sync failed:", err); }
  };

  const deleteLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    showToast(`${lead?.name || "Lead"} deleted`, "info");
    try {
      await supabase.from("leads").delete().eq("id", leadId).eq("user_id", user.id);
    } catch (err) { console.error("deleteLead sync failed:", err); }
  };

  const resetData = async () => {
    setLeads([]); setGigs([]); setSelectedLead(null);
    setShowResetConfirm(false); setSearch(""); setFilters({ tier: null, tag: null, stage: null });
    showToast("Pipeline cleared", "info");
    try {
      await Promise.all([
        supabase.from("leads").delete().eq("user_id", user.id),
        supabase.from("gigs").delete().eq("user_id", user.id),
      ]);
    } catch (err) { console.error("resetData sync failed:", err); }
  };
const dueCount     = leads.filter(l => !l.archived && l.followUpDate && new Date(l.followUpDate) <= new Date()).length;
  const repliedCount = leads.filter(l => !l.archived && !l.is_inbound && (l.stage === "replied" || l.stage === "booked")).length;
  const inboundCount = leads.filter(l => !l.archived && l.is_inbound && l.stage === "replied").length;
  const unreadCount  = useMemo(() => {
    try {
      const read = new Set(JSON.parse(localStorage.getItem("noxreach_read_replies") || "[]"));
      return leads.filter(l => !l.archived && !l.is_inbound && (l.stage === "replied" || l.stage === "booked") && !read.has(l.id)).length;
    } catch { return 0; }
  }, [leads]);
const activeLeads = leads.filter(l => !l.archived);
  const hasFilter   = search || filters.tier || filters.tag || filters.stage;
  // ── Loading screen while fetching user data ────────────────────────────────
  if (dataLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060608", flexDirection: "column", gap: 16 }}>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <div style={{ width: 36, height: 36, border: "2px solid #1c1c2e", borderTopColor: "#6B2FD4", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <div style={{ fontSize: 11, color: "#50506a", letterSpacing: "0.12em" }}>LOADING YOUR PIPELINE</div>
      </div>
    );
  }

  
  const TABS = [
    { id: "dashboard", label: "Dashboard",  icon: "▣",  group: "main" },
    { id: "pipeline",  label: "Pipeline",   icon: "⬛", group: "main" },
    { id: "followups", label: "Follow-ups", icon: "⏰", badge: dueCount, group: "main" },
    { id: "bookingdesk",  label: "Reply Hub",  icon: "✉",  badge: unreadCount, group: "main" },
    { id: "calendar",  label: "Calendar",   icon: "📅", group: "main" },
    { id: "outreach",  label: "Outreach",   icon: "✦",  group: "ref" },
    { id: "bookingkit", label: "Booking Kit", icon: "◇",  group: "ref" },
    { id: "settings",  label: "Settings",   icon: "⚙",  group: "ref" },
    { id: "inbound",   label: "Inbound",    icon: "⬇",  badge: inboundCount, group: "ref" },
  ];

  

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active, textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0A0A0A inset !important; -webkit-text-fill-color: #F0F0F0 !important; caret-color: #F0F0F0 !important; transition: background-color 9999s ease-in-out 0s; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active, textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0A0A0A inset !important; -webkit-text-fill-color: #F0F0F0 !important; caret-color: #F0F0F0 !important; transition: background-color 9999s ease-in-out 0s; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }
        button:hover { opacity: 0.85; }
        input::placeholder, textarea::placeholder { color: #444; }
      `}</style>

      {showAddModal     && <AddLeadModal onClose={() => setShowAddModal(false)} onAdd={addLead} customTags={customTags} TAG_COLORS={TAG_COLORS} onAddTag={addCustomTag} />}
      {showWelcomePro && (
        <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowWelcomePro(false)}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 20, width: 420, maxWidth: "95vw", overflow: "hidden", boxShadow: `0 0 80px rgba(123,63,228,0.2)` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight}, ${COLORS.gold})` }} />
            <div style={{ padding: "32px 28px" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>Welcome to Pro</div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>Everything is unlocked. Here's what you now have access to:</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  { icon: "∞", label: "Unlimited leads & gigs", desc: "No more caps. Track every opportunity." },
                  { icon: "⏰", label: "Auto follow-up scheduling", desc: "Reminders set themselves at 5 and 14 days." },
                  { icon: "✦", label: "All outreach templates", desc: "Berlin, Circuit, Disco, Leverage — all unlocked." },
                  { icon: "▣", label: "Conversion Funnel + Next Actions", desc: "See exactly where bookings drop off." },
                  { icon: "⚙", label: "Custom follow-up intervals", desc: "Set your own cadence in Settings." },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: COLORS.purple, flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowWelcomePro(false)} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(123,63,228,0.4)" }}>
                Let's go →
              </button>
            </div>
          </div>
        </div>
      )}
      {upgradeModal     && <UpgradeModal reason={upgradeModal} onClose={() => setUpgradeModal(null)} onUpgrade={handleUpgrade} />}
      {reviewNudge && <ReviewNudgeModal lead={reviewNudge} onClose={() => setReviewNudge(null)} reviewEmail="info@soundofgeez.com" />
}
        {showResetConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && setShowResetConfirm(false)}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderBright}`, borderRadius: 16, padding: 28, width: 360, maxWidth: "90vw", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Reset pipeline?</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>This will clear all your leads and replace them with sample data. This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 9, color: COLORS.textSecondary, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={resetData} style={{ flex: 1, padding: "10px", background: COLORS.red + "22", border: `1px solid ${COLORS.red}55`, borderRadius: 9, color: COLORS.red, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Reset</button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} />

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: isMobile ? "none" : "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <a href="https://rackagentur.github.io/NoxReach/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <img src="/nr-icon.png" alt="NoxReach" style={{ width: 54, height: 54, borderRadius: 13, flexShrink: 0 }} />
            <img src="/nr-wordmark.png" alt="NoxReach" style={{ height: 17, objectFit: "contain", opacity: 0.8 }} />
          </a>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {TABS.filter(t => t.group === "main").map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, marginBottom: 4, background: activeTab === tab.id ? COLORS.purpleBg : "transparent", border: `1px solid ${activeTab === tab.id ? COLORS.purpleDim : "transparent"}`, color: activeTab === tab.id ? COLORS.purpleLight : COLORS.textSecondary, fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
              {tab.badge > 0 && <span style={{ marginLeft: "auto", background: COLORS.gold, color: "#000", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{tab.badge}</span>}
            </button>
          ))}
          <div style={{ height: 1, background: COLORS.border, margin: "10px 4px 12px" }} />
          <div style={{ fontSize: 9, color: "#00D4FF", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6, opacity: 0.6 }}>Resources</div>
          {TABS.filter(t => t.group === "ref").map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, marginBottom: 4, background: activeTab === tab.id ? COLORS.purpleBg : "transparent", border: `1px solid ${activeTab === tab.id ? COLORS.purpleDim : "transparent"}`, color: activeTab === tab.id ? COLORS.purpleLight : COLORS.textSecondary, fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.border}` }}>
          {/* Plan chip */}
          {!isPro ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: COLORS.border, color: COLORS.textSecondary, letterSpacing: "0.1em" }}>FREE</div>
                  <span style={{ fontSize: 10, color: COLORS.textMuted }}>{leads.filter(l => !l.archived).length} / {FREE_LIMITS.leads} leads</span>
                </div>
                <button onClick={() => requestUpgrade("leads")} style={{ fontSize: 10, fontWeight: 700, color: COLORS.purple, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Upgrade</button>
              </div>
              <div style={{ height: 3, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (leads.filter(l => !l.archived).length / FREE_LIMITS.leads) * 100)}%`, background: leads.filter(l => !l.archived).length >= FREE_LIMITS.leads ? COLORS.red : COLORS.purple, borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: COLORS.gold + "22", color: COLORS.gold, border: `1px solid ${COLORS.gold}44`, letterSpacing: "0.1em" }}>PRO</div>
              <span style={{ fontSize: 10, color: COLORS.textMuted }}>All features unlocked</span>
              <button onClick={() => { setIsPro(false); saveIsPro(false, user.id); showToast("Switched to Free (demo)", "info"); }} style={{ marginLeft: "auto", fontSize: 9, color: COLORS.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>demo</button>
            </div>
          )}

          {/* Weekly goal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>WEEKLY GOAL</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.green }} />
              <span style={{ fontSize: 9, color: COLORS.green, letterSpacing: "0.06em" }}>SAVED</span>
            </div>
          </div>
          <div style={{ height: 4, background: COLORS.bg, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${Math.min(100, Math.round((activeLeads.filter(l => l.stage !== "target").length / Math.max(activeLeads.length, 1)) * 100))}%`, background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight})`, borderRadius: 4, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{activeLeads.filter(l => l.stage !== "target").length} / {activeLeads.length} contacted</div>
            <button onClick={() => setShowResetConfirm(true)} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 10, cursor: "pointer", padding: 0 }}>reset</button>
          </div>
        {/* User info + sign out */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.purpleBg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.purpleLight, flexShrink: 0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
              <div style={{ fontSize: 9, color: COLORS.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</div>
            </div>
            <button onClick={handleSignOut} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 14, padding: 4, borderRadius: 6, transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = COLORS.red}
              onMouseLeave={e => e.target.style.color = COLORS.textMuted}
            >⏻</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: isMobile ? 0 : 220, display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: isMobile ? 64 : 0 }}>
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: activeTab === "pipeline" ? 14 : 0 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.02em" }}>{TABS.find(t => t.id === activeTab)?.label}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                {activeTab === "pipeline"  && `${activeLeads.length} leads${hasFilter ? ` · filtered` : ""}`}
                {activeTab === "followups" && `${dueCount} due today`}
                {activeTab === "outreach"  && (isPro ? "4 templates ready" : "2 / 4 templates · Upgrade for all")}
                {activeTab === "dashboard" && "Your booking overview"}
                {activeTab === "bookingkit"    && "Your Assets"}
                {activeTab === "bookingdesk"  && `${repliedCount} message${repliedCount !== 1 ? "s" : ""}${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
                {activeTab === "calendar"  && `${gigs.filter(g => new Date(g.date) >= new Date()).length} upcoming gigs`}
                {activeTab === "settings"  && `Follow-up 1: ${settings.followup1Days}d · Follow-up 2: ${settings.followup2Days}d`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {dueCount > 0 && (
                <div style={{ padding: "6px 12px", background: COLORS.gold + "22", border: `1px solid ${COLORS.gold}44`, borderRadius: 8, fontSize: 11, color: COLORS.gold, fontWeight: 700 }}>
                  ⏰ {dueCount} follow-up{dueCount > 1 ? "s" : ""} due
                </div>
              )}
              <button onClick={() => setShowAddModal(true)} style={{ padding: "9px 18px", background: COLORS.purple, border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add Lead</button>
            </div>
          </div>

          {/* Search + filter bar — only on Pipeline */}
          {activeTab === "pipeline" && (
            <SearchFilterBar
              search={search} setSearch={setSearch}
              filters={filters} setFilters={setFilters}
              customTags={customTags} TAG_COLORS={TAG_COLORS}
              resultCount={leads.filter(l => {
                if (l.archived) return false;
                if (search) { const q = search.toLowerCase(); if (![l.name,l.contact,l.instagram,l.notes,l.tag,l.tier].some(f => f && f.toLowerCase().includes(q))) return false; }
                if (filters.tier  && l.tier  !== filters.tier)  return false;
                if (filters.tag   && l.tag   !== filters.tag)   return false;
                if (filters.stage) {
          const stageMap = { followup: ["followup1","followup2"] };
          const allowed = stageMap[filters.stage] || [filters.stage];
          if (!allowed.includes(l.stage)) return false;
        }
                return true;
              }).length}
              totalCount={activeLeads.length}
            />
          )}
        </div>

        {isMobile && <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} dueCount={dueCount} unreadCount={unreadCount} inboundCount={inboundCount} />}

        {/* Content */}
        <div style={{ padding: isMobile ? 16 : 28, flex: 1, display: activeTab === "pipeline" && selectedLead ? "grid" : "block", gridTemplateColumns: activeTab === "pipeline" && selectedLead ? "1fr 280px" : undefined, gap: 20 }}>
          {activeTab === "dashboard" && (
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
          )}
          {activeTab === "pipeline"  && (
            <>
              <PipelineView leads={leads} onMove={moveLead} onSelect={setSelectedLead} selectedLead={selectedLead} onArchive={archiveLead} search={search} filters={filters} TAG_COLORS={TAG_COLORS} customTags={customTags} onUpdateLead={updateLeadField} />
              {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onMove={moveLead} onArchive={archiveLead} onDelete={deleteLead} onUpdate={u => { setLeads(p => p.map(l => l.id === u.id ? u : l)); setSelectedLead(u); }} supabase={supabase} userId={user.id} assets={onboardingAssets} />}
            </>
          )}
          {activeTab === "followups" && <FollowUpsView leads={leads} onNavigate={setActiveTab} />}
          {activeTab === "outreach"  && <OutreachView isPro={isPro} onUpgradeClick={requestUpgrade} />}
          {activeTab === "bookingkit"    && <AssetsView supabase={supabase} userId={user.id} />}
          {activeTab === "calendar"  && <GigCalendarView leads={leads} gigs={gigs} setGigs={setGigs} showToast={showToast} isPro={isPro} onUpgradeClick={requestUpgrade} customTags={customTags} TAG_COLORS={TAG_COLORS} supabase={supabase} userId={user.id} />}
          {activeTab === "bookingdesk" && <ReplyHubView leads={leads} onMove={moveLead} showToast={showToast} TAG_COLORS={TAG_COLORS} />}
          {activeTab === "settings"  && <SettingsView settings={settings} onSave={saveSettingsHandler} isPro={isPro} onUpgradeClick={requestUpgrade} customTags={customTags} defaultTags={DEFAULT_TAGS} onAddTag={addCustomTag} onRemoveTag={removeCustomTag} supabase={supabase} user={user} />}
              {activeTab === "inbound"   && <InboundView leads={leads} user={user} supabase={supabase} />}
        </div>
      </div>
    </div>
  );
}

// ── Export default: wraps everything in AuthGate ──────────────────────────────
function PublicBookingForm({ supabase }) {
  const username = window.location.pathname.split('/book/')[1]?.toLowerCase().trim();
  const [step, setStep] = useState('form');
  const [djProfile, setDjProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ venue: '', event_type: '', date: '', fee_offer: '', contact_email: '', instagram: '', message: '' });

  useEffect(() => {
    if (!username) { setStep('notfound'); return; }
    supabase.from('profiles').select('id, display_name, username').eq('username', username).single()
      .then(({ data, error }) => { if (error || !data) setStep('notfound'); else setDjProfile(data); });
  }, [username]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.venue || !form.contact_email) return;
    setSubmitting(true);
    await supabase.from('leads').insert({
      user_id: djProfile.id, name: form.venue, contact: form.contact_email,
      instagram: form.instagram, stage: 'replied', tag: form.event_type || null, is_inbound: true,
      notes: [form.message, form.date ? 'Date: ' + form.date : '', form.fee_offer ? 'Fee offer: EUR' + form.fee_offer : ''].filter(Boolean).join(' | '),
      last_contact: new Date().toISOString().split('T')[0],
    });
    // Fire notification emails (non-blocking)
    try {
      await fetch('https://ckttttvgvpvflgjzkbmy.supabase.co/functions/v1/booking-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdHR0dHZndnB2ZmxnanprYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzUyODcsImV4cCI6MjA1ODc1MTI4N30.XKFnKhHV4S3WY3qd9fQ4eEe1SOW2JtI5JNPINW6BPWU' },
        body: JSON.stringify({
          venue: form.venue,
          contact_email: form.contact_email,
          instagram: form.instagram,
          event_type: form.event_type,
          date: form.date,
          fee_offer: form.fee_offer,
          message: form.message,
          dj_user_id: djProfile.id,
        }),
      });
    } catch (e) { console.warn('Notify failed', e); }
    setSubmitting(false);
    setStep('success');
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  const lbl = { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  if (!djProfile && step !== 'notfound') return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading...</div>
    </div>
  );

  if (step === 'notfound') return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, color: '#fff', marginBottom: 16 }}>404</div><div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Booking page not found</div></div>
    </div>
  );

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <img src="https://rackagentur.github.io/NoxReach/public/nr-icon.png" width="48" height="48" style={{ borderRadius: 12, marginBottom: 24 }} alt="NR" />
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Booking request sent</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>{djProfile.display_name} will review your request and get back to you soon.</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Powered by NoxReach</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: '-apple-system, sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="https://rackagentur.github.io/NoxReach/public/nr-icon.png" width="44" height="44" style={{ borderRadius: 11, marginBottom: 16 }} alt="NR" />
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Book {djProfile.display_name}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Fill out the form and we will get back to you</div>
        </div>
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div><label style={lbl}>Venue / Event name *</label><input style={inp} value={form.venue} onChange={set('venue')} placeholder="e.g. Berghain, Pride Amsterdam" /></div>
          <div><label style={lbl}>Event type</label>
            <select style={{ ...inp, colorScheme: 'dark' }} value={form.event_type} onChange={set('event_type')}>
              <option value="">Select type...</option>
              <option>Club Night</option><option>Festival</option><option>Pride / CSD</option><option>Circuit Festival</option><option>Private Event</option><option>Other</option>
            </select>
          </div>
          <div><label style={lbl}>Event date</label><input style={{ ...inp, colorScheme: 'dark' }} type="date" value={form.date} onChange={set('date')} /></div>
          <div><label style={lbl}>Fee offer (€)</label><input style={inp} type="number" value={form.fee_offer} onChange={set('fee_offer')} placeholder="e.g. 800" /></div>
          <div><label style={lbl}>Your email *</label><input style={inp} type="email" value={form.contact_email} onChange={set('contact_email')} placeholder="booker@venue.com" /></div>
          <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={set('instagram')} placeholder="@venuename" /></div>
          <div><label style={lbl}>Message</label><textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder="Tell us about the event, expected crowd, set time..." /></div>
          <button onClick={handleSubmit} disabled={submitting || !form.venue || !form.contact_email}
            style={{ background: '#D4AF37', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', opacity: (!form.venue || !form.contact_email) ? 0.5 : 1 }}>
            {submitting ? 'Sending...' : 'Send booking request'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Powered by NoxReach</div>
      </div>
    </div>
  );
}

export default function NoxReach() {
  if (window.location.pathname.startsWith('/book/')) return <PublicBookingForm supabase={supabase} />;
  return (
    <AuthGate>
      {({ user, session, supabase }) => (
        <NoxReachApp user={user} session={session} supabase={supabase} />
      )}
    </AuthGate>
  );
}
