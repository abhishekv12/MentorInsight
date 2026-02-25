import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";
import API_URL from "../config";

const AdminLogin = () => {
  const [mode, setMode] = useState("login");
  const [credentials, setCredentials] = useState({ collegeName: "", email: "", secretCode: "", instituteCode: "", collegeType: "" });
  const [forgotStep, setForgotStep] = useState("verify");
  const [forgotData, setForgotData] = useState({ collegeName: "", email: "", instituteCode: "", newCode: "", confirmCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clear = async () => { await signOut(auth); localStorage.removeItem("adminAuth"); };
    clear();
  }, []);

  const handleAuth = async () => {
    setError("");
    if (!credentials.email || !credentials.collegeName || !credentials.secretCode || !credentials.instituteCode) {
      setError("Please fill in all fields."); return;
    }
    if (mode === "register" && !credentials.collegeType) {
      setError("Please select a College Type."); return;
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email.toLowerCase() !== credentials.email.toLowerCase())
        throw new Error(`Please sign in with ${credentials.email}. You used ${user.email}.`);
      if (mode === "register") {
        await axios.post("${API_URL}/api/admin/register", {
          collegeName: credentials.collegeName, secretCode: credentials.secretCode,
          instituteCode: credentials.instituteCode, collegeType: credentials.collegeType, adminEmail: user.email,
        });
      } else {
        const response = await axios.post("${API_URL}/api/admin/verify", {
          collegeName: credentials.collegeName, secretCode: credentials.secretCode,
          instituteCode: credentials.instituteCode, email: user.email,
        });
        if (!response.data.valid) throw new Error("Verification failed.");
      }
      localStorage.setItem("collegeName", credentials.collegeName);
      localStorage.setItem("adminAuth", "true");
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed.");
    }
    setLoading(false);
  };

  const handleForgotVerify = async () => {
    setError("");
    if (!forgotData.collegeName || !forgotData.email || !forgotData.instituteCode) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email.toLowerCase() !== forgotData.email.toLowerCase())
        throw new Error(`Please sign in with ${forgotData.email}.`);
      const res = await axios.post("${API_URL}/api/admin/forgot-verify", {
        collegeName: forgotData.collegeName, email: user.email, instituteCode: forgotData.instituteCode,
      });
      if (res.data.verified) { setForgotStep("reset"); setError(""); }
      else throw new Error("Could not verify your identity.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Verification failed.");
    }
    setLoading(false);
  };

  const handleForgotReset = async () => {
    setError("");
    if (!forgotData.newCode || forgotData.newCode.length < 4) { setError("Code must be at least 4 characters."); return; }
    if (forgotData.newCode !== forgotData.confirmCode) { setError("Codes do not match."); return; }
    setLoading(true);
    try {
      await axios.post("${API_URL}/api/admin/reset-code", {
        collegeName: forgotData.collegeName, email: forgotData.email,
        instituteCode: forgotData.instituteCode, newSecretCode: forgotData.newCode,
      });
      setForgotStep("done");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to reset code.");
    }
    setLoading(false);
  };

  const FEATURES = [
    { icon: "fa-layer-group",     text: "Manage departments, batches & faculty"    },
    { icon: "fa-star-half-stroke",text: "Run anonymous faculty review campaigns"   },
    { icon: "fa-chart-pie",       text: "Live analytics & institution dashboard"   },
    { icon: "fa-bullhorn",        text: "Broadcast institution-wide announcements" },
    { icon: "fa-shield-halved",   text: "Secure admin panel with access codes"     },
  ];

  const STEPS = ["Verify Identity", "Set New Code", "Done"];
  const stepIdx = forgotStep === "verify" ? 0 : forgotStep === "reset" ? 1 : 2;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .al-root { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: 'DM Sans', sans-serif; }

        .al-left { background: #1a0505; padding: 56px 52px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .al-left::before { content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(220,38,38,.18) 0%, transparent 70%); top: -150px; right: -150px; pointer-events: none; }
        .al-left::after { content: ''; position: absolute; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(220,38,38,.1) 0%, transparent 70%); bottom: -80px; left: -60px; pointer-events: none; }
        .al-grid { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px); background-size: 28px 28px; }

        .al-logo { display: flex; align-items: center; gap: 10px; font-family: 'Instrument Serif', serif; font-size: 22px; color: #fff; position: relative; z-index: 1; }
        .al-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
        .al-left-body { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 1; padding: 40px 0; }
        .al-badge { display: inline-flex; align-items: center; gap: 7px; padding: 5px 13px; border-radius: 100px; background: rgba(220,38,38,.18); border: 1px solid rgba(220,38,38,.35); font-size: 11px; font-weight: 700; color: #fca5a5; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 24px; width: fit-content; }
        .al-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #ef4444; animation: al-pulse 2s infinite; }
        .al-h1 { font-family: 'Instrument Serif', serif; font-size: clamp(32px,3vw,44px); color: #fff; line-height: 1.15; margin-bottom: 16px; font-weight: 400; }
        .al-h1 em { color: #f87171; font-style: italic; }
        .al-sub { font-size: 15px; color: #4a1a1a; line-height: 1.7; margin-bottom: 40px; }
        .al-feats { display: flex; flex-direction: column; gap: 14px; }
        .al-feat { display: flex; align-items: center; gap: 14px; animation: al-fadeIn .5s ease both; }
        .al-feat:nth-child(1){animation-delay:.1s}.al-feat:nth-child(2){animation-delay:.2s}.al-feat:nth-child(3){animation-delay:.3s}.al-feat:nth-child(4){animation-delay:.4s}.al-feat:nth-child(5){animation-delay:.5s}
        .al-feat-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(220,38,38,.15); border: 1px solid rgba(220,38,38,.25); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #f87171; }
        .al-feat-text { font-size: 13.5px; color: #4a1a1a; font-weight: 500; }
        .al-left-foot { position: relative; z-index: 1; font-size: 12px; color: #3b0e0e; }

        .al-right { background: #fafafa; display: flex; align-items: center; justify-content: center; padding: 56px 52px; overflow-y: auto; }
        .al-form { width: 100%; max-width: 400px; }
        .al-ficon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; border: 1px solid #fecaca; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #dc2626; margin-bottom: 20px; }
        .al-ftitle { font-family: 'Instrument Serif', serif; font-size: 28px; color: #0f172a; margin-bottom: 6px; }
        .al-fsub { font-size: 14px; color: #64748b; margin-bottom: 24px; }

        .al-tabs { display: flex; gap: 6px; margin-bottom: 22px; background: #f1f5f9; padding: 5px; border-radius: 12px; }
        .al-tab { flex: 1; padding: 9px; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .18s; background: transparent; color: #64748b; }
        .al-tab.active { background: #fff; color: #dc2626; box-shadow: 0 2px 8px rgba(0,0,0,.08); }

        .al-err { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 11px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
        .al-field { margin-bottom: 14px; }
        .al-lbl { display: block; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 7px; }
        .al-inp { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-weight: 500; color: #111827; background: #fff; outline: none; transition: border-color .18s, box-shadow .18s; font-family: 'DM Sans', sans-serif; }
        .al-inp:focus { border-color: #dc2626; box-shadow: 0 0 0 4px rgba(220,38,38,.07); }
        .al-inp::placeholder { color: #9ca3af; font-weight: 400; }
        .al-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .al-gbtn { width: 100%; padding: 13px 16px; border: 1.5px solid #e5e7eb; border-radius: 11px; background: #fff; color: #111827; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all .18s; margin-top: 6px; }
        .al-gbtn:hover:not(:disabled) { border-color: #dc2626; box-shadow: 0 0 0 4px rgba(220,38,38,.06); }
        .al-gbtn:disabled { opacity: .6; cursor: not-allowed; }

        .al-btn { width: 100%; padding: 13px; border-radius: 11px; border: none; cursor: pointer; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 9px; transition: all .18s; margin-top: 6px; }
        .al-btn-red { background: #dc2626; color: #fff; box-shadow: 0 4px 14px rgba(220,38,38,.3); }
        .al-btn-red:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
        .al-btn-red:disabled { background: #fca5a5; cursor: not-allowed; box-shadow: none; }
        .al-btn-green { background: #16a34a; color: #fff; box-shadow: 0 4px 14px rgba(22,163,74,.3); }
        .al-btn-green:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
        .al-btn-green:disabled { background: #86efac; cursor: not-allowed; box-shadow: none; }

        .al-forgot-lnk { background: none; border: none; color: #dc2626; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 5px; margin: 12px auto 0; }
        .al-bottom { text-align: center; margin-top: 16px; font-size: 13px; color: #94a3b8; }
        .al-bottom button { background: none; border: none; color: #dc2626; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; }

        .al-steps { display: flex; align-items: center; justify-content: center; margin-bottom: 22px; }
        .al-step { display: flex; align-items: center; gap: 6px; }
        .al-sdot { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .al-slbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
        .al-sline { width: 24px; height: 2px; border-radius: 2px; margin: 0 4px; }

        .al-info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #1e40af; line-height: 1.6; margin-bottom: 16px; }
        .al-verified { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #15803d; display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 16px; }
        .al-success { text-align: center; padding: 16px 0; }
        .al-success-icon { width: 72px; height: 72px; background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; color: #16a34a; }
        .al-back { background: none; border: none; color: #64748b; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px; margin: 14px auto 0; }
        .al-back:hover { color: #dc2626; }

        .al-spin { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: al-spin .7s linear infinite; flex-shrink: 0; }
        .al-spin-dk { border-color: rgba(0,0,0,.12); border-top-color: #374151; }

        @keyframes al-spin { to{transform:rotate(360deg)} }
        @keyframes al-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes al-fadeIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }

        @media(max-width:800px) { .al-root{grid-template-columns:1fr} .al-left{display:none} .al-right{padding:40px 24px} }
      `}</style>

      <div className="al-root">
        {/* LEFT */}
        <div className="al-left">
          <div className="al-grid" />
          <div className="al-logo">
            <div className="al-logo-icon"><i className="fa-solid fa-graduation-cap" /></div>
            MMMP
          </div>
          <div className="al-left-body">
            <div className="al-badge"><span className="al-badge-dot" /> Admin Portal</div>
            <h1 className="al-h1">Full institutional<br /><em>control</em></h1>
            <p className="al-sub">Oversee every department, batch, and faculty member. Your command centre for the entire college.</p>
            <div className="al-feats">
              {FEATURES.map((f, i) => (
                <div className="al-feat" key={i}>
                  <div className="al-feat-icon"><i className={`fa-solid ${f.icon}`} /></div>
                  <span className="al-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="al-left-foot">© 2026 MMMP · Mentor Mentee Monitoring Portal</div>
        </div>

        {/* RIGHT */}
        <div className="al-right">
          <div className="al-form">

            {/* LOGIN / REGISTER */}
            {mode !== "forgot" && (
              <>
                <div className="al-ficon">
                  <i className={`fa-solid ${mode === "register" ? "fa-pen-to-square" : "fa-user-shield"}`} />
                </div>
                <h2 className="al-ftitle">{mode === "register" ? "Register College" : "Admin Sign In"}</h2>
                <p className="al-fsub">{mode === "register" ? "Set up your institution on MMMP." : "Secure verification required."}</p>

                <div className="al-tabs">
                  {["login","register"].map(m => (
                    <button key={m} className={`al-tab ${mode===m?"active":""}`} onClick={() => { setMode(m); setError(""); }}>
                      {m === "login" ? "Sign In" : "Register"}
                    </button>
                  ))}
                </div>

                {error && <div className="al-err"><i className="fa-solid fa-circle-exclamation" style={{flexShrink:0,marginTop:1}} />{error}</div>}

                <div className="al-field">
                  <label className="al-lbl">College Name</label>
                  <input className="al-inp" type="text" placeholder="e.g. Thakur College" value={credentials.collegeName} onChange={e => setCredentials({...credentials, collegeName: e.target.value})} />
                </div>
                <div className="al-field">
                  <label className="al-lbl">Admin Email</label>
                  <input className="al-inp" type="email" placeholder="admin@college.edu" value={credentials.email} onChange={e => setCredentials({...credentials, email: e.target.value})} />
                </div>
                <div className="al-row2">
                  <div className="al-field">
                    <label className="al-lbl">Access Code</label>
                    <input className="al-inp" type="password" placeholder="Secret code" value={credentials.secretCode} onChange={e => setCredentials({...credentials, secretCode: e.target.value})} />
                  </div>
                  <div className="al-field">
                    <label className="al-lbl">Institute Code</label>
                    <input className="al-inp" placeholder="e.g. 1234" value={credentials.instituteCode} onChange={e => setCredentials({...credentials, instituteCode: e.target.value})} />
                  </div>
                </div>
                {mode === "register" && (
                  <div className="al-field">
                    <label className="al-lbl">College Type</label>
                    <select className="al-inp" value={credentials.collegeType} onChange={e => setCredentials({...credentials, collegeType: e.target.value})}>
                      <option value="">Select type…</option>
                      {["Engineering","Medical","Arts & Science","Management (MBA)","Polytechnic","Other"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                <button className="al-gbtn" onClick={handleAuth} disabled={loading}>
                  {loading
                    ? <><div className="al-spin al-spin-dk" /> Processing…</>
                    : <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="18" />{mode==="register" ? "Register with Google" : "Sign in with Google"}</>
                  }
                </button>

                {mode === "login" && (
                  <div style={{display:"flex",justifyContent:"center"}}>
                    <button className="al-forgot-lnk" onClick={() => { setMode("forgot"); setError(""); }}>
                      <i className="fa-solid fa-key" /> Forgot Access Code?
                    </button>
                  </div>
                )}

                <div className="al-bottom">
                  {mode === "register"
                    ? <>Already registered? <button onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
                    : <>New college? <button onClick={() => { setMode("register"); setError(""); }}>Register here</button></>
                  }
                </div>
              </>
            )}

            {/* FORGOT */}
            {mode === "forgot" && (
              <>
                <div className="al-ficon" style={{background:"#fefce8",borderColor:"#fde68a"}}>
                  <i className="fa-solid fa-key" style={{color:"#ca8a04"}} />
                </div>
                <h2 className="al-ftitle">Recover Access</h2>
                <p className="al-fsub">Reset your admin access code securely.</p>

                {error && <div className="al-err"><i className="fa-solid fa-circle-exclamation" style={{flexShrink:0}} />{error}</div>}

                <div className="al-steps">
                  {STEPS.map((label, i) => (
                    <div className="al-step" key={i}>
                      <div className="al-sdot" style={{background: i<=stepIdx?"#dc2626":"#e2e8f0", color: i<=stepIdx?"#fff":"#94a3b8"}}>
                        {i < stepIdx ? <i className="fa-solid fa-check" style={{fontSize:10}} /> : i+1}
                      </div>
                      <span className="al-slbl" style={{color: i<=stepIdx?"#dc2626":"#94a3b8"}}>{label}</span>
                      {i < 2 && <div className="al-sline" style={{background: i<stepIdx?"#dc2626":"#e2e8f0"}} />}
                    </div>
                  ))}
                </div>

                {forgotStep === "verify" && (
                  <>
                    <div className="al-info">
                      <i className="fa-solid fa-circle-info" style={{marginRight:7}} />
                      Verify with your College Name, Admin Email, and Institute Code — no access code needed.
                    </div>
                    <div className="al-field">
                      <label className="al-lbl">College Name</label>
                      <input className="al-inp" placeholder="e.g. Thakur College" value={forgotData.collegeName} onChange={e => setForgotData({...forgotData, collegeName: e.target.value})} />
                    </div>
                    <div className="al-field">
                      <label className="al-lbl">Admin Email</label>
                      <input className="al-inp" type="email" placeholder="admin@college.edu" value={forgotData.email} onChange={e => setForgotData({...forgotData, email: e.target.value})} />
                    </div>
                    <div className="al-field">
                      <label className="al-lbl">Institute Code</label>
                      <input className="al-inp" placeholder="e.g. 1234" value={forgotData.instituteCode} onChange={e => setForgotData({...forgotData, instituteCode: e.target.value})} />
                    </div>
                    <button className="al-gbtn" onClick={handleForgotVerify} disabled={loading}>
                      {loading
                        ? <><div className="al-spin al-spin-dk" /> Verifying…</>
                        : <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="18" /> Verify with Google</>
                      }
                    </button>
                  </>
                )}

                {forgotStep === "reset" && (
                  <>
                    <div className="al-verified">
                      <i className="fa-solid fa-circle-check" /> Identity verified for <strong style={{marginLeft:4}}>{forgotData.collegeName}</strong>
                    </div>
                    <div className="al-field">
                      <label className="al-lbl">New Access Code</label>
                      <input className="al-inp" type="password" placeholder="Min 4 characters" value={forgotData.newCode} onChange={e => setForgotData({...forgotData, newCode: e.target.value})} />
                    </div>
                    <div className="al-field">
                      <label className="al-lbl">Confirm New Code</label>
                      <input className="al-inp" type="password" placeholder="Re-enter code" value={forgotData.confirmCode} onChange={e => setForgotData({...forgotData, confirmCode: e.target.value})} />
                    </div>
                    <button className="al-btn al-btn-green" onClick={handleForgotReset} disabled={loading}>
                      {loading ? <><div className="al-spin" /> Saving…</> : <><i className="fa-solid fa-key" /> Set New Code</>}
                    </button>
                  </>
                )}

                {forgotStep === "done" && (
                  <div className="al-success">
                    <div className="al-success-icon"><i className="fa-solid fa-circle-check" /></div>
                    <h3 style={{color:"#15803d",fontWeight:800,marginBottom:8}}>Code Reset!</h3>
                    <p style={{color:"#64748b",fontSize:14,marginBottom:22}}>You can now log in with your new access code.</p>
                    <button className="al-btn al-btn-red" onClick={() => { setMode("login"); setForgotStep("verify"); setForgotData({collegeName:"",email:"",instituteCode:"",newCode:"",confirmCode:""}); setError(""); }}>
                      <i className="fa-solid fa-arrow-left" /> Back to Login
                    </button>
                  </div>
                )}

                {forgotStep !== "done" && (
                  <div style={{display:"flex",justifyContent:"center"}}>
                    <button className="al-back" onClick={() => { setMode("login"); setForgotStep("verify"); setError(""); }}>
                      <i className="fa-solid fa-arrow-left" /> Back to Login
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
