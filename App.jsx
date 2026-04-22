import { useState, useEffect, useRef, useMemo } from "react";

const COLORS = {
  bg: "#0A0A0A", surface: "#111111", surfaceHover: "#181818",
  border: "#1E1E1E", borderBright: "#2A2A2A",
  purple: "#7B3FE4", purpleLight: "#9B5FFF", purpleDim: "#4A2490", purpleBg: "#1A0F2E",
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

const INITIAL_LEADS = [
  { id: 1, name: "Tresor Berlin",       contact: "booking@tresor.de",       instagram: "@tresorberlin",    tier: "A1", tag: "Tech-House", stage: "target",    notes: "Legendary Berlin venue. Monday nights.",      followUpDate: null,         lastContact: null },
  { id: 2, name: "Fabric London",       contact: "bookings@fabriclondon.com",instagram: "@fabriclondon",    tier: "A1", tag: "Disco",      stage: "contacted", notes: "Room 1 focus. Sent initial email.",           followUpDate: "2025-01-20", lastContact: "2025-01-15" },
  { id: 3, name: "Output NYC",          contact: "info@outputclub.com",      instagram: "@outputclub",      tier: "A2", tag: "Tech-House", stage: "followup1", notes: "No reply to first email. Follow up.",         followUpDate: "2025-01-18", lastContact: "2025-01-10" },
  { id: 4, name: "The BPM Festival",    contact: "artists@bpmfestival.com",  instagram: "@bpmfestival",     tier: "A2", tag: "Festival",   stage: "replied",   notes: "They asked for mix + EPK. Sent.",             followUpDate: null,         lastContact: "2025-01-14" },
  { id: 5, name: "Alegria NYC",         contact: "booking@alegrianyc.com",   instagram: "@alegrainyc",      tier: "A2", tag: "Disco",      stage: "booked",    notes: "Confirmed March 15th. ✓",                    followUpDate: null,         lastContact: "2025-01-12" },
  { id: 6, name: "De School Amsterdam", contact: "booking@deschool.nl",      instagram: "@deschool_ams",    tier: "A1", tag: "Tech-House", stage: "target",    notes: "Intimate venue. Very selective.",             followUpDate: null,         lastContact: null },
  { id: 7, name: "Club Space Miami",    contact: "booking@clubspace.com",    instagram: "@clubspace_miami", tier: "A2", tag: "Disco",      stage: "followup2", notes: "2nd follow-up today. Last attempt.",          followUpDate: "2025-01-19", lastContact: "2025-01-05" },
];

const TIER_COLORS = { A1: COLORS.gold, A2: COLORS.purple, A3: COLORS.textSecondary };

const STORAGE_KEY      = "stageflow_leads_v1";
const STORAGE_KEY_GIGS = "stageflow_gigs_v1";
function loadLeads() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {} return INITIAL_LEADS; }
function saveLeads(leads) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch {} }
function loadGigs() { try { const r = localStorage.getItem(STORAGE_KEY_GIGS); if (r) return JSON.parse(r); } catch {} return INITIAL_GIGS; }
function saveGigs(gigs) { try { localStorage.setItem(STORAGE_KEY_GIGS, JSON.stringify(gigs)); } catch {} }

const STORAGE_KEY_SETTINGS = "stageflow_settings_v1";
const DEFAULT_SETTINGS = { followup1Days: 5, followup2Days: 14 };
function loadSettings() { try { const r = localStorage.getItem(STORAGE_KEY_SETTINGS); if (r) return { ...DEFAULT_SETTINGS, ...JSON.parse(r) }; } catch {} return DEFAULT_SETTINGS; }
function saveSettings(s) { try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s)); } catch {} }

const STORAGE_KEY_PRO = "stageflow_pro_v1";
function loadIsPro() { try { return localStorage.getItem(STORAGE_KEY_PRO) === "true"; } catch { return false; } }
function saveIsPro(v) { try { localStorage.setItem(STORAGE_KEY_PRO, String(v)); } catch {} }
const FREE_LIMITS = { leads: 10, gigs: 5, templates: 2 };

const STORAGE_KEY_TAGS = "stageflow_tags_v1";
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

