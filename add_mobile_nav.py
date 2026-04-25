#!/usr/bin/env python3
with open('src/App.jsx', 'r') as f:
    content = f.read()
original = content

OLD1 = 'function NoxReachApp({ user, session, supabase }) {'
NEW1 = '''// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 768);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function MobileBottomNav({ activeTab, setActiveTab, dueCount, unreadCount }) {
  const NAV_ITEMS = [
    { id: 'dashboard', icon: String.fromCharCode(9635), label: 'Home' },
    { id: 'pipeline',  icon: String.fromCharCode(11035), label: 'Pipeline' },
    { id: 'followups', icon: String.fromCharCode(9200), label: 'Follow-ups', badge: dueCount },
    { id: 'calendar',  icon: '📅', label: 'Calendar' },
    { id: 'replyhub',  icon: String.fromCharCode(9993), label: 'Reply', badge: unreadCount },
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

function NoxReachApp({ user, session, supabase }) {'''
content = content.replace(OLD1, NEW1)

OLD2 = '  const userEmail = user?.email || "";\n  const userName  = user?.user_metadata?.full_name || userEmail.split("@")[0] || "DJ";'
NEW2 = '  const userEmail = user?.email || "";\n  const userName  = user?.user_metadata?.full_name || userEmail.split("@")[0] || "DJ";\n  const isMobile  = useIsMobile();'
content = content.replace(OLD2, NEW2)

OLD3 = 'display: "flex", flexDirection: "column", zIndex: 100 }}>'
NEW3 = 'display: isMobile ? "none" : "flex", flexDirection: "column", zIndex: 100 }}>'
content = content.replace(OLD3, NEW3, 1)

OLD4 = '<div style={{ marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }}>'
NEW4 = '<div style={{ marginLeft: isMobile ? 0 : 220, display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: isMobile ? 64 : 0 }}>'
content = content.replace(OLD4, NEW4)

OLD5 = '        {/* Content */}\n        <div style={{ padding: 28, flex: 1,'
NEW5 = '        {isMobile && <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} dueCount={dueCount} unreadCount={unreadCount} />}\n\n        {/* Content */}\n        <div style={{ padding: isMobile ? 16 : 28, flex: 1,'
content = content.replace(OLD5, NEW5)

OLD6 = '<div style={{ display: "flex", gap: 14 }}>\n        <StatCard label="Total Leads"'
NEW6 = '<div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>\n        <StatCard label="Total Leads"'
content = content.replace(OLD6, NEW6)

OLD7 = 'borderRadius: 12, padding: "20px 24px", flex: 1, position: "relative", overflow: "hidden" }}>'
NEW7 = 'borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: "calc(50% - 7px)", position: "relative", overflow: "hidden" }}>'
content = content.replace(OLD7, NEW7)

OLD8 = "        <div style={{ display: 'flex', gap: 10 }}>"
NEW8 = "        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>"
content = content.replace(OLD8, NEW8, 1)

with open('src/App.jsx', 'w') as f:
    f.write(content)

changed = content != original
print("Changed:", changed)
checks = [
    ('useIsMobile' in content, 'FIX 1: useIsMobile hook'),
    ('const isMobile  = useIsMobile' in content, 'FIX 2: isMobile state'),
    ('isMobile ? 0 : 220' in content, 'FIX 4: Main margin on mobile'),
    ('MobileBottomNav' in content, 'FIX 5: Bottom nav injected'),
    ('flexWrap: "wrap"' in content, 'FIX 6: Stat cards wrap'),
    ('minWidth: "calc(50% - 7px)"' in content, 'FIX 7: StatCard min width'),
]
for passed, label in checks:
    print("OK" if passed else "FAIL", label)
