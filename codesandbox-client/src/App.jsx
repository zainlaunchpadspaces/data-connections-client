import { useState, useEffect, useRef } from "react";

// ── THEMES ─────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f8f9fc", surface: "#ffffff", surfaceAlt: "#f1f4f9", border: "#e2e8f0",
  accent: "#0066ff", accentLight: "rgba(0,102,255,0.08)", accentDark: "#0052cc",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  text: "#0f172a", textMuted: "#64748b", textLight: "#94a3b8",
  navBg: "#ffffff", cardShadow: "0 1px 4px rgba(0,0,0,0.06)",
  gradientBg: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f0fff4 100%)",
  bubbleClient: "#0066ff", bubbleAdmin: "#ffffff", bubbleClientText: "#ffffff", bubbleAdminText: "#0f172a",
};
const DARK = {
  bg: "#0a0e1a", surface: "#111827", surfaceAlt: "#1a2235", border: "#1e2d45",
  accent: "#00c8ff", accentLight: "rgba(0,200,255,0.1)", accentDark: "#0099cc",
  success: "#00e676", warning: "#ffab00", danger: "#ff3d71",
  text: "#e8edf5", textMuted: "#6b7a99", textLight: "#3d4f6b",
  navBg: "#111827", cardShadow: "0 1px 8px rgba(0,0,0,0.4)",
  gradientBg: "linear-gradient(135deg, #0a0e1a 0%, #0d1425 50%, #0a1020 100%)",
  bubbleClient: "#00c8ff", bubbleAdmin: "#1a2235", bubbleClientText: "#000000", bubbleAdminText: "#e8edf5",
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes popIn { from{opacity:0;transform:scale(0.88) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── SHARED TICKET STORAGE ──────────────────────────────────────────────────
const TICKETS_KEY = "dc_tickets";
const TICKETS_EVENT = "dc_tickets_update";
function loadTickets() {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]"); } catch { return []; }
}
function saveTickets(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new Event(TICKETS_EVENT));
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const ACCOUNTS = [
  { id: 1, email: "john@techcorp.com", password: "password123", name: "TechCorp Inc.", contact: "John Smith" },
  { id: 2, email: "maria@sunsetcafe.com", password: "password123", name: "Sunset Cafe", contact: "Maria Garcia" },
  { id: 5, email: "tom@harborhotel.com", password: "password123", name: "Harbor Hotel", contact: "Tom Nguyen" },
];

const CLIENT_DATA = {
  1: {
    plan: { name: "1 Gbps", price: 799, down: 1000, up: 1000, type: "Symmetric Fibre", renewal: "2026-03-01" },
    connections: [
      { id: 1, location: "Downtown DC", ip: "192.168.1.10", device: "Cisco ASR 1001", status: "online", latency: 12, uptime: "99.8%", bandwidth: "856 / 1000 Mbps" },
      { id: 2, location: "Branch Office", ip: "192.168.1.11", device: "Cisco Catalyst 9200", status: "online", latency: 18, uptime: "98.2%", bandwidth: "420 / 500 Mbps" },
    ],
    invoices: [
      { id: "INV-001", amount: 799, due: "2026-03-01", status: "paid", method: "stripe", period: "Feb 2026" },
      { id: "INV-009", amount: 799, due: "2026-02-01", status: "paid", method: "stripe", period: "Jan 2026" },
    ],
  },
  2: {
    plan: { name: "100 Mbps", price: 399, down: 100, up: 100, type: "Symmetric Fibre", renewal: "2026-03-01" },
    connections: [
      { id: 3, location: "Main Street", ip: "10.0.0.5", device: "Ubiquiti EdgeRouter", status: "offline", latency: null, uptime: "87.1%", bandwidth: "—" },
    ],
    invoices: [
      { id: "INV-002", amount: 399, due: "2026-03-01", status: "pending", method: "square", period: "Feb 2026" },
    ],
  },
  5: {
    plan: { name: "10 Gbps", price: 1599, down: 10000, up: 10000, type: "Wave", renewal: "2026-03-01" },
    connections: [
      { id: 6, location: "Waterfront", ip: "192.168.10.1", device: "Cisco ASR 1002", status: "online", latency: 7, uptime: "99.9%", bandwidth: "9.4 / 10 Gbps" },
    ],
    invoices: [
      { id: "INV-005", amount: 1599, due: "2026-03-01", status: "pending", method: "stripe", period: "Feb 2026" },
    ],
  },
};

const PLANS = [
  { id: 1, name: "100 Mbps", price: 399, down: 100, up: 100, type: "Symmetric Fibre", desc: "Great for small businesses & branch offices" },
  { id: 2, name: "500 Mbps", price: 599, down: 500, up: 500, type: "Symmetric Fibre", desc: "Ideal for growing teams with heavy usage" },
  { id: 3, name: "1 Gbps", price: 799, down: 1000, up: 1000, type: "Symmetric Fibre", desc: "High-performance for demanding workloads" },
  { id: 4, name: "10 Gbps", price: 1599, down: 10000, up: 10000, type: "Wave", desc: "Enterprise-grade dedicated wave connectivity" },
];

// ── THEME TOGGLE ───────────────────────────────────────────────────────────
const ThemeToggle = ({ dark, onToggle, t }) => (
  <button onClick={onToggle}
    style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${t.border}`, borderRadius: 20, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: t.textMuted }}>
    <span style={{ fontSize: 14 }}>{dark ? "☀️" : "🌙"}</span>
    <span>{dark ? "Light" : "Dark"}</span>
    <div style={{ width: 34, height: 18, borderRadius: 9, background: dark ? t.accent : "#cbd5e1", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: dark ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.25s" }} />
    </div>
  </button>
);

// ── UI PRIMITIVES ──────────────────────────────────────────────────────────
const StatusDot = ({ status, t }) => {
  const colors = { online: t.success, offline: t.danger, suspended: t.textLight };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[status] || t.textLight, animation: status === "online" ? "pulse 2s infinite" : "none", marginRight: 6, flexShrink: 0 }} />;
};

const Badge = ({ label, t }) => {
  const colors = {
    online: t.success, offline: t.danger, pending: t.warning, paid: t.success, overdue: t.danger,
    critical: t.danger, high: t.warning, medium: t.accent, low: t.success,
    open: t.warning, "in-progress": t.accent, resolved: t.success, closed: t.textMuted,
  };
  const c = colors[label?.toLowerCase()] || t.textMuted;
  return <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: `${c}20`, color: c, border: `1px solid ${c}35` }}>{label}</span>;
};

const Card = ({ children, style: s = {}, onClick, t }) => (
  <div onClick={onClick} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, boxShadow: t.cardShadow, cursor: onClick ? "pointer" : "default", transition: "all 0.2s", ...s }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = t.accent; } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; } }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", style: s = {}, disabled, t }) => {
  const bg = variant === "primary" ? t.accent : variant === "danger" ? t.danger : variant === "success" ? t.success : variant === "ghost" ? "transparent" : t.surfaceAlt;
  const color = variant === "primary" || variant === "danger" || variant === "success" ? "#fff" : t.text;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: bg, color, border: `1px solid ${variant === "ghost" ? t.border : bg}`, borderRadius: 10, padding: size === "sm" ? "6px 14px" : size === "lg" ? "13px 28px" : "10px 20px", fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s", ...s }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, t }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: t.text }}>{label}</div>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor = t.accent}
      onBlur={e => e.target.style.borderColor = t.border} />
  </div>
);

// ── TICKET CHAT THREAD ─────────────────────────────────────────────────────
function TicketThread({ ticket, account, onBack, onUpdate, t }) {
  const [messages, setMessages] = useState(ticket.messages || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Sync if admin replied
  useEffect(() => {
    const sync = () => {
      const tickets = loadTickets();
      const updated = tickets.find(tk => tk.id === ticket.id);
      if (updated) setMessages(updated.messages || []);
    };
    window.addEventListener(TICKETS_EVENT, sync);
    window.addEventListener("storage", sync);
    const poll = setInterval(sync, 2000);
    return () => { window.removeEventListener(TICKETS_EVENT, sync); window.removeEventListener("storage", sync); clearInterval(poll); };
  }, [ticket.id]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "client",
      senderName: account.contact,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
    };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    setInput("");

    // Persist
    const all = loadTickets();
    const updatedTickets = all.map(tk => tk.id === ticket.id ? { ...tk, messages: updatedMsgs, lastActivity: Date.now(), status: tk.status === "closed" ? "open" : tk.status } : tk);
    saveTickets(updatedTickets);
    onUpdate(updatedTickets.find(tk => tk.id === ticket.id));

    // Auto-reply simulation
    setIsTyping(true);
    setTimeout(() => {
      const replies = [
        "Thanks for the update! We're looking into this right now.",
        "Got it — our team has been notified and will follow up shortly.",
        "Understood. Can you confirm if the issue is still ongoing?",
        "We're on it! I'll update you as soon as we have more info.",
        "Thanks for reaching out. We're investigating this and will get back to you soon.",
      ];
      const autoReply = {
        id: Date.now() + 1,
        sender: "admin",
        senderName: "Support Team",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1,
        readByClient: false,
      };
      const withReply = [...updatedMsgs, autoReply];
      setMessages(withReply);
      setIsTyping(false);
      const finalTickets = loadTickets().map(tk => tk.id === ticket.id ? { ...tk, messages: withReply, lastActivity: Date.now(), status: "in-progress" } : tk);
      saveTickets(finalTickets);
      onUpdate(finalTickets.find(tk => tk.id === ticket.id));
    }, 1500 + Math.random() * 1000);
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const priorityColors = { critical: t.danger, high: t.warning, medium: t.accent, low: t.success };
  const statusColors = { open: t.warning, "in-progress": t.accent, resolved: t.success, closed: t.textMuted };
  const pc = priorityColors[ticket.priority] || t.textMuted;
  const sc = statusColors[ticket.status] || t.textMuted;

  return (
    <div style={{ animation: "slideIn 0.25s ease", height: "calc(100vh - 130px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
        <button onClick={onBack}
          style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", color: t.text, fontFamily: "inherit", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: t.accent, fontWeight: 600 }}>{ticket.id}</span>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", background: `${pc}20`, color: pc, border: `1px solid ${pc}35` }}>{ticket.priority}</span>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", background: `${sc}20`, color: sc, border: `1px solid ${sc}35` }}>{ticket.status}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{ticket.subject}</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>Opened {ticket.created} · Category: {ticket.category}</div>
        </div>
      </div>

      {/* Chat area */}
      <Card t={t} style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
          {/* First message = ticket description */}
          <div style={{ textAlign: "center", margin: "0 0 16px" }}>
            <span style={{ background: t.surfaceAlt, borderRadius: 20, padding: "3px 14px", fontSize: 11, color: t.textMuted, border: `1px solid ${t.border}` }}>Ticket opened · {ticket.created}</span>
          </div>

          {messages.map(msg => {
            const isClient = msg.sender === "client";
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: isClient ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 14, animation: "popIn 0.2s ease" }}>
                {!isClient && (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${t.accent}, ${t.textMuted})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {(msg.senderName || "S")[0]}
                  </div>
                )}
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isClient ? "flex-end" : "flex-start" }}>
                  {!isClient && <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 3, paddingLeft: 4 }}>{msg.senderName || "Support Team"}</div>}
                  <div style={{ background: isClient ? t.bubbleClient : t.bubbleAdmin, color: isClient ? t.bubbleClientText : t.bubbleAdminText, borderRadius: isClient ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 15px", fontSize: 14, lineHeight: 1.55, boxShadow: isClient ? `0 2px 8px ${t.accent}30` : t.cardShadow, border: !isClient ? `1px solid ${t.border}` : "none" }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>{msg.time}</div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${t.accent}, ${t.textMuted})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>S</div>
              <div style={{ background: t.bubbleAdmin, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", border: `1px solid ${t.border}`, display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: t.textMuted, display: "inline-block", animation: "pulse 1.2s infinite", animationDelay: `${i * 0.2}s` }} />)}
              </div>
            </div>
          )}

          {ticket.status === "resolved" || ticket.status === "closed" ? (
            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <span style={{ background: `${t.success}18`, borderRadius: 20, padding: "6px 16px", fontSize: 12, color: t.success, border: `1px solid ${t.success}35`, fontWeight: 600 }}>
                ✓ This ticket has been {ticket.status}
              </span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {ticket.status !== "closed" ? (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Reply to this ticket... (Enter to send)"
              rows={1}
              style={{ flex: 1, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = t.accent}
              onBlur={e => e.target.style.borderColor = t.border} />
            <button onClick={sendMessage} disabled={!input.trim()}
              style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() ? t.accent : t.border, border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : t.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${t.border}`, textAlign: "center", fontSize: 13, color: t.textMuted }}>
            This ticket is closed. <button onClick={() => {
              const all = loadTickets().map(tk => tk.id === ticket.id ? { ...tk, status: "open" } : tk);
              saveTickets(all); onUpdate(all.find(tk => tk.id === ticket.id));
            }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Reopen ticket</button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── TICKETS VIEW ───────────────────────────────────────────────────────────
function TicketsView({ account, t }) {
  const [tickets, setTickets] = useState(() => loadTickets().filter(tk => tk.clientId === account.id));
  const [openThread, setOpenThread] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "Technical", priority: "medium", description: "" });

  // Sync
  useEffect(() => {
    const sync = () => setTickets(loadTickets().filter(tk => tk.clientId === account.id));
    window.addEventListener(TICKETS_EVENT, sync);
    window.addEventListener("storage", sync);
    const poll = setInterval(sync, 2000);
    return () => { window.removeEventListener(TICKETS_EVENT, sync); window.removeEventListener("storage", sync); clearInterval(poll); };
  }, [account.id]);

  const handleCreate = () => {
    if (!form.subject.trim()) return;
    const newTicket = {
      id: `TK-${String(loadTickets().length + 1).padStart(3, "0")}`,
      clientId: account.id,
      clientName: account.name,
      contactName: account.contact,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      status: "open",
      created: new Date().toLocaleDateString(),
      lastActivity: Date.now(),
      messages: [
        {
          id: Date.now(),
          sender: "client",
          senderName: account.contact,
          text: form.description || form.subject,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
        }
      ],
    };
    const all = [...loadTickets(), newTicket];
    saveTickets(all);
    setTickets(all.filter(tk => tk.clientId === account.id));
    setForm({ subject: "", category: "Technical", priority: "medium", description: "" });
    setShowNew(false);
    setOpenThread(newTicket);
  };

  const updateTicket = (updated) => {
    setTickets(prev => prev.map(tk => tk.id === updated.id ? updated : tk));
    if (openThread?.id === updated.id) setOpenThread(updated);
  };

  // If a thread is open, show it
  if (openThread) {
    const live = tickets.find(tk => tk.id === openThread.id) || openThread;
    return <TicketThread ticket={live} account={account} onBack={() => setOpenThread(null)} onUpdate={updateTicket} t={t} />;
  }

  const unreadCount = tickets.reduce((sum, tk) => sum + (tk.messages || []).filter(m => m.sender === "admin" && !m.readByClient).length, 0);
  const statusOrder = { open: 0, "in-progress": 1, resolved: 2, closed: 3 };
  const sorted = [...tickets].sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0) || b.lastActivity - a.lastActivity);

  const priorityColors = { critical: t.danger, high: t.warning, medium: t.accent, low: t.success };
  const statusColors = { open: t.warning, "in-progress": t.accent, resolved: t.success, closed: t.textMuted };

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: t.text }}>Support Tickets</div>
          <div style={{ color: t.textMuted, fontSize: 14 }}>
            {tickets.length === 0 ? "No tickets yet" : `${tickets.length} ticket${tickets.length > 1 ? "s" : ""}`}
            {unreadCount > 0 && <span style={{ marginLeft: 10, background: t.danger, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "2px 8px" }}>{unreadCount} new replies</span>}
          </div>
        </div>
        <Btn onClick={() => setShowNew(true)} t={t}>+ New Ticket</Btn>
      </div>

      {/* New ticket form */}
      {showNew && (
        <Card t={t} style={{ marginBottom: 20, border: `2px solid ${t.accent}` }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: t.text }}>Open a New Ticket</div>
          <Input label="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Briefly describe your issue" t={t} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: t.text }}>Category</div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                {["Technical", "Billing", "Account", "Connectivity", "Speed", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: t.text }}>Priority</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ val: "low", label: "Low" }, { val: "medium", label: "Medium" }, { val: "high", label: "High" }, { val: "critical", label: "Critical" }].map(p => (
                  <button key={p.val} onClick={() => setForm(f => ({ ...f, priority: p.val }))}
                    style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `2px solid ${form.priority === p.val ? priorityColors[p.val] : t.border}`, background: form.priority === p.val ? `${priorityColors[p.val]}18` : "transparent", color: form.priority === p.val ? priorityColors[p.val] : t.textMuted, fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: t.text }}>Description</div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe your issue in detail..."
              rows={4}
              style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.55, transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = t.accent}
              onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowNew(false)} t={t}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.subject.trim()} t={t}>Open Ticket</Btn>
          </div>
        </Card>
      )}

      {/* Ticket list */}
      {tickets.length === 0 && !showNew && (
        <Card t={t} style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🎫</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: t.text }}>No tickets yet</div>
          <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 20 }}>Need help? Open a ticket and our team will respond in the chat.</div>
          <Btn onClick={() => setShowNew(true)} t={t}>Open Your First Ticket</Btn>
        </Card>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {sorted.map(tk => {
          const lastMsg = (tk.messages || []).slice(-1)[0];
          const unread = (tk.messages || []).filter(m => m.sender === "admin" && !m.readByClient).length;
          const pc = priorityColors[tk.priority] || t.textMuted;
          const sc = statusColors[tk.status] || t.textMuted;
          return (
            <div key={tk.id} onClick={() => {
              // Mark admin messages as read
              const all = loadTickets().map(t2 => t2.id === tk.id ? { ...t2, messages: (t2.messages || []).map(m => ({ ...m, readByClient: true })) } : t2);
              saveTickets(all);
              setOpenThread(tk);
            }}
              style={{ background: t.surface, border: `1px solid ${unread > 0 ? t.accent : t.border}`, borderRadius: 16, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: 16, alignItems: "center", boxShadow: unread > 0 ? `0 0 0 3px ${t.accent}20` : t.cardShadow }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = unread > 0 ? t.accent : t.border; }}>

              {/* Icon */}
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${pc}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {{ critical: "🔴", high: "🟠", medium: "🟡", low: "🟢" }[tk.priority] || "💬"}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: t.accent }}>{tk.id}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: `${pc}20`, color: pc }}>{tk.priority}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: `${sc}20`, color: sc }}>{tk.status}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: t.surfaceAlt, color: t.textMuted, border: `1px solid ${t.border}` }}>{tk.category}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.subject}</div>
                {lastMsg && (
                  <div style={{ fontSize: 12, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <strong style={{ color: lastMsg.sender === "admin" ? t.accent : t.text }}>{lastMsg.sender === "admin" ? "Support" : "You"}:</strong> {lastMsg.text}
                  </div>
                )}
              </div>

              {/* Right side */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                {unread > 0 && (
                  <span style={{ background: t.danger, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 8px", minWidth: 22, textAlign: "center" }}>{unread}</span>
                )}
                <div style={{ fontSize: 11, color: t.textMuted }}>{tk.created}</div>
                <div style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>Open chat →</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PAYMENT COMPONENTS ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "apple_pay",    label: "Apple Pay",     icon: "🍎",  color: "#000000", bg: "#000000", textColor: "#fff",     note: "Touch ID or Face ID" },
  { id: "google_pay",   label: "Google Pay",    icon: "G",   color: "#4285f4", bg: "#fff",    textColor: "#3c4043",  note: "Pay with Google",    border: "#dadce0" },
  { id: "card",         label: "Credit / Debit Card", icon: "💳", color: "#6366f1", bg: null, textColor: null, note: "Visa, Mastercard, Amex" },
  { id: "stripe",       label: "Stripe",        icon: "⚡",  color: "#635bff", bg: "#635bff15", textColor: "#8b83ff", note: "Powered by Stripe" },
  { id: "square",       label: "Square",        icon: "◼",   color: "#00b9a9", bg: "#00b9a915", textColor: "#00b9a9", note: "Powered by Square" },
  { id: "paypal",       label: "PayPal",        icon: "🅿",  color: "#003087", bg: "#ffc43915", textColor: "#003087", note: "Pay with PayPal balance or card" },
  { id: "bank",         label: "ACH Bank Transfer", icon: "🏦", color: "#10b981", bg: null, textColor: null, note: "Routing & account number" },
  { id: "crypto",       label: "Crypto",        icon: "₿",   color: "#f59e0b", bg: "#f59e0b15", textColor: "#f59e0b", note: "BTC, ETH, USDC accepted" },
];

// Shared inner content — method selector + form fields
function PaymentMethodForm({ amount, label, onConfirm, loading, t, compact = false }) {
  const [method, setMethod] = useState("apple_pay");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [routingNum, setRoutingNum] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const formatCard = v => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = v => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d; };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setDone(true); setTimeout(() => onConfirm(), 800); }, 1200);
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
      <div style={{ fontWeight: 800, fontSize: 18, color: t.success, marginBottom: 6 }}>Payment Successful!</div>
      <div style={{ fontSize: 13, color: t.textMuted }}>Your payment of <strong>${amount}</strong> has been processed.</div>
    </div>
  );

  const sel = PAYMENT_METHODS.find(m => m.id === method);
  const isInstant = ["apple_pay", "google_pay", "paypal", "stripe", "square", "crypto"].includes(method);

  return (
    <div>
      {/* Amount summary */}
      <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 2 }}>Paying for</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{label}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 24, color: t.accent, fontFamily: "'JetBrains Mono'" }}>${amount}</div>
      </div>

      {/* Method grid */}
      <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Payment Method</div>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(4, 1fr)" : "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {PAYMENT_METHODS.map(pm => {
          const isSelected = method === pm.id;
          return (
            <button key={pm.id} onClick={() => setMethod(pm.id)}
              style={{ padding: "10px 6px", borderRadius: 10, border: `2px solid ${isSelected ? pm.color : t.border}`, background: isSelected ? `${pm.color}18` : t.surface, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s", fontFamily: "inherit" }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = pm.color + "80"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = t.border; }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{pm.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? pm.color : t.textMuted, textAlign: "center", lineHeight: 1.2 }}>{pm.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Selected method details */}
      <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>{sel.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{sel.label}</div>
          <div style={{ fontSize: 12, color: t.textMuted }}>{sel.note}</div>
        </div>
        {isInstant && !["card","bank"].includes(method) && <div style={{ marginLeft: "auto", background: `${t.success}20`, color: t.success, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>One-tap</div>}
      </div>

      {/* Form fields by method */}
      {method === "card" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: t.text }}>Cardholder Name</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
              style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" }}
              onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: t.text }}>Card Number</div>
            <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456"
              style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", outline: "none" }}
              onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: t.text }}>Expiry</div>
              <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY"
                style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "'JetBrains Mono'", outline: "none" }}
                onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: t.text }}>CVC</div>
              <input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123"
                style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "'JetBrains Mono'", outline: "none" }}
                onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
            </div>
          </div>
        </div>
      )}
      {method === "bank" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: t.text }}>Routing Number</div>
            <input value={routingNum} onChange={e => setRoutingNum(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="021000021"
              style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "'JetBrains Mono'", outline: "none" }}
              onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: t.text }}>Account Number</div>
            <input value={accountNum} onChange={e => setAccountNum(e.target.value.replace(/\D/g, "").slice(0, 17))} placeholder="000123456789"
              style={{ width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "'JetBrains Mono'", outline: "none" }}
              onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
        </div>
      )}
      {method === "crypto" && (
        <div style={{ background: `${t.warning}14`, border: `1px solid ${t.warning}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.warning, marginBottom: 6 }}>Crypto Payment</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>You'll receive a wallet address after clicking Pay. Accepted: BTC, ETH, USDC</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: t.textMuted }}>Exchange rate locked for 15 minutes</div>
        </div>
      )}

      {/* Pay button */}
      <button onClick={handlePay} disabled={processing || loading}
        style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 12, border: "none", background: processing ? t.border : (method === "apple_pay" ? "#000" : method === "google_pay" ? "#fff" : t.accent), color: method === "google_pay" ? "#3c4043" : "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: processing ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: !processing && method !== "google_pay" ? `0 4px 16px ${t.accent}40` : method === "google_pay" ? "0 2px 8px rgba(0,0,0,0.2)" : "none", border: method === "google_pay" ? "1px solid #dadce0" : "none" }}>
        {processing ? (
          <>
            <span style={{ width: 16, height: 16, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            Processing...
          </>
        ) : (
          <>
            <span style={{ fontSize: 18 }}>{sel.icon}</span>
            {method === "apple_pay" ? `Pay with Apple Pay` : method === "google_pay" ? `Pay with Google Pay` : method === "paypal" ? "Pay with PayPal" : `Pay $${amount}`}
          </>
        )}
      </button>

      {/* Security badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
        {["🔒 SSL Encrypted", "🛡 PCI Compliant", "✓ Secure Checkout"].map(b => (
          <span key={b} style={{ fontSize: 11, color: t.textMuted, display: "flex", alignItems: "center", gap: 4 }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// Modal wrapper for invoice payments
function PaymentModal({ amount, label, onConfirm, onClose, t }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.surface, borderRadius: 22, padding: "28px 28px 24px", width: 520, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", animation: "fadeUp 0.25s ease", border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Complete Payment</div>
          <button onClick={onClose} style={{ background: t.surfaceAlt, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: t.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <PaymentMethodForm amount={amount} label={label} onConfirm={onConfirm} t={t} />
      </div>
    </div>
  );
}

// Inline version for signup flow (no modal wrapper)
function PaymentInline({ amount, label, onConfirm, loading, t }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 18 }}>Payment Details</div>
      <PaymentMethodForm amount={amount} label={label} onConfirm={onConfirm} loading={loading} t={t} compact />
    </div>
  );
}

// ── AUTH SCREENS ───────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGoSignup, dark, onToggleDark }) {
  const t = dark ? DARK : LIGHT;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      const acct = ACCOUNTS.find(a => a.email === email && a.password === password);
      if (acct) onLogin(acct);
      else { setError("Invalid email or password."); setLoading(false); }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: t.gradientBg }}>
      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px", boxShadow: `0 8px 24px ${t.accent}50` }}>⬡</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: t.text }}>Welcome back</div>
          <div style={{ color: t.textMuted, fontSize: 14 }}>Sign in to your Data Connections account</div>
        </div>
        <Card t={t} style={{ padding: 32 }}>
          <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" t={t} />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" t={t} />
          {error && <div style={{ color: t.danger, fontSize: 13, marginBottom: 12, background: `${t.danger}12`, borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
          <Btn onClick={handle} disabled={loading} style={{ width: "100%" }} size="lg" t={t}>{loading ? "Signing in..." : "Sign In"}</Btn>
          <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: t.textMuted }}>
            Don't have an account?{" "}
            <button onClick={onGoSignup} style={{ background: "none", border: "none", color: t.accent, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign up →</button>
          </div>
        </Card>
        <div style={{ marginTop: 20, background: `${t.accent}12`, border: `1px solid ${t.accent}30`, borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.accent, marginBottom: 6 }}>Demo accounts</div>
          {ACCOUNTS.map(a => <div key={a.id} style={{ fontSize: 11, color: t.textMuted }}>{a.email} / password123</div>)}
        </div>
      </div>
    </div>
  );
}

function SignupScreen({ onSignup, onGoLogin, dark, onToggleDark }) {
  const t = dark ? DARK : LIGHT;
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payMethod, setPayMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", email: "", password: "", phone: "" });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: t.gradientBg }}>
      <div style={{ width: "100%", maxWidth: step === 2 ? 700 : 460, animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px", boxShadow: `0 8px 24px ${t.accent}50` }}>⬡</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: t.text }}>Create your account</div>
          <div style={{ color: t.textMuted, fontSize: 13 }}>Step {step} of {selectedPlan ? 3 : 2}</div>
        </div>
        {step === 1 && (
          <Card t={t} style={{ padding: 32 }}>
            <Input label="Company Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Acme Corp" t={t} />
            <Input label="Your Name" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="John Smith" t={t} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" t={t} />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" t={t} />
            <Btn onClick={() => { if (form.name && form.email) setStep(2); }} style={{ width: "100%" }} size="lg" t={t}>Continue →</Btn>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: t.textMuted }}>
              Already have an account? <button onClick={onGoLogin} style={{ background: "none", border: "none", color: t.accent, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign in</button>
            </div>
          </Card>
        )}
        {step === 2 && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>Choose an Internet Speed Package</div>
              <div style={{ fontSize: 13, color: t.textMuted }}>All packages include Symmetric Fibre or Wave connectivity. You can skip this and choose later.</div>
            </div>
            {/* CyberPC-style package cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 16 }}>
              {PLANS.map(plan => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div key={plan.id} onClick={() => setSelectedPlan(isSelected ? null : plan)}
                    style={{ background: isSelected ? t.accentLight : t.surface, border: `2px solid ${isSelected ? t.accent : t.border}`, borderRadius: 16, padding: "22px 20px", cursor: "pointer", transition: "all 0.2s", textAlign: "center", position: "relative" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = t.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = isSelected ? t.accent : t.border; }}>
                    {isSelected && <div style={{ position: "absolute", top: 12, right: 12, background: t.accent, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>SELECTED ✓</div>}
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.accent, marginBottom: 2 }}>{plan.name}</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 14 }}>{plan.type}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: t.text }}>${plan.price}<span style={{ fontSize: 13, color: t.textMuted, fontWeight: 500 }}>/mo</span></div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 10 }}>↕ {plan.down >= 10000 ? "10 Gbps" : plan.down >= 1000 ? "1 Gbps" : `${plan.down} Mbps`} Symmetric</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex: "0 0 auto", padding: "13px 20px" }} t={t}>← Back</Btn>
              <Btn variant="ghost" onClick={() => onSignup({ id: Date.now(), email: form.email, name: form.name, contact: form.contact, plan: null })} style={{ flex: 1 }} t={t}>Skip for now</Btn>
              <Btn onClick={() => { if (selectedPlan) setStep(3); }} disabled={!selectedPlan} style={{ flex: 2 }} size="lg" t={t}>Continue with {selectedPlan?.name || "..."} →</Btn>
            </div>
          </div>
        )}
        {step === 3 && selectedPlan && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {/* Order summary */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "18px 22px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>Order Summary</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: `1px solid ${t.border}`, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: t.accent }}>{selectedPlan.name}</div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{selectedPlan.type} · Symmetric</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 22, color: t.text }}>${selectedPlan.price}<span style={{ fontSize: 12, color: t.textMuted, fontWeight: 400 }}>/mo</span></div>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>Billed monthly · Cancel anytime · Setup fee waived</div>
            </div>
            <PaymentInline
              amount={selectedPlan.price}
              label={`${selectedPlan.name} Monthly Subscription`}
              onConfirm={() => { setLoading(true); setTimeout(() => onSignup({ id: Date.now(), email: form.email, name: form.name, contact: form.contact, plan: selectedPlan }), 1000); }}
              loading={loading}
              t={t}
            />
            <Btn variant="ghost" style={{ width: "100%", marginTop: 10 }} onClick={() => onSignup({ id: Date.now(), email: form.email, name: form.name, contact: form.contact, plan: selectedPlan })} t={t}>
              Skip payment — activate plan later
            </Btn>
            <Btn variant="ghost" style={{ width: "100%", marginTop: 6, fontSize: 12 }} onClick={() => setStep(2)} t={t}>← Change package</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CLIENT DASHBOARD ───────────────────────────────────────────────────────
function ClientDashboard({ account, onLogout, dark, onToggleDark }) {
  const t = dark ? DARK : LIGHT;
  const [page, setPage] = useState("overview");
  const [payModal, setPayModal] = useState(null);
  const [ticketUnread, setTicketUnread] = useState(0);
  const [profile, setProfile] = useState({
    id: account.id, name: account.contact || account.name, email: account.email,
    role: "client", title: "", phone: "", joined: "2024-01-01", avatar: null,
  });

  const [accountPlan, setAccountPlan] = useState(account.plan || null);
  const data = CLIENT_DATA[account.id] || {
    plan: accountPlan ? { name: accountPlan.name, price: accountPlan.price, down: accountPlan.down, up: accountPlan.up, renewal: "2026-04-01" } : null,
    connections: [], invoices: [],
  };
  const activePlan = data.plan || (accountPlan ? { name: accountPlan.name, price: accountPlan.price, down: accountPlan.down, up: accountPlan.up, renewal: "2026-04-01" } : null);
  const [invoices, setInvoices] = useState(data.invoices);
  const onlineConns = data.connections.filter(c => c.status === "online").length;
  const offlineConns = data.connections.filter(c => c.status === "offline").length;
  const pendingInvs = invoices.filter(i => i.status === "pending" || i.status === "overdue");

  useEffect(() => {
    const updateUnread = () => {
      const myTickets = loadTickets().filter(tk => tk.clientId === account.id);
      const unread = myTickets.reduce((s, tk) => s + (tk.messages || []).filter(m => m.sender === "admin" && !m.readByClient).length, 0);
      setTicketUnread(unread);
    };
    updateUnread();
    window.addEventListener(TICKETS_EVENT, updateUnread);
    window.addEventListener("storage", updateUnread);
    const poll = setInterval(updateUnread, 2000);
    return () => { window.removeEventListener(TICKETS_EVENT, updateUnread); window.removeEventListener("storage", updateUnread); clearInterval(poll); };
  }, [account.id]);

  const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: "⬡" },
    { id: "connections", label: "Connections", icon: "◈" },
    { id: "billing", label: "Billing", icon: "◆" },
    { id: "tickets", label: "Support", icon: "🎫" },
    { id: "plan", label: "My Plan", icon: "◧" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, transition: "background 0.3s", color: t.text }}>
      {/* Nav */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "0 28px", display: "flex", alignItems: "center", height: 62, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>⬡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: t.text }}>Data Connections</div>
            <div style={{ fontSize: 10, color: t.textMuted }}>Client Portal</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(n => {
            const badge = n.id === "billing" ? pendingInvs.length : n.id === "tickets" ? ticketUnread : 0;
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: active ? t.accentLight : "transparent", color: active ? t.accent : t.textMuted, fontFamily: "inherit", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
                {n.label}
                {badge > 0 && <span style={{ background: t.danger, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar / settings shortcut */}
          <button onClick={() => setPage("settings")}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 12px 5px 5px", borderRadius: 24, border: `1px solid ${page === "settings" ? t.accent : t.border}`, background: page === "settings" ? t.accentLight : t.surfaceAlt, cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", background: profile.avatar ? "transparent" : `linear-gradient(135deg, ${t.accent}, #7c4dff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (profile.name[0] || "U").toUpperCase()}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>{profile.name}</div>
              <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.2 }}>{account.email}</div>
            </div>
          </button>
          <button onClick={onLogout} style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: t.textMuted }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {/* OVERVIEW */}
        {page === "overview" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: t.text }}>Hello, {account.contact || account.name} 👋</div>
              <div style={{ color: t.textMuted, fontSize: 14 }}>Here's a summary of your account</div>
            </div>
            {offlineConns > 0 && (
              <div style={{ background: `${t.danger}14`, border: `1px solid ${t.danger}35`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: t.danger, fontSize: 14 }}>Connection Issue Detected</div><div style={{ fontSize: 13, color: t.textMuted }}>{offlineConns} offline connection(s).</div></div>
                <Btn size="sm" onClick={() => setPage("tickets")} t={t}>Open a Ticket</Btn>
              </div>
            )}
            {pendingInvs.length > 0 && (
              <div style={{ background: `${t.warning}14`, border: `1px solid ${t.warning}35`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>💳</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: t.warning, fontSize: 14 }}>Payment Due</div><div style={{ fontSize: 13, color: t.textMuted }}>{pendingInvs.length} unpaid invoice(s).</div></div>
                <Btn size="sm" onClick={() => setPage("billing")} t={t}>Pay Now</Btn>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Current Plan", value: activePlan ? activePlan.name.split(" ")[0] : "None", sub: activePlan ? activePlan.name : "No plan selected", color: activePlan ? t.accent : t.warning, onClick: !activePlan ? () => setPage("plan") : undefined },
                { label: "Monthly Rate", value: activePlan ? `$${activePlan.price}` : "—", sub: activePlan ? `Renews ${activePlan.renewal}` : "Choose a plan to get started", color: activePlan ? t.text : t.textMuted },
                { label: "Connections", value: `${onlineConns}/${data.connections.length}`, sub: offlineConns > 0 ? `${offlineConns} offline` : "All online", color: onlineConns === data.connections.length ? t.success : t.danger },
                { label: "Open Tickets", value: loadTickets().filter(tk => tk.clientId === account.id && tk.status !== "closed" && tk.status !== "resolved").length, sub: "Click to view", color: t.warning },
              ].map(s => (
                <Card key={s.label} t={t} onClick={s.label === "Open Tickets" ? () => setPage("tickets") : undefined}>
                  <div style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono'" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{s.sub}</div>
                </Card>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Card t={t}>
                <div style={{ fontWeight: 700, marginBottom: 14, display: "flex", justifyContent: "space-between", color: t.text }}>
                  <span>Connections</span>
                  <button onClick={() => setPage("connections")} style={{ background: "none", border: "none", color: t.accent, fontSize: 12, cursor: "pointer" }}>View all →</button>
                </div>
                {data.connections.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StatusDot status={c.status} t={t} />
                      <div><div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{c.location}</div><div style={{ fontSize: 11, color: t.textMuted }}>{c.ip}</div></div>
                    </div>
                    <Badge label={c.status} t={t} />
                  </div>
                ))}
                {data.connections.length === 0 && <div style={{ color: t.textMuted, fontSize: 13 }}>No connections yet.</div>}
              </Card>
              <Card t={t}>
                <div style={{ fontWeight: 700, marginBottom: 14, display: "flex", justifyContent: "space-between", color: t.text }}>
                  <span>Recent Tickets</span>
                  <button onClick={() => setPage("tickets")} style={{ background: "none", border: "none", color: t.accent, fontSize: 12, cursor: "pointer" }}>View all →</button>
                </div>
                {(() => {
                  const myTickets = loadTickets().filter(tk => tk.clientId === account.id).slice(0, 3);
                  const statusColors = { open: t.warning, "in-progress": t.accent, resolved: t.success, closed: t.textMuted };
                  return myTickets.length > 0 ? myTickets.map(tk => (
                    <div key={tk.id} onClick={() => setPage("tickets")} style={{ padding: "10px 0", borderBottom: `1px solid ${t.border}`, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>{tk.subject}</div>
                        <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: `${statusColors[tk.status] || t.textMuted}20`, color: statusColors[tk.status] || t.textMuted, flexShrink: 0 }}>{tk.status}</span>
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{tk.id} · {tk.category}</div>
                    </div>
                  )) : <div style={{ color: t.textMuted, fontSize: 13 }}>No tickets yet.</div>;
                })()}
              </Card>
            </div>
          </div>
        )}

        {/* CONNECTIONS */}
        {page === "connections" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: t.text }}>My Connections</div>
            <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 24 }}>Live status of your internet connections</div>
            {data.connections.length === 0 && <Card t={t}><div style={{ color: t.textMuted, textAlign: "center", padding: 32 }}>No connections found.</div></Card>}
            <div style={{ display: "grid", gap: 14 }}>
              {data.connections.map(c => (
                <Card key={c.id} t={t}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: c.status === "online" ? `${t.success}18` : `${t.danger}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{c.status === "online" ? "🟢" : "🔴"}</div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2, color: t.text }}>{c.location}</div>
                        <div style={{ fontSize: 13, color: t.textMuted }}>{c.device}</div>
                      </div>
                    </div>
                    <Badge label={c.status} t={t} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18, paddingTop: 18, borderTop: `1px solid ${t.border}` }}>
                    {[["IP Address", c.ip, true], ["Latency", c.latency ? `${c.latency}ms` : "—", false], ["Bandwidth", c.bandwidth, false], ["Uptime", c.uptime, false]].map(([label, val, mono]) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontWeight: 700, fontFamily: mono ? "'JetBrains Mono'" : "inherit", color: t.text }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {page === "billing" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: t.text }}>Billing</div>
            <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 24 }}>View and pay your invoices</div>
            <div style={{ display: "grid", gap: 12 }}>
              {invoices.map(inv => (
                <Card key={inv.id} t={t} style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: inv.status === "paid" ? `${t.success}18` : `${t.warning}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{inv.status === "paid" ? "✅" : "📄"}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{inv.period}</div>
                        <div style={{ fontSize: 12, color: t.textMuted }}>{inv.id} · Due {inv.due}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'JetBrains Mono'", color: t.text }}>${inv.amount}</span>
                      <Badge label={inv.status} t={t} />
                      {inv.status !== "paid" && <Btn size="sm" onClick={() => setPayModal(inv)} t={t}>Pay Now</Btn>}
                    </div>
                  </div>
                </Card>
              ))}
              {invoices.length === 0 && <Card t={t}><div style={{ color: t.textMuted, textAlign: "center", padding: 32 }}>No invoices yet.</div></Card>}
            </div>
            {payModal && (
              <PaymentModal
                amount={payModal.amount}
                label={`Invoice ${payModal.id}`}
                onConfirm={() => { setInvoices(prev => prev.map(i => i.id === payModal.id ? { ...i, status: "paid" } : i)); setPayModal(null); }}
                onClose={() => setPayModal(null)}
                t={t}
              />
            )}
          </div>
        )}

        {/* TICKETS */}
        {page === "tickets" && <TicketsView account={account} t={t} />}

        {/* PLAN */}
        {page === "plan" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: t.text }}>My Plan</div>
            <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 24 }}>Your current service plan</div>

            {/* Current plan banner */}
            {activePlan && (
              <Card t={t} style={{ marginBottom: 28, background: `linear-gradient(135deg, ${t.accent}18, ${t.surface})`, border: `2px solid ${t.accent}50` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 11, color: t.accent, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6, fontWeight: 700 }}>Active Plan</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.text }}>{activePlan.name}</div>
                    <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{activePlan.type || "Symmetric Fibre"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 34, fontWeight: 900, color: t.accent, fontFamily: "'JetBrains Mono'" }}>${activePlan.price}<span style={{ fontSize: 14, color: t.textMuted, fontWeight: 400 }}>/mo</span></div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>Renews {activePlan.renewal || "2026-04-01"}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, paddingTop: 18, borderTop: `1px solid ${t.border}` }}>
                  {[["Download", `${activePlan.down >= 10000 ? "10 Gbps" : activePlan.down >= 1000 ? "1 Gbps" : `${activePlan.down} Mbps`}`], ["Upload", `${activePlan.up >= 10000 ? "10 Gbps" : activePlan.up >= 1000 ? "1 Gbps" : `${activePlan.up} Mbps`}`], ["SLA Uptime", "99.9%"]].map(([k, v]) => (
                    <div key={k} style={{ background: t.surfaceAlt, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{k}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: t.text }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Internet Speed Packages */}
            <div style={{ background: t.surfaceAlt, borderRadius: 20, padding: "28px 24px" }}>
              <div style={{ fontSize: 20, fontWeight: 800, textAlign: "center", marginBottom: 24, color: t.text }}>Internet Speed Packages</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {PLANS.map(plan => {
                  const isCurrent = activePlan && plan.name === activePlan.name;
                  return (
                    <div key={plan.id}
                      style={{ background: isCurrent ? `linear-gradient(160deg, ${t.surface}, ${t.accentLight})` : t.surface, border: `2px solid ${isCurrent ? t.accent : t.border}`, borderRadius: 14, padding: "22px 16px", textAlign: "center", position: "relative", transition: "all 0.2s", cursor: isCurrent ? "default" : "pointer" }}
                      onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = t.accent; } }}
                      onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; } }}>
                      {isCurrent && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: t.accent, color: dark ? "#000" : "#fff", fontSize: 10, fontWeight: 800, borderRadius: 20, padding: "3px 12px", whiteSpace: "nowrap" }}>CURRENT PLAN</div>}
                      <div style={{ fontSize: 22, fontWeight: 900, color: t.accent, marginBottom: 2 }}>{plan.name}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 16 }}>{plan.type}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: t.text, marginBottom: 16 }}>${plan.price}<span style={{ fontSize: 12, color: t.textMuted, fontWeight: 400 }}>/mo</span></div>
                      {!isCurrent && (
                        <button onClick={() => setAccountPlan(plan)} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: `1px solid ${t.accent}`, background: (!activePlan || plan.price > activePlan.price) ? t.accent : "transparent", color: (!activePlan || plan.price > activePlan.price) ? (dark ? "#000" : "#fff") : t.accent, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                          {!activePlan ? "Select Plan" : plan.price > activePlan.price ? "Upgrade →" : "Downgrade"}
                        </button>
                      )}
                      {isCurrent && <div style={{ fontSize: 12, color: t.accent, fontWeight: 700, paddingTop: 4 }}>✓ Active</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: t.textMuted }}>
                All packages include symmetric upload/download speeds · 99.9% SLA uptime guarantee · 24/7 support
              </div>
            </div>

            {/* No plan state */}
            {!account.plan && (
              <div style={{ marginTop: 20, background: `${t.warning}14`, border: `1px solid ${t.warning}35`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>ℹ️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: t.warning, fontSize: 14 }}>No active plan</div>
                  <div style={{ fontSize: 13, color: t.textMuted }}>Select a package above to get started, or contact our team for a custom quote.</div>
                </div>
                <button onClick={() => setPage("tickets")} style={{ background: t.accent, color: dark ? "#000" : "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Contact Support</button>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {page === "settings" && (
          <ClientSettingsPage profile={profile} onUpdateProfile={setProfile} t={t} dark={dark} onToggleDark={onToggleDark} />
        )}
      </div>
    </div>
  );
}

// ── CLIENT SETTINGS PAGE ───────────────────────────────────────────────────
function ClientPrefToggle({ label, sub, defaultOn, t }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.border}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: t.textMuted }}>{sub}</div>}
      </div>
      <button onClick={() => setOn(o => !o)}
        style={{ width: 44, height: 24, borderRadius: 12, background: on ? t.accent : t.border, border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.25s", marginLeft: 16 }}>
        <div style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.22s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

function ClientSettingsPage({ profile, onUpdateProfile, t, dark, onToggleDark }) {
  const fileRef = useRef(null);
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  // Profile form state
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [company, setCompany] = useState(profile.company || "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);

  // Password form state
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setAvatarPreview(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ ...profile, name, email, phone, company, avatar: avatarPreview });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const pwStrength = pw => {
    if (!pw) return { score: 0, label: "", color: "transparent" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { score: s, label: "Weak", color: t.danger };
    if (s <= 2) return { score: s, label: "Fair", color: t.warning };
    if (s <= 3) return { score: s, label: "Good", color: "#00b4d8" };
    return { score: s, label: "Strong", color: t.success };
  };
  const strength = pwStrength(newPw);

  const handleSavePassword = () => {
    setPwError("");
    if (!curPw) { setPwError("Please enter your current password."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    setPwSaved(true);
    setCurPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSaved(false), 2500);
  };

  const inputStyle = {
    width: "100%", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10,
    padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none",
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 6, display: "block",
    textTransform: "uppercase", letterSpacing: "0.07em",
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "password", label: "Password", icon: "🔒" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.3s ease", maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>Settings</div>
        <div style={{ color: t.textMuted, fontSize: 14 }}>Manage your profile and account preferences</div>
      </div>

      {/* Tab pills */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: t.surfaceAlt, borderRadius: 12, padding: 4, width: "fit-content" }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: tab === tb.id ? t.surface : "transparent", color: tab === tb.id ? t.text : t.textMuted, fontFamily: "inherit", fontSize: 13, fontWeight: tab === tb.id ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", boxShadow: tab === tb.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            <span>{tb.icon}</span>{tb.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === "profile" && (
        <div style={{ animation: "fadeUp 0.2s ease" }}>
          {/* Avatar card */}
          <Card t={t} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 20 }}>Profile Picture</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {/* Avatar circle */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", background: avatarPreview ? "transparent" : `linear-gradient(135deg, ${t.accent}, #7c4dff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, color: "#fff", border: `3px solid ${t.border}`, boxShadow: `0 0 0 5px ${t.accent}18` }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (name[0] || "U").toUpperCase()}
                </div>
                {/* Camera button */}
                <button onClick={() => fileRef.current?.click()}
                  style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: "50%", background: t.accent, border: `2px solid ${t.surface}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  📷
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 2 }}>{name || "Your Name"}</div>
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>{email}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => fileRef.current?.click()}
                    style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${t.accent}`, background: t.accentLight, color: t.accent, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Upload Photo
                  </button>
                  {avatarPreview && (
                    <button onClick={() => setAvatarPreview(null)}
                      style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textMuted, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>JPG, PNG or GIF · Max 5 MB</div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </Card>

          {/* Account details card */}
          <Card t={t} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 20 }}>Account Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-0100" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
            </div>

            {/* Read-only info */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingTop: 18, borderTop: `1px solid ${t.border}`, marginBottom: 18 }}>
              {[
                { label: "Account ID", value: `CL-${String(profile.id || 1).padStart(4, "0")}`, mono: true },
                { label: "Member Since", value: profile.joined || "2024-01-01" },
                { label: "Account Type", value: "Business Client" },
              ].map(({ label, value, mono }) => (
                <div key={label} style={{ background: t.surfaceAlt, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: t.text, fontFamily: mono ? "'JetBrains Mono'" : "inherit" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
              {saved && <span style={{ fontSize: 13, color: t.success, fontWeight: 600 }}>✓ Changes saved!</span>}
              <Btn onClick={handleSaveProfile} t={t}>Save Changes</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ── PASSWORD TAB ── */}
      {tab === "password" && (
        <div style={{ animation: "fadeUp 0.2s ease" }}>
          <Card t={t}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>Change Password</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 24 }}>Choose a strong, unique password you don't use elsewhere.</div>

            {/* Current password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input type={showCur ? "text" : "password"} value={curPw} onChange={e => setCurPw(e.target.value)}
                  placeholder="Enter your current password" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
                <button onClick={() => setShowCur(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: t.textMuted, lineHeight: 1 }}>
                  {showCur ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* New password */}
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 8 characters" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
                <button onClick={() => setShowNew(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: t.textMuted, lineHeight: 1 }}>
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            {newPw.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength.score ? strength.color : t.border, transition: "background 0.3s" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[{ label: "8+ chars", ok: newPw.length >= 8 }, { label: "Uppercase", ok: /[A-Z]/.test(newPw) }, { label: "Number", ok: /[0-9]/.test(newPw) }, { label: "Symbol", ok: /[^A-Za-z0-9]/.test(newPw) }].map(r => (
                      <span key={r.label} style={{ fontSize: 11, color: r.ok ? t.success : t.textMuted }}>
                        {r.ok ? "✓" : "○"} {r.label}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
              </div>
            )}

            {/* Confirm password */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat your new password"
                  style={{ ...inputStyle, paddingRight: 44, borderColor: confirmPw && newPw !== confirmPw ? t.danger : t.border }}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = confirmPw && newPw !== confirmPw ? t.danger : t.border} />
                <button onClick={() => setShowConfirm(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: t.textMuted, lineHeight: 1 }}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {confirmPw && newPw !== confirmPw && <div style={{ fontSize: 12, color: t.danger, marginTop: 5 }}>Passwords don't match</div>}
              {confirmPw && newPw === confirmPw && confirmPw.length > 0 && <div style={{ fontSize: 12, color: t.success, marginTop: 5 }}>✓ Passwords match</div>}
            </div>

            {pwError && (
              <div style={{ background: `${t.danger}14`, border: `1px solid ${t.danger}35`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: t.danger }}>
                {pwError}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
              {pwSaved && <span style={{ fontSize: 13, color: t.success, fontWeight: 600 }}>✓ Password updated!</span>}
              <Btn onClick={handleSavePassword} t={t}>Update Password</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ── APPEARANCE TAB ── */}
      {tab === "appearance" && (
        <div style={{ animation: "fadeUp 0.2s ease" }}>
          <Card t={t} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>Theme</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 24 }}>Choose how the portal looks to you.</div>

            {/* Mode selector cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {/* Light mode */}
              <button onClick={() => { if (dark) onToggleDark(); }}
                style={{ padding: "20px", borderRadius: 14, border: `2px solid ${!dark ? t.accent : t.border}`, background: !dark ? t.accentLight : t.surfaceAlt, cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "inherit" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>☀️</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: !dark ? t.accent : t.text, marginBottom: 4 }}>Light Mode</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Clean, bright interface</div>
                {!dark && <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: t.accent }}>✓ Currently active</div>}
              </button>

              {/* Dark mode */}
              <button onClick={() => { if (!dark) onToggleDark(); }}
                style={{ padding: "20px", borderRadius: 14, border: `2px solid ${dark ? t.accent : t.border}`, background: dark ? t.accentLight : t.surfaceAlt, cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "inherit" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0a0e1a", border: "1px solid #1e2d45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>🌙</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: dark ? t.accent : t.text, marginBottom: 4 }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Easier on the eyes at night</div>
                {dark && <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: t.accent }}>✓ Currently active</div>}
              </button>
            </div>

            {/* Quick toggle row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: t.surfaceAlt, borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Toggle between light and dark</div>
              </div>
              <button onClick={onToggleDark}
                style={{ width: 52, height: 28, borderRadius: 14, background: dark ? t.accent : t.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: dark ? 27 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.22s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === "notifications" && (
        <div style={{ animation: "fadeUp 0.2s ease" }}>
          <Card t={t} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>Email Notifications</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>Choose what you'd like to be notified about.</div>
            {[
              { label: "Invoice reminders", sub: "Get notified when a payment is due", defaultOn: true },
              { label: "Support ticket replies", sub: "Email me when support responds to my ticket", defaultOn: true },
              { label: "Connection status alerts", sub: "Alert when a connection goes offline", defaultOn: true },
              { label: "Plan change confirmations", sub: "Receive a summary when your plan changes", defaultOn: false },
              { label: "Monthly usage summary", sub: "Monthly report of your bandwidth usage", defaultOn: false },
            ].map(p => <ClientPrefToggle key={p.label} label={p.label} sub={p.sub} defaultOn={p.defaultOn} t={t} />)}
          </Card>
        </div>
      )}
    </div>
  );
}

// ── EMAIL VERIFICATION SCREEN ─────────────────────────────────────────────
function VerifyEmailScreen({ email, onVerified, onResend, dark }) {
  const t = dark ? DARK : LIGHT;
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Demo code: 123456
  const DEMO_CODE = "123456";

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleDigit = (i, val) => {
    const cleaned = val.replace(/\D/, "").slice(-1);
    const next = [...code];
    next[i] = cleaned;
    setCode(next);
    setError("");
    if (cleaned && i < 5) inputRefs.current[i + 1]?.focus();
    // Auto-verify when all 6 filled
    if (cleaned && i === 5) {
      const full = [...next].join("");
      if (full.length === 6) setTimeout(() => verify([...next]), 100);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split("");
      setCode(arr);
      inputRefs.current[5]?.focus();
      setTimeout(() => verify(arr), 100);
    }
  };

  const verify = (digits) => {
    const entered = digits.join("");
    if (entered === DEMO_CODE) {
      setLoading(true);
      setTimeout(() => onVerified(), 800);
    } else {
      setError("Incorrect code. Try 123456 for this demo.");
    }
  };

  const handleResend = () => {
    setResent(true);
    setCountdown(60);
    setCode(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
    onResend?.();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: t.gradientBg }}>
      <div style={{ width: "100%", maxWidth: 460, animation: "fadeUp 0.4s ease" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${t.accent}, #7c4dff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 18px", boxShadow: `0 12px 32px ${t.accent}40` }}>
            ✉️
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 8 }}>Check your email</div>
          <div style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>
            We sent a 6-digit verification code to<br />
            <strong style={{ color: t.text }}>{email}</strong>
          </div>
        </div>

        <Card t={t} style={{ padding: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, textAlign: "center", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>Enter verification code</div>

          {/* 6-digit input */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 52, height: 60, textAlign: "center", fontSize: 24, fontWeight: 800,
                  fontFamily: "'JetBrains Mono'", borderRadius: 12, border: `2px solid ${error ? t.danger : digit ? t.accent : t.border}`,
                  background: digit ? t.accentLight : t.bg, color: t.text, outline: "none",
                  transition: "all 0.15s", caretColor: t.accent,
                }}
                onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.accent}25`; }}
                onBlur={e => { e.target.style.borderColor = error ? t.danger : digit ? t.accent : t.border; e.target.style.boxShadow = "none"; }}
              />
            ))}
          </div>

          {error && (
            <div style={{ background: `${t.danger}12`, border: `1px solid ${t.danger}35`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: t.danger, textAlign: "center" }}>
              {error}
            </div>
          )}

          {resent && (
            <div style={{ background: `${t.success}12`, border: `1px solid ${t.success}35`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: t.success, textAlign: "center" }}>
              ✓ A new code has been sent to your email.
            </div>
          )}

          <button
            onClick={() => verify(code)}
            disabled={loading || code.join("").length < 6}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: code.join("").length === 6 && !loading ? t.accent : t.border, color: "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: code.join("").length === 6 && !loading ? "pointer" : "not-allowed", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? (
              <><span style={{ width: 16, height: 16, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Verifying...</>
            ) : "Verify Email →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: t.textMuted }}>
            Didn't receive it?{" "}
            {countdown > 0 ? (
              <span style={{ color: t.textLight }}>Resend in {countdown}s</span>
            ) : (
              <button onClick={handleResend} style={{ background: "none", border: "none", color: t.accent, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Resend code</button>
            )}
          </div>

          <div style={{ marginTop: 20, padding: "12px 16px", background: t.accentLight, borderRadius: 10, border: `1px solid ${t.accent}30` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, marginBottom: 4 }}>Demo hint</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Use code <strong style={{ fontFamily: "'JetBrains Mono'", color: t.text }}>123456</strong> to verify in this demo.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [account, setAccount] = useState(null);
  const [pendingAccount, setPendingAccount] = useState(null);
  const [dark, setDark] = useState(false);

  const handleSignup = (acct) => {
    setPendingAccount(acct);
    setScreen("verify");
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ background: dark ? DARK.bg : LIGHT.bg, minHeight: "100vh", transition: "background 0.3s" }}>
        {screen === "login" && <LoginScreen onLogin={acct => { setAccount(acct); setScreen("dashboard"); }} onGoSignup={() => setScreen("signup")} dark={dark} onToggleDark={() => setDark(d => !d)} />}
        {screen === "signup" && <SignupScreen onSignup={handleSignup} onGoLogin={() => setScreen("login")} dark={dark} onToggleDark={() => setDark(d => !d)} />}
        {screen === "verify" && pendingAccount && (
          <VerifyEmailScreen
            email={pendingAccount.email}
            dark={dark}
            onVerified={() => { setAccount(pendingAccount); setPendingAccount(null); setScreen("dashboard"); }}
            onResend={() => console.log("Resend code for", pendingAccount.email)}
          />
        )}
        {screen === "dashboard" && account && <ClientDashboard account={account} onLogout={() => { setAccount(null); setScreen("login"); }} dark={dark} onToggleDark={() => setDark(d => !d)} />}
      </div>
    </>
  );
}
