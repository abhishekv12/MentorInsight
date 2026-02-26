import React, { useState, useEffect, useRef } from "react";

const Notificationbell = ({ student, sessions, attendanceData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`notif_read_${student?.rollNo}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const dropdownRef = useRef(null);

  // Build notifications from real data
  useEffect(() => {
    if (!student) return;
    const notifs = [];

    // 1. New sessions in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    (sessions || []).forEach(session => {
      const created = new Date(session.createdAt || session.sessionDate);
      if (created >= sevenDaysAgo) {
        const isUpcoming = new Date(session.sessionDate) >= new Date();
        notifs.push({
          id: `session_${session._id}`,
          type: "session",
          icon: "fa-calendar-plus",
          iconColor: "#667eea",
          iconBg: "#eef2ff",
          title: "New Session Added",
          message: `${session.title} — ${new Date(session.sessionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          badge: session.isImportant ? "IMPORTANT" : (isUpcoming ? "UPCOMING" : "PAST"),
          badgeColor: session.isImportant ? "#dc2626" : (isUpcoming ? "#10b981" : "#6b7280"),
          timestamp: new Date(session.createdAt || session.sessionDate),
        });
      }
    });

    // 2. Attendance shortage warning
    if (student.attendance !== undefined) {
      if (student.attendance < 75) {
        notifs.push({
          id: "attendance_critical",
          type: "attendance",
          icon: "fa-triangle-exclamation",
          iconColor: "#ef4444",
          iconBg: "#fef2f2",
          title: "Attendance Shortage Warning",
          message: `Your attendance is ${student.attendance}%. Minimum required: 75%.`,
          badge: "CRITICAL",
          badgeColor: "#ef4444",
          timestamp: new Date(),
        });
      } else if (student.attendance < 80) {
        notifs.push({
          id: "attendance_low",
          type: "attendance",
          icon: "fa-circle-exclamation",
          iconColor: "#f97316",
          iconBg: "#fff7ed",
          title: "Attendance Getting Low",
          message: `Your attendance is ${student.attendance}%. Keep it above 75%.`,
          badge: "WARNING",
          badgeColor: "#f97316",
          timestamp: new Date(),
        });
      }
    }

    // 3. Mentor message placeholder (would come from API in production)
    notifs.push({
      id: "mentor_msg_welcome",
      type: "message",
      icon: "fa-message",
      iconColor: "#8b5cf6",
      iconBg: "#f5f3ff",
      title: "Message from Mentor",
      message: `Welcome to the portal! Keep your profile updated and stay active.`,
      badge: "MESSAGE",
      badgeColor: "#8b5cf6",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Sort by timestamp descending
    notifs.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(notifs);
  }, [student, sessions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem(`notif_read_${student?.rollNo}`, JSON.stringify([...allIds]));
  };

  const markRead = (id) => {
    const updated = new Set([...readIds, id]);
    setReadIds(updated);
    localStorage.setItem(`notif_read_${student?.rollNo}`, JSON.stringify([...updated]));
  };

  const getTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notif-bell-wrap" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${isOpen ? "active" : ""}`}
        onClick={() => { setIsOpen(!isOpen); }}
        aria-label="Notifications"
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notif-count-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <div className="notif-header-left">
              <h3>Notifications</h3>
              {unreadCount > 0 && <span className="notif-unread-pill">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <i className="fa-solid fa-check-double"></i> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <i className="fa-solid fa-bell-slash"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const isRead = readIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${!isRead ? "unread" : ""}`}
                    onClick={() => markRead(notif.id)}
                  >
                    {!isRead && <div className="notif-unread-dot"></div>}
                    <div
                      className="notif-item-icon"
                      style={{ background: notif.iconBg, color: notif.iconColor }}
                    >
                      <i className={`fa-solid ${notif.icon}`}></i>
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-top">
                        <span className="notif-item-title">{notif.title}</span>
                        <span
                          className="notif-badge"
                          style={{ background: `${notif.badgeColor}18`, color: notif.badgeColor, border: `1px solid ${notif.badgeColor}40` }}
                        >
                          {notif.badge}
                        </span>
                      </div>
                      <p className="notif-item-msg">{notif.message}</p>
                      <span className="notif-time">
                        <i className="fa-solid fa-clock"></i>
                        {getTimeAgo(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="notif-dropdown-footer">
            <span>Showing {notifications.length} notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificationbell;

