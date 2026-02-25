import React, { useState, useRef } from "react";

const PORTALS = [
  {
    id: "admin",
    icon: "fa-building-columns",
    label: "Admin",
    color: "#4a4af4",
    tagline: "Complete institutional control",
    features: [
      { icon: "fa-layer-group",      title: "Department & Batch Management",   desc: "Create FY/SY/TY batches across all departments. Add students, manage divisions, track headcounts." },
      { icon: "fa-star-half-stroke", title: "Faculty Review Campaigns",        desc: "Post anonymous review campaigns per batch. Students rate faculty. Track results with analytics." },
      { icon: "fa-user-tie",         title: "Faculty & Staff Registry",        desc: "Manage all professors, their departments, subjects, and review history." },
      { icon: "fa-chart-pie",        title: "Analytics Dashboard",             desc: "Live health score, activity feed, stat cards. See the entire institution at a glance." },
      { icon: "fa-bullhorn",         title: "Institution-Wide Broadcasts",     desc: "Push announcements to all students or specific departments with urgency levels." },
      { icon: "fa-shield-halved",    title: "Secure Admin Panel",              desc: "Dedicated admin login with access codes, forgot-password recovery, college-scoped data." },
    ],
    mockup: [
      { text: "TYCS batch — 48 students enrolled",       status: "Active" },
      { text: "Prof. Sharma: 4.8★ across 5 criteria",   status: "Done" },
      { text: "Review campaign: SYBS — open",            status: "Live" },
      { text: "3 students below 75% flagged",            status: "Alert" },
    ],
  },
  {
    id: "faculty",
    icon: "fa-chalkboard-user",
    label: "Faculty",
    color: "#4a4af4",
    tagline: "Teach smarter, track deeper",
    features: [
      { icon: "fa-users",          title: "Batch & Division Management",   desc: "Create and manage FY, SY, TY batches with multiple divisions." },
      { icon: "fa-bell",           title: "Session Notifications",         desc: "Schedule mentor sessions with date, time, mode and topic." },
      { icon: "fa-bullhorn",       title: "Broadcast Messaging",           desc: "Send targeted announcements to any batch with priority levels." },
      { icon: "fa-graduation-cap", title: "Batch Promotion Workflow",      desc: "Seamlessly promote students from FY→SY→TY at year-end." },
      { icon: "fa-chart-bar",      title: "Attendance & Analytics",        desc: "Month-wise and semester-wise attendance per student." },
      { icon: "fa-file-pen",       title: "Examination Records",           desc: "Manage semester-wise subject marks, SGPA, CGPA." },
    ],
    mockup: [
      { text: "TYCS-A session scheduled: 3:00 PM",    status: "Soon" },
      { text: "42/50 students acknowledged session",  status: "Done" },
      { text: "Riya Sharma: CGPA 8.4 → 8.7",         status: "Up" },
      { text: "Attendance warning sent to 3",         status: "Sent" },
    ],
  },
  {
    id: "student",
    icon: "fa-user-graduate",
    label: "Student",
    color: "#4a4af4",
    tagline: "Your academic journey, organised",
    features: [
      { icon: "fa-calendar-check",  title: "Session Hub",                    desc: "Browse upcoming mentor sessions, apply for slots, track attendance history." },
      { icon: "fa-star",            title: "Faculty Review System",           desc: "Rate professors anonymously on 5 criteria when campaigns go live." },
      { icon: "fa-book-open",       title: "Learning Hub",                    desc: "Access curated study materials, PDFs, links, videos shared by faculty." },
      { icon: "fa-certificate",     title: "Document Vault",                  desc: "Upload and store certificates, achievements, and important documents securely." },
      { icon: "fa-bell",            title: "Broadcast Inbox",                 desc: "Receive priority-tagged announcements. Never miss a critical academic update." },
      { icon: "fa-list-check",      title: "Todo & Insights Panel",           desc: "Personal task manager integrated with your academic calendar." },
    ],
    mockup: [
      { text: "Review campaign open: Rate mentor",     status: "New" },
      { text: "New resource: DSA Notes — Ch.5",        status: "New" },
      { text: "Session tomorrow: Career Goals 3PM",    status: "Soon" },
      { text: "Certificate uploaded: AWS Cloud",       status: "Done" },
    ],
  },
];

