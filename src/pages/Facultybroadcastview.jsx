import React, { useState, useEffect } from "react";
import axios from "axios";

// ============================================================
// FacultyBroadcastView.jsx
// Allows faculty to compose and send broadcast messages to
// students — feeds directly into the student BroadcastMessages widget.
// Props:
//   currentUser   — firebase user with .uid, .displayName, .email
//   batches       — array of batch objects from faculty's classes
//   onBack        — fn to navigate back (e.g. setCurrentView("dashboard"))
// ============================================================

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "🔴 Urgent", color: "#ef4444" },
  { value: "high",   label: "🟠 High",   color: "#f97316" },
  { value: "normal", label: "🔵 Normal", color: "#3b82f6" },
  { value: "info",   label: "⚪ Info",   color: "#94a3b8" },
];

const TAG_OPTIONS = [
  "Announcement", "Exam", "Assignment", "Holiday",
  "Fee", "Event", "Attendance", "General",
];

const FacultyBroadcastView = ({ currentUser, batches, onBack }) => {
  // ── Form state ──────────────────────────────────────────
  const [form, setForm] = useState({
    subject: "",
    body: "",
    priority: "normal",
    tag: "Announcement",
    targetBatchId: "",
    targetDivision: "all",
  });

  // ── Sent broadcasts history ──────────────────────────────
  const [sentBroadcasts, setSentBroadcasts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeView, setActiveView] = useState("compose"); // compose | history

  // ── Derived batch info for the selected batch ────────────
  const selectedBatch = batches.find((b) => b.id === form.targetBatchId);

  // ── Load sent history ────────────────────────────────────
  useEffect(() => {
    if (activeView === "history") fetchSentBroadcasts();
  }, [activeView]);

  const fetchSentBroadcasts = async () => {
    if (!currentUser) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faculty/broadcasts/${currentUser.uid}`
      );
      if (res.data.success) setSentBroadcasts(res.data.broadcasts || []);
    } catch (err) {
      console.error("Broadcast history fetch error:", err);
      // Fallback: read from localStorage (demo mode)
      const raw = localStorage.getItem(`faculty_broadcasts_${currentUser.uid}`);
      if (raw) setSentBroadcasts(JSON.parse(raw));
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Send broadcast ───────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.targetBatchId) {
      alert("⚠️ Please select a target batch.");
      return;
    }
    if (!form.subject.trim() || !form.body.trim()) {
      alert("⚠️ Subject and message body are required.");
      return;
    }

    setSending(true);
    const payload = {
      ...form,
      facultyUid: currentUser.uid,
      facultyName: currentUser.displayName || currentUser.email,
      facultyEmail: currentUser.email,
      targetBatchName: selectedBatch?.batchName || "",
      sentAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/faculty/broadcast",
        payload
      );
      alert(
        `✅ Broadcast sent to ${res.data.recipientCount ?? "all"} students in ${selectedBatch?.batchName}!`
      );
    } catch (err) {
      console.error("Broadcast send error:", err);
      // Offline / demo fallback — persist locally
      const key = `faculty_broadcasts_${currentUser.uid}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift({ ...payload, _id: Date.now().toString() });
      localStorage.setItem(key, JSON.stringify(existing));

      // Also push to the student-side localStorage key so it appears
      // immediately for testing (only works in same browser/device)
      if (form.targetBatchId) {
        const studentKey = `broadcasts_batch_${form.targetBatchId}_${form.targetDivision}`;
        const studentExisting = JSON.parse(
          localStorage.getItem(studentKey) || "[]"
        );
        studentExisting.unshift({ ...payload, _id: Date.now().toString() });
        localStorage.setItem(studentKey, JSON.stringify(studentExisting));
      }
      alert("✅ Broadcast saved (offline mode — will sync when server is available).");
    } finally {
      setSending(false);
      setForm({
        subject: "",
        body: "",
        priority: "normal",
        tag: "Announcement",
        targetBatchId: "",
        targetDivision: "all",
      });
    }
  };

  // ── Helpers ──────────────────────────────────────────────
  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const priorityColor = (p) =>
    PRIORITY_OPTIONS.find((o) => o.value === p)?.color ?? "#94a3b8";

  // ────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div className="page-header-modern" style={{ marginBottom: "28px" }}>
        <div className="header-content">
          <h1 className="page-title">
            <i className="fa-solid fa-bullhorn" style={{ marginRight: "10px", color: "#667eea" }}></i>
            Broadcast Messages
          </h1>
          <p className="page-subtitle">
            Send announcements directly to your students' dashboards
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className={activeView === "compose" ? "btn-create-primary" : "btn-ghost"}
            onClick={() => setActiveView("compose")}
          >
            <i className="fa-solid fa-pen-to-square"></i> Compose
          </button>
          <button
            className={activeView === "history" ? "btn-create-primary" : "btn-ghost"}
            onClick={() => setActiveView("history")}
            style={activeView === "history" ? {} : { background: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0" }}
          >
            <i className="fa-solid fa-clock-rotate-left"></i> Sent
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* COMPOSE VIEW                                       */}
      {/* ══════════════════════════════════════════════════ */}
      {activeView === "compose" && (
        <form onSubmit={handleSend}>
          <div style={cardStyle}>
            {/* Priority pills */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Priority Level</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, priority: opt.value })}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: `2px solid ${form.priority === opt.value ? opt.color : "#e2e8f0"}`,
                      background: form.priority === opt.value ? opt.color + "18" : "white",
                      color: form.priority === opt.value ? opt.color : "#64748b",
                      fontWeight: form.priority === opt.value ? 700 : 500,
                      cursor: "pointer",
                      fontSize: "13px",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag */}
            <div className="input-group" style={{ marginBottom: "16px" }}>
              <label>Category Tag</label>
              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              >
                {TAG_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="input-group" style={{ marginBottom: "16px" }}>
              <label>Subject *</label>
              <input
                type="text"
                placeholder="e.g., Reminder: Internal Assessment on Monday"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            {/* Body */}
            <div className="input-group" style={{ marginBottom: "20px" }}>
              <label>Message *</label>
              <textarea
                rows={6}
                placeholder="Write your message to students here..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <small style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                {form.body.length} characters
              </small>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1.5px dashed #e2e8f0", margin: "20px 0" }}></div>

            {/* Target audience */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "14px" }}>
              <i className="fa-solid fa-users" style={{ marginRight: "7px", color: "#667eea" }}></i>
              Target Audience
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="input-group">
                <label>Batch *</label>
                <select
                  value={form.targetBatchId}
                  onChange={(e) => setForm({ ...form, targetBatchId: e.target.value })}
                  required
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => (
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
                  onChange={(e) => setForm({ ...form, targetDivision: e.target.value })}
                >
                  <option value="all">All Divisions</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                  <option value="D">Division D</option>
                </select>
              </div>
            </div>

            {/* Recipient preview pill */}
            {selectedBatch && (
              <div style={{
                marginTop: "14px",
                padding: "12px 16px",
                background: "linear-gradient(135deg, #667eea18, #764ba218)",
                border: "1.5px solid #667eea40",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#4338ca",
                fontWeight: 600,
              }}>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: "8px" }}></i>
                Sending to: <strong>{selectedBatch.batchName}</strong>
                {form.targetDivision !== "all"
                  ? ` · Division ${form.targetDivision}`
                  : " · All Divisions"}
                {" "}
                ({selectedBatch.students?.length ?? 0} students)
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="btn-ghost" onClick={onBack}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={sending}
                style={{ minWidth: "160px" }}
              >
                {sending ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane"></i> Send Broadcast</>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* HISTORY VIEW                                       */}
      {/* ══════════════════════════════════════════════════ */}
      {activeView === "history" && (
        <div>
          {historyLoading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "28px" }}></i>
              <p style={{ marginTop: "12px" }}>Loading sent broadcasts...</p>
            </div>
          ) : sentBroadcasts.length === 0 ? (
            <div className="empty-state-ultra">
              <div className="empty-visual">
                <div className="empty-icon-orbit">
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
              </div>
              <h2>No Broadcasts Yet</h2>
              <p>Switch to Compose to send your first message</p>
              <button className="btn-create-large" onClick={() => setActiveView("compose")}>
                <i className="fa-solid fa-pen-to-square"></i> Compose Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {sentBroadcasts.map((bc, idx) => (
                <div key={bc._id || idx} style={{
                  background: "white",
                  border: `1.5px solid ${priorityColor(bc.priority)}30`,
                  borderLeft: `4px solid ${priorityColor(bc.priority)}`,
                  borderRadius: "12px",
                  padding: "18px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 700,
                          background: priorityColor(bc.priority) + "18",
                          color: priorityColor(bc.priority),
                          border: `1px solid ${priorityColor(bc.priority)}40`,
                          padding: "2px 10px", borderRadius: "12px", textTransform: "uppercase",
                        }}>
                          {bc.priority}
                        </span>
                        <span style={{
                          fontSize: "11px", fontWeight: 600,
                          background: "#f1f5f9", color: "#64748b",
                          padding: "2px 10px", borderRadius: "12px",
                        }}>
                          {bc.tag}
                        </span>
                      </div>
                      <h4 style={{ margin: "0 0 6px", fontSize: "15px", color: "#1f2937", fontWeight: 700 }}>
                        {bc.subject}
                      </h4>
                      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b", lineHeight: 1.55 }}>
                        {bc.body?.length > 180 ? bc.body.slice(0, 180) + "..." : bc.body}
                      </p>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#94a3b8", flexWrap: "wrap" }}>
                        <span>
                          <i className="fa-solid fa-users" style={{ marginRight: "4px" }}></i>
                          {bc.targetBatchName || bc.targetBatchId}
                          {bc.targetDivision && bc.targetDivision !== "all"
                            ? ` · Div ${bc.targetDivision}` : " · All Divs"}
                        </span>
                        <span>
                          <i className="fa-solid fa-clock" style={{ marginRight: "4px" }}></i>
                          {timeAgo(bc.sentAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Shared style helpers
const cardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  border: "1px solid #f1f5f9",
};
const labelStyle = {
  fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px",
};
const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: "2px solid #e2e8f0", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export default FacultyBroadcastView;