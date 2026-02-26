import React, { useState, useEffect } from "react";

// ============================================================
// StudentInsightPanel.jsx
// Faculty read-only view of a student's:
//   • Document Vault (uploaded docs)
//   • Certifications & Achievements
//   • To-Do / Academic Tasks
//   • Sessions attended (from student's session data)
//
// Props:
//   student — student object from batch (has rollNo, name, etc.)
//   sessions — mySessions from faculty state (to compute attendance)
// ============================================================

const DOC_CATEGORIES = [
  { key: "id_card",      label: "ID Card",         icon: "fa-id-card",          color: "#3b82f6" },
  { key: "fee_receipt",  label: "Fee Receipt",      icon: "fa-receipt",          color: "#10b981" },
  { key: "abc_id",       label: "ABC ID",           icon: "fa-fingerprint",      color: "#8b5cf6" },
  { key: "marksheet",    label: "Marksheet",        icon: "fa-file-alt",         color: "#f59e0b" },
  { key: "leaving_cert", label: "Leaving Cert",     icon: "fa-file-certificate", color: "#ef4444" },
  { key: "other",        label: "Other",            icon: "fa-folder-open",      color: "#64748b" },
];

const CERT_ICONS = {
  hackathon:  { emoji: "🏆", color: "#f59e0b" },
  workshop:   { emoji: "🛠️", color: "#3b82f6" },
  coursera:   { emoji: "📚", color: "#10b981" },
  internship: { emoji: "💼", color: "#8b5cf6" },
  sports:     { emoji: "🏅", color: "#ef4444" },
  other:      { emoji: "⭐", color: "#64748b" },
};

