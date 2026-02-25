import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../../config";

// ============================================================
// FacultyReviewAdmin.jsx — v3 (Full Fix)
//
// KEY FIXES:
//  • Teachers fetched from real API (GET /api/admin/teachers)
//  • Add / Edit / Delete teacher fully wired
//  • Assign wizard uses real teachers from DB
//  • Batches fetched from real API
//  • All mock data removed
// ============================================================

const STAR_COLORS   = ["#ef4444","#f97316","#f59e0b","#84cc16","#22c55e"];
const PALETTE       = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];
const batchLabel    = b => b?.batchName || b?.name || "Unnamed Batch";
const batchSubLabel = b => `${b?.year||""}${b?.academicYear ? ` · AY ${b.academicYear}` : ""}`;

// ── Tiny reusable bits ────────────────────────────────────
const Stars = ({ rating, size=14 }) => (
  <span style={{ display:"inline-flex", gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <i key={i} className={`fa-${i<=rating?"solid":"regular"} fa-star`}
         style={{ fontSize:size, color: i<=rating ? "#f59e0b" : "#e2e8f0" }} />
    ))}
  </span>
);

const Av = ({ name="?", idx=0, size=38, radius }) => (
  <div style={{
    width:size, height:size,
    borderRadius: radius ?? Math.round(size*0.28),
    background: PALETTE[idx%PALETTE.length]+"22",
    color: PALETTE[idx%PALETTE.length],
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize: Math.round(size*0.42), fontWeight:700, flexShrink:0,
  }}>{(name||"?").charAt(0).toUpperCase()}</div>
);

const Pill = ({ label, color="#64748b", bg="#f1f5f9" }) => (
  <span style={{ display:"inline-flex", padding:"3px 10px", background:bg,
                 color, borderRadius:8, fontSize:12, fontWeight:600 }}>
    {label}
  </span>
);

const Card = ({ children, style={} }) => (
  <div style={{
    background:"#fff", border:"1px solid #e2e8f0", borderRadius:18,
    padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", ...style,
  }}>{children}</div>
);

const SectionHead = ({ icon, title, right }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                paddingBottom:14, marginBottom:18, borderBottom:"1px solid #f1f5f9" }}>
    <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#0f172a",
                 display:"flex", alignItems:"center", gap:8 }}>
      <i className={`fa-solid ${icon}`} style={{ color:"#6366f1" }} />{title}
    </h3>
    {right}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type="text", required }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#334155",
                    textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>
      {label}{required && <span style={{ color:"#ef4444", marginLeft:3 }}>*</span>}
    </label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:"100%", padding:"10px 14px", border:"2px solid #e2e8f0",
               borderRadius:10, fontSize:14, fontFamily:"inherit", outline:"none",
               boxSizing:"border-box", transition:"border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor="#6366f1"}
      onBlur={e => e.target.style.borderColor="#e2e8f0"}
    />
  </div>
);

