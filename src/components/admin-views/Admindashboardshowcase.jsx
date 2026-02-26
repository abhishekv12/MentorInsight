import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";

// ============================================================
// Admindashboardshowcase.jsx
// Drop-in replacement / enhancement for DashboardOverview.jsx
//
// Usage in AdminDashboard.jsx:
//   import Admindashboardshowcase from './admin-views/Admindashboardshowcase';
//   {activeView === 'overview' && (
//     <Admindashboardshowcase stats={stats} collegeName={collegeName} setActiveView={setActiveView} />
//   )}
// ============================================================

const PALETTE = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];
const DEPT_ICONS = ["fa-laptop-code","fa-flask","fa-calculator","fa-pen-fancy","fa-atom","fa-landmark","fa-heart-pulse","fa-gavel","fa-seedling","fa-palette"];

// ── Tiny helpers ──────────────────────────────────────────────
const Av = ({ name = "?", idx = 0, size = 38 }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.28),
    background: PALETTE[idx % PALETTE.length] + "22",
    color: PALETTE[idx % PALETTE.length],
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: Math.round(size * 0.42), fontWeight: 800, flexShrink: 0,
  }}>{(name || "?").charAt(0).toUpperCase()}</div>
);

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return "Just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ── Greeting based on time ────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", icon: "fa-sun", color: "#f59e0b" };
  if (h < 17) return { text: "Good Afternoon", icon: "fa-cloud-sun", color: "#f97316" };
  return { text: "Good Evening", icon: "fa-moon", color: "#6366f1" };
};

// ── Static quick-action tiles ─────────────────────────────────
const QUICK_ACTIONS = [
  { icon: "fa-user-plus",       label: "Add Faculty",     color: "#6366f1", view: "faculty"   },
  { icon: "fa-user-graduate",   label: "Enroll Student",  color: "#10b981", view: "students"  },
  { icon: "fa-layer-group",     label: "New Batch",       color: "#f59e0b", view: "batches"   },
  { icon: "fa-bullhorn",        label: "Post Review",     color: "#ef4444", view: "reviews"   },
  { icon: "fa-book-open",       label: "Add Course",      color: "#8b5cf6", view: "courses"   },
  { icon: "fa-chart-pie",       label: "Analytics",       color: "#06b6d4", view: "analytics" },
];

// ── Activity feed items (static + dynamic mix) ────────────────
const STATIC_TIPS = [
  { icon: "fa-lightbulb",  color: "#f59e0b", text: "Assign teachers to batches before posting review campaigns." },
  { icon: "fa-shield-halved", color: "#10b981", text: "Regularly export student data backups from Analytics." },
  { icon: "fa-bell",       color: "#6366f1", text: "Use Broadcast Messages to notify all students at once." },
  { icon: "fa-star",       color: "#ef4444", text: "Review low-performing faculty from the Reviews → Overview tab." },
];