const StudentInsightPanel = ({ student, sessions = [] }) => {
  const [activeTab, setActiveTab] = useState("docs");

  // ── Load from student's localStorage keys ───────────────
  const rollNo = student?.rollNo || "unknown";
  const [docs, setDocs]   = useState({});
  const [certs, setCerts] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Document Vault
    try {
      const raw = localStorage.getItem(`doc_vault_${rollNo}`);
      setDocs(raw ? JSON.parse(raw) : {});
    } catch { setDocs({}); }

    // Certifications
    try {
      const raw = localStorage.getItem(`certs_${rollNo}`);
      setCerts(raw ? JSON.parse(raw) : []);
    } catch { setCerts([]); }

    // Tasks
    try {
      const raw = localStorage.getItem(`todo_tasks_${rollNo}`);
      setTasks(raw ? JSON.parse(raw) : []);
    } catch { setTasks([]); }
  }, [rollNo]);

  // ── Compute session attendance for this student ──────────
  const studentSessions = sessions.filter((s) => {
    const attended = s.attendees?.some(
      (a) => a.rollNo === student.rollNo || a.email === student.email
    );
    return attended;
  });
  const totalSessions = sessions.length;
  const attendedCount = studentSessions.length;
  const sessionPct = totalSessions > 0
    ? Math.round((attendedCount / totalSessions) * 100)
    : null;

  // ── Tabs ─────────────────────────────────────────────────
  const tabs = [
    { key: "docs",   label: "Documents",     icon: "fa-folder-open" },
    { key: "certs",  label: "Certificates",  icon: "fa-award"       },
    { key: "tasks",  label: "Tasks",         icon: "fa-list-check"  },
    { key: "summary", label: "Summary",      icon: "fa-chart-pie"   },
  ];

  // ── Doc counts ───────────────────────────────────────────
  const totalDocs = Object.values(docs).reduce(
    (sum, files) => sum + (Array.isArray(files) ? files.length : 0), 0
  );

  // ── Task stats ───────────────────────────────────────────
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks   = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  // ────────────────────────────────────────────────────────
  return (
    <div style={panelStyle}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={avatarStyle}>{student.name?.charAt(0) || "?"}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#1f2937", fontWeight: 700 }}>
              {student.name} — Student Insights
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Roll No: {student.rollNo} · Div {student.division} · Read-only faculty view
            </p>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
          <StatPill icon="fa-folder" label="Docs" value={totalDocs} color="#3b82f6" />
          <StatPill icon="fa-award"  label="Certs" value={certs.length} color="#8b5cf6" />
          <StatPill icon="fa-list-check" label="Tasks" value={`${completedTasks}/${tasks.length}`} color="#10b981" />
          {sessionPct !== null && (
            <StatPill icon="fa-video" label="Session Attendance" value={`${sessionPct}%`}
              color={sessionPct >= 75 ? "#10b981" : "#ef4444"} />
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={tabBarStyle}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              ...tabBtnStyle,
              ...(activeTab === t.key ? tabActivStyle : {}),
            }}
          >
            <i className={`fa-solid ${t.icon}`}></i> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* DOCUMENTS TAB                                      */}
      {/* ══════════════════════════════════════════════════ */}
      {activeTab === "docs" && (
        <div>
          {totalDocs === 0 ? (
            <EmptyState icon="fa-folder-open" text="Student hasn't uploaded any documents yet" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
              {DOC_CATEGORIES.map((cat) => {
                const files = docs[cat.key] || [];
                if (files.length === 0) return null;
                return (
                  <div key={cat.key} style={docCardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "9px",
                        background: cat.color + "18", display: "flex", alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <i className={`fa-solid ${cat.icon}`} style={{ color: cat.color, fontSize: "15px" }}></i>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#1f2937" }}>
                          {cat.label}
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                          {files.length} file{files.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                      {files.map((f, i) => (
                        <div key={i} style={fileRowStyle}>
                          <i className={`fa-solid ${f.type?.includes("pdf") ? "fa-file-pdf" : "fa-image"}`}
                            style={{ color: f.type?.includes("pdf") ? "#ef4444" : "#3b82f6", fontSize: "13px" }}>
                          </i>
                          <span style={{ fontSize: "12px", color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.name || `File ${i + 1}`}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {f.size ? (f.size / 1024).toFixed(0) + " KB" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* CERTIFICATIONS TAB                                 */}
      {/* ══════════════════════════════════════════════════ */}
      {activeTab === "certs" && (
        <div>
          {certs.length === 0 ? (
            <EmptyState icon="fa-award" text="Student hasn't uploaded any certifications yet" />
          ) : (
            <>
              {/* Category summary */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                {Object.entries(CERT_ICONS).map(([key, val]) => {
                  const count = certs.filter((c) => c.category === key).length;
                  if (count === 0) return null;
                  return (
                    <div key={key} style={{
                      padding: "6px 14px", borderRadius: "20px",
                      background: val.color + "14", border: `1px solid ${val.color}30`,
                      fontSize: "13px", fontWeight: 600, color: val.color,
                    }}>
                      {val.emoji} {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                {certs.map((cert, i) => {
                  const cat = CERT_ICONS[cert.category] || CERT_ICONS.other;
                  return (
                    <div key={i} style={{
                      background: "white", borderRadius: "12px", padding: "16px",
                      border: `1.5px solid ${cat.color}20`,
                      borderTop: `3px solid ${cat.color}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "22px" }}>{cat.emoji}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#1f2937" }}>
                            {cert.title}
                          </p>
                          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                            {cert.issuer}
                          </p>
                        </div>
                      </div>
                      {cert.date && (
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px" }}>
                          <i className="fa-solid fa-calendar" style={{ marginRight: "4px" }}></i>
                          {new Date(cert.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                      {cert.skills && cert.skills.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {cert.skills.slice(0, 4).map((s, si) => (
                            <span key={si} style={{
                              fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                              background: "#f1f5f9", color: "#64748b", fontWeight: 600,
                            }}>{s}</span>
                          ))}
                        </div>
                      )}
                      {cert.file && (
                        <div style={{ marginTop: "10px" }}>
                          <span style={{
                            fontSize: "11px", color: "#10b981", fontWeight: 600,
                            background: "#f0fdf4", padding: "3px 10px", borderRadius: "10px",
                          }}>
                            <i className="fa-solid fa-paperclip" style={{ marginRight: "4px" }}></i>
                            Certificate attached
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TASKS TAB                                          */}
      {/* ══════════════════════════════════════════════════ */}
      {activeTab === "tasks" && (
        <div>
          {tasks.length === 0 ? (
            <EmptyState icon="fa-list-check" text="No tasks in student's academic task list" />
          ) : (
            <>
              {/* Summary bar */}
              <div style={{
                display: "flex", gap: "16px", padding: "14px 18px",
                background: "linear-gradient(135deg, #667eea10, #764ba210)",
                borderRadius: "10px", marginBottom: "18px", flexWrap: "wrap",
              }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  <i className="fa-solid fa-circle-check" style={{ color: "#10b981", marginRight: "6px" }}></i>
                  Completed: {completedTasks}/{tasks.length}
                </span>
                {overdueTasks > 0 && (
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "6px" }}></i>
                    Overdue: {overdueTasks}
                  </span>
                )}
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                  Progress: {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tasks.map((task, i) => {
                  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
                  const priorityColors = {
                    urgent: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981"
                  };
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "13px 16px", borderRadius: "10px",
                      background: isOverdue ? "#fef2f2" : task.completed ? "#f0fdf4" : "white",
                      border: `1.5px solid ${isOverdue ? "#fca5a5" : task.completed ? "#bbf7d0" : "#e2e8f0"}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "50%",
                        border: `2px solid ${task.completed ? "#10b981" : "#d1d5db"}`,
                        background: task.completed ? "#10b981" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {task.completed && <i className="fa-solid fa-check" style={{ fontSize: "9px", color: "white" }}></i>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: 0, fontSize: "14px", fontWeight: 600,
                          color: task.completed ? "#10b981" : "#1f2937",
                          textDecoration: task.completed ? "line-through" : "none",
                        }}>
                          {task.text}
                        </p>
                        {task.dueDate && (
                          <p style={{ margin: "3px 0 0", fontSize: "12px", color: isOverdue ? "#ef4444" : "#94a3b8" }}>
                            <i className={`fa-solid ${isOverdue ? "fa-triangle-exclamation" : "fa-calendar"}`}
                              style={{ marginRight: "4px" }}></i>
                            {isOverdue ? "Overdue — " : "Due: "}
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                      {task.priority && (
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 10px",
                          borderRadius: "10px", textTransform: "uppercase",
                          background: (priorityColors[task.priority] || "#94a3b8") + "18",
                          color: priorityColors[task.priority] || "#94a3b8",
                        }}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* SUMMARY TAB                                        */}
      {/* ══════════════════════════════════════════════════ */}
      {activeTab === "summary" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          <SummaryCard
            icon="fa-folder-open" iconColor="#3b82f6"
            title="Documents Submitted" value={totalDocs}
            sub={`across ${DOC_CATEGORIES.filter(c => (docs[c.key]||[]).length > 0).length} categories`}
          />
          <SummaryCard
            icon="fa-award" iconColor="#8b5cf6"
            title="Certifications" value={certs.length}
            sub={certs.length > 0 ? `Latest: ${certs[certs.length - 1]?.title || "-"}` : "None yet"}
          />
          <SummaryCard
            icon="fa-list-check" iconColor="#10b981"
            title="Tasks Completed" value={`${completedTasks}/${tasks.length}`}
            sub={overdueTasks > 0 ? `⚠️ ${overdueTasks} overdue` : "All on track ✓"}
            subColor={overdueTasks > 0 ? "#ef4444" : "#10b981"}
          />
          {sessionPct !== null && (
            <SummaryCard
              icon="fa-video" iconColor={sessionPct >= 75 ? "#10b981" : "#ef4444"}
              title="Session Attendance" value={`${sessionPct}%`}
              sub={`${attendedCount} of ${totalSessions} sessions`}
              subColor={sessionPct >= 75 ? "#10b981" : "#ef4444"}
            />
          )}
          <SummaryCard
            icon="fa-graduation-cap" iconColor="#f59e0b"
            title="Academic Attendance" value={`${student.attendance || 0}%`}
            sub={student.attendance >= 75 ? "✓ Satisfactory" : "⚠️ Below 75% threshold"}
            subColor={student.attendance >= 75 ? "#10b981" : "#ef4444"}
          />
          <SummaryCard
            icon="fa-star" iconColor="#f97316"
            title="Skills Tagged"
            value={[...new Set(certs.flatMap(c => c.skills || []))].length}
            sub="from certificates"
          />
        </div>
      )}

      {/* Read-only notice */}
      <div style={{
        marginTop: "24px", padding: "10px 16px",
        background: "#f8fafc", borderRadius: "8px",
        fontSize: "12px", color: "#94a3b8", textAlign: "center",
      }}>
        <i className="fa-solid fa-lock" style={{ marginRight: "6px" }}></i>
        Faculty read-only view — data is sourced from the student's device
      </div>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────
const StatPill = ({ icon, label, value, color }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "8px",
    padding: "6px 14px", borderRadius: "20px",
    background: color + "12", border: `1px solid ${color}25`,
  }}>
    <i className={`fa-solid ${icon}`} style={{ color, fontSize: "13px" }}></i>
    <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value}</span>
    <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
  </div>
);

const SummaryCard = ({ icon, iconColor, title, value, sub, subColor }) => (
  <div style={{
    background: "white", borderRadius: "14px", padding: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
  }}>
    <div style={{
      width: "40px", height: "40px", borderRadius: "10px",
      background: iconColor + "14", display: "flex", alignItems: "center",
      justifyContent: "center", marginBottom: "12px",
    }}>
      <i className={`fa-solid ${icon}`} style={{ color: iconColor, fontSize: "17px" }}></i>
    </div>
    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
      {title}
    </p>
    <p style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: 800, color: "#1f2937" }}>
      {value}
    </p>
    {sub && <p style={{ margin: 0, fontSize: "12px", color: subColor || "#94a3b8" }}>{sub}</p>}
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
    <i className={`fa-solid ${icon}`} style={{ fontSize: "36px", marginBottom: "14px", display: "block", opacity: 0.4 }}></i>
    <p style={{ margin: 0, fontSize: "14px" }}>{text}</p>
  </div>
);

// ── Styles ───────────────────────────────────────────────────
const panelStyle = {
  background: "#f8fafc", borderRadius: "18px",
  padding: "0", overflow: "hidden",
};
const headerStyle = {
  background: "white", padding: "24px 24px 20px",
  borderBottom: "1.5px solid #f1f5f9",
};
const avatarStyle = {
  width: "46px", height: "46px", borderRadius: "12px",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "white", fontSize: "18px", fontWeight: 800, flexShrink: 0,
};
const tabBarStyle = {
  display: "flex", gap: "4px", padding: "12px 24px",
  background: "white", borderBottom: "1.5px solid #f1f5f9",
  overflowX: "auto",
};
const tabBtnStyle = {
  padding: "8px 16px", borderRadius: "8px", border: "none",
  background: "transparent", color: "#64748b", fontSize: "13px",
  fontWeight: 600, cursor: "pointer", display: "flex",
  alignItems: "center", gap: "7px", whiteSpace: "nowrap",
  transition: "all 0.15s",
};
const tabActivStyle = {
  background: "linear-gradient(135deg, #667eea18, #764ba218)",
  color: "#667eea",
};
const docCardStyle = {
  background: "white", borderRadius: "12px", padding: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
};
const fileRowStyle = {
  display: "flex", alignItems: "center", gap: "8px",
  padding: "7px 10px", borderRadius: "7px", background: "#f8fafc",
};

export default StudentInsightPanel;

