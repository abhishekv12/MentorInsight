import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";

// ────────────────────────────────────────────────
// BroadcastMessages — Student View
// Reads messages sent by the mentor/faculty via API
// Falls back to localStorage demo messages when offline
// ────────────────────────────────────────────────

const DEMO_MESSAGES = [
  {
    _id: "demo1",
    subject: "Welcome to the new semester!",
    body: "Dear students, hope you all are doing well. This semester we will be focusing on project-based learning. Please keep your attendance above 75% and complete all assignments on time.",
    sentBy: "Faculty",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "normal",
    tag: "General",
  },
  {
    _id: "demo2",
    subject: "🔴 Exam Schedule Released",
    body: "The end-semester examination schedule has been uploaded. Please check the notice board and plan your preparation accordingly. All the best!",
    sentBy: "Faculty",
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "urgent",
    tag: "Exam",
  },
];

const PRIORITY_STYLE = {
  urgent: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", badge: "🔴 Urgent" },
  high:   { color: "#f97316", bg: "#fff7ed", border: "#fed7aa", badge: "🟠 High"   },
  normal: { color: "#667eea", bg: "#eef2ff", border: "#c7d2fe", badge: "🔵 Normal" },
  info:   { color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc", badge: "ℹ️ Info"   },
};

const BroadcastMessages = ({ student, batchInfo }) => {
  const storageKey = `broadcasts_${student?.rollNo}`;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      const s = localStorage.getItem(`broadcast_read_${student?.rollNo}`);
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        if (batchInfo?._id) {
          const res = await axios.get(
            `${API_URL}/api/student/broadcasts/${batchInfo._id}/${student?.division || "all"}`
          );
          if (res.data.success && res.data.messages.length > 0) {
            setMessages(res.data.messages);
            setLoading(false);
            return;
          }
        }
      } catch {}
      // Fallback to demo messages
      setMessages(DEMO_MESSAGES);
      setLoading(false);
    };
    if (student) fetchMessages();
  }, [student, batchInfo]);

  const unreadCount = messages.filter(m => !readIds.has(m._id)).length;

  const markRead = (id) => {
    const updated = new Set([...readIds, id]);
    setReadIds(updated);
    localStorage.setItem(`broadcast_read_${student?.rollNo}`, JSON.stringify([...updated]));
  };

  const markAllRead = () => {
    const allIds = new Set(messages.map(m => m._id));
    setReadIds(allIds);
    localStorage.setItem(`broadcast_read_${student?.rollNo}`, JSON.stringify([...allIds]));
  };

  const getTimeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  if (loading) return (
    <div className="broadcast-section">
      <div className="broadcast-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Loading messages...</span>
      </div>
    </div>
  );

  return (
    <div className="broadcast-section">
      {/* Header */}
      <div className="broadcast-header">
        <div className="broadcast-title-row">
          <div className="broadcast-title">
            <div className="broadcast-icon-wrap">
              <i className="fa-solid fa-bullhorn"></i>
            </div>
            <div>
              <h2>Broadcast Messages</h2>
              <p>From your mentor &amp; faculty</p>
            </div>
          </div>
          <div className="broadcast-header-right">
            {unreadCount > 0 && (
              <span className="broadcast-unread-badge">{unreadCount} unread</span>
            )}
            {unreadCount > 0 && (
              <button className="broadcast-mark-all-btn" onClick={markAllRead}>
                <i className="fa-solid fa-check-double"></i> Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message List */}
      {messages.length === 0 ? (
        <div className="broadcast-empty">
          <i className="fa-solid fa-inbox"></i>
          <h3>No Messages Yet</h3>
          <p>Your mentor's broadcast messages will appear here.</p>
        </div>
      ) : (
        <div className="broadcast-list">
          {messages.map(msg => {
            const pStyle = PRIORITY_STYLE[msg.priority] || PRIORITY_STYLE.normal;
            const isRead = readIds.has(msg._id);
            const isExpanded = expandedId === msg._id;

            return (
              <div
                key={msg._id}
                className={`broadcast-item ${!isRead ? "unread" : ""} ${isExpanded ? "expanded" : ""}`}
                style={{ borderLeft: `4px solid ${pStyle.color}` }}
              >
                {/* Item Header */}
                <div
                  className="broadcast-item-header"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : msg._id);
                    if (!isRead) markRead(msg._id);
                  }}
                >
                  <div className="broadcast-item-left">
                    {!isRead && <span className="broadcast-unread-dot" style={{ background: pStyle.color }}></span>}
                    <div className="broadcast-sender-avatar" style={{ background: `${pStyle.color}18`, color: pStyle.color }}>
                      <i className="fa-solid fa-user-tie"></i>
                    </div>
                    <div className="broadcast-item-info">
                      <div className="broadcast-item-top">
                        <span className="broadcast-subject">{msg.subject}</span>
                        <span
                          className="broadcast-priority-tag"
                          style={{ background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}
                        >
                          {pStyle.badge}
                        </span>
                      </div>
                      <div className="broadcast-item-meta">
                        <span className="broadcast-sender">
                          <i className="fa-solid fa-user-tie"></i>
                          {msg.sentBy || "Faculty"}
                        </span>
                        {msg.tag && (
                          <span className="broadcast-tag">
                            <i className="fa-solid fa-tag"></i>
                            {msg.tag}
                          </span>
                        )}
                        <span className="broadcast-time">
                          <i className="fa-solid fa-clock"></i>
                          {getTimeAgo(msg.sentAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} broadcast-chevron`}></i>
                </div>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="broadcast-item-body">
                    <div className="broadcast-message-text">
                      {msg.body}
                    </div>
                    {msg.attachment && (
                      <a href={msg.attachment} download className="broadcast-attachment-btn">
                        <i className="fa-solid fa-paperclip"></i>
                        View Attachment
                      </a>
                    )}
                    <div className="broadcast-item-footer">
                      <span>
                        <i className="fa-solid fa-calendar"></i>
                        {new Date(msg.sentAt).toLocaleDateString("en-IN", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BroadcastMessages;
