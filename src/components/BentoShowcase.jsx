import React, { useState } from "react";

// ============================================================
// BentoShowcase.jsx — Refined Luxury Minimalism
// How it Works + Mentor-Mentee Book Showcase
// ============================================================

const HOW_STEPS = [
  {
    num: "01",
    icon: "fa-building-columns",
    title: "Admin Sets Up Institution",
    desc: "Register the college, create departments and batches, add faculty and enroll students. One-time setup, fully operational in under an hour.",
  },
  {
    num: "02",
    icon: "fa-chalkboard-user",
    title: "Faculty Manages Students",
    desc: "Log in, post sessions, send broadcasts, track attendance, view student profiles, and respond to review results — all in one portal.",
  },
  {
    num: "03",
    icon: "fa-user-graduate",
    title: "Students Engage & Grow",
    desc: "Access sessions, submit reviews, use the learning hub, upload certificates, and track progress across every semester.",
  },
];

const BOOK_TABS = [
  {
    id: "profile",
    icon: "fa-id-card",
    label: "Student Profile",
    title: "Complete Student Identity",
    desc: "Capture every detail that defines a student's academic identity — roll number, contact info, batch, and unique ID — all in one structured profile.",
    rows: [
      { label: "Student ID",  val: "2025-TYCS-047" },
      { label: "Name",        val: "Riya Sharma" },
      { label: "Batch",       val: "TYCS Division A" },
      { label: "Email",       val: "riya@mmmp.edu" },
      { label: "Contact",     val: "+91 98765 43210" },
    ],
    type: "kv",
  },
  {
    id: "academic",
    icon: "fa-graduation-cap",
    label: "Academic Records",
    title: "Historical Academic Vault",
    desc: "A secured repository of every academic milestone — 10th, 12th marksheets, university transcripts, and semester-wise performance data.",
    rows: [
      { label: "10th Grade",  val: "87.6%", pct: 88 },
      { label: "12th Grade",  val: "82.4%", pct: 82 },
      { label: "Sem 1 SGPA",  val: "8.2",   pct: 82 },
      { label: "Sem 2 SGPA",  val: "8.6",   pct: 86 },
      { label: "Sem 3 SGPA",  val: "8.9",   pct: 89 },
    ],
    type: "bar",
  },
  {
    id: "parents",
    icon: "fa-house-user",
    label: "Parents Details",
    title: "Guardian Connection",
    desc: "Complete family and guardian information so mentors can reach out and involve parents in the student's academic journey.",
    rows: [
      { label: "Father",      val: "Mr. Arun Sharma — Engineer" },
      { label: "Contact",     val: "+91 99876 54321" },
      { label: "Mother",      val: "Mrs. Sunita Sharma — Teacher" },
      { label: "Contact",     val: "+91 99876 11111" },
      { label: "Address",     val: "Thane, Maharashtra" },
    ],
    type: "kv",
  },
  {
    id: "objectives",
    icon: "fa-bullseye",
    label: "Goals & Objectives",
    title: "North Star Goal Tracking",
    desc: "Define short-term targets and long-term career aspirations. Mentors and students co-create a roadmap and track milestones together.",
    goals: [
      { text: "Complete DSA certification by March", done: true },
      { text: "Improve attendance above 85%",        done: false },
      { text: "Submit internship applications",       done: false },
    ],
    aspiration: { role: "Software Engineer — FAANG", target: "Placement 2026" },
    type: "goals",
  },
  {
    id: "performance",
    icon: "fa-chart-line",
    label: "Live Performance",
    title: "Real-Time Academic Tracking",
    desc: "Live visibility into current semester attendance, internal assessment scores, and CGPA trajectory. Automatic alerts below 75% threshold.",
    rows: [
      { label: "Attendance (Sem 6)",   val: "88%", pct: 88, warn: false },
      { label: "Internal Assessment",  val: "76%", pct: 76, warn: false },
      { label: "Unit Tests Avg",       val: "71%", pct: 71, warn: false },
      { label: "DSA Attendance",       val: "68%", pct: 68, warn: true },
    ],
    type: "bar",
  },
];