// ─── Video Section ───────────────────────────────────────────
export const VideoSection = ({ videoSrc }) => {
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  // Strictly boolean — never truthy for null/undefined/empty string
  const hasVideo = typeof videoSrc === "string" && videoSrc.trim().length > 0;

  return (
    <>
      <style>{`
        .lp-section-wrap { padding: 110px 7vw; position: relative; }
        .lp-section-inner-wide { max-width: 1280px; margin: 0 auto; }
        .lp-section-label {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
          color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 20px;
        }
        .lp-section-label-line { width: 24px; height: 1px; background: var(--accent); display: inline-block; }
        .lp-section-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 60px); font-weight: 600;
          color: var(--cream); letter-spacing: -0.02em;
          line-height: 1.05; margin: 0 0 18px;
        }
        .lp-section-sub {
          font-family: 'Manrope', sans-serif;
          font-size: 15px; color: var(--muted); line-height: 1.8;
          max-width: 500px; margin: 0 0 56px;
        }
        .lp-video-wrapper {
          position: relative; border-radius: 10px; overflow: hidden;
          border: 1px solid var(--rule); background: var(--ink-2);
          aspect-ratio: 16/9; box-shadow: 0 60px 120px rgba(0,0,0,0.5);
        }
        .lp-video-wrapper video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lp-video-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(10,10,11,0.55); transition: opacity 0.3s; cursor: pointer;
        }
        .lp-video-overlay.hidden { opacity: 0; pointer-events: none; }
        .lp-play-btn {
          width: 72px; height: 72px; border-radius: 50%;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff; border: none; cursor: pointer;
          box-shadow: 0 0 0 16px rgba(74,74,244,0.12), 0 16px 40px rgba(74,74,244,0.4);
          transition: transform 0.2s;
        }
        .lp-play-btn:hover { transform: scale(1.08); }
        .lp-video-caption {
          margin-top: 18px; font-family: 'DM Mono', monospace;
          font-size: 10px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase;
        }
        .lp-video-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 16px; min-height: 400px;
        }
        .lp-video-placeholder i { font-size: 48px; color: var(--ink-3); }
        .lp-video-placeholder p {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: var(--muted); margin: 0; letter-spacing: 0.08em;
        }
      `}</style>

      <section className="lp-section-wrap" id="video" style={{ background: "var(--ink)" }}>
          <div className="lp-video-wrapper">
            {hasVideo ? (
              <>
                <video ref={videoRef} src={videoSrc} muted autoPlay playsInline loop />
                <div
                  className={`lp-video-overlay${playing ? " hidden" : ""}`}
                  onClick={handlePlay}
                >
                  <button className="lp-play-btn">
                    <i className="fa-solid fa-play" />
                  </button>
                  <p className="lp-video-caption">Platform Overview · MentorInsight</p>
                </div>
              </>
            ) : (
              <div className="lp-video-placeholder">
                <i className="fa-regular fa-circle-play" />
                <p><VideoSection videoSrc="/public/VN20260209_172719.mp4" /></p>
              </div>
            )}
          </div>
      </section>
    </>
  );
};