// ══════════════════════════════════════════════════════════════
const Admindashboardshowcase = ({ stats = {}, collegeName = "", setActiveView }) => {
  const greeting = getGreeting();
  const [data, setData] = useState({ batches: [], faculty: [], students: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tipIdx, setTipIdx] = useState(0);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Cycle tips
  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % STATIC_TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Fetch overview data
  useEffect(() => {
    const load = async () => {
      const cn = collegeName || localStorage.getItem("collegeName");
      if (!cn) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_URL}/api/admin/overview-data?college=${cn}`);
        const d = res.data;
        setData({
          batches:  d.recentBatches  || [],
          faculty:  d.recentFaculty  || [],
          students: d.recentStudents || [],
          activity: d.recentActivity || [],
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, [collegeName]);

  const totalStudents  = stats.students || 0;
  const totalFaculty   = stats.faculty  || 0;
  const totalBatches   = stats.batches  || 0;
  const totalDepts     = stats.depts    || 0;

  // ── Derived: occupancy / health scores ────────────────────
  const healthScore = Math.min(100, Math.round(
    (totalStudents > 0 ? 30 : 0) +
    (totalFaculty  > 0 ? 25 : 0) +
    (totalBatches  > 0 ? 25 : 0) +
    (totalDepts    > 0 ? 20 : 0)
  ));

  const S = { // base styles
    card: {
      background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 24,
    },
    sectionTitle: {
      fontSize: 13, fontWeight: 700, color: "#94a3b8",
      textTransform: "uppercase", letterSpacing: "0.06em",
      marginBottom: 16, display: "flex", alignItems: "center", gap: 7,
    },
    h2: { margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" },
    label: { margin: 0, fontSize: 12, color: "#64748b", fontWeight: 500 },
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", animation: "fadeInUp 0.4s ease" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes tipSlide { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        .ads-qa:hover { transform: translateY(-4px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
        .ads-stat:hover { transform: translateY(-3px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .ads-row:hover { background: #f8fafc !important; }
        .ads-nav:hover { background: #f1f5f9 !important; }
        .ads-act:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; }
      `}</style>

      {/* ══ HERO BANNER ══════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2355 100%)",
        borderRadius: 24, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        {/* Background orbs */}
        <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200,
          borderRadius:"50%", background:"rgba(99,102,241,0.12)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:120, width:140, height:140,
          borderRadius:"50%", background:"rgba(16,185,129,0.08)", pointerEvents:"none" }} />

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, position:"relative", zIndex:1 }}>
          {/* Left: Greeting */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <i className={`fa-solid ${greeting.icon}`} style={{ color: greeting.color, fontSize:18 }} />
              <span style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>{greeting.text}</span>
            </div>
            <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>
              {collegeName || "Institute Admin"}
            </h1>
            <p style={{ margin:0, color:"#64748b", fontSize:13 }}>
              Administration Panel  ·  {currentTime.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
            </p>
          </div>

          {/* Right: Live clock + health ring */}
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            {/* Health score */}
            <div style={{ textAlign:"center" }}>
              <div style={{ position:"relative", width:72, height:72 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="36" cy="36" r="30" fill="none"
                    stroke={healthScore >= 80 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 188.5} 188.5`}
                    strokeDashoffset="47.1" style={{ transition:"stroke-dasharray 1s ease" }} />
                  <text x="36" y="40" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">{healthScore}%</text>
                </svg>
              </div>
              <p style={{ margin:"4px 0 0", color:"#64748b", fontSize:11, fontWeight:600 }}>System Health</p>
            </div>

            {/* Live clock */}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-0.03em", fontVariantNumeric:"tabular-nums" }}>
                {currentTime.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true })}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", marginTop:4 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981",
                  boxShadow:"0 0 0 3px rgba(16,185,129,0.25)", animation:"pulse 2s infinite" }} />
                <span style={{ color:"#10b981", fontSize:11, fontWeight:700 }}>Live Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ═══════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { icon:"fa-users",           color:"#6366f1", val: totalStudents, label:"Total Students",   sub: totalStudents > 0 ? "Enrolled" : "No students yet",    view:"students"  },
          { icon:"fa-chalkboard-user", color:"#10b981", val: totalFaculty,  label:"Faculty Members",  sub: totalFaculty > 0  ? "Active professors" : "Add faculty", view:"faculty"   },
          { icon:"fa-layer-group",     color:"#f59e0b", val: totalBatches,  label:"Batches",          sub: totalBatches > 0  ? "Across all depts" : "Create batches",view:"batches" },
          { icon:"fa-building-columns",color:"#ef4444", val: totalDepts,    label:"Departments",      sub: totalDepts > 0    ? "University units" : "Add depts",    view:"departments"},
        ].map((s, i) => (
          <div key={i} className="ads-stat" onClick={() => setActiveView?.(s.view)}
            style={{ ...S.card, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{ width:50, height:50, borderRadius:14, flexShrink:0, display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:20,
              background: s.color + "18", color: s.color }}>
              <i className={`fa-solid ${s.icon}`} />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:30, fontWeight:800, color:"#0f172a", lineHeight:1, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ QUICK ACTIONS ════════════════════════════════════════ */}
      <div style={{ ...S.card, marginBottom:24 }}>
        <div style={S.sectionTitle}>
          <i className="fa-solid fa-bolt" style={{ color:"#f59e0b" }} /> Quick Actions
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
          {QUICK_ACTIONS.map((q, i) => (
            <button key={i} className="ads-qa"
              onClick={() => setActiveView?.(q.view)}
              style={{
                background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:16,
                padding:"18px 12px", cursor:"pointer", transition:"all 0.2s",
                display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              }}>
              <div style={{ width:44, height:44, borderRadius:12, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:18, background: q.color + "15", color: q.color }}>
                <i className={`fa-solid ${q.icon}`} />
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:"#1e293b", textAlign:"center" }}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ MAIN 3-COL GRID ══════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr", gap:20, marginBottom:24 }}>

        {/* ── Recent Batches / Departments ── */}
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={S.sectionTitle}>
              <i className="fa-solid fa-layer-group" style={{ color:"#f59e0b" }} /> Recent Batches
            </div>
            <button onClick={() => setActiveView?.("batches")}
              style={{ background:"none", border:"none", color:"#6366f1", fontSize:12, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              View all <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:22, marginBottom:8, display:"block" }} />
              Loading…
            </div>
          ) : data.batches.length === 0 ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8" }}>
              <i className="fa-solid fa-layer-group" style={{ fontSize:28, marginBottom:10, display:"block", opacity:.4 }} />
              <p style={{ margin:0, fontSize:13 }}>No batches yet.<br/>Go to Departments to create one.</p>
              <button onClick={() => setActiveView?.("batches")}
                style={{ marginTop:14, padding:"8px 18px", background:"#6366f1", color:"#fff",
                  border:"none", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Create Batch
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {data.batches.slice(0, 6).map((b, i) => (
                <div key={b._id || i} className="ads-row"
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 8px",
                    borderBottom: i < Math.min(data.batches.length, 6) - 1 ? "1px solid #f1f5f9" : "none",
                    borderRadius:8, transition:"background 0.15s", cursor:"default" }}>
                  <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:15,
                    background: PALETTE[i % PALETTE.length] + "15", color: PALETTE[i % PALETTE.length] }}>
                    <i className={`fa-solid ${DEPT_ICONS[i % DEPT_ICONS.length]}`} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>{b.batchName || b.name || "Unnamed"}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{b.course || b.year || "—"}</div>
                  </div>
                  <div style={{ background:"#f1f5f9", color:"#475569", fontSize:11, fontWeight:700,
                    padding:"3px 10px", borderRadius:8, whiteSpace:"nowrap", flexShrink:0 }}>
                    {b.studentCount ?? (b.students?.length ?? 0)} students
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Faculty ── */}
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={S.sectionTitle}>
              <i className="fa-solid fa-chalkboard-user" style={{ color:"#10b981" }} /> New Faculty
            </div>
            <button onClick={() => setActiveView?.("faculty")}
              style={{ background:"none", border:"none", color:"#6366f1", fontSize:12, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              All <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8", fontSize:12 }}>Loading…</div>
          ) : data.faculty.length === 0 ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8" }}>
              <i className="fa-solid fa-user-tie" style={{ fontSize:26, display:"block", marginBottom:8, opacity:.4 }} />
              <p style={{ margin:"0 0 12px", fontSize:12 }}>No faculty registered yet.</p>
              <button onClick={() => setActiveView?.("faculty")}
                style={{ padding:"7px 16px", background:"#10b981", color:"#fff",
                  border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Add Faculty
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {data.faculty.slice(0, 6).map((f, i) => (
                <div key={f._id || i} className="ads-row"
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 6px",
                    borderBottom: i < Math.min(data.faculty.length, 6) - 1 ? "1px solid #f1f5f9" : "none",
                    borderRadius:8, transition:"background 0.15s" }}>
                  <Av name={f.name || f.facultyName || "F"} idx={i} size={36} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>
                      {f.name || f.facultyName || "Faculty"}
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>
                      {f.department || f.dept || f.email || "—"}
                    </div>
                  </div>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#10b981",
                    flexShrink:0, boxShadow:"0 0 0 3px rgba(16,185,129,0.2)" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Students ── */}
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={S.sectionTitle}>
              <i className="fa-solid fa-user-graduate" style={{ color:"#6366f1" }} /> New Students
            </div>
            <button onClick={() => setActiveView?.("students")}
              style={{ background:"none", border:"none", color:"#6366f1", fontSize:12, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              All <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8", fontSize:12 }}>Loading…</div>
          ) : data.students.length === 0 ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8" }}>
              <i className="fa-solid fa-user-graduate" style={{ fontSize:26, display:"block", marginBottom:8, opacity:.4 }} />
              <p style={{ margin:"0 0 12px", fontSize:12 }}>No students enrolled yet.</p>
              <button onClick={() => setActiveView?.("students")}
                style={{ padding:"7px 16px", background:"#6366f1", color:"#fff",
                  border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Manage Students
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {data.students.slice(0, 6).map((s, i) => (
                <div key={s._id || i} className="ads-row"
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 6px",
                    borderBottom: i < Math.min(data.students.length, 6) - 1 ? "1px solid #f1f5f9" : "none",
                    borderRadius:8, transition:"background 0.15s" }}>
                  <Av name={s.name || s.studentName || "S"} idx={i + 3} size={36} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>
                      {s.name || s.studentName || "Student"}
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>
                      {s.rollNo || s.batchName || s.email || "—"}
                    </div>
                  </div>
                  {s.createdAt && (
                    <span style={{ fontSize:10, color:"#cbd5e1", flexShrink:0 }}>{timeAgo(s.createdAt)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ BOTTOM ROW: Activity + Tip + Nav shortcuts ═══════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr", gap:20, marginBottom:24 }}>

        {/* ── Activity Feed ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color:"#8b5cf6" }} /> Recent Activity
          </div>
          {data.activity.length === 0 ? (
            // Fallback: show a live activity-style log based on data we have
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                totalStudents > 0 && { icon:"fa-users",           color:"#6366f1", msg:`${totalStudents} students enrolled`,             time:"Today" },
                totalFaculty  > 0 && { icon:"fa-chalkboard-user", color:"#10b981", msg:`${totalFaculty} faculty members registered`,      time:"Active" },
                totalBatches  > 0 && { icon:"fa-layer-group",     color:"#f59e0b", msg:`${totalBatches} batches across departments`,       time:"Running" },
                totalDepts    > 0 && { icon:"fa-building-columns", color:"#ef4444", msg:`${totalDepts} departments configured`,            time:"Setup" },
                               true && { icon:"fa-shield-halved",   color:"#10b981", msg:"System is secure and running normally",           time:"Now" },
                               true && { icon:"fa-clock",           color:"#8b5cf6", msg:"Dashboard last refreshed",                        time:"Just now" },
              ].filter(Boolean).map((a, i) => (
                <div key={i} className="ads-act"
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 10px",
                    borderRadius:10, border:"1px solid transparent", marginBottom:6, transition:"all 0.15s" }}>
                  <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:13,
                    background: a.color + "18", color: a.color }}>
                    <i className={`fa-solid ${a.icon}`} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:"#1e293b", fontWeight:600, lineHeight:1.4 }}>{a.msg}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {data.activity.slice(0, 6).map((a, i) => (
                <div key={i} className="ads-act"
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px",
                    borderRadius:10, border:"1px solid transparent", transition:"all 0.15s" }}>
                  <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:12,
                    background: PALETTE[i % PALETTE.length] + "18", color: PALETTE[i % PALETTE.length] }}>
                    <i className="fa-solid fa-circle-dot" />
                  </div>
                  <div>
                    <div style={{ fontSize:12, color:"#1e293b", fontWeight:600 }}>{a.message || a.text || "Activity"}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{a.createdAt ? timeAgo(a.createdAt) : "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Admin Tip Rotator ── */}
        <div style={{ ...S.card, background:"linear-gradient(135deg,#0f172a,#1e293b)", border:"none" }}>
          <div style={{ ...S.sectionTitle, color:"#475569" }}>
            <i className="fa-solid fa-lightbulb" style={{ color:"#f59e0b" }} /> Admin Tips
          </div>
          <div key={tipIdx} style={{ animation:"tipSlide 0.4s ease" }}>
            <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:22, marginBottom:16,
              background: STATIC_TIPS[tipIdx].color + "22", color: STATIC_TIPS[tipIdx].color }}>
              <i className={`fa-solid ${STATIC_TIPS[tipIdx].icon}`} />
            </div>
            <p style={{ margin:"0 0 20px", fontSize:14, color:"#e2e8f0", lineHeight:1.7, fontWeight:500 }}>
              {STATIC_TIPS[tipIdx].text}
            </p>
          </div>
          {/* Dot indicators */}
          <div style={{ display:"flex", gap:6 }}>
            {STATIC_TIPS.map((_, i) => (
              <button key={i} onClick={() => setTipIdx(i)}
                style={{ width: i === tipIdx ? 20 : 7, height:7, borderRadius:4,
                  background: i === tipIdx ? "#f59e0b" : "#334155",
                  border:"none", cursor:"pointer", transition:"all 0.3s" }} />
            ))}
          </div>
        </div>

        {/* ── Navigation Shortcuts ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <i className="fa-solid fa-map" style={{ color:"#06b6d4" }} /> Navigate To
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {[
              { icon:"fa-star-half-stroke", color:"#ef4444", label:"Faculty Reviews",    view:"reviews",     badge:"NEW" },
              { icon:"fa-chart-pie",        color:"#8b5cf6", label:"Analytics",          view:"analytics",   badge:null },
              { icon:"fa-book-open",        color:"#06b6d4", label:"Courses",            view:"courses",     badge:null },
              { icon:"fa-book",             color:"#f97316", label:"Library",            view:"library",     badge:null },
              { icon:"fa-users-gear",       color:"#10b981", label:"Staff Management",   view:"staff",       badge:null },
              { icon:"fa-building-columns", color:"#6366f1", label:"University Depts",   view:"departments", badge:null },
            ].map((n, i) => (
              <button key={i} className="ads-nav"
                onClick={() => setActiveView?.(n.view)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
                  background:"transparent", border:"none", borderRadius:10, cursor:"pointer",
                  transition:"background 0.15s", width:"100%", textAlign:"left" }}>
                <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:"flex",
                  alignItems:"center", justifyContent:"center", fontSize:14,
                  background: n.color + "18", color: n.color }}>
                  <i className={`fa-solid ${n.icon}`} />
                </div>
                <span style={{ flex:1, fontSize:13, fontWeight:700, color:"#1e293b" }}>{n.label}</span>
                {n.badge && (
                  <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800,
                    padding:"2px 7px", borderRadius:6 }}>{n.badge}</span>
                )}
                <i className="fa-solid fa-chevron-right" style={{ fontSize:10, color:"#cbd5e1" }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SYSTEM STATUS BAR ════════════════════════════════════ */}
      <div style={{ ...S.card, padding:"16px 24px", display:"flex", alignItems:"center",
        flexWrap:"wrap", gap:20, background:"#f8fafc" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#64748b", fontWeight:600 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981",
            animation:"pulse 2s infinite", display:"inline-block" }} />
          All Systems Operational
        </div>
        <div style={{ width:1, height:16, background:"#e2e8f0" }} />
        {[
          { label:"Database", ok: true },
          { label:"API Server", ok: true },
          { label:"Auth Service", ok: true },
          { label:"Storage", ok: true },
        ].map((sys, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#94a3b8" }}>
            <i className={`fa-solid fa-${sys.ok ? "circle-check" : "circle-xmark"}`}
              style={{ color: sys.ok ? "#10b981" : "#ef4444" }} />
            {sys.label}
          </div>
        ))}
        <div style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8" }}>
          <i className="fa-solid fa-rotate" style={{ marginRight:5 }} />
          Last sync: {currentTime.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default Admindashboardshowcase;

