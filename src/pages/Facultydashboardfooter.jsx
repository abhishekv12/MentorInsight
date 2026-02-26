import React, { useState } from "react";

const FacultyDashboardfooter = ({ currentUser, assignedDepartment }) => {
  const [modal, setModal] = useState(null);

  const facultyName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Faculty";
  const department  = assignedDepartment?.name || assignedDepartment || "CS Department";
  const year        = new Date().getFullYear();

  const features = [
    { icon: "fa-users",           color: "#6366f1", label: "Batch Management",         desc: "FY / SY / TY batches with divisions" },
    { icon: "fa-bell",            color: "#10b981", label: "Session Notifications",     desc: "Schedule & notify students instantly" },
    { icon: "fa-bullhorn",        color: "#f97316", label: "Broadcast Messaging",       desc: "Priority announcements to any group" },
    { icon: "fa-graduation-cap",  color: "#8b5cf6", label: "Batch Promotion",           desc: "Promote students across academic years" },
    { icon: "fa-chart-bar",       color: "#ef4444", label: "Attendance Analytics",      desc: "Month-wise tracking with alerts" },
    { icon: "fa-file-pen",        color: "#f59e0b", label: "Examination Records",       desc: "SGPA, CGPA & semester grades" },
    { icon: "fa-user-check",      color: "#06b6d4", label: "Attendee Tracking",         desc: "Per-session student check-in" },
    { icon: "fa-award",           color: "#ec4899", label: "Student Insights",          desc: "Docs, certs & task overview" },
  ];

  const faqs = [
    { q: "How do I create a new class batch?",            a: "Click 'Create Class' on the Dashboard. Fill in batch name, academic year, and course. Your department is auto-filled from your faculty profile." },
    { q: "How do I send a session notification?",         a: "Click 'Send Session' in the sidebar. Fill in session details, pick the target batch and division, then click Send — students are notified instantly." },
    { q: "What is Batch Promotion?",                      a: "Batch Promotion moves FY students to SY, SY to TY. Click 'Promote Batch' on the dashboard, select students, and confirm." },
    { q: "How does Broadcast Messaging work?",            a: "Go to 'Broadcast' in the sidebar. Choose priority level, select batch/division, compose your message and send. Students see it in their Messages tab." },
    { q: "Why is my department showing 'Not Assigned'?",  a: "Your institution administrator needs to link your faculty account to a department. Contact them directly to resolve this." },
    { q: "Can I track which students attended a session?",a: "Yes! In 'My Sessions', click the attendee count pill on any session card to view the full attendee list with student details." },
  ];

  return (
    <>
      <footer className="fd-footer">
        <div className="fd-footer-glow"></div>

        <div className="fd-footer-inner">
          {/* ── Brand ── */}
          <div className="fd-footer-brand">
            <div className="fd-footer-logo-row">
              <div className="fd-footer-logo-icon">
                <i className="fa-solid fa-shapes"></i>
              </div>
              <div>
                <span className="fd-footer-logo-name">Faculty<strong>OS</strong></span>
                <span className="fd-footer-logo-ver">v2.0.0 · Stable</span>
              </div>
            </div>
            <p className="fd-footer-tagline">
              Empowering educators with intelligent tools to manage students, sessions, and academic outcomes — all in one place.
            </p>
            <div className="fd-footer-user-card">
              <div className="fd-footer-avatar">
                {facultyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="fd-footer-user-name">{facultyName}</p>
                <p className="fd-footer-user-dept">
                  <i className="fa-solid fa-building-columns"></i> {department}
                </p>
              </div>
            </div>
            <div className="fd-footer-tech-row">
              {["React", "Node.js", "MongoDB", "Firebase"].map(t => (
                <span key={t} className="fd-tech-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* ── Features ── */}
          <div className="fd-footer-col">
            <h4 className="fd-footer-col-title">
              <i className="fa-solid fa-sparkles"></i> Platform Features
            </h4>
            <ul className="fd-footer-feat-list">
              {features.map((f, i) => (
                <li key={i} className="fd-footer-feat-item">
                  <span className="fd-footer-feat-dot" style={{ background: f.color }}></span>
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Links ── */}
          <div className="fd-footer-col">
            <h4 className="fd-footer-col-title">
              <i className="fa-solid fa-circle-info"></i> Information
            </h4>
            <ul className="fd-footer-nav-list">
              {[
                { icon: "fa-circle-info",     label: "About FacultyOS",  key: "about"   },
                { icon: "fa-circle-question", label: "Help & FAQ",       key: "help"    },
                { icon: "fa-headset",         label: "Contact Support",  key: "contact" },
                { icon: "fa-shield-halved",   label: "Privacy Policy",   key: "privacy" },
              ].map(l => (
                <li key={l.key}>
                  <button className="fd-footer-nav-btn" onClick={() => setModal(l.key)}>
                    <i className={`fa-solid ${l.icon}`}></i> {l.label}
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="fd-footer-col-title" style={{ marginTop: "28px" }}>
              <i className="fa-solid fa-envelope"></i> Contact
            </h4>
            <ul className="fd-footer-nav-list">
              <li><span className="fd-footer-info-text"><i className="fa-solid fa-at"></i> mentorinsight.portal@gmail.com</span></li>
              <li><span className="fd-footer-info-text"><i className="fa-solid fa-clock"></i> Mon–Fri · 9 AM – 5 PM IST</span></li>
              <li><span className="fd-footer-info-text"><i className="fa-solid fa-circle-check"></i> Response within 24 hours</span></li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="fd-footer-bottom">
          <span>© {year} FacultyOS — MentorInsight Portal. All rights reserved.</span>
          <div className="fd-footer-bottom-links">
            {["privacy", "help", "contact", "about"].map((k, i, arr) => (
              <React.Fragment key={k}>
                <button onClick={() => setModal(k)}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
                {i < arr.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>

      {/* ══ MODALS ══ */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-glass fd-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px" }}>
                {modal === "about"   && <><i className="fa-solid fa-circle-info" style={{ color: "var(--primary)" }}></i> About FacultyOS</>}
                {modal === "help"    && <><i className="fa-solid fa-circle-question" style={{ color: "var(--acc-success)" }}></i> Help & FAQ</>}
                {modal === "contact" && <><i className="fa-solid fa-headset" style={{ color: "var(--acc-warning)" }}></i> Contact Support</>}
                {modal === "privacy" && <><i className="fa-solid fa-shield-halved" style={{ color: "var(--acc-blue)" }}></i> Privacy Policy</>}
              </h2>
              <button className="close-btn" onClick={() => setModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">

              {/* ABOUT */}
              {modal === "about" && (
                <>
                  <div className="fd-modal-hero-row">
                    <div className="fd-modal-hero-icon">
                      <i className="fa-solid fa-shapes"></i>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>Faculty<strong style={{ color: "var(--primary)" }}>OS</strong></h3>
                      <span className="fd-modal-ver-tag">Version 2.0.0 · Stable</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "28px", fontSize: "14px" }}>
                    FacultyOS is a comprehensive academic management platform built for educators in higher institutions. It streamlines the complete student lifecycle — from enrollment and batch management to session scheduling, attendance tracking, and examination records.
                  </p>
                  <div className="fd-feat-grid">
                    {features.map((f, i) => (
                      <div key={i} className="fd-feat-card">
                        <div className="fd-feat-icon" style={{ background: f.color + "1a", color: f.color }}>
                          <i className={`fa-solid ${f.icon}`}></i>
                        </div>
                        <div>
                          <strong style={{ fontSize: "13px", display: "block", marginBottom: "2px" }}>{f.label}</strong>
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "24px", textAlign: "center" }}>
                    Built with ❤️ using React · Node.js · MongoDB · Firebase Authentication
                  </p>
                </>
              )}

              {/* HELP */}
              {modal === "help" && (
                <>
                  <p style={{ color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.6, fontSize: "14px" }}>
                    Answers to the most common questions about using FacultyOS.
                  </p>
                  {faqs.map((item, i) => (
                    <div key={i} className="fd-faq-item">
                      <div className="fd-faq-q">
                        <i className="fa-solid fa-circle-question"></i> {item.q}
                      </div>
                      <p className="fd-faq-a">{item.a}</p>
                    </div>
                  ))}
                </>
              )}

              {/* CONTACT */}
              {modal === "contact" && (
                <>
                  <p style={{ color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.7, fontSize: "14px" }}>
                    Our support team is ready to assist you with any FacultyOS related issues.
                  </p>
                  <div className="fd-contact-grid">
                    {[
                      { icon: "fa-envelope",      color: "#6366f1", label: "Email Support",   value: "mentorinsight.portal@gmail.com", sub: "Response within 24 hours"   },
                      { icon: "fa-clock",         color: "#10b981", label: "Support Hours",   value: "Monday – Friday",               sub: "9:00 AM – 5:00 PM IST"       },
                      { icon: "fa-shield-halved", color: "#f97316", label: "Security Issues", value: "Report via support email",       sub: "We respond within 12 hours" },
                    ].map((c, i) => (
                      <div key={i} className="fd-contact-card">
                        <div className="fd-contact-icon" style={{ background: c.color + "1a", color: c.color }}>
                          <i className={`fa-solid ${c.icon}`}></i>
                        </div>
                        <div>
                          <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>{c.label}</strong>
                          <p style={{ fontSize: "13px", margin: "0 0 2px" }}>{c.value}</p>
                          <small style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.sub}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="fd-modal-note">
                    <i className="fa-solid fa-lightbulb"></i>
                    <p>For department assignment issues, contact your <strong>institution administrator</strong> — they manage faculty profiles and department links.</p>
                  </div>
                </>
              )}

              {/* PRIVACY */}
              {modal === "privacy" && (
                <>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
                    <strong>Last updated:</strong> January 2026
                  </p>
                  {[
                    { title: "1. Data We Collect",             body: "FacultyOS collects faculty profile information (name, email, department), batch and student data (names, roll numbers, attendance, marks), and session records. This data is provided through your institution's administrator account." },
                    { title: "2. How We Use Your Data",        body: "All data is used exclusively for academic management: displaying class rosters, tracking attendance, scheduling sessions, and generating student records. No data is used for advertising or third-party profiling." },
                    { title: "3. Data Storage & Security",     body: "Academic data is stored in MongoDB secured by your institution. Authentication is managed via Firebase Auth with industry-standard encryption. Session tokens expire automatically." },
                    { title: "4. Student Data Responsibility", body: "As a faculty member, you are responsible for the accuracy of student data you enter. Do not share student personal information outside the platform. Follow your institution's data protection policies." },
                    { title: "5. Data Access",                 body: "Student data is accessible to institution administrators and the students themselves (read-only for their own records). You can only view and update records for batches assigned to you." },
                    { title: "6. Your Rights",                 body: "You may request access to, correction of, or deletion of your faculty profile data. Contact your institution administrator or reach out via our support email for data-related queries." },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom: "20px" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>{s.title}</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.75 }}>{s.body}</p>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyDashboardfooter;