// ─── Features Showcase ──────────────────────────────────────
export const FeaturesShowcase = () => {
  const [activePortal, setActivePortal] = useState("admin");
  const portal = PORTALS.find((p) => p.id === activePortal);

  return (
    <>
      <style>{`
        .lp-features-section {
          padding: 110px 7vw; background: var(--ink-2);
          border-top: 1px solid var(--rule);
        }
        .lp-portal-tabs {
          display: flex; gap: 0; margin-bottom: 64px;
          border-bottom: 1px solid var(--rule); width: fit-content;
        }
        .lp-portal-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 26px; border: none;
          border-bottom: 2px solid transparent;
          font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase;
          cursor: pointer; background: transparent; color: var(--muted);
          transition: all 0.18s; margin-bottom: -1px;
        }
        .lp-portal-tab.active { color: var(--cream); border-bottom-color: var(--accent); }
        .lp-portal-tab:hover:not(.active) { color: var(--muted-2); }
        .lp-portal-layout {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: start;
        }
        .lp-features-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--rule);
          border: 1px solid var(--rule); border-radius: 8px; overflow: hidden;
        }
        .lp-feat-card {
          padding: 22px 20px; background: var(--ink-2);
          transition: background 0.18s; cursor: default;
        }
        .lp-feat-card:hover { background: rgba(255,255,255,0.025); }
        .lp-feat-icon-wrap {
          width: 32px; height: 32px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; background: var(--accent-dim); color: var(--accent);
          margin-bottom: 12px;
        }
        .lp-feat-title {
          font-family: 'Manrope', sans-serif; font-size: 12.5px; font-weight: 700;
          color: var(--cream-2); margin: 0 0 5px; letter-spacing: 0.01em;
        }
        .lp-feat-desc {
          font-family: 'Manrope', sans-serif; font-size: 11.5px;
          color: var(--muted); line-height: 1.65; margin: 0;
        }
        .lp-portal-eyebrow {
          font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted);
          letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-portal-eyebrow-line { width: 20px; height: 1px; background: var(--accent); }
        .lp-portal-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 3.5vw, 54px); font-weight: 600;
          color: var(--cream); margin: 0 0 10px;
          letter-spacing: -0.02em; line-height: 1;
        }
        .lp-portal-desc {
          font-family: 'Manrope', sans-serif; font-size: 14.5px;
          color: var(--muted); line-height: 1.8; margin: 0 0 36px;
        }
        .lp-portal-mockup {
          background: var(--ink); border: 1px solid var(--rule);
          border-radius: 10px; overflow: hidden;
        }
        .lp-pmock-topbar {
          display: flex; align-items: center; gap: 6px;
          padding: 12px 16px; border-bottom: 1px solid var(--rule);
          background: rgba(255,255,255,0.02);
        }
        .lp-pmock-label {
          margin-left: 10px; font-family: 'DM Mono', monospace;
          font-size: 9.5px; color: var(--muted); letter-spacing: 0.06em;
        }
        .lp-pmock-header {
          padding: 18px; border-bottom: 1px solid var(--rule);
          display: flex; align-items: center; gap: 12px;
        }
        .lp-pmock-header-icon {
          width: 38px; height: 38px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; background: var(--accent-dim); color: var(--accent); flex-shrink: 0;
        }
        .lp-pmock-header-title {
          font-family: 'Manrope', sans-serif; font-size: 13px;
          font-weight: 700; color: var(--cream); margin: 0 0 2px;
        }
        .lp-pmock-header-sub {
          font-family: 'DM Mono', monospace; font-size: 9.5px;
          color: var(--muted); letter-spacing: 0.06em;
        }
        .lp-pmock-body { padding: 14px; }
        .lp-pmock-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 6px; margin-bottom: 5px;
          border: 1px solid var(--rule); background: rgba(255,255,255,0.015);
        }
        .lp-pmock-indicator {
          width: 2px; height: 26px; border-radius: 2px;
          background: var(--accent); flex-shrink: 0;
        }
        .lp-pmock-text {
          font-family: 'Manrope', sans-serif; font-size: 11.5px;
          color: var(--muted); flex: 1;
        }
        .lp-pmock-status {
          font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500;
          color: var(--accent); letter-spacing: 0.06em; text-transform: uppercase;
        }
        .lp-dot { width: 9px; height: 9px; border-radius: 50%; }
        .lp-dot-r { background: #ff5f57; }
        .lp-dot-y { background: #febc2e; }
        .lp-dot-g { background: #28c840; }
        @media(max-width:900px) {
          .lp-portal-layout { grid-template-columns: 1fr; }
          .lp-portal-tabs { border-bottom: none; flex-wrap: wrap; gap: 4px; }
          .lp-portal-tab { border: 1px solid var(--rule); border-radius: 6px; border-bottom: 2px solid transparent; }
          .lp-portal-tab.active { border-color: var(--accent); }
        }
      `}</style>

      <section className="lp-features-section" id="features">
        <div className="lp-section-inner-wide">
          <div className="lp-section-label">
            <span className="lp-section-label-line" />
            Platform Features
          </div>
          <h2 className="lp-section-h2">
            Everything your<br />
            <em style={{ fontStyle: "italic", color: "var(--cream-2)" }}>institution needs</em>
          </h2>
          <p className="lp-section-sub">
            Three powerful portals, one unified system — each built for how
            admins, faculty, and students actually work.
          </p>

          <div className="lp-portal-tabs">
            {PORTALS.map((p) => (
              <button
                key={p.id}
                className={`lp-portal-tab${activePortal === p.id ? " active" : ""}`}
                onClick={() => setActivePortal(p.id)}
              >
                <i className={`fa-solid ${p.icon}`} style={{ fontSize: 11 }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lp-portal-layout">
            <div>
              <div className="lp-portal-eyebrow">
                <span className="lp-portal-eyebrow-line" />
                {portal.tagline}
              </div>
              <h3 className="lp-portal-name">{portal.label} Portal</h3>
              <p className="lp-portal-desc">
                {portal.id === "admin"   && "Full institutional oversight — departments, batches, reviews, broadcasts, and analytics in one control centre."}
                {portal.id === "faculty" && "Everything a professor needs: manage students, send sessions, track attendance, and view review results."}
                {portal.id === "student" && "A personal academic command centre — sessions, reviews, resources, certifications, and broadcasts all in one feed."}
              </p>
              <div className="lp-features-grid">
                {portal.features.map((f, i) => (
                  <div className="lp-feat-card" key={i}>
                    <div className="lp-feat-icon-wrap">
                      <i className={`fa-solid ${f.icon}`} />
                    </div>
                    <p className="lp-feat-title">{f.title}</p>
                    <p className="lp-feat-desc">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="lp-portal-mockup">
                <div className="lp-pmock-topbar">
                  <span className="lp-dot lp-dot-r" />
                  <span className="lp-dot lp-dot-y" />
                  <span className="lp-dot lp-dot-g" />
                  <span className="lp-pmock-label">MentorInsight — {portal.label} Portal</span>
                </div>
                <div className="lp-pmock-header">
                  <div className="lp-pmock-header-icon">
                    <i className={`fa-solid ${portal.icon}`} />
                  </div>
                  <div>
                    <p className="lp-pmock-header-title">{portal.label} Portal</p>
                    <p className="lp-pmock-header-sub">{portal.tagline}</p>
                  </div>
                </div>
                <div className="lp-pmock-body">
                  {portal.mockup.map((r, i) => (
                    <div className="lp-pmock-row" key={i}>
                      <span className="lp-pmock-indicator" />
                      <span className="lp-pmock-text">{r.text}</span>
                      <span className="lp-pmock-status">{r.status}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, padding: "12px", background: "var(--accent-dim)", borderRadius: 6, border: "1px solid rgba(74,74,244,0.2)" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Powered by</div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: "var(--cream-2)", fontWeight: 600 }}>MentorInsight ERP Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
