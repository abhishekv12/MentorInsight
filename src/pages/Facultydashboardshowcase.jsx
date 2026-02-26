import React from "react";

// ============================================================
// Facultydashboardshowcase.jsx
// Renders below class cards on the main dashboard view
// Usage: <Facultydashboardshowcase batches={batches} mySessions={mySessions} currentUser={currentUser} />
// ============================================================

const Facultydashboardshowcase = ({ batches = [], mySessions = [], currentUser }) => {
  const totalStudents = batches.reduce((sum, b) => sum + (b.students?.length || 0), 0);
  const totalSessions = mySessions.length;
  const recentSessions = [...mySessions]
    .sort((a, b) => new Date(b.createdAt || b.sessionDate) - new Date(a.createdAt || a.sessionDate))
    .slice(0, 4);

  const upcomingSessions = mySessions.filter(s => new Date(s.sessionDate) >= new Date()).slice(0, 3);

  const facultyName = currentUser?.displayName?.split(" ")[0] || "Faculty";

  const platformFeatures = [
    {
      icon: "fa-users",
      color: "#6366f1",
      bg: "#eef2ff",
      title: "Batch & Division Management",
      desc: "Create FY, SY and TY batches with multiple divisions (A, B, C, D). Add students, manage profiles, and keep academic data organised.",
      badge: "Core Feature",
    },
    {
      icon: "fa-bell",
      color: "#10b981",
      bg: "#ecfdf5",
      title: "Session Notifications",
      desc: "Schedule sessions with date, time, mode and description. Students get notified immediately and can acknowledge attendance.",
      badge: "Real-time",
    },
    {
      icon: "fa-bullhorn",
      color: "#f97316",
      bg: "#fff7ed",
      title: "Broadcast Messaging",
      desc: "Send targeted announcements to any batch or division with urgency levels — Urgent, High, Normal, or Info.",
      badge: "Messaging",
    },
    {
      icon: "fa-graduation-cap",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      title: "Batch Promotion",
      desc: "Seamlessly promote eligible students from FY to SY, SY to TY at the end of academic years with one workflow.",
      badge: "Academic",
    },
    {
      icon: "fa-chart-bar",
      color: "#ef4444",
      bg: "#fef2f2",
      title: "Attendance Analytics",
      desc: "Track month-wise and semester-wise attendance for each student. Automatic shortage warnings below 75%.",
      badge: "Analytics",
    },
    {
      icon: "fa-file-pen",
      color: "#f59e0b",
      bg: "#fffbeb",
      title: "Examination Records",
      desc: "Manage semester-wise subject marks, SGPA, and CGPA. View student academic performance at a glance.",
      badge: "Academics",
    },
  ];

  const tips = [
    { icon: "fa-bolt",          color: "#f59e0b", text: "Use 'Promote Batch' to move all eligible students to the next year in one click." },
    { icon: "fa-bell",          color: "#6366f1", text: "Mark sessions as 'Important' to highlight them for students with a red badge." },
    { icon: "fa-bullhorn",      color: "#f97316", text: "Set broadcast priority to Urgent for time-sensitive announcements like exam alerts." },
    { icon: "fa-user-check",    color: "#10b981", text: "Click the attendee count on any session to see exactly who attended." },
    { icon: "fa-chart-line",    color: "#ef4444", text: "Students with attendance below 75% are flagged automatically — check their profiles." },
    { icon: "fa-shield-halved", color: "#8b5cf6", text: "Student document vault and certifications are visible in the Student Insights tab." },
  ];

  const getTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fd-showcase">

      {/* ── Quick Stats Bar ── */}
      <div className="fd-stats-bar">
        {[
          { icon: "fa-layer-group",    color: "#6366f1", value: batches.length,  label: "Active Batches"   },
          { icon: "fa-users",          color: "#10b981", value: totalStudents,   label: "Total Students"   },
          { icon: "fa-calendar-check", color: "#f97316", value: totalSessions,   label: "Sessions Sent"    },
          { icon: "fa-calendar-plus",  color: "#8b5cf6", value: upcomingSessions.length, label: "Upcoming Sessions" },
        ].map((s, i) => (
          <div key={i} className="fd-stat-card">
            <div className="fd-stat-icon-wrap" style={{ background: s.color + "1a", color: s.color }}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div>
              <div className="fd-stat-value">{s.value}</div>
              <div className="fd-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column: Recent Activity + Upcoming ── */}
      <div className="fd-two-col">

        {/* Recent Sessions */}
        <div className="fd-panel">
          <div className="fd-panel-header">
            <div className="fd-panel-title">
              <i className="fa-solid fa-clock-rotate-left"></i> Recent Sessions
            </div>
            <span className="fd-panel-count">{totalSessions} total</span>
          </div>
          <div className="fd-panel-body">
            {recentSessions.length === 0 ? (
              <div className="fd-empty-mini">
                <i className="fa-solid fa-calendar-xmark"></i>
                <p>No sessions sent yet. Use 'Send Session' to get started.</p>
              </div>
            ) : recentSessions.map((s, i) => (
              <div key={i} className="fd-session-row">
                <div className="fd-session-dot" style={{ background: s.isImportant ? "#ef4444" : "#6366f1" }}></div>
                <div className="fd-session-info">
                  <span className="fd-session-title">{s.title || "Session"}</span>
                  <span className="fd-session-meta">
                    <i className="fa-solid fa-calendar"></i>
                    {new Date(s.sessionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {s.isImportant && <span className="fd-session-imp-badge">IMPORTANT</span>}
                  </span>
                </div>
                <span className="fd-session-time">{getTimeAgo(s.createdAt || s.sessionDate)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Tips */}
        <div className="fd-panel">
          <div className="fd-panel-header">
            <div className="fd-panel-title">
              <i className="fa-solid fa-lightbulb"></i> Pro Tips
            </div>
            <span className="fd-panel-badge">For You</span>
          </div>
          <div className="fd-panel-body">
            {tips.map((tip, i) => (
              <div key={i} className="fd-tip-row">
                <div className="fd-tip-icon" style={{ background: tip.color + "1a", color: tip.color }}>
                  <i className={`fa-solid ${tip.icon}`}></i>
                </div>
                <p className="fd-tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Welcome Banner ── */}
      <div className="fd-welcome-banner">
        <div className="fd-welcome-content">
          <div className="fd-welcome-text">
            <span className="fd-welcome-eyebrow">
              <i className="fa-solid fa-hand-wave"></i> Welcome back
            </span>
            <h2>Good to see you, <strong>{facultyName}</strong></h2>
            <p>
              You're managing <strong>{batches.length} batch{batches.length !== 1 ? "es" : ""}</strong> with a total of <strong>{totalStudents} student{totalStudents !== 1 ? "s" : ""}</strong>.
              {totalSessions > 0
                ? ` You've sent ${totalSessions} session notification${totalSessions !== 1 ? "s" : ""} so far.`
                : " Send your first session notification to get started."}
            </p>
          </div>
          <div className="fd-welcome-orb">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
        </div>
        <div className="fd-welcome-stats">
          {[
            { label: "Batches Active",    value: batches.length,                                    icon: "fa-layer-group"    },
            { label: "Students Enrolled", value: totalStudents,                                     icon: "fa-users"          },
            { label: "Sessions Created",  value: totalSessions,                                     icon: "fa-calendar-check" },
            { label: "Avg per Batch",     value: batches.length ? Math.round(totalStudents / batches.length) : 0, icon: "fa-chart-simple" },
          ].map((s, i) => (
            <div key={i} className="fd-welcome-stat">
              <i className={`fa-solid ${s.icon}`}></i>
              <span className="fd-welcome-stat-value">{s.value}</span>
              <span className="fd-welcome-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Platform Features Showcase ── */}
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">Platform Capabilities</h2>
          <p className="fd-section-sub">Everything you need to manage your students, sessions, and academic records</p>
        </div>
        <span className="fd-section-badge">
          <i className="fa-solid fa-sparkles"></i> {platformFeatures.length} Features
        </span>
      </div>

      <div className="fd-features-grid">
        {platformFeatures.map((f, i) => (
          <div key={i} className="fd-feature-card" style={{ "--fc-color": f.color }}>
            <div className="fd-feature-top">
              <div className="fd-feature-icon" style={{ background: f.bg, color: f.color }}>
                <i className={`fa-solid ${f.icon}`}></i>
              </div>
              <span className="fd-feature-badge" style={{ background: f.color + "1a", color: f.color }}>
                {f.badge}
              </span>
            </div>
            <h3 className="fd-feature-title">{f.title}</h3>
            <p className="fd-feature-desc">{f.desc}</p>
            <div className="fd-feature-bar"></div>
          </div>
        ))}
      </div>

      {/* ── Academic Year Timeline ── */}
      <div className="fd-section-header" style={{ marginTop: "48px" }}>
        <div>
          <h2 className="fd-section-title">Your Batches Overview</h2>
          <p className="fd-section-sub">Academic year breakdown across all your managed batches</p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="fd-batches-empty">
          <i className="fa-solid fa-layer-group"></i>
          <p>No batches yet. Click 'Create Class' above to add your first batch.</p>
        </div>
      ) : (
        <div className="fd-batch-overview-grid">
          {batches.map((batch, i) => {
            const studentCount = batch.students?.length || 0;
            const divisionMap = {};
            (batch.students || []).forEach(s => {
              const div = s.division || "A";
              divisionMap[div] = (divisionMap[div] || 0) + 1;
            });
            const divs = Object.entries(divisionMap);

            return (
              <div key={i} className="fd-batch-overview-card">
                <div className="fd-boc-header">
                  <div className="fd-boc-badge">{batch.year || "FY"}</div>
                  <div>
                    <div className="fd-boc-name">{batch.batchName || batch.name || "Batch"}</div>
                    <div className="fd-boc-course">{batch.courseName || batch.course || "Course"}</div>
                  </div>
                  <div className="fd-boc-ay">{batch.academicYear || "AY 2024-25"}</div>
                </div>
                <div className="fd-boc-body">
                  <div className="fd-boc-total">
                    <span className="fd-boc-total-num">{studentCount}</span>
                    <span className="fd-boc-total-label">Students</span>
                  </div>
                  {divs.length > 0 && (
                    <div className="fd-boc-divs">
                      {divs.map(([div, cnt]) => (
                        <div key={div} className="fd-boc-div-pill">
                          <span className="fd-boc-div-letter">{div}</span>
                          <span className="fd-boc-div-count">{cnt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="fd-boc-footer">
                  <div className="fd-boc-status">
                    <span className="fd-boc-status-dot"></span> Active
                  </div>
                  <span className="fd-boc-dept">{batch.department || batch.dept || "CS"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Facultydashboardshowcase;

