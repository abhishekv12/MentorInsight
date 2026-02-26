
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";

const SessionAttendeesModal = ({ session, facultyUid, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(true);
  const [sentCount, setSentCount] = useState(0);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/faculty/session/${session._id}/attendees`
        );
        if (res.data.success) {
          setAttendees(res.data.attendees || []);
          setAccepting(res.data.acceptingApplications !== false);
          setSentCount(res.data.sentToCount || 0);
        }
      } catch (err) {
        console.error("Error fetching attendees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [session._id]);

  const handleToggleApplications = async () => {
    setToggling(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/faculty/session/${session._id}/toggle-applications`,
        { facultyUid }
      );
      if (res.data.success) {
        setAccepting(res.data.acceptingApplications);
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setToggling(false);
    }
  };

  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const header = "Name,Roll No,Enrollment No,Division,Email,Applied At";
    const rows = attendees.map(a => [
      `"${a.name}"`,
      a.rollNo,
      a.enrollmentNo || "-",
      a.division || "-",
      a.email || "-",
      new Date(a.appliedAt).toLocaleString()
    ].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session.title.replace(/\s+/g, "_")}_attendees.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sessionDate = new Date(session.sessionDate).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });

  const responseRate = sentCount > 0
    ? Math.round((attendees.length / sentCount) * 100)
    : 0;

  return (
    <div className="attendees-modal-overlay" onClick={onClose}>
      <div className="attendees-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="attendees-modal-header">
          <div>
            <h2><i className="fa-solid fa-users"></i> {session.title}</h2>
            <p>
              <i className="fa-solid fa-calendar"></i> {sessionDate}
              {session.sessionTime && ` • ${session.sessionTime}`}
              {session.venue && ` • ${session.venue}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="attendees-modal-body">

          {/* Stats */}
          <div className="attendees-stats">
            <div className="attendee-stat-pill">
              <span className="stat-num">{attendees.length}</span>
              <span className="stat-lbl">Registered</span>
            </div>
            <div className="attendee-stat-pill">
              <span className="stat-num">{sentCount}</span>
              <span className="stat-lbl">Notified</span>
            </div>
            <div className="attendee-stat-pill">
              <span className="stat-num" style={{ color: responseRate >= 50 ? "#10b981" : "#f59e0b" }}>
                {responseRate}%
              </span>
              <span className="stat-lbl">Response Rate</span>
            </div>
            <div className="attendee-stat-pill">
              <span className="stat-num" style={{ color: accepting ? "#10b981" : "#ef4444", fontSize: "18px" }}>
                {accepting ? "OPEN" : "CLOSED"}
              </span>
              <span className="stat-lbl">Applications</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              className="toggle-apps-btn"
              onClick={handleToggleApplications}
              disabled={toggling}
            >
              {toggling ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : accepting ? (
                <><i className="fa-solid fa-lock"></i> Close Applications</>
              ) : (
                <><i className="fa-solid fa-lock-open"></i> Re-open Applications</>
              )}
            </button>

            {attendees.length > 0 && (
              <button className="export-csv-btn" onClick={handleExportCSV}>
                <i className="fa-solid fa-file-csv"></i>
                Export CSV
              </button>
            )}
          </div>

          {/* Attendees Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "28px" }}></i>
              <p>Loading attendees...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="empty-attendees">
              <i className="fa-solid fa-user-slash"></i>
              <p>No students have applied for this session yet.</p>
              <p style={{ fontSize: "12px", marginTop: "8px" }}>
                {accepting ? "Applications are open." : "Applications are closed."}
              </p>
            </div>
          ) : (
            <table className="attendees-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Division</th>
                  <th>Applied At</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a, idx) => (
                  <tr key={idx}>
                    <td style={{ color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div className="attendee-name-cell">
                        <div className="attendee-avatar">
                          {a.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {a.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{a.rollNo}</td>
                    <td>
                      <span className="div-badge-small">{a.division || "—"}</span>
                    </td>
                    <td>
                      <div className="applied-time">
                        {new Date(a.appliedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric"
                        })}
                      </div>
                      <div className="applied-time">
                        {new Date(a.appliedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default SessionAttendeesModal;

