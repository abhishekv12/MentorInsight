import React, { useState } from "react";

const Dashboardfooter = ({ collegeName }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <footer className="dashboard-footer">
        <div className="footer-inner">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <i className="fa-solid fa-graduation-cap"></i>
              <span>MentorInsight</span>
            </div>
            <p className="footer-tagline">Academic Management Portal — Empowering Students & Faculty</p>
            {collegeName && (
              <p className="footer-college">
                <i className="fa-solid fa-building-columns"></i>
                {collegeName}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="footer-links-group">
            <h4>Portal</h4>
            <ul>
              <li><button onClick={() => setShowAbout(true)}><i className="fa-solid fa-circle-info"></i> About MentorInsight</button></li>
              <li><button onClick={() => setShowContact(true)}><i className="fa-solid fa-headset"></i> Contact Support</button></li>
              <li><button onClick={() => setShowPrivacy(true)}><i className="fa-solid fa-shield-halved"></i> Privacy Policy</button></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <ul>
              <li><span><i className="fa-solid fa-chart-pie"></i> Dashboard Overview</span></li>
              <li><span><i className="fa-solid fa-calendar-check"></i> Attendance Records</span></li>
              <li><span><i className="fa-solid fa-graduation-cap"></i> Examination Results</span></li>
              <li><span><i className="fa-solid fa-bell"></i> Session Notifications</span></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Support</h4>
            <ul>
              <li><span><i className="fa-solid fa-envelope"></i> mentorinsight.portal@gmail.com</span></li>
              <li><span><i className="fa-solid fa-clock"></i> Mon–Fri, 9 AM – 5 PM</span></li>
              <li>
                <span className="footer-version-badge">
                  <i className="fa-solid fa-code-branch"></i> v2.0.0
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>© 2026 MentorInsight Portal. All rights reserved.</span>
          <div className="footer-bottom-links">
            <button onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
            <span>·</span>
            <button onClick={() => setShowContact(true)}>Support</button>
            <span>·</span>
            <button onClick={() => setShowAbout(true)}>About</button>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="footer-modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="footer-modal" onClick={e => e.stopPropagation()}>
            <div className="footer-modal-header">
              <h2><i className="fa-solid fa-circle-info"></i> About MentorInsight</h2>
              <button onClick={() => setShowAbout(false)}><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="footer-modal-body">
              <div className="footer-modal-logo">
                <i className="fa-solid fa-graduation-cap"></i>
                <h3>MentorInsight Portal</h3>
                <span className="footer-version-tag">Version 2.0.0</span>
              </div>
              <p>MentorInsight is a comprehensive academic management portal designed to bridge the gap between students and faculty. It provides real-time tracking of attendance, examination results, session notifications, and personalized academic data.</p>
              <div className="footer-modal-features">
                <div className="footer-feature-item">
                  <i className="fa-solid fa-chart-bar" style={{ color: "#667eea" }}></i>
                  <span>Real-time attendance tracking with multi-year analytics</span>
                </div>
                <div className="footer-feature-item">
                  <i className="fa-solid fa-graduation-cap" style={{ color: "#10b981" }}></i>
                  <span>Detailed semester-wise examination records & CGPA</span>
                </div>
                <div className="footer-feature-item">
                  <i className="fa-solid fa-bell" style={{ color: "#f97316" }}></i>
                  <span>Session notifications with apply/cancel functionality</span>
                </div>
                <div className="footer-feature-item">
                  <i className="fa-solid fa-vault" style={{ color: "#8b5cf6" }}></i>
                  <span>Secure document vault for academic documents</span>
                </div>
                <div className="footer-feature-item">
                  <i className="fa-solid fa-award" style={{ color: "#eab308" }}></i>
                  <span>Certifications & achievements showcase</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "20px" }}>
                Developed with ❤️ for students and educators. Built using React, Node.js, MongoDB, and Firebase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="footer-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="footer-modal" onClick={e => e.stopPropagation()}>
            <div className="footer-modal-header">
              <h2><i className="fa-solid fa-headset"></i> Contact Support</h2>
              <button onClick={() => setShowContact(false)}><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="footer-modal-body">
              <p>Need help? Reach out to our support team and we'll get back to you as soon as possible.</p>
              <div className="footer-contact-cards">
                <div className="footer-contact-card">
                  <div className="footer-contact-icon" style={{ background: "#eef2ff", color: "#667eea" }}>
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <strong>Email Support</strong>
                    <p>mentorinsight.portal@gmail.com</p>
                    <small>Response within 24 hours</small>
                  </div>
                </div>
                <div className="footer-contact-card">
                  <div className="footer-contact-icon" style={{ background: "#f0fdf4", color: "#10b981" }}>
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <strong>Support Hours</strong>
                    <p>Monday – Friday</p>
                    <small>9:00 AM – 5:00 PM IST</small>
                  </div>
                </div>
                <div className="footer-contact-card">
                  <div className="footer-contact-icon" style={{ background: "#fff7ed", color: "#f97316" }}>
                    <i className="fa-solid fa-circle-question"></i>
                  </div>
                  <div>
                    <strong>Common Issues</strong>
                    <p>Login problems, data queries</p>
                    <small>Contact your faculty mentor first</small>
                  </div>
                </div>
              </div>
              <div className="footer-contact-note">
                <i className="fa-solid fa-lightbulb"></i>
                <p>For academic queries (attendance, marks, etc.), please contact your assigned faculty mentor directly through the portal's messaging feature.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="footer-modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="footer-modal footer-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="footer-modal-header">
              <h2><i className="fa-solid fa-shield-halved"></i> Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)}><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="footer-modal-body footer-modal-scroll">
              <p className="footer-policy-date"><strong>Last updated:</strong> January 2026</p>

              <h4>1. Data We Collect</h4>
              <p>MentorInsight Portal collects academic information including name, roll number, enrollment number, attendance records, examination results, and contact details. This data is provided by your institution and faculty.</p>

              <h4>2. How We Use Your Data</h4>
              <p>Your data is used exclusively for academic management purposes: displaying your attendance, results, session notifications, and enabling faculty-student communication within the portal.</p>

              <h4>3. Data Storage</h4>
              <p>All academic data is stored securely on your institution's MongoDB database. Personal files uploaded to the Document Vault are stored locally in your browser (localStorage) and are not transmitted to any server.</p>

              <h4>4. Data Sharing</h4>
              <p>We do not share your personal data with third parties. Data is accessible only to your faculty mentor, institution administrators, and yourself.</p>

              <h4>5. Your Rights</h4>
              <p>You have the right to access your data, request corrections, and contact support for data-related queries. Contact your institution administrator for data deletion requests.</p>

              <h4>6. Security</h4>
              <p>We use Firebase Authentication for secure login. All API communications are handled over local network. Profile photos and documents uploaded are validated for size and type.</p>

              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "24px" }}>
                This privacy policy applies to the MentorInsight Portal academic management system. For institutional privacy policies, contact your college administration.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboardfooter;

