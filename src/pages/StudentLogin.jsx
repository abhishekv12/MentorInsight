import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from "../config";

// ============================================================
// StudentLogin.jsx — strict email match against batch record
// ============================================================

const StudentLogin = () => {
  const [credentials, setCredentials] = useState({ rollNo: '', mobile: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Step 1 — verify roll + mobile against batch roster
      const verifyRes = await axios.post('${API_URL}/api/student/verify-login', {
        rollNo: credentials.rollNo,
        mobile: credentials.mobile,
      });
      const studentData = verifyRes.data.data;
      // studentData.email is the email the faculty entered when adding the student

      // Step 2 — Google sign-in
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-closed-by-user') {
          setError('Sign-in cancelled. Please try again.');
          setLoading(false);
          return;
        }
        throw popupErr;
      }

      const googleEmail = result.user.email;

      // Step 3 — STRICT email check
      if (!studentData.email) {
        // Faculty didn't set an email for this student — block login
        await signOut(auth);
        setError(
          'No email is registered for your account. Ask your faculty to update your email in the roster.'
        );
        setLoading(false);
        return;
      }

      if (googleEmail.toLowerCase() !== studentData.email.toLowerCase()) {
        // Wrong Google account — sign out immediately
        await signOut(auth);
        setError(
          `Wrong Google account. Please sign in with "${studentData.email}" — the email your faculty registered for you.`
        );
        setLoading(false);
        return;
      }

      // Step 4 — Upsert user record with the real uid
      await axios.post('${API_URL}/api/users', {
        uid: result.user.uid,
        name: studentData.name,
        email: googleEmail,
        role: 'student',
        batchName: studentData.batchName,
        mentorId: studentData.mentorId,
        rollNo: studentData.rollNo,
        mobile: credentials.mobile,
        collegeName: studentData.collegeName,
      });

      navigate('/student-dashboard');
    } catch (err) {
      console.error(err);
      // Sign out on any unexpected error to avoid stale auth state
      try { await signOut(auth); } catch {}
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.code === 'auth/popup-closed-by-user') setError('Sign-in cancelled.');
      else setError('Login failed. Please check your details and try again.');
    }
    setLoading(false);
  };

  const FEATURES = [
    { icon: 'fa-calendar-check', text: 'View & apply for mentor sessions' },
    { icon: 'fa-star',           text: 'Submit anonymous faculty reviews' },
    { icon: 'fa-book-open',      text: 'Access learning resources & PDFs' },
    { icon: 'fa-certificate',    text: 'Manage your certifications vault' },
    { icon: 'fa-bell',           text: 'Receive priority broadcasts' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sl-root { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: 'DM Sans', sans-serif; }
        .sl-left { background: #0f1b2d; padding: 56px 52px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .sl-left::before { content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%); top: -150px; right: -150px; pointer-events: none; }
        .sl-left::after { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(37,99,235,.10) 0%, transparent 70%); bottom: -80px; left: -60px; pointer-events: none; }
        .sl-left-grid { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px); background-size: 28px 28px; }
        .sl-logo { display: flex; align-items: center; gap: 10px; font-family: 'Instrument Serif', serif; font-size: 22px; color: #fff; text-decoration: none; position: relative; z-index: 1; }
        .sl-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
        .sl-left-body { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 1; padding: 40px 0; }
        .sl-portal-badge { display: inline-flex; align-items: center; gap: 7px; padding: 5px 13px; border-radius: 100px; background: rgba(37,99,235,.18); border: 1px solid rgba(37,99,235,.35); font-size: 11px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 24px; width: fit-content; }
        .sl-portal-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #3b82f6; animation: sl-pulse 2s infinite; }
        .sl-left-h1 { font-family: 'Instrument Serif', serif; font-size: clamp(34px, 3vw, 46px); color: #fff; line-height: 1.15; margin-bottom: 16px; font-weight: 400; }
        .sl-left-h1 em { color: #60a5fa; font-style: italic; }
        .sl-left-sub { font-size: 15px; color: #64748b; line-height: 1.7; margin-bottom: 40px; }
        .sl-features { display: flex; flex-direction: column; gap: 14px; }
        .sl-feature { display: flex; align-items: center; gap: 14px; animation: sl-fadeIn .5s ease both; }
        .sl-feature:nth-child(1){animation-delay:.1s}.sl-feature:nth-child(2){animation-delay:.2s}.sl-feature:nth-child(3){animation-delay:.3s}.sl-feature:nth-child(4){animation-delay:.4s}.sl-feature:nth-child(5){animation-delay:.5s}
        .sl-feature-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(37,99,235,.15); border: 1px solid rgba(37,99,235,.25); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #60a5fa; }
        .sl-feature-text { font-size: 13.5px; color: #94a3b8; font-weight: 500; }
        .sl-left-footer { position: relative; z-index: 1; font-size: 12px; color: #334155; }
        .sl-right { background: #fafafa; display: flex; align-items: center; justify-content: center; padding: 56px 52px; }
        .sl-form-wrap { width: 100%; max-width: 380px; }
        .sl-form-header { margin-bottom: 36px; }
        .sl-form-icon { width: 52px; height: 52px; border-radius: 14px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #2563eb; margin-bottom: 20px; border: 1px solid #dbeafe; }
        .sl-form-title { font-family: 'Instrument Serif', serif; font-size: 28px; color: #0f172a; margin-bottom: 6px; }
        .sl-form-sub { font-size: 14px; color: #64748b; }
        .sl-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 11px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 22px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
        .sl-error i { flex-shrink: 0; margin-top: 2px; }
        .sl-field { margin-bottom: 18px; }
        .sl-label { display: block; font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
        .sl-input { width: 100%; padding: 13px 16px; border: 1.5px solid #e5e7eb; border-radius: 11px; font-size: 14px; font-weight: 500; color: #111827; background: #fff; outline: none; transition: border-color .18s, box-shadow .18s; font-family: 'DM Sans', sans-serif; }
        .sl-input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,.08); }
        .sl-input::placeholder { color: #9ca3af; font-weight: 400; }
        .sl-btn { width: 100%; padding: 14px; border-radius: 11px; border: none; cursor: pointer; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 9px; transition: all .18s; }
        .sl-btn-primary { background: #2563eb; color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,.35); }
        .sl-btn-primary:hover:not(:disabled) { background: #1d4ed8; box-shadow: 0 6px 20px rgba(37,99,235,.45); transform: translateY(-1px); }
        .sl-btn-primary:disabled { background: #93c5fd; cursor: not-allowed; box-shadow: none; }
        .sl-note { margin-top: 28px; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 12.5px; color: #94a3b8; line-height: 1.6; text-align: center; }
        .sl-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: sl-spin .7s linear infinite; flex-shrink: 0; }
        @keyframes sl-spin    { to { transform: rotate(360deg); } }
        @keyframes sl-pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes sl-fadeIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @media(max-width: 800px) { .sl-root { grid-template-columns: 1fr; } .sl-left { display: none; } .sl-right { padding: 40px 24px; } }
      `}</style>

      <div className="sl-root">
        <div className="sl-left">
          <div className="sl-left-grid" />
          <div className="sl-logo">
            <div className="sl-logo-icon"><i className="fa-solid fa-graduation-cap" /></div>
            MMMP
          </div>
          <div className="sl-left-body">
            <div className="sl-portal-badge"><span className="sl-portal-badge-dot" /> Student Portal</div>
            <h1 className="sl-left-h1">Your academic<br />journey,{' '}<em>organised</em></h1>
            <p className="sl-left-sub">One place for sessions, reviews, resources,<br />and everything your mentor shares with you.</p>
            <div className="sl-features">
              {FEATURES.map((f, i) => (
                <div className="sl-feature" key={i}>
                  <div className="sl-feature-icon"><i className={`fa-solid ${f.icon}`} /></div>
                  <span className="sl-feature-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sl-left-footer">© 2026 MMMP · Mentor Mentee Monitoring Portal</div>
        </div>

        <div className="sl-right">
          <div className="sl-form-wrap">
            <div className="sl-form-header">
              <div className="sl-form-icon"><i className="fa-solid fa-user-graduate" /></div>
              <h2 className="sl-form-title">Welcome back</h2>
              <p className="sl-form-sub">Sign in with your roll number and mobile.</p>
            </div>

            {error && (
              <div className="sl-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="sl-field">
                <label className="sl-label">Roll Number</label>
                <input className="sl-input" type="text" placeholder="e.g. 202303070"
                  value={credentials.rollNo}
                  onChange={e => setCredentials({ ...credentials, rollNo: e.target.value })}
                  required />
              </div>
              <div className="sl-field">
                <label className="sl-label">Mobile Number</label>
                <input className="sl-input" type="tel" placeholder="Registered mobile"
                  value={credentials.mobile}
                  onChange={e => setCredentials({ ...credentials, mobile: e.target.value })}
                  required />
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="submit" className="sl-btn sl-btn-primary" disabled={loading}>
                  {loading
                    ? <><div className="sl-spinner" /> Verifying…</>
                    : <><i className="fa-solid fa-arrow-right-to-bracket" /> Sign In with Google</>
                  }
                </button>
              </div>
            </form>

            <div className="sl-note">
              <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: '#93c5fd' }} />
              You must sign in with the exact Google account your faculty registered for you.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentLogin;
