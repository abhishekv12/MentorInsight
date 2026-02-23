import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const AdminSidebar = ({ activeView, setActiveView, collegeName }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear every auth key used anywhere in the app
    [
      "adminAuth", "facultyAuth", "collegeName",
      "trackUid", "trackCollege",
    ].forEach(k => localStorage.removeItem(k));

    try { await signOut(auth); } catch {}

    // Hard redirect — clears all React state, no way to "go back" logged in
    window.location.href = "/";
  };

  const menuItems = [
    { type: "header", label: "MAIN MENU" },
    { id: "overview",    icon: "fa-solid fa-grid-2",            label: "Dashboard"   },
    { id: "departments", icon: "fa-solid fa-building-columns",  label: "University"  },
    { id: "batches",     icon: "fa-solid fa-layer-group",       label: "Departments" },
    { id: "reviews",     icon: "fa-solid fa-star-half-stroke",  label: "Reviews"     },
    { id: "faculty",     icon: "fa-solid fa-user-tie",          label: "Professors"  },
    { id: "students",    icon: "fa-solid fa-user-graduate",     label: "Students"    },
    { type: "header", label: "MANAGEMENT" },
    { id: "courses",     icon: "fa-solid fa-book-open",         label: "Courses"     },
    { id: "library",     icon: "fa-solid fa-book",              label: "Library"     },
    { id: "staff",       icon: "fa-solid fa-users-gear",        label: "Staff"       },
    { id: "analytics",   icon: "fa-solid fa-chart-pie",         label: "Analytics"   },
  ];

  const displayName = collegeName || "Institute Admin";
  const shortName = displayName.length > 18 ? displayName.substring(0, 18) + "…" : displayName;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .erp-sidebar {
          width: 252px; height: 100vh; background: #0a1628;
          position: fixed; top: 0; left: 0;
          display: flex; flex-direction: column;
          z-index: 1000; font-family: 'DM Sans', sans-serif;
          border-right: 1px solid rgba(255,255,255,.06);
        }

        .sb-brand {
          height: 72px; display: flex; align-items: center; gap: 12px;
          padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,.07); flex-shrink: 0;
        }
        .sb-brand-icon {
          width: 36px; height: 36px; border-radius: 10px; background: #dc2626;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; color: #fff; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(220,38,38,.4);
        }
        .sb-brand-name { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; line-height: 1.2; }
        .sb-brand-sub { font-size: 10px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

        .sb-scroll {
          flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; -ms-overflow-style: none; scrollbar-width: none;
        }
        .sb-scroll::-webkit-scrollbar { display: none; }

        .sb-section { font-size: 10px; font-weight: 800; color: #1e3a5f; text-transform: uppercase; letter-spacing: .08em; padding: 14px 12px 6px; }

        .sb-item {
          width: 100%; padding: 10px 12px; background: transparent; border: none;
          border-radius: 9px; color: #475569; font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; text-align: left;
          display: flex; align-items: center; gap: 12px; cursor: pointer;
          transition: all .16s; position: relative;
        }
        .sb-item:hover { background: rgba(255,255,255,.04); color: #94a3b8; }
        .sb-item.active { background: rgba(220,38,38,.12); color: #f87171; }
        .sb-item.active .sb-icon { background: #dc2626; color: #fff; box-shadow: 0 3px 10px rgba(220,38,38,.4); }
        .sb-item.active::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; background: #dc2626; border-radius: 0 3px 3px 0;
        }

        .sb-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,.05);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all .16s;
        }

        .sb-footer {
          padding: 14px 10px; border-top: 1px solid rgba(255,255,255,.06);
          display: flex; flex-direction: column; gap: 2px; flex-shrink: 0;
        }
        .sb-foot-btn {
          width: 100%; padding: 10px 12px; background: transparent; border: none;
          border-radius: 9px; color: #334155; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all .16s;
        }
        .sb-foot-btn:hover { background: rgba(255,255,255,.04); color: #64748b; }
        .sb-foot-btn.danger:hover { background: rgba(220,38,38,.08); color: #f87171; }
        .sb-foot-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,.04);
          display: flex; align-items: center; justify-content: center; font-size: 13px;
        }
      `}</style>

      <aside className="erp-sidebar">
        {/* Brand */}
        <div className="sb-brand">
          <div className="sb-brand-icon"><i className="fa-solid fa-building-columns" /></div>
          <div>
            <div className="sb-brand-name" title={displayName}>{shortName}</div>
            <div className="sb-brand-sub">Admin Panel</div>
          </div>
        </div>

        {/* Menu */}
        <div className="sb-scroll">
          {menuItems.map((item, i) =>
            item.type === "header" ? (
              <div className="sb-section" key={i}>{item.label}</div>
            ) : (
              <button
                key={item.id}
                className={`sb-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => setActiveView(item.id)}
              >
                <span className="sb-icon"><i className={item.icon} /></span>
                {item.label}
              </button>
            )
          )}
        </div>

        {/* Footer */}
        <div className="sb-footer">
          <button className="sb-foot-btn" onClick={() => navigate("/")}>
            <span className="sb-foot-icon"><i className="fa-solid fa-house" /></span>
            Website Home
          </button>
          <button className="sb-foot-btn danger" onClick={handleLogout}>
            <span className="sb-foot-icon"><i className="fa-solid fa-arrow-right-from-bracket" /></span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;