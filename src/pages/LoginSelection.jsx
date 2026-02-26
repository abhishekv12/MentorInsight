import React from "react";
import { Link } from "react-router-dom";

const LoginSelection = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ls-root { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: 'DM Sans', sans-serif; }

        /* LEFT */
        .ls-left { background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 52px; }
        .ls-logo { display: flex; align-items: center; gap: 10px; font-family: 'Instrument Serif', serif; font-size: 22px; color: #0f172a; margin-bottom: 8px; }
        .ls-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
        .ls-tagline { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 48px; }
        .ls-title { font-family: 'Instrument Serif', serif; font-size: clamp(36px,4vw,52px); color: #0f172a; margin-bottom: 10px; text-align: center; font-weight: 400; }
        .ls-title em { color: #2563eb; font-style: italic; }
        .ls-sub { font-size: 15px; color: #64748b; margin-bottom: 44px; text-align: center; }

        .ls-cards { display: flex; gap: 20px; margin-bottom: 44px; }
        .ls-card {
          width: 148px; height: 168px; border: 1.5px solid #e5e7eb; border-radius: 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-decoration: none; background: #fff; gap: 14px;
          transition: all .22s; box-shadow: 0 2px 8px rgba(0,0,0,.04);
        }
        .ls-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,.1); border-color: transparent; }
        .ls-card-icon { width: 62px; height: 62px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff; }
        .ls-card-label { font-size: 15px; font-weight: 700; color: #0f172a; }

        .ls-footer { font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.8; }
        .ls-footer a { color: #2563eb; font-weight: 700; text-decoration: none; }
        .ls-footer a:hover { text-decoration: underline; }

        /* RIGHT */
        .ls-right {
          background: linear-gradient(145deg, #0f1b2d 0%, #0a1628 60%, #1a0a2e 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          margin: 12px 12px 12px 0; border-radius: 28px;
        }
        .ls-right::before {
          content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 65%);
          top: -200px; right: -200px; pointer-events: none;
        }
        .ls-right::after {
          content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,.1) 0%, transparent 65%);
          bottom: -100px; left: -100px; pointer-events: none;
        }
        .ls-right-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .ls-right-body { position: relative; z-index: 1; text-align: center; padding: 40px; }
        .ls-right-h2 { font-family: 'Instrument Serif', serif; font-size: clamp(30px,3vw,42px); color: #fff; font-weight: 400; margin-bottom: 10px; }
        .ls-right-h2 em { color: #60a5fa; font-style: italic; }
        .ls-right-sub { font-size: 15px; color: #475569; margin-bottom: 44px; line-height: 1.6; }

        .ls-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 44px; }
        .ls-stat {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px; padding: 18px 20px; text-align: left;
          transition: background .2s;
        }
        .ls-stat:hover { background: rgba(255,255,255,.07); }
        .ls-stat-num { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .ls-stat-lbl { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; }

        .ls-floats { position: relative; height: 180px; display: flex; align-items: center; justify-content: center; }
        .ls-big-icon { font-size: 130px; color: rgba(255,255,255,.06); position: absolute; }
        .ls-float {
          position: absolute; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 700; color: #cbd5e1;
          display: flex; align-items: center; gap: 8px; backdrop-filter: blur(8px);
          animation: ls-float 3s ease-in-out infinite;
        }
        .ls-float i { font-size: 15px; }
        .ls-f1 { top: 10%; left: 8%; animation-delay: 0s; }
        .ls-f2 { top: 5%; right: 8%; animation-delay: 1s; }
        .ls-f3 { bottom: 10%; left: 15%; animation-delay: 2s; }
        .ls-f4 { bottom: 5%; right: 12%; animation-delay: 1.5s; }

        @keyframes ls-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media(max-width:860px) {
          .ls-root { grid-template-columns: 1fr; }
          .ls-right { display: none; }
          .ls-left { padding: 40px 24px; }
        }
      `}</style>

      <div className="ls-root">
        {/* LEFT */}
        <div className="ls-left">
          <div className="ls-logo">
            <div className="ls-logo-icon">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            MentorInsight
          </div>
          <p className="ls-tagline">The College Intelligence App</p>
          <h1 className="ls-title">
            Welcome <em>back</em>
          </h1>
          <p className="ls-sub">Select your role to sign in</p>

          <div className="ls-cards">
            <Link to="/login/student" className="ls-card">
              <div
                className="ls-card-icon"
                style={{
                  background: "#2563eb",
                  boxShadow: "0 8px 20px rgba(37,99,235,.35)",
                }}
              >
                <i className="fa-solid fa-user-graduate" />
              </div>
              <span className="ls-card-label">Student</span>
            </Link>
            <Link to="/login/parent" className="ls-card">
              <div
                className="ls-card-icon"
                style={{
                  background: "#7c3aed",
                  boxShadow: "0 8px 20px rgba(124,58,237,.35)",
                }}
              >
                <i className="fa-solid fa-people-roof" />
              </div>
              <span className="ls-card-label">Parent</span>
            </Link>
          </div>

          <div className="ls-footer">
            <p>Are you a Faculty or Admin?</p>
            <a href="/login/faculty-selection">Staff Login →</a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="ls-right">
          <div className="ls-right-grid" />
          <div className="ls-right-body">
            <h2 className="ls-right-h2">
              Live <em>Statistics</em>
            </h2>
            <p className="ls-right-sub">
              Empowering colleges with better
              <br />
              decision making every day.
            </p>

            <div className="ls-stats">
              {[
                { num: "200+", lbl: "Colleges", color: "#60a5fa" },
                { num: "10,000+", lbl: "Faculty Members", color: "#4ade80" },
                { num: "3,00,000+", lbl: "Students", color: "#f59e0b" },
                { num: "4,00,000+", lbl: "Lectures Marked", color: "#f87171" },
              ].map((s) => (
                <div className="ls-stat" key={s.lbl}>
                  <div className="ls-stat-num" style={{ color: s.color }}>
                    {s.num}
                  </div>
                  <div className="ls-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            <div className="ls-floats">
              <i className="fa-solid fa-mobile-screen-button ls-big-icon" />
              <div className="ls-float ls-f1">
                <i
                  className="fa-solid fa-chart-pie"
                  style={{ color: "#60a5fa" }}
                />{" "}
                Analytics
              </div>
              <div className="ls-float ls-f2">
                <i className="fa-solid fa-bell" style={{ color: "#f59e0b" }} />{" "}
                Notifications
              </div>
              <div className="ls-float ls-f3">
                <i
                  className="fa-solid fa-circle-check"
                  style={{ color: "#4ade80" }}
                />{" "}
                Attendance
              </div>
              <div className="ls-float ls-f4">
                <i className="fa-solid fa-star" style={{ color: "#f87171" }} />{" "}
                Reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSelection;

