import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";
import API_URL from "../../config";

// ============================================================
// FacultyLogin.jsx — Fixed Google login
// Fix: upsert by email (not uid) so pre-assigned faculty can login
// ============================================================

const FacultyLogin = () => {
  const [isManualLogin, setIsManualLogin] = useState(false);
  const [formData, setFormData] = useState({ collegeName: "", facultyName: "", instituteCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    signOut(auth);
    localStorage.removeItem("facultyAuth");
    localStorage.removeItem("collegeName");
  }, []);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if this email exists in users collection
      let checkRes;
      try {
        checkRes = await axios.get(
          `${API_URL}/api/users/check-email/${user.email}`
        );
      } catch (err) {
        if (err.response?.status === 404) {
          // Email not in users at all — not assigned
          await signOut(auth);
          setError("Account not found. Please enter your Institute Details below to join.");
          setIsManualLogin(true);
          setLoading(false);
          return;
        }
        throw err;
      }

      const existingRole = checkRes.data.role;

      // Must be faculty (or pre-assigned with fake uid by admin)
      if (existingRole !== "faculty") {
        await signOut(auth);
        setError("This email is registered as a student, not faculty.");
        setLoading(false);
        return;
      }

      // Upsert with real Firebase uid — this fixes the pre-assigned faculty case
      // where admin used uid:"generated_..." via assign-mentor
      await axios.post("${API_URL}/api/users", {
        uid: user.uid,
        email: user.email,
        name: user.displayName || checkRes.data.name,
        role: "faculty",
        collegeName: checkRes.data.collegeName,
      });

      localStorage.setItem("facultyAuth", "true");
      localStorage.setItem("collegeName", checkRes.data.collegeName);
      navigate("/faculty-dashboard");

    } catch (err) {
      console.error("Faculty login error:", err);
      try { await signOut(auth); } catch {}
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleManualVerification = async () => {
    setError("");
    setLoading(true);
    try {
      const verifyRes = await axios.post("${API_URL}/api/faculty/verify-inst", {
        collegeName: formData.collegeName.trim(),
        instituteCode: formData.instituteCode.trim(),
      });
      if (!verifyRes.data.valid) throw new Error(verifyRes.data.message);

      const result = await signInWithPopup(auth, googleProvider);
      await axios.post("${API_URL}/api/users", {
        uid: result.user.uid,
        name: formData.facultyName || result.user.displayName,
        email: result.user.email,
        role: "faculty",
        collegeName: verifyRes.data.collegeName,
        approvalStatus: "pending",
      });
      localStorage.setItem("trackUid", result.user.uid);
      localStorage.setItem("trackCollege", verifyRes.data.collegeName);
      navigate("/faculty-track");
    } catch (err) {
      console.error("Manual verify error:", err);
      try { await signOut(auth); } catch {}
      setError(err.message || "Verification failed.");
    }
    setLoading(false);
  };

  const FEATURES = [
    { icon: "fa-users",          text: "Manage batches & student rosters"     },
    { icon: "fa-bell",           text: "Schedule & send session notifications" },
    { icon: "fa-bullhorn",       text: "Broadcast messages to your batches"    },
    { icon: "fa-chart-bar",      text: "Track attendance & academic progress"  },
    { icon: "fa-graduation-cap", text: "Promote students across academic years"},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .fl-root { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: 'DM Sans', sans-serif; }
        .fl-left { background: #052e16; padding: 56px 52px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .fl-left::before { content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(22,163,74,.2) 0%, transparent 70%); top: -150px; right: -150px; pointer-events: none; }
        .fl-left::after { content: ''; position: absolute; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(22,163,74,.12) 0%, transparent 70%); bottom: -80px; left: -60px; pointer-events: none; }
        .fl-left-grid { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px); background-size: 28px 28px; }
        .fl-logo { display: flex; align-items: center; gap: 10px; font-family: 'Instrument Serif', serif; font-size: 22px; color: #fff; text-decoration: none; position: relative; z-index: 1; }
        .fl-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: #16a34a; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
        .fl-left-body { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 1; padding: 40px 0; }
        .fl-badge { display: inline-flex; align-items: center; gap: 7px; padding: 5px 13px; border-radius: 100px; background: rgba(22,163,74,.18); border: 1px solid rgba(22,163,74,.35); font-size: 11px; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 24px; width: fit-content; }
        .fl-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: fl-pulse 2s infinite; }
        .fl-h1 { font-family: 'Instrument Serif', serif; font-size: clamp(32px, 3vw, 44px); color: #fff; line-height: 1.15; margin-bottom: 16px; font-weight: 400; }
        .fl-h1 em { color: #4ade80; font-style: italic; }
        .fl-sub { font-size: 15px; color: #4b7a5c; line-height: 1.7; margin-bottom: 40px; }
        .fl-features { display: flex; flex-direction: column; gap: 14px; }
        .fl-feat { display: flex; align-items: center; gap: 14px; animation: fl-fadeIn .5s ease both; }
        .fl-feat:nth-child(1){animation-delay:.1s}.fl-feat:nth-child(2){animation-delay:.2s}.fl-feat:nth-child(3){animation-delay:.3s}.fl-feat:nth-child(4){animation-delay:.4s}.fl-feat:nth-child(5){animation-delay:.5s}
        .fl-feat-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(22,163,74,.15); border: 1px solid rgba(22,163,74,.25); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #4ade80; }
        .fl-feat-text { font-size: 13.5px; color: #4b7a5c; font-weight: 500; }
        .fl-left-footer { position: relative; z-index: 1; font-size: 12px; color: #1a3a25; }
        .fl-right { background: #fafafa; display: flex; align-items: center; justify-content: center; padding: 56px 52px; }
        .fl-form-wrap { width: 100%; max-width: 380px; }
        .fl-form-icon { width: 52px; height: 52px; border-radius: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #16a34a; margin-bottom: 20px; }
        .fl-form-title { font-family: 'Instrument Serif', serif; font-size: 28px; color: #0f172a; margin-bottom: 6px; }
        .fl-form-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }
        .fl-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 11px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 22px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
        .fl-error i { flex-shrink: 0; margin-top: 2px; }
        .fl-field { margin-bottom: 18px; }
        .fl-label { display: block; font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
        .fl-input { width: 100%; padding: 13px 16px; border: 1.5px solid #e5e7eb; border-radius: 11px; font-size: 14px; font-weight: 500; color: #111827; background: #fff; outline: none; transition: border-color .18s, box-shadow .18s; font-family: 'DM Sans', sans-serif; }
        .fl-input:focus { border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,.08); }
        .fl-input::placeholder { color: #9ca3af; font-weight: 400; }
        .fl-btn { width: 100%; padding: 14px; border-radius: 11px; border: none; cursor: pointer; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 9px; transition: all .18s; }
        .fl-btn-green { background: #16a34a; color: #fff; box-shadow: 0 4px 14px rgba(22,163,74,.3); }
        .fl-btn-green:hover:not(:disabled) { background: #15803d; box-shadow: 0 6px 20px rgba(22,163,74,.4); transform: translateY(-1px); }
        .fl-btn-green:disabled { background: #86efac; cursor: not-allowed; box-shadow: none; }
        .fl-google-btn { width: 100%; padding: 13px 16px; border: 1.5px solid #e5e7eb; border-radius: 11px; background: #fff; color: #111827; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all .18s; }
        .fl-google-btn:hover:not(:disabled) { border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,.07); }
        .fl-google-btn:disabled { opacity: .6; cursor: not-allowed; }
        .fl-back { background: none; border: none; color: #64748b; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 14px; display: flex; align-items: center; gap: 6px; }
        .fl-back:hover { color: #16a34a; }
        .fl-join-link { display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 22px; font-size: 13px; color: #94a3b8; }
        .fl-join-link button { background: none; border: none; color: #16a34a; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .fl-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: fl-spin .7s linear infinite; flex-shrink: 0; }
        .fl-spinner-dark { border-color: rgba(0,0,0,.15); border-top-color: #374151; }
        @keyframes fl-spin   { to { transform: rotate(360deg); } }
        @keyframes fl-pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fl-fadeIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
        @media(max-width:800px) { .fl-root { grid-template-columns: 1fr; } .fl-left { display: none; } .fl-right { padding: 40px 24px; } }
      `}</style>

      <div className="fl-root">
        <div className="fl-left">
          <div className="fl-left-grid" />
          <div className="fl-logo">
            <div className="fl-logo-icon"><i className="fa-solid fa-graduation-cap" /></div>
            MMMP
          </div>
          <div className="fl-left-body">
            <div className="fl-badge"><span className="fl-badge-dot" /> Faculty Portal</div>
            <h1 className="fl-h1">Teach smarter,<br />track <em>deeper</em></h1>
            <p className="fl-sub">Everything you need to manage your students,<br />sessions, and academic progress — in one place.</p>
            <div className="fl-features">
              {FEATURES.map((f, i) => (
                <div className="fl-feat" key={i}>
                  <div className="fl-feat-icon"><i className={`fa-solid ${f.icon}`} /></div>
                  <span className="fl-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="fl-left-footer">© 2026 MMMP · Mentor Mentee Monitoring Portal</div>
        </div>

        <div className="fl-right">
          <div className="fl-form-wrap">
            <div className="fl-form-icon"><i className="fa-solid fa-chalkboard-user" /></div>
            <h2 className="fl-form-title">
              {isManualLogin ? "Join via Institute Code" : "Faculty Sign In"}
            </h2>
            <p className="fl-form-sub">
              {isManualLogin
                ? "Verify your college and join the portal."
                : "Sign in with the Google account assigned by your admin."}
            </p>

            {error && (
              <div className="fl-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            {!isManualLogin && (
              <>
                <button className="fl-google-btn" onClick={handleGoogleLogin} disabled={loading}>
                  {loading
                    ? <><div className="fl-spinner fl-spinner-dark" /> Connecting…</>
                    : <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="18" /> Continue with Google</>
                  }
                </button>
                <div className="fl-join-link">
                  Not assigned yet?
                  <button onClick={() => { setIsManualLogin(true); setError(""); }}>
                    Join via Institute Code
                  </button>
                </div>
              </>
            )}

            {isManualLogin && (
              <>
                <div className="fl-field">
                  <label className="fl-label">College Name</label>
                  <input className="fl-input" type="text" placeholder="e.g. Thakur College"
                    value={formData.collegeName}
                    onChange={e => setFormData({ ...formData, collegeName: e.target.value })} />
                </div>
                <div className="fl-field">
                  <label className="fl-label">Your Name</label>
                  <input className="fl-input" type="text" placeholder="e.g. Sahil More"
                    value={formData.facultyName}
                    onChange={e => setFormData({ ...formData, facultyName: e.target.value })} />
                </div>
                <div className="fl-field">
                  <label className="fl-label">Institute Code</label>
                  <input className="fl-input" type="password" placeholder="Enter institute code"
                    value={formData.instituteCode}
                    onChange={e => setFormData({ ...formData, instituteCode: e.target.value })} />
                </div>
                <button className="fl-btn fl-btn-green" onClick={handleManualVerification} disabled={loading}>
                  {loading
                    ? <><div className="fl-spinner" /> Verifying…</>
                    : <><i className="fa-solid fa-circle-check" /> Verify & Join</>
                  }
                </button>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button className="fl-back" onClick={() => { setIsManualLogin(false); setError(""); }}>
                    <i className="fa-solid fa-arrow-left" /> Back to Google Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultyLogin;

