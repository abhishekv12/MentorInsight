import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ============================================================
// ParentDashboard.jsx — MMMP Parent Connect Dashboard
// ============================================================

/* ── helpers ── */
const getYearLabel = (batchName = '', fallback = '') => {
  const b = batchName.toUpperCase();
  if (b.startsWith('TY')) return 'Third Year (TY)';
  if (b.startsWith('SY')) return 'Second Year (SY)';
  if (b.startsWith('FY')) return 'First Year (FY)';
  return fallback || batchName || 'N/A';
};

const attColor = (pct) =>
  pct >= 75 ? '#22C55E' : pct >= 60 ? '#F59E0B' : '#EF4444';

const attLabel = (pct) =>
  pct >= 75 ? 'Good' : pct >= 60 ? 'Average' : 'Low';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

/* ── circular progress ── */
const AttCircle = ({ pct = 0, size = 110 }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = attColor(pct);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="50" y="54" textAnchor="middle"
        fill="#fff" fontSize="18" fontWeight="800"
        fontFamily="Nunito, sans-serif"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}>
        {pct}%
      </text>
    </svg>
  );
};

// ── CGPA calculator (mirrors StudentDashboard logic exactly) ──
const calcCGPA = (semesters = []) => {
  if (!semesters || semesters.length === 0) return 'N/A';
  // Only include semesters that PASSED (no ATKT)
  const validSems = semesters.filter(s => !s.hasATKT);
  if (validSems.length === 0) return 'N/A';
  let totalCG = 0;
  let totalCredits = 0;
  validSems.forEach(sem => {
    totalCG      += sem.totalCG      || 0;
    totalCredits += sem.totalCredits || 0;
  });
  if (totalCredits === 0) return 'N/A';
  return (totalCG / totalCredits).toFixed(2);
};