// ══════════════════════════════════════════════════════════
const FacultyReviewAdmin = ({ collegeName }) => {
  const [tab, setTab]           = useState("overview");
  const [teachers, setTeachers] = useState([]);
  const [batches,  setBatches]  = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [campaigns,setCampaigns]= useState([]);
  const [loading,  setLoading]  = useState(true);
  const [drillTeacher, setDrillTeacher] = useState(null);
  const [toast, setToast]       = useState({ msg:"", type:"success" });

  // teacher modal
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher,   setEditingTeacher]   = useState(null);
  const [tForm, setTForm] = useState({ name:"", email:"", dept:"", subjects:"" });
  const [tSaving, setTSaving] = useState(false);

  // assign wizard
  const [step,       setStep]       = useState(1);
  const [pickBatch,  setPickBatch]  = useState(null);
  const [pickIds,    setPickIds]    = useState([]);
  const [assigning,  setAssigning]  = useState(false);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 4500);
  };

  const timeAgo = d => {
    const s = Math.floor((Date.now()-new Date(d))/1000);
    if (s<3600)  return `${Math.floor(s/60)}m ago`;
    if (s<86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  const teacherStats = id => {
    const rs = reviews.filter(r => r.teacherId === id);
    if (!rs.length) return { avg:0, count:0, dist:[0,0,0,0,0] };
    const avg = rs.reduce((a,r) => a + (r.overallRating || r.rating || 0), 0) / rs.length;
    return { avg:avg.toFixed(1), count:rs.length,
             dist:[1,2,3,4,5].map(s => rs.filter(r => (r.overallRating||r.rating)===s).length) };
  };

  const ratingColor = n => {
    const v = parseFloat(n);
    return v>=4?"#22c55e":v>=3?"#f59e0b":v>0?"#ef4444":"#cbd5e1";
  };

  useEffect(() => { loadAll(); }, [collegeName]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [tR, bR, rR, cR] = await Promise.allSettled([
        axios.get(`${API_URL}/api/admin/teachers?college=${collegeName}`),
        axios.get(`${API_URL}/api/admin/batches-with-teachers?college=${collegeName}`),
        axios.get(`${API_URL}/api/admin/reviews?college=${collegeName}`),
        axios.get(`${API_URL}/api/admin/review-campaigns?college=${collegeName}`),
      ]);
      if (tR.status==="fulfilled") setTeachers(tR.value.data?.teachers || []);
      if (bR.status==="fulfilled") setBatches(bR.value.data?.batches  || []);
      if (rR.status==="fulfilled") setReviews(rR.value.data?.reviews  || []);
      if (cR.status==="fulfilled") setCampaigns(cR.value.data?.campaigns || []);
    } catch {}
    setLoading(false);
  };

  // ── Teacher CRUD ─────────────────────────────────────────
  const openAddTeacher = () => {
    setEditingTeacher(null);
    setTForm({ name:"", email:"", dept:"", subjects:"" });
    setShowTeacherModal(true);
  };

  const openEditTeacher = (t, e) => {
    e.stopPropagation();
    setEditingTeacher(t);
    setTForm({ name:t.name||"", email:t.email||"", dept:t.dept||t.department||"",
               subjects: Array.isArray(t.subjects) ? t.subjects.join(", ") : (t.subjects||"") });
    setShowTeacherModal(true);
  };

  const saveTeacher = async () => {
    if (!tForm.name.trim() || !tForm.email.trim()) {
      showToast("Name and email are required.", "error"); return;
    }
    setTSaving(true);
    const payload = {
      name:    tForm.name.trim(),
      email:   tForm.email.trim(),
      dept:    tForm.dept.trim(),
      subjects: tForm.subjects.split(",").map(s=>s.trim()).filter(Boolean),
      college: collegeName,
    };
    try {
      if (editingTeacher) {
        await axios.put(`${API_URL}/api/admin/teachers/${editingTeacher._id}`, payload);
        setTeachers(prev => prev.map(t => t._id===editingTeacher._id ? { ...t, ...payload } : t));
        showToast(`✅ ${payload.name} updated successfully`);
      } else {
        const res = await axios.post("${API_URL}/api/admin/teachers", payload);
        setTeachers(prev => [...prev, res.data.teacher]);
        showToast(`✅ ${payload.name} added successfully`);
      }
      setShowTeacherModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save teacher.", "error");
    }
    setTSaving(false);
  };

  const deleteTeacher = async (t, e) => {
    e.stopPropagation();
    if (!window.confirm(`Remove ${t.name} from the system?`)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/teachers/${t._id}?college=${collegeName}`);
      setTeachers(prev => prev.filter(x => x._id !== t._id));
      showToast(`🗑️ ${t.name} removed`);
    } catch {
      showToast("Failed to delete teacher.", "error");
    }
  };

  // ── Assign wizard ─────────────────────────────────────────
  const doAssign = async () => {
    if (!pickBatch || !pickIds.length) return;
    setAssigning(true);
    try {
      await axios.post("${API_URL}/api/admin/assign-teachers",
        { batchId:pickBatch._id, teacherIds:pickIds, college:collegeName });
    } catch {}
    setBatches(prev => prev.map(b =>
      b._id===pickBatch._id
        ? { ...b, assignedTeachers:[...new Set([...(b.assignedTeachers||[]),...pickIds])] }
        : b
    ));
    setAssigning(false); setStep(1); setPickBatch(null); setPickIds([]);
    showToast(`✅ ${pickIds.length} teacher${pickIds.length>1?"s":""} assigned to ${batchLabel(pickBatch)}`);
  };

  const closeCampaign = async id => {
    if (!window.confirm("Close this campaign?")) return;
    try { await axios.patch(`${API_URL}/api/admin/review-campaigns/${id}/close`); } catch {}
    setCampaigns(prev => prev.map(c => c._id===id ? {...c,status:"closed"} : c));
  };

  const totalReviews   = reviews.length;
  const avgRating      = totalReviews
    ? (reviews.reduce((s,r) => s+(r.overallRating||r.rating||0),0)/totalReviews).toFixed(1) : "—";
  const activeCampsCnt = campaigns.filter(c => c.status==="active").length;

  const validBatches = batches.filter(b => batchLabel(b) !== "Unnamed Batch");

  if (loading) return (
    <div style={{ textAlign:"center", padding:80, color:"#94a3b8" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:32, display:"block", marginBottom:14 }} />
      Loading Faculty Reviews…
    </div>
  );

  return (
    <div style={{ animation:"fadeInUp 0.4s ease" }}>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                    marginBottom:26, flexWrap:"wrap", gap:14 }}>
        <div>
          <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:800, color:"#0f172a",
                       letterSpacing:"-0.02em", display:"flex", alignItems:"center", gap:10 }}>
            <i className="fa-solid fa-star-half-stroke" style={{ color:"#f59e0b" }} />
            Faculty Reviews
          </h1>
          <p style={{ margin:0, fontSize:13, color:"#64748b" }}>
            Manage teachers, assign to batches, and track review campaigns
          </p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[
            { k:"overview",  icon:"fa-chart-pie",          l:"Overview" },
            { k:"teachers",  icon:"fa-chalkboard-user",    l:"Teachers" },
            { k:"assign",    icon:"fa-user-plus",          l:"Assign" },
            { k:"campaigns", icon:"fa-bullhorn",           l:"Campaigns" },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              display:"flex", alignItems:"center", gap:7, padding:"9px 16px",
              border: tab===t.k ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
              borderRadius:10, background: tab===t.k ? "#eef2ff" : "#fff",
              color: tab===t.k ? "#6366f1" : "#64748b",
              fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s",
            }}>
              <i className={`fa-solid ${t.icon}`} />{t.l}
              {t.k==="campaigns" && activeCampsCnt>0 && (
                <span style={{ background:"#ef4444", color:"white", fontSize:10,
                               fontWeight:700, padding:"1px 6px", borderRadius:10 }}>
                  {activeCampsCnt}
                </span>
              )}
              {t.k==="teachers" && teachers.length>0 && (
                <span style={{ background:"#eef2ff", color:"#6366f1", fontSize:10,
                               fontWeight:700, padding:"1px 6px", borderRadius:10 }}>
                  {teachers.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast.msg && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 18px",
                      background: toast.type==="error" ? "#fef2f2" : "#f0fdf4",
                      border:`1px solid ${toast.type==="error"?"#fecaca":"#bbf7d0"}`,
                      borderRadius:12, marginBottom:18, fontSize:14, fontWeight:600,
                      color: toast.type==="error" ? "#dc2626" : "#15803d",
                      animation:"slideDown 0.35s ease" }}>
          <i className={`fa-solid fa-${toast.type==="error"?"circle-xmark":"circle-check"}`} />
          {toast.msg}
          <button onClick={() => setToast({ msg:"" })} style={{ marginLeft:"auto", background:"none",
            border:"none", cursor:"pointer", fontSize:16, color:"inherit" }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
           OVERVIEW
         ══════════════════════════════════════ */}
      {tab==="overview" && (
        <div style={{ animation:"fadeInUp 0.3s ease" }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              { icon:"fa-chalkboard-user", c:"#6366f1", v:teachers.length,  l:"Teachers"         },
              { icon:"fa-star",            c:"#f59e0b", v:avgRating,         l:"Avg Rating"       },
              { icon:"fa-comments",        c:"#10b981", v:totalReviews,      l:"Total Reviews"    },
              { icon:"fa-bullhorn",        c:"#ef4444", v:activeCampsCnt,    l:"Active Campaigns" },
            ].map((s,i) => (
              <Card key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 20px" }}>
                <div style={{ width:46, height:46, borderRadius:13, background:s.c+"18",
                              color:s.c, display:"flex", alignItems:"center",
                              justifyContent:"center", fontSize:20, flexShrink:0 }}>
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize:28, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8",
                                textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s.l}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Leaderboard */}
          <Card style={{ marginBottom:20 }}>
            <SectionHead icon="fa-ranking-star" title="Teacher Performance Leaderboard"
              right={
                <button onClick={() => setTab("teachers")} style={{
                  display:"flex", alignItems:"center", gap:6, background:"none",
                  border:"none", color:"#6366f1", fontSize:13, fontWeight:700,
                  cursor:"pointer", padding:"5px 10px", borderRadius:8,
                }}>
                  <i className="fa-solid fa-user-plus" /> Manage Teachers
                </button>
              }
            />
            {teachers.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }}>
                <i className="fa-solid fa-chalkboard-user" style={{ fontSize:36, display:"block",
                                                                     marginBottom:12, opacity:0.35 }} />
                <p style={{ margin:0, fontSize:15, fontWeight:600 }}>No teachers added yet</p>
                <button onClick={() => setTab("teachers")}
                  style={{ marginTop:14, padding:"9px 20px", background:"#6366f1", color:"white",
                           border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  <i className="fa-solid fa-plus" style={{ marginRight:6 }} /> Add First Teacher
                </button>
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                    {["#","Teacher","Department","Avg Rating","Reviews","Performance",""].map((h,i) => (
                      <th key={i} style={{ padding:"10px 14px", fontSize:11, fontWeight:700,
                                           textTransform:"uppercase", letterSpacing:"0.06em",
                                           color:"#64748b", textAlign:"left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...teachers]
                    .sort((a,b) => parseFloat(teacherStats(b._id).avg) - parseFloat(teacherStats(a._id).avg))
                    .map((t,i) => {
                      const s = teacherStats(t._id), c = ratingColor(s.avg);
                      return (
                        <tr key={t._id}
                          onClick={() => { setDrillTeacher(t); setTab("drill"); }}
                          style={{ cursor:"pointer", borderBottom:"1px solid #f1f5f9", transition:"background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                          onMouseLeave={e => e.currentTarget.style.background=""}>
                          <td style={{ padding:"13px 14px" }}>
                            <span style={{ width:26, height:26, background:"#f1f5f9", color:"#64748b",
                                           borderRadius:"50%", display:"inline-flex",
                                           alignItems:"center", justifyContent:"center",
                                           fontSize:11, fontWeight:700 }}>{i+1}</span>
                          </td>
                          <td style={{ padding:"13px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              <Av name={t.name} idx={i} />
                              <div>
                                <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{t.name}</div>
                                <div style={{ fontSize:12, color:"#94a3b8" }}>{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"13px 14px" }}><Pill label={t.dept || t.department || "—"} /></td>
                          <td style={{ padding:"13px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontSize:20, fontWeight:800, color:c, lineHeight:1 }}>
                                {s.count>0 ? s.avg : "—"}
                              </span>
                              {s.count>0 && <Stars rating={Math.round(parseFloat(s.avg))} />}
                            </div>
                          </td>
                          <td style={{ padding:"13px 14px" }}>
                            <Pill label={s.count} bg="#eef2ff" color="#6366f1" />
                          </td>
                          <td style={{ padding:"13px 14px", width:120 }}>
                            <div style={{ width:100, height:8, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
                              <div style={{ height:"100%", borderRadius:10, background:c,
                                            width: s.count>0 ? `${(parseFloat(s.avg)/5)*100}%` : "0%",
                                            transition:"width 0.8s ease" }} />
                            </div>
                          </td>
                          <td style={{ padding:"13px 14px", color:"#cbd5e1" }}>
                            <i className="fa-solid fa-chevron-right" />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </Card>

          {/* Recent reviews */}
          {reviews.length > 0 ? (
            <Card>
              <SectionHead icon="fa-comments" title="Recent Student Feedback" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:12 }}>
                {reviews.slice(0,6).map(r => (
                  <div key={r._id} style={{ border:"1px solid #e2e8f0", borderRadius:14, padding:"15px 17px", transition:"all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{r.teacherName}</div>
                        <div style={{ fontSize:12, color:"#94a3b8" }}>{r.batchName}</div>
                      </div>
                      <Stars rating={r.overallRating || r.rating} />
                    </div>
                    {r.comment && (
                      <p style={{ fontSize:13, color:"#475569", fontStyle:"italic", lineHeight:1.6,
                                  margin:"8px 0", overflow:"hidden", display:"-webkit-box",
                                  WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        "{r.comment}"
                      </p>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8",
                                  paddingTop:8, borderTop:"1px solid #f1f5f9" }}>
                      <span><i className="fa-solid fa-user-graduate" style={{ marginRight:5 }} />
                        {r.anonymous ? "Anonymous" : (r.studentName || "Anonymous")}</span>
                      <span>{timeAgo(r.createdAt || r.submittedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div style={{ background:"#fff", border:"2px dashed #e2e8f0", borderRadius:18,
                          padding:"60px 24px", textAlign:"center", color:"#94a3b8" }}>
              <i className="fa-solid fa-comments" style={{ fontSize:38, display:"block", marginBottom:14, opacity:0.35 }} />
              <h4 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"#475569" }}>No Reviews Yet</h4>
              <p style={{ margin:"0 0 18px", fontSize:14 }}>
                Post review campaigns from <strong>University → Department → Batch → Post Review</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
           TEACHERS TAB — Add / Edit / Delete
         ══════════════════════════════════════ */}
      {tab==="teachers" && (
        <div style={{ animation:"fadeInUp 0.3s ease" }}>
          <Card>
            <SectionHead icon="fa-chalkboard-user" title={`Teachers (${teachers.length})`}
              right={
                <button onClick={openAddTeacher} style={{
                  display:"flex", alignItems:"center", gap:7, padding:"9px 18px",
                  background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"white",
                  border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer",
                  transition:"all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform=""}>
                  <i className="fa-solid fa-plus" /> Add Teacher
                </button>
              }
            />

            {teachers.length === 0 ? (
              <div style={{ textAlign:"center", padding:"50px 20px", color:"#94a3b8" }}>
                <i className="fa-solid fa-user-plus" style={{ fontSize:40, display:"block", marginBottom:14, opacity:0.3 }} />
                <h4 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:"#475569" }}>No Teachers Yet</h4>
                <p style={{ margin:"0 0 18px", fontSize:14 }}>Add teachers so they can be assigned to batches and reviewed by students.</p>
                <button onClick={openAddTeacher}
                  style={{ padding:"10px 24px", background:"#6366f1", color:"white",
                           border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  Add First Teacher
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {teachers.map((t, i) => {
                  const s = teacherStats(t._id);
                  const c = ratingColor(s.avg);
                  const subjectsList = Array.isArray(t.subjects) ? t.subjects : [];
                  return (
                    <div key={t._id}
                      style={{ border:"1.5px solid #e2e8f0", borderRadius:16, padding:18,
                               transition:"all 0.2s", cursor:"pointer", position:"relative" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor="#a5b4fc"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(99,102,241,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
                      onClick={() => { setDrillTeacher(t); setTab("drill"); }}>
                      {/* action buttons */}
                      <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:6 }}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={e => openEditTeacher(t, e)}
                          style={{ width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0",
                                   background:"white", cursor:"pointer", color:"#6366f1",
                                   display:"flex", alignItems:"center", justifyContent:"center",
                                   fontSize:13, transition:"all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#eef2ff"; e.currentTarget.style.borderColor="#a5b4fc"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="white"; e.currentTarget.style.borderColor="#e2e8f0"; }}
                          title="Edit teacher">
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button onClick={e => deleteTeacher(t, e)}
                          style={{ width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0",
                                   background:"white", cursor:"pointer", color:"#94a3b8",
                                   display:"flex", alignItems:"center", justifyContent:"center",
                                   fontSize:13, transition:"all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#ef4444"; e.currentTarget.style.borderColor="#fecaca"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="white"; e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.borderColor="#e2e8f0"; }}
                          title="Delete teacher">
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, paddingRight:70 }}>
                        <Av name={t.name} idx={i} size={48} />
                        <div>
                          <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>{t.name}</div>
                          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{t.email}</div>
                        </div>
                      </div>

                      {(t.dept || t.department) && (
                        <div style={{ marginBottom:10 }}>
                          <Pill label={t.dept || t.department} />
                        </div>
                      )}

                      {subjectsList.length > 0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                          {subjectsList.slice(0,3).map((sub, si) => (
                            <span key={si} style={{ padding:"2px 8px", background:"#f1f5f9",
                                                     color:"#475569", borderRadius:6, fontSize:11, fontWeight:600 }}>
                              {sub}
                            </span>
                          ))}
                          {subjectsList.length > 3 && (
                            <span style={{ padding:"2px 8px", background:"#f1f5f9", color:"#94a3b8",
                                           borderRadius:6, fontSize:11, fontWeight:600 }}>
                              +{subjectsList.length-3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                                    paddingTop:12, borderTop:"1px solid #f1f5f9" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:18, fontWeight:800, color:c }}>{s.count>0 ? s.avg : "—"}</span>
                          {s.count > 0 && <Stars rating={Math.round(parseFloat(s.avg))} size={12} />}
                        </div>
                        <span style={{ fontSize:12, color:"#94a3b8" }}>{s.count} review{s.count!==1?"s":""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════
           ASSIGN TEACHERS (3-step wizard)
         ══════════════════════════════════════ */}
      {tab==="assign" && (
        <div style={{ animation:"fadeInUp 0.3s ease" }}>
          {/* Step progress */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:28 }}>
            {[["1","Pick Batch"],["2","Pick Teachers"],["3","Confirm"]].map(([n,l],i) => (
              <React.Fragment key={n}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%",
                                background: step>i+1?"#22c55e":step===i+1?"#6366f1":"#f1f5f9",
                                color: step>=i+1?"white":"#94a3b8",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:13, fontWeight:700, transition:"all 0.3s",
                                boxShadow: step===i+1?"0 0 0 5px #eef2ff":"none" }}>
                    {step>i+1 ? <i className="fa-solid fa-check" style={{ fontSize:12 }}/> : n}
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase",
                                 letterSpacing:"0.06em", whiteSpace:"nowrap",
                                 color: step>=i+1?"#0f172a":"#94a3b8" }}>{l}</span>
                </div>
                {i<2 && <div style={{ width:72, height:2, margin:"0 6px", marginBottom:22,
                                       background:step>i+1?"#22c55e":"#e2e8f0", transition:"background 0.3s" }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <Card>
              {/* ── Step 1: Pick batch ── */}
              {step===1 && (
                <div style={{ animation:"fadeInUp 0.25s ease" }}>
                  <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
                    <i className="fa-solid fa-layer-group" style={{ color:"#6366f1" }} /> Select a Batch
                  </h3>
                  <p style={{ margin:"0 0 18px", fontSize:13, color:"#64748b" }}>Choose which batch to assign teachers to.</p>

                  {validBatches.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"30px 20px", background:"#f8fafc",
                                  borderRadius:12, color:"#94a3b8" }}>
                      <i className="fa-solid fa-layer-group" style={{ fontSize:28, display:"block", marginBottom:10, opacity:0.35 }} />
                      <p style={{ margin:0, fontSize:14 }}>No batches found. Create batches from the faculty dashboard first.</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                      {validBatches.map((b, bi) => {
                        const sel = pickBatch?._id === b._id;
                        const c   = PALETTE[bi%PALETTE.length];
                        const assignedCount = teachers.filter(t => b.assignedTeachers?.includes(t._id)).length;
                        return (
                          <div key={b._id} onClick={() => setPickBatch(b)}
                            style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                                     border: sel ? `2px solid #6366f1` : "2px solid #e2e8f0",
                                     borderRadius:14, cursor:"pointer", transition:"all 0.2s",
                                     background: sel ? "#f0f1ff" : "#fafafa" }}
                            onMouseEnter={e => !sel && (e.currentTarget.style.borderColor="#a5b4fc")}
                            onMouseLeave={e => !sel && (e.currentTarget.style.borderColor="#e2e8f0")}>
                            <div style={{ minWidth:54, padding:"6px 10px", background:c+"18", color:c,
                                          borderRadius:10, fontSize:12, fontWeight:800, textAlign:"center", lineHeight:1.3 }}>
                              <div>{batchLabel(b)}</div>
                              {b.year && <div style={{ fontSize:10, opacity:0.7 }}>{b.year}</div>}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>{batchLabel(b)}</div>
                              <div style={{ fontSize:12, color:"#94a3b8" }}>{b.course||b.department} · AY {b.academicYear}</div>
                              <div style={{ fontSize:12, marginTop:3, color: assignedCount>0?"#16a34a":"#94a3b8" }}>
                                {assignedCount>0
                                  ? <><i className="fa-solid fa-circle-check" style={{ marginRight:4 }} />{assignedCount} teacher{assignedCount>1?"s":""} assigned</>
                                  : <><i className="fa-regular fa-circle" style={{ marginRight:4 }} />No teachers yet</>}
                              </div>
                            </div>
                            {sel && <i className="fa-solid fa-circle-check" style={{ color:"#6366f1", fontSize:20, flexShrink:0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={() => pickBatch && setStep(2)} disabled={!pickBatch}
                    style={{ width:"100%", padding:"12px", border:"none", borderRadius:12,
                             fontSize:14, fontWeight:700, cursor:pickBatch?"pointer":"not-allowed",
                             display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                             background:pickBatch?"linear-gradient(135deg,#6366f1,#4f46e5)":"#f1f5f9",
                             color:pickBatch?"white":"#94a3b8", transition:"all 0.2s" }}>
                    Continue <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
              )}

              {/* ── Step 2: Pick teachers ── */}
              {step===2 && (
                <div style={{ animation:"fadeInUp 0.25s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <button onClick={() => setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6366f1", fontSize:15, padding:0 }}>
                      <i className="fa-solid fa-arrow-left" />
                    </button>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
                      <i className="fa-solid fa-chalkboard-user" style={{ color:"#6366f1" }} /> Choose Teachers
                    </h3>
                  </div>
                  <p style={{ margin:"0 0 14px", fontSize:13, color:"#64748b" }}>
                    For: <strong style={{ color:"#0f172a" }}>{batchLabel(pickBatch)}</strong>
                  </p>

                  {teachers.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"30px 20px", background:"#fffbeb",
                                  border:"1px solid #fde68a", borderRadius:12, color:"#92400e", marginBottom:16 }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize:24, display:"block", marginBottom:8 }} />
                      <p style={{ margin:"0 0 10px", fontSize:14 }}>No teachers in the system yet.</p>
                      <button onClick={() => setTab("teachers")}
                        style={{ padding:"8px 18px", background:"#f59e0b", color:"white",
                                 border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                        Add Teachers First
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                        <button onClick={() => setPickIds(teachers.map(t => t._id))}
                          style={{ fontSize:12, fontWeight:700, color:"#6366f1", background:"#eef2ff",
                                   border:"none", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>
                          Select All
                        </button>
                        <button onClick={() => setPickIds([])}
                          style={{ fontSize:12, fontWeight:700, color:"#64748b", background:"#f1f5f9",
                                   border:"none", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>
                          Clear
                        </button>
                        {pickIds.length>0 && (
                          <span style={{ fontSize:12, color:"#6366f1", fontWeight:700, alignSelf:"center" }}>
                            {pickIds.length} selected
                          </span>
                        )}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:260, overflowY:"auto", marginBottom:16 }}>
                        {teachers.map((t, ti) => {
                          const sel     = pickIds.includes(t._id);
                          const already = pickBatch?.assignedTeachers?.includes(t._id);
                          return (
                            <div key={t._id}
                              onClick={() => setPickIds(prev => sel ? prev.filter(x=>x!==t._id) : [...prev,t._id])}
                              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 13px",
                                       border: sel ? "2px solid #6366f1" : "2px solid #e2e8f0",
                                       borderRadius:12, cursor:"pointer", transition:"all 0.18s",
                                       background:sel?"#eef2ff":already?"#f0fdf4":"#fafafa" }}>
                              <Av name={t.name} idx={ti} size={40} />
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", display:"flex", alignItems:"center", gap:6 }}>
                                  {t.name}
                                  {already && (
                                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px",
                                                   background:"#dcfce7", color:"#16a34a", borderRadius:6 }}>
                                      Assigned
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize:12, color:"#94a3b8" }}>
                                  {t.dept || t.department}{t.subjects?.length ? ` · ${t.subjects.slice(0,2).join(", ")}` : ""}
                                </div>
                              </div>
                              <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                                            border:sel?"2px solid #6366f1":"2px solid #e2e8f0",
                                            background:sel?"#6366f1":"white",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                            transition:"all 0.18s" }}>
                                {sel && <i className="fa-solid fa-check" style={{ fontSize:10, color:"white" }} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <button onClick={() => pickIds.length && setStep(3)} disabled={!pickIds.length}
                    style={{ width:"100%", padding:"12px", border:"none", borderRadius:12, fontSize:14, fontWeight:700,
                             cursor:pickIds.length?"pointer":"not-allowed", display:"flex", alignItems:"center",
                             justifyContent:"center", gap:8,
                             background:pickIds.length?"linear-gradient(135deg,#6366f1,#4f46e5)":"#f1f5f9",
                             color:pickIds.length?"white":"#94a3b8", transition:"all 0.2s" }}>
                    Review Assignment <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
              )}

              {/* ── Step 3: Confirm ── */}
              {step===3 && (
                <div style={{ animation:"fadeInUp 0.25s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <button onClick={() => setStep(2)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6366f1", fontSize:15, padding:0 }}>
                      <i className="fa-solid fa-arrow-left" />
                    </button>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Confirm Assignment</h3>
                  </div>
                  <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:18, margin:"14px 0 16px" }}>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#64748b", marginBottom:12 }}>
                      Assignment Summary
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:14, borderBottom:"1px solid #e2e8f0" }}>
                      <i className="fa-solid fa-layer-group" style={{ color:"#6366f1", fontSize:16 }} />
                      <div>
                        <div style={{ fontSize:12, color:"#64748b" }}>Target Batch</div>
                        <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>
                          {batchLabel(pickBatch)} · {batchSubLabel(pickBatch)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:"#64748b", marginBottom:10 }}>Teachers ({pickIds.length})</div>
                    {teachers.filter(t => pickIds.includes(t._id)).map((t, ti) => (
                      <div key={t._id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0",
                                                 borderBottom:ti<pickIds.length-1?"1px solid #f1f5f9":"none" }}>
                        <Av name={t.name} idx={teachers.indexOf(t)} size={32} />
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{t.name}</div>
                          <div style={{ fontSize:11, color:"#94a3b8" }}>{t.dept || t.department}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={doAssign} disabled={assigning}
                    style={{ width:"100%", padding:"13px", border:"none", borderRadius:12, fontSize:14, fontWeight:700,
                             cursor:assigning?"not-allowed":"pointer", display:"flex", alignItems:"center",
                             justifyContent:"center", gap:8,
                             background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"white",
                             opacity:assigning?0.7:1, transition:"all 0.2s" }}>
                    {assigning
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Assigning…</>
                      : <><i className="fa-solid fa-check" /> Confirm & Assign {pickIds.length} Teacher{pickIds.length>1?"s":""}</>}
                  </button>
                </div>
              )}
            </Card>

            {/* Right: Current assignments */}
            <Card>
              <SectionHead icon="fa-layer-group" title="Current Assignments" />
              {validBatches.length === 0 ? (
                <div style={{ textAlign:"center", padding:"30px 20px", color:"#94a3b8" }}>
                  <p style={{ margin:0, fontSize:14 }}>No batches available.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {validBatches.map((b, bi) => {
                    const c = PALETTE[bi%PALETTE.length];
                    const asgnd  = teachers.filter(t => b.assignedTeachers?.includes(t._id));
                    const isHigh = pickBatch?._id===b._id && step>1;
                    return (
                      <div key={b._id} style={{
                        border: isHigh ? `2px solid ${c}` : "1.5px solid #e2e8f0",
                        borderRadius:14, overflow:"hidden", transition:"all 0.25s",
                        boxShadow: isHigh ? `0 0 0 3px ${c}22` : "none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                                      background:"#fafafa", borderBottom:asgnd.length?"1px solid #f1f5f9":"none" }}>
                          <div style={{ minWidth:54, padding:"6px 10px", background:c+"18", color:c,
                                        borderRadius:10, fontSize:12, fontWeight:800, textAlign:"center", lineHeight:1.3 }}>
                            <div>{batchLabel(b)}</div>
                            {b.year && <div style={{ fontSize:10, opacity:0.7 }}>{b.year}</div>}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{b.course||b.department}</div>
                            <div style={{ fontSize:11, color:"#94a3b8" }}>AY {b.academicYear}</div>
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:8,
                                          background:asgnd.length?"#dcfce7":"#f1f5f9",
                                          color:asgnd.length?"#16a34a":"#94a3b8" }}>
                            {asgnd.length} teacher{asgnd.length!==1?"s":""}
                          </span>
                        </div>
                        {asgnd.length>0 && (
                          <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:6 }}>
                            {asgnd.map(t => (
                              <div key={t._id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <Av name={t.name} idx={teachers.indexOf(t)} size={28} />
                                <div>
                                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{t.name}</div>
                                  <div style={{ fontSize:11, color:"#94a3b8" }}>{t.dept || t.department}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
           CAMPAIGNS
         ══════════════════════════════════════ */}
      {tab==="campaigns" && (
        <div style={{ animation:"fadeInUp 0.3s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
            <div>
              <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:700, color:"#0f172a" }}>Review Campaigns</h3>
              <p style={{ margin:0, fontSize:13, color:"#64748b" }}>
                Campaigns are posted from <strong>University → Department → Batch → Post Review</strong>
              </p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ padding:"7px 14px", background:"#f0fdf4", color:"#16a34a",
                             borderRadius:10, fontSize:13, fontWeight:700, border:"1px solid #bbf7d0" }}>
                <i className="fa-solid fa-circle" style={{ fontSize:8, marginRight:6 }} />
                {activeCampsCnt} Active
              </span>
              <span style={{ padding:"7px 14px", background:"#f1f5f9", color:"#64748b",
                             borderRadius:10, fontSize:13, fontWeight:700 }}>
                {campaigns.filter(c=>c.status==="closed").length} Closed
              </span>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div style={{ background:"#fff", border:"2px dashed #e2e8f0", borderRadius:18, padding:"70px 24px", textAlign:"center" }}>
              <div style={{ width:70, height:70, background:"#fef3c7", border:"2px solid #fde68a",
                            borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:28, color:"#f59e0b", margin:"0 auto 18px" }}>
                <i className="fa-solid fa-bullhorn" />
              </div>
              <h4 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:"#0f172a" }}>No Campaigns Yet</h4>
              <p style={{ margin:0, fontSize:14, color:"#64748b" }}>
                Go to <strong>University → Department → Batch</strong> and click{" "}
                <strong style={{ color:"#d97706" }}>"Post Review"</strong>
              </p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
              {campaigns.map(c => (
                <div key={c._id} style={{
                  background:"#fff", borderRadius:18, padding:20,
                  border:`2px solid ${c.status==="active"?"#e2e8f0":"#f1f5f9"}`,
                  opacity:c.status==="closed"?0.6:1, transition:"all 0.2s",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
                  onMouseEnter={e => c.status==="active"&&(e.currentTarget.style.transform="translateY(-3px)",e.currentTarget.style.boxShadow="0 8px 20px rgba(0,0,0,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform="",e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)")}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6,
                                   padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700,
                                   background:c.status==="active"?"#f0fdf4":"#f1f5f9",
                                   color:c.status==="active"?"#16a34a":"#94a3b8" }}>
                      <i className={`fa-solid fa-${c.status==="active"?"circle":"circle-xmark"}`}
                         style={{ fontSize:c.status==="active"?7:12 }} />
                      {c.status==="active"?"Live":"Closed"}
                    </span>
                    {c.status==="active" && (
                      <button onClick={() => closeCampaign(c._id)}
                        style={{ width:28, height:28, borderRadius:8, border:"1px solid #e2e8f0",
                                 background:"#f8fafc", cursor:"pointer", color:"#94a3b8",
                                 display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color="#94a3b8"; }}
                        title="Close campaign">
                        <i className="fa-solid fa-xmark" style={{ fontSize:13 }} />
                      </button>
                    )}
                  </div>
                  <h4 style={{ margin:"0 0 10px", fontSize:15, fontWeight:700, color:"#0f172a", lineHeight:1.35 }}>{c.title}</h4>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, fontSize:13, color:"#64748b", marginBottom:14 }}>
                    <span><i className="fa-solid fa-user-tie" style={{ marginRight:7, color:"#6366f1", width:14 }} />{c.teacherName}</span>
                    <span><i className="fa-solid fa-layer-group" style={{ marginRight:7, color:"#6366f1", width:14 }} />{c.batchName}</span>
                    {c.deadline && (
                      <span><i className="fa-solid fa-calendar-xmark" style={{ marginRight:7, color:"#f59e0b", width:14 }} />
                        Due {new Date(c.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8",
                                paddingTop:12, borderTop:"1px solid #f1f5f9" }}>
                    <span style={{ color:"#6366f1", fontWeight:600 }}>
                      <i className="fa-solid fa-comments" style={{ marginRight:5 }} />
                      {c.responses || 0} responses
                    </span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
           TEACHER DRILLDOWN
         ══════════════════════════════════════ */}
      {tab==="drill" && drillTeacher && (() => {
        const tr = reviews.filter(r => r.teacherId === drillTeacher._id);
        const s  = teacherStats(drillTeacher._id);
        const c  = ratingColor(s.avg);
        return (
          <div style={{ animation:"fadeInUp 0.3s ease" }}>
            <button onClick={() => setTab("overview")}
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"none", border:"none",
                       color:"#6366f1", fontSize:14, fontWeight:700, cursor:"pointer", padding:0, marginBottom:18 }}>
              <i className="fa-solid fa-arrow-left" /> Back to Overview
            </button>
            <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:20,
                          padding:"28px 32px", color:"white", display:"flex", alignItems:"flex-start",
                          gap:20, marginBottom:20 }}>
              <div style={{ width:68, height:68, borderRadius:18, background:"rgba(255,255,255,0.15)",
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, flexShrink:0 }}>
                {drillTeacher.name.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800 }}>{drillTeacher.name}</h2>
                <p style={{ margin:"0 0 10px", fontSize:13, opacity:0.75 }}>
                  {drillTeacher.dept || drillTeacher.department} · {drillTeacher.email}
                </p>
                {drillTeacher.subjects?.length>0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {drillTeacher.subjects.map((sub,i) => (
                      <span key={i} style={{ padding:"3px 10px", background:"rgba(255,255,255,0.15)", borderRadius:8, fontSize:12, fontWeight:600 }}>{sub}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:52, fontWeight:800, color:c, lineHeight:1 }}>{s.count>0?s.avg:"—"}</div>
                <Stars rating={Math.round(parseFloat(s.avg))} size={18} />
                <div style={{ fontSize:12, opacity:0.65, marginTop:5 }}>{s.count} reviews</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              <Card>
                <h4 style={{ margin:"0 0 16px", fontSize:15, fontWeight:700 }}>Rating Distribution</h4>
                {[5,4,3,2,1].map(star => (
                  <div key={star} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#475569", width:32, textAlign:"right" }}>
                      {star} <i className="fa-solid fa-star" style={{ color:"#f59e0b", fontSize:10 }} />
                    </span>
                    <div style={{ flex:1, height:10, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:10, background:STAR_COLORS[star-1],
                                    width:s.count>0?`${(s.dist[star-1]/s.count)*100}%`:"0%",
                                    transition:"width 1s ease" }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:"#334155", width:20 }}>{s.dist[star-1]}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <h4 style={{ margin:"0 0 16px", fontSize:15, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
                  <i className="fa-solid fa-gavel" style={{ color:"#6366f1" }} /> Admin Actions
                </h4>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    ["fa-trophy","Send Appreciation","#f0fdf4","#16a34a","#bbf7d0"],
                    ["fa-clipboard-list","Request Improvement Plan","#fffbeb","#d97706","#fde68a"],
                    ["fa-triangle-exclamation","Issue Warning","#fef2f2","#dc2626","#fecaca"],
                  ].map(([ic,lbl,bg,co,bo]) => (
                    <button key={lbl} onClick={() => alert(`${lbl} — connect to notification API`)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:bg,
                               border:`1px solid ${bo}`, borderRadius:12, color:co, fontSize:13,
                               fontWeight:700, cursor:"pointer", transition:"all 0.2s", textAlign:"left" }}
                      onMouseEnter={e => e.currentTarget.style.transform="translateX(4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform=""}>
                      <i className={`fa-solid ${ic}`} />{lbl}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <SectionHead icon="fa-comments" title={`All Feedback (${tr.length})`} />
              {tr.length===0 ? (
                <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>
                  <i className="fa-solid fa-comments" style={{ fontSize:32, display:"block", marginBottom:12, opacity:0.35 }}/>
                  No feedback collected yet — post a review campaign first.
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                  {tr.map(r => (
                    <div key={r._id} style={{ border:"1px solid #e2e8f0", borderRadius:14, padding:"14px 16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{r.batchName}</div>
                          <div style={{ fontSize:11, color:"#94a3b8" }}>{timeAgo(r.createdAt||r.submittedAt)}</div>
                        </div>
                        <Stars rating={r.overallRating||r.rating} />
                      </div>
                      {r.comment && (
                        <p style={{ fontSize:13, color:"#475569", fontStyle:"italic", lineHeight:1.6, margin:0 }}>
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════
           ADD / EDIT TEACHER MODAL
         ══════════════════════════════════════ */}
      {showTeacherModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)",
                      zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => !tSaving && setShowTeacherModal(false)}>
          <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:460,
                        boxShadow:"0 24px 60px rgba(0,0,0,0.2)", animation:"slideUp 0.3s cubic-bezier(0.4,0,0.2,1)" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                          padding:"20px 24px", borderBottom:"1px solid #f1f5f9",
                          background: editingTeacher ? "#f0f1ff" : "#f8fafc",
                          borderRadius:"20px 20px 0 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"#eef2ff", color:"#6366f1",
                              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  <i className={`fa-solid fa-${editingTeacher?"pen":"user-plus"}`} />
                </div>
                <div>
                  <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"#0f172a" }}>
                    {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                  </h3>
                  <p style={{ margin:0, fontSize:12, color:"#64748b" }}>
                    {editingTeacher ? `Editing ${editingTeacher.name}` : "Fill in teacher details"}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowTeacherModal(false)} disabled={tSaving}
                style={{ width:34, height:34, borderRadius:"50%", border:"1px solid #e2e8f0",
                         background:"white", cursor:"pointer", display:"flex", alignItems:"center",
                         justifyContent:"center", color:"#64748b", fontSize:16, transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="#ef4444"; e.currentTarget.style.color="white"; e.currentTarget.style.borderColor="#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background="white"; e.currentTarget.style.color="#64748b"; e.currentTarget.style.borderColor="#e2e8f0"; }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding:24 }}>
              <Input label="Full Name" value={tForm.name} onChange={v => setTForm(p=>({...p,name:v}))}
                     placeholder="e.g. Prof. Rahul Sharma" required />
              <Input label="Email Address" value={tForm.email} onChange={v => setTForm(p=>({...p,email:v}))}
                     type="email" placeholder="e.g. rsharma@college.edu" required />
              <Input label="Department" value={tForm.dept} onChange={v => setTForm(p=>({...p,dept:v}))}
                     placeholder="e.g. Computer Science" />
              <Input label="Subjects (comma-separated)" value={tForm.subjects}
                     onChange={v => setTForm(p=>({...p,subjects:v}))}
                     placeholder="e.g. Data Structures, Algorithms, OS" />
            </div>

            {/* Footer */}
            <div style={{ display:"flex", gap:10, padding:"16px 24px", borderTop:"1px solid #f1f5f9",
                          background:"#f8fafc", borderRadius:"0 0 20px 20px" }}>
              <button onClick={() => setShowTeacherModal(false)} disabled={tSaving}
                style={{ flex:1, padding:"11px", background:"white", border:"1.5px solid #e2e8f0",
                         borderRadius:12, color:"#64748b", fontSize:14, fontWeight:600,
                         cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#94a3b8"}
                onMouseLeave={e => e.currentTarget.style.borderColor="#e2e8f0"}>
                Cancel
              </button>
              <button onClick={saveTeacher} disabled={tSaving || !tForm.name.trim() || !tForm.email.trim()}
                style={{ flex:2, padding:"11px", border:"none", borderRadius:12,
                         fontSize:14, fontWeight:700, cursor: (tSaving||!tForm.name.trim()||!tForm.email.trim()) ? "not-allowed" : "pointer",
                         display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                         background: (tSaving||!tForm.name.trim()||!tForm.email.trim())
                           ? "#f1f5f9"
                           : "linear-gradient(135deg,#6366f1,#4f46e5)",
                         color: (tSaving||!tForm.name.trim()||!tForm.email.trim()) ? "#94a3b8" : "white",
                         transition:"all 0.2s" }}>
                {tSaving
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                  : <><i className={`fa-solid fa-${editingTeacher?"check":"plus"}`} />
                      {editingTeacher ? "Save Changes" : "Add Teacher"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyReviewAdmin;