const BentoShowcase = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const active = BOOK_TABS.find((t) => t.id === activeTab);

  return (
    <>
      <style>{`
        /* ── How It Works ─────────────── */
        .lp-how-section {
          padding: 110px 7vw;
          background: var(--ink);
          border-top: 1px solid var(--rule);
          position: relative;
        }
        /* Hairline grid overlay */
        .lp-how-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--rule) 1px, transparent 1px),
            linear-gradient(90deg, var(--rule) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }

        .lp-how-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 10px;
          overflow: hidden;
          position: relative; z-index: 1;
        }
        .lp-step-card {
          background: var(--ink);
          padding: 40px 36px;
          transition: background 0.2s;
          position: relative;
        }
        .lp-step-card:hover { background: rgba(255,255,255,0.02); }
        .lp-step-num {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--ink-3);
          letter-spacing: 0.12em;
          margin-bottom: 28px;
          display: block;
        }
        .lp-step-icon {
          width: 44px; height: 44px; border-radius: 8px;
          background: var(--accent-dim);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          margin-bottom: 22px;
        }
        .lp-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          color: var(--cream);
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }
        .lp-step-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px; color: var(--muted);
          line-height: 1.75; margin: 0;
        }

        /* ── Book Showcase ────────────── */
        .lp-book-section {
          padding: 110px 7vw;
          background: var(--ink-2);
          border-top: 1px solid var(--rule);
        }

        .lp-book-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          border: 1px solid var(--rule);
          border-radius: 10px;
          overflow: hidden;
        }

        /* Sidebar nav */
        .lp-book-nav {
          background: var(--ink);
          border-right: 1px solid var(--rule);
          padding: 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lp-book-nav-heading {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: var(--ink-3);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 8px 12px 12px;
        }
        .lp-book-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--muted);
          font-family: 'Manrope', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.16s;
          text-align: left;
          width: 100%;
        }
        .lp-book-tab:hover:not(.active) { background: rgba(255,255,255,0.03); color: var(--muted-2); }
        .lp-book-tab.active { background: var(--accent-dim); color: var(--cream); }
        .lp-book-tab-icon {
          width: 26px; height: 26px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0;
        }

        /* Content panel */
        .lp-book-panel {
          padding: 44px 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
          background: var(--ink-2);
        }

        .lp-book-panel-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: var(--accent);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }
        .lp-book-panel-label::before {
          content: '';
          width: 16px; height: 1px;
          background: var(--accent);
        }
        .lp-book-panel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600;
          color: var(--cream);
          margin: 0 0 12px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .lp-book-panel-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px; color: var(--muted);
          line-height: 1.8; margin: 0;
        }

        /* Right: mock data */
        .lp-book-mock-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px; color: var(--muted);
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 14px;
        }
        .lp-kv-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid var(--rule);
        }
        .lp-kv-row:first-of-type { border-top: 1px solid var(--rule); }
        .lp-kv-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; color: var(--muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .lp-kv-val {
          font-family: 'Manrope', sans-serif;
          font-size: 12px; color: var(--cream-2); font-weight: 600;
        }
        .lp-bar-row { margin-bottom: 14px; }
        .lp-bar-head {
          display: flex; justify-content: space-between; margin-bottom: 6px;
        }
        .lp-bar-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; color: var(--muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .lp-bar-val {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.04em;
        }
        .lp-bar-track {
          height: 3px; background: var(--rule); border-radius: 2px;
        }
        .lp-bar-fill {
          height: 100%; border-radius: 2px;
          background: var(--accent);
          transition: width 0.5s ease;
        }
        .lp-bar-fill.warn { background: #f59e0b; }

        .lp-goal-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--rule);
        }
        .lp-goal-row:first-of-type { border-top: 1px solid var(--rule); }
        .lp-goal-icon { font-size: 12px; flex-shrink: 0; }
        .lp-goal-text {
          font-family: 'Manrope', sans-serif;
          font-size: 12px; color: var(--muted); line-height: 1.4;
        }
        .lp-goal-text.done { color: var(--cream-2); }
        .lp-aspiration {
          margin-top: 16px;
          padding: 14px;
          border: 1px solid rgba(74,74,244,0.2);
          border-radius: 6px;
          background: var(--accent-dim);
        }
        .lp-aspiration-role {
          font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 700; color: var(--cream);
          margin-bottom: 4px;
        }
        .lp-aspiration-target {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; color: var(--accent);
          letter-spacing: 0.06em;
        }

        @media(max-width:900px) {
          .lp-how-steps { grid-template-columns: 1fr; }
          .lp-book-layout { grid-template-columns: 1fr; }
          .lp-book-nav { flex-direction: row; flex-wrap: wrap; border-right: none; border-bottom: 1px solid var(--rule); }
          .lp-book-panel { grid-template-columns: 1fr; }
          .lp-book-nav-heading { display: none; }
        }
      `}</style>

      {/* HOW IT WORKS */}
      <section className="lp-how-section">
        <div className="lp-section-inner-wide">
          <div className="lp-section-label">
            <span className="lp-section-label-line" />
            How It Works
          </div>
          <h2 className="lp-section-h2">
            Up and running<br />
            <em style={{ fontStyle:'italic', color:'var(--cream-2)' }}>in minutes</em>
          </h2>
          <p className="lp-section-sub">
            From first login to a fully operational institution portal — the
            setup is designed to be fast, guided, and intuitive.
          </p>

          <div className="lp-how-steps">
            {HOW_STEPS.map((s, i) => (
              <div className="lp-step-card" key={i}>
                <span className="lp-step-num">STEP {s.num}</span>
                <div className="lp-step-icon">
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENTOR-MENTEE BOOK */}
      <section className="lp-book-section">
        <div className="lp-section-inner-wide">
          <div className="lp-section-label">
            <span className="lp-section-label-line" />
            Mentor-Mentee Book
          </div>
          <h2 className="lp-section-h2">
            The holistic<br />
            <em style={{ fontStyle:'italic', color:'var(--cream-2)' }}>student record</em>
          </h2>
          <p className="lp-section-sub">
            A 360° academic profile that goes beyond grades — capturing personal
            details, family info, goals, historical records, and live
            performance in one structured book.
          </p>

          <div className="lp-book-layout">
            {/* Nav */}
            <div className="lp-book-nav">
              <div className="lp-book-nav-heading">Student Records</div>
              {BOOK_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`lp-book-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span
                    className="lp-book-tab-icon"
                    style={{
                      background: activeTab === tab.id ? "rgba(74,74,244,0.2)" : "rgba(255,255,255,0.04)",
                      color: activeTab === tab.id ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    <i className={`fa-solid ${tab.icon}`} />
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className="lp-book-panel">
              {/* Left: description */}
              <div>
                <div className="lp-book-panel-label">{active.label}</div>
                <h3 className="lp-book-panel-title">{active.title}</h3>
                <p className="lp-book-panel-desc">{active.desc}</p>
              </div>

              {/* Right: data preview */}
              <div>
                <div className="lp-book-mock-label">Live Preview</div>

                {active.type === "kv" && (
                  <div>
                    {active.rows.map((r, i) => (
                      <div className="lp-kv-row" key={i}>
                        <span className="lp-kv-label">{r.label}</span>
                        <span className="lp-kv-val">{r.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {active.type === "bar" && (
                  <div>
                    {active.rows.map((r, i) => (
                      <div className="lp-bar-row" key={i}>
                        <div className="lp-bar-head">
                          <span className="lp-bar-label" style={r.warn ? { color: "#f59e0b" } : {}}>
                            {r.warn && <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5, fontSize: 9 }} />}
                            {r.label}
                          </span>
                          <span className="lp-bar-val" style={{ color: r.warn ? "#f59e0b" : "var(--accent)" }}>{r.val}</span>
                        </div>
                        <div className="lp-bar-track">
                          <div className={`lp-bar-fill ${r.warn ? "warn" : ""}`} style={{ width: `${r.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {active.type === "goals" && (
                  <div>
                    <div className="lp-book-mock-label" style={{ marginBottom: 10 }}>Short-Term Goals</div>
                    {active.goals.map((g, i) => (
                      <div className="lp-goal-row" key={i}>
                        <i
                          className={`fa-solid ${g.done ? "fa-circle-check" : "fa-circle"} lp-goal-icon`}
                          style={{ color: g.done ? "var(--accent)" : "var(--ink-3)" }}
                        />
                        <span className={`lp-goal-text ${g.done ? "done" : ""}`}>{g.text}</span>
                      </div>
                    ))}
                    <div className="lp-aspiration" style={{ marginTop: 18 }}>
                      <div className="lp-aspiration-role">{active.aspiration.role}</div>
                      <div className="lp-aspiration-target">Target · {active.aspiration.target}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BentoShowcase;