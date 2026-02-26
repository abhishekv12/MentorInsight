import React from "react";
import { Link } from "react-router-dom";

// ============================================================
// Ctasection.jsx — Refined Luxury Minimalism
// Testimonials + Trust + Final CTA
// ============================================================

const TESTIMONIALS = [
  {
    name: "Dr. Priya Mehta",
    role: "Principal, Mumbai College of Engineering",
    initial: "P",
    text: "MMMP completely transformed how we manage mentor-mentee relationships. The faculty review system is transparent, anonymous, and actually drives improvement.",
  },
  {
    name: "Prof. Ankit Patil",
    role: "Head of CS Dept, Pune University",
    initial: "A",
    text: "Batch promotion used to take us 3 weeks. With MMMP it's done in an afternoon. The broadcasting system keeps every student informed instantly.",
  },
  {
    name: "Riya Sharma",
    role: "Student, TYCS — Thane College",
    initial: "R",
    text: "I can track my attendance, see my CGPA, submit reviews, and access all study materials in one place. It feels like the entire college is in my pocket.",
  },
];

const TRUST_ITEMS = [
  { icon: "fa-shield-halved", label: "Data Encrypted" },
  { icon: "fa-lock",           label: "Role-Based Access" },
  { icon: "fa-server",         label: "99.9% Uptime" },
  { icon: "fa-mobile-screen",  label: "Mobile Ready" },
  { icon: "fa-bolt",           label: "Real-Time Updates" },
  { icon: "fa-headset",        label: "Email Support" },
];

const Ctasection = () => {
  return (
    <>
      <style>{`
        /* ── Testimonials ─────────────── */
        .lp-testi-section {
          padding: 110px 7vw;
          background: var(--ink);
          border-top: 1px solid var(--rule);
        }
        .lp-testi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 56px;
        }
        .lp-testi-card {
          background: var(--ink);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          transition: background 0.2s;
        }
        .lp-testi-card:hover { background: rgba(255,255,255,0.018); }
        .lp-testi-quote-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          line-height: 1;
          color: var(--accent);
          opacity: 0.2;
          margin-bottom: 12px;
          display: block;
        }
        .lp-testi-text {
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          color: var(--muted);
          line-height: 1.85;
          flex: 1;
          margin: 0 0 28px;
          font-style: italic;
        }
        .lp-testi-author {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--rule);
        }
        .lp-testi-initial {
          width: 38px; height: 38px; border-radius: 6px;
          background: var(--accent-dim);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 600;
          flex-shrink: 0;
        }
        .lp-testi-name {
          font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 700;
          color: var(--cream-2); margin: 0 0 3px;
        }
        .lp-testi-role {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; color: var(--muted);
          letter-spacing: 0.04em;
        }
        .lp-testi-stars {
          display: flex; gap: 3px;
          color: var(--accent);
          font-size: 9px;
          margin-bottom: 16px;
        }

        /* ── Trust bar ────────────────── */
        .lp-trust-section {
          padding: 56px 7vw;
          background: var(--ink-2);
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        .lp-trust-grid {
          max-width: 1280px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 8px;
          overflow: hidden;
        }
        .lp-trust-item {
          background: var(--ink-2);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          transition: background 0.18s;
        }
        .lp-trust-item:hover { background: rgba(255,255,255,0.02); }
        .lp-trust-icon {
          font-size: 16px;
          color: var(--accent);
          opacity: 0.7;
        }
        .lp-trust-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; color: var(--muted);
          letter-spacing: 0.08em; text-transform: uppercase;
          font-weight: 500;
        }

        /* ── Final CTA ────────────────── */
        .lp-cta-section {
          padding: 130px 7vw;
          background: var(--ink);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        /* Single glow */
        .lp-cta-glow {
          position: absolute;
          width: 700px; height: 400px;
          background: radial-gradient(ellipse, rgba(74,74,244,0.08) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .lp-cta-inner {
          position: relative; z-index: 1;
          max-width: 640px; margin: 0 auto;
        }
        .lp-cta-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: var(--muted);
          letter-spacing: 0.14em; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 24px;
        }
        .lp-cta-eyebrow::before {
          content: ''; width: 20px; height: 1px; background: var(--accent);
        }
        .lp-cta-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(44px, 5.5vw, 80px);
          font-weight: 600;
          color: var(--cream);
          letter-spacing: -0.025em;
          line-height: 1.04;
          margin: 0 0 20px;
        }
        .lp-cta-h2 em {
          font-style: italic;
          color: var(--cream-2);
        }
        .lp-cta-sub {
          font-family: 'Manrope', sans-serif;
          font-size: 16px; color: var(--muted);
          line-height: 1.8; margin: 0 0 50px;
        }
        .lp-cta-buttons {
          display: flex; gap: 14px;
          justify-content: center; flex-wrap: wrap;
          margin-bottom: 56px;
        }

        /* Role cards */
        .lp-cta-roles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 8px;
          overflow: hidden;
          text-align: left;
        }
        .lp-role-card {
          background: var(--ink-2);
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          transition: background 0.18s;
        }
        .lp-role-card:hover { background: rgba(255,255,255,0.025); }
        .lp-role-icon {
          width: 36px; height: 36px; border-radius: 6px;
          background: var(--accent-dim);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .lp-role-label {
          font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 700; color: var(--cream);
          margin: 0 0 3px;
        }
        .lp-role-sub {
          font-family: 'DM Mono', monospace;
          font-size: 9px; color: var(--muted);
          letter-spacing: 0.06em;
        }
        .lp-role-arrow {
          margin-left: auto;
          font-size: 10px;
          color: var(--muted);
          flex-shrink: 0;
        }

        @media(max-width:900px) {
          .lp-testi-grid { grid-template-columns: 1fr; }
          .lp-trust-grid { grid-template-columns: repeat(3, 1fr); }
          .lp-cta-roles { grid-template-columns: 1fr; }
        }
        @media(max-width:560px) {
          .lp-trust-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* TESTIMONIALS */}
      <section className="lp-testi-section">
        <div className="lp-section-inner-wide">
          <div className="lp-section-label">
            <span className="lp-section-label-line" />
            What People Say
          </div>
          <h2 className="lp-section-h2">
            Loved by the people<br />
            <em style={{ fontStyle:'italic', color:'var(--cream-2)' }}>who matter most</em>
          </h2>

          <div className="lp-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="lp-testi-card" key={i}>
                <div className="lp-testi-stars">
                  {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star" />)}
                </div>
                <span className="lp-testi-quote-mark">"</span>
                <p className="lp-testi-text">{t.text}</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-initial">{t.initial}</div>
                  <div>
                    <p className="lp-testi-name">{t.name}</p>
                    <p className="lp-testi-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="lp-trust-section">
        <div className="lp-trust-grid">
          {TRUST_ITEMS.map((b, i) => (
            <div className="lp-trust-item" key={i}>
              <i className={`fa-solid ${b.icon} lp-trust-icon`} />
              <span className="lp-trust-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" />
        <div className="lp-cta-inner">
          <div className="lp-cta-eyebrow">Get Started</div>
          <h2 className="lp-cta-h2">
            Ready to transform<br />
            <em>your institution?</em>
          </h2>
          <p className="lp-cta-sub">
            Join 80+ colleges already using MMMP. Get your admin, faculty, and
            students all on one intelligent platform — starting today.
          </p>

          <div className="lp-cta-buttons">
            <Link to="/login-selection" className="lp-btn-primary">
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
              Get Started Free
            </Link>
            <Link to="/faculty-selection" className="lp-btn-ghost">
              <i className="fa-solid fa-chalkboard-user" style={{ fontSize: 12 }} />
              Faculty / Admin Login
            </Link>
          </div>

          <div className="lp-cta-roles">
            {[
              { icon: "fa-building-columns", label: "Admin Portal",   sub: "Full institution control", to: "/admin-dashboard" },
              { icon: "fa-chalkboard-user",  label: "Faculty Portal", sub: "Manage batches & students", to: "/faculty-dashboard" },
              { icon: "fa-user-graduate",    label: "Student Portal", sub: "Sessions, reviews & more",  to: "/student-dashboard" },
            ].map((r, i) => (
              <Link to={r.to} className="lp-role-card" key={i}>
                <div className="lp-role-icon">
                  <i className={`fa-solid ${r.icon}`} />
                </div>
                <div>
                  <p className="lp-role-label">{r.label}</p>
                  <p className="lp-role-sub">{r.sub}</p>
                </div>
                <i className="fa-solid fa-arrow-right lp-role-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Ctasection;

