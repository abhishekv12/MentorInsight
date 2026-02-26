import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FacultyDashboard.css";
import StudentDetailExam from "../components/StudentDetailExam";
import BatchPromotion from "../components/Batchpromotion";
import SessionAttendeesModal from "../components/SessionAttendeesModal";
import FacultyBroadcastView from "./Facultybroadcastview";
import FacultyDashboardfooter from "./Facultydashboardfooter";
import Facultydashboardshowcase from "./Facultydashboardshowcase";
import Facultysharehub from "./Facultysharehub";
import "./faculty-additions.css";
import API_URL from "../config";

function FacultyDashboard() {
  // --- NAVIGATION STATE ---
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // --- DATA STATES ---
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedDepartment, setAssignedDepartment] = useState(null);

  // --- UI STATES ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- MODAL STATES ---
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // --- SESSIONS STATE ---
  const [mySessions, setMySessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSessionForAttendees, setSelectedSessionForAttendees] =
    useState(null);

  // --- SESSION FORM STATE ---
  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
    sessionDate: "",
    sessionTime: "",
    venue: "",
    targetBatch: "",
    targetDivision: "all",
    sessionType: "lecture",
    duration: "",
    isImportant: false,
  });

  // --- FORM STATES ---
  const [createClassForm, setCreateClassForm] = useState({
    batchName: "",
    academicYear: "2026-27",
    course: "",
    year: "FY",
    department: "",
  });

  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    enrollmentNo: "",
    email: "",
    phone: "",
    division: "A",
    year: "FY",
  });

  const navigate = useNavigate();

  // --- 1. FETCH DATA ---
  const fetchBatches = async (user) => {
    try {
      setLoading(true);
      const url = `${API_URL}/api/faculty/batches/${user.uid}`;
      const response = await axios.get(url);

      console.log("Fetched batches:", response.data);

      if (response.data && response.data.batches) {
        setBatches(response.data.batches);
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error("Error loading batches:", err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedDepartment = (userData) => {
    try {
      // ✅ FIXED: Priority order for finding the department
      // 1. Check userData.department (if set directly)
      // 2. Check userData.mentorId (admin-assigned department)
      // 3. Fallback to "Not Assigned"

      let departmentValue = null;

      // Try userData.department first
      if (userData.department && userData.department !== "Not Assigned") {
        departmentValue = userData.department;
      }
      // Then try userData.mentorId (but make sure it's not the person's name)
      else if (userData.mentorId && userData.mentorId !== "Not Assigned") {
        // ⚠️ SAFETY: If mentorId matches the user's name, it's wrong data
        const isSameName =
          userData.mentorId.toLowerCase() === userData.name?.toLowerCase();
        if (!isSameName) {
          departmentValue = userData.mentorId;
        }
      }

      // Fallback
      if (!departmentValue) {
        departmentValue = "Not Assigned";
      }

      console.log("📊 User Data:", userData);
      console.log("🎯 Department extracted:", departmentValue);

      setAssignedDepartment({
        name: departmentValue,
        batchName: "",
      });

      setCreateClassForm((prev) => ({
        ...prev,
        department: departmentValue,
        course: departmentValue,
      }));

      return departmentValue;
    } catch (err) {
      console.error("Error extracting department:", err);
      return "Not Assigned";
    }
  };

  // ✅ Fetch sessions for "My Sessions" view
  const fetchMySessions = async () => {
    if (!currentUser) return;
    setSessionsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/faculty/sessions/${currentUser.uid}`,
      );
      if (res.data.success) {
        setMySessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await axios.post(`${API_URL}/api/users`, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            role: "faculty",
          });

          const userResponse = await axios.get(
            `${API_URL}/api/users/${user.uid}`,
          );
          const userData = userResponse.data;
          console.log("👤 Full User Data:", userData);

          if (!userData.mentorId && !userData.department) {
            const emailRes = await axios.get(
              `${API_URL}/api/users/check-email/${user.email}`,
            );
            if (emailRes.data.exists && emailRes.data.mentorId) {
              userData.mentorId = emailRes.data.mentorId;
              userData.collegeName = emailRes.data.collegeName;
            }
          }

          fetchAssignedDepartment(userData);

          setCurrentUser({
            ...user,
            collegeName: userData.collegeName,
            department: userData.mentorId || userData.department,
          });

          fetchBatches(user);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setCurrentUser(user);
          fetchBatches(user);
        }
      } else {
        navigate("/login/faculty");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Load sessions whenever the sessionsList view becomes active
  useEffect(() => {
    if (currentView === "sessionsList" && currentUser) {
      fetchMySessions();
    }
  }, [currentView, currentUser]);

  // --- 2. LOGIC HELPERS ---

  const getDivisions = (batch) => {
    if (!batch || !batch.students) return [];
    const remainingStudents = getRemainingStudents(batch);
    const divisions = [
      ...new Set(remainingStudents.map((s) => s.division).filter((d) => d)),
    ];
    return divisions.sort();
  };

  const getStudentsByDivision = (batch, division) => {
    if (!batch || !batch.students) return [];
    const remainingStudents = getRemainingStudents(batch);
    return remainingStudents.filter((s) => s.division === division);
  };

  const getFilteredStudents = (students) => {
    if (!students) return [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return students.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
          (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(q)),
      );
    }
    return students;
  };

  const getRemainingStudents = (batch) => {
    if (!batch?.students) return [];
    const promotedIds = new Set(batch.promotedStudentIds || []);
    if (promotedIds.size === 0) return batch.students;
    return batch.students.filter((s) => !promotedIds.has(s._id?.toString()));
  };

  const getRemainingCount = (batch) => getRemainingStudents(batch).length;

  const getPromotableBatches = () => {
    return batches.filter(
      (b) =>
        (b.year === "FY" || b.year === "SY" || b.year === "TY") &&
        getRemainingCount(b) > 0 &&
        b.status !== "Retained" &&
        b.status !== "Completed",
    );
  };

  // --- 3. HANDLERS ---
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-theme");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/");
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();

    if (
      !createClassForm.department ||
      createClassForm.department === "Not Assigned"
    ) {
      alert(
        "⚠️ You need to be assigned to a department before creating a class. Please contact your administrator.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/faculty/create-batch`, {
          batchName: createClassForm.batchName,
          academicYear: createClassForm.academicYear,
          course: createClassForm.course,
          year: createClassForm.year,
          department: createClassForm.department,
          uid: currentUser.uid,
          facultyName: currentUser.displayName || currentUser.email,
          facultyEmail: currentUser.email,
          collegeName: currentUser.collegeName || "Default College",
        },
      );

      console.log("✅ Batch created successfully:", response.data);

      await fetchBatches(currentUser);
      setShowCreateClassModal(false);
      setCreateClassForm({
        batchName: "",
        academicYear: "2026-27",
        course: currentUser.department,
        year: "FY",
        department: currentUser.department,
      });

      alert(`✅ Class ${createClassForm.batchName} created successfully!`);
    } catch (err) {
      console.error("Error creating class:", err);
      alert(
        "Error creating class: " + (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/faculty/batch/${selectedBatch.id}/add-student`,
        {
          name: newStudent.name,
          rollNo: newStudent.rollNo,
          enrollmentNo: newStudent.enrollmentNo,
          email: newStudent.email,
          phone: newStudent.phone,
          division: newStudent.division,
          year: newStudent.year,
        },
      );

      console.log("✅ Student added successfully:", response.data);

      const batchResponse = await axios.get(
        `${API_URL}/api/faculty/batch/${selectedBatch.id}`,
      );
      const updatedBatch = batchResponse.data;

      setBatches((prev) =>
        prev.map((b) => (b.id === selectedBatch.id ? updatedBatch : b)),
      );
      setSelectedBatch(updatedBatch);
      setNewStudent({
        name: "",
        rollNo: "",
        enrollmentNo: "",
        email: "",
        phone: "",
        division: "A",
        year: selectedBatch.year,
      });

      setShowAddStudentModal(false);
      alert(`✅ Student ${newStudent.name} added successfully!`);
    } catch (err) {
      console.error("Error adding student:", err);
      alert(
        "Error adding student: " + (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Session Send
  const handleSendSession = async (e) => {
    e.preventDefault();

    if (!sessionForm.targetBatch) {
      alert("⚠️ Please select a target batch");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/faculty/send-session`, {
          ...sessionForm,
          facultyUid: currentUser.uid,
          facultyName: currentUser.displayName || currentUser.email,
          facultyEmail: currentUser.email,
          collegeName: currentUser.collegeName,
        },
      );

      console.log("✅ Session sent successfully:", response.data);

      setShowSessionModal(false);
      setSessionForm({
        title: "",
        description: "",
        sessionDate: "",
        sessionTime: "",
        venue: "",
        targetBatch: "",
        targetDivision: "all",
        sessionType: "lecture",
        duration: "",
        isImportant: false,
      });

      alert(
        `✅ Session notification sent successfully to ${response.data.recipientCount} students!`,
      );
    } catch (err) {
      console.error("Error sending session:", err);
      alert(
        "Error sending session: " + (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setCurrentView("batchDetails");
  };

  const handleDivisionClick = (division) => {
    setSelectedDivision(division);
    setCurrentView("divisionView");
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setCurrentView("studentDetail");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedBatch(null);
    setSelectedDivision(null);
    setSelectedStudent(null);
  };

  const handleBackToBatch = () => {
    setCurrentView("batchDetails");
    setSelectedDivision(null);
    setSelectedStudent(null);
  };

  const handleBackToDivision = () => {
    setCurrentView("divisionView");
    setSelectedStudent(null);
  };

  const handlePromotionComplete = async () => {
    setShowPromotionModal(false);
    await fetchBatches(currentUser);
  };

  const handleOpenPromoteModal = () => {
    const promotable = getPromotableBatches();
    if (promotable.length === 0) {
      alert(
        "No eligible batches for promotion.\n\nOnly FY, SY or TY batches with students can be promoted.",
      );
      return;
    }
    setShowPromotionModal(true);
  };

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      setLoading(true);

      await axios.put(
        `${API_URL}/api/faculty/batch/${selectedBatch.id}/student/${updatedStudent._id || selectedStudent._id}`,
        updatedStudent,
      );

      const batchResponse = await axios.get(
        `${API_URL}/api/faculty/batch/${selectedBatch.id}`,
      );
      const refreshedBatch = batchResponse.data;

      setBatches((prev) =>
        prev.map((b) => (b.id === selectedBatch.id ? refreshedBatch : b)),
      );
      setSelectedBatch(refreshedBatch);

      const freshStudent = refreshedBatch.students.find(
        (s) => s._id === (updatedStudent._id || selectedStudent._id),
      );
      setSelectedStudent(freshStudent);

      console.log("✅ Student updated successfully");
    } catch (err) {
      console.error("Error updating student:", err);
      alert(
        "Error updating student: " + (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 4. RENDER FUNCTIONS ---
  const renderDashboard = () => {
    const promotableBatches = getPromotableBatches();

    return (
      <>
        {/* --- HEADER SECTION --- */}
        <div className="page-header-modern">
          <div className="header-content">
            <h1 className="page-title">Your Classes</h1>
            <p className="page-subtitle">
              {assignedDepartment && assignedDepartment.name !== "Not Assigned"
                ? `Department: ${assignedDepartment.name}`
                : "⚠️ Not assigned to a department - Contact your administrator"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {promotableBatches.length > 0 && (
              <button
                className="btn-create-primary"
                onClick={handleOpenPromoteModal}
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                }}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <span>
                  Promote Batch
                  {promotableBatches.length > 1 && (
                    <span
                      style={{
                        marginLeft: "6px",
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: "10px",
                        padding: "1px 7px",
                        fontSize: "12px",
                      }}
                    >
                      {promotableBatches.length}
                    </span>
                  )}
                </span>
              </button>
            )}

            <button
              className="btn-create-primary"
              onClick={() => setShowCreateClassModal(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Create Class</span>
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT LOGIC --- */}
        {loading ? (
          // 1. LOADING STATE
          <div className="skeleton-grid">
            <div className="sk-card"></div>
            <div className="sk-card"></div>
            <div className="sk-card"></div>
          </div>
        ) : batches.length === 0 ? (
          // 2. EMPTY STATE
          <div className="empty-state-ultra">
            <div className="empty-visual">
              <div className="empty-icon-orbit">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
            </div>
            <h2>No Classes Yet</h2>
            {assignedDepartment &&
            assignedDepartment.name !== "Not Assigned" ? (
              <>
                <p>Get started by creating your first batch class</p>
                <button
                  className="btn-create-large"
                  onClick={() => setShowCreateClassModal(true)}
                >
                  <i className="fa-solid fa-sparkles"></i>
                  Create Your First Class
                </button>
              </>
            ) : (
              <>
                <p>You need to be assigned to a department first</p>
                <small
                  style={{
                    color: "#64748b",
                    marginTop: "10px",
                    display: "block",
                  }}
                >
                  Please contact your administrator to assign you to a
                  department
                </small>
              </>
            )}
          </div>
        ) : (
          // 3. SUCCESS STATE (Grid + Showcase)
          // We wrap both components in a Fragment <> so they are treated as one block
          <>
            <div className="classes-grid">
              {batches.map((batch) => {
                const remainingCount = getRemainingCount(batch);
                return (
                  <div
                    key={batch.id}
                    className="class-card-modern"
                    onClick={() => handleBatchClick(batch)}
                  >
                    <div className="card-header-strip">
                      <span className="year-badge">{batch.year}</span>
                      <span
                        className={`status-dot ${
                          batch.status === "Retained"
                            ? "retained"
                            : batch.status === "Completed"
                              ? "completed"
                              : "active"
                        }`}
                      ></span>
                    </div>

                    <div className="card-content">
                      <h3 className="batch-name">{batch.batchName}</h3>
                      <p className="batch-course">{batch.course}</p>
                      <p className="batch-dept">{batch.department}</p>
                    </div>

                    <div className="card-footer-meta">
                      <div className="meta-item">
                        <i className="fa-solid fa-calendar-days"></i>
                        <span>AY {batch.academicYear}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fa-solid fa-users"></i>
                        <span>
                          {remainingCount} Student
                          {remainingCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="card-hover-overlay">
                      <span className="hover-text">View Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Showcase Component is now correctly inside the else block */}
            <Facultydashboardshowcase
              batches={batches}
              mySessions={mySessions}
              currentUser={currentUser}
            />
          </>
        )}
      </>
    );
  };

  const renderBatchDetails = () => {
    if (!selectedBatch) return null;

    const divisions = getDivisions(selectedBatch);
    const allStudents = selectedBatch.students || [];
    const remainingStudents = getRemainingStudents(selectedBatch);
    const totalStudents = remainingStudents.length;
    const promotedCount = allStudents.length - totalStudents;

    return (
      <>
        <div className="breadcrumb-nav">
          <button onClick={handleBackToDashboard} className="breadcrumb-item">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="batch-hero">
          <div className="batch-hero-content">
            <div className="batch-badge-large">
              <span className="batch-year-lg">{selectedBatch.year}</span>
              <span className="batch-name-lg">{selectedBatch.batchName}</span>
            </div>
            <h1 className="batch-title">{selectedBatch.course}</h1>
            <p className="batch-meta-info">
              {selectedBatch.department} • AY {selectedBatch.academicYear}
            </p>
          </div>

          <div className="batch-stats-pills">
            <div className="stat-pill">
              <i className="fa-solid fa-user-graduate"></i>
              <span className="stat-value">{totalStudents}</span>
              <span className="stat-label">Active Students</span>
            </div>
            <div className="stat-pill">
              <i className="fa-solid fa-layer-group"></i>
              <span className="stat-value">{divisions.length}</span>
              <span className="stat-label">Divisions</span>
            </div>
            {promotedCount > 0 && (
              <div
                className="stat-pill"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <i
                  className="fa-solid fa-graduation-cap"
                  style={{ color: "#10b981" }}
                ></i>
                <span className="stat-value" style={{ color: "#10b981" }}>
                  {promotedCount}
                </span>
                <span className="stat-label">Promoted</span>
              </div>
            )}
          </div>
        </div>

        {totalStudents === 0 ? (
          <div className="empty-state-students">
            <div className="empty-icon-circle">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <h3>No Active Students</h3>
            {promotedCount > 0 ? (
              <p>
                All {promotedCount} students have been promoted. Add new
                students to continue.
              </p>
            ) : (
              <p>Start building your class roster by adding students</p>
            )}
            <button
              className="btn-add-student"
              onClick={() => setShowAddStudentModal(true)}
            >
              <i className="fa-solid fa-plus"></i>
              Add Student
            </button>
          </div>
        ) : (
          <>
            <div className="section-header-with-action">
              <h2 className="section-title">Divisions</h2>
              <button
                className="btn-add-student-small"
                onClick={() => setShowAddStudentModal(true)}
              >
                <i className="fa-solid fa-plus"></i>
                Add Student
              </button>
            </div>

            <div className="divisions-grid">
              {divisions.map((division) => {
                const divStudents = getStudentsByDivision(
                  selectedBatch,
                  division,
                );
                return (
                  <div
                    key={division}
                    className="division-card"
                    onClick={() => handleDivisionClick(division)}
                  >
                    <div className="division-header">
                      <div className="division-badge">
                        <span className="division-letter">{division}</span>
                      </div>
                      <span className="division-label">
                        Division {division}
                      </span>
                    </div>

                    <div className="division-stats">
                      <div className="div-stat">
                        <span className="div-stat-value">
                          {divStudents.length}
                        </span>
                        <span className="div-stat-label">Students</span>
                      </div>
                      <div className="div-stat">
                        <span className="div-stat-value">
                          {Math.round(
                            divStudents.reduce(
                              (acc, s) => acc + (s.attendance || 0),
                              0,
                            ) / divStudents.length,
                          ) || 0}
                          %
                        </span>
                        <span className="div-stat-label">Avg. Attendance</span>
                      </div>
                    </div>

                    <div className="division-footer">
                      <span className="view-link">View Students →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  };

  const renderDivisionView = () => {
    if (!selectedBatch || !selectedDivision) return null;

    const allDivStudents = getStudentsByDivision(
      selectedBatch,
      selectedDivision,
    );
    const promotedIds = new Set(selectedBatch.promotedStudentIds || []);
    const students = allDivStudents.filter(
      (s) => !promotedIds.has(s._id?.toString()),
    );
    const filteredStudents = getFilteredStudents(students);

    return (
      <>
        <div className="breadcrumb-nav">
          <button onClick={handleBackToBatch} className="breadcrumb-item">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to {selectedBatch.batchName}</span>
          </button>
        </div>

        <div className="division-header-section">
          <div className="division-title-area">
            <div className="division-badge-hero">
              <span className="division-letter-hero">{selectedDivision}</span>
            </div>
            <div>
              <h1 className="division-page-title">
                Division {selectedDivision}
              </h1>
              <p className="division-page-subtitle">
                {selectedBatch.batchName} • {selectedBatch.course} •{" "}
                {students.length} Student{students.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="search-bar-modern">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search students by name, roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="students-table-card">
          <table className="students-table">
            <thead>
              <tr>
                <th>ROLL NO</th>
                <th>STUDENT</th>
                <th>ENROLLMENT NO</th>
                <th>DIVISION</th>
                <th>ATTENDANCE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student._id || student.id}
                    onClick={() => handleStudentClick(student)}
                    className="student-row"
                  >
                    <td className="font-mono">{student.rollNo}</td>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.name?.charAt(0) || "?"}
                        </div>
                        <div className="student-info">
                          <span className="student-name">{student.name}</span>
                          <span className="student-email">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono">{student.enrollmentNo}</td>
                    <td>
                      <span className="division-mini-badge">
                        {student.division}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-progress">
                        <div className="progress-bar-modern">
                          <div
                            className="progress-fill"
                            style={{ width: `${student.attendance}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${student.status?.toLowerCase()}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <i className="fa-solid fa-chevron-right row-arrow"></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-row">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderStudentDetail = () => {
    if (!selectedStudent || !selectedBatch) return null;

    return (
      <StudentDetailExam
        student={selectedStudent}
        batch={selectedBatch}
        onBack={handleBackToDivision}
        onUpdate={handleUpdateStudent}
        sessions={mySessions}
      />
    );
  };

  // ✅ Render Session Sending View
  const renderSessionSending = () => {
    return (
      <>
        <div className="page-header-modern">
          <div className="header-content">
            <h1 className="page-title">Send Session Notification</h1>
            <p className="page-subtitle">
              Schedule and notify students about upcoming sessions
            </p>
          </div>
        </div>

        <div className="session-form-container">
          <form onSubmit={handleSendSession} className="session-form-card">
            <div className="form-section">
              <h3 className="form-section-title">Session Details</h3>

              <div className="input-group">
                <label>Session Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures Lecture"
                  value={sessionForm.title}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  placeholder="Session description, topics to be covered..."
                  value={sessionForm.description}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      description: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "2px solid var(--border)",
                    background: "var(--bg-app)",
                    fontFamily: "var(--font-primary)",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="row">
                <div className="input-group">
                  <label>Session Type</label>
                  <select
                    value={sessionForm.sessionType}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        sessionType: e.target.value,
                      })
                    }
                  >
                    <option value="lecture">Lecture</option>
                    <option value="practical">Practical</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="exam">Examination</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    placeholder="60"
                    value={sessionForm.duration}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="input-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={sessionForm.sessionDate}
                    min={new Date().toISOString().split("T")[0]} // ✅ blocks past dates
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        sessionDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={sessionForm.sessionTime}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        sessionTime: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Venue</label>
                <input
                  type="text"
                  placeholder="e.g., Room 301, Lab 2"
                  value={sessionForm.venue}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, venue: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Target Audience</h3>

              <div className="input-group">
                <label>Select Batch *</label>
                <select
                  value={sessionForm.targetBatch}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      targetBatch: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchName} ({batch.year} - {batch.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Division</label>
                <select
                  value={sessionForm.targetDivision}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      targetDivision: e.target.value,
                    })
                  }
                >
                  <option value="all">All Divisions</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                  <option value="D">Division D</option>
                </select>
              </div>

              <div className="input-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sessionForm.isImportant}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        isImportant: e.target.checked,
                      })
                    }
                    style={{ width: "auto", cursor: "pointer" }}
                  />
                  <span>Mark as Important</span>
                </label>
                <small className="input-hint">
                  Important sessions will be highlighted in student
                  notifications
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView("dashboard")}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-paper-plane"></i>
                Send Notification
              </button>
            </div>
          </form>
        </div>
      </>
    );
  };

  // ✅ Render My Sessions List View
  const renderSessionsList = () => {
    const now = new Date();
    const getSessionDateTime = (s) => {
      const date = new Date(s.sessionDate);
      if (s.sessionTime) {
        const [hours, minutes] = s.sessionTime.split(":").map(Number);
        date.setHours(hours, minutes, 0, 0);
      }
      return date;
    };

    const upcoming = mySessions
      .filter((s) => getSessionDateTime(s) >= now)
      .sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b));
    const past = mySessions
      .filter((s) => getSessionDateTime(s) < now)
      .sort((a, b) => getSessionDateTime(b) - getSessionDateTime(a));

    const typeIcons = {
      lecture: "book",
      practical: "flask",
      tutorial: "chalkboard-user",
      seminar: "users",
      workshop: "hammer",
      exam: "file-pen",
      other: "circle-info",
    };

    const SessionRow = ({ session }) => {
      const date = new Date(session.sessionDate);
      return (
        <div className="session-card-faculty">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              {session.isImportant && (
                <span
                  style={{
                    background: "#fef2f2",
                    color: "#ef4444",
                    border: "1px solid #fca5a5",
                    borderRadius: "12px",
                    padding: "2px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  IMPORTANT
                </span>
              )}
              <span
                style={{
                  background: "#f0f4ff",
                  color: "#667eea",
                  border: "1px solid #c7d2fe",
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                <i
                  className={`fa-solid fa-${typeIcons[session.sessionType] || "calendar"}`}
                  style={{ marginRight: "4px" }}
                ></i>
                {session.sessionType.charAt(0).toUpperCase() +
                  session.sessionType.slice(1)}
              </span>
            </div>
            <h4
              style={{ margin: "0 0 4px", fontSize: "15px", color: "#1f2937" }}
            >
              {session.title}
            </h4>
            <div
              style={{
                display: "flex",
                gap: "16px",
                fontSize: "13px",
                color: "#64748b",
                flexWrap: "wrap",
              }}
            >
              <span>
                <i
                  className="fa-solid fa-calendar"
                  style={{ marginRight: "4px" }}
                ></i>
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {session.sessionTime && (
                <span>
                  <i
                    className="fa-solid fa-clock"
                    style={{ marginRight: "4px" }}
                  ></i>
                  {session.sessionTime}
                </span>
              )}
              {session.venue && (
                <span>
                  <i
                    className="fa-solid fa-location-dot"
                    style={{ marginRight: "4px" }}
                  ></i>
                  {session.venue}
                </span>
              )}
              <span>
                <i
                  className="fa-solid fa-users"
                  style={{ marginRight: "4px" }}
                ></i>
                {session.targetBatchName}
                {session.targetDivision && session.targetDivision !== "all"
                  ? ` · Div ${session.targetDivision}`
                  : " · All Divisions"}
              </span>
            </div>
          </div>

          {/* Attendee count pill — click to open modal */}
          <div
            className="attendee-count-pill"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSessionForAttendees(session);
            }}
            title="View attendees"
          >
            <i className="fa-solid fa-user-check"></i>
            {session.attendees?.length || 0} / {session.sentToCount || 0}
            <i
              className="fa-solid fa-chevron-right"
              style={{ fontSize: "11px" }}
            ></i>
          </div>
        </div>
      );
    };

    return (
      <>
        <div className="page-header-modern">
          <div className="header-content">
            <h1 className="page-title">My Sessions</h1>
            <p className="page-subtitle">
              Track student applications and manage your session notifications
            </p>
          </div>
          <button
            className="btn-create-primary"
            onClick={() => setCurrentView("sessionSending")}
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Session</span>
          </button>
        </div>

        {sessionsLoading ? (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}
          >
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{ fontSize: "32px" }}
            ></i>
            <p>Loading sessions...</p>
          </div>
        ) : mySessions.length === 0 ? (
          <div className="empty-state-ultra">
            <div className="empty-visual">
              <div className="empty-icon-orbit">
                <i className="fa-solid fa-bell-slash"></i>
              </div>
            </div>
            <h2>No Sessions Yet</h2>
            <p>Send your first session notification to students</p>
            <button
              className="btn-create-large"
              onClick={() => setCurrentView("sessionSending")}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Send Session
            </button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "12px",
                  }}
                >
                  <i
                    className="fa-solid fa-calendar-days"
                    style={{ marginRight: "8px", color: "#667eea" }}
                  ></i>
                  Upcoming ({upcoming.length})
                </h3>
                {upcoming.map((s) => (
                  <SessionRow key={s._id} session={s} />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "12px",
                  }}
                >
                  <i
                    className="fa-solid fa-clock-rotate-left"
                    style={{ marginRight: "8px", color: "#94a3b8" }}
                  ></i>
                  Past ({past.length})
                </h3>
                {past.map((s) => (
                  <SessionRow key={s._id} session={s} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Attendees Modal */}
        {selectedSessionForAttendees && (
          <SessionAttendeesModal
            session={selectedSessionForAttendees}
            facultyUid={currentUser?.uid}
            onClose={() => setSelectedSessionForAttendees(null)}
          />
        )}
      </>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  return (
    <div
      className={`os-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${
        darkMode ? "dark-theme" : ""
      }`}
    >
      {/* --- SIDEBAR --- */}
      <aside className="os-sidebar">
        <div className="logo-area">
          <div className="logo-icon">
            <i className="fa-solid fa-shapes"></i>
          </div>
          <span className="logo-text">
            Faculty<strong>OS</strong>
          </span>
        </div>

        <nav className="os-nav">
          {/* Dashboard */}
          <a
            href="#"
            className={`nav-item ${
              [
                "dashboard",
                "batchDetails",
                "divisionView",
                "studentDetail",
              ].includes(currentView)
                ? "active"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentView("dashboard");
            }}
          >
            <i className="fa-solid fa-grip"></i> Dashboard
          </a>
          {/* Send Session */}
          <a
            href="#"
            className={`nav-item ${currentView === "sessionSending" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentView("sessionSending");
            }}
          >
            <i className="fa-solid fa-bell"></i> Send Session
          </a>

          {/* ✅ My Sessions — NEW nav item */}
          <a
            href="#"
            className={`nav-item ${currentView === "sessionsList" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentView("sessionsList");
            }}
          >
            <i className="fa-solid fa-list-check"></i> My Sessions
          </a>
          <a
            href="#"
            className={`nav-item ${currentView === "broadcastView" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentView("broadcastView");
            }}
          >
            <i className="fa-solid fa-bullhorn"></i> Broadcast
          </a>
          <a
            href="#"
            className={`nav-item ${currentView === "shareHub" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentView("shareHub");
            }}
          >
            <i className="fa-solid fa-share-nodes"></i> Share Resources
          </a>
          <a href="#" className="nav-item">
            <i className="fa-solid fa-clipboard-check"></i> Onboarding
          </a>
          <a href="#" className="nav-item">
            <i className="fa-solid fa-calendar-days"></i> Appointments
          </a>

          <a href="#" className="nav-item">
            <i className="fa-solid fa-graduation-cap"></i> Training
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="os-main">
        {/* HEADER */}
        <header className="os-header">
          <div className="header-left">
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
          </div>
          <div className="header-right">
            <button className="icon-btn" onClick={toggleDarkMode}>
              {darkMode ? (
                <i className="fa-solid fa-sun"></i>
              ) : (
                <i className="fa-solid fa-moon"></i>
              )}
            </button>
            <div className="profile-pill">
              <div className="avatar">
                {currentUser?.displayName?.charAt(0) || "F"}
              </div>
              <div className="meta">
                <span className="name">
                  {currentUser?.displayName?.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="content-wrapper">
          {currentView === "dashboard" && renderDashboard()}
          {currentView === "batchDetails" && renderBatchDetails()}
          {currentView === "divisionView" && renderDivisionView()}
          {currentView === "studentDetail" && renderStudentDetail()}
          {currentView === "sessionSending" && renderSessionSending()}
          {/* ✅ My Sessions view wired in */}
          {currentView === "sessionsList" && renderSessionsList()}
          {currentView === "broadcastView" && (
            <FacultyBroadcastView
              currentUser={currentUser}
              batches={batches}
              onBack={() => setCurrentView("dashboard")}
            />
          )}
          {currentView === "shareHub" && (
            <Facultysharehub
              currentUser={currentUser}
              batches={batches}
              onBack={() => setCurrentView("dashboard")}
            />
          )}
        </div>

        {/* ✅ FOOTER ADDED HERE (After content-wrapper, Inside os-main) */}
        <FacultyDashboardfooter
          currentUser={currentUser}
          assignedDepartment={assignedDepartment}
        />
      </main>

      {/* --- MODALS --- */}

      {/* CREATE CLASS MODAL */}
      {showCreateClassModal && (
        <div className="modal-backdrop">
          <div className="modal-glass">
            <div className="modal-header">
              <h2>Create New Class</h2>
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="close-btn"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="modal-body">
                {(!createClassForm.department ||
                  createClassForm.department === "Not Assigned") && (
                  <div
                    style={{
                      padding: "15px",
                      background: "#fef2f2",
                      border: "2px solid #ef4444",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      color: "#991b1b",
                    }}
                  >
                    <strong>⚠️ Warning:</strong> You are not assigned to a
                    department. Please contact your administrator before
                    creating a class.
                  </div>
                )}

                <div className="input-group">
                  <label>Batch Name</label>
                  <input
                    type="text"
                    value={createClassForm.batchName}
                    onChange={(e) =>
                      setCreateClassForm({
                        ...createClassForm,
                        batchName: e.target.value,
                      })
                    }
                    placeholder="e.g. FYCS"
                    required
                  />
                </div>

                <div className="row">
                  <div className="input-group">
                    <label>Academic Year</label>
                    <select
                      value={createClassForm.academicYear}
                      onChange={(e) =>
                        setCreateClassForm({
                          ...createClassForm,
                          academicYear: e.target.value,
                        })
                      }
                    >
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27</option>
                      <option value="2027-28">2027-28</option>
                      <option value="2028-29">2028-29</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Year / Semester</label>
                    <select
                      value={createClassForm.year}
                      onChange={(e) =>
                        setCreateClassForm({
                          ...createClassForm,
                          year: e.target.value,
                        })
                      }
                    >
                      <option value="FY">FY (First Year)</option>
                      <option value="SY">SY (Second Year)</option>
                      <option value="TY">TY (Third Year)</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Course / Program</label>
                  <input
                    type="text"
                    value={createClassForm.course}
                    onChange={(e) =>
                      setCreateClassForm({
                        ...createClassForm,
                        course: e.target.value,
                      })
                    }
                    placeholder="e.g. Computer Science or IT"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={createClassForm.department}
                    style={{
                      background:
                        createClassForm.department === "Not Assigned"
                          ? "#fee2e2"
                          : "#f8fafc",
                    }}
                    disabled
                  />
                  <small className="input-hint">
                    {createClassForm.department === "Not Assigned"
                      ? "⚠️ Not assigned - Contact administrator"
                      : "Auto-filled from your faculty profile"}
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowCreateClassModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && selectedBatch && (
        <div className="modal-backdrop">
          <div className="modal-glass modal-large">
            <div className="modal-header">
              <h2>Add Student to {selectedBatch.batchName}</h2>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="close-btn"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    required
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                  />
                </div>

                <div className="row">
                  <div className="input-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 01"
                      required
                      value={newStudent.rollNo}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, rollNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Enrollment Number</label>
                    <input
                      type="text"
                      placeholder="e.g. EN2024001"
                      required
                      value={newStudent.enrollmentNo}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          enrollmentNo: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="student@college.edu"
                      required
                      value={newStudent.email}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      required
                      value={newStudent.phone}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="input-group">
                    <label>Division</label>
                    <select
                      value={newStudent.division}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          division: e.target.value,
                        })
                      }
                    >
                      <option value="A">Division A</option>
                      <option value="B">Division B</option>
                      <option value="C">Division C</option>
                      <option value="D">Division D</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Year / Semester</label>
                    <input type="text" value={selectedBatch.year} disabled />
                    <small className="input-hint">
                      Auto-selected from batch
                    </small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAddStudentModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH PROMOTION MODAL */}
      {showPromotionModal && (
        <BatchPromotion
          batches={batches}
          onClose={() => setShowPromotionModal(false)}
          onPromotionComplete={handlePromotionComplete}
        />
      )}
    </div>
  );
}

export default FacultyDashboard;