/* ── main component ── */
const ParentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialParent  = location.state?.parentData  || null;
  const initialStudent = location.state?.studentData || null;

  const [student,     setStudent]    = useState(initialStudent);
  const [parent,      setParent]     = useState(initialParent);
  const [loading,     setLoading]    = useState(!initialStudent);
  const [activeTab,   setActiveTab]  = useState('overview');
  const [expandedSem, setExpandedSem] = useState(null);

  const session = (() => {
    try { return JSON.parse(sessionStorage.getItem('parentSession') || '{}'); }
    catch { return {}; }
  })();

  // ── Hide the global site navbar while on this page ──
  useEffect(() => {
    // Add class to body so global CSS can hide the nav
    document.body.classList.add('parent-dashboard-active');

    // Directly hide common navbar selectors used in landing pages
    const selectors = [
      'nav',
      'header',
      '.navbar',
      '.nav-bar',
      '.site-header',
      '.landing-nav',
      '.main-nav',
      '.top-nav',
      '.global-header',
      '#navbar',
      '#header',
    ];
    const hidden = [];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Don't hide our own topbar
        if (!el.classList.contains('pd-topbar') && !el.closest('.pd-topbar')) {
          el.dataset.pdHidden = el.style.display || '';
          el.style.display = 'none';
          hidden.push(el);
        }
      });
    });

    return () => {
      document.body.classList.remove('parent-dashboard-active');
      hidden.forEach(el => {
        el.style.display = el.dataset.pdHidden || '';
        delete el.dataset.pdHidden;
      });
    };
  }, []);

  useEffect(() => {
    if (!session.rollNo && !initialStudent) {
      navigate('/parent-login', { replace: true });
    }
  }, []);

  useEffect(() => {
    if (!session.rollNo || !session.mobile) return;
    const fetchReport = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/parent/student-report', {
          params: { rollNo: session.rollNo, mobile: session.mobile },
        });
        setStudent(res.data.studentData);
        setParent(res.data.parentData);
      } catch { /* keep initial state */ }
      finally { setLoading(false); }
    };
    fetchReport();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('parentSession');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
          body { margin: 0; background: #0F0F10; font-family: 'Nunito', sans-serif; }
          .pd-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,.5); font-size: 15px; font-weight: 600; }
          .pd-loading-spinner { width: 42px; height: 42px; border-radius: 50%; border: 3px solid rgba(249,115,22,.2); border-top-color: #F97316; animation: pd-spin .8s linear infinite; }
          @keyframes pd-spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="pd-loading">
          <div className="pd-loading-spinner" />
          Loading student report…
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <style>{`body{margin:0;background:#0F0F10;font-family:sans-serif;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;}`}</style>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ marginBottom: 16, color: 'rgba(255,255,255,.6)' }}>Session expired or no data found.</p>
          <button onClick={() => navigate('/')}
            style={{ padding: '10px 24px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
            Back to Home
          </button>
        </div>
      </>
    );
  }

  const batchName   = student.batchInfo?.batchName || student.batchName || '';
  const academicYr  = student.batchInfo?.academicYear || '';
  const division    = student.division || student.batchInfo?.division || '';
  const attendance  = Math.round(student.attendance || 0);
  const semesters   = student.semesters || student.batchInfo?.semesters || [];

  // ── Compute CGPA from semesters (same logic as StudentDashboard) ──
  const cgpa = semesters.length > 0
    ? calcCGPA(semesters)
    : (student.cgpa || student.batchInfo?.cgpa || 'N/A');

  const sessions    = student.mentorSessions || student.batchInfo?.mentorSessions || [];
  const broadcasts  = student.broadcasts || student.batchInfo?.broadcasts || [];
  const certCount   = (student.certifications || []).length;

  const isfather = parent?.relation === 'father';
  const parentName = isfather
    ? (student.fatherName || student.profileData?.fatherName || 'Father')
    : (student.motherName || student.profileData?.motherName || 'Mother');

  const TABS = [
    { id: 'overview',   label: 'Overview',   icon: 'fa-gauge-high' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check' },
    { id: 'academics',  label: 'Academics',  icon: 'fa-book-open' },
    { id: 'sessions',   label: 'Sessions',   icon: 'fa-comments' },
    { id: 'broadcasts', label: 'Broadcasts', icon: 'fa-bullhorn' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brand:    #F97316;
          --brand-dk: #EA6A0A;
          --bg:       #0F0F10;
          --bg2:      #181818;
          --bg3:      #1f1f20;
          --border:   rgba(255,255,255,.07);
          --text:     #f1f1f1;
          --muted:    rgba(255,255,255,.45);
        }

        body { background: var(--bg); color: var(--text); font-family: 'Nunito', sans-serif; }

        /* Hide the global landing page navbar when parent dashboard is active */
        body.parent-dashboard-active nav:not(.pd-topbar nav),
        body.parent-dashboard-active header:not(.pd-topbar),
        body.parent-dashboard-active .navbar,
        body.parent-dashboard-active .nav-bar,
        body.parent-dashboard-active .site-header,
        body.parent-dashboard-active .landing-nav,
        body.parent-dashboard-active .main-nav,
        body.parent-dashboard-active #navbar,
        body.parent-dashboard-active #header {
          display: none !important;
        }

        .pd-topbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(15,15,16,.92);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between;
          height: 60px;
        }
        .pd-tb-left { display: flex; align-items: center; gap: 10px; }
        .pd-tb-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: var(--brand);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; color: #fff; flex-shrink: 0;
        }
        .pd-tb-name { font-family: 'Playfair Display', serif; font-size: 17px; color: #fff; font-weight: 700; }
        .pd-tb-badge {
          padding: 3px 10px; border-radius: 100px;
          background: rgba(249,115,22,.15); border: 1px solid rgba(249,115,22,.25);
          font-size: 10px; font-weight: 800; color: var(--brand);
          text-transform: uppercase; letter-spacing: .08em;
        }
        .pd-tb-right { display: flex; align-items: center; gap: 16px; }
        .pd-tb-who { font-size: 13px; color: var(--muted); font-weight: 600; }
        .pd-tb-who strong { color: var(--text); }
        .pd-logout-btn {
          padding: 7px 16px; border-radius: 8px; border: 1px solid var(--border);
          background: transparent; color: var(--muted);
          font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all .15s;
        }
        .pd-logout-btn:hover { color: #ef4444; border-color: rgba(239,68,68,.35); }

        .pd-page { max-width: 1100px; margin: 0 auto; padding: 28px 24px 60px; }

        .pd-hero {
          background: linear-gradient(130deg, #1a1412, #1c1410);
          border: 1px solid rgba(249,115,22,.20);
          border-radius: 20px; padding: 28px 32px; margin-bottom: 24px;
          display: flex; align-items: center; gap: 24px;
          position: relative; overflow: hidden;
        }
        .pd-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at top right, rgba(249,115,22,.10), transparent 60%);
          pointer-events: none;
        }
        .pd-hero-avatar {
          width: 72px; height: 72px; border-radius: 18px;
          background: linear-gradient(135deg, var(--brand), var(--brand-dk));
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; color: #fff; flex-shrink: 0; position: relative; z-index: 1;
        }
        .pd-hero-info { flex: 1; position: relative; z-index: 1; }
        .pd-hero-name {
          font-family: 'Playfair Display', serif; font-size: 24px;
          color: #fff; font-weight: 700; margin-bottom: 6px;
        }
        .pd-hero-meta { display: flex; flex-wrap: wrap; gap: 10px; }
        .pd-hero-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 100px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.10);
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,.7);
        }
        .pd-hero-chip i { font-size: 11px; color: var(--brand); }
        .pd-hero-right { position: relative; z-index: 1; text-align: center; }
        .pd-hero-att-label {
          font-size: 11px; font-weight: 800; color: var(--muted);
          text-transform: uppercase; letter-spacing: .08em; margin-top: 8px;
        }
        .pd-hero-att-status { font-size: 12px; font-weight: 800; margin-top: 3px; }

        .pd-alert {
          border-radius: 12px; padding: 13px 18px;
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
          font-size: 13.5px; font-weight: 700;
        }
        .pd-alert-danger  { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25); color: #fca5a5; }
        .pd-alert-warning { background: rgba(245,158,11,.10); border: 1px solid rgba(245,158,11,.22); color: #fcd34d; }

        .pd-tabs {
          display: flex; gap: 4px; background: var(--bg2);
          border: 1px solid var(--border); border-radius: 14px;
          padding: 5px; margin-bottom: 24px; overflow-x: auto;
        }
        .pd-tab {
          flex: 1; min-width: 100px; padding: 10px 12px; border-radius: 10px;
          border: none; background: transparent; color: var(--muted);
          font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 7px; transition: all .15s; white-space: nowrap;
        }
        .pd-tab:hover:not(.active) { color: var(--text); background: rgba(255,255,255,.04); }
        .pd-tab.active { background: var(--brand); color: #fff; box-shadow: 0 3px 12px rgba(249,115,22,.30); }

        .pd-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; padding: 22px 24px; margin-bottom: 20px;
        }
        .pd-card-title {
          font-size: 12px; font-weight: 800; color: var(--muted);
          text-transform: uppercase; letter-spacing: .09em; margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }
        .pd-card-title i { color: var(--brand); }

        .pd-stat-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px; margin-bottom: 20px;
        }
        .pd-stat {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px;
        }
        .pd-stat-icon {
          width: 42px; height: 42px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .pd-stat-val { font-size: 22px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 3px; }
        .pd-stat-label { font-size: 12px; font-weight: 600; color: var(--muted); }

        /* Semester table */
        .pd-sem-table { width: 100%; border-collapse: collapse; }
        .pd-sem-table th {
          font-size: 11px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .07em; color: var(--muted); padding: 10px 14px;
          text-align: left; border-bottom: 1px solid var(--border);
        }
        .pd-sem-table td {
          padding: 13px 14px; font-size: 13.5px; font-weight: 600; color: var(--text);
          border-bottom: 1px solid rgba(255,255,255,.04);
        }
        .pd-sem-table tr:last-child td { border-bottom: none; }
        .pd-sem-row { cursor: pointer; transition: background .15s; }
        .pd-sem-row:hover { background: rgba(249,115,22,.06); }
        .pd-sem-row.expanded { background: rgba(249,115,22,.09); border-bottom: none; }

        /* Full subject detail expand (exam record) */
        .pd-exam-expand { background: #141414; border-top: 2px solid rgba(249,115,22,.25); animation: pd-slide-down .2s ease; }
        @keyframes pd-slide-down { from { opacity:0;transform:translateY(-6px); } to { opacity:1;transform:translateY(0); } }
        .pd-exam-inner { padding: 20px 18px; }
        .pd-exam-inner-title {
          font-size: 11px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .09em; color: var(--brand); margin-bottom: 14px;
          display: flex; align-items: center; gap: 7px;
        }
        .pd-exam-scroll { overflow-x: auto; }
        .pd-full-table { width: 100%; border-collapse: collapse; min-width: 860px; font-size: 12.5px; }
        .pd-full-table thead { background: rgba(249,115,22,.08); }
        .pd-full-table th {
          padding: 9px 10px; text-align: center; font-size: 10px; font-weight: 800;
          color: rgba(249,115,22,.85); text-transform: uppercase; letter-spacing: .07em;
          border: 1px solid rgba(255,255,255,.06); white-space: nowrap;
        }
        .pd-full-table td {
          padding: 10px; border: 1px solid rgba(255,255,255,.05);
          text-align: center; color: var(--text); font-weight: 600;
        }
        .pd-full-table .pd-ft-name { text-align: left; min-width: 140px; font-weight: 700; color: #fff; }
        .pd-full-table .pd-ft-atkt-row td { background: rgba(239,68,68,.07); }
        .pd-ft-total-row td { background: rgba(249,115,22,.08); font-weight: 800; }
        .pd-ft-calc { margin-top: 12px; padding: 12px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; }
        .pd-ft-calc-pass { background: rgba(34,197,94,.10); border: 1px solid rgba(34,197,94,.20); color: #4ade80; }
        .pd-ft-calc-fail { background: rgba(239,68,68,.10); border: 1px solid rgba(239,68,68,.20); color: #fca5a5; }
        .pd-gb { display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 800; }
        .pd-gb-pass { background: rgba(34,197,94,.18); color: #4ade80; }
        .pd-gb-atkt { background: rgba(239,68,68,.20); color: #fca5a5; border: 1px solid rgba(239,68,68,.3); }
        .pd-sem-badge {
          display: inline-block; padding: 3px 10px; border-radius: 100px;
          font-size: 11px; font-weight: 800;
        }

        /* Subject detail rows inside academics tab */
        .pd-subj-detail {
          background: var(--bg3); border-radius: 10px;
          padding: 14px 16px; margin-top: 6px;
        }
        .pd-subj-detail-title {
          font-size: 11px; font-weight: 800; color: var(--muted);
          text-transform: uppercase; letter-spacing: .07em; margin-bottom: 10px;
        }
        .pd-subject-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.04);
          font-size: 13px;
        }
        .pd-subject-row:last-child { border-bottom: none; }
        .pd-subject-name { color: var(--text); font-weight: 600; flex: 1; }
        .pd-subject-grades { display: flex; gap: 12px; align-items: center; }
        .pd-subject-grade-item { font-size: 12px; color: var(--muted); }
        .pd-subject-grade-item strong { color: var(--text); }

        .pd-session-list { display: flex; flex-direction: column; gap: 12px; }
        .pd-session-card {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 18px;
          display: flex; align-items: flex-start; gap: 14px;
        }
        .pd-session-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(249,115,22,.12); border: 1px solid rgba(249,115,22,.20);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; color: var(--brand); flex-shrink: 0;
        }
        .pd-session-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .pd-session-meta {
          font-size: 12px; font-weight: 600; color: var(--muted);
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .pd-session-status {
          display: inline-block; padding: 2px 9px; border-radius: 100px;
          font-size: 10.5px; font-weight: 800;
        }

        .pd-bc-list { display: flex; flex-direction: column; gap: 12px; }
        .pd-bc-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .pd-bc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .pd-bc-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .pd-bc-date { font-size: 11.5px; font-weight: 600; color: var(--muted); }
        .pd-bc-body { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.55); line-height: 1.65; }

        .pd-empty { text-align: center; padding: 44px 20px; color: var(--muted); }
        .pd-empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--bg3); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: rgba(255,255,255,.2); margin: 0 auto 16px;
        }
        .pd-empty h4 { font-size: 15px; margin-bottom: 6px; color: rgba(255,255,255,.5); }
        .pd-empty p  { font-size: 13px; }

        .pd-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .pd-profile-row { padding: 13px 16px; background: var(--bg3); }
        .pd-pr-label { font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
        .pd-pr-val { font-size: 14px; font-weight: 700; color: var(--text); }

        .pd-att-bar-track { flex: 1; height: 8px; border-radius: 100px; background: rgba(255,255,255,.08); overflow: hidden; }
        .pd-att-bar-fill { height: 100%; border-radius: 100px; transition: width 1s ease; }
        .pd-subj-list { display: flex; flex-direction: column; gap: 14px; }
        .pd-subj-head { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .pd-subj-name { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .pd-subj-pct  { font-size: 13px; font-weight: 800; }

        @media (max-width: 700px) {
          .pd-topbar { padding: 0 16px; }
          .pd-page   { padding: 20px 16px 60px; }
          .pd-hero   { flex-direction: column; text-align: center; }
          .pd-hero-meta { justify-content: center; }
          .pd-profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="pd-topbar">
        <div className="pd-tb-left">
          <div className="pd-tb-icon"><i className="fa-solid fa-graduation-cap" /></div>
          <span className="pd-tb-name">MMMP</span>
          <span className="pd-tb-badge">Parent View</span>
        </div>
        <div className="pd-tb-right">
          <span className="pd-tb-who">Viewing as <strong>{parentName}</strong></span>
          <button className="pd-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Sign Out
          </button>
        </div>
      </div>

      <div className="pd-page">

        {/* HERO */}
        <div className="pd-hero">
          <div className="pd-hero-avatar"><i className="fa-solid fa-user-graduate" /></div>
          <div className="pd-hero-info">
            <div className="pd-hero-name">{student.name || 'Student'}</div>
            <div className="pd-hero-meta">
              {student.rollNo && <span className="pd-hero-chip"><i className="fa-solid fa-id-badge" /> {student.rollNo}</span>}
              {batchName      && <span className="pd-hero-chip"><i className="fa-solid fa-layer-group" /> {batchName}</span>}
              {division       && <span className="pd-hero-chip"><i className="fa-solid fa-sitemap" /> Division {division}</span>}
              {academicYr     && <span className="pd-hero-chip"><i className="fa-solid fa-calendar" /> {academicYr}</span>}
              {batchName      && <span className="pd-hero-chip"><i className="fa-solid fa-graduation-cap" /> {getYearLabel(batchName)}</span>}
            </div>
          </div>
          <div className="pd-hero-right">
            <AttCircle pct={attendance} />
            <div className="pd-hero-att-label">Attendance</div>
            <div className="pd-hero-att-status" style={{ color: attColor(attendance) }}>{attLabel(attendance)}</div>
          </div>
        </div>

        {/* ALERTS */}
        {attendance < 60 && (
          <div className="pd-alert pd-alert-danger">
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 18 }} />
            <span>Critical: {student.name?.split(' ')[0]}'s attendance is below 60% ({attendance}%). Immediate improvement is required to be eligible for exams.</span>
          </div>
        )}
        {attendance >= 60 && attendance < 75 && (
          <div className="pd-alert pd-alert-warning">
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 18 }} />
            <span>Warning: Attendance is {attendance}% — below the required 75%. Please encourage regular attendance to avoid issues.</span>
          </div>
        )}

        {/* TABS */}
        <div className="pd-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`pd-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <i className={`fa-solid ${t.icon}`} />{t.label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <>
            <div className="pd-stat-grid">
              {[
                { icon: 'fa-calendar-check', bg: attColor(attendance) + '20', color: attColor(attendance), val: `${attendance}%`, label: 'Attendance' },
                { icon: 'fa-star',            bg: 'rgba(249,115,22,.15)',       color: '#F97316',             val: cgpa,            label: 'CGPA' },
                { icon: 'fa-comments',        bg: 'rgba(99,102,241,.15)',       color: '#818CF8',             val: sessions.length, label: 'Mentor Sessions' },
                { icon: 'fa-certificate',     bg: 'rgba(34,197,94,.15)',        color: '#22C55E',             val: certCount,       label: 'Certifications' },
              ].map((s, i) => (
                <div className="pd-stat" key={i}>
                  <div className="pd-stat-icon" style={{ background: s.bg, color: s.color }}>
                    <i className={`fa-solid ${s.icon}`} />
                  </div>
                  <div>
                    <div className="pd-stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="pd-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pd-card">
              <div className="pd-card-title"><i className="fa-solid fa-circle-user" /> Student Details</div>
              <div className="pd-profile-grid">
                {[
                  { label: 'Full Name',       val: student.name },
                  { label: 'Roll No',         val: student.rollNo },
                  { label: 'Batch',           val: batchName },
                  { label: 'Academic Year',   val: getYearLabel(batchName) + (academicYr ? ` · ${academicYr}` : '') },
                  { label: 'Division',        val: division || '—' },
                  { label: 'Faculty Mentor',  val: student.mentorName || student.batchInfo?.mentorName || '—' },
                  { label: 'Email',           val: student.email || '—' },
                  { label: 'College',         val: student.collegeName || student.batchInfo?.collegeName || '—' },
                ].map((r, i) => (
                  <div className="pd-profile-row" key={i}>
                    <div className="pd-pr-label">{r.label}</div>
                    <div className="pd-pr-val">{r.val || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {broadcasts.length > 0 && (
              <div className="pd-card">
                <div className="pd-card-title"><i className="fa-solid fa-bullhorn" /> Latest Broadcasts</div>
                <div className="pd-bc-list">
                  {broadcasts.slice(0, 3).map((b, i) => (
                    <div className="pd-bc-card" key={i}>
                      <div className="pd-bc-top">
                        <span className="pd-bc-title">{b.title || b.subject || 'Notice'}</span>
                        <span className="pd-bc-date">{fmtDate(b.createdAt || b.date || b.sentAt)}</span>
                      </div>
                      <div className="pd-bc-body">{b.message || b.body || ''}</div>
                    </div>
                  ))}
                </div>
                {broadcasts.length > 3 && (
                  <button className="pd-tab" style={{ marginTop: 12, width: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
                    onClick={() => setActiveTab('broadcasts')}>
                    View all {broadcasts.length} broadcasts →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* ══ ATTENDANCE ══ */}
        {activeTab === 'attendance' && (
          <>
            <div className="pd-card">
              <div className="pd-card-title"><i className="fa-solid fa-chart-pie" /> Overall Attendance</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                <AttCircle pct={attendance} size={130} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: attColor(attendance), marginBottom: 4 }}>{attendance}%</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>
                    Status: <span style={{ color: attColor(attendance), fontWeight: 800 }}>{attLabel(attendance)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, lineHeight: 1.7 }}>
                    Minimum required: <strong style={{ color: '#fff' }}>75%</strong><br />
                    {attendance < 75
                      ? `${student.name?.split(' ')[0]} needs to improve attendance to avoid academic penalties.`
                      : `${student.name?.split(' ')[0]}'s attendance meets the requirement.`}
                  </div>
                </div>
              </div>
            </div>

            {(student.subjectAttendance || []).length > 0 && (
              <div className="pd-card">
                <div className="pd-card-title"><i className="fa-solid fa-list-check" /> Subject-wise Attendance</div>
                <div className="pd-subj-list">
                  {(student.subjectAttendance || []).map((s, i) => {
                    const pct = Math.round(s.percentage || s.pct || 0);
                    const c = attColor(pct);
                    return (
                      <div key={i}>
                        <div className="pd-subj-head">
                          <span className="pd-subj-name">{s.subject || s.name}</span>
                          <span className="pd-subj-pct" style={{ color: c }}>{pct}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="pd-att-bar-track">
                            <div className="pd-att-bar-fill" style={{ width: `${pct}%`, background: c }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ ACADEMICS ══ */}
        {activeTab === 'academics' && (
          <>
            <div className="pd-stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="pd-stat">
                <div className="pd-stat-icon" style={{ background: 'rgba(249,115,22,.15)', color: '#F97316' }}>
                  <i className="fa-solid fa-star" />
                </div>
                <div>
                  <div className="pd-stat-val" style={{ color: '#F97316' }}>{cgpa}</div>
                  <div className="pd-stat-label">Cumulative CGPA</div>
                </div>
              </div>
              <div className="pd-stat">
                <div className="pd-stat-icon" style={{ background: 'rgba(99,102,241,.15)', color: '#818CF8' }}>
                  <i className="fa-solid fa-layer-group" />
                </div>
                <div>
                  <div className="pd-stat-val" style={{ color: '#818CF8' }}>{semesters.length}</div>
                  <div className="pd-stat-label">Semesters Completed</div>
                </div>
              </div>
            </div>

            {semesters.length > 0 ? (
              <>
                <div className="pd-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="pd-card-title" style={{ padding: '18px 22px 14px' }}>
                    <i className="fa-solid fa-table-list" /> Semester-wise Performance
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                      Click a row to see full subject record
                    </span>
                  </div>

                  {/* One block per semester: summary row + expandable detail */}
                  {semesters.map((sem, i) => {
                    const sgpa       = sem.semesterSGPA  ?? sem.sgpa  ?? sem.SGPA  ?? '—';
                    const grade      = sem.semesterGrade ?? sem.grade  ?? '—';
                    const hasATKT    = sem.hasATKT ?? false;
                    const atktCount  = sem.atktCount ?? 0;
                    const result     = hasATKT ? (atktCount >= 3 ? 'FAIL' : 'ATKT') : 'PASS';
                    const resultColor = result === 'PASS' ? '#22C55E' : result === 'ATKT' ? '#F59E0B' : '#EF4444';
                    const semLabel   = sem.semesterName || (sem.semesterNumber ? `Semester ${sem.semesterNumber}` : `Sem ${i + 1}`);
                    const isOpen     = expandedSem === i;
                    const subjects   = sem.subjects || [];

                    return (
                      <React.Fragment key={i}>
                        {/* ── Summary Row ── */}
                        <div
                          className={`pd-sem-row ${isOpen ? 'expanded' : ''}`}
                          style={{ display: 'flex', alignItems: 'center', padding: '14px 22px', gap: 14,
                                   borderBottom: isOpen ? 'none' : '1px solid rgba(255,255,255,.05)',
                                   flexWrap: 'wrap' }}
                          onClick={() => setExpandedSem(isOpen ? null : i)}
                        >
                          {/* Semester name */}
                          <div style={{ minWidth: 130, fontWeight: 800, fontSize: 14, color: '#fff' }}>
                            {semLabel}
                            {hasATKT && (
                              <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                             background: resultColor + '25', color: resultColor, fontWeight: 800 }}>
                                {result}
                              </span>
                            )}
                          </div>

                          {/* Mini stats */}
                          {[
                            { label: 'SGPA',    val: hasATKT ? '—' : sgpa,              color: hasATKT ? '#F59E0B' : '#F97316' },
                            { label: 'Credits', val: sem.totalCredits ?? '—',            color: 'var(--text)' },
                            { label: 'Total CG',val: sem.totalCG      ?? '—',            color: 'var(--text)' },
                            { label: 'Grade',   val: grade,                               color: resultColor  },
                          ].map((s, k) => (
                            <div key={k} style={{ flex: 1, minWidth: 70, textAlign: 'center' }}>
                              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                                {s.label}
                              </div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</div>
                            </div>
                          ))}

                          {/* Result badge */}
                          <span className="pd-sem-badge"
                            style={{ background: resultColor + '18', color: resultColor, marginLeft: 'auto' }}>
                            {result}
                          </span>

                          {/* Chevron */}
                          <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}
                            style={{ fontSize: 12, color: 'var(--muted)' }} />
                        </div>

                        {/* ── Expanded Detail Table ── */}
                        {isOpen && subjects.length > 0 && (
                          <div className="pd-exam-expand">
                            <div className="pd-exam-inner">
                              <div className="pd-exam-inner-title">
                                <i className="fa-solid fa-list-check" />
                                {semLabel} — Full Subject Record
                              </div>
                              <div className="pd-exam-scroll">
                                <table className="pd-full-table">
                                  <thead>
                                    <tr>
                                      <th style={{ textAlign: 'left' }}>Subject</th>
                                      <th>Internal Avg</th>
                                      <th>Sem End</th>
                                      <th>Theory Total</th>
                                      <th>Theory Grade</th>
                                      <th>Practical</th>
                                      <th>Prac Grade</th>
                                      <th>Theory CP</th>
                                      <th>Prac CP</th>
                                      <th>Total CP</th>
                                      <th>Theory GP</th>
                                      <th>Prac GP</th>
                                      <th>Theory CG</th>
                                      <th>Prac CG</th>
                                      <th>Total CG</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subjects.map((subj, j) => {
                                      const isATKT = subj.theoryGrade === 'ATKT' || subj.practicalGrade === 'ATKT';
                                      const GradeChip = ({ g }) => g
                                        ? <span className={`pd-gb ${g === 'ATKT' ? 'pd-gb-atkt' : 'pd-gb-pass'}`}>{g}</span>
                                        : <span style={{ color: 'var(--muted)' }}>—</span>;
                                      const v = (x) => (x !== null && x !== undefined) ? x : '—';
                                      return (
                                        <tr key={j} className={isATKT ? 'pd-full-table pd-ft-atkt-row' : ''}>
                                          <td className="pd-ft-name">{subj.subjectName || `Subject ${j + 1}`}</td>
                                          <td>{v(subj.avg)}</td>
                                          <td>{v(subj.semesterEnd)}</td>
                                          <td style={{ fontWeight: 700 }}>{v(subj.theoryTotal)}</td>
                                          <td><GradeChip g={subj.theoryGrade} /></td>
                                          <td>{v(subj.practicalMarks)}</td>
                                          <td><GradeChip g={subj.practicalGrade} /></td>
                                          <td>{subj.theoryCP    ?? 0}</td>
                                          <td>{subj.practicalCP ?? 0}</td>
                                          <td style={{ fontWeight: 800 }}>{subj.totalCP ?? 0}</td>
                                          <td>{subj.theoryGP    ?? 0}</td>
                                          <td>{subj.practicalGP ?? 0}</td>
                                          <td>{subj.theoryCG    ?? 0}</td>
                                          <td>{subj.practicalCG ?? 0}</td>
                                          <td style={{ fontWeight: 800, color: '#F97316' }}>{subj.totalCG ?? 0}</td>
                                        </tr>
                                      );
                                    })}
                                    {/* Totals row */}
                                    <tr className="pd-ft-total-row">
                                      <td className="pd-ft-name" style={{ color: 'var(--muted)' }}>Totals</td>
                                      <td colSpan={8} style={{ color: 'var(--muted)' }}>—</td>
                                      <td style={{ fontWeight: 800, color: '#F97316' }}>{sem.totalCredits ?? 0}</td>
                                      <td colSpan={4} style={{ color: 'var(--muted)' }}>—</td>
                                      <td style={{ fontWeight: 800, color: '#F97316' }}>{sem.totalCG ?? 0}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* SGPA calculation note */}
                              {hasATKT ? (
                                <div className="pd-ft-calc pd-ft-calc-fail">
                                  ⚠️ {atktCount >= 3 ? 'FAIL' : 'ATKT'} — SGPA not calculated.{' '}
                                  {atktCount >= 3
                                    ? `${atktCount} ATKT subjects — semester must be repeated.`
                                    : `${atktCount} ATKT subject(s) — re-examination required.`}
                                </div>
                              ) : (
                                <div className="pd-ft-calc pd-ft-calc-pass">
                                  ✓ SGPA = Total CG ÷ Total Credits = {sem.totalCG ?? 0} ÷ {sem.totalCredits ?? 0} = <strong>{sgpa}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="pd-card">
                <div className="pd-empty">
                  <div className="pd-empty-icon"><i className="fa-solid fa-book-open" /></div>
                  <h4>No Semester Data</h4>
                  <p>Results will appear here once uploaded by the faculty.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ SESSIONS ══ */}
        {activeTab === 'sessions' && (
          <div className="pd-card">
            <div className="pd-card-title"><i className="fa-solid fa-comments" /> Mentor Sessions ({sessions.length})</div>
            {sessions.length === 0 ? (
              <div className="pd-empty">
                <div className="pd-empty-icon"><i className="fa-solid fa-comments" /></div>
                <h4>No Sessions Yet</h4>
                <p>Mentor sessions will appear here once scheduled.</p>
              </div>
            ) : (
              <div className="pd-session-list">
                {sessions.map((s, i) => {
                  const statusColor = s.status === 'completed' ? '#22C55E' : s.status === 'upcoming' ? '#6366F1' : '#F59E0B';
                  return (
                    <div className="pd-session-card" key={i}>
                      <div className="pd-session-icon"><i className="fa-solid fa-chalkboard-user" /></div>
                      <div style={{ flex: 1 }}>
                        <div className="pd-session-title">{s.topic || s.title || `Session ${i + 1}`}</div>
                        <div className="pd-session-meta">
                          <span><i className="fa-regular fa-calendar" style={{ marginRight: 5 }} />{fmtDate(s.date || s.scheduledAt)}</span>
                          {s.mode && <span><i className="fa-solid fa-location-dot" style={{ marginRight: 5 }} />{s.mode}</span>}
                          <span className="pd-session-status" style={{ background: statusColor + '20', color: statusColor }}>
                            {s.status || 'Completed'}
                          </span>
                        </div>
                        {s.summary && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6 }}>{s.summary}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ BROADCASTS ══ */}
        {activeTab === 'broadcasts' && (
          <div className="pd-card">
            <div className="pd-card-title"><i className="fa-solid fa-bullhorn" /> Faculty Broadcasts ({broadcasts.length})</div>
            {broadcasts.length === 0 ? (
              <div className="pd-empty">
                <div className="pd-empty-icon"><i className="fa-solid fa-bullhorn" /></div>
                <h4>No Broadcasts</h4>
                <p>Faculty announcements will appear here.</p>
              </div>
            ) : (
              <div className="pd-bc-list">
                {broadcasts.map((b, i) => (
                  <div className="pd-bc-card" key={i}>
                    <div className="pd-bc-top">
                      <span className="pd-bc-title">{b.title || b.subject || 'Notice'}</span>
                      <span className="pd-bc-date">{fmtDate(b.createdAt || b.date || b.sentAt)}</span>
                    </div>
                    <div className="pd-bc-body">{b.message || b.body || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default ParentDashboard;