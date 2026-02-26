import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";
import Facultyreviewadmin from "../components/admin-views/Facultyreviewadmin";
import "../components/faculty-review.css";
import API_URL from "../../config";

// Sub-components
import AdminSidebar from "../components/AdminSidebar";
import DashboardOverview from "../components/admin-views/DashboardOverview";
import BatchManagement from "../components/admin-views/BatchManagement";
import FacultyDirectory from "../components/admin-views/FacultyDirectory";
import Admindashboardshowcase from "../components/admin-views/Admindashboardshowcase";
import AdminDashboardfooter from "../components/AdminDashboardfooter";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [collegeName, setCollegeName] = useState("Institute Admin");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    batches: 0,
    depts: 0,
  });

  useEffect(() => {
    // 1. Auth Check
    if (!localStorage.getItem("adminAuth")) {
      navigate("/admin-login");
      return;
    }

    // 2. Get College Name
    const storedCollege = localStorage.getItem("collegeName");
    if (storedCollege) {
      setCollegeName(storedCollege);
      // 3. Fetch Stats ONLY after we have the college name
      fetchGlobalStats(storedCollege);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // --- THE FIX IS HERE ---
  const fetchGlobalStats = async (nameOfCollege) => {
    try {
      // We pass ?college=${nameOfCollege} so the server filters the count
      const res = await axios.get(
        `${API_URL}/api/admin/stats?college=${nameOfCollege}`,
      );
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading stats", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  if (loading)
    return <div className="admin-loading">Loading ERP Workspace...</div>;

  return (
    <div className="erp-layout">
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={handleLogout}
        collegeName={collegeName}
      />

      <main className="erp-main-content">
        <header className="erp-topbar">
          <div className="topbar-title">
            <h2>{collegeName}</h2>
            <span className="current-path">
              / {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </span>
          </div>

          <div className="topbar-actions">
            <div className="admin-profile">
              <div className="avatar">{collegeName.charAt(0)}</div>
              <div className="info">
                <span className="name">Administrator</span>
                <span className="role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="erp-view-container">
          {activeView === "overview" && (
            <Admindashboardshowcase
              stats={stats}
              collegeName={collegeName}
              setActiveView={setActiveView}
            />
          )}
          {activeView === "batches" && <BatchManagement />}
          {activeView === "faculty" && <FacultyDirectory />}
          {activeView === "reviews" && (
            <Facultyreviewadmin collegeName={collegeName} />
          )}
        </div>
        <AdminDashboardfooter
          collegeName={collegeName}
          adminEmail={localStorage.getItem("adminEmail") || ""}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;

