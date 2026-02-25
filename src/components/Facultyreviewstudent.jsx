import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "/src/config";

// ============================================================
// FacultyReviewStudent.jsx
// Student-side Faculty Review tab
// Shows ONLY when admin has posted an active review campaign for the student's batch
// Add as a tab in StudentDashboard main content (NOT sidebar)
//
// How to integrate:
// 1. Fetch campaigns for student's batch on mount
// 2. If activeCampaigns.length > 0, show a "Faculty Review" tab button
//    in the main content area (e.g., below the header section)
// 3. Render <FacultyReviewStudent student={student} /> when that tab is active
//
// Example integration in StudentDashboard.jsx:
//
//   const [activeFacultyReviews, setActiveFacultyReviews] = useState([]);
//
//   // Add to fetchStudentSessions or separate useEffect:
//   const fetchActiveCampaigns = async (batchId) => {
//     try {
//       const res = await axios.get(`${API_URL}/api/student/review-campaigns/${batchId}`);
//       setActiveFacultyReviews(res.data.campaigns || []);
//     } catch { setActiveFacultyReviews([]); }
//   };
//
//   // In header area — show dynamic tab:
//   {activeFacultyReviews.length > 0 && (
//     <button className="dynamic-review-tab" onClick={() => setActiveTab("facultyReview")}>
//       <i className="fa-solid fa-star-half-stroke"></i> Faculty Review
//       <span className="review-badge">{activeFacultyReviews.length}</span>
//     </button>
//   )}
//
//   // In tab content:
//   {activeTab === "facultyReview" && (
//     <FacultyReviewStudent student={student} />
//   )}
// ============================================================

const STAR_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"];
const ratingLabel = (r) =>
  ["", "Poor", "Below Average", "Average", "Good", "Excellent"][r] ||
  "Tap a star";

const StarInput = ({ value, onChange, hoveredStar, setHoveredStar }) => (
  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => {
      const active = hoveredStar ? i <= hoveredStar : i <= value;
      const color = active
        ? STAR_COLORS[Math.max(hoveredStar || value, 1) - 1]
        : "#e2e8f0";
      return (
        <i
          key={i}
          className={`fa-${active ? "solid" : "regular"} fa-star`}
          style={{
            fontSize: "28px",
            color,
            cursor: "pointer",
            transition: "all 0.15s ease",
            transform: active ? "scale(1.1)" : "scale(1)",
          }}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => onChange(i)}
        />
      );
    })}
    <span
      style={{
        marginLeft: "10px",
        color: "#6366f1",
        fontSize: "13px",
        fontWeight: "700",
        minWidth: "100px",
      }}
    >
      {ratingLabel(hoveredStar || value)}
    </span>
  </div>
);

const StarDisplay = ({ rating, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <i
        key={i}
        className={`fa-${i <= rating ? "solid" : "regular"} fa-star`}
        style={{ fontSize: size, color: i <= rating ? "#f59e0b" : "#e2e8f0" }}
      />
    ))}
  </span>
);

// Mock campaigns for demo (used when API is unavailable)
const MOCK_CAMPAIGNS = [
  {
    _id: "c1",
    title: "Mid-Semester Faculty Feedback — TYCS",
    teacherName: "Prof. Rahul Sharma",
    teacherId: "t1",
    batchName: "TYCS",
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    questions: [
      "How clear were the explanations?",
      "How engaging were the classes?",
      "How approachable is the teacher?",
    ],
    status: "active",
  },
];

// Change the component signature:
const FacultyReviewStudent = ({ student, onReviewSubmitted }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected campaign to review
  const [submitted, setSubmitted] = useState(new Set()); // campaignIds already submitted
  const [submitting, setSubmitting] = useState(false);

  // Per-campaign form state
  const [ratings, setRatings] = useState({}); // questionIdx -> rating
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [hoveredStars, setHoveredStars] = useState({}); // idx -> hovered
  const [hoveredOverall, setHoveredOverall] = useState(0);

  const batchId = student?.batchInfo?._id || student?.batchInfo?.batchId || "";

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line
  }, [batchId]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const [campRes, subRes] = await Promise.allSettled([
        axios.get(
          `${API_URL}/api/student/review-campaigns/${batchId}`,
        ),
        // Change fetchCampaigns to pass studentId as query param:
        axios.get(
          `${API_URL}/api/student/my-reviews/${student?.rollNo}?studentId=${student?._id || ""}`,
        ),
      ]);
      if (
        campRes.status === "fulfilled" &&
        campRes.value.data.campaigns?.length
      ) {
        setCampaigns(
          campRes.value.data.campaigns.filter((c) => c.status === "active"),
        );
      } else {
        setCampaigns(MOCK_CAMPAIGNS);
      }
      if (subRes.status === "fulfilled") {
        const ids = (subRes.value.data.reviews || []).map((r) => r.campaignId);
        setSubmitted((prev) => new Set([...prev, ...ids])); // ← merge, don't replace
      }
    } catch {
      setCampaigns(MOCK_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  };

  const openCampaign = (campaign) => {
    setSelected(campaign);
    setRatings({});
    setOverallRating(0);
    setComment("");
    setAnonymous(true);
    setHoveredStars({});
    setHoveredOverall(0);
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert("Please give an overall rating.");
      return;
    }
    if (selected.questions?.some((_, i) => !ratings[i])) {
      alert("Please rate all questions.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("${API_URL}/api/student/submit-review", {
        campaignId: selected._id,
        teacherId: selected.teacherId,
        teacherName: selected.teacherName,
        batchName: selected.batchName,
        college: student?.batchInfo?.collegeName || student?.collegeName,
        studentId: student?._id || student?.rollNo,
        studentName: anonymous ? "Anonymous" : student?.name,
        rollNo: anonymous ? null : student?.rollNo,
        overallRating,
        questionRatings: ratings,
        comment,
        anonymous,
      });
    } catch {
      /* optimistic */
    }
    const submittedId = selected._id; // ← capture BEFORE clearing
    setSubmitted((prev) => new Set([...prev, submittedId]));
    setSelected(null);
    setSubmitting(false);
    if (onReviewSubmitted) onReviewSubmitted(submittedId); // ← notify parent
  };

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
    return diff;
  };

  if (loading)
    return (
      <div className="frs-root">
        <div className="frs-loading">
          <div className="frs-spinner"></div>
          <p>Loading faculty reviews…</p>
        </div>
      </div>
    );

  const activeCampaigns = campaigns.filter((c) => !submitted.has(c._id));
  const completedCampaigns = campaigns.filter((c) => submitted.has(c._id));

  return (
    <div className="frs-root">
      {/* ── Header ── */}
      <div className="frs-header">
        <div>
          <h2 className="frs-title">
            <i className="fa-solid fa-star-half-stroke"></i> Faculty Review
          </h2>
          <p className="frs-subtitle">
            Help your institution improve by sharing honest feedback about your
            teachers
          </p>
        </div>
        <div className="frs-header-stats">
          <div className="frs-hstat">
            <span className="frs-hstat-val">{activeCampaigns.length}</span>
            <span className="frs-hstat-label">Pending</span>
          </div>
          <div className="frs-hstat">
            <span className="frs-hstat-val">{completedCampaigns.length}</span>
            <span className="frs-hstat-label">Submitted</span>
          </div>
        </div>
      </div>

      {/* ── No campaigns ── */}
      {campaigns.length === 0 && (
        <div className="frs-empty">
          <div className="frs-empty-icon">
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <h3>No Active Reviews</h3>
          <p>
            Your administrator will post review campaigns here when they need
            your feedback on teachers.
          </p>
        </div>
      )}

      {/* ── Active campaigns ── */}
      {activeCampaigns.length > 0 && (
        <div className="frs-section">
          <div className="frs-section-header">
            <i
              className="fa-solid fa-circle"
              style={{ color: "#22c55e", fontSize: "10px" }}
            ></i>
            Pending Your Review
            <span className="frs-section-count">{activeCampaigns.length}</span>
          </div>
          <div className="frs-campaigns-grid">
            {activeCampaigns.map((c) => {
              const dl = daysLeft(c.deadline);
              const urgent = dl !== null && dl <= 2;
              return (
                <div
                  key={c._id}
                  className={`frs-camp-card ${urgent ? "frs-urgent" : ""}`}
                >
                  {urgent && (
                    <div className="frs-deadline-flag">
                      <i className="fa-solid fa-clock"></i>{" "}
                      {dl <= 0 ? "Closes today!" : `${dl}d left`}
                    </div>
                  )}
                  <div className="frs-camp-icon">
                    <i className="fa-solid fa-chalkboard-user"></i>
                  </div>
                  <h3 className="frs-camp-title">{c.title}</h3>
                  <div className="frs-camp-teacher">
                    <i className="fa-solid fa-user-tie"></i> {c.teacherName}
                  </div>
                  <div className="frs-camp-meta-row">
                    {c.questions?.length > 0 && (
                      <span>
                        <i className="fa-solid fa-list-check"></i>{" "}
                        {c.questions.length} questions
                      </span>
                    )}
                    {c.deadline && (
                      <span style={{ color: urgent ? "#ef4444" : "inherit" }}>
                        <i className="fa-solid fa-calendar-xmark"></i> Due{" "}
                        {new Date(c.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    className="frs-review-btn"
                    onClick={() => openCampaign(c)}
                  >
                    <i className="fa-solid fa-star"></i> Give Feedback
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Completed ── */}
      {completedCampaigns.length > 0 && (
        <div className="frs-section">
          <div className="frs-section-header">
            <i
              className="fa-solid fa-circle-check"
              style={{ color: "#10b981", fontSize: "12px" }}
            ></i>
            Submitted
            <span className="frs-section-count">
              {completedCampaigns.length}
            </span>
          </div>
          <div className="frs-completed-list">
            {completedCampaigns.map((c) => (
              <div key={c._id} className="frs-done-card">
                <div className="frs-done-icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <div className="frs-done-title">{c.title}</div>
                  <div className="frs-done-meta">
                    {c.teacherName} · {c.batchName}
                  </div>
                </div>
                <span className="frs-done-tag">Submitted</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info notice ── */}
      <div className="frs-notice">
        <i className="fa-solid fa-shield-halved"></i>
        <div>
          <strong>Your feedback is confidential.</strong>
          <p>
            Responses are anonymized by default. The admin sees aggregated
            ratings, not individual names.
          </p>
        </div>
      </div>

      {/* ══ REVIEW MODAL ════════════════════════════════════ */}
      {selected && (
        <div
          className="frs-modal-overlay"
          onClick={() => !submitting && setSelected(null)}
        >
          <div className="frs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="frs-modal-header">
              <div>
                <h3 className="frs-modal-title">{selected.title}</h3>
                <p className="frs-modal-teacher">
                  <i className="fa-solid fa-user-tie"></i>{" "}
                  {selected.teacherName}
                </p>
              </div>
              <button
                className="frs-modal-close"
                onClick={() => setSelected(null)}
                disabled={submitting}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="frs-modal-body">
              {/* Overall rating */}
              <div className="frs-q-block frs-overall-block">
                <div className="frs-q-label">
                  <span className="frs-q-num overall">★</span>
                  Overall Rating <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <StarInput
                  value={overallRating}
                  onChange={setOverallRating}
                  hoveredStar={hoveredOverall}
                  setHoveredStar={setHoveredOverall}
                />
              </div>

              {/* Per-question ratings */}
              {selected.questions?.map((q, i) => (
                <div key={i} className="frs-q-block">
                  <div className="frs-q-label">
                    <span className="frs-q-num">{i + 1}</span>
                    {q} <span style={{ color: "#ef4444" }}>*</span>
                  </div>
                  <StarInput
                    value={ratings[i] || 0}
                    onChange={(v) =>
                      setRatings((prev) => ({ ...prev, [i]: v }))
                    }
                    hoveredStar={hoveredStars[i] || 0}
                    setHoveredStar={(v) =>
                      setHoveredStars((prev) => ({ ...prev, [i]: v }))
                    }
                  />
                </div>
              ))}

              {/* Comment */}
              <div className="frs-q-block">
                <div className="frs-q-label">
                  <span className="frs-q-num">
                    <i className="fa-solid fa-comment"></i>
                  </span>
                  Additional Comments{" "}
                  <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                    (optional)
                  </span>
                </div>
                <textarea
                  className="frs-textarea"
                  placeholder="Share specific feedback, suggestions, or experiences…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Anonymity toggle */}
              <label className="frs-anon-toggle">
                <div
                  className={`frs-toggle-switch ${anonymous ? "on" : "off"}`}
                  onClick={() => setAnonymous(!anonymous)}
                >
                  <div className="frs-toggle-thumb"></div>
                </div>
                <div>
                  <span className="frs-anon-label">Submit anonymously</span>
                  <span className="frs-anon-sub">
                    {anonymous
                      ? "Your name won't be shared with admin"
                      : "Your name will be visible to admin"}
                  </span>
                </div>
              </label>
            </div>

            <div className="frs-modal-footer">
              <button
                className="frs-cancel-btn"
                onClick={() => setSelected(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="frs-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Submitting…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyReviewStudent;
