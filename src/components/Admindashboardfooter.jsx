import React, { useState } from "react";

// ============================================================
// AdminDashboardFooter.jsx
// Rich footer for the admin panel — shown at the bottom of
// every admin view (place at bottom of erp-main-content)
//
// Usage in AdminDashboard.jsx:
//   import AdminDashboardFooter from './AdminDashboardFooter';
//   // Inside the JSX (below erp-view-container):
//   <AdminDashboardFooter collegeName={collegeName} adminEmail={adminEmail} />
// ============================================================

const AdminDashboardFooter = ({ collegeName = "", adminEmail = "" }) => {
  const [modal, setModal]   = useState(null); // "about" | "privacy" | "contact" | "shortcuts"
  const year = new Date().getFullYear();

  const Modal = ({ title, children }) => (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:9999,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
      onClick={() => setModal(null)}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520,
        maxHeight:"80vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 28px", borderBottom:"1px solid #f1f5f9",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#0f172a" }}>{title}</h3>
          <button onClick={() => setModal(null)}
            style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#94a3b8", lineHeight:1 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div style={{ padding:"24px 28px", fontSize:14, color:"#475569", lineHeight:1.75 }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer style={{
        marginTop: 40, background: "#0f172a", borderRadius: 20,
        padding: "36px 40px 24px", fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>

        {/* ── Top row: Brand + 4 link groups ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr 1fr 1fr 1fr", gap:32, marginBottom:32 }}>

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"#6366f1",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <i className="fa-solid fa-building-columns" style={{ color:"#fff", fontSize:18 }} />
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff", letterSpacing:"-0.01em" }}>MentorInsight</div>
                <div style={{ fontSize:11, color:"#475569", fontWeight:600 }}>Admin Control Panel</div>
              </div>
            </div>
            <p style={{ margin:"0 0 12px", fontSize:13, color:"#64748b", lineHeight:1.7 }}>
              Comprehensive ERP platform for educational institutions. Manage students, faculty, batches, and performance from one place.
            </p>
            {collegeName && (
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 12px",
                background:"#1e293b", borderRadius:9, width:"fit-content" }}>
                <i className="fa-solid fa-building-columns" style={{ color:"#6366f1", fontSize:12 }} />
                <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>{collegeName}</span>
              </div>
            )}
          </div>

          {/* Platform links */}
          <div>
            <h4 style={{ margin:"0 0 14px", fontSize:11, fontWeight:700, color:"#475569",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>Platform</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:"fa-grid-2",           label:"Dashboard" },
                { icon:"fa-building-columns", label:"Departments" },
                { icon:"fa-user-tie",         label:"Faculty" },
                { icon:"fa-user-graduate",    label:"Students" },
                { icon:"fa-star-half-stroke", label:"Reviews" },
              ].map((l, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                  fontSize:13, color:"#64748b", cursor:"default" }}>
                  <i className={`fa-solid ${l.icon}`} style={{ width:14, textAlign:"center", opacity:.6 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Management */}
          <div>
            <h4 style={{ margin:"0 0 14px", fontSize:11, fontWeight:700, color:"#475569",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>Management</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:"fa-book-open",  label:"Courses" },
                { icon:"fa-book",       label:"Library" },
                { icon:"fa-users-gear", label:"Staff" },
                { icon:"fa-chart-pie",  label:"Analytics" },
                { icon:"fa-bullhorn",   label:"Broadcasts" },
              ].map((l, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                  fontSize:13, color:"#64748b", cursor:"default" }}>
                  <i className={`fa-solid ${l.icon}`} style={{ width:14, textAlign:"center", opacity:.6 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ margin:"0 0 14px", fontSize:11, fontWeight:700, color:"#475569",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>Support</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"About MentorInsight", action: () => setModal("about")   },
                { label:"Privacy Policy",      action: () => setModal("privacy") },
                { label:"Contact Support",     action: () => setModal("contact") },
                { label:"Keyboard Shortcuts",  action: () => setModal("shortcuts") },
                { label:"Terms of Service",    action: () => setModal("terms")   },
              ].map((l, i) => (
                <button key={i} onClick={l.action}
                  style={{ background:"none", border:"none", textAlign:"left", cursor:"pointer",
                    fontSize:13, color:"#64748b", padding:0,
                    transition:"color 0.15s", display:"flex", alignItems:"center", gap:7 }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize:9, opacity:.4 }} />
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Status */}
          <div>
            <h4 style={{ margin:"0 0 14px", fontSize:11, fontWeight:700, color:"#475569",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>Contact</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12, color:"#64748b" }}>
                <i className="fa-solid fa-envelope" style={{ marginTop:1, opacity:.5 }} />
                <span>mentorinsight.portal@gmail.com</span>
              </div>
              {adminEmail && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12, color:"#64748b" }}>
                  <i className="fa-solid fa-user-shield" style={{ marginTop:1, opacity:.5 }} />
                  <span style={{ wordBreak:"break-all" }}>{adminEmail}</span>
                </div>
              )}
              <div style={{ marginTop:8, padding:"10px 12px", background:"#1e293b",
                borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", flexShrink:0 }} />
                <span style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>All systems operational</span>
              </div>
              <div style={{ fontSize:11, color:"#334155" }}>
                <span style={{ fontWeight:700, color:"#6366f1" }}>v2.5.0</span> — MentorInsight ERP
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height:1, background:"#1e293b", marginBottom:20 }} />

        {/* ── Bottom bar ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <p style={{ margin:0, fontSize:12, color:"#334155" }}>
            © {year} <span style={{ color:"#6366f1", fontWeight:700 }}>MentorInsight</span> — All rights reserved.
            {collegeName && (
              <span style={{ color:"#475569" }}> · {collegeName}</span>
            )}
          </p>
          <div style={{ display:"flex", gap:16 }}>
            {["About", "Privacy", "Contact"].map((l, i) => (
              <button key={i}
                onClick={() => setModal(l.toLowerCase())}
                style={{ background:"none", border:"none", color:"#475569", fontSize:12,
                  cursor:"pointer", fontWeight:600, padding:0 }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#334155" }}>
            <i className="fa-solid fa-lock" style={{ color:"#10b981" }} />
            Secured · End-to-End Encrypted
          </div>
        </div>
      </footer>

      {/* ══ MODALS ════════════════════════════════════════════════ */}
      {modal === "about" && (
        <Modal title="About MentorInsight">
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:"14px 16px",
            background:"#f8fafc", borderRadius:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"#6366f1",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <i className="fa-solid fa-building-columns" style={{ color:"#fff", fontSize:20 }} />
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>MentorInsight ERP</div>
              <div style={{ fontSize:12, color:"#64748b" }}>Version 2.5.0 — Admin Panel</div>
            </div>
          </div>
          <p>MentorInsight is a comprehensive Educational Resource Planning (ERP) system designed for modern academic institutions.</p>
          <p>Built to streamline the administration of students, faculty, departments, sessions, reviews, and academic campaigns — all from a single secure portal.</p>
          <div style={{ padding:"14px 16px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0", marginTop:12 }}>
            <div style={{ fontWeight:700, color:"#15803d", marginBottom:6 }}>✅ Features</div>
            <ul style={{ margin:0, paddingLeft:18, display:"flex", flexDirection:"column", gap:4 }}>
              {["Student & Faculty Management","Batch & Department Organization","Faculty Review Campaigns","Analytics & Performance Insights","Broadcast Messaging System","Learning Resource Hub"].map((f, i) => (
                <li key={i} style={{ fontSize:13 }}>{f}</li>
              ))}
            </ul>
          </div>
        </Modal>
      )}

      {modal === "privacy" && (
        <Modal title="Privacy Policy">
          <p><strong>Data Collection:</strong> MentorInsight collects institution data (student names, roll numbers, faculty information, academic records) solely for the purpose of operating the ERP system.</p>
          <p><strong>Data Storage:</strong> All data is stored securely in your institution's dedicated database. MentorInsight does not share data with third parties.</p>
          <p><strong>Admin Access:</strong> Only verified administrators with the correct access credentials can view and manage institution data.</p>
          <p><strong>Student Privacy:</strong> Student reviews submitted through the Faculty Review system are stored anonymously by default. Roll numbers are only used for identification within the platform.</p>
          <p><strong>Data Deletion:</strong> Institutions may request full data deletion by contacting support. All records including student and faculty data will be permanently removed.</p>
          <div style={{ padding:"12px 14px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0", fontSize:12, color:"#166534" }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight:8 }} />
            Your institution's data is your property. We are custodians, not owners.
          </div>
        </Modal>
      )}

      {modal === "contact" && (
        <Modal title="Contact Support">
          <p>Need help with MentorInsight? Our team is here to assist you.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:16 }}>
            {[
              { icon:"fa-envelope",  color:"#6366f1", label:"Email Support", val:"mentorinsight.portal@gmail.com" },
              { icon:"fa-clock",     color:"#10b981", label:"Response Time",  val:"Within 24 hours on working days" },
              { icon:"fa-comments",  color:"#f59e0b", label:"Community",      val:"GitHub Discussions (link in docs)" },
            ].map((c, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 16px",
                background:"#f8fafc", borderRadius:12, border:"1px solid #e2e8f0" }}>
                <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, display:"flex",
                  alignItems:"center", justifyContent:"center", fontSize:16,
                  background: c.color + "18", color: c.color }}>
                  <i className={`fa-solid ${c.icon}`} />
                </div>
                <div>
                  <div style={{ fontWeight:700, color:"#0f172a", marginBottom:3, fontSize:13 }}>{c.label}</div>
                  <div style={{ fontSize:13, color:"#475569" }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, padding:"12px 14px", background:"#eff6ff",
            borderRadius:10, border:"1px solid #bfdbfe", fontSize:12, color:"#1e40af" }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight:8 }} />
            For urgent issues, include your college name and describe the issue clearly in the subject line.
          </div>
        </Modal>
      )}

      {modal === "shortcuts" && (
        <Modal title="Keyboard Shortcuts">
          <p style={{ marginTop:0 }}>Navigate the admin panel faster using these tips:</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { keys:["Ctrl","D"],    desc:"Go to Dashboard Overview" },
              { keys:["Ctrl","F"],    desc:"Go to Faculty" },
              { keys:["Ctrl","S"],    desc:"Go to Students" },
              { keys:["Ctrl","B"],    desc:"Go to Batches / Departments" },
              { keys:["Ctrl","R"],    desc:"Go to Reviews" },
              { keys:["Ctrl","A"],    desc:"Go to Analytics" },
              { keys:["Ctrl","L"],    desc:"Logout" },
            ].map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"10px 14px", background:"#f8fafc", borderRadius:10 }}>
                <span style={{ fontSize:13, color:"#475569" }}>{s.desc}</span>
                <div style={{ display:"flex", gap:4 }}>
                  {s.keys.map((k, j) => (
                    <kbd key={j} style={{ padding:"3px 8px", background:"#fff", border:"1px solid #e2e8f0",
                      borderRadius:6, fontSize:11, fontWeight:700, color:"#334155",
                      boxShadow:"0 2px 0 #e2e8f0" }}>{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop:16, fontSize:12, color:"#94a3b8" }}>
            Note: Keyboard shortcut implementation requires adding a keydown listener in AdminDashboard.jsx.
          </p>
        </Modal>
      )}

      {modal === "terms" && (
        <Modal title="Terms of Service">
          <p><strong>Usage:</strong> MentorInsight is licensed for use by registered educational institutions. Unauthorized use is prohibited.</p>
          <p><strong>Admin Responsibility:</strong> The admin is responsible for maintaining the accuracy of student and faculty records. MentorInsight is not liable for data input errors.</p>
          <p><strong>Access Codes:</strong> Admin access codes must be kept confidential. The platform provides a secure recovery mechanism if codes are lost.</p>
          <p><strong>Review System:</strong> Faculty reviews are tools for institutional improvement. They must not be used for harassment or discrimination.</p>
          <p><strong>Modifications:</strong> These terms may be updated. Continued use of the platform constitutes acceptance of updated terms.</p>
          <div style={{ padding:"12px 14px", background:"#fefce8", borderRadius:10, border:"1px solid #fde68a",
            fontSize:12, color:"#92400e", marginTop:8 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight:8 }} />
            By using MentorInsight, you agree to these terms on behalf of your institution.
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminDashboardFooter;
