import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from "/src/config";

const FacultyDirectory = () => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    axios.get('${API_URL}/api/faculty-list')
      .then(res => setFaculty(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h3>Faculty Directory</h3>
        <button className="btn-create"><i className="fa-solid fa-user-plus"></i> Add Faculty</button>
      </div>

      <div className="table-container">
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {faculty.map((f) => (
                    <tr key={f.uid}>
                        <td>
                            <div className="admin-profile">
                                <div className="avatar" style={{background: '#e0e7ff', color: '#4338ca'}}>{f.name.charAt(0)}</div>
                                <span className="name" style={{fontSize: '14px'}}>{f.name}</span>
                            </div>
                        </td>
                        <td>{f.email}</td>
                        <td><span className="pill">Faculty</span></td>
                        <td><span className="trend positive">Active</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyDirectory;
