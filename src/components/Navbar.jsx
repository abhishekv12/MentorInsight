import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import API_URL from "../../config";

const Navbar = () => {
  const [user, setUser]           = useState(null);
  const [userRole, setUserRole]   = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location    = useLocation();
  const dropdownRef = useRef(null);

  /* ── Auth listener ─────────────────────── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (cur) => {
      if (cur) {
        setUser(cur);

        // ── FIX: check localStorage FIRST (instant, no flash) ──
        if (localStorage.getItem("adminAuth") === "true") {
          setUserRole("admin"); return;
        }
        if (localStorage.getItem("facultyAuth") === "true") {
          setUserRole("faculty"); return;
        }

        // ── Then try the API for students ──
        try {
          const res = await axios.get(`${API_URL}/api/users/${cur.uid}`);
          if (res.data?.role) { setUserRole(res.data.role); return; }
        } catch {}

        // ── Final fallback: check by email in case uid mismatched ──
        try {
          const res = await axios.get(`${API_URL}/api/users/check-email/${cur.email}`);
          if (res.data?.role) setUserRole(res.data.role);
        } catch {}

      } else {
        setUser(null);
        setUserRole(null);
      }
    });
    return () => unsub();
  }, []);

  /* ── Scroll ────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close dropdown on outside click ──── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setLoginOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Close mobile on route change ─────── */
  useEffect(() => { setMobileOpen(false); setLoginOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("facultyAuth");
    localStorage.removeItem("collegeName");
    localStorage.removeItem("trackUid");
    localStorage.removeItem("trackCollege");
    window.location.href = "/";
  };

  const getDashboardLink = () => {
    if (userRole === "admin")   return "/admin-dashboard";
    if (userRole === "faculty") return "/faculty-dashboard";
    if (userRole === "student") return "/student-dashboard";
    return "/";
  };

  const getDashboardLabel = () => {
    if (userRole === "admin")   return "Admin Dashboard";
    if (userRole === "faculty") return "Faculty Dashboard";
    if (userRole === "student") return "Student Dashboard";
    return "Dashboard";
  };

  const getDashboardIcon = () => {
    if (userRole === "admin")   return "fa-user-shield";
    if (userRole === "faculty") return "fa-chalkboard-user";
    if (userRole === "student") return "fa-user-graduate";
    return "fa-gauge";
  };

  const getRoleBadgeColor = () => {
    if (userRole === "admin")   return "#dc2626";
    if (userRole === "faculty") return "#16a34a";
    if (userRole === "student") return "#2563eb";
    return "#4a4af4";
  };

  const NAV_LINKS = [
    { to: "/",         label: "Home"     },
    { to: "/features", label: "Features" },
    { to: "/about",    label: "About"    },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Manrope:wght@500;600;700&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --ink:        #0a0a0b;
          --ink-2:      #1a1a1e;
          --ink-3:      #2c2c32;
          --muted:      #4a4a52;
          --muted-2:    #6b6b75;
          --rule:       rgba(245,240,235,0.08);
          --cream:      #f5f0eb;
          --cream-2:    #e8e2da;
          --accent:     #4a4af4;
          --accent-dim: rgba(74,74,244,0.12);
        }

        .mmmp-nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000; height: 62px;
          display: flex; align-items: center; padding: 0 7vw;
          transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
          background: transparent; border-bottom: 1px solid transparent;
        }
        .mmmp-nav.scrolled {
          background: rgba(10,10,11,0.88);
          border-bottom-color: var(--rule);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .mmmp-nav-inner {
          max-width: 1280px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 0;
        }

        .mmmp-logo { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
        .mmmp-logo-mark {
          width:30px; height:30px; border-radius:7px; background:var(--accent);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; color:#fff; flex-shrink:0;
        }
        .mmmp-logo-name {
          font-family:'Cormorant Garamond',serif; font-size:20px;
          font-weight:600; color:var(--cream); letter-spacing:-0.01em; line-height:1;
        }
        .mmmp-logo-name span {
          color:var(--muted-2); font-size:11px; font-family:'DM Mono',monospace;
          letter-spacing:0.06em; margin-left:6px; font-weight:400; vertical-align:middle;
        }

        .mmmp-links {
          display:flex; align-items:center; gap:0; margin:0 auto;
          list-style:none; padding:0;
        }
        .mmmp-link {
          font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:600;
          letter-spacing:0.04em; text-transform:uppercase; color:var(--muted);
          text-decoration:none; padding:8px 18px; border-radius:5px;
          transition:color 0.18s; position:relative;
        }
        .mmmp-link:hover { color:var(--cream-2); }
        .mmmp-link.active { color:var(--cream); }
        .mmmp-link.active::after {
          content:''; position:absolute; bottom:2px; left:50%;
          transform:translateX(-50%); width:16px; height:1.5px;
          background:var(--accent); border-radius:2px;
        }

        /* Dashboard pill — colored by role */
        .mmmp-dash-link {
          font-family:'Manrope',sans-serif; font-size:11.5px; font-weight:700;
          letter-spacing:0.05em; text-transform:uppercase; text-decoration:none;
          padding:6px 14px; border-radius:6px; margin-left:8px;
          display:flex; align-items:center; gap:7px;
          transition:all 0.18s;
        }

        .mmmp-actions { display:flex; align-items:center; gap:10px; flex-shrink:0; }

        .mmmp-user-row { display:flex; align-items:center; gap:10px; }

        /* Role badge chip */
        .mmmp-role-badge {
          padding:3px 9px; border-radius:100px;
          font-family:'DM Mono',monospace; font-size:9px;
          font-weight:500; letter-spacing:0.08em; text-transform:uppercase;
        }

        .mmmp-user-name {
          font-family:'DM Mono',monospace; font-size:10.5px;
          color:var(--muted); letter-spacing:0.06em;
        }
        .mmmp-user-dot {
          width:6px; height:6px; border-radius:50%; background:#10b981;
          animation:nav-pulse 3s ease-in-out infinite;
        }
        @keyframes nav-pulse {
          0%,100% { box-shadow:0 0 0 2px rgba(16,185,129,.2); }
          50%      { box-shadow:0 0 0 5px rgba(16,185,129,.06); }
        }

        .mmmp-btn-logout {
          font-family:'Manrope',sans-serif; font-size:11.5px; font-weight:600;
          letter-spacing:0.04em; text-transform:uppercase; color:var(--muted);
          background:none; border:1px solid var(--rule); border-radius:5px;
          padding:7px 16px; cursor:pointer; transition:all 0.18s;
        }
        .mmmp-btn-logout:hover { color:var(--cream-2); border-color:rgba(245,240,235,.2); }

        .mmmp-login-wrap { position:relative; }
        .mmmp-btn-login {
          font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700;
          letter-spacing:0.04em; text-transform:uppercase; color:var(--cream);
          background:var(--accent); border:none; border-radius:5px;
          padding:8px 20px; cursor:pointer;
          display:flex; align-items:center; gap:8px; transition:all 0.2s;
        }
        .mmmp-btn-login:hover { background:#3b3bdc; transform:translateY(-1px); box-shadow:0 6px 20px rgba(74,74,244,.35); }
        .mmmp-btn-login i { font-size:10px; transition:transform 0.2s; }
        .mmmp-btn-login.open i { transform:rotate(180deg); }

        .mmmp-dropdown {
          position:absolute; top:calc(100% + 10px); right:0; min-width:220px;
          background:var(--ink-2); border:1px solid var(--rule); border-radius:8px;
          overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.03);
          animation:nav-drop 0.18s ease;
        }
        @keyframes nav-drop {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .mmmp-dropdown-label {
          font-family:'DM Mono',monospace; font-size:9px; color:var(--muted);
          letter-spacing:0.14em; text-transform:uppercase; padding:14px 16px 8px; display:block;
        }
        .mmmp-dropdown-item {
          display:flex; align-items:center; gap:12px; padding:12px 16px;
          text-decoration:none; color:var(--muted-2);
          font-family:'Manrope',sans-serif; font-size:13px; font-weight:600;
          border-top:1px solid var(--rule); transition:all 0.15s;
        }
        .mmmp-dropdown-item:hover { background:rgba(255,255,255,.03); color:var(--cream); }
        .mmmp-dropdown-icon {
          width:30px; height:30px; border-radius:6px;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; background:var(--accent-dim); color:var(--accent); flex-shrink:0;
        }
        .mmmp-dropdown-sub {
          font-family:'DM Mono',monospace; font-size:9px; color:var(--muted);
          display:block; margin-top:2px; letter-spacing:0.04em;
        }
        .mmmp-dropdown-arrow { margin-left:auto; font-size:9px; color:var(--ink-3); }

        .mmmp-hamburger {
          display:none; flex-direction:column; gap:4.5px;
          background:none; border:none; cursor:pointer; padding:6px; margin-left:12px;
        }
        .mmmp-hamburger span {
          display:block; width:22px; height:1.5px;
          background:var(--muted); border-radius:2px; transition:all 0.22s;
        }
        .mmmp-hamburger.open span:nth-child(1) { transform:translateY(6px) rotate(45deg); }
        .mmmp-hamburger.open span:nth-child(2) { opacity:0; }
        .mmmp-hamburger.open span:nth-child(3) { transform:translateY(-6px) rotate(-45deg); }

        .mmmp-mobile-drawer {
          position:fixed; inset:62px 0 0 0;
          background:rgba(10,10,11,.96); backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px); border-top:1px solid var(--rule);
          z-index:999; display:flex; flex-direction:column;
          padding:28px 7vw 40px; gap:4px; animation:nav-drop 0.2s ease;
        }
        .mmmp-mobile-link {
          font-family:'Manrope',sans-serif; font-size:18px; font-weight:600;
          color:var(--muted); text-decoration:none; padding:14px 0;
          border-bottom:1px solid var(--rule); transition:color 0.15s;
          display:flex; align-items:center; justify-content:space-between;
        }
        .mmmp-mobile-link:hover, .mmmp-mobile-link.active { color:var(--cream); }
        .mmmp-mobile-actions { margin-top:24px; display:flex; flex-direction:column; gap:10px; }
        .mmmp-mobile-btn-primary {
          display:flex; align-items:center; justify-content:center; gap:9px;
          padding:14px; background:var(--accent); color:#fff; border:none; border-radius:6px;
          font-family:'Manrope',sans-serif; font-size:13px; font-weight:700;
          letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; text-decoration:none;
          transition:background 0.18s;
        }
        .mmmp-mobile-btn-primary:hover { background:#3b3bdc; }
        .mmmp-mobile-btn-ghost {
          display:flex; align-items:center; justify-content:center; gap:9px;
          padding:14px; background:transparent; color:var(--muted);
          border:1px solid var(--rule); border-radius:6px;
          font-family:'Manrope',sans-serif; font-size:13px; font-weight:600;
          letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; text-decoration:none;
          transition:all 0.18s;
        }
        .mmmp-mobile-btn-ghost:hover { color:var(--cream-2); border-color:rgba(245,240,235,.2); }

        @media(max-width:768px) {
          .mmmp-links   { display:none; }
          .mmmp-actions { display:none; }
          .mmmp-hamburger { display:flex; }
          .mmmp-nav { padding:0 5vw; }
        }
      `}</style>

      <nav className={`mmmp-nav${scrolled ? " scrolled" : ""}`}>
        <div className="mmmp-nav-inner">

          {/* Logo */}
          <Link to="/" className="mmmp-logo">
            <div className="mmmp-logo-mark">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <div className="mmmp-logo-name">
              MentorInsight<span>Portal</span>
            </div>
          </Link>

          {/* Center links */}
          <ul className="mmmp-links">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={`mmmp-link${isActive(l.to) ? " active" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}

            {/* Dashboard pill — only when logged in */}
            {user && userRole && (
              <li>
                <Link
                  to={getDashboardLink()}
                  className="mmmp-dash-link"
                  style={{
                    color: getRoleBadgeColor(),
                    border: `1px solid ${getRoleBadgeColor()}44`,
                    background: `${getRoleBadgeColor()}14`,
                  }}
                >
                  <i className={`fa-solid ${getDashboardIcon()}`} style={{ fontSize: 10 }} />
                  {getDashboardLabel()}
                </Link>
              </li>
            )}
          </ul>

          {/* Right actions */}
          <div className="mmmp-actions">
            {user ? (
              <div className="mmmp-user-row">
                <span className="mmmp-user-dot" />
                {/* Role badge */}
                {userRole && (
                  <span
                    className="mmmp-role-badge"
                    style={{
                      background: `${getRoleBadgeColor()}18`,
                      color: getRoleBadgeColor(),
                      border: `1px solid ${getRoleBadgeColor()}33`,
                    }}
                  >
                    {userRole}
                  </span>
                )}
                <span className="mmmp-user-name">
                  {user.displayName ? user.displayName.split(" ")[0].toUpperCase() : "USER"}
                </span>
                <button className="mmmp-btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="mmmp-login-wrap" ref={dropdownRef}>
                <button
                  className={`mmmp-btn-login${loginOpen ? " open" : ""}`}
                  onClick={() => setLoginOpen((o) => !o)}
                >
                  Login
                  <i className="fa-solid fa-chevron-down" />
                </button>

                {loginOpen && (
                  <div className="mmmp-dropdown">
                    <span className="mmmp-dropdown-label">Sign in as</span>
                    <Link to="/login-selection" className="mmmp-dropdown-item">
                      <div className="mmmp-dropdown-icon" style={{ background:"rgba(37,99,235,.12)", color:"#3b82f6" }}>
                        <i className="fa-solid fa-user-graduate" />
                      </div>
                      <div>
                        Student / Parent
                        <span className="mmmp-dropdown-sub">Student portal access</span>
                      </div>
                      <i className="fa-solid fa-arrow-right mmmp-dropdown-arrow" />
                    </Link>
                    <Link to="/faculty-selection" className="mmmp-dropdown-item">
                      <div className="mmmp-dropdown-icon" style={{ background:"rgba(220,38,38,.12)", color:"#f87171" }}>
                        <i className="fa-solid fa-chalkboard-user" />
                      </div>
                      <div>
                        Faculty / Admin
                        <span className="mmmp-dropdown-sub">Staff portal access</span>
                      </div>
                      <i className="fa-solid fa-arrow-right mmmp-dropdown-arrow" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`mmmp-hamburger${mobileOpen ? " open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mmmp-mobile-drawer">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}
              className={`mmmp-mobile-link${isActive(l.to) ? " active" : ""}`}>
              {l.label}
              <i className="fa-solid fa-arrow-right" style={{ fontSize:11, opacity:.3 }} />
            </Link>
          ))}
          {user && userRole && (
            <Link to={getDashboardLink()} className="mmmp-mobile-link"
              style={{ color: getRoleBadgeColor() }}>
              {getDashboardLabel()}
              <i className="fa-solid fa-arrow-right" style={{ fontSize:11, opacity:.3 }} />
            </Link>
          )}
          <div className="mmmp-mobile-actions">
            {user ? (
              <button className="mmmp-mobile-btn-ghost" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" style={{ fontSize:12 }} />
                Logout
              </button>
            ) : (
              <>
                <Link to="/login-selection" className="mmmp-mobile-btn-primary">
                  <i className="fa-solid fa-user-graduate" style={{ fontSize:12 }} />
                  Student Login
                </Link>
                <Link to="/faculty-selection" className="mmmp-mobile-btn-ghost">
                  <i className="fa-solid fa-chalkboard-user" style={{ fontSize:12 }} />
                  Faculty / Admin
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
