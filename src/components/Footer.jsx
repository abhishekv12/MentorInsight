import React, { useState } from "react";
import { Link } from "react-router-dom";

// ============================================================
// Footer.jsx — Redesigned landing footer (dark premium)
// ============================================================

const Footer = () => {
  const [modal, setModal] = useState(null);
  const year = new Date().getFullYear();

  const Modal = ({ title, children }) => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:9999,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(6px)" }}
      onClick={() => setModal(null)}>
      <div style={{ background:"#0d1520", border:"1px solid rgba(255,255,255,.1)", borderRadius:20,
        width:"100%", maxWidth:520, maxHeight:"80vh", overflowY:"auto",
        boxShadow:"0 40px 100px rgba(0,0,0,.7)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 28px", borderBottom:"1px solid rgba(255,255,255,.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>{title}</h3>
          <button onClick={() => setModal(null)} style={{ background:"none", border:"none",
            fontSize:20, cursor:"pointer", color:"#475569" }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", fontSize:14, color:"#64748b", lineHeight:1.8 }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .lp-footer {
          background: #030710;
          border-top: 1px solid rgba(255,255,255,.05);
          padding: 70px 6vw 32px;
          font-family: 'DM Sans', sans-serif;
        }
        .lp-footer-grid {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 56px;
        }
        .lp-footer-brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .lp-footer-logo-icon {
          width: 38px; height: 38px; border-radius: 11px; background: #6366f1;
          display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;
        }
        .lp-footer-logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.015em;
        }
        .lp-footer-desc { font-size: 13.5px; color: #334155; line-height: 1.8; margin: 0 0 22px; }
        .lp-footer-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 12px; border: 1px solid rgba(16,185,129,.2);
          border-radius: 100px; font-size: 11px; font-weight: 600;
          color: #10b981; background: rgba(16,185,129,.07);
        }
        .lp-footer-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; }
        .lp-footer-col-h4 {
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: .07em;
          margin: 0 0 16px;
        }
        .lp-footer-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .lp-footer-links li a, .lp-footer-links li button {
          font-size: 13.5px; color: #334155; text-decoration: none;
          background: none; border: none; cursor: pointer; padding: 0;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: color .15s; text-align: left;
        }
        .lp-footer-links li a:hover, .lp-footer-links li button:hover { color: #a5b4fc; }
        .lp-footer-divider { max-width: 1240px; margin: 0 auto 28px; height: 1px; background: rgba(255,255,255,.05); }
        .lp-footer-bottom {
          max-width: 1240px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .lp-footer-copy { font-size: 12px; color: #1e3050; }
        .lp-footer-copy span { color: #6366f1; font-weight: 700; }
        .lp-footer-legal { display: flex; gap: 20px; }
        .lp-footer-legal button {
          background: none; border: none; cursor: pointer;
          font-size: 12px; color: #1e3050; padding: 0;
          font-family: 'DM Sans', sans-serif; transition: color .15s;
        }
        .lp-footer-legal button:hover { color: #6366f1; }
        .lp-footer-secure { font-size: 11px; color: #1e3050; display: flex; align-items: center; gap: 6px; }

        @media(max-width: 860px) {
          .lp-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width: 560px) {
          .lp-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="lp-footer">
        <div className="lp-footer-grid">
          {/* Brand */}
          <div>
            <div className="lp-footer-brand-logo">
              <div className="lp-footer-logo-icon"><i className="fa-solid fa-graduation-cap" /></div>
              <span className="lp-footer-logo-name">MentorInsight</span>
            </div>
            <p className="lp-footer-desc">
              MentorInsight — the complete academic ERP for modern Indian institutions.
              Trusted by students, faculty, and admins across 80+ colleges.
            </p>
            <div className="lp-footer-badge">
              <span className="lp-footer-badge-dot" />
              All systems operational
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="lp-footer-col-h4">Platform</h4>
            <ul className="lp-footer-links">
              {[
                { label: "Admin Portal",    to: "/admin-dashboard"   },
                { label: "Faculty Portal",  to: "/faculty-dashboard" },
                { label: "Student Portal",  to: "/student-dashboard" },
                { label: "Login / Register",to: "/login-selection"  },
              ].map((l, i) => (
                <li key={i}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="lp-footer-col-h4">Features</h4>
            <ul className="lp-footer-links">
              {["Faculty Reviews","Batch Management","Learning Hub","Broadcast Messaging","Session Notifications","Analytics Dashboard"].map((f, i) => (
                <li key={i}><a href="#features">{f}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="lp-footer-col-h4">Support</h4>
            <ul className="lp-footer-links">
              {[
                { label: "About MentorInsight",       action: () => setModal("about")   },
                { label: "Privacy Policy",   action: () => setModal("privacy") },
                { label: "Terms of Service", action: () => setModal("terms")   },
                { label: "Contact Us",       action: () => setModal("contact") },
              ].map((l, i) => (
                <li key={i}><button onClick={l.action}>{l.label}</button></li>
              ))}
              <li><a href="mailto:mentorinsight.portal@gmail.com" style={{ wordBreak: "break-all" }}>mentorinsight.portal@gmail.com</a></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-divider" />

        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">© {year} <span>MentorInsight</span> — Mentor Mentee Monitoring Portal. All rights reserved.</p>
          <div className="lp-footer-legal">
            {[["Privacy", "privacy"], ["Terms", "terms"], ["About", "about"]].map(([label, id]) => (
              <button key={id} onClick={() => setModal(id)}>{label}</button>
            ))}
          </div>
          <div className="lp-footer-secure">
            <i className="fa-solid fa-lock" style={{ color: "#10b981" }} />
            Secure · Encrypted · GDPR-aware
          </div>
        </div>
      </footer>

      {/* Modals */}
      {modal === "about" && (
        <Modal title="About MentorInsight">
          <p style={{ color: "#94a3b8" }}>
            MentorInsight (Mentor-Mentee Monitoring Portal) is a comprehensive ERP platform built for educational institutions.
            It connects administrators, faculty, and students through one unified system.
          </p>
          <p style={{ color: "#94a3b8" }}>
            Built to handle the full lifecycle of academic mentorship — from batch creation and session scheduling
            to anonymous faculty reviews and learning resource management.
          </p>
          <div style={{ padding: "14px 16px", background: "rgba(99,102,241,.1)", borderRadius: 12, border: "1px solid rgba(99,102,241,.2)", marginTop: 12 }}>
            <div style={{ color: "#a5b4fc", fontWeight: 700, marginBottom: 8 }}>Platform Highlights</div>
            {["Admin, Faculty & Student dashboards","Anonymous faculty review campaigns","Real-time session & broadcast system","Learning Hub with resource sharing","Certifications & document vault","Deep analytics and attendance tracking"].map((f, i) => (
              <div key={i} style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>✓ {f}</div>
            ))}
          </div>
        </Modal>
      )}
      {modal === "privacy" && (
        <Modal title="Privacy Policy">
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Data Collection:</strong> MentorInsight collects institution data (student names, roll numbers, faculty information, academic records) solely for operating the ERP system.</p>
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Data Storage:</strong> All data is stored in your institution's dedicated database. MentorInsight does not share data with third parties.</p>
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Review Anonymity:</strong> Student reviews are stored anonymously by default. Roll numbers are only used for identification within the platform.</p>
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Data Deletion:</strong> Institutions may request full data deletion by contacting support.</p>
        </Modal>
      )}
      {modal === "terms" && (
        <Modal title="Terms of Service">
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Usage:</strong> MentorInsightis licensed for use by registered educational institutions. Unauthorized use is prohibited.</p>
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Admin Responsibility:</strong> The admin is responsible for maintaining the accuracy of student and faculty records.</p>
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Review System:</strong> Faculty reviews are tools for institutional improvement. They must not be used for harassment or discrimination.</p>
          <p style={{ color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Modifications:</strong> These terms may be updated. Continued use constitutes acceptance.</p>
        </Modal>
      )}
      {modal === "contact" && (
        <Modal title="Contact Support">
          <p style={{ color: "#94a3b8" }}>Need help with MentorInsight? Reach out to our team:</p>
          {[
            { icon: "fa-envelope", color: "#6366f1", label: "Email", val: "mentorinsight.portal@gmail.com" },
            { icon: "fa-clock",    color: "#10b981", label: "Response", val: "Within 24 hours on working days" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              background: "rgba(255,255,255,.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)", marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 16,
                background: c.color + "18", color: c.color }}>
                <i className={`fa-solid ${c.icon}`} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 3, fontSize: 13 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{c.val}</div>
              </div>
            </div>
          ))}
        </Modal>
      )}
    </>
  );
};

export default Footer;