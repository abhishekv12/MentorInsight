import React from 'react';
import { Link } from 'react-router-dom';

const FacultySelection = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fs-root { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: 'DM Sans', sans-serif; }

        /* LEFT */
        .fs-left { background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 52px; }
        .fs-logo { display: flex; align-items: center; gap: 10px; font-family: 'Instrument Serif', serif; font-size: 22px; color: #0f172a; margin-bottom: 8px; }
        .fs-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
        .fs-tagline { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 48px; }
        .fs-title { font-family: 'Instrument Serif', serif; font-size: clamp(36px,4vw,52px); color: #0f172a; margin-bottom: 10px; text-align: center; font-weight: 400; }
        .fs-title em { color: #dc2626; font-style: italic; }
        .fs-sub { font-size: 15px; color: #64748b; margin-bottom: 44px; text-align: center; }

        .fs-cards { display: flex; gap: 20px; margin-bottom: 44px; }
        .fs-card {
          width: 148px; height: 168px; border: 1.5px solid #e5e7eb; border-radius: 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-decoration: none; background: #fff; gap: 14px;
          transition: all .22s; box-shadow: 0 2px 8px rgba(0,0,0,.04);
        }
        .fs-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,.1); border-color: transparent; }
        .fs-card-icon { width: 62px; height: 62px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff; }
        .fs-card-label { font-size: 15px; font-weight: 700; color: #0f172a; }

        .fs-footer { font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.8; }
        .fs-footer a { color: #2563eb; font-weight: 700; text-decoration: none; }
        .fs-footer a:hover { text-decoration: underline; }

        /* RIGHT */
        .fs-right {
          background: linear-gradient(145deg, #0f1b2d 0%, #0a1628 60%, #0a1a0a 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          margin: 12px 12px 12px 0; border-radius: 28px;
        }
        .fs-right::before {
          content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(220,38,38,.12) 0%, transparent 65%);
          top: -200px; right: -200px; pointer-events: none;
        }
        .fs-right::after {
          content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(22,163,74,.08) 0%, transparent 65%);
          bottom: -100px; left: -100px; pointer-events: none;
        }
        .fs-right-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .fs-right-body { position: relative; z-index: 1; text-align: center; padding: 40px; }
        .fs-right-h2 { font-family: 'Instrument Serif', serif; font-size: clamp(30px,3vw,42px); color: #fff; font-weight: 400; margin-bottom: 10px; }
        .fs-right-h2 em { color: #f87171; font-style: italic; }
        .fs-right-sub { font-size: 15px; color: #475569; margin-bottom: 44px; line-height: 1.6; }

        .fs-trust { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 44px; }
        .fs-trust-item {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px; padding: 18px 14px; text-align: center;
        }
        .fs-trust-icon { font-size: 22px; margin-bottom: 10px; }
        .fs-trust-val { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .fs-trust-lbl { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; }

        .fs-floats { position: relative; height: 180px; display: flex; align-items: center; justify-content: center; }
        .fs-big-icon { font-size: 130px; color: rgba(255,255,255,.06); position: absolute; }
        .fs-float {
          position: absolute; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 700; color: #cbd5e1;
          display: flex; align-items: center; gap: 8px; backdrop-filter: blur(8px);
          animation: fs-float 3s ease-in-out infinite;
        }
        .fs-f1 { top: 10%; left: 5%; animation-delay: 0s; }
        .fs-f2 { top: 5%; right: 5%; animation-delay: 1s; }
        .fs-f3 { bottom: 10%; left: 10%; animation-delay: 2s; }
        .fs-f4 { bottom: 5%; right: 10%; animation-delay: 1.5s; }

        @keyframes fs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media(max-width:860px) {
          .fs-root { grid-template-columns: 1fr; }
          .fs-right { display: none; }
          .fs-left { padding: 40px 24px; }
        }
      `}</style>

      <div className="fs-root">
        {/* LEFT */}
        <div className="fs-left">
          <div className="fs-logo">
            <div className="fs-logo-icon"><i className="fa-solid fa-graduation-cap" /></div>
            MentorInsight
          </div>
          <p className="fs-tagline">The College Intelligence App</p>
          <h1 className="fs-title">Staff <em>Portal</em></h1>
          <p className="fs-sub">Select your role to continue</p>

          <div className="fs-cards">
            <Link to="/login/faculty" className="fs-card">
              <div className="fs-card-icon" style={{ background: "#16a34a", boxShadow: "0 8px 20px rgba(22,163,74,.35)" }}>
                <i className="fa-solid fa-chalkboard-user" />
              </div>
              <span className="fs-card-label">Faculty</span>
            </Link>
            <Link to="/admin-login" className="fs-card">
              <div className="fs-card-icon" style={{ background: "#dc2626", boxShadow: "0 8px 20px rgba(220,38,38,.35)" }}>
                <i className="fa-solid fa-user-shield" />
              </div>
              <span className="fs-card-label">Admin</span>
            </Link>
          </div>

          <div className="fs-footer">
            <p>Are you a Student or Parent?</p>
            <a href="/login-selection">Student Login →</a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="fs-right">
          <div className="fs-right-grid" />
          <div className="fs-right-body">
            <h2 className="fs-right-h2">Secure <em>Administration</em></h2>
            <p className="fs-right-sub">Manage rosters, reviews, and university<br />data — all in one place.</p>

            <div className="fs-trust">
              {[
                { icon: "fa-shield-halved", val: "99.9%",   lbl: "Uptime",    color: "#60a5fa" },
                { icon: "fa-lock",          val: "256-bit",  lbl: "Encrypted", color: "#4ade80" },
                { icon: "fa-headset",       val: "24/7",     lbl: "Support",   color: "#f59e0b" },
              ].map(t => (
                <div className="fs-trust-item" key={t.lbl}>
                  <div className="fs-trust-icon"><i className={`fa-solid ${t.icon}`} style={{ color: t.color }} /></div>
                  <div className="fs-trust-val" style={{ color: t.color }}>{t.val}</div>
                  <div className="fs-trust-lbl">{t.lbl}</div>
                </div>
              ))}
            </div>

            <div className="fs-floats">
              <i className="fa-solid fa-laptop-file fs-big-icon" />
              <div className="fs-float fs-f1"><i className="fa-solid fa-lock" style={{color:"#60a5fa"}} /> Secure</div>
              <div className="fs-float fs-f2"><i className="fa-solid fa-key" style={{color:"#f59e0b"}} /> Access Control</div>
              <div className="fs-float fs-f3"><i className="fa-solid fa-database" style={{color:"#4ade80"}} /> Live Data</div>
              <div className="fs-float fs-f4"><i className="fa-solid fa-star" style={{color:"#f87171"}} /> Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultySelection;

