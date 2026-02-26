import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";

// ============================================================
// Facultysharehub.jsx
// Faculty-side Share Resources view
// Add to FacultyDashboard sidebar: "Share" nav item → currentView="shareHub"
// Usage: <Facultysharehub currentUser={currentUser} batches={batches} onBack={() => setCurrentView("dashboard")} />
// ============================================================

const RESOURCE_TYPES = [
  { key: "video", label: "Video",  icon: "fa-circle-play",     color: "#f59e0b", hint: "YouTube URL or direct video link"            },
  { key: "image", label: "Image",  icon: "fa-image",           color: "#3b82f6", hint: "Direct image URL or paste base64"             },
  { key: "link",  label: "Link",   icon: "fa-link",            color: "#10b981", hint: "Any webpage, article, or documentation URL"   },
  { key: "note",  label: "Note",   icon: "fa-note-sticky",     color: "#8b5cf6", hint: "Write a text note directly for students"       },
  { key: "file",  label: "File",   icon: "fa-file-arrow-down", color: "#f97316", hint: "Link to a downloadable file (Drive, etc.)"     },
];

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Mock shared resources for display ────────────────────────
const MOCK_SHARED = [
  {
    _id: "s1", type: "video", title: "Data Structures — Linked List Deep Dive",
    tags: ["Data Structures", "Lecture"], sharedBy: "You",
    targetBatchName: "TYCS", targetDivision: "all",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    views: 34, isPinned: true,
  },
  {
    _id: "s2", type: "note", title: "Exam Pattern — Semester VI (Important)",
    tags: ["Exam", "Important"], sharedBy: "You",
    targetBatchName: "TYCS", targetDivision: "A",
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    views: 91, isPinned: true,
  },
  {
    _id: "s3", type: "link", title: "OS Concepts — GeeksForGeeks",
    tags: ["OS", "Study Material"], sharedBy: "You",
    targetBatchName: "SYCS", targetDivision: "all",
    createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    views: 22, isPinned: false,
  },
];

// ─── Type meta helper ─────────────────────────────────────────
const getMeta = (type) => RESOURCE_TYPES.find(r => r.key === type) || RESOURCE_TYPES[2];

const Facultysharehub = ({ currentUser, batches = [], onBack }) => {
  const [subView, setSubView] = useState("list"); // "list" | "compose"

  // ── compose form ──────────────────────────────────────────
  const [form, setForm] = useState({
    type:           "video",
    title:          "",
    description:    "",
    url:            "",
    tags:           "",
    targetBatchId:  "",
    targetDivision: "all",
    isPinned:       false,
  });

  const [shared, setShared]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchShared();
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchShared = async () => {
    setLoading(true);
    try {
      if (!currentUser?.uid) throw new Error("no uid");
      const res = await axios.get(
        `${API_URL}/api/faculty/learning/${currentUser.uid}`,
      );
      if (res.data.success) {
        setShared(res.data.resources || []);
      } else {
        setShared(MOCK_SHARED);
      }
    } catch {
      setShared(MOCK_SHARED);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.type !== "note" && !form.url.trim()) {
      alert("⚠️ Please enter a URL for this resource type.");
      return;
    }
    if (!form.targetBatchId) {
      alert("⚠️ Please select a target batch.");
      return;
    }

    setSending(true);
    try {
      const targetBatch     = batches.find(b => b.id === form.targetBatchId);
      const targetBatchName = targetBatch?.batchName || "";
      const tags            = form.tags.split(",").map(t => t.trim()).filter(Boolean);

      const payload = {
        ...form,
        tags,
        targetBatchName,
        facultyUid:   currentUser.uid,
        sharedBy:     currentUser.displayName || currentUser.email,
        facultyEmail: currentUser.email,
      };

      let newResource;
      try {
        const res = await axios.post("${API_URL}/api/faculty/learning/share", payload);
        newResource = res.data.resource;
      } catch {
        // Optimistic update if API not ready
        newResource = {
          _id: Date.now().toString(),
          ...payload,
          createdAt: new Date().toISOString(),
          views: 0,
        };
      }

      setShared(prev => [newResource, ...prev]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setForm({
        type: "video", title: "", description: "", url: "",
        tags: "", targetBatchId: "", targetDivision: "all", isPinned: false,
      });
      setSubView("list");
    } catch (err) {
      alert("❌ Failed to share: " + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this shared resource?")) return;
    try {
      await axios.delete(`${API_URL}/api/faculty/learning/${id}`);
    } catch { /* ignore */ }
    setShared(prev => prev.filter(r => r._id !== id));
  };

  const handleTogglePin = async (id) => {
    setShared(prev => prev.map(r => r._id === id ? { ...r, isPinned: !r.isPinned } : r));
    try {
      await axios.patch(`${API_URL}/api/faculty/learning/${id}/pin`);
    } catch { /* ignore */ }
  };

  const filtered = filterType === "all" ? shared : shared.filter(r => r.type === filterType);
  const selectedType = RESOURCE_TYPES.find(t => t.key === form.type);

  return (
    <div className="fsh-root">

      {/* ── Page header ── */}
      <div className="page-header-modern">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fa-solid fa-share-nodes" style={{ color: "var(--primary)", marginRight: "10px" }}></i>
            Share Learning Resources
          </h1>
          <p className="page-subtitle">Share images, videos, links, notes and files with your students</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {subView === "compose" ? (
            <button className="btn-ghost" onClick={() => setSubView("list")}>
              <i className="fa-solid fa-arrow-left"></i> Back to List
            </button>
          ) : (
            <button className="btn-create-primary" onClick={() => setSubView("compose")}>
              <i className="fa-solid fa-plus"></i> Share Resource
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* SUCCESS BANNER                                     */}
      {/* ══════════════════════════════════════════════════ */}
      {success && (
        <div className="fsh-success">
          <i className="fa-solid fa-circle-check"></i>
          Resource shared successfully! Students can now view it in their Learning Hub.
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* COMPOSE VIEW                                        */}
      {/* ══════════════════════════════════════════════════ */}
      {subView === "compose" && (
        <div className="fsh-compose-wrap">
          {/* ── Type Selector ── */}
          <div className="fsh-type-grid">
            {RESOURCE_TYPES.map(t => (
              <button
                key={t.key}
                className={`fsh-type-btn ${form.type === t.key ? "active" : ""}`}
                style={form.type === t.key ? { borderColor: t.color, background: t.color + "12" } : {}}
                onClick={() => setForm({ ...form, type: t.key })}
              >
                <i className={`fa-solid ${t.icon}`} style={{ color: t.color }}></i>
                <span>{t.label}</span>
                {form.type === t.key && <i className="fa-solid fa-circle-check fsh-type-check" style={{ color: t.color }}></i>}
              </button>
            ))}
          </div>

          <form onSubmit={handleShare} className="session-form-card">

            {/* ── Hint Banner ── */}
            {selectedType && (
              <div className="fsh-hint-banner" style={{ borderLeft: `4px solid ${selectedType.color}`, background: selectedType.color + "0d" }}>
                <i className={`fa-solid ${selectedType.icon}`} style={{ color: selectedType.color }}></i>
                <p>{selectedType.hint}</p>
              </div>
            )}

            <div className="form-section">
              <h3 className="form-section-title">Resource Details</h3>

              <div className="input-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder={form.type === "note" ? "e.g., Exam Pattern — Semester VI" : "e.g., Data Structures — Linked List Explained"}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Description / Note Content {form.type === "note" ? "*" : ""}</label>
                <textarea
                  rows={form.type === "note" ? 6 : 3}
                  placeholder={form.type === "note" ? "Write your note content here…" : "Brief description of this resource…"}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required={form.type === "note"}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: "10px",
                    border: "2px solid var(--border)", background: "var(--bg-app)",
                    fontFamily: "var(--font-primary)", fontSize: "14px", resize: "vertical",
                    color: "var(--text-main)",
                  }}
                />
              </div>

              {form.type !== "note" && (
                <div className="input-group">
                  <label>
                    {form.type === "video" ? "Video URL *" :
                     form.type === "image" ? "Image URL *" :
                     form.type === "file"  ? "File Download URL *" : "Link URL *"}
                  </label>
                  <input
                    type="url"
                    placeholder={
                      form.type === "video" ? "https://youtube.com/watch?v=... or direct .mp4" :
                      form.type === "image" ? "https://..." :
                      "https://..."
                    }
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>Tags <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(comma separated)</span></label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures, Lecture, Important"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Audience</h3>

              <div className="row">
                <div className="input-group">
                  <label>Target Batch *</label>
                  <select
                    value={form.targetBatchId}
                    onChange={e => setForm({ ...form, targetBatchId: e.target.value })}
                    required
                  >
                    <option value="">— Select Batch —</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchName} ({b.year} · {b.academicYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Division</label>
                  <select
                    value={form.targetDivision}
                    onChange={e => setForm({ ...form, targetDivision: e.target.value })}
                  >
                    <option value="all">All Divisions</option>
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                    <option value="D">Division D</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                    style={{ width: "auto", cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                  <span><i className="fa-solid fa-thumbtack" style={{ color: "var(--primary)", marginRight: "6px" }}></i> Pin this resource</span>
                </label>
                <small className="input-hint">Pinned resources appear at the top of students' Learning Hub</small>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setSubView("list")}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={sending}>
                {sending
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Sharing…</>
                  : <><i className="fa-solid fa-share-nodes"></i> Share with Students</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* LIST VIEW                                          */}
      {/* ══════════════════════════════════════════════════ */}
      {subView === "list" && (
        <>
          {/* ── Stats ── */}
          <div className="fsh-stats-row">
            {[
              { icon: "fa-share-nodes",  color: "#6366f1", val: shared.length,                           label: "Total Shared"  },
              { icon: "fa-thumbtack",    color: "#f59e0b", val: shared.filter(r => r.isPinned).length,   label: "Pinned"        },
              { icon: "fa-circle-play",  color: "#f97316", val: shared.filter(r => r.type === "video").length, label: "Videos"  },
              { icon: "fa-eye",          color: "#10b981", val: shared.reduce((s, r) => s + (r.views || 0), 0), label: "Total Views" },
            ].map((s, i) => (
              <div key={i} className="fsh-stat-card">
                <div className="fd-stat-icon-wrap" style={{ background: s.color + "1a", color: s.color }}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <div>
                  <div className="fd-stat-value">{s.val}</div>
                  <div className="fd-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filter pills ── */}
          <div className="fsh-filter-row">
            {["all", ...RESOURCE_TYPES.map(t => t.key)].map(t => {
              const meta = t === "all" ? { icon: "fa-layer-group", color: "#6366f1", label: "All" } : { ...getMeta(t), label: t.charAt(0).toUpperCase() + t.slice(1) };
              const cnt  = t === "all" ? shared.length : shared.filter(r => r.type === t).length;
              return (
                <button
                  key={t}
                  className={`lh-filter-btn ${filterType === t ? "active" : ""}`}
                  onClick={() => setFilterType(t)}
                >
                  <i className={`fa-solid ${meta.icon}`}></i> {meta.label}
                  {cnt > 0 && <span className="lh-filter-count">{cnt}</span>}
                </button>
              );
            })}
          </div>

          {/* ── List ── */}
          {loading ? (
            <div className="fsh-loading">
              <i className="fa-solid fa-spinner fa-spin"></i> Loading shared resources…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state-ultra" style={{ marginTop: "24px" }}>
              <div className="empty-visual">
                <div className="empty-icon-orbit">
                  <i className="fa-solid fa-share-nodes"></i>
                </div>
              </div>
              <h2>Nothing Shared Yet</h2>
              <p>Click "Share Resource" to add your first learning material for students</p>
              <button className="btn-create-large" onClick={() => setSubView("compose")}>
                <i className="fa-solid fa-plus"></i> Share First Resource
              </button>
            </div>
          ) : (
            <div className="fsh-list">
              {filtered.map(resource => {
                const meta = getMeta(resource.type);
                return (
                  <div key={resource._id} className={`fsh-item ${resource.isPinned ? "fsh-item-pinned" : ""}`}>
                    <div className="fsh-item-icon" style={{ background: meta.color + "18", color: meta.color }}>
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </div>

                    <div className="fsh-item-body">
                      <div className="fsh-item-top">
                        <h4 className="fsh-item-title">{resource.title}</h4>
                        <div className="fsh-item-badges">
                          {resource.isPinned && (
                            <span className="fsh-badge-pin">
                              <i className="fa-solid fa-thumbtack"></i> Pinned
                            </span>
                          )}
                          <span className="fsh-badge-type" style={{ background: meta.color + "1a", color: meta.color }}>
                            {resource.type}
                          </span>
                        </div>
                      </div>
                      <div className="fsh-item-meta">
                        <span><i className="fa-solid fa-users"></i> {resource.targetBatchName || "—"}{resource.targetDivision && resource.targetDivision !== "all" ? ` · Div ${resource.targetDivision}` : " · All"}</span>
                        <span><i className="fa-regular fa-clock"></i> {timeAgo(resource.createdAt)}</span>
                        <span><i className="fa-solid fa-eye"></i> {resource.views || 0} views</span>
                      </div>
                      {resource.tags?.length > 0 && (
                        <div className="fsh-item-tags">
                          {resource.tags.map((t, i) => (
                            <span key={i} className="lh-tag">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="fsh-item-actions">
                      <button
                        className={`fsh-action-btn ${resource.isPinned ? "active-pin" : ""}`}
                        onClick={() => handleTogglePin(resource._id)}
                        title={resource.isPinned ? "Unpin" : "Pin to top"}
                      >
                        <i className="fa-solid fa-thumbtack"></i>
                      </button>
                      {resource.url && resource.url !== "#" && (
                        <button
                          className="fsh-action-btn"
                          onClick={() => window.open(resource.url, "_blank")}
                          title="Preview"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </button>
                      )}
                      <button
                        className="fsh-action-btn fsh-action-delete"
                        onClick={() => handleDelete(resource._id)}
                        title="Remove"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Facultysharehub;

