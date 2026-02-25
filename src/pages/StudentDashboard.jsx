import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Radar } from "react-chartjs-2";
import "./StudentDashboard.css";
import TodoWidget from "./TodoWidget";
import NotificationBell from "./NotificationBell";
import DocumentVault from "./DocumentVault";
import CertificationsWidget from "./CertificationsWidget";
import BroadcastMessages from "./BroadcastMessages";
import DashboardFooter from "./DashboardFooter";
import LearningHub from "./LearningHub";
import StudentDashboardShowcase from "./StudentDashboardShowcase";
import "./student-learning.css";
import FacultyReviewStudent from "../components/FacultyReviewStudent";
import "../components/faculty-review.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
);

// ========================================
// SESSION HELPER: Icon mapper
// ========================================
const getSessionIcon = (type) => {
  const icons = {
    lecture: "book",
    practical: "flask",
    tutorial: "chalkboard-user",
    seminar: "users",
    workshop: "hammer",
    exam: "file-pen",
    other: "circle-info",
  };
  return icons[type] || "calendar";
};

// ========================================
// SESSION CARD COMPONENT
// ========================================

const SessionCard = ({
  session,
  isUpcoming,
  onView,
  isApplied,
  onApply,
  onCancel,
  isApplying,
}) => {
  const sessionDate = new Date(session.sessionDate);

  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isToday = sessionDate.toDateString() === new Date().toDateString();
  const isTomorrow =
    sessionDate.toDateString() ===
    new Date(Date.now() + 86400000).toDateString();

  const isFull =
    session.maxCapacity &&
    (session.attendeeCount || session.attendees?.length || 0) >=
      session.maxCapacity;
  const notAccepting = session.acceptingApplications === false;

  return (
    <div
      className={`session-card ${session.isImportant ? "important" : ""} ${!isUpcoming ? "past" : ""} ${isApplied ? "applied" : ""}`}
    >
      {session.isImportant && (
        <div className="important-badge">
          <i className="fa-solid fa-exclamation-triangle"></i>
          IMPORTANT
        </div>
      )}

      {/* ✅ NEW: Applied badge */}
      {isApplied && (
        <div className="applied-badge">
          <i className="fa-solid fa-circle-check"></i>
          APPLIED
        </div>
      )}

      <div className="session-type-badge">
        <i className={`fa-solid fa-${getSessionIcon(session.sessionType)}`}></i>
        {session.sessionType.charAt(0).toUpperCase() +
          session.sessionType.slice(1)}
      </div>

      <h3 className="session-title">{session.title}</h3>

      {session.description && (
        <p className="session-description">
          {session.description.length > 120
            ? session.description.substring(0, 120) + "..."
            : session.description}
        </p>
      )}

      <div className="session-details">
        <div className="detail-item">
          <i className="fa-solid fa-calendar"></i>
          <span>
            {isToday ? "Today" : isTomorrow ? "Tomorrow" : formattedDate}
          </span>
        </div>
        <div className="detail-item">
          <i className="fa-solid fa-clock"></i>
          <span>{session.sessionTime || "Time TBD"}</span>
        </div>
        {session.venue && (
          <div className="detail-item">
            <i className="fa-solid fa-location-dot"></i>
            <span>{session.venue}</span>
          </div>
        )}
        {session.duration && (
          <div className="detail-item">
            <i className="fa-solid fa-hourglass-half"></i>
            <span>{session.duration} min</span>
          </div>
        )}

        {/* ✅ NEW: Attendee count */}
        {(session.attendeeCount !== undefined ||
          session.attendees?.length !== undefined) && (
          <div className="detail-item">
            <i className="fa-solid fa-users"></i>
            <span>
              {session.attendeeCount ?? session.attendees?.length ?? 0} Applied
              {session.maxCapacity ? ` / ${session.maxCapacity}` : ""}
            </span>
          </div>
        )}
      </div>
      <div className="session-footer">
        <div className="faculty-info">
          <i className="fa-solid fa-user-tie"></i>
          <span>{session.facultyName}</span>
        </div>
        <div className="session-actions">
          <button className="view-details-btn" onClick={onView}>
            View <i className="fa-solid fa-arrow-right"></i>
          </button>

          {/* ✅ NEW: Apply/Cancel button - only for upcoming sessions */}
          {isUpcoming &&
            (isApplied ? (
              <button
                className="cancel-apply-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(session);
                }}
                disabled={isApplying}
                title="Cancel application"
              >
                {isApplying ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-xmark"></i>
                    Cancel
                  </>
                )}
              </button>
            ) : (
              <button
                className={`apply-btn ${isFull ? "full" : ""} ${notAccepting ? "closed" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFull && !notAccepting) onApply(session);
                }}
                disabled={isApplying || isFull || notAccepting}
                title={
                  isFull
                    ? "Session is full"
                    : notAccepting
                      ? "Not accepting applications"
                      : "Apply for this session"
                }
              >
                {isApplying ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : isFull ? (
                  <>
                    <i className="fa-solid fa-lock"></i>
                    Full
                  </>
                ) : notAccepting ? (
                  <>
                    <i className="fa-solid fa-ban"></i>
                    Closed
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Apply
                  </>
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// SESSION DETAIL MODAL COMPONENT
// ========================================

const SessionDetailModal = ({
  session,
  onClose,
  isApplied,
  onApply,
  onCancel,
  isApplying,
}) => {
  const sessionDate = new Date(session.sessionDate);

  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isUpcoming = sessionDate >= new Date();
  const isFull =
    session.maxCapacity &&
    (session.attendeeCount ?? session.attendees?.length ?? 0) >=
      session.maxCapacity;
  const notAccepting = session.acceptingApplications === false;
  const attendeeCount = session.attendeeCount ?? session.attendees?.length ?? 0;

  return (
    <div className="session-modal-overlay" onClick={onClose}>
      <div
        className={`session-modal-content ${session.isImportant ? "important-modal" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="session-modal-header">
          {session.isImportant && (
            <div className="important-banner">
              <i className="fa-solid fa-exclamation-triangle"></i>
              IMPORTANT SESSION
            </div>
          )}
          <h2>{session.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="session-modal-body">
          <div className="session-type-display">
            <i
              className={`fa-solid fa-${getSessionIcon(session.sessionType)}`}
            ></i>
            <span>
              {session.sessionType.charAt(0).toUpperCase() +
                session.sessionType.slice(1)}
            </span>

            {/* ✅ NEW: Application status in modal */}
            {isApplied && (
              <span className="modal-applied-tag">
                <i className="fa-solid fa-circle-check"></i>
                You're Registered
              </span>
            )}
          </div>

          {session.description && (
            <div className="session-section">
              <h3>
                <i className="fa-solid fa-align-left"></i> Description
              </h3>
              <p>{session.description}</p>
            </div>
          )}

          <div className="session-info-grid">
            <div className="info-card">
              <i className="fa-solid fa-calendar-day"></i>
              <div>
                <label>Date</label>
                <p>{formattedDate}</p>
              </div>
            </div>
            <div className="info-card">
              <i className="fa-solid fa-clock"></i>
              <div>
                <label>Time</label>
                <p>{session.sessionTime || "Time TBD"}</p>
              </div>
            </div>
            {session.venue && (
              <div className="info-card">
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <label>Venue</label>
                  <p>{session.venue}</p>
                </div>
              </div>
            )}
            {session.duration && (
              <div className="info-card">
                <i className="fa-solid fa-hourglass-half"></i>
                <div>
                  <label>Duration</label>
                  <p>{session.duration} minutes</p>
                </div>
              </div>
            )}

            {/* ✅ NEW: Attendee count card */}
            <div className="info-card">
              <i className="fa-solid fa-users"></i>
              <div>
                <label>Registrations</label>
                <p>
                  {attendeeCount}{" "}
                  {session.maxCapacity
                    ? `/ ${session.maxCapacity}`
                    : "students"}
                  {isFull && (
                    <span
                      style={{
                        color: "#ef4444",
                        marginLeft: "6px",
                        fontSize: "12px",
                      }}
                    >
                      FULL
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="session-section">
            <h3>
              <i className="fa-solid fa-user-tie"></i> Faculty Information
            </h3>
            <div className="faculty-card">
              <div className="faculty-avatar">
                {session.facultyName?.charAt(0) || "F"}
              </div>
              <div className="faculty-details">
                <p className="faculty-name">{session.facultyName}</p>
                <p className="faculty-email">{session.facultyEmail}</p>
              </div>
            </div>
          </div>

          {session.isImportant && session.sessionType === "exam" && (
            <div className="important-notice">
              <i className="fa-solid fa-circle-exclamation"></i>
              <div>
                <strong>Mandatory Attendance</strong>
                <p>
                  This is an examination session. Your attendance is mandatory.
                </p>
              </div>
            </div>
          )}

          {/* ✅ NEW: Application action section */}
          {isUpcoming && (
            <div
              className={`application-section ${isApplied ? "applied-state" : ""}`}
            >
              {isApplied ? (
                <div className="applied-confirmation">
                  <div className="applied-icon">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div className="applied-text">
                    <h4>You're Registered!</h4>
                    <p>
                      Your application has been confirmed. Please attend on
                      time.
                    </p>
                  </div>
                  <button
                    className="btn-cancel-application"
                    onClick={() => {
                      onCancel(session);
                      onClose();
                    }}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-xmark"></i> Cancel Application
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="apply-cta">
                  <div className="apply-cta-text">
                    <h4>
                      {isFull
                        ? "Session Full"
                        : notAccepting
                          ? "Applications Closed"
                          : "Reserve Your Spot"}
                    </h4>
                    <p>
                      {isFull
                        ? "This session has reached maximum capacity."
                        : notAccepting
                          ? "The faculty has closed applications for this session."
                          : `${attendeeCount} student${attendeeCount !== 1 ? "s" : ""} already registered.`}
                    </p>
                  </div>
                  <button
                    className={`btn-apply-modal ${isFull || notAccepting ? "disabled" : ""}`}
                    onClick={() => {
                      if (!isFull && !notAccepting) {
                        onApply(session);
                        onClose();
                      }
                    }}
                    disabled={isApplying || isFull || notAccepting}
                  >
                    {isApplying ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                        Applying...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check"></i> Apply Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="session-modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
// ========================================
// MAIN COMPONENT
// ========================================
const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showFormProfile, setShowFormProfile] = useState(false);

  // Modal states
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);

  // Multi-year attendance state
  const [selectedAttendanceYear, setSelectedAttendanceYear] = useState(null);

  const [expandedSemester, setExpandedSemester] = useState(null);
  const handleSemesterClick = (semesterIndex) => {
    setExpandedSemester(
      expandedSemester === semesterIndex ? null : semesterIndex,
    );
  };

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [unreadSessionsCount, setUnreadSessionsCount] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);

  const [appliedSessions, setAppliedSessions] = useState(new Set());
  const [applyingSessionId, setApplyingSessionId] = useState(null);

  const [activeFacultyReviews, setActiveFacultyReviews] = useState([]);

  const [sessionSubmittedIds, setSessionSubmittedIds] = useState(new Set());
  const sessionSubmittedIdsRef = React.useRef(new Set()); // ← add this

  const fetchActiveCampaigns = async (batchId, rollNo) => {
    try {
      // 1. Read localStorage FIRST so we never flash submitted campaigns
      const localKey = `reviewed_${rollNo || student?.rollNo || ""}`;
      let localSubmitted = new Set();
      try {
        const raw = localStorage.getItem(localKey);
        if (raw) localSubmitted = new Set(JSON.parse(raw));
      } catch {
        /* ignore */
      }

      // Seed the ref and state with localStorage so they're ready immediately
      localSubmitted.forEach((id) => sessionSubmittedIdsRef.current.add(id));
      if (localSubmitted.size > 0) {
        setSessionSubmittedIds((prev) => new Set([...prev, ...localSubmitted]));
      }

      // 2. Fetch active campaigns AND submitted reviews in parallel
      const [campRes, subRes] = await Promise.allSettled([
        axios.get(
          `http://localhost:5000/api/student/review-campaigns/${batchId}`,
        ),
        rollNo
          ? axios.get(
              `http://localhost:5000/api/student/my-reviews/${rollNo}?studentId=${student?._id || ""}`,
            )
          : Promise.resolve({ data: { reviews: [] } }),
      ]);

      // 3. Build the full set of submitted campaign IDs
      const submittedIds = new Set(localSubmitted); // start with localStorage
      if (subRes.status === "fulfilled") {
        (subRes.value.data.reviews || []).forEach((r) =>
          submittedIds.add(r.campaignId),
        );
      }
      // Also add anything already in the ref (from this session)
      sessionSubmittedIdsRef.current.forEach((id) => submittedIds.add(id));

      // Sync state and ref with merged submitted IDs
      sessionSubmittedIdsRef.current = submittedIds;
      setSessionSubmittedIds(new Set(submittedIds));

      // 4. Filter out submitted campaigns before showing banner
      const campaigns =
        campRes.status === "fulfilled"
          ? campRes.value.data.campaigns?.filter(
              (c) => c.status === "active",
            ) || []
          : [];

      setActiveFacultyReviews(
        campaigns.filter((c) => !submittedIds.has(c._id)),
      );
    } catch {
      setActiveFacultyReviews([]);
    }
  };

  useEffect(() => {
    if (student?.batchInfo?._id) {
      // Pass rollNo so we can check submitted reviews server-side
      fetchActiveCampaigns(student.batchInfo._id, student.rollNo);
    }
  }, [student]);

  const fetchStudentSessions = async (studentData) => {
    try {
      // ✅ Use batchId if available (most reliable), fallback to name-based lookup
      const batchId =
        studentData.batchInfo?._id || studentData.batchInfo?.batchId || null;
      const batchName =
        studentData.batchInfo?.batchName || studentData.batchName || "";
      const division = studentData.division || "";

      console.log("🔍 Fetching sessions:", { batchId, batchName, division });

      let response;

      if (batchId) {
        // ✅ PRIMARY: fetch by batchId (most reliable)
        response = await axios.get(
          `http://localhost:5000/api/student/sessions-by-id/${batchId}/${encodeURIComponent(division)}`,
        );
      } else {
        // ✅ FALLBACK: fetch by batchName
        response = await axios.get(
          `http://localhost:5000/api/student/sessions/${encodeURIComponent(batchName)}/${encodeURIComponent(division)}`,
        );
      }

      if (response.data.success) {
        const fetchedSessions = response.data.sessions || [];
        setSessions(fetchedSessions);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const unreadCount = fetchedSessions.filter((session) => {
          const sessionDate = new Date(session.sessionDate);
          return sessionDate >= sevenDaysAgo;
        }).length;

        setUnreadSessionsCount(unreadCount);

        console.log(
          `📧 Loaded ${fetchedSessions.length} sessions (${unreadCount} recent)`,
        );
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    profilePhoto: null,
    profilePhotoURL: "",
    resumeFile: null,
    resumeURL: "",
    address: "",
    contact1: "",
    contact2: "",
    birthDate: "",
    bloodGroup: "",
    category: "",
    aadharNo: "",
    sscMarks: "",
    sscBoard: "",
    sscPercentage: "",
    sscYear: "",
    hscMarks: "",
    hscBoard: "",
    hscPercentage: "",
    hscYear: "",
    fatherName: "",
    fatherOccupation: "",
    fatherContact: "",
    motherName: "",
    motherOccupation: "",
    motherContact: "",
    hobbies: {
      singing: false,
      dance: false,
      games: false,
      sports: false,
      other: "",
    },
  });

  const [editMode, setEditMode] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showAlert, setShowAlert] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userResponse = await axios.get(
            `http://localhost:5000/api/users/${currentUser.uid}`,
          );
          const userData = userResponse.data;

          if (userData.rollNo && userData.mobile) {
            try {
              const studentDataResponse = await axios.get(
                `http://localhost:5000/api/student/full-data/${userData.rollNo}/${userData.mobile}`,
              );

              if (studentDataResponse.data.success) {
                const fullStudentData = {
                  ...userData,
                  ...studentDataResponse.data.student,
                  batchInfo: studentDataResponse.data.batchInfo,
                };

                let processedAttendanceByYear = {};
                if (fullStudentData.attendanceByYear) {
                  if (fullStudentData.attendanceByYear instanceof Map) {
                    processedAttendanceByYear = Object.fromEntries(
                      fullStudentData.attendanceByYear,
                    );
                  } else if (
                    typeof fullStudentData.attendanceByYear === "object"
                  ) {
                    if (fullStudentData.attendanceByYear.$__ !== undefined) {
                      processedAttendanceByYear = {};
                      for (let key in fullStudentData.attendanceByYear) {
                        if (
                          key !== "$__" &&
                          key !== "$isNew" &&
                          key !== "_doc"
                        ) {
                          processedAttendanceByYear[key] =
                            fullStudentData.attendanceByYear[key];
                        }
                      }
                    } else {
                      processedAttendanceByYear = {
                        ...fullStudentData.attendanceByYear,
                      };
                    }
                  }
                }

                fullStudentData.attendanceByYear = processedAttendanceByYear;
                setStudent(fullStudentData);
                fetchStudentSessions(fullStudentData);

                const storedApplied = localStorage.getItem(
                  `applied_${fullStudentData.rollNo}`,
                );
                if (storedApplied) {
                  try {
                    setAppliedSessions(new Set(JSON.parse(storedApplied)));
                  } catch (e) {
                    console.warn("Failed to parse stored applied sessions");
                  }
                }

                const years = Object.keys(processedAttendanceByYear).sort();
                if (years.length > 0) {
                  const mostRecentYear = years[years.length - 1];
                  setSelectedAttendanceYear(mostRecentYear);
                }
              } else {
                setStudent(userData);
              }
            } catch (batchErr) {
              console.error("Error fetching batch data:", batchErr);
              setStudent(userData);
            }
          } else {
            setStudent(userData);
          }

          const initialProfileData = {
            name: userData.name || "",
            email: userData.email || "",
            profilePhotoURL: userData.profileData?.profilePhotoURL || "",
            resumeURL: userData.profileData?.resumeURL || "",
            address: userData.profileData?.address || "",
            contact1:
              userData.profileData?.contact1 ||
              userData.phone ||
              userData.mobile ||
              "",
            contact2: userData.profileData?.contact2 || "",
            birthDate: userData.profileData?.birthDate || "",
            bloodGroup: userData.profileData?.bloodGroup || "",
            category: userData.profileData?.category || "",
            aadharNo: userData.profileData?.aadharNo || "",
            sscMarks: userData.profileData?.sscMarks || "",
            sscBoard: userData.profileData?.sscBoard || "",
            sscPercentage: userData.profileData?.sscPercentage || "",
            sscYear: userData.profileData?.sscYear || "",
            hscMarks: userData.profileData?.hscMarks || "",
            hscBoard: userData.profileData?.hscBoard || "",
            hscPercentage: userData.profileData?.hscPercentage || "",
            hscYear: userData.profileData?.hscYear || "",
            fatherName: userData.profileData?.fatherName || "",
            fatherOccupation: userData.profileData?.fatherOccupation || "",
            fatherContact: userData.profileData?.fatherContact || "",
            motherName: userData.profileData?.motherName || "",
            motherOccupation: userData.profileData?.motherOccupation || "",
            motherContact: userData.profileData?.motherContact || "",
            hobbies: {
              singing: userData.profileData?.hobbies?.singing || false,
              dance: userData.profileData?.hobbies?.dance || false,
              games: userData.profileData?.hobbies?.games || false,
              sports: userData.profileData?.hobbies?.sports || false,
              other: userData.profileData?.hobbies?.other || "",
            },
          };

          setProfileData(initialProfileData);
          calculateProfileCompletion(initialProfileData);
        } catch (err) {
          console.error("Error fetching student data:", err);
          if (err.response?.status === 404) {
            alert(
              "Student record not found. Please contact your administrator.",
            );
          }
        }
        setLoading(false);
      } else {
        navigate("/login/student");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (profileCompletion < 90 && showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [profileCompletion, showAlert]);

  const calculateProfileCompletion = (data) => {
    const fields = [
      data.name,
      data.email,
      data.profilePhotoURL,
      data.resumeURL,
      data.address,
      data.contact1,
      data.birthDate,
      data.bloodGroup,
      data.category,
      data.aadharNo,
      data.sscMarks,
      data.sscBoard,
      data.sscPercentage,
      data.sscYear,
      data.hscMarks,
      data.hscBoard,
      data.hscPercentage,
      data.hscYear,
      data.fatherName,
      data.fatherOccupation,
      data.fatherContact,
      data.motherName,
      data.motherOccupation,
      data.motherContact,
    ];

    const completed = fields.filter(
      (field) => field && field.toString().trim() !== "",
    ).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const calculateCGPA = () => {
    if (!student?.semesters || student.semesters.length === 0) return "0.00";
    let totalCG = 0;
    let totalCredits = 0;
    student.semesters.forEach((sem) => {
      totalCG += sem.totalCG || 0;
      totalCredits += sem.totalCredits || 0;
    });
    if (totalCredits === 0) return "0.00";
    return (totalCG / totalCredits).toFixed(2);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ Please upload a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "❌ File size must be less than 5MB. Please choose a smaller image.",
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxSize = 800;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

        const finalSize = (compressedBase64.length * 3) / 4 / (1024 * 1024);
        console.log(`📸 Compressed image size: ${finalSize.toFixed(2)}MB`);

        if (finalSize > 5) {
          alert(
            "❌ Image is too large even after compression. Please use a smaller image.",
          );
          return;
        }

        setProfileData((prev) => ({
          ...prev,
          profilePhoto: file,
          profilePhotoURL: compressedBase64,
        }));

        console.log("✅ Image uploaded and compressed successfully");
      };

      img.onerror = () => {
        alert("❌ Failed to load image. Please try another file.");
      };

      img.src = reader.result;
    };

    reader.onerror = () => {
      alert("❌ Failed to read file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("❌ Please upload a PDF file only");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("❌ Resume file size must be less than 10MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileData((prev) => ({
        ...prev,
        resumeFile: file,
        resumeURL: reader.result,
      }));

      console.log("✅ Resume uploaded successfully");
    };

    reader.onerror = () => {
      alert("❌ Failed to read resume file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async () => {
    try {
      setEditMode(false);

      console.log("📤 Updating profile...");

      const updatePayload = {
        ...student,
        profileData: {
          ...profileData,
          profilePhoto: undefined,
          resumeFile: undefined,
        },
      };

      const response = await axios.put(
        `http://localhost:5000/api/users/${auth.currentUser.uid}`,
        updatePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      if (response.data.success || response.data.user) {
        const updatedUser = response.data.user || response.data;

        setStudent(updatedUser);
        calculateProfileCompletion(profileData);

        alert("✅ Profile updated successfully!");
        console.log("✅ Profile update successful");
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);

      setEditMode(true);

      if (err.response?.status === 400) {
        alert(
          `❌ ${err.response.data.error || "Invalid data. Please check all fields."}`,
        );
      } else if (err.response?.status === 404) {
        alert("❌ User not found. Please try logging in again.");
      } else if (err.code === "ECONNABORTED") {
        alert(
          "❌ Request timeout. Your file might be too large. Please try smaller files.",
        );
      } else if (err.message.includes("Network Error")) {
        alert("❌ Network error. Please check your internet connection.");
      } else {
        alert("❌ Failed to update profile. Please try again.");
      }
    }
  };

  const handleHobbyChange = (hobby) => {
    setProfileData((prev) => ({
      ...prev,
      hobbies: {
        ...prev.hobbies,
        [hobby]: !prev.hobbies[hobby],
      },
    }));
  };

  const handleProfileCardClick = () => {
    setShowFormProfile(true);
    setActiveTab("profile");
  };

  // Session handlers
  const handleViewSession = (session) => {
    setSelectedSession(session);
  };

  const handleCloseSessionDetail = () => {
    setSelectedSession(null);
  };

  const handleApplySession = async (session) => {
    if (!student) return;

    const sessionId = session._id;
    setApplyingSessionId(sessionId);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/student/session/${sessionId}/apply`,
        {
          studentId: student._id || student.rollNo,
          rollNo: student.rollNo,
          name: student.name,
          email: student.email || profileData.email,
          division: student.division,
          enrollmentNo: student.enrollmentNo,
        },
      );

      if (response.data.success) {
        setAppliedSessions((prev) => {
          const updated = new Set(prev);
          updated.add(sessionId);
          // Persist to localStorage
          localStorage.setItem(
            `applied_${student.rollNo}`,
            JSON.stringify([...updated]),
          );
          return updated;
        });

        // Update attendee count in sessions list
        setSessions((prev) =>
          prev.map((s) =>
            s._id === sessionId
              ? { ...s, attendeeCount: response.data.attendeeCount }
              : s,
          ),
        );

        alert("✅ You have successfully applied for this session!");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to apply";
      alert(`❌ ${msg}`);
    } finally {
      setApplyingSessionId(null);
    }
  };

  const handleCancelApplication = async (session) => {
    if (!student) return;
    if (!window.confirm("Cancel your application for this session?")) return;

    const sessionId = session._id;
    setApplyingSessionId(sessionId);

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/student/session/${sessionId}/apply`,
        {
          data: {
            studentId: student._id || student.rollNo,
            rollNo: student.rollNo,
          },
        },
      );

      if (response.data.success) {
        setAppliedSessions((prev) => {
          const updated = new Set(prev);
          updated.delete(sessionId);
          localStorage.setItem(
            `applied_${student.rollNo}`,
            JSON.stringify([...updated]),
          );
          return updated;
        });

        setSessions((prev) =>
          prev.map((s) =>
            s._id === sessionId
              ? { ...s, attendeeCount: response.data.attendeeCount }
              : s,
          ),
        );
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || "Failed to cancel"}`);
    } finally {
      setApplyingSessionId(null);
    }
  };

  // ========================================
  // CHART FUNCTIONS
  // ========================================

  const getAttendanceByYearData = () => {
    if (!student?.attendanceByYear) return {};

    let attendanceData = {};

    if (student.attendanceByYear instanceof Map) {
      attendanceData = Object.fromEntries(student.attendanceByYear);
    } else if (typeof student.attendanceByYear === "object") {
      if (student.attendanceByYear.$__ !== undefined) {
        for (let key in student.attendanceByYear) {
          if (
            key !== "$__" &&
            key !== "$isNew" &&
            key !== "_doc" &&
            typeof student.attendanceByYear[key] === "object" &&
            student.attendanceByYear[key] !== null
          ) {
            attendanceData[key] = student.attendanceByYear[key];
          }
        }
      } else {
        attendanceData = { ...student.attendanceByYear };
      }
    }

    return attendanceData;
  };

  const getMultiYearAttendanceData = () => {
    const attendanceData = getAttendanceByYearData();
    if (!attendanceData || Object.keys(attendanceData).length === 0)
      return null;

    const years = Object.keys(attendanceData).sort();

    const datasets = years.map((yearKey, index) => {
      const yearData = attendanceData[yearKey];
      const colors = [
        { bg: "rgba(102, 126, 234, 0.8)", border: "rgba(102, 126, 234, 1)" },
        { bg: "rgba(249, 115, 22, 0.8)", border: "rgba(249, 115, 22, 1)" },
        { bg: "rgba(16, 185, 129, 0.8)", border: "rgba(16, 185, 129, 1)" },
        { bg: "rgba(168, 85, 247, 0.8)", border: "rgba(168, 85, 247, 1)" },
      ];
      const color = colors[index % colors.length];

      const monthOrder = [
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
        "April",
        "May",
      ];

      const monthlyData = monthOrder.map((month) => {
        const record = yearData.months?.find((m) => m.month === month);
        return record ? record.percentage : null;
      });

      return {
        label: `${yearData.year} (${yearData.academicYear})`,
        data: monthlyData,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
        tension: 0.4,
      };
    });

    return {
      labels: [
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
      ],
      datasets: datasets,
    };
  };

  const getSingleYearAttendanceData = (yearKey) => {
    const attendanceData = getAttendanceByYearData();
    if (!attendanceData || !attendanceData[yearKey]) return null;

    const yearData = attendanceData[yearKey];
    const monthOrder = [
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
      "April",
      "May",
    ];

    const sortedRecords = monthOrder
      .map((month) => {
        const record = yearData.months?.find((m) => m.month === month);
        return record || { month, percentage: 0 };
      })
      .filter((r) => yearData.months?.some((m) => m.month === r.month));

    return {
      labels: sortedRecords.map((r) => r.month),
      datasets: [
        {
          label: `Attendance - ${yearData.year} ${yearData.academicYear}`,
          data: sortedRecords.map((r) => r.percentage),
          backgroundColor: sortedRecords.map((record) =>
            record.percentage >= 90
              ? "rgba(34, 197, 94, 0.9)"
              : record.percentage >= 75
                ? "rgba(59, 130, 246, 0.9)"
                : "rgba(239, 68, 68, 0.9)",
          ),
          borderColor: sortedRecords.map((record) =>
            record.percentage >= 90
              ? "rgba(34, 197, 94, 1)"
              : record.percentage >= 75
                ? "rgba(59, 130, 246, 1)"
                : "rgba(239, 68, 68, 1)",
          ),
          borderWidth: 1,
          borderRadius: 0,
          barThickness: 50,
        },
      ],
    };
  };

  const getSemesterPerformanceLineChart = () => {
    if (!student?.semesters || student.semesters.length === 0) return null;

    return {
      labels: student.semesters.map((sem) => sem.semesterName),
      datasets: [
        {
          label: "SGPA Trend",
          data: student.semesters.map((sem) => sem.semesterSGPA || 0),
          borderColor: "rgba(102, 126, 234, 1)",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "white",
          pointBorderColor: "rgba(102, 126, 234, 1)",
          pointBorderWidth: 3,
        },
      ],
    };
  };

  const getSemesterGradeDistribution = () => {
    if (!student?.semesters || student.semesters.length === 0) return null;

    const gradeCount = {};
    student.semesters.forEach((sem) => {
      const grade = sem.semesterGrade || "N/A";
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
    });

    const gradeColors = {
      O: "rgba(34, 197, 94, 0.8)",
      "A+": "rgba(59, 130, 246, 0.8)",
      A: "rgba(147, 51, 234, 0.8)",
      "B+": "rgba(251, 146, 60, 0.8)",
      B: "rgba(234, 179, 8, 0.8)",
      C: "rgba(239, 68, 68, 0.8)",
      "N/A": "rgba(156, 163, 175, 0.8)",
    };

    return {
      labels: Object.keys(gradeCount),
      datasets: [
        {
          label: "Semester Grades",
          data: Object.values(gradeCount),
          backgroundColor: Object.keys(gradeCount).map(
            (grade) => gradeColors[grade] || "rgba(156, 163, 175, 0.8)",
          ),
          borderColor: Object.keys(gradeCount).map(
            (grade) =>
              gradeColors[grade]?.replace("0.8", "1") ||
              "rgba(156, 163, 175, 1)",
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  const getSubjectPerformanceRadar = () => {
    if (!student?.semesters || student.semesters.length === 0) return null;

    const latestSem = student.semesters[student.semesters.length - 1];
    if (!latestSem || !latestSem.subjects) return null;

    return {
      labels: latestSem.subjects.map((sub) => sub.subjectName),
      datasets: [
        {
          label: "Theory Grade Points",
          data: latestSem.subjects.map((sub) => sub.theoryGP || 0),
          backgroundColor: "rgba(102, 126, 234, 0.2)",
          borderColor: "rgba(102, 126, 234, 1)",
          pointBackgroundColor: "rgba(102, 126, 234, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 2,
        },
        {
          label: "Practical Grade Points",
          data: latestSem.subjects.map((sub) => sub.practicalGP || 0),
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          borderColor: "rgba(249, 115, 22, 1)",
          pointBackgroundColor: "rgba(249, 115, 22, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(249, 115, 22, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  const multiYearAttendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 15,
          font: { size: 13, weight: "600" },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Multi-Year Attendance Comparison",
        font: { size: 20, weight: "bold" },
        color: "#1f2937",
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + "%",
          font: { size: 12 },
        },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  const performanceLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "SGPA Progression Across Semesters",
        font: { size: 20, weight: "bold" },
        color: "#1f2937",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { font: { size: 12 } },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 13, weight: "600" } },
      },
      title: {
        display: true,
        text: "Subject-wise Performance (Latest Semester)",
        font: { size: 18, weight: "bold" },
        color: "#1f2937",
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, font: { size: 11 } },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
      },
    },
  };

  // ========================================
  // SESSIONS RENDER FUNCTION
  // ========================================

  const renderSessions = () => {
    const now = new Date();
    const getSessionDateTime = (s) => {
      const date = new Date(s.sessionDate);
      if (s.sessionTime) {
        const [hours, minutes] = s.sessionTime.split(":").map(Number);
        date.setHours(hours, minutes, 0, 0);
      }
      return date;
    };

    const upcomingSessions = sessions
      .filter((s) => getSessionDateTime(s) >= now)
      .sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b));
    const pastSessions = sessions
      .filter((s) => getSessionDateTime(s) < now)
      .sort((a, b) => getSessionDateTime(b) - getSessionDateTime(a));

    const appliedCount = upcomingSessions.filter((s) =>
      appliedSessions.has(s._id),
    ).length;

    return (
      <div className="sessions-section">
        <div className="section-header">
          <h2>Session Notifications</h2>
          <div className="sessions-summary">
            <span className="summary-badge upcoming">
              <i className="fa-solid fa-calendar-check"></i>
              {upcomingSessions.length} Upcoming
            </span>
            <span className="summary-badge past">
              <i className="fa-solid fa-history"></i>
              {pastSessions.length} Past
            </span>
            {/* ✅ NEW: Applied count badge */}
            {appliedCount > 0 && (
              <span className="summary-badge applied-count">
                <i className="fa-solid fa-circle-check"></i>
                {appliedCount} Applied
              </span>
            )}
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-bell-slash"></i>
            <h3>No Sessions Yet</h3>
            <p>Session notifications from your faculty will appear here</p>
          </div>
        ) : (
          <>
            {upcomingSessions.length > 0 && (
              <div className="sessions-group">
                <h3 className="group-title">
                  <i className="fa-solid fa-calendar-days"></i>
                  Upcoming Sessions
                </h3>
                <div className="sessions-grid">
                  {upcomingSessions.map((session, idx) => (
                    <SessionCard
                      key={idx}
                      session={session}
                      isUpcoming={true}
                      onView={() => handleViewSession(session)}
                      isApplied={appliedSessions.has(session._id)}
                      onApply={handleApplySession}
                      onCancel={handleCancelApplication}
                      isApplying={applyingSessionId === session._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastSessions.length > 0 && (
              <div className="sessions-group">
                <h3 className="group-title">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  Past Sessions
                </h3>
                <div className="sessions-grid">
                  {pastSessions.map((session, idx) => (
                    <SessionCard
                      key={idx}
                      session={session}
                      isUpcoming={false}
                      onView={() => handleViewSession(session)}
                      isApplied={appliedSessions.has(session._id)}
                      onApply={handleApplySession}
                      onCancel={handleCancelApplication}
                      isApplying={applyingSessionId === session._id}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            onClose={handleCloseSessionDetail}
            isApplied={appliedSessions.has(selectedSession._id)}
            onApply={handleApplySession}
            onCancel={handleCancelApplication}
            isApplying={applyingSessionId === selectedSession._id}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard-wrapper">
      {/* PERSISTENT PROFILE ALERT */}
      {profileCompletion < 90 && showAlert && (
        <div className="profile-incomplete-alert">
          <div className="alert-header">
            <div className="alert-left">
              <div className="alert-icon-wrapper">
                <i className="fa-solid fa-user-circle"></i>
              </div>
              <div className="alert-content-wrapper">
                <h4>Complete Your Profile</h4>
                <p>
                  Your profile is missing key information. Complete it now to
                  unlock all features and connect with mentors.
                </p>
              </div>
            </div>
            <button
              className="alert-dismiss-btn"
              onClick={() => setShowAlert(false)}
              title="Dismiss"
              aria-label="Dismiss alert"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          <div className="alert-content">
            <div className="alert-progress-label">
              <span className="alert-progress-text">
                {profileCompletion}% Completed
              </span>
              <small className="alert-timer-hint">
                <i className="fa-solid fa-clock"></i> Auto dismiss in 10s
              </small>
            </div>
            <div className="alert-progress-bar">
              <div
                className="alert-progress-fill"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>

          <div className="alert-actions">
            <button
              className="alert-action-btn"
              onClick={() => {
                setActiveTab("profile");
                setShowFormProfile(false);
                setEditMode(true);
                setShowAlert(false);
              }}
            >
              <i className="fa-solid fa-arrow-right"></i>
              Complete Now
            </button>
          </div>
        </div>
      )}

      {/* ATTENDANCE MODAL */}
      {showAttendanceModal && (
        <div
          className="chart-modal-overlay"
          onClick={() => setShowAttendanceModal(false)}
        >
          <div
            className="chart-modal-content-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chart-modal-header">
              <h2>📊 Comprehensive Attendance Analytics</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowAttendanceModal(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="chart-modal-body">
              {(() => {
                const attendanceData = getAttendanceByYearData();
                const availableYears = Object.keys(attendanceData || {}).sort();

                return attendanceData && availableYears.length > 0 ? (
                  <>
                    {availableYears.length > 1 && (
                      <div className="chart-section">
                        <div className="chart-container-modal-large">
                          <Line
                            data={getMultiYearAttendanceData()}
                            options={multiYearAttendanceOptions}
                          />
                        </div>
                      </div>
                    )}

                    <div className="year-dropdown-container">
                      <label>
                        <i className="fa-solid fa-calendar-alt"></i>
                        Select Class Year:
                      </label>
                      <select
                        className="year-dropdown-select"
                        value={selectedAttendanceYear || ""}
                        onChange={(e) => {
                          setSelectedAttendanceYear(e.target.value);
                        }}
                      >
                        {availableYears.map((yearKey) => {
                          const yearData = attendanceData[yearKey];
                          return (
                            <option key={yearKey} value={yearKey}>
                              {yearData.year} — {yearData.academicYear} (
                              {yearData.averageAttendance}% avg)
                            </option>
                          );
                        })}
                        {["FY", "SY", "TY"].map((yearLabel) => {
                          const hasData = availableYears.some(
                            (key) => attendanceData[key].year === yearLabel,
                          );
                          if (!hasData) {
                            return (
                              <option
                                key={yearLabel}
                                value={`no-data-${yearLabel}`}
                                disabled
                              >
                                {yearLabel} — No data yet
                              </option>
                            );
                          }
                          return null;
                        })}
                      </select>

                      {selectedAttendanceYear &&
                        attendanceData[selectedAttendanceYear] && (
                          <div className="year-summary-pill">
                            <span className="pill-year">
                              {attendanceData[selectedAttendanceYear].year}
                            </span>
                            <span className="pill-avg">
                              {
                                attendanceData[selectedAttendanceYear]
                                  .averageAttendance
                              }
                              %
                            </span>
                          </div>
                        )}
                    </div>

                    {selectedAttendanceYear &&
                      attendanceData[selectedAttendanceYear] &&
                      !selectedAttendanceYear.startsWith("no-data-") && (
                        <>
                          <div className="chart-section">
                            <div className="chart-container-modal">
                              <Bar
                                data={getSingleYearAttendanceData(
                                  selectedAttendanceYear,
                                )}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { display: false },
                                    title: {
                                      display: true,
                                      text: `Monthly Breakdown - ${attendanceData[selectedAttendanceYear].year} (${attendanceData[selectedAttendanceYear].academicYear})`,
                                      font: { size: 18, weight: "bold" },
                                      color: "#1f2937",
                                    },
                                    tooltip: {
                                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                                      titleFont: { size: 14, weight: "bold" },
                                      bodyFont: { size: 13 },
                                      padding: 12,
                                      cornerRadius: 8,
                                      callbacks: {
                                        label: function (context) {
                                          const percentage = context.parsed.y;
                                          let status = "";
                                          if (percentage >= 90)
                                            status = " (Excellent ✓)";
                                          else if (percentage >= 75)
                                            status = " (Good ✓)";
                                          else status = " (Low ⚠)";
                                          return `Attendance: ${percentage}%${status}`;
                                        },
                                      },
                                    },
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      max: 100,
                                      ticks: {
                                        callback: (value) => value + "%",
                                        font: { size: 12 },
                                      },
                                      grid: { color: "rgba(0, 0, 0, 0.1)" },
                                    },
                                    x: {
                                      grid: { display: false },
                                      ticks: {
                                        font: { size: 12 },
                                        maxRotation: 0,
                                        minRotation: 0,
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          </div>

                          <div className="chart-stats-grid">
                            <div className="chart-stat-card">
                              <div
                                className="chart-stat-icon"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                }}
                              >
                                <i className="fa-solid fa-chart-line"></i>
                              </div>
                              <div className="chart-stat-info">
                                <span className="chart-stat-label">
                                  Average
                                </span>
                                <span className="chart-stat-value">
                                  {
                                    attendanceData[selectedAttendanceYear]
                                      .averageAttendance
                                  }
                                  %
                                </span>
                              </div>
                            </div>
                            <div className="chart-stat-card">
                              <div
                                className="chart-stat-icon"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                }}
                              >
                                <i className="fa-solid fa-calendar-check"></i>
                              </div>
                              <div className="chart-stat-info">
                                <span className="chart-stat-label">
                                  Months Recorded
                                </span>
                                <span className="chart-stat-value">
                                  {
                                    attendanceData[selectedAttendanceYear]
                                      .months?.length
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="chart-stat-card">
                              <div
                                className="chart-stat-icon"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                }}
                              >
                                <i className="fa-solid fa-trophy"></i>
                              </div>
                              <div className="chart-stat-info">
                                <span className="chart-stat-label">
                                  Best Month
                                </span>
                                <span className="chart-stat-value">
                                  {Math.max(
                                    ...attendanceData[
                                      selectedAttendanceYear
                                    ].months.map((m) => m.percentage),
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                  </>
                ) : (
                  <div className="empty-state">
                    <i className="fa-solid fa-calendar-xmark"></i>
                    <h3>No Attendance Data</h3>
                    <p>
                      Attendance records will appear here once added by faculty.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SEMESTER MODAL */}
      {showSemesterModal && (
        <div
          className="chart-modal-overlay"
          onClick={() => setShowSemesterModal(false)}
        >
          <div
            className="chart-modal-content-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chart-modal-header">
              <h2>📚 Comprehensive Semester Analytics</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowSemesterModal(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="chart-modal-body">
              {student?.semesters && student.semesters.length > 0 ? (
                <>
                  <div className="chart-section">
                    <div className="chart-container-modal">
                      <Line
                        data={getSemesterPerformanceLineChart()}
                        options={performanceLineOptions}
                      />
                    </div>
                  </div>

                  <div className="chart-grid-2col">
                    <div className="chart-section">
                      <div className="chart-container-modal-medium">
                        <Doughnut
                          data={getSemesterGradeDistribution()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "right",
                                labels: { padding: 15, font: { size: 13 } },
                              },
                              title: {
                                display: true,
                                text: "Grade Distribution",
                                font: { size: 18, weight: "bold" },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    {getSubjectPerformanceRadar() && (
                      <div className="chart-section">
                        <div className="chart-container-modal-medium">
                          <Radar
                            data={getSubjectPerformanceRadar()}
                            options={radarOptions}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="semester-details-table">
                    <h3>Semester-wise Performance</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Semester</th>
                          <th>Subjects</th>
                          <th>Credits</th>
                          <th>Total CG</th>
                          <th>SGPA</th>
                          <th>Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.semesters.map((sem, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{sem.semesterName}</strong>
                            </td>
                            <td>{sem.subjects?.length || 0}</td>
                            <td>{sem.totalCredits || 0}</td>
                            <td>{sem.totalCG || 0}</td>
                            <td>
                              <strong
                                style={{ color: "#667eea", fontSize: "16px" }}
                              >
                                {sem.semesterSGPA || "0.00"}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`grade-badge grade-${sem.semesterGrade?.replace("+", "plus")}`}
                              >
                                {sem.semesterGrade || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${sem.hasATKT ? "status-atkt" : "status-pass"}`}
                              >
                                {sem.hasATKT ? "ATKT" : "PASS"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="cgpa-summary">
                      <span>Overall CGPA:</span>
                      <strong>{calculateCGPA()}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <i className="fa-solid fa-file-circle-xmark"></i>
                  <h3>No Semester Data</h3>
                  <p>
                    Examination results will appear here once grades are posted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`student-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fa-solid fa-graduation-cap"></i>
            {isSidebarOpen && <span>Student Portal</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i
              className={`fa-solid fa-${isSidebarOpen ? "angles-left" : "angles-right"}`}
            ></i>
          </button>
        </div>

        <div className="sidebar-profile-inline">
          <div className="avatar-inline">
            {profileData.profilePhotoURL ? (
              <img src={profileData.profilePhotoURL} alt="Profile" />
            ) : (
              <span>{student?.name?.charAt(0) || "S"}</span>
            )}
          </div>

          {isSidebarOpen && (
            <div className="profile-text">
              <h4>{student?.name}</h4>
              <p>{student?.rollNo}</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {[
            { key: "overview", icon: "fa-chart-pie", label: "Overview" },
            {
              key: "attendance",
              icon: "fa-calendar-check",
              label: "Attendance",
            },
            {
              key: "examination",
              icon: "fa-graduation-cap",
              label: "Examination",
            },
            {
              key: "sessions",
              icon: "fa-bell",
              label: "Sessions",
              badge: unreadSessionsCount,
            },
            {
              key: "learning",
              icon: "fa-book-open-reader",
              label: "Learning Hub",
            },
            { key: "tasks", icon: "fa-list-check", label: "Tasks" },
            { key: "messages", icon: "fa-bullhorn", label: "Messages" },
            { key: "vault", icon: "fa-vault", label: "Doc Vault" },
            { key: "achievements", icon: "fa-award", label: "Achievements" },
            { key: "profile", icon: "fa-user", label: "Profile" },
          ].map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.key);
                setShowFormProfile(false);
              }}
              data-tooltip={item.label}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              {isSidebarOpen && <span>{item.label}</span>}
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="student-main-content">
        <header className="student-header">
          <div className="header-left">
            <h1>Welcome back, {student?.name?.split(" ")[0]}! 👋</h1>
            <p className="welcome-subtitle">
              {student?.batchInfo?.batchName ||
                student?.batchName ||
                "No Batch Assigned"}{" "}
              • {student?.division ? `Division ${student.division}` : ""}
            </p>
          </div>
          <div className="header-right">
            <div className="student-info-pills">
              <div className="info-pill">
                <i className="fa-solid fa-id-card"></i>
                <span>Roll: {student?.rollNo || "N/A"}</span>
              </div>
              <div className="info-pill">
                <i className="fa-solid fa-hashtag"></i>
                <span>Enroll: {student?.enrollmentNo || "N/A"}</span>
              </div>
            </div>
            <NotificationBell
              student={student}
              sessions={sessions}
              attendanceData={getAttendanceByYearData()}
            />
          </div>
        </header>

        <div className="tab-content">
          {/* FACULTY REVIEW ALERT BANNER */}
          {activeFacultyReviews.filter((r) => !sessionSubmittedIds.has(r._id))
            .length > 0 &&
            activeTab !== "facultyReview" && (
              <div
                className="faculty-review-banner"
                onClick={() => setActiveTab("facultyReview")}
              >
                <div className="frb-left">
                  <div className="frb-icon">
                    <i className="fa-solid fa-star-half-stroke"></i>
                  </div>
                  <div className="frb-text">
                    <strong>Faculty Review Open</strong>
                    <span>
                      {
                        activeFacultyReviews.filter(
                          (r) => !sessionSubmittedIds.has(r._id),
                        ).length
                      }{" "}
                      active review
                      {activeFacultyReviews.filter(
                        (r) => !sessionSubmittedIds.has(r._id),
                      ).length > 1
                        ? "s"
                        : ""}{" "}
                      waiting for your feedback
                    </span>
                  </div>
                </div>
                <div className="frb-right">
                  <span className="frb-count">
                    {activeFacultyReviews.length}
                  </span>
                  <button className="frb-btn">
                    Give Feedback <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="overview-section">
              <div className="stats-grid">
                <div
                  className="stat-card attendance-card clickable-stat-card"
                  onClick={() => setShowAttendanceModal(true)}
                >
                  <div className="stat-icon">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Overall Attendance</h3>
                    <p className="stat-value">{student?.attendance || 0}%</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${student?.attendance || 0}%` }}
                      ></div>
                    </div>
                    <small
                      className={
                        student?.attendance >= 75
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {student?.attendance >= 75
                        ? "✓ Good Standing"
                        : "⚠ Below Requirement"}
                    </small>
                    <div className="click-hint">
                      <i className="fa-solid fa-chart-bar"></i>
                      Click for detailed analytics
                    </div>
                  </div>
                </div>

                <div
                  className="stat-card semesters-card clickable-stat-card"
                  onClick={() => setShowSemesterModal(true)}
                >
                  <div className="stat-icon">
                    <i className="fa-solid fa-book-bookmark"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Semesters Completed</h3>
                    <p className="stat-value">
                      {student?.semesters?.length || 0}
                    </p>
                    <small>Academic Records</small>
                    <div className="click-hint">
                      <i className="fa-solid fa-chart-pie"></i>
                      Click for performance analytics
                    </div>
                  </div>
                </div>

                <div className="stat-card cgpa-card">
                  <div className="stat-icon">
                    <i className="fa-solid fa-trophy"></i>
                  </div>
                  <div className="stat-content">
                    <h3>CGPA</h3>
                    <p className="stat-value">{calculateCGPA()}</p>
                    <small>Cumulative Performance</small>
                  </div>
                </div>

                <div
                  className="stat-card profile-card clickable-card"
                  onClick={handleProfileCardClick}
                >
                  <div className="stat-icon">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Profile Status</h3>
                    <p className="stat-value">{profileCompletion}%</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    <small>
                      {profileCompletion === 100
                        ? "✓ Complete"
                        : "⚠ Incomplete"}
                    </small>
                  </div>
                </div>
              </div>

              {/* --- NEW SHOWCASE COMPONENT ADDED HERE --- */}
              <StudentDashboardShowcase
                sessions={sessions}
                student={student}
                setActiveTab={setActiveTab}
                appliedSessions={appliedSessions}
              />

              <div className="recent-activity-card">
                <h2>Quick Info</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Email</label>
                    <p>{student?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <p>
                      {profileData?.contact1 ||
                        student?.phone ||
                        student?.mobile ||
                        "Not Provided"}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <p className="status-active">
                      <i className="fa-solid fa-circle"></i> Active Student
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Academic Year</label>
                    <p>
                      {(() => {
                        const batchName =
                          student?.batchInfo?.batchName ||
                          student?.batchName ||
                          "";
                        if (batchName.toUpperCase().startsWith("TY"))
                          return `TY (${student?.batchInfo?.academicYear || ""})`
                            .trim()
                            .replace(/\(\)$/, "")
                            .trim();
                        if (batchName.toUpperCase().startsWith("SY"))
                          return `SY (${student?.batchInfo?.academicYear || ""})`
                            .trim()
                            .replace(/\(\)$/, "")
                            .trim();
                        if (batchName.toUpperCase().startsWith("FY"))
                          return `FY (${student?.batchInfo?.academicYear || ""})`
                            .trim()
                            .replace(/\(\)$/, "")
                            .trim();
                        return (
                          student?.batchInfo?.academicYear ||
                          student?.year ||
                          "N/A"
                        );
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === "attendance" && (
            <div className="attendance-section">
              <div className="section-header">
                <h2>Attendance Record</h2>
                <div className="attendance-summary">
                  <span className="summary-label">Overall:</span>
                  <span className="summary-value">
                    {student?.attendance || 0}%
                  </span>
                </div>
              </div>

              {(() => {
                const attendanceData = getAttendanceByYearData();
                const availableYears = Object.keys(attendanceData || {}).sort();

                return availableYears.length > 0 ? (
                  <>
                    <div className="year-dropdown-container-inline">
                      <label>
                        <i className="fa-solid fa-calendar-alt"></i>
                        Select Year:
                      </label>
                      <select
                        className="year-dropdown-select-inline"
                        value={selectedAttendanceYear || ""}
                        onChange={(e) => {
                          setSelectedAttendanceYear(e.target.value);
                        }}
                      >
                        {availableYears.map((yearKey) => {
                          const yearData = attendanceData[yearKey];
                          return (
                            <option key={yearKey} value={yearKey}>
                              {yearData.year} — {yearData.academicYear} (
                              {yearData.averageAttendance}% avg)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedAttendanceYear &&
                    attendanceData[selectedAttendanceYear] ? (
                      <div className="attendance-table-container">
                        <div
                          style={{
                            padding: "12px 16px",
                            background: "#f0f9ff",
                            borderRadius: "8px",
                            marginBottom: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                color: "#0369a1",
                              }}
                            >
                              {attendanceData[selectedAttendanceYear].year} -{" "}
                              {
                                attendanceData[selectedAttendanceYear]
                                  .academicYear
                              }
                            </h3>
                            <p
                              style={{
                                margin: "5px 0 0 0",
                                fontSize: "13px",
                                color: "#0369a1",
                              }}
                            >
                              <i className="fa-solid fa-calendar-alt"></i>{" "}
                              Academic Year Order: June to May
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#0369a1",
                              }}
                            >
                              {
                                attendanceData[selectedAttendanceYear]
                                  .averageAttendance
                              }
                              %
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              Average Attendance
                            </div>
                          </div>
                        </div>

                        <table className="attendance-table">
                          <thead>
                            <tr>
                              <th>MONTH</th>
                              <th>PERCENTAGE</th>
                              <th>STATUS</th>
                              <th>REMARK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const monthOrder = [
                                "June",
                                "July",
                                "August",
                                "September",
                                "October",
                                "November",
                                "December",
                                "January",
                                "February",
                                "March",
                                "April",
                                "May",
                              ];
                              const sortedRecords = [
                                ...attendanceData[selectedAttendanceYear]
                                  .months,
                              ].sort((a, b) => {
                                return (
                                  monthOrder.indexOf(a.month) -
                                  monthOrder.indexOf(b.month)
                                );
                              });

                              return sortedRecords.map((record, idx) => (
                                <tr key={idx}>
                                  <td className="month-cell">
                                    <i className="fa-solid fa-calendar"></i>
                                    {record.month}
                                  </td>
                                  <td className="percentage-cell">
                                    <div className="percentage-badge">
                                      {record.percentage}%
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={`status-badge ${record.percentage >= 75 ? "status-good" : "status-low"}`}
                                    >
                                      {record.percentage >= 75 ? "Good" : "Low"}
                                    </span>
                                  </td>
                                  <td className="remark-cell">
                                    {record.percentage >= 90
                                      ? "✓ Excellent"
                                      : record.percentage >= 75
                                        ? "✓ Satisfactory"
                                        : "⚠ Needs Improvement"}
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <i className="fa-solid fa-calendar-xmark"></i>
                        <h3>No Attendance Records</h3>
                        <p>Please select a year from the dropdown above.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <i className="fa-solid fa-calendar-xmark"></i>
                    <h3>No Attendance Records</h3>
                    <p>
                      Your attendance records will appear here once added by
                      your faculty.
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* EXAMINATION TAB */}
          {activeTab === "examination" && (
            <div className="examination-section">
              <div className="section-header">
                <h2>Examination Records</h2>
                <div className="cgpa-display-header">
                  <span className="cgpa-label">Overall CGPA:</span>
                  <span className="cgpa-value">{calculateCGPA()}</span>
                </div>
              </div>

              {student?.semesters && student.semesters.length > 0 ? (
                <div className="semesters-container">
                  {student.semesters.map((semester, semIdx) => (
                    <div key={semIdx} className="semester-card-enhanced">
                      <div
                        className="semester-header-clickable"
                        onClick={() => handleSemesterClick(semIdx)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="semester-info">
                          <h3>{semester.semesterName}</h3>
                          <span className="subject-count">
                            {semester.subjects?.length || 0} Subjects
                          </span>
                        </div>
                        <div className="semester-performance">
                          <div className="performance-item">
                            <span className="perf-label">SGPA</span>
                            <span className="perf-value">
                              {semester.semesterSGPA || "0.00"}
                            </span>
                          </div>
                          <div className="performance-item">
                            <span className="perf-label">Grade</span>
                            <span
                              className={`grade-badge grade-${semester.semesterGrade?.replace("+", "plus")}`}
                            >
                              {semester.semesterGrade || "N/A"}
                            </span>
                          </div>
                          <div className="performance-item">
                            <span className="perf-label">Status</span>
                            <span
                              className={`status-badge ${semester.hasATKT ? "status-atkt" : "status-pass"}`}
                            >
                              {semester.hasATKT ? "ATKT" : "PASS"}
                            </span>
                          </div>
                          <i
                            className={`fa-solid fa-chevron-${expandedSemester === semIdx ? "up" : "down"}`}
                            style={{ marginLeft: "15px", color: "#667eea" }}
                          ></i>
                        </div>
                      </div>

                      {expandedSemester === semIdx && (
                        <div className="semester-content-expanded">
                          <div className="exam-table-wrapper">
                            <table className="exam-table-ia">
                              <thead>
                                <tr>
                                  <th>SUBJECT</th>
                                  <th>INTERNAL AVG</th>
                                  <th>SEMESTER END</th>
                                  <th>THEORY TOTAL</th>
                                  <th>THEORY GRADE</th>
                                  <th>PRACTICAL</th>
                                  <th>PRAC GRADE</th>
                                  <th>THEORY CP</th>
                                  <th>PRAC CP</th>
                                  <th>TOTAL CP</th>
                                  <th>THEORY GP</th>
                                  <th>PRAC GP</th>
                                  <th>THEORY CG</th>
                                  <th>PRAC CG</th>
                                  <th>TOTAL CG</th>
                                </tr>
                              </thead>
                              <tbody>
                                {semester.subjects?.map((subject, subIdx) => (
                                  <tr
                                    key={subIdx}
                                    className={
                                      subject.theoryGrade === "ATKT" ||
                                      subject.practicalGrade === "ATKT"
                                        ? "atkt-row"
                                        : ""
                                    }
                                  >
                                    <td className="subject-name">
                                      {subject.subjectName || "-"}
                                    </td>
                                    <td>
                                      {subject.avg !== null &&
                                      subject.avg !== undefined
                                        ? subject.avg
                                        : "-"}
                                    </td>
                                    <td>
                                      {subject.semesterEnd !== null &&
                                      subject.semesterEnd !== undefined
                                        ? subject.semesterEnd
                                        : "-"}
                                    </td>
                                    <td className="theory-total-cell">
                                      {subject.theoryTotal !== null &&
                                      subject.theoryTotal !== undefined
                                        ? subject.theoryTotal
                                        : "-"}
                                    </td>
                                    <td>
                                      {subject.theoryGrade ? (
                                        <span
                                          className={`grade-badge grade-${subject.theoryGrade.replace("+", "plus")}`}
                                        >
                                          {subject.theoryGrade}
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td>
                                      {subject.practicalMarks !== null &&
                                      subject.practicalMarks !== undefined
                                        ? subject.practicalMarks
                                        : "-"}
                                    </td>
                                    <td>
                                      {subject.practicalGrade ? (
                                        <span
                                          className={`grade-badge grade-${subject.practicalGrade.replace("+", "plus")}`}
                                        >
                                          {subject.practicalGrade}
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td className="cp-cell">
                                      {subject.theoryCP || 0}
                                    </td>
                                    <td className="cp-cell">
                                      {subject.practicalCP || 0}
                                    </td>
                                    <td className="cp-cell total-cp">
                                      <strong>{subject.totalCP || 0}</strong>
                                    </td>
                                    <td className="gp-cell">
                                      {subject.theoryGP !== undefined
                                        ? subject.theoryGP
                                        : 0}
                                    </td>
                                    <td className="gp-cell">
                                      {subject.practicalGP !== undefined
                                        ? subject.practicalGP
                                        : 0}
                                    </td>
                                    <td className="cg-cell">
                                      {subject.theoryCG !== undefined
                                        ? subject.theoryCG
                                        : 0}
                                    </td>
                                    <td className="cg-cell">
                                      {subject.practicalCG !== undefined
                                        ? subject.practicalCG
                                        : 0}
                                    </td>
                                    <td className="cg-cell total-cg">
                                      <strong>
                                        {subject.totalCG !== undefined
                                          ? subject.totalCG
                                          : 0}
                                      </strong>
                                    </td>
                                  </tr>
                                ))}
                                <tr className="total-row">
                                  <td
                                    colSpan="9"
                                    style={{
                                      textAlign: "right",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Totals:
                                  </td>
                                  <td className="total-credits">
                                    <strong>
                                      {semester.totalCredits || 0}
                                    </strong>
                                  </td>
                                  <td colSpan="4">-</td>
                                  <td className="total-cg">
                                    <strong>{semester.totalCG || 0}</strong>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="calculation-info">
                            {!semester.hasATKT ? (
                              <p>
                                <strong>✓ SGPA Calculation:</strong> Total CG ÷
                                Total Credits = {semester.totalCG || 0} ÷{" "}
                                {semester.totalCredits || 0} ={" "}
                                <strong>
                                  {semester.semesterSGPA || "0.00"}
                                </strong>
                              </p>
                            ) : (
                              <p
                                style={{
                                  color: "#f44336",
                                  fontWeight: "bold",
                                  fontSize: "16px",
                                }}
                              >
                                <strong>
                                  ⚠️{" "}
                                  {(semester.atktCount || 0) >= 3
                                    ? "FAIL"
                                    : "ATKT"}{" "}
                                  - SGPA Not Calculated
                                </strong>
                                <br />
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "normal",
                                  }}
                                >
                                  {(semester.atktCount || 0) >= 3
                                    ? `Student has failed ${semester.atktCount} subjects (3+ ATKT = FAIL). Must repeat the entire semester.`
                                    : `Student has ${semester.atktCount} ATKT subject(s). SGPA will be calculated after clearing through re-examination.`}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fa-solid fa-file-circle-xmark"></i>
                  <h3>No Examination Records</h3>
                  <p>
                    Your examination results will appear here once grades are
                    posted.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === "sessions" && renderSessions()}
          {activeTab === "facultyReview" && (
            <FacultyReviewStudent
              student={student}
              onReviewSubmitted={(campaignId) => {
                sessionSubmittedIdsRef.current.add(campaignId); // ← update ref immediately
                setSessionSubmittedIds(
                  (prev) => new Set([...prev, campaignId]),
                );
                setActiveFacultyReviews((prev) =>
                  prev.filter((c) => c._id !== campaignId),
                );
              }}
            />
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-view-toggle">
                <button
                  className={`toggle-btn ${!showFormProfile ? "active" : ""}`}
                  onClick={() => setShowFormProfile(false)}
                >
                  <i className="fa-solid fa-th-large"></i>
                  Card View
                </button>
                <button
                  className={`toggle-btn ${showFormProfile ? "active" : ""}`}
                  onClick={() => setShowFormProfile(true)}
                >
                  <i className="fa-solid fa-file-alt"></i>
                  Form View
                </button>
              </div>

              {showFormProfile ? (
                <div className="profile-form-view">
                  <div className="profile-completion-card">
                    <div className="completion-header">
                      <h3>Profile Completion</h3>
                      <span
                        className={`completion-badge ${profileCompletion === 100 ? "complete" : "incomplete"}`}
                      >
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="completion-bar">
                      <div
                        className="completion-fill"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    {profileCompletion < 100 && (
                      <p className="completion-message">
                        <i className="fa-solid fa-info-circle"></i>
                        Please complete all fields to unlock full portal
                        features
                      </p>
                    )}
                  </div>

                  <div className="profile-display-card">
                    <div className="profile-display-header">
                      <div className="profile-photo-section">
                        <div className="profile-photo-large">
                          {profileData.profilePhotoURL ? (
                            <img
                              src={profileData.profilePhotoURL}
                              alt="Profile"
                            />
                          ) : (
                            <div className="photo-placeholder-large">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="student-details-table">
                        <h3>STUDENT DETAILS</h3>
                        <table className="details-table">
                          <tbody>
                            <tr>
                              <td className="label-cell">NAME:</td>
                              <td className="value-cell" colSpan="3">
                                {profileData.name || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-cell">ADDRESS:</td>
                              <td className="value-cell" colSpan="3">
                                {profileData.address || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-cell" rowSpan="2">
                                CONTACT NO.:
                              </td>
                              <td className="value-cell">
                                1. {profileData.contact1 || "-"}
                              </td>
                              <td className="label-cell">BIRTH DATE:</td>
                              <td className="value-cell">
                                {profileData.birthDate || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="value-cell">
                                2. {profileData.contact2 || "-"}
                              </td>
                              <td className="label-cell">BLOOD GROUP:</td>
                              <td className="value-cell">
                                {profileData.bloodGroup || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-cell">E-MAIL ID:</td>
                              <td className="value-cell">
                                {profileData.email || "-"}
                              </td>
                              <td className="label-cell">CATEGORY:</td>
                              <td className="value-cell">
                                {profileData.category || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-cell">AADHAAR NO.:</td>
                              <td className="value-cell" colSpan="3">
                                {profileData.aadharNo || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="label-cell">RESUME:</td>
                              <td className="value-cell" colSpan="3">
                                {profileData.resumeURL ? (
                                  <a
                                    href={profileData.resumeURL}
                                    download="Resume.pdf"
                                    className="resume-download-link"
                                  >
                                    <i className="fa-solid fa-file-pdf"></i>
                                    Download Resume
                                  </a>
                                ) : (
                                  <span style={{ color: "#94a3b8" }}>
                                    Not Uploaded
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="academic-record-section">
                      <h3>ACADEMIC RECORD</h3>
                      <table className="academic-table">
                        <thead>
                          <tr>
                            <th>Sr. No.</th>
                            <th>Qualifying Examination</th>
                            <th>SEM</th>
                            <th>Marks/Grade</th>
                            <th>Board/University</th>
                            <th>Percentage/SGPA</th>
                            <th>Year of Passing</th>
                            <th>REMARKS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1.</td>
                            <td>SSC</td>
                            <td>-</td>
                            <td>{profileData.sscMarks || "-"}</td>
                            <td>{profileData.sscBoard || "-"}</td>
                            <td>{profileData.sscPercentage || "-"}</td>
                            <td>{profileData.sscYear || "-"}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>2.</td>
                            <td>HSC</td>
                            <td>-</td>
                            <td>{profileData.hscMarks || "-"}</td>
                            <td>{profileData.hscBoard || "-"}</td>
                            <td>{profileData.hscPercentage || "-"}</td>
                            <td>{profileData.hscYear || "-"}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="parents-details-section">
                      <h3>PARENT'S DETAILS:</h3>
                      <table className="parents-table">
                        <tbody>
                          <tr>
                            <td className="label-cell">FATHER'S NAME:</td>
                            <td className="value-cell">
                              {profileData.fatherName || "-"}
                            </td>
                            <td className="label-cell">MOTHER'S NAME:</td>
                            <td className="value-cell">
                              {profileData.motherName || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-cell">OCCUPATION:</td>
                            <td className="value-cell">
                              {profileData.fatherOccupation || "-"}
                            </td>
                            <td className="label-cell">OCCUPATION:</td>
                            <td className="value-cell">
                              {profileData.motherOccupation || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-cell">CONTACT NO.:</td>
                            <td className="value-cell">
                              {profileData.fatherContact || "-"}
                            </td>
                            <td className="label-cell">CONTACT NO.:</td>
                            <td className="value-cell">
                              {profileData.motherContact || "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="hobbies-section">
                      <h3>HOBBIES</h3>
                      <table className="hobbies-table">
                        <thead>
                          <tr>
                            <th>Singing</th>
                            <th>Dance</th>
                            <th>Games</th>
                            <th>Sports</th>
                            <th>Others (if any)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{profileData.hobbies.singing ? "✓" : ""}</td>
                            <td>{profileData.hobbies.dance ? "✓" : ""}</td>
                            <td>{profileData.hobbies.games ? "✓" : ""}</td>
                            <td>{profileData.hobbies.sports ? "✓" : ""}</td>
                            <td>{profileData.hobbies.other || "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-completion-card">
                    <div className="completion-header">
                      <h3>Profile Completion</h3>
                      <span
                        className={`completion-badge ${profileCompletion === 100 ? "complete" : "incomplete"}`}
                      >
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="completion-bar">
                      <div
                        className="completion-fill"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    {profileCompletion < 100 && (
                      <p className="completion-message">
                        <i className="fa-solid fa-info-circle"></i>
                        Please complete all fields to unlock full portal
                        features
                      </p>
                    )}
                  </div>

                  {!editMode ? (
                    <div className="profile-view">
                      <div className="profile-header-section">
                        <div className="profile-photo-display">
                          {profileData.profilePhotoURL ? (
                            <img
                              src={profileData.profilePhotoURL}
                              alt="Profile"
                            />
                          ) : (
                            <div className="photo-placeholder">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="profile-basic-info">
                          <h2>{profileData.name || student?.name}</h2>
                          <p>{profileData.email || student?.email}</p>

                          {profileData.resumeURL ? (
                            <div className="resume-status">
                              <i className="fa-solid fa-check-circle"></i>
                              <a
                                href={profileData.resumeURL}
                                download="Resume.pdf"
                                className="resume-link"
                              >
                                Resume Uploaded
                              </a>
                            </div>
                          ) : (
                            <div className="resume-status missing">
                              <i className="fa-solid fa-times-circle"></i>
                              <span>No Resume Uploaded</span>
                            </div>
                          )}

                          <button
                            className="btn-edit-profile"
                            onClick={() => setEditMode(true)}
                          >
                            <i className="fa-solid fa-pen"></i>
                            Edit Profile
                          </button>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>
                          <i className="fa-solid fa-user"></i> Personal
                          Information
                        </h3>
                        <div className="details-grid">
                          <div className="detail-item">
                            <label>Full Name</label>
                            <p>{profileData.name || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Email</label>
                            <p>{profileData.email || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Contact 1</label>
                            <p>{profileData.contact1 || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Contact 2</label>
                            <p>{profileData.contact2 || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Date of Birth</label>
                            <p>{profileData.birthDate || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Blood Group</label>
                            <p>{profileData.bloodGroup || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Category</label>
                            <p>{profileData.category || "-"}</p>
                          </div>
                          <div className="detail-item">
                            <label>Aadhar Number</label>
                            <p>{profileData.aadharNo || "-"}</p>
                          </div>
                          <div className="detail-item full-width">
                            <label>Address</label>
                            <p>{profileData.address || "-"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>
                          <i className="fa-solid fa-graduation-cap"></i>{" "}
                          Academic Records
                        </h3>
                        <div className="academic-grid">
                          <div className="academic-card">
                            <h4>SSC (10th)</h4>
                            <div className="academic-details">
                              <p>
                                <strong>Board:</strong>{" "}
                                {profileData.sscBoard || "-"}
                              </p>
                              <p>
                                <strong>Marks/Grade:</strong>{" "}
                                {profileData.sscMarks || "-"}
                              </p>
                              <p>
                                <strong>Percentage:</strong>{" "}
                                {profileData.sscPercentage || "-"}%
                              </p>
                              <p>
                                <strong>Year:</strong>{" "}
                                {profileData.sscYear || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="academic-card">
                            <h4>HSC (12th)</h4>
                            <div className="academic-details">
                              <p>
                                <strong>Board:</strong>{" "}
                                {profileData.hscBoard || "-"}
                              </p>
                              <p>
                                <strong>Marks/Grade:</strong>{" "}
                                {profileData.hscMarks || "-"}
                              </p>
                              <p>
                                <strong>Percentage:</strong>{" "}
                                {profileData.hscPercentage || "-"}%
                              </p>
                              <p>
                                <strong>Year:</strong>{" "}
                                {profileData.hscYear || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>
                          <i className="fa-solid fa-users"></i> Parent Details
                        </h3>
                        <div className="parent-grid">
                          <div className="parent-card">
                            <h4>Father's Information</h4>
                            <div className="parent-details">
                              <p>
                                <strong>Name:</strong>{" "}
                                {profileData.fatherName || "-"}
                              </p>
                              <p>
                                <strong>Occupation:</strong>{" "}
                                {profileData.fatherOccupation || "-"}
                              </p>
                              <p>
                                <strong>Contact:</strong>{" "}
                                {profileData.fatherContact || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="parent-card">
                            <h4>Mother's Information</h4>
                            <div className="parent-details">
                              <p>
                                <strong>Name:</strong>{" "}
                                {profileData.motherName || "-"}
                              </p>
                              <p>
                                <strong>Occupation:</strong>{" "}
                                {profileData.motherOccupation || "-"}
                              </p>
                              <p>
                                <strong>Contact:</strong>{" "}
                                {profileData.motherContact || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>
                          <i className="fa-solid fa-heart"></i> Hobbies &
                          Interests
                        </h3>
                        <div className="hobbies-display">
                          {profileData.hobbies.singing && (
                            <span className="hobby-tag">
                              <i className="fa-solid fa-microphone"></i> Singing
                            </span>
                          )}
                          {profileData.hobbies.dance && (
                            <span className="hobby-tag">
                              <i className="fa-solid fa-music"></i> Dance
                            </span>
                          )}
                          {profileData.hobbies.games && (
                            <span className="hobby-tag">
                              <i className="fa-solid fa-gamepad"></i> Games
                            </span>
                          )}
                          {profileData.hobbies.sports && (
                            <span className="hobby-tag">
                              <i className="fa-solid fa-futbol"></i> Sports
                            </span>
                          )}
                          {profileData.hobbies.other && (
                            <span className="hobby-tag">
                              <i className="fa-solid fa-star"></i>{" "}
                              {profileData.hobbies.other}
                            </span>
                          )}
                          {!profileData.hobbies.singing &&
                            !profileData.hobbies.dance &&
                            !profileData.hobbies.games &&
                            !profileData.hobbies.sports &&
                            !profileData.hobbies.other && (
                              <p className="no-hobbies">No hobbies added yet</p>
                            )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-edit">
                      <div className="edit-header">
                        <h2>Edit Profile</h2>
                        <div className="edit-actions">
                          <button
                            className="btn-cancel"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-save"
                            onClick={handleProfileUpdate}
                          >
                            <i className="fa-solid fa-check"></i>
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>Profile Photo</h3>
                        <div className="photo-upload-section">
                          <div className="photo-preview">
                            {profileData.profilePhotoURL ? (
                              <img
                                src={profileData.profilePhotoURL}
                                alt="Preview"
                              />
                            ) : (
                              <div className="photo-placeholder">
                                <i className="fa-solid fa-user"></i>
                              </div>
                            )}
                          </div>
                          <div className="photo-upload-control">
                            <label className="upload-btn">
                              <i className="fa-solid fa-camera"></i>
                              Upload Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                hidden
                              />
                            </label>
                            <p className="upload-hint">
                              JPG, PNG or GIF (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>
                          <i className="fa-solid fa-file-pdf"></i> Resume/CV
                        </h3>
                        <div className="resume-upload-section">
                          <div className="resume-preview">
                            {profileData.resumeURL ? (
                              <div className="resume-uploaded">
                                <i className="fa-solid fa-file-pdf"></i>
                                <div className="resume-info">
                                  <p className="resume-name">Resume.pdf</p>
                                  <a
                                    href={profileData.resumeURL}
                                    download="Resume.pdf"
                                    className="resume-download"
                                  >
                                    <i className="fa-solid fa-download"></i>
                                    Download
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="resume-empty">
                                <i className="fa-solid fa-file-circle-question"></i>
                                <p>No Resume Uploaded</p>
                              </div>
                            )}
                          </div>
                          <div className="resume-upload-control">
                            <label className="upload-btn resume-upload-btn">
                              <i className="fa-solid fa-file-arrow-up"></i>
                              {profileData.resumeURL
                                ? "Replace Resume"
                                : "Upload Resume"}
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleResumeUpload}
                                hidden
                              />
                            </label>
                            <p className="upload-hint">PDF only (Max 10MB)</p>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Full Name *</label>
                            <input
                              type="text"
                              value={profileData.name || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="form-group">
                            <label>Email *</label>
                            <input
                              type="email"
                              value={profileData.email || ""}
                              readOnly
                              className="disabled-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Contact Number 1 *</label>
                            <input
                              type="tel"
                              value={profileData.contact1 || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  contact1: e.target.value,
                                })
                              }
                              placeholder="Primary contact"
                            />
                          </div>
                          <div className="form-group">
                            <label>Contact Number 2</label>
                            <input
                              type="tel"
                              value={profileData.contact2 || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  contact2: e.target.value,
                                })
                              }
                              placeholder="Secondary contact"
                            />
                          </div>
                          <div className="form-group">
                            <label>Date of Birth *</label>
                            <input
                              type="date"
                              value={profileData.birthDate || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  birthDate: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Blood Group *</label>
                            <select
                              value={profileData.bloodGroup || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  bloodGroup: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Blood Group</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Category *</label>
                            <select
                              value={profileData.category || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  category: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Category</option>
                              <option value="General">General</option>
                              <option value="OBC">OBC</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Aadhar Number *</label>
                            <input
                              type="text"
                              value={profileData.aadharNo || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  aadharNo: e.target.value,
                                })
                              }
                              placeholder="XXXX-XXXX-XXXX"
                              maxLength="12"
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>Address *</label>
                            <textarea
                              value={profileData.address || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  address: e.target.value,
                                })
                              }
                              placeholder="Enter complete address"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>Academic Records</h3>
                        <div className="academic-forms">
                          <div className="academic-form-section">
                            <h4>SSC (10th Standard)</h4>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Board/University *</label>
                                <input
                                  type="text"
                                  value={profileData.sscBoard || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      sscBoard: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., CBSE, State Board"
                                />
                              </div>
                              <div className="form-group">
                                <label>Marks/Grade *</label>
                                <input
                                  type="text"
                                  value={profileData.sscMarks || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      sscMarks: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., 450/500 or A+"
                                />
                              </div>
                              <div className="form-group">
                                <label>Percentage/CGPA *</label>
                                <input
                                  type="text"
                                  value={profileData.sscPercentage || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      sscPercentage: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., 90% or 9.5 CGPA"
                                />
                              </div>
                              <div className="form-group">
                                <label>Year of Passing *</label>
                                <input
                                  type="text"
                                  value={profileData.sscYear || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      sscYear: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., 2020"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="academic-form-section">
                            <h4>HSC (12th Standard)</h4>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Board/University *</label>
                                <input
                                  type="text"
                                  value={profileData.hscBoard || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      hscBoard: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., CBSE, State Board"
                                />
                              </div>
                              <div className="form-group">
                                <label>Marks/Grade *</label>
                                <input
                                  type="text"
                                  value={profileData.hscMarks || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      hscMarks: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., 480/500 or A+"
                                />
                              </div>
                              <div className="form-group">
                                <label>Percentage/CGPA *</label>
                                <input
                                  type="text"
                                  value={profileData.hscPercentage || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      hscPercentage: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., 85% or 8.5 CGPA"
                                />
                              </div>
                              <div className="form-group">
                                <label>Year of Passing *</label>
                                <input
                                  type="text"
                                  value={profileData.hscYear || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      hscYear: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., 2022"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>Parent Details</h3>
                        <div className="parent-forms">
                          <div className="parent-form-section">
                            <h4>Father's Information</h4>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Father's Name *</label>
                                <input
                                  type="text"
                                  value={profileData.fatherName || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      fatherName: e.target.value,
                                    })
                                  }
                                  placeholder="Enter father's full name"
                                />
                              </div>
                              <div className="form-group">
                                <label>Occupation *</label>
                                <input
                                  type="text"
                                  value={profileData.fatherOccupation || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      fatherOccupation: e.target.value,
                                    })
                                  }
                                  placeholder="Enter occupation"
                                />
                              </div>
                              <div className="form-group">
                                <label>Contact Number *</label>
                                <input
                                  type="tel"
                                  value={profileData.fatherContact || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      fatherContact: e.target.value,
                                    })
                                  }
                                  placeholder="Enter contact number"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="parent-form-section">
                            <h4>Mother's Information</h4>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Mother's Name *</label>
                                <input
                                  type="text"
                                  value={profileData.motherName || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      motherName: e.target.value,
                                    })
                                  }
                                  placeholder="Enter mother's full name"
                                />
                              </div>
                              <div className="form-group">
                                <label>Occupation *</label>
                                <input
                                  type="text"
                                  value={profileData.motherOccupation || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      motherOccupation: e.target.value,
                                    })
                                  }
                                  placeholder="Enter occupation"
                                />
                              </div>
                              <div className="form-group">
                                <label>Contact Number *</label>
                                <input
                                  type="tel"
                                  value={profileData.motherContact || ""}
                                  onChange={(e) =>
                                    setProfileData({
                                      ...profileData,
                                      motherContact: e.target.value,
                                    })
                                  }
                                  placeholder="Enter contact number"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-card">
                        <h3>Hobbies & Interests</h3>
                        <div className="hobbies-selection">
                          <label className="hobby-checkbox">
                            <input
                              type="checkbox"
                              checked={profileData.hobbies.singing || false}
                              onChange={() => handleHobbyChange("singing")}
                            />
                            <span>
                              <i className="fa-solid fa-microphone"></i> Singing
                            </span>
                          </label>
                          <label className="hobby-checkbox">
                            <input
                              type="checkbox"
                              checked={profileData.hobbies.dance || false}
                              onChange={() => handleHobbyChange("dance")}
                            />
                            <span>
                              <i className="fa-solid fa-music"></i> Dance
                            </span>
                          </label>
                          <label className="hobby-checkbox">
                            <input
                              type="checkbox"
                              checked={profileData.hobbies.games || false}
                              onChange={() => handleHobbyChange("games")}
                            />
                            <span>
                              <i className="fa-solid fa-gamepad"></i> Games
                            </span>
                          </label>
                          <label className="hobby-checkbox">
                            <input
                              type="checkbox"
                              checked={profileData.hobbies.sports || false}
                              onChange={() => handleHobbyChange("sports")}
                            />
                            <span>
                              <i className="fa-solid fa-futbol"></i> Sports
                            </span>
                          </label>
                          <div className="form-group full-width">
                            <label>Other Hobbies</label>
                            <input
                              type="text"
                              value={profileData.hobbies.other || ""}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  hobbies: {
                                    ...profileData.hobbies,
                                    other: e.target.value,
                                  },
                                })
                              }
                              placeholder="Reading, Painting, etc."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <TodoWidget studentRollNo={student?.rollNo} />
          )}

          {activeTab === "messages" && (
            <BroadcastMessages
              student={student}
              batchInfo={student?.batchInfo}
            />
          )}

          {activeTab === "vault" && (
            <DocumentVault studentRollNo={student?.rollNo} />
          )}

          {activeTab === "achievements" && (
            <CertificationsWidget studentRollNo={student?.rollNo} />
          )}
          {activeTab === "learning" && <LearningHub student={student} />}
        </div>
        <DashboardFooter
          collegeName={student?.batchInfo?.collegeName || student?.collegeName}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
