import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from "/src/config";

// ============================================================
// ParentLogin.jsx — MMMP Parent Connect Login
// Parents log in using:
//   • Their child's Roll Number
//   • Their own registered mobile (fatherContact or motherContact)
// On success → navigates to /parent-dashboard
// with state: { parentData, studentData }
// ============================================================

const ParentLogin = () => {
  const [form, setForm] = useState({ rollNo: '', mobile: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.rollNo.trim() || !form.mobile.trim()) {
      setError('Please enter both Roll Number and Mobile Number.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('${API_URL}/api/parent/login', {
        rollNo: form.rollNo.trim(),
        mobile: form.mobile.trim(),
      });

      const { parentData, studentData } = res.data;

      // Store minimal session info in sessionStorage (no Firebase needed)
      sessionStorage.setItem(
        'parentSession',
        JSON.stringify({ rollNo: form.rollNo.trim(), mobile: form.mobile.trim() })
      );

      navigate('/parent-dashboard', { state: { parentData, studentData } });
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 404) {
        setError(
          'No student found with this Roll Number, or your mobile number is not registered. Please contact the faculty.'
        );
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const INFO_POINTS = [
    { icon: 'fa-chart-line',      text: 'Real-time attendance tracking' },
    { icon: 'fa-graduation-cap',  text: 'Semester-wise CGPA & marks' },
    { icon: 'fa-calendar-days',   text: 'Mentor session history' },
    { icon: 'fa-bell',            text: 'Important broadcasts from faculty' },
    { icon: 'fa-shield-halved',   text: 'Read-only secure access' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brand:     #F97316;
          --brand-dk:  #EA6A0A;
          --brand-lt:  #FED7AA;
          --bg-dark:   #0F0F10;
          --bg-card:   #181818;
          --bg-right:  #fdf8f4;
          --text-main: #1a1a1a;
          --text-muted:#6b7280;
          --border:    #e5e7eb;
        }

        .pl-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Nunito', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .pl-left {
          background: var(--bg-dark);
          padding: 52px 48px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .pl-left-pattern {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 70% 20%, rgba(249,115,22,.12) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(249,115,22,.07) 0%, transparent 40%);
        }

        .pl-left-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(249,115,22,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,.06) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        .pl-left-deco {
          position: absolute;
          bottom: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          border: 1.5px solid rgba(249,115,22,.15);
          pointer-events: none;
        }
        .pl-left-deco::after {
          content: '';
          position: absolute;
          inset: 24px;
          border-radius: 50%;
          border: 1.5px solid rgba(249,115,22,.10);
        }

        .pl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }
        .pl-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: var(--brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          color: #fff;
          flex-shrink: 0;
        }
        .pl-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #fff;
          letter-spacing: .01em;
        }
        .pl-logo-sub {
          font-size: 10px;
          color: rgba(249,115,22,.8);
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .pl-left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 40px 0;
        }

        .pl-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 13px 5px 10px;
          border-radius: 100px;
          background: rgba(249,115,22,.12);
          border: 1px solid rgba(249,115,22,.30);
          font-size: 11px;
          font-weight: 800;
          color: var(--brand);
          text-transform: uppercase;
          letter-spacing: .08em;
          margin-bottom: 28px;
          width: fit-content;
        }
        .pl-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
          animation: pl-pulse 2s infinite;
        }

        .pl-left-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 3vw, 48px);
          color: #fff;
          line-height: 1.18;
          margin-bottom: 18px;
          font-weight: 700;
        }
        .pl-left-h1 em {
          color: var(--brand);
          font-style: italic;
        }

        .pl-left-sub {
          font-size: 14.5px;
          color: rgba(255,255,255,.45);
          line-height: 1.75;
          margin-bottom: 44px;
          max-width: 340px;
        }

        .pl-info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pl-info-item {
          display: flex;
          align-items: center;
          gap: 14px;
          animation: pl-slideIn .5s ease both;
        }
        .pl-info-item:nth-child(1){animation-delay:.08s}
        .pl-info-item:nth-child(2){animation-delay:.16s}
        .pl-info-item:nth-child(3){animation-delay:.24s}
        .pl-info-item:nth-child(4){animation-delay:.32s}
        .pl-info-item:nth-child(5){animation-delay:.40s}

        .pl-info-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(249,115,22,.12);
          border: 1px solid rgba(249,115,22,.20);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: var(--brand);
          flex-shrink: 0;
        }
        .pl-info-text {
          font-size: 13.5px;
          color: rgba(255,255,255,.55);
          font-weight: 600;
        }

        .pl-left-footer {
          position: relative;
          z-index: 1;
          font-size: 11.5px;
          color: rgba(255,255,255,.2);
          font-weight: 600;
          letter-spacing: .04em;
        }

        /* ── RIGHT PANEL ── */
        .pl-right {
          background: var(--bg-right);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 48px;
          position: relative;
        }

        .pl-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--brand-lt), transparent);
          opacity: 0.6;
        }

        .pl-form-wrap {
          width: 100%;
          max-width: 390px;
        }

        .pl-form-header {
          margin-bottom: 40px;
        }

        .pl-form-emblem {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: linear-gradient(135deg, #fff5ec, #fde8d1);
          border: 1.5px solid var(--brand-lt);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 22px;
          box-shadow: 0 4px 16px rgba(249,115,22,.12);
        }

        .pl-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          color: var(--text-main);
          margin-bottom: 8px;
          font-weight: 700;
          line-height: 1.2;
        }

        .pl-form-sub {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Error */
        .pl-error {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 24px;
          animation: pl-shake .4s ease;
        }
        .pl-error i {
          color: #dc2626;
          font-size: 15px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .pl-error-text {
          font-size: 13px;
          font-weight: 600;
          color: #991b1b;
          line-height: 1.55;
        }

        /* Fields */
        .pl-field {
          margin-bottom: 20px;
        }
        .pl-label {
          display: block;
          font-size: 11.5px;
          font-weight: 800;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: .07em;
          margin-bottom: 8px;
        }
        .pl-input-wrap {
          position: relative;
        }
        .pl-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .pl-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-main);
          background: #fff;
          outline: none;
          font-family: 'Nunito', sans-serif;
          transition: border-color .18s, box-shadow .18s;
          letter-spacing: .02em;
        }
        .pl-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 4px rgba(249,115,22,.10);
        }
        .pl-input::placeholder {
          color: #9ca3af;
          font-weight: 500;
        }

        /* Hint */
        .pl-hint {
          margin-top: 6px;
          font-size: 12px;
          color: #9ca3af;
          font-weight: 600;
          padding-left: 2px;
        }

        /* Submit button */
        .pl-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-size: 15.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all .2s;
          margin-top: 8px;
          background: linear-gradient(135deg, var(--brand), var(--brand-dk));
          color: #fff;
          box-shadow: 0 6px 20px rgba(249,115,22,.35);
          letter-spacing: .02em;
        }
        .pl-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(249,115,22,.45);
        }
        .pl-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .pl-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .pl-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          animation: pl-spin .75s linear infinite;
          flex-shrink: 0;
        }

        /* Info box */
        .pl-infobox {
          margin-top: 28px;
          padding: 14px 16px;
          background: #fff;
          border: 1.5px solid var(--brand-lt);
          border-radius: 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .pl-infobox i {
          color: var(--brand);
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .pl-infobox-text {
          font-size: 12.5px;
          color: #92400e;
          font-weight: 600;
          line-height: 1.6;
        }

        /* Divider */
        .pl-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 20px;
        }
        .pl-divider-line { flex: 1; height: 1px; background: var(--border); }
        .pl-divider-text { font-size: 11.5px; color: #9ca3af; font-weight: 700; letter-spacing: .04em; }

        /* Back link */
        .pl-back {
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .pl-back a {
          color: var(--brand);
          font-weight: 700;
          text-decoration: none;
          transition: opacity .15s;
        }
        .pl-back a:hover { opacity: .75; }

        /* Animations */
        @keyframes pl-spin    { to { transform: rotate(360deg); } }
        @keyframes pl-pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes pl-slideIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pl-shake   {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }

        /* Responsive */
        @media (max-width: 820px) {
          .pl-root { grid-template-columns: 1fr; }
          .pl-left  { display: none; }
          .pl-right { padding: 40px 24px; }
          .pl-right::before { display: none; }
        }
      `}</style>

      <div className="pl-root">

        {/* ── LEFT: Brand / Info Panel ── */}
        <div className="pl-left">
          <div className="pl-left-pattern" />
          <div className="pl-left-grid" />
          <div className="pl-left-deco" />

          {/* Logo */}
          <div className="pl-logo">
            <div className="pl-logo-icon">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <div>
              <div className="pl-logo-text">MMMP</div>
              <div className="pl-logo-sub">Mentor Mentee Monitoring</div>
            </div>
          </div>

          {/* Body */}
          <div className="pl-left-body">
            <div className="pl-badge">
              <span className="pl-badge-dot" />
              Parent Connect Portal
            </div>

            <h1 className="pl-left-h1">
              Stay close to your<br />
              child's <em>academic life</em>
            </h1>

            <p className="pl-left-sub">
              Securely view your child's attendance, CGPA, mentor sessions,
              and important faculty announcements — all in one place.
            </p>

            <div className="pl-info-list">
              {INFO_POINTS.map((p, i) => (
                <div className="pl-info-item" key={i}>
                  <div className="pl-info-icon">
                    <i className={`fa-solid ${p.icon}`} />
                  </div>
                  <span className="pl-info-text">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pl-left-footer">
            © 2026 MMMP · Mentor Mentee Monitoring Portal
          </div>
        </div>

        {/* ── RIGHT: Login Form ── */}
        <div className="pl-right">
          <div className="pl-form-wrap">

            <div className="pl-form-header">
              <div className="pl-form-emblem">👨‍👩‍👧</div>
              <h2 className="pl-form-title">Parent Login</h2>
              <p className="pl-form-sub">
                Enter your child's roll number and your registered mobile number to access their academic report.
              </p>
            </div>

            {error && (
              <div className="pl-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span className="pl-error-text">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="pl-field">
                <label className="pl-label">Student's Roll Number</label>
                <div className="pl-input-wrap">
                  <i className="fa-solid fa-id-badge pl-input-icon" />
                  <input
                    className="pl-input"
                    type="text"
                    name="rollNo"
                    placeholder="e.g. 202303070"
                    value={form.rollNo}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <p className="pl-hint">Roll number as given by the college</p>
              </div>

              <div className="pl-field">
                <label className="pl-label">Your Mobile Number</label>
                <div className="pl-input-wrap">
                  <i className="fa-solid fa-mobile-screen pl-input-icon" />
                  <input
                    className="pl-input"
                    type="tel"
                    name="mobile"
                    placeholder="Registered parent mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    maxLength={15}
                  />
                </div>
                <p className="pl-hint">The mobile number your child's faculty has on record for you</p>
              </div>

              <button type="submit" className="pl-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="pl-spinner" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-unlock-keyhole" />
                    Access My Child's Report
                  </>
                )}
              </button>
            </form>

            <div className="pl-infobox">
              <i className="fa-solid fa-circle-info" />
              <span className="pl-infobox-text">
                This is a <strong>read-only</strong> portal. You cannot modify any academic records.
                If your mobile is not registered, please contact the faculty mentor.
              </span>
            </div>

            <div className="pl-divider">
              <div className="pl-divider-line" />
              <span className="pl-divider-text">other portals</span>
              <div className="pl-divider-line" />
            </div>

            <div className="pl-back">
              Student?{' '}
              <a href="/student-login">Student Login</a>
              {'  ·  '}
              <a href="/faculty-login">Faculty Login</a>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default ParentLogin;
 
