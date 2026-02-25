import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ============================================================
// Hero.jsx — Refined Luxury Minimalism
// Palette: Near-black (#0a0a0b) + warm off-white (#f5f0eb) + single accent (#4a4af4)
// Font: Cormorant Garamond (display) + DM Mono (data) + Manrope (body)
// ============================================================

const ROLES = ["Students", "Faculty", "Institutions", "Mentors"];

const Hero = () => {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const target = ROLES[roleIdx];
    if (typing) {
      if (displayed.length < target.length) {
        timeoutRef.current = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80);
      } else {
        timeoutRef.current = setTimeout(() => setTyping(false), 2200);
      }
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 42);
      } else {
        setRoleIdx((i) => (i + 1) % ROLES.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [displayed, typing, roleIdx]);

  const STATS = [
    { val: "10K+", label: "Students" },
    { val: "500+", label: "Faculty" },
    { val: "80+",  label: "Colleges" },
    { val: "4.9",  label: "Rating" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --ink: #0a0a0b;
          --ink-2: #1a1a1e;
          --ink-3: #2c2c32;
          --muted: #4a4a52;
          --muted-2: #6b6b75;
          --rule: rgba(245,240,235,0.08);
          --cream: #f5f0eb;
          --cream-2: #e8e2da;
          --accent: #4a4af4;
          --accent-dim: rgba(74,74,244,0.12);
        }

        body {
          background: var(--ink);
          color: var(--cream);
          font-family: 'Manrope', sans-serif;
          margin: 0;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ─── HERO ─────────────────────── */
        .lp-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 140px 7vw 90px;
          background: var(--ink);
          overflow: hidden;
        }

        /* Subtle noise texture */
        .lp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        /* Single glow — not rainbow */
        .lp-hero-glow {
          position: absolute;
          width: 800px; height: 500px;
          background: radial-gradient(ellipse, rgba(74,74,244,0.09) 0%, transparent 70%);
          top: -80px; right: -200px;
          pointer-events: none; z-index: 0;
        }

        .lp-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1340px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 80px;
          align-items: start;
        }

        /* Eyebrow */
        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: var(--muted-2);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.1s forwards;
        }
        .lp-eyebrow-line {
          width: 28px; height: 1px;
          background: var(--accent);
        }
        .lp-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent);
          animation: blink-slow 3s ease-in-out infinite;
        }

        /* Main heading */
        .lp-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 5.5vw, 88px);
          font-weight: 600;
          line-height: 1.02;
          letter-spacing: -0.02em;
          color: var(--cream);
          margin: 0 0 8px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.2s forwards;
        }
        .lp-h1 em {
          font-style: italic;
          color: var(--cream-2);
        }

        .lp-typewriter-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 28px;
          height: clamp(56px, 6vw, 96px)
          overflow: hidden;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.3s forwards;
        }
        .lp-typewriter-for {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 5.5vw, 88px);
          font-weight: 400;
          color: var(--muted-2);
          line-height: 1.02;
          letter-spacing: -0.02em;
          font-style: italic;
        }
        .lp-typewriter {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 4.2vw, 88px);
          font-weight: 700;
          color: var(--cream);
          line-height: 1.02;
          letter-spacing: -0.02em;
        }
        .lp-cursor {
          display: inline-block;
          width: 3px;
          height: 0.78em;
          background: var(--accent);
          margin-left: 4px;
          vertical-align: baseline;
          animation: cur-blink 1s step-end infinite;
        }

        .lp-sub {
          font-family: 'Manrope', sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: var(--muted);
          line-height: 1.85;
          margin: 0 0 44px;
          max-width: 460px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.4s forwards;
        }

        /* CTAs */
        .lp-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.5s forwards;
        }
        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .lp-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(74,74,244,0.38); color: #fff; }
        .lp-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: transparent;
          color: var(--muted-2);
          border: 1px solid var(--rule);
          border-radius: 6px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.22s ease;
        }
        .lp-btn-ghost:hover { border-color: rgba(245,240,235,0.2); color: var(--cream-2); transform: translateY(-2px); }

        /* ─── Right: Dashboard mockup ───── */
        .lp-visual {
          opacity: 0;
          animation: fadeLeft 1s ease 0.4s forwards;
          position: relative;
        }

        .lp-mockup {
          background: var(--ink-2);
          border: 1px solid var(--rule);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 60px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
        }

        .lp-mock-topbar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--rule);
          background: rgba(255,255,255,0.02);
        }
        .lp-dot { width: 9px; height: 9px; border-radius: 50%; }
        .lp-dot-r { background: #ff5f57; } .lp-dot-y { background: #febc2e; } .lp-dot-g { background: #28c840; }
        .lp-mock-label {
          margin-left: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.06em;
        }

        .lp-mock-body { padding: 20px; }

        .lp-mock-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 18px;
        }
        .lp-mock-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--rule);
          border-radius: 7px;
          padding: 12px 8px;
          text-align: center;
        }
        .lp-mock-stat-val {
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          color: var(--cream);
        }
        .lp-mock-stat-lbl {
          font-family: 'Manrope', sans-serif;
          font-size: 9px;
          color: var(--muted);
          margin-top: 3px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .lp-mock-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          margin-bottom: 5px;
          border: 1px solid var(--rule);
          background: rgba(255,255,255,0.015);
        }
        .lp-mock-indicator { width: 2px; height: 28px; border-radius: 2px; flex-shrink: 0; }
        .lp-mock-text {
          font-family: 'Manrope', sans-serif;
          font-size: 11.5px;
          color: var(--muted);
          flex: 1;
        }
        .lp-mock-time {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: var(--ink-3);
          font-weight: 500;
        }

        /* Float chips */
        .lp-float {
          position: absolute;
          background: var(--ink-2);
          border: 1px solid rgba(245,240,235,0.1);
          border-radius: 8px;
          padding: 11px 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 2;
        }
        .lp-float-1 { top: -20px; left: -50px; animation: float-bob 5s ease-in-out infinite; }
        .lp-float-2 { bottom: -16px; right: -40px; animation: float-bob 5s ease-in-out 2s infinite; }
        .lp-float-icon { font-size: 18px; }
        .lp-float-val {
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          color: var(--cream);
          line-height: 1;
        }
        .lp-float-lbl {
          font-family: 'Manrope', sans-serif;
          font-size: 10px;
          color: var(--muted);
          font-weight: 500;
        }

        /* ─── Stats bar ───────────────── */
        .lp-stats-bar {
          background: var(--ink-2);
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
          padding: 22px 7vw;
        }
        .lp-stats-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .lp-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 14px 0;
          border-right: 1px solid var(--rule);
        }
        .lp-stat-item:last-child { border-right: none; }
        .lp-stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 600;
          color: var(--cream);
          line-height: 1;
          letter-spacing: -0.01em;
        }
        .lp-stat-lbl {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ─── Animations ──────────────── */
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeLeft { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes cur-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes blink-slow { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        @keyframes float-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media(max-width:1000px) {
          .lp-hero-inner { grid-template-columns: 1fr; }
          .lp-visual { display: none; }
          .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
          .lp-stat-item:nth-child(2) { border-right: none; }
        }
      `}</style>

      <section className="lp-hero">
        <div className="lp-hero-glow" />

        <div className="lp-hero-inner">
          {/* LEFT */}
          <div>
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              <span className="lp-eyebrow-line" />
              Trusted by 80+ institutions across India
            </div>

            <h1 className="lp-h1">
              One platform for<br />
              <em>complete academic</em>
            </h1>

            <div className="lp-typewriter-row">
              <span className="lp-typewriter-for">excellence for</span>
              <span>
                <span className="lp-typewriter">{displayed}</span>
                <span className="lp-cursor" />
              </span>
            </div>

            <p className="lp-sub">
              MentorInsight brings your entire institution onto one intelligent platform —
              student tracking, faculty dashboards, review campaigns, broadcast
              messaging, learning hubs, and deep analytics.
            </p>

            <div className="lp-ctas">
              <Link to="/login-selection" className="lp-btn-primary">
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                Get Started
              </Link>
              <a href="#video" className="lp-btn-ghost">
                <i className="fa-regular fa-circle-play" style={{ fontSize: 13 }} />
                Watch Demo
              </a>
            </div>
          </div>

          {/* RIGHT: mockup */}
          <div className="lp-visual">
            <div className="lp-float lp-float-1">
              <span className="lp-float-icon" style={{ color: "#4a4af4" }}>
                <i className="fa-solid fa-check" style={{ fontSize: 14 }} />
              </span>
              <div>
                <div className="lp-float-val">+247</div>
                <div className="lp-float-lbl">Reviews this week</div>
              </div>
            </div>

            <div className="lp-mockup">
              <div className="lp-mock-topbar">
                <span className="lp-dot lp-dot-r" />
                <span className="lp-dot lp-dot-y" />
                <span className="lp-dot lp-dot-g" />
                <span className="lp-mock-label">MentorInsight — Admin Dashboard</span>
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-stats">
                  {[
                    { val: "1,284", lbl: "Students" },
                    { val: "94",    lbl: "Faculty" },
                    { val: "38",    lbl: "Batches" },
                    { val: "4.9★",  lbl: "Rating" },
                  ].map((s, i) => (
                    <div className="lp-mock-stat" key={i}>
                      <div className="lp-mock-stat-val">{s.val}</div>
                      <div className="lp-mock-stat-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
                {[
                  { color: "#4a4af4", text: "TYCS review campaign posted",     time: "2m" },
                  { color: "#10b981", text: "Prof. Sharma rated 4.8★ by 48",   time: "15m" },
                  { color: "#f59e0b", text: "Exam schedule broadcast sent",     time: "1h" },
                  { color: "#4a4af4", text: "SYCS attendance flagged — 3",      time: "2h" },
                  { color: "#10b981", text: "New resource: DSA Notes Ch.5",     time: "3h" },
                ].map((a, i) => (
                  <div className="lp-mock-row" key={i}>
                    <span className="lp-mock-indicator" style={{ background: a.color }} />
                    <span className="lp-mock-text">{a.text}</span>
                    <span className="lp-mock-time">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-float lp-float-2">
              <span className="lp-float-icon" style={{ color: "#f59e0b" }}>
                <i className="fa-solid fa-star" style={{ fontSize: 13 }} />
              </span>
              <div>
                <div className="lp-float-val">4.9</div>
                <div className="lp-float-lbl">Avg faculty rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="lp-stats-bar">
        <div className="lp-stats-inner">
          {[
            { val: "10K+", label: "Students" },
            { val: "500+", label: "Faculty" },
            { val: "80+",  label: "Colleges" },
            { val: "4.9★", label: "Rating" },
          ].map((s, i) => (
            <div className="lp-stat-item" key={i}>
              <div className="lp-stat-val">{s.val}</div>
              <div className="lp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero;