const INITIAL_GIGS = [
  { id: 101, venue: "Alegria NYC",         city: "New York, US",    date: relDate(24),  status: "confirmed", fee: "€800",  tag: "Disco",      notes: "Opening set, 1am–3am. Rider sent." },
  { id: 102, venue: "Club Space Miami",    city: "Miami, US",       date: relDate(38),  status: "pending",   fee: "€600",  tag: "Disco",      notes: "Awaiting contract confirmation." },
  { id: 103, venue: "The BPM Festival",    city: "Playa del Carmen",date: relDate(55),  status: "confirmed", fee: "€1200", tag: "Festival",   notes: "Terrace stage, sunset slot." },
  { id: 104, venue: "Fabric London",       city: "London, UK",      date: relDate(72),  status: "pending",   fee: "€700",  tag: "Disco",      notes: "Room 2, still negotiating." },
  { id: 105, venue: "Output NYC",          city: "New York, US",    date: relDate(-14), status: "confirmed", fee: "€500",  tag: "Tech-House", notes: "Went well. Good crowd." },
];

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
  const bars = [0.4, 0.65, 0.85, 1.0];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.12, height: size }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: size * 0.18, height: size * h, background: i === 3 ? COLORS.purple : `rgba(123,63,228,${0.4 + i * 0.2})`, borderRadius: size * 0.04, boxShadow: i === 3 ? `0 0 ${size * 0.3}px rgba(123,63,228,0.6)` : "none" }} />
      ))}
    </div>
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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

        {STAGES.map(s => (
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

function LeadCard({ lead, onMove, onSelect, isSelected, onArchive, searchQuery, TAG_COLORS }) {
  const stageIndex = STAGES.findIndex(s => s.id === lead.stage);
  const isOverdue  = lead.followUpDate && new Date(lead.followUpDate) <= new Date();

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
    <div onClick={() => onSelect(lead)} style={{
      background: isSelected ? COLORS.purpleBg : COLORS.surface,
      border: `1px solid ${isSelected ? COLORS.purple : isOverdue && !lead.archived ? COLORS.gold + "66" : COLORS.border}`,
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{highlight(lead.name)}</div>
        <Badge color={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <Badge color={TAG_COLORS[lead.tag] || COLORS.textSecondary}>{lead.tag}</Badge>
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
            <button onClick={e => { e.stopPropagation(); onMove(lead.id, STAGES[stageIndex + 1].id); }} style={{ flex: 2, padding: "5px", background: COLORS.purple + "33", border: `1px solid ${COLORS.purple}66`, borderRadius: 6, color: COLORS.purpleLight, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
              {stageIndex === STAGES.length - 2 ? "✓ Book" : "Advance →"}
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onArchive(lead.id); }} title="Archive" style={{ padding: "5px 8px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textMuted, fontSize: 11, cursor: "pointer" }}>◻</button>
        </div>
      ) : (
        <button onClick={e => { e.stopPropagation(); onArchive(lead.id); }} style={{ width: "100%", padding: "5px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textSecondary, fontSize: 11, cursor: "pointer" }}>↩ Restore</button>
      )}
    </div>
  );
}

// ─── Pipeline View ────────────────────────────────────────────────────────────

function PipelineView({ leads, onMove, onSelect, selectedLead, onArchive, search, filters, TAG_COLORS, customTags }) {
  const [showArchived, setShowArchived] = useState(false);

  const applyFilters = (list) => list.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      const hit = [l.name, l.contact, l.instagram, l.notes, l.tag, l.tier].some(f => f && f.toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (filters.tier  && l.tier    !== filters.tier)  return false;
    if (filters.tag   && l.tag     !== filters.tag)   return false;
    if (filters.stage && l.stage   !== filters.stage) return false;
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
                <LeadCard key={lead.id} lead={lead} onMove={onMove} onSelect={onSelect} isSelected={selectedLead?.id === lead.id} onArchive={onArchive} searchQuery={search} TAG_COLORS={TAG_COLORS} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {STAGES.map(stage => {
            // If stage filter is active, only show the matching column prominently
            const isFiltered = filters.stage && filters.stage !== stage.id;
            const stageLeads = activeLeads.filter(l => l.stage === stage.id);
            return (
              <div key={stage.id} style={{ minWidth: 220, flex: 1, opacity: isFiltered ? 0.3 : 1, transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase" }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: stageLeads.length > 0 ? COLORS.textSecondary : COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>{stageLeads.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 100 }}>
                  {stageLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onMove={onMove} onSelect={onSelect} isSelected={selectedLead?.id === lead.id} onArchive={onArchive} searchQuery={search} TAG_COLORS={TAG_COLORS} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 10, padding: "24px 16px", textAlign: "center", color: COLORS.textMuted, fontSize: 11 }}>
                      {hasFilter ? "No matches" : "Empty"}
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

function LeadDetail({ lead, onClose, onMove, onArchive, onDelete, TAG_COLORS }) {
  if (!lead) return null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const today = new Date();
  const followUpDate = lead.followUpDate ? new Date(lead.followUpDate) : null;
  const isOverdue  = followUpDate && followUpDate <= today;
  const daysUntil  = followUpDate ? Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24)) : null;

  const STAGE_HINTS = {
    target:    { next: "contacted", label: "Mark as Contacted",  hint: "Follow-up reminder in 5 days" },
    contacted: { next: "followup1", label: "Send Follow-up 1",   hint: "Reminder auto-set for +5 days" },
    followup1: { next: "followup2", label: "Send Follow-up 2",   hint: "Last reminder auto-set for +14 days" },
    followup2: { next: "replied",   label: "They Replied!",      hint: "Move to replied — no more reminders" },
    replied:   { next: "booked",    label: "Confirm Booking ✓",  hint: "Lock it in" },
  };
  const hint = STAGE_HINTS[lead.stage];

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, position: "sticky", top: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>{lead.name}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge color={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
            <Badge color={TAG_COLORS[lead.tag] || COLORS.textSecondary}>{lead.tag}</Badge>
            {lead.archived && <Badge color={COLORS.textMuted}>Archived</Badge>}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {followUpDate && !lead.archived && (
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: isOverdue ? COLORS.gold + "18" : COLORS.purpleBg, border: `1px solid ${isOverdue ? COLORS.gold + "55" : COLORS.purpleDim}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{isOverdue ? "⏰" : "📅"}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? COLORS.gold : COLORS.purpleLight }}>
              {isOverdue ? "Follow-up overdue" : daysUntil === 0 ? "Follow up today" : `Follow up in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{lead.followUpDate}</div>
          </div>
        </div>
      )}

      {hint && !lead.archived && (
        <button onClick={() => onMove(lead.id, hint.next)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, cursor: "pointer", marginBottom: 16, background: `linear-gradient(135deg, ${COLORS.purple}44, ${COLORS.purpleLight}22)`, border: `1px solid ${COLORS.purple}88`, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.purpleLight }}>{hint.label}</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>{hint.hint}</div>
          </div>
          <span style={{ fontSize: 18, color: COLORS.purple }}>→</span>
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {[["Email", lead.contact], ["Instagram", lead.instagram], ["Last Contact", lead.lastContact || "Never"]].map(([k, v]) => v ? (
          <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: COLORS.textSecondary, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</span>
            <span style={{ fontSize: 12, color: COLORS.text, fontFamily: k === "Email" ? "'DM Mono', monospace" : "inherit" }}>{v}</span>
          </div>
        ) : null)}
      </div>

      {lead.notes && (
        <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
          {lead.notes}
        </div>
      )}

      {!lead.archived && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>All Stages</div>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => onMove(lead.id, s.id)} style={{ padding: "8px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", background: lead.stage === s.id ? COLORS.purpleBg : "transparent", border: `1px solid ${lead.stage === s.id ? COLORS.purple : COLORS.border}`, color: lead.stage === s.id ? COLORS.purpleLight : COLORS.textSecondary, fontSize: 12, fontWeight: lead.stage === s.id ? 700 : 400, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
              {s.label}
              {lead.stage === s.id && <span style={{ marginLeft: "auto", fontSize: 10 }}>◀ current</span>}
            </button>
          ))}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {!confirmDelete ? (
          <>
            <button onClick={() => { onArchive(lead.id); onClose(); }} style={{ width: "100%", padding: "9px 14px", borderRadius: 9, cursor: "pointer", textAlign: "left", background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{lead.archived ? "↩" : "◻"}</span>
              {lead.archived ? "Restore to pipeline" : "Archive lead"}
            </button>
            <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", padding: "9px 14px", borderRadius: 9, cursor: "pointer", textAlign: "left", background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.red + "AA", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✕</span> Delete permanently
            </button>
          </>
        ) : (
          <div style={{ background: COLORS.red + "11", border: `1px solid ${COLORS.red}44`, borderRadius: 10, padding: "14px" }}>
            <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 600, marginBottom: 10 }}>Delete "{lead.name}"? This can't be undone.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "8px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 7, color: COLORS.textSecondary, fontSize: 12, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { onDelete(lead.id); onClose(); }} style={{ flex: 1, padding: "8px", background: COLORS.red + "22", border: `1px solid ${COLORS.red}66`, borderRadius: 7, color: COLORS.red, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        )}
      </div>
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
        style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit", transition: "border-color 0.15s" }}
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
  const handleSubmit = () => { onAdd({ ...form, id: Date.now(), followUpDate: null, lastContact: null }); onClose(); };

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
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, position: "relative", overflow: "hidden" }}>
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
      const daysLabel  = l.followUpDate ? (isOverdue ? (daysAgo === 0 ? "Today" : `${daysAgo}d overdue`) : `in ${Math.abs(daysAgo)}d`) : "No date set";
      const urgency    = isOverdue ? 0 : daysAgo === null ? 3 : 1;
      return { ...l, stageLabel, daysLabel, isOverdue, urgency, stageIdx };
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
      <div style={{ display: "flex", gap: 14 }}>
        <StatCard label="Total Leads"   value={total}           sub="in pipeline"                                         accent={COLORS.textSecondary} />
        <StatCard label="Outreach Sent" value={contacted}       sub={`${active.filter(l => l.stage === "target").length} still in target`} accent={COLORS.purple} />
        <StatCard label="Reply Rate"    value={`${replyRate}%`} sub={`${replied} replies`}                                accent={COLORS.purpleLight} />
        <StatCard label="Booked"        value={booked}          sub="confirmed gigs"                                      accent={COLORS.gold} />
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
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: lead.isOverdue ? COLORS.gold + "22" : COLORS.purpleBg, border: `1px solid ${lead.isOverdue ? COLORS.gold + "55" : COLORS.purpleDim}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: lead.isOverdue ? COLORS.gold : COLORS.purple, letterSpacing: "0.04em" }}>{lead.stageLabel}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                        {lead.stage === "replied" ? "They replied — close this booking" :
                         lead.stage === "contacted" ? "Send follow-up 1" :
                         lead.stage === "followup1" ? "Send follow-up 2" :
                         lead.stage === "followup2" ? "Final follow-up — last attempt" : "Take action"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: lead.isOverdue ? COLORS.gold : COLORS.textSecondary }}>{lead.daysLabel}</div>
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
                {i < funnel.length - 1 && dropoffs[i] !== null && dropoffs[i] > 0 && (
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
                {total > 0 ? Math.round(fBooked / total * 100) : 0}%
              </div>
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
                  <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{lead.followUpDate}</div>
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

function AssetsView() {
  const [activeSection, setActiveSection] = useState("epk");
  const SECTIONS = [
    { id: "epk",   label: "EPK",         icon: "📄" },
    { id: "mixes", label: "Mixes",       icon: "🎧" },
    { id: "bio",   label: "Bio & Press", icon: "✦"  },
    { id: "links", label: "Quick Links", icon: "🔗" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, padding: "0 4px" }}>Your Assets</div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ padding: "12px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer", background: activeSection === s.id ? COLORS.purpleBg : COLORS.surface, border: `1px solid ${activeSection === s.id ? COLORS.purple : COLORS.border}`, color: activeSection === s.id ? COLORS.purpleLight : COLORS.textSecondary, fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
        <div style={{ marginTop: 12, padding: "14px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
          <img src="https://soundofgeez.com/BRANDWT.png" alt="GEEZ" style={{ width: "100%", objectFit: "contain", marginBottom: 10, maxHeight: 48 }} />
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text, textAlign: "center" }}>GEEZ</div>
          <div style={{ fontSize: 10, color: COLORS.textSecondary, textAlign: "center", marginTop: 2 }}>Cologne, DE · International DJ</div>
          <div style={{ height: 1, background: COLORS.border, margin: "10px 0" }} />
          <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.5, textAlign: "center", fontStyle: "italic" }}>"Peak-driven Tech House. Disco soul. Tribal energy."</div>
        </div>
      </div>
      <div>
        {activeSection === "epk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ marginBottom: 4 }}><div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>Electronic Press Kit</div><div style={{ fontSize: 12, color: COLORS.textSecondary }}>Send this to venues. It has everything they need.</div></div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(135deg, ${COLORS.purpleBg}, #0A0A18)`, padding: "28px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.02em" }}>GEEZ</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>International DJ & Producer · Cologne, DE</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{["Tech House", "Tribal", "Circuit"].map(t => <Badge key={t} color={COLORS.purple}>{t}</Badge>)}</div>
                </div>
                <a href="https://soundofgeez.com/GeezEPK.pdf" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "12px 22px", background: COLORS.purple, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px rgba(123,63,228,0.4)` }}>↓ Download EPK (PDF)</button>
                </a>
              </div>
              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What's inside the EPK</div>
                {["Artist bio & history", "Booking contact info", "Genre & style overview", "Press photos", "Mix / audio links"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: COLORS.textSecondary }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.purple }} />{item}</div>
                ))}
              </div>
            </div>
            <CopyBlock label="EPK PDF URL" value="https://soundofgeez.com/GeezEPK.pdf" />
            <AssetLink icon="🖼" label="Download Press Photos" sublabel="ZIP archive · soundofgeez.com" href="https://soundofgeez.com/press_photos.zip" accent={COLORS.gold} actionLabel="Download" />
          </div>
        )}
        {activeSection === "mixes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ marginBottom: 4 }}><div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>Mixes & Audio</div><div style={{ fontSize: 12, color: COLORS.textSecondary }}>Send a link before or after initial outreach.</div></div>
            <AssetLink icon="☁" label="SoundCloud Profile" sublabel="gregorgusgeez · Full discography & mixes" href="https://soundcloud.com/gregorgusgeez" accent={COLORS.purple} actionLabel="Listen" />
            <AssetLink icon="♫" label="Spotify" sublabel="Stream releases on Spotify" href="https://soundofgeez.com/music.html" accent={COLORS.green} actionLabel="Stream" />
            <div style={{ marginTop: 4 }}><div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Copy links for outreach</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><CopyBlock label="SoundCloud" value="https://soundcloud.com/gregorgusgeez" /><CopyBlock label="Website" value="https://soundofgeez.com" /></div></div>
            <div style={{ background: COLORS.purpleBg, border: `1px solid ${COLORS.purpleDim}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, color: COLORS.purple, fontWeight: 700, marginBottom: 6 }}>💡 Outreach tip</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6 }}>Don't lead with the mix link. Send the initial message first — build curiosity. Drop the SoundCloud link only when they ask or in follow-up 1.</div>
            </div>
          </div>
        )}
        {activeSection === "bio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ marginBottom: 4 }}><div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>Bio & Press</div><div style={{ fontSize: 12, color: COLORS.textSecondary }}>Use in outreach, EPKs, and social bios.</div></div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.06em", textTransform: "uppercase" }}>Official Bio</div>
                <button onClick={() => navigator.clipboard.writeText("GEEZ is an international circuit DJ known for precision-built tribal and tech house sets that rise from hypnotic groove into peak-hour intensity. With commanding stage presence and emotional control, he delivers nights that build, sweat, and release together. From Pride main stages to global circuit floors, GEEZ brings power without chaos and groove without compromise.")}
                  style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textSecondary, fontSize: 11, cursor: "pointer" }}>Copy</button>
              </div>
              <div style={{ padding: "18px", fontSize: 13, color: COLORS.text, lineHeight: 1.8, fontStyle: "italic" }}>"GEEZ is an international circuit DJ known for precision-built tribal and tech house sets that rise from hypnotic groove into peak-hour intensity. With commanding stage presence and emotional control, he delivers nights that build, sweat, and release together. From Pride main stages to global circuit floors, GEEZ brings power without chaos and groove without compromise."</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Press Gallery</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}`, aspectRatio: "1", background: COLORS.surface }}>
                    <img src={`https://soundofgeez.com/assets/gallery${n}.jpg`} alt={`GEEZ press ${n}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}><AssetLink icon="🖼" label="Download All Press Photos" sublabel="High-res ZIP · For venue promoters" href="https://soundofgeez.com/press_photos.zip" accent={COLORS.gold} actionLabel="Download" /></div>
            </div>
          </div>
        )}
        {activeSection === "links" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ marginBottom: 4 }}><div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>Quick Links</div><div style={{ fontSize: 12, color: COLORS.textSecondary }}>Everything you need to paste into an outreach message.</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CopyBlock label="Website"      value="https://soundofgeez.com" />
              <CopyBlock label="EPK (PDF)"    value="https://soundofgeez.com/GeezEPK.pdf" />
              <CopyBlock label="SoundCloud"   value="https://soundcloud.com/gregorgusgeez" />
              <CopyBlock label="Instagram"    value="https://instagram.com/gregorgusgeez" />
              <CopyBlock label="Booking Email" value="info@soundofgeez.com" />
              <CopyBlock label="Press Photos" value="https://soundofgeez.com/press_photos.zip" />
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Video Reels</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{ label: "Geez & Jezebel @ Outsiders", type: "Live Set" }, { label: "Moussa & Geez @ Outsiders", type: "Live Set" }, { label: "Ballroom Code Queer Frankfurt", type: "Live Set" }, { label: "INSOMNIA PROMO", type: "Music Video" }, { label: "FREELOVE! Official", type: "Music Video" }].map((v, i) => (
                  <a key={i} href="https://soundofgeez.com/videos.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                      <div><div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{v.label}</div><div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>{v.type}</div></div>
                      <Badge color={v.type === "Live Set" ? COLORS.purple : COLORS.gold}>{v.type}</Badge>
                    </div>
                  </a>
                ))}
              </div>
              <div style={{ marginTop: 10 }}><AssetLink icon="▶" label="View All Videos" sublabel="soundofgeez.com/videos" href="https://soundofgeez.com/videos.html" accent={COLORS.purple} actionLabel="Watch" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose, onUpgrade, reason }) {
  const reasons = {
    leads:     { title: "Lead limit reached",        desc: "Free plan includes up to 10 leads. Upgrade to track unlimited venues and promoters.", icon: "⬛" },
    gigs:      { title: "Gig limit reached",         desc: "Free plan includes up to 5 gigs. Upgrade to add unlimited calendar entries.",         icon: "📅" },
    templates: { title: "Pro template",              desc: "The Disco and Leverage templates are Pro features. Upgrade to unlock all 4.",          icon: "✦" },
    autoschedule: { title: "Auto follow-up scheduling", desc: "Automatic reminder scheduling is a Pro feature. Upgrade to stop things falling through the cracks.", icon: "⏰" },
    settings:  { title: "Custom follow-up intervals", desc: "Configuring your follow-up cadence is a Pro feature. Upgrade to own your workflow.",  icon: "⚙" },
    funnel:    { title: "Conversion Funnel",          desc: "The conversion funnel and Next Actions queue are Pro features. See exactly where bookings are dropping off.", icon: "▣" },
  };
  const r = reasons[reason] || reasons.leads;

  const PRO_FEATURES = [
    "Unlimited leads & gigs",
    "Auto follow-up scheduling",
    "All 4 outreach templates + custom",
    "Next Actions queue + Conversion Funnel",
    "Configurable follow-up intervals",
    "Cloud sync across devices",
    "CSV export",
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
            <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Stageflow Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Mono', monospace" }}>€9</span>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>/month</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.green }}>€79/year — save 2 months free</div>
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
          <button onClick={onUpgrade} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 24px rgba(123,63,228,0.45)", letterSpacing: "0.01em" }}>
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

function SettingsView({ settings, onSave, isPro, onUpgradeClick, customTags, defaultTags, onAddTag, onRemoveTag }) {
  const [local, setLocal] = useState({ ...settings });
  const [saved,  setSaved]  = useState(false);

  const set = key => val => setLocal(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isDirty = local.followup1Days !== settings.followup1Days || local.followup2Days !== settings.followup2Days;

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
                  {s.id === "followup1"  && `Reminder in ${local.followup2Days} days`}
                  {s.id === "followup2"  && "Last attempt"}
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

function GigCalendarView({ leads, gigs, setGigs, showToast, isPro, onUpgradeClick, customTags, TAG_COLORS }) {
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

  const addGig = () => {
    if (!addForm.venue || !addForm.date) return;
    if (!isPro && gigs.length >= FREE_LIMITS.gigs) { onUpgradeClick("gigs"); return; }
    const gig = { ...addForm, id: Date.now() };
    setGigs(prev => [...prev, gig]);
    showToast(`${gig.venue} added to calendar`, "success");
    setShowAdd(false);
    setAddForm({ venue: "", city: "", date: "", status: "confirmed", fee: "", tag: "Tech-House", notes: "" });
  };

  const deleteGig = (id) => {
    setGigs(prev => prev.filter(g => g.id !== id));
    setSelected(null);
    showToast("Gig removed", "info");
  };

  const upcoming = gigs.filter(g => new Date(g.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past     = gigs.filter(g => new Date(g.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Booked leads that aren't gigs yet
  const bookedLeads = leads.filter(l => l.stage === "booked" && !l.archived);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
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
                <div key={i} onClick={() => { if (valid && hasGig) setSelected(dayGigs[0]); }}
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
              <button onClick={() => { setGigs(prev => prev.map(g => g.id === selected.id ? { ...g, status: g.status === "confirmed" ? "pending" : "confirmed" } : g)); setSelected(prev => ({ ...prev, status: prev.status === "confirmed" ? "pending" : "confirmed" })); }}
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
    try { return new Set(JSON.parse(localStorage.getItem("stageflow_read_replies") || "[]")); } catch { return new Set(); }
  });

  const markRead = (id) => {
    setReadIds(prev => { const n = new Set(prev); n.add(id); try { localStorage.setItem("stageflow_read_replies", JSON.stringify([...n])); } catch {} return n; });
  };

  // Replied leads are the "inbox" — they represent inbound promoter interest
  const repliedLeads = leads.filter(l => !l.archived && (l.stage === "replied" || l.stage === "booked"));

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

export default function Stageflow() {
  const [activeTab, setActiveTab]       = useState("pipeline");
  const [leads, setLeads]               = useState(() => loadLeads());
  const [gigs,  setGigs]                = useState(() => loadGigs());
  const [settings, setSettings]         = useState(() => loadSettings());
  const [isPro, setIsPro]               = useState(() => loadIsPro());
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [customTags, setCustomTags]     = useState(() => loadCustomTags());

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
  const [toast, setToast]               = useState(null);

  // Search + filter state lives here so header can own the bar
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ tier: null, tag: null, stage: null });

  useEffect(() => { saveLeads(leads); }, [leads]);
  useEffect(() => { saveGigs(gigs); },  [gigs]);

  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const handleUpgrade = () => { setIsPro(true); saveIsPro(true); setUpgradeModal(null); showToast("🎉 Welcome to Pro! All features unlocked.", "success"); };
  const requestUpgrade = (reason) => setUpgradeModal(reason);

  const addLead = (lead) => {
    const activeCount = leads.filter(l => !l.archived).length;
    if (!isPro && activeCount >= FREE_LIMITS.leads) { requestUpgrade("leads"); return; }
    setLeads(prev => [lead, ...prev]);
    setActiveTab("pipeline");
    showToast(`${lead.name} added to pipeline`, "success");
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

  const moveLead = (leadId, newStage) => {
    // Gate auto-scheduling for free users — still allow stage move, just no auto date
    if (!isPro && ["contacted","followup1","followup2"].includes(newStage)) {
      // Allow the move but show upgrade nudge for scheduling
      const today = new Date().toISOString().split("T")[0];
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, lastContact: today } : l));
      if (selectedLead?.id === leadId) setSelectedLead(prev => ({ ...prev, stage: newStage, lastContact: today }));
      showToast("Stage updated · Auto-scheduling is a Pro feature", "info");
      return;
    }
    const today   = new Date().toISOString().split("T")[0];
    const autoDate = getAutoFollowUpDate(newStage);
    const update  = l => ({ ...l, stage: newStage, lastContact: ["contacted","followup1","followup2"].includes(newStage) ? today : l.lastContact, followUpDate: autoDate !== undefined ? autoDate : l.followUpDate });
    setLeads(prev => prev.map(l => l.id === leadId ? update(l) : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => update(prev));
    if (FOLLOWUP_MESSAGES[newStage]) showToast(FOLLOWUP_MESSAGES[newStage], ["booked","replied"].includes(newStage) ? "success" : "schedule");
  };

  const archiveLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const nowArchived = !lead?.archived;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, archived: nowArchived } : l));
    showToast(nowArchived ? "Lead archived" : "Lead restored to pipeline", nowArchived ? "info" : "success");
  };

  const deleteLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    showToast(`${lead?.name || "Lead"} deleted`, "info");
  };

  const resetData = () => { setLeads(INITIAL_LEADS); setGigs(INITIAL_GIGS); setSelectedLead(null); setShowResetConfirm(false); setSearch(""); setFilters({ tier: null, tag: null, stage: null }); showToast("Pipeline reset to sample data", "info"); };

  const dueCount     = leads.filter(l => !l.archived && l.followUpDate && new Date(l.followUpDate) <= new Date()).length;
  const repliedCount = leads.filter(l => !l.archived && (l.stage === "replied" || l.stage === "booked")).length;
  const unreadCount  = useMemo(() => {
    try {
      const read = new Set(JSON.parse(localStorage.getItem("stageflow_read_replies") || "[]"));
      return leads.filter(l => !l.archived && (l.stage === "replied" || l.stage === "booked") && !read.has(l.id)).length;
    } catch { return 0; }
  }, [leads]);

  const TABS = [
    { id: "dashboard", label: "Dashboard",  icon: "▣",  group: "main" },
    { id: "pipeline",  label: "Pipeline",   icon: "⬛", group: "main" },
    { id: "followups", label: "Follow-ups", icon: "⏰", badge: dueCount, group: "main" },
    { id: "replyhub",  label: "Reply Hub",  icon: "✉",  badge: unreadCount, group: "main" },
    { id: "calendar",  label: "Calendar",   icon: "📅", group: "main" },
    { id: "outreach",  label: "Outreach",   icon: "✦",  group: "ref" },
    { id: "assets",    label: "Assets",     icon: "◇",  group: "ref" },
    { id: "settings",  label: "Settings",   icon: "⚙",  group: "ref" },
  ];

  const activeLeads = leads.filter(l => !l.archived);
  const hasFilter   = search || filters.tier || filters.tag || filters.stage;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }
        button:hover { opacity: 0.85; }
        input::placeholder, textarea::placeholder { color: #444; }
      `}</style>

      {showAddModal     && <AddLeadModal onClose={() => setShowAddModal(false)} onAdd={addLead} customTags={customTags} TAG_COLORS={TAG_COLORS} onAddTag={addCustomTag} />}
      {upgradeModal     && <UpgradeModal reason={upgradeModal} onClose={() => setUpgradeModal(null)} onUpgrade={handleUpgrade} />}
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
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={28} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.text }}>Stageflow</div>
              <div style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: "0.06em" }}>BOOKING OS</div>
            </div>
          </div>
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
          <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>Resources</div>
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
              <button onClick={() => { setIsPro(false); saveIsPro(false); showToast("Switched to Free (demo)", "info"); }} style={{ marginLeft: "auto", fontSize: 9, color: COLORS.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>demo</button>
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
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
                {activeTab === "assets"    && "GEEZ · soundofgeez.com"}
                {activeTab === "replyhub"  && `${repliedCount} message${repliedCount !== 1 ? "s" : ""}${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
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
                if (filters.stage && l.stage !== filters.stage) return false;
                return true;
              }).length}
              totalCount={activeLeads.length}
            />
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 28, flex: 1, display: activeTab === "pipeline" && selectedLead ? "grid" : "block", gridTemplateColumns: activeTab === "pipeline" && selectedLead ? "1fr 280px" : undefined, gap: 20 }}>
          {activeTab === "dashboard" && <DashboardView leads={leads} onNavigate={setActiveTab} isPro={isPro} onUpgradeClick={requestUpgrade} TAG_COLORS={TAG_COLORS} />}
          {activeTab === "pipeline"  && (
            <>
              <PipelineView leads={leads} onMove={moveLead} onSelect={setSelectedLead} selectedLead={selectedLead} onArchive={archiveLead} search={search} filters={filters} TAG_COLORS={TAG_COLORS} customTags={customTags} />
              {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onMove={moveLead} onArchive={archiveLead} onDelete={deleteLead} TAG_COLORS={TAG_COLORS} />}
            </>
          )}
          {activeTab === "followups" && <FollowUpsView leads={leads} onNavigate={setActiveTab} />}
          {activeTab === "outreach"  && <OutreachView isPro={isPro} onUpgradeClick={requestUpgrade} />}
          {activeTab === "assets"    && <AssetsView />}
          {activeTab === "calendar"  && <GigCalendarView leads={leads} gigs={gigs} setGigs={setGigs} showToast={showToast} isPro={isPro} onUpgradeClick={requestUpgrade} customTags={customTags} TAG_COLORS={TAG_COLORS} />}
          {activeTab === "replyhub"  && <ReplyHubView leads={leads} onMove={moveLead} showToast={showToast} TAG_COLORS={TAG_COLORS} />}
          {activeTab === "settings"  && <SettingsView settings={settings} onSave={saveSettingsHandler} isPro={isPro} onUpgradeClick={requestUpgrade} customTags={customTags} defaultTags={DEFAULT_TAGS} onAddTag={addCustomTag} onRemoveTag={removeCustomTag} />}
        </div>
      </div>
    </div>
  );
}
