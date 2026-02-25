import React from "react";

// ============================================================
// StudentDashboardShowcase.jsx
// Renders INSIDE the Overview tab (activeTab === "overview")
// Shows: Upcoming Session Highlight, Quick Actions, Tip strip
// Usage: <StudentDashboardShowcase sessions={sessions} student={student} setActiveTab={setActiveTab} appliedSessions={appliedSessions} />
// ============================================================

const timeUntil = (dateStr, timeStr) => {
  const d = new Date(dateStr);
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  }
  const diff = d - Date.now();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0)    return { label: `${days}d ${hours}h`,  urgency: days <= 1 ? "urgent" : days <= 3 ? "soon" : "later" };
  if (hours > 0)   return { label: `${hours}h ${minutes}m`, urgency: hours <= 2 ? "urgent" : "soon" };
  return { label: `${minutes}m`, urgency: "urgent" };
};

const TYPE_META = {
  lecture:   { icon: "fa-book",            color: "#6366f1" },
  practical: { icon: "fa-flask",           color: "#10b981" },
  tutorial:  { icon: "fa-chalkboard-user", color: "#f97316" },
  seminar:   { icon: "fa-users",           color: "#8b5cf6" },
  workshop:  { icon: "fa-hammer",          color: "#06b6d4" },
  exam:      { icon: "fa-file-pen",        color: "#ef4444" },
  other:     { icon: "fa-calendar",        color: "#94a3b8" },
};

const StudentDashboardShowcase = ({ sessions = [], student, setActiveTab, appliedSessions = new Set() }) => {
  const now = new Date();

  // ── Get upcoming sessions ──────────────────────────────
  const getDateTime = (s) => {
    const d = new Date(s.sessionDate);
    if (s.sessionTime) {
      const [h, m] = s.sessionTime.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d;
  };

  const upcoming = sessions
    .filter(s => getDateTime(s) > now)
    .sort((a, b) => getDateTime(a) - getDateTime(b));

  const nextSession = upcoming[0] || null;
  const upcomingApplied = upcoming.filter(s => appliedSessions.has(s._id));

  // ── Stats
  const totalSessions  = sessions.length;
  const pastSessions   = sessions.filter(s => getDateTime(s) <= now);
  const appliedCount   = appliedSessions.size;

  const attendance = student?.attendance || 0;
  const cgpa       = (() => {
    if (!student?.semesters?.length) return "—";
    let tc = 0, tg = 0;
    student.semesters.forEach(s => { tc += s.totalCredits || 0; tg += s.totalCG || 0; });
    return tc ? (tg / tc).toFixed(2) : "—";
  })();

  const quickActions = [
    { icon: "fa-calendar-check", label: "My Sessions",   tab: "sessions",     color: "#6366f1", count: upcoming.length, countLabel: "upcoming" },
    { icon: "fa-bullhorn",       label: "Messages",       tab: "messages",     color: "#f97316", count: null },
    { icon: "fa-list-check",     label: "Tasks",          tab: "tasks",        color: "#10b981", count: null },
    { icon: "fa-vault",          label: "Doc Vault",      tab: "vault",        color: "#8b5cf6", count: null },
    { icon: "fa-award",          label: "Achievements",   tab: "achievements", color: "#f59e0b", count: null },
    { icon: "fa-book-open-reader","label": "Learning Hub", tab: "learning",     color: "#06b6d4", count: null },
  ];

  const studyTips = [
    "Check the Learning Hub regularly — your faculty posts new materials there.",
    "Sessions marked IMPORTANT require mandatory attendance.",
    "Keep your attendance above 75% to avoid shortage warnings.",
    "Update your profile to 100% to unlock all portal features.",
    "Apply for upcoming sessions early — spots may be limited.",
    "Check your semester exam records after result publication.",
  ];
  const tipOfDay = studyTips[new Date().getDay() % studyTips.length];

  return (
    <div className="sds-root">

      {/* ══ UPCOMING SESSION HIGHLIGHT ══════════════════════════ */}
      {nextSession && (() => {
        const meta  = TYPE_META[nextSession.sessionType] || TYPE_META.other;
        const timer = timeUntil(nextSession.sessionDate, nextSession.sessionTime);
        const date  = getDateTime(nextSession);
        const isApplied = appliedSessions.has(nextSession._id);

        return (
          <div className={`sds-next-session ${timer?.urgency || ""} ${nextSession.isImportant ? "sds-important" : ""}`}>
            <div className="sds-next-left">
              {nextSession.isImportant && (
                <div className="sds-imp-flag">
                  <i className="fa-solid fa-exclamation-triangle"></i> IMPORTANT
                </div>
              )}
              <div className="sds-next-eyebrow">
                <i className="fa-solid fa-calendar-check"></i> Next Upcoming Session
              </div>
              <h2 className="sds-next-title">{nextSession.title}</h2>
              <div className="sds-next-meta-row">
                <span className="sds-next-type-badge" style={{ background: meta.color + "22", color: meta.color }}>
                  <i className={`fa-solid ${meta.icon}`}></i>
                  {nextSession.sessionType.charAt(0).toUpperCase() + nextSession.sessionType.slice(1)}
                </span>
                <span className="sds-next-date">
                  <i className="fa-solid fa-calendar"></i>
                  {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {nextSession.sessionTime && ` · ${nextSession.sessionTime}`}
                </span>
                {nextSession.venue && (
                  <span className="sds-next-venue">
                    <i className="fa-solid fa-location-dot"></i> {nextSession.venue}
                  </span>
                )}
                <span className="sds-next-faculty">
                  <i className="fa-solid fa-user-tie"></i> {nextSession.facultyName}
                </span>
              </div>
              <div className="sds-next-actions">
                <button className="sds-view-btn" onClick={() => setActiveTab("sessions")}>
                  <i className="fa-solid fa-arrow-right"></i> View All Sessions
                </button>
                {isApplied && (
                  <span className="sds-applied-chip">
                    <i className="fa-solid fa-circle-check"></i> Registered
                  </span>
                )}
              </div>
            </div>

            <div className="sds-next-right">
              {timer ? (
                <div className={`sds-countdown ${timer.urgency}`}>
                  <div className="sds-countdown-val">{timer.label}</div>
                  <div className="sds-countdown-label">
                    {timer.urgency === "urgent" ? "⚡ Starts soon!" : "Until session"}
                  </div>
                </div>
              ) : (
                <div className="sds-countdown later">
                  <div className="sds-countdown-val">{upcoming.length}</div>
                  <div className="sds-countdown-label">Upcoming</div>
                </div>
              )}
              <div className="sds-next-bullets">
                {upcoming.slice(1, 4).map((s, i) => {
                  const sm = TYPE_META[s.sessionType] || TYPE_META.other;
                  const st = timeUntil(s.sessionDate, s.sessionTime);
                  return (
                    <div key={i} className="sds-bullet-row">
                      <span className="sds-bullet-dot" style={{ background: sm.color }}></span>
                      <span className="sds-bullet-title">{s.title}</span>
                      <span className="sds-bullet-time">{st?.label || "Upcoming"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* No upcoming sessions — soft reminder */}
      {upcoming.length === 0 && (
        <div className="sds-no-sessions">
          <div className="sds-no-sessions-icon"><i className="fa-solid fa-calendar-xmark"></i></div>
          <div>
            <h4>No Upcoming Sessions</h4>
            <p>You're all clear! Your faculty will schedule new sessions soon.</p>
          </div>
          <button className="sds-view-btn-alt" onClick={() => setActiveTab("sessions")}>
            View Past Sessions
          </button>
        </div>
      )}

      {/* ══ ACTIVITY STATS STRIP ════════════════════════════════ */}
      <div className="sds-stats-strip">
        {[
          { icon: "fa-calendar-check",  color: "#6366f1", val: upcoming.length,  label: "Upcoming Sessions"  },
          { icon: "fa-circle-check",    color: "#10b981", val: appliedCount,      label: "Sessions Applied"   },
          { icon: "fa-clock-rotate-left",color: "#f97316",val: pastSessions.length,label: "Past Sessions"     },
          { icon: "fa-chart-line",      color: "#8b5cf6", val: attendance + "%",  label: "Attendance"         },
          { icon: "fa-trophy",          color: "#f59e0b", val: cgpa,              label: "CGPA"               },
          { icon: "fa-graduation-cap",  color: "#ef4444", val: student?.semesters?.length || 0, label: "Semesters" },
        ].map((s, i) => (
          <div key={i} className="sds-stat-chip">
            <div className="sds-stat-chip-icon" style={{ background: s.color + "1a", color: s.color }}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div>
              <div className="sds-stat-chip-val">{s.val}</div>
              <div className="sds-stat-chip-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ QUICK ACTIONS ═══════════════════════════════════════ */}
      <div className="sds-section-title">
        <i className="fa-solid fa-bolt"></i> Quick Access
      </div>
      <div className="sds-quick-grid">
        {quickActions.map((a, i) => (
          <button key={i} className="sds-quick-card" onClick={() => setActiveTab(a.tab)}>
            <div className="sds-quick-icon" style={{ background: a.color + "18", color: a.color }}>
              <i className={`fa-solid ${a.icon}`}></i>
            </div>
            <span className="sds-quick-label">{a.label}</span>
            {a.count > 0 && (
              <span className="sds-quick-badge" style={{ background: a.color }}>
                {a.count} {a.countLabel}
              </span>
            )}
            <i className="fa-solid fa-arrow-right sds-quick-arrow"></i>
          </button>
        ))}
      </div>

      {/* ══ APPLIED SESSIONS MINI STRIP ═════════════════════════ */}
      {upcomingApplied.length > 0 && (
        <>
          <div className="sds-section-title" style={{ marginTop: "32px" }}>
            <i className="fa-solid fa-circle-check" style={{ color: "#10b981" }}></i> You're Registered For
          </div>
          <div className="sds-applied-strip">
            {upcomingApplied.slice(0, 4).map((s, i) => {
              const meta  = TYPE_META[s.sessionType] || TYPE_META.other;
              const timer = timeUntil(s.sessionDate, s.sessionTime);
              return (
                <div key={i} className="sds-applied-card">
                  <div className="sds-applied-icon" style={{ background: meta.color + "18", color: meta.color }}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                  </div>
                  <div className="sds-applied-info">
                    <span className="sds-applied-title">{s.title}</span>
                    <span className="sds-applied-time">
                      {timer ? timer.label + " away" : "Upcoming"}
                    </span>
                  </div>
                  <span className="sds-applied-tick">
                    <i className="fa-solid fa-circle-check"></i>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══ TIP OF THE DAY ═══════════════════════════════════════ */}
      <div className="sds-tip">
        <div className="sds-tip-icon"><i className="fa-solid fa-lightbulb"></i></div>
        <div>
          <strong>Tip of the Day</strong>
          <p>{tipOfDay}</p>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboardShowcase;
