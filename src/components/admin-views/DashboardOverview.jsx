import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from "../../../config";
// import './DashboardOverview.css'; // Uncomment if you have the CSS file

const DashboardOverview = ({ stats }) => {
  // 1. State to store REAL data from database
  const [recentData, setRecentData] = useState({
    recentBatches: [],
    recentStudents: [],
    recentFaculty: []
  });
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data on Mount
  useEffect(() => {
    const fetchOverview = async () => {
      const collegeName = localStorage.getItem('collegeName');
      if(!collegeName) return;

      try {
        // Fetch overview data specific to THIS college
        const res = await axios.get(`${API_URL}/api/admin/overview-data?college=${collegeName}`);
        setRecentData(res.data);
      } catch (err) {
        console.error("Error fetching overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="overview-container">
      
      {/* 1. TOP SUMMARY CARDS */}
      <div className="stats-grid-modern">
        <div className="stat-card-modern white">
            <div className="icon-wrapper blue"><i className="fa-solid fa-users"></i></div>
            <div className="stat-info">
                <h3>{stats.students || 0}</h3>
                <p>Total Students</p>
                <span className="trend positive">Active Count</span>
            </div>
        </div>
        <div className="stat-card-modern white">
            <div className="icon-wrapper green"><i className="fa-solid fa-chalkboard-user"></i></div>
            <div className="stat-info">
                <h3>{stats.faculty || 0}</h3>
                <p>Active Mentors</p>
            </div>
        </div>
        <div className="stat-card-modern white">
            <div className="icon-wrapper purple"><i className="fa-solid fa-layer-group"></i></div>
            <div className="stat-info">
                <h3>{stats.batches || 0}</h3>
                <p>Departments/Batches</p>
            </div>
        </div>
        <div className="stat-card-modern white">
            <div className="icon-wrapper orange"><i className="fa-solid fa-clock"></i></div>
            <div className="stat-info">
                <h3>0</h3>
                <p>Pending Actions</p>
            </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT SPLIT */}
      <div className="dashboard-split">
        
        {/* LEFT: REAL DEPARTMENTS LIST */}
        <div className="dashboard-section big-card">
            <div className="section-header">
                <h3>Recently Added Departments</h3>
            </div>
            
            <div className="dept-list">
                {recentData.recentBatches.length === 0 ? (
                    <div style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>
                        <i className="fa-solid fa-layer-group" style={{fontSize: '24px', marginBottom: '10px'}}></i>
                        <p>No departments found.<br/>Go to "Departments" to create one.</p>
                    </div>
                ) : (
                    recentData.recentBatches.map(batch => (
                        <div className="dept-item" key={batch._id} style={{display: 'flex', padding: '15px', borderBottom: '1px solid #f1f5f9', alignItems: 'center'}}>
                            <div className="dept-icon" style={{marginRight: '15px', padding: '10px', background: '#f1f5f9', borderRadius: '8px'}}>
                                <i className="fa-solid fa-laptop-code"></i>
                            </div>
                            <div className="dept-details" style={{flex: 1}}>
                                <h4 style={{margin: 0}}>{batch.name}</h4>
                                <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>{batch.year}</p>
                            </div>
                            <div className="dept-stats">
                                <span className="pill" style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>
                                    {batch.studentCount} Students
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* RIGHT: REAL FACULTY LIST */}
        <div className="dashboard-section big-card">
            <div className="section-header">
                <h3>New Faculty Members</h3>
            </div>

            <div className="mentor-status-list">
                {recentData.recentFaculty.length === 0 ? (
                    <div style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>
                        <p>No faculty registered yet.</p>
                    </div>
                ) : (
                    recentData.recentFaculty.map(faculty => (
                        <div className="status-item" key={faculty._id} style={{display: 'flex', padding: '15px', borderBottom: '1px solid #f1f5f9', alignItems: 'center'}}>
                            <div className="mentor-avatar-small" style={{width: '35px', height: '35px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold'}}>
                                {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
                            </div>
                            <div>
                                <h4 style={{margin: 0, fontSize: '14px'}}>{faculty.name}</h4>
                                <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>{faculty.email}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
