import React, { useState, useEffect } from "react";
import "./StudentDetailExam.css";
import StudentProfileForm from "./StudentProfileForm";
import StudentInsightPanel from "./StudentInsightPanel";
import API_URL from "/src/config";

const StudentDetailExam = ({ student, batch, onBack, onUpdate, sessions }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [editingSemester, setEditingSemester] = useState(null);
  const [editedSubjects, setEditedSubjects] = useState([]);

  // ========================================
  // STUDENT DETAIL TAB - Profile Data
  // ========================================

  const [studentUserData, setStudentUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  useEffect(() => {
    if (activeTab === "studentDetail" && !profileFetched && student?.email) {
      fetchStudentProfile();
    }
  }, [activeTab]);

  const fetchStudentProfile = async () => {
    setProfileLoading(true);
    try {
      // Step 1: check-email to get uid — FULL URL required
      const checkRes = await fetch(
        `${API_URL}/api/users/check-email/${encodeURIComponent(student.email)}`,
      );

      if (!checkRes.ok) throw new Error("Email not found");
      const checkData = await checkRes.json();
      const uid = checkData.uid;

      if (!uid) throw new Error("No UID returned");

      // Step 2: fetch user document by uid — FULL URL required
      const userRes = await fetch(`${API_URL}/api/users/${uid}`);
      if (!userRes.ok) throw new Error("User not found");
      const userData = await userRes.json();

      setStudentUserData(userData);
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
      setStudentUserData(null);
    } finally {
      setProfileLoading(false);
      setProfileFetched(true);
    }
  };

  // ========================================
  // MULTI-YEAR ATTENDANCE STRUCTURE
  // ========================================

  const MONTHS = [
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

  // Initialize attendance data with multi-year support
  const [attendanceByYear, setAttendanceByYear] = useState(() => {
    const yearData = {};

    // ✅ FIXED: Convert Map to Object if needed
    if (student.attendanceByYear) {
      const attendanceMap =
        student.attendanceByYear instanceof Map
          ? Object.fromEntries(student.attendanceByYear)
          : student.attendanceByYear;

      Object.assign(yearData, attendanceMap);
    }

    // Migrate old data if exists (backward compatibility)
    // Only if current year data doesn't exist
    const currentYearKey = `${batch.academicYear}-${batch.year}`;
    if (
      !yearData[currentYearKey] &&
      student.attendanceRecords &&
      student.attendanceRecords.length > 0
    ) {
      yearData[currentYearKey] = {
        academicYear: batch.academicYear,
        year: batch.year,
        batchName: batch.batchName,
        months: student.attendanceRecords,
        averageAttendance: student.attendance || 0,
      };
    }

    return yearData;
  });

  // ✅ FIXED: Default to current year if exists, otherwise first available year
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYearKey = `${batch.academicYear}-${batch.year}`;
    const availableYears = Object.keys(attendanceByYear);

    // Prefer current year, fallback to first available
    return attendanceByYear[currentYearKey]
      ? currentYearKey
      : availableYears[0] || null;
  });
  const [tempAttendanceData, setTempAttendanceData] = useState({});
  const [modalAcademicYear, setModalAcademicYear] = useState(
    batch.academicYear,
  );
  const [modalYear, setModalYear] = useState(batch.year);

  // ========================================
  // GRADE POINT MAPPING (INDIAN UNIVERSITY SYSTEM)
  // ========================================

  const GRADE_POINTS = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    D: 4,
    ATKT: 0,
    F: 0,
  };

  const calculateTheoryGrade = (totalMarks, semesterEnd) => {
    if (semesterEnd < 30) return "ATKT";
    if (totalMarks >= 80) return "O";
    if (totalMarks >= 70) return "A+";
    if (totalMarks >= 60) return "A";
    if (totalMarks >= 50) return "B+";
    if (totalMarks >= 40) return "B";
    if (totalMarks >= 30) return "C";
    return "ATKT";
  };

  const calculatePracticalGrade = (practicalMarks) => {
    if (practicalMarks < 20) return "ATKT";
    if (practicalMarks >= 40) return "O";
    if (practicalMarks >= 35) return "A+";
    if (practicalMarks >= 30) return "A";
    if (practicalMarks >= 26) return "B+";
    if (practicalMarks >= 22) return "C";
    if (practicalMarks >= 20) return "D";
    return "ATKT";
  };

  const [newSemester, setNewSemester] = useState({
    semesterNumber: 1,
    numberOfSubjects: 7,
    subjects: [],
  });

  const initializeSubjects = (count) => {
    const subjects = [];
    for (let i = 0; i < count; i++) {
      subjects.push({
        subjectName: "",
        avg: "",
        semesterEnd: "",
        practicalMarks: "",
        theoryGrade: "",
        practicalGrade: "",
      });
    }
    setNewSemester({ ...newSemester, numberOfSubjects: count, subjects });
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = [...newSemester.subjects];
    updatedSubjects[index][field] = value;

    const subject = updatedSubjects[index];

    if (subject.avg !== "" && subject.semesterEnd !== "") {
      const theoryTotal =
        parseFloat(subject.avg) + parseFloat(subject.semesterEnd);
      const semesterEndMarks = parseFloat(subject.semesterEnd);
      subject.theoryGrade = calculateTheoryGrade(theoryTotal, semesterEndMarks);
    } else {
      subject.theoryGrade = "";
    }

    if (subject.practicalMarks !== "") {
      const practicalTotal = parseFloat(subject.practicalMarks);
      subject.practicalGrade = calculatePracticalGrade(practicalTotal);
    } else {
      subject.practicalGrade = "";
    }

    setNewSemester({ ...newSemester, subjects: updatedSubjects });
  };

  // ========================================
  // MULTI-YEAR ATTENDANCE HANDLERS
  // ========================================

  const handleOpenAddAttendance = () => {
    setModalAcademicYear(batch.academicYear);
    setModalYear(batch.year);

    const yearKey = `${batch.academicYear}-${batch.year}`;

    if (attendanceByYear[yearKey]) {
      const existingData = {};
      attendanceByYear[yearKey].months.forEach((record) => {
        existingData[record.month] = record.percentage;
      });
      setTempAttendanceData(existingData);
    } else {
      setTempAttendanceData({});
    }

    setShowAddAttendance(true);
  };

  const handleYearChange = (academicYear, year) => {
    setModalAcademicYear(academicYear);
    setModalYear(year);

    const yearKey = `${academicYear}-${year}`;

    if (attendanceByYear[yearKey]) {
      const existingData = {};
      attendanceByYear[yearKey].months.forEach((record) => {
        existingData[record.month] = record.percentage;
      });
      setTempAttendanceData(existingData);
    } else {
      setTempAttendanceData({});
    }
  };

  const handleUpdateTempAttendance = (month, percentage) => {
    setTempAttendanceData((prev) => ({
      ...prev,
      [month]: percentage,
    }));
  };

  const handleSaveAttendance = async () => {
    const yearKey = `${modalAcademicYear}-${modalYear}`;

    const monthsArray = MONTHS.filter(
      (month) =>
        tempAttendanceData[month] !== undefined &&
        tempAttendanceData[month] !== "",
    ).map((month) => ({
      month: month,
      percentage: parseFloat(tempAttendanceData[month]),
    }));

    if (monthsArray.length === 0) {
      alert("Please add at least one month's attendance");
      return;
    }

    const avgAttendance =
      monthsArray.reduce((sum, rec) => sum + rec.percentage, 0) /
      monthsArray.length;

    const updatedAttendanceByYear = {
      ...attendanceByYear,
      [yearKey]: {
        academicYear: modalAcademicYear,
        year: modalYear,
        batchName: `${modalYear} ${modalAcademicYear}`,
        months: monthsArray,
        averageAttendance: Math.round(avgAttendance),
      },
    };

    setAttendanceByYear(updatedAttendanceByYear);
    setSelectedYear(yearKey);

    await onUpdate({
      ...student,
      attendanceByYear: updatedAttendanceByYear,
      attendanceRecords: updatedAttendanceByYear[yearKey]?.months || [],
      attendance: Math.round(avgAttendance),
    });

    setShowAddAttendance(false);
    setTempAttendanceData({});
  };

  const handleDeleteYearAttendance = async (yearKey) => {
    if (
      !confirm(
        `Are you sure you want to delete attendance records for ${yearKey}?`,
      )
    ) {
      return;
    }

    const updatedAttendanceByYear = { ...attendanceByYear };
    delete updatedAttendanceByYear[yearKey];

    setAttendanceByYear(updatedAttendanceByYear);

    const remainingYears = Object.keys(updatedAttendanceByYear);
    setSelectedYear(remainingYears.length > 0 ? remainingYears[0] : null);

    await onUpdate({
      ...student,
      attendanceByYear: updatedAttendanceByYear,
    });
  };

  // ========================================
  // SGPA CALCULATION
  // ========================================

  const calculateSemesterSGPA = (totalCG, totalCredits) => {
    if (totalCredits === 0) return "0.00";
    const sgpa = totalCG / totalCredits;
    return sgpa.toFixed(2);
  };

  const getSemesterGrade = (sgpa) => {
    const sgpaValue = parseFloat(sgpa);
    if (sgpaValue >= 9.5) return "O";
    if (sgpaValue >= 8.5) return "A+";
    if (sgpaValue >= 7.5) return "A";
    if (sgpaValue >= 6.5) return "B+";
    if (sgpaValue >= 5.5) return "B";
    if (sgpaValue >= 4.5) return "C";
    return "F";
  };

  // ========================================
  // EDIT SEMESTER FUNCTIONALITY
  // ========================================

  const startEditingSemester = (semesterIndex) => {
    const semester = student.semesters[semesterIndex];
    setEditingSemester(semesterIndex);
    setEditedSubjects(JSON.parse(JSON.stringify(semester.subjects)));
  };

  const updateEditedSubject = (index, field, value) => {
    const updatedSubjects = [...editedSubjects];
    updatedSubjects[index][field] = value;

    const subject = updatedSubjects[index];

    if (field === "avg" || field === "semesterEnd") {
      if (
        subject.avg !== null &&
        subject.avg !== undefined &&
        subject.semesterEnd !== null &&
        subject.semesterEnd !== undefined
      ) {
        const theoryTotal =
          parseFloat(subject.avg) + parseFloat(subject.semesterEnd);
        const semesterEndMarks = parseFloat(subject.semesterEnd);
        subject.theoryTotal = theoryTotal;
        subject.theoryGrade = calculateTheoryGrade(
          theoryTotal,
          semesterEndMarks,
        );
        subject.theoryGP = GRADE_POINTS[subject.theoryGrade] || 0;
        subject.theoryCP = subject.theoryGrade === "ATKT" ? 0 : 2;
        subject.theoryCG = subject.theoryCP * subject.theoryGP;
      }
    }

    if (field === "practicalMarks") {
      if (
        subject.practicalMarks !== null &&
        subject.practicalMarks !== undefined
      ) {
        const practicalTotal = parseFloat(subject.practicalMarks);
        subject.practicalTotal = practicalTotal;
        subject.practicalGrade = calculatePracticalGrade(practicalTotal);
        subject.practicalGP = GRADE_POINTS[subject.practicalGrade] || 0;
        subject.practicalCP = subject.practicalGrade === "ATKT" ? 0 : 1;
        subject.practicalCG = subject.practicalCP * subject.practicalGP;
      }
    }

    subject.totalCP = (subject.theoryCP || 0) + (subject.practicalCP || 0);
    subject.totalCG = (subject.theoryCG || 0) + (subject.practicalCG || 0);

    setEditedSubjects(updatedSubjects);
  };

  const saveEditedSemester = async () => {
    let totalCG = 0;
    let totalCredits = 0;

    editedSubjects.forEach((subject) => {
      totalCG += subject.totalCG || 0;
      totalCredits += subject.totalCP || 0;
    });

    let atktCount = 0;
    editedSubjects.forEach((subject) => {
      if (subject.theoryGrade === "ATKT") atktCount++;
      if (subject.practicalGrade === "ATKT") atktCount++;
    });

    const hasATKT = atktCount > 0;

    let status = "PASS";
    if (atktCount >= 3) {
      status = "FAIL";
    } else if (atktCount > 0) {
      status = "ATKT";
    }

    const semesterSGPA = hasATKT
      ? "0.00"
      : calculateSemesterSGPA(totalCG, totalCredits);
    const semesterGrade = hasATKT ? "-" : getSemesterGrade(semesterSGPA);

    const updatedSemesters = [...student.semesters];
    updatedSemesters[editingSemester] = {
      ...updatedSemesters[editingSemester],
      subjects: editedSubjects,
      totalCredits: totalCredits,
      totalCG: totalCG,
      semesterSGPA: parseFloat(semesterSGPA),
      semesterGrade: semesterGrade,
      hasATKT: hasATKT,
      atktCount: atktCount,
      status: status,
    };

    await onUpdate({
      ...student,
      semesters: updatedSemesters,
    });

    setEditingSemester(null);
    setEditedSubjects([]);
  };

  const cancelEditingSemester = () => {
    setEditingSemester(null);
    setEditedSubjects([]);
  };

  // ========================================
  // ADD SEMESTER
  // ========================================

  const handleAddSemester = async () => {
    const validSubjects = newSemester.subjects.filter((s) => {
      if (!s.subjectName.trim()) return false;
      const hasTheory = s.avg !== "" && s.semesterEnd !== "";
      const hasPractical = s.practicalMarks !== "";
      return hasTheory || hasPractical;
    });

    if (validSubjects.length === 0) {
      alert(
        "Please add at least one subject with Subject Name and marks (Theory or Practical)",
      );
      return;
    }

    const processedSubjects = [];
    let totalCG = 0;
    let totalCredits = 0;
    let atktCount = 0;

    validSubjects.forEach((subject) => {
      const hasTheory = subject.avg !== "" && subject.semesterEnd !== "";
      const hasPractical = subject.practicalMarks !== "";

      let theoryCP = 0,
        theoryCG = 0,
        theoryTotal = 0,
        theoryGrade = "",
        theoryGP = 0;
      let practicalCP = 0,
        practicalCG = 0,
        practicalTotal = 0,
        practicalGrade = "",
        practicalGP = 0;

      if (hasTheory) {
        theoryTotal = parseFloat(subject.avg) + parseFloat(subject.semesterEnd);
        theoryGrade = subject.theoryGrade;
        theoryGP = GRADE_POINTS[theoryGrade] || 0;

        if (theoryGrade === "ATKT") {
          theoryCP = 0;
          atktCount++;
        } else {
          theoryCP = 2;
        }
        theoryCG = theoryCP * theoryGP;
      }

      if (hasPractical) {
        practicalTotal = parseFloat(subject.practicalMarks);
        practicalGrade = subject.practicalGrade;
        practicalGP = GRADE_POINTS[practicalGrade] || 0;

        if (practicalGrade === "ATKT") {
          practicalCP = 0;
          atktCount++;
        } else {
          practicalCP = 1;
        }
        practicalCG = practicalCP * practicalGP;
      }

      processedSubjects.push({
        subjectName: subject.subjectName,
        avg: hasTheory ? parseFloat(subject.avg) : null,
        semesterEnd: hasTheory ? parseFloat(subject.semesterEnd) : null,
        practicalMarks: hasPractical
          ? parseFloat(subject.practicalMarks)
          : null,
        theoryTotal: theoryTotal || null,
        practicalTotal: practicalTotal || null,
        theoryGrade: theoryGrade,
        practicalGrade: practicalGrade,
        theoryGP: theoryGP,
        practicalGP: practicalGP,
        theoryCP: theoryCP,
        practicalCP: practicalCP,
        theoryCG: theoryCG,
        practicalCG: practicalCG,
        totalCP: theoryCP + practicalCP,
        totalCG: theoryCG + practicalCG,
      });

      totalCG += theoryCG + practicalCG;
      totalCredits += theoryCP + practicalCP;
    });

    const hasATKT = atktCount > 0;

    let status = "PASS";
    if (atktCount >= 3) {
      status = "FAIL";
    } else if (atktCount > 0) {
      status = "ATKT";
    }

    const semesterSGPA = hasATKT
      ? "0.00"
      : calculateSemesterSGPA(totalCG, totalCredits);
    const semesterGrade = hasATKT ? "-" : getSemesterGrade(semesterSGPA);

    const newSemesterData = {
      semesterNumber: newSemester.semesterNumber,
      semesterName: `Semester ${["I", "II", "III", "IV", "V", "VI"][newSemester.semesterNumber - 1]}`,
      subjects: processedSubjects,
      totalCredits: totalCredits,
      totalCG: totalCG,
      semesterSGPA: parseFloat(semesterSGPA),
      semesterGrade: semesterGrade,
      hasATKT: hasATKT,
      atktCount: atktCount,
      status: status,
    };

    const updatedSemesters = [...(student.semesters || []), newSemesterData];

    await onUpdate({
      ...student,
      semesters: updatedSemesters,
    });

    setNewSemester({
      semesterNumber: 1,
      numberOfSubjects: 7,
      subjects: [],
    });
    setShowAddSemester(false);
  };

  // ========================================
  // CGPA / UTILITY FUNCTIONS
  // ========================================

  const calculateCGPA = () => {
    if (!student.semesters || student.semesters.length === 0) return "0.00";

    let totalCG = 0;
    let totalCredits = 0;

    student.semesters.forEach((sem) => {
      totalCG += sem.totalCG || 0;
      totalCredits += sem.totalCredits || 0;
    });

    if (totalCredits === 0) return "0.00";

    return (totalCG / totalCredits).toFixed(2);
  };

  const calculateOverallPercentage = () => {
    const cgpa = parseFloat(calculateCGPA());
    const percentage = (cgpa * 9.5).toFixed(2);
    return percentage;
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return value;
  };

  const countATKTSubjects = () => {
    let count = 0;
    if (student.semesters) {
      student.semesters.forEach((sem) => {
        sem.subjects.forEach((subject) => {
          if (subject.theoryGrade === "ATKT") count++;
          if (subject.practicalGrade === "ATKT") count++;
        });
      });
    }
    return count;
  };

  const getSemesterStatusBadge = (semester) => {
    let actualAtktCount = 0;
    if (semester.subjects) {
      semester.subjects.forEach((subject) => {
        if (subject.theoryGrade === "ATKT") actualAtktCount++;
        if (subject.practicalGrade === "ATKT") actualAtktCount++;
      });
    }

    const atktCount = Math.max(actualAtktCount, semester.atktCount || 0);

    if (atktCount >= 3) {
      return (
        <span
          className="status-badge"
          style={{
            background: "#d32f2f",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          FAIL ({atktCount} ATKT)
        </span>
      );
    } else if (atktCount > 0) {
      return (
        <span
          className="status-badge"
          style={{
            background: "#f44336",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          ATKT ({atktCount})
        </span>
      );
    } else {
      return (
        <span
          className="status-badge"
          style={{
            background: "#4caf50",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          PASS
        </span>
      );
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="student-detail-exam">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to Division</span>
        </button>
      </div>

      {/* Student Banner */}
      <div className="student-banner">
        <div className="student-banner-left">
          <div className="student-avatar-large">
            {student.name?.charAt(0) || "?"}
          </div>
          <div className="student-banner-info">
            <h1>{student.name}</h1>
            <div className="student-meta">
              <span>Roll No: {student.rollNo}</span>
              <span>•</span>
              <span>Enrollment: {student.enrollmentNo}</span>
              <span>•</span>
              <span>Division {student.division}</span>
            </div>
            <div className="student-contact">
              <span>
                <i className="fa-solid fa-envelope"></i> {student.email}
              </span>
              <span>
                <i className="fa-solid fa-phone"></i> {student.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="student-banner-right">
          {(() => {
            const atktCount = countATKTSubjects();
            let displayStatus = student.status || "ACTIVE";
            let statusClass = displayStatus.toLowerCase();

            if (atktCount >= 3) {
              displayStatus = "FAIL";
              statusClass = "fail";
            } else if (atktCount > 0) {
              displayStatus = "ATKT";
              statusClass = "atkt";
            }

            return (
              <>
                <span className={`status-badge-xl ${statusClass}`}>
                  {displayStatus}
                </span>
                {atktCount > 0 && (
                  <span
                    className="status-badge-xl atkt"
                    style={{ marginTop: "10px" }}
                  >
                    {atktCount} ATKT Subject{atktCount > 1 ? "s" : ""}
                  </span>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <i className="fa-solid fa-chart-pie"></i>
          Overview
        </button>
        <button
          className={`tab ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <i className="fa-solid fa-calendar-check"></i>
          Attendance
        </button>
        <button
          className={`tab ${activeTab === "examination" ? "active" : ""}`}
          onClick={() => setActiveTab("examination")}
        >
          <i className="fa-solid fa-graduation-cap"></i>
          Examination
        </button>
        <button
          className={`tab ${activeTab === "studentDetail" ? "active" : ""}`}
          onClick={() => setActiveTab("studentDetail")}
        >
          <i className="fa-solid fa-id-card"></i>
          Student Detail
        </button>

        <button
          className={`tab ${activeTab === "insights" ? "active" : ""}`}
          onClick={() => setActiveTab("insights")}
        >
          <i className="fa-solid fa-chart-line"></i>
          Student Insights
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-icon attendance-icon">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div className="card-content">
                  <h3>Overall Attendance</h3>
                  <p className="metric-value">{student.attendance || 0}%</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${student.attendance || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-icon marks-icon">
                  <i className="fa-solid fa-book-bookmark"></i>
                </div>
                <div className="card-content">
                  <h3>Semesters Completed</h3>
                  <p className="metric-value">
                    {student.semesters?.length || 0}
                  </p>
                  <small>Academic Records</small>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-icon batch-icon">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div className="card-content">
                  <h3>CGPA (Cumulative)</h3>
                  <p className="metric-value">{calculateCGPA()}</p>
                  <small>Percentage: {calculateOverallPercentage()}%</small>
                </div>
              </div>

              {countATKTSubjects() > 0 && (
                <div
                  className="overview-card"
                  style={{ borderLeft: "4px solid #f44336" }}
                >
                  <div className="card-icon" style={{ background: "#ffebee" }}>
                    <i
                      className="fa-solid fa-triangle-exclamation"
                      style={{ color: "#f44336" }}
                    ></i>
                  </div>
                  <div className="card-content">
                    <h3>ATKT Subjects</h3>
                    <p className="metric-value" style={{ color: "#f44336" }}>
                      {countATKTSubjects()}
                    </p>
                    <small>Re-examination Required</small>
                  </div>
                </div>
              )}
            </div>

            {/* Grading Scale Reference */}
            <div className="grading-scale-card">
              <h2>Indian University Grading System</h2>
              <div className="grading-scale-table">
                <h3>Combined Grading Scale</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Grade</th>
                      <th>GP</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="grade-badge grade-O">O</span>
                      </td>
                      <td className="grade-point">10</td>
                      <td>Outstanding</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="grade-badge grade-Aplus">A+</span>
                      </td>
                      <td className="grade-point">9</td>
                      <td>Excellent</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="grade-badge grade-A">A</span>
                      </td>
                      <td className="grade-point">8</td>
                      <td>Very Good</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="grade-badge grade-Bplus">B+</span>
                      </td>
                      <td className="grade-point">7</td>
                      <td>Good</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="grade-badge grade-B">B</span>
                      </td>
                      <td className="grade-point">6</td>
                      <td>Above Average</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="grade-badge grade-C">C</span>
                      </td>
                      <td className="grade-point">5</td>
                      <td>Average</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="grade-badge grade-D">D</span>
                      </td>
                      <td className="grade-point">4</td>
                      <td>Pass</td>
                    </tr>
                    <tr style={{ background: "#ffebee" }}>
                      <td>
                        <span className="grade-badge grade-ATKT">ATKT</span>
                      </td>
                      <td className="grade-point">0</td>
                      <td>
                        <strong>
                          Fail - Re-examination Required (Semester End &lt; 30
                          in Theory / Practical &lt; 20)
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="credit-info">
                <h3>Credit Point System</h3>
                <ul>
                  <li>
                    <strong>Theory Subject:</strong> CP = 2 (if passed) / CP = 0
                    (if ATKT)
                  </li>
                  <li>
                    <strong>Practical Subject:</strong> CP = 1 (if passed) / CP
                    = 0 (if ATKT)
                  </li>
                  <li>
                    <strong>
                      ATKT subjects do NOT contribute to Credits or Credit Grade
                    </strong>
                  </li>
                  <li>
                    <strong>Same Grade applies to both</strong> Theory and
                    Practical components of a subject
                  </li>
                </ul>
                <h3>SGPA Calculation Formula</h3>
                <p>
                  <strong>
                    ✓ CORRECT FORMULA: SGPA = Total CG ÷ Total Credits
                  </strong>
                </p>
                <p>
                  <strong>Credit Grade (CG):</strong> CP × GP
                </p>
                <p
                  style={{
                    background: "#fff3cd",
                    padding: "10px",
                    borderRadius: "4px",
                    marginTop: "10px",
                  }}
                >
                  <strong>⚠️ ATKT Policy:</strong>
                  <br />
                  • Theory: Semester End marks below 30 (out of 75) → ATKT
                  <br />
                  • Practical marks below 20 (out of 50) → ATKT
                  <br />
                  • ATKT subjects get CP = 0 (no credit earned)
                  <br />
                  • Student must re-appear for examination
                  <br />•{" "}
                  <strong style={{ color: "#d32f2f" }}>
                    3 or more ATKT subjects → FAIL (Must repeat semester)
                  </strong>
                  <br />• After clearing, marks can be updated and SGPA
                  recalculated
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== ATTENDANCE TAB ===== */}
        {activeTab === "attendance" && (
          <div className="attendance-tab">
            <div className="section-header">
              <h2>Attendance Record</h2>
              <button className="btn-add" onClick={handleOpenAddAttendance}>
                <i className="fa-solid fa-plus"></i>
                Manage Attendance
              </button>
            </div>

            {/* Year Selector Tabs */}
            {Object.keys(attendanceByYear).length > 0 && (
              <div className="year-tabs">
                {Object.keys(attendanceByYear)
                  .sort()
                  .reverse()
                  .map((yearKey) => {
                    const yearData = attendanceByYear[yearKey];
                    return (
                      <button
                        key={yearKey}
                        className={`year-tab ${selectedYear === yearKey ? "active" : ""}`}
                        onClick={() => setSelectedYear(yearKey)}
                      >
                        <div className="year-tab-header">
                          <span className="year-badge">{yearData.year}</span>
                          <span className="year-label">
                            {yearData.academicYear}
                          </span>
                        </div>
                        <div className="year-tab-footer">
                          <span className="year-avg">
                            {yearData.averageAttendance}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {selectedYear && attendanceByYear[selectedYear] ? (
              <div className="attendance-table-wrapper">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                    padding: "15px",
                    background: "#f0f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "18px", color: "#0369a1" }}
                    >
                      {attendanceByYear[selectedYear].batchName}
                    </h3>
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        fontSize: "13px",
                        color: "#0369a1",
                      }}
                    >
                      <i className="fa-solid fa-calendar-alt"></i> Academic Year
                      Order: June to May
                    </p>
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={() => handleDeleteYearAttendance(selectedYear)}
                    style={{ color: "#dc2626" }}
                  >
                    <i className="fa-solid fa-trash"></i>
                    Delete Year
                  </button>
                </div>

                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>MONTH</th>
                      <th>% ATTENDS</th>
                      <th>STATUS</th>
                      <th>OVERALL</th>
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
                        ...attendanceByYear[selectedYear].months,
                      ].sort((a, b) => {
                        return (
                          monthOrder.indexOf(a.month) -
                          monthOrder.indexOf(b.month)
                        );
                      });

                      return sortedRecords.map((record, idx) => (
                        <tr key={idx}>
                          <td>{record.month}</td>
                          <td className="attendance-percent">
                            {record.percentage}%
                          </td>
                          <td>
                            <span
                              className={`attendance-status ${record.percentage >= 75 ? "good" : "low"}`}
                            >
                              {record.percentage >= 75 ? "Good" : "Low"}
                            </span>
                          </td>
                          <td>
                            {attendanceByYear[selectedYear].averageAttendance}%
                          </td>
                          <td>
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
                <p>No attendance records yet</p>
                <button
                  className="btn-primary"
                  onClick={handleOpenAddAttendance}
                >
                  Add Attendance Records
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== EXAMINATION TAB ===== */}
        {activeTab === "examination" && (
          <div className="examination-tab">
            <div className="section-header">
              <h2>Examination Record</h2>
              <button
                className="btn-add"
                onClick={() => setShowAddSemester(true)}
              >
                <i className="fa-solid fa-plus"></i>
                Add Semester
              </button>
            </div>

            {student.semesters && student.semesters.length > 0 ? (
              <div className="semesters-container">
                {student.semesters.map((semester, semIdx) => (
                  <div key={semIdx} className="semester-card">
                    <div
                      className="semester-header"
                      onClick={() =>
                        setExpandedSemester(
                          expandedSemester === semIdx ? null : semIdx,
                        )
                      }
                    >
                      <div className="semester-title">
                        <h3>{semester.semesterName}</h3>
                        <span className="subject-count">
                          {semester.subjects.length} Subjects
                        </span>
                        {(() => {
                          let actualAtktCount = 0;
                          if (semester.subjects) {
                            semester.subjects.forEach((subject) => {
                              if (subject.theoryGrade === "ATKT")
                                actualAtktCount++;
                              if (subject.practicalGrade === "ATKT")
                                actualAtktCount++;
                            });
                          }
                          const atktCount = Math.max(
                            actualAtktCount,
                            semester.atktCount || 0,
                          );
                          const hasATKT = atktCount > 0;

                          return (
                            hasATKT && (
                              <span
                                className="atkt-badge"
                                style={{
                                  marginLeft: "10px",
                                  padding: "4px 12px",
                                  background:
                                    atktCount >= 3 ? "#d32f2f" : "#f44336",
                                  color: "white",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                {atktCount >= 3
                                  ? `FAIL (${atktCount} ATKT)`
                                  : `${atktCount} ATKT`}
                              </span>
                            )
                          );
                        })()}
                      </div>
                      <div className="semester-stats">
                        {(() => {
                          let actualAtktCount = 0;
                          if (semester.subjects) {
                            semester.subjects.forEach((subject) => {
                              if (subject.theoryGrade === "ATKT")
                                actualAtktCount++;
                              if (subject.practicalGrade === "ATKT")
                                actualAtktCount++;
                            });
                          }
                          const hasATKT =
                            actualAtktCount > 0 || semester.hasATKT;

                          return hasATKT ? (
                            <>
                              <div className="stat">
                                <span className="stat-label">SGPA</span>
                                <span className="stat-value">0.00</span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">Grade</span>
                                <span
                                  className="grade-badge"
                                  style={{
                                    background: "#f44336",
                                    color: "white",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  -
                                </span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">Status</span>
                                {getSemesterStatusBadge(semester)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="stat">
                                <span className="stat-label">SGPA</span>
                                <span className="stat-value">
                                  {semester.semesterSGPA}
                                </span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">Grade</span>
                                <span
                                  className={`grade-badge grade-${semester.semesterGrade.replace("+", "plus")}`}
                                >
                                  {semester.semesterGrade}
                                </span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">Status</span>
                                {getSemesterStatusBadge(semester)}
                              </div>
                            </>
                          );
                        })()}
                        <i
                          className={`fa-solid fa-chevron-${expandedSemester === semIdx ? "up" : "down"}`}
                        ></i>
                      </div>
                    </div>

                    {expandedSemester === semIdx && (
                      <div className="semester-content">
                        {editingSemester === semIdx ? (
                          // EDIT MODE
                          <>
                            <div
                              style={{
                                padding: "15px",
                                background: "#fff3cd",
                                border: "2px solid #ffc107",
                                borderRadius: "8px",
                                marginBottom: "20px",
                              }}
                            >
                              <strong>✏️ EDIT MODE:</strong> Update marks below.
                              Grades will be recalculated automatically.
                              <br />
                              <strong>ATKT Rule:</strong> Semester End below 30
                              (out of 75) or Practical below 20 (out of 50) =
                              ATKT (Fail)
                              <br />
                              <strong style={{ color: "#d32f2f" }}>
                                FAIL Rule:
                              </strong>{" "}
                              3 or more ATKT subjects = FAIL (Must repeat
                              semester)
                            </div>

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
                                  {editedSubjects.map((subject, subIdx) => (
                                    <tr key={subIdx}>
                                      <td className="subject-name">
                                        {subject.subjectName || "-"}
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          min="0"
                                          max="25"
                                          step="0.01"
                                          value={
                                            subject.avg !== null
                                              ? subject.avg
                                              : ""
                                          }
                                          onChange={(e) =>
                                            updateEditedSubject(
                                              subIdx,
                                              "avg",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                            )
                                          }
                                          style={{
                                            width: "70px",
                                            padding: "4px",
                                            textAlign: "center",
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          min="0"
                                          max="75"
                                          step="0.01"
                                          value={
                                            subject.semesterEnd !== null
                                              ? subject.semesterEnd
                                              : ""
                                          }
                                          onChange={(e) =>
                                            updateEditedSubject(
                                              subIdx,
                                              "semesterEnd",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                            )
                                          }
                                          style={{
                                            width: "70px",
                                            padding: "4px",
                                            textAlign: "center",
                                          }}
                                        />
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
                                        <input
                                          type="number"
                                          min="0"
                                          max="50"
                                          step="0.01"
                                          value={
                                            subject.practicalMarks !== null
                                              ? subject.practicalMarks
                                              : ""
                                          }
                                          onChange={(e) =>
                                            updateEditedSubject(
                                              subIdx,
                                              "practicalMarks",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                            )
                                          }
                                          style={{
                                            width: "70px",
                                            padding: "4px",
                                            textAlign: "center",
                                          }}
                                        />
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
                                </tbody>
                              </table>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                                marginTop: "20px",
                                paddingTop: "20px",
                                borderTop: "2px solid #e0e0e0",
                              }}
                            >
                              <button
                                className="btn-ghost"
                                onClick={cancelEditingSemester}
                                style={{ padding: "10px 20px" }}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn-primary"
                                onClick={saveEditedSemester}
                                style={{ padding: "10px 20px" }}
                              >
                                <i className="fa-solid fa-save"></i> Save
                                Changes
                              </button>
                            </div>
                          </>
                        ) : (
                          // VIEW MODE
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginBottom: "15px",
                              }}
                            >
                              <button
                                className="btn-add"
                                onClick={() => startEditingSemester(semIdx)}
                                style={{ padding: "8px 16px" }}
                              >
                                <i className="fa-solid fa-edit"></i> Edit
                                Semester
                              </button>
                            </div>

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
                                  {semester.subjects.map((subject, subIdx) => (
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
                                  <strong>✓ SGPA Calculation:</strong> Total CG
                                  ÷ Total Credits = {semester.totalCG || 0} ÷{" "}
                                  {semester.totalCredits || 0} ={" "}
                                  <strong>
                                    {semester.semesterSGPA || "0.00"}
                                  </strong>
                                </p>
                              ) : (
                                <>
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
                                  <p
                                    style={{
                                      color: "#f44336",
                                      marginTop: "10px",
                                    }}
                                  >
                                    <strong>⚠️ Action Required:</strong>
                                    {(semester.atktCount || 0) >= 3
                                      ? " Student must re-register and repeat all subjects in this semester."
                                      : ' Student must re-appear for failed subjects. After clearing, click "Edit Semester" to update marks.'}
                                  </p>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* CGPA Summary */}
                <div className="cgpa-summary">
                  <h3>Cumulative Grade Point Average (CGPA)</h3>
                  <div className="cgpa-display">
                    <div>
                      <span className="cgpa-value">{calculateCGPA()}</span>
                      <span className="cgpa-label">Overall CGPA</span>
                    </div>
                    <div>
                      <span className="cgpa-value">
                        {calculateOverallPercentage()}%
                      </span>
                      <span className="cgpa-label">Percentage</span>
                    </div>
                    {countATKTSubjects() > 0 && (
                      <div>
                        <span
                          className="cgpa-value"
                          style={{ color: "#f44336" }}
                        >
                          {countATKTSubjects()}
                        </span>
                        <span className="cgpa-label">ATKT Subjects</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-file-circle-xmark"></i>
                <p>No semester records yet</p>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddSemester(true)}
                >
                  Add First Semester
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== STUDENT DETAIL TAB ===== */}
        {activeTab === "studentDetail" && (
          <div className="student-detail-tab">
            {profileLoading ? (
              <div className="spf-loading">
                <div className="spf-spinner"></div>
                <p>Loading student profile...</p>
              </div>
            ) : (
              <StudentProfileForm
                student={student}
                userData={studentUserData}
              />
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="student-detail-tab" style={{ padding: 0 }}>
            <StudentInsightPanel student={student} sessions={sessions} />
          </div>
        )}
      </div>

      {/* ===== MANAGE ATTENDANCE MODAL ===== */}
      {showAddAttendance && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddAttendance(false)}
        >
          <div
            className="modal-box modal-attendance"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Manage Monthly Attendance</h3>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "500",
                  }}
                >
                  Select Academic Year and Add/Edit Attendance
                </p>
              </div>
              <button onClick={() => setShowAddAttendance(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* Year Selection */}
              <div
                style={{
                  marginBottom: "25px",
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  📅 Select Academic Year
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Academic Year</label>
                    <select
                      value={modalAcademicYear}
                      onChange={(e) =>
                        handleYearChange(e.target.value, modalYear)
                      }
                    >
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27</option>
                      <option value="2027-28">2027-28</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year / Semester</label>
                    <select
                      value={modalYear}
                      onChange={(e) =>
                        handleYearChange(modalAcademicYear, e.target.value)
                      }
                    >
                      <option value="FY">FY (First Year)</option>
                      <option value="SY">SY (Second Year)</option>
                      <option value="TY">TY (Third Year)</option>
                    </select>
                  </div>
                </div>
              </div>

              <p
                style={{
                  marginBottom: "20px",
                  padding: "12px",
                  background: "#e3f2fd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1565c0",
                }}
              >
                <i className="fa-solid fa-info-circle"></i> Enter attendance
                percentage for each month (June to May). Leave blank for months
                not yet recorded.
              </p>

              {/* First Half - June to November */}
              <div
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  📅 First Semester (June - November)
                </h4>
                <div className="months-grid">
                  {MONTHS.slice(0, 6).map((month) => (
                    <div key={month} className="month-attendance-item">
                      <label>{month}</label>
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0-100"
                          value={tempAttendanceData[month] || ""}
                          onChange={(e) =>
                            handleUpdateTempAttendance(month, e.target.value)
                          }
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Second Half - December to May */}
              <div
                style={{
                  padding: "15px",
                  background: "#fefce8",
                  borderRadius: "8px",
                  border: "1px solid #fde047",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#713f12",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  📅 Second Semester (December - May)
                </h4>
                <div className="months-grid">
                  {MONTHS.slice(6, 12).map((month) => (
                    <div key={month} className="month-attendance-item">
                      <label>{month}</label>
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0-100"
                          value={tempAttendanceData[month] || ""}
                          onChange={(e) =>
                            handleUpdateTempAttendance(month, e.target.value)
                          }
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-ghost"
                onClick={() => setShowAddAttendance(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveAttendance}>
                <i className="fa-solid fa-save"></i> Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD SEMESTER MODAL ===== */}
      {showAddSemester && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddSemester(false)}
        >
          <div
            className="modal-box modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Add Semester Record</h3>
              <button onClick={() => setShowAddSemester(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={newSemester.semesterNumber}
                    onChange={(e) =>
                      setNewSemester({
                        ...newSemester,
                        semesterNumber: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="1">Semester I</option>
                    <option value="2">Semester II</option>
                    <option value="3">Semester III</option>
                    <option value="4">Semester IV</option>
                    <option value="5">Semester V</option>
                    <option value="6">Semester VI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Subjects</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSemester.numberOfSubjects}
                    onChange={(e) =>
                      initializeSubjects(parseInt(e.target.value))
                    }
                    placeholder="e.g., 7"
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "15px",
                  background: "#e8f5e9",
                  border: "2px solid #4caf50",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <strong>✓ AUTO-GRADING SYSTEM with ATKT:</strong>
                <br />
                <strong>1.</strong> Enter marks - grades are calculated
                automatically
                <br />
                <strong>2.</strong> Theory: Total (Avg + Sem End) → Auto Grade →
                CP=2 (or CP=0 if ATKT)
                <br />
                <strong>3.</strong> Practical: Marks → Auto Grade → CP=1 (or
                CP=0 if ATKT)
                <br />
                <strong>4.</strong>{" "}
                <span
                  style={{
                    background: "#ffebee",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  ATKT: Semester End &lt; 30 or Practical &lt; 20
                </span>
                <br />
                <strong>5.</strong>{" "}
                <span
                  style={{
                    background: "#ffcdd2",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    color: "#d32f2f",
                    fontWeight: "bold",
                  }}
                >
                  FAIL: 3 or more ATKT subjects
                </span>
                <br />
                <strong>6.</strong>{" "}
                <span
                  style={{
                    background: "#fff59d",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  SGPA = Total CG ÷ Total Credits
                </span>
              </div>

              {newSemester.subjects.length > 0 && (
                <div className="subjects-section">
                  <h4>Enter Subject Details (Grades Auto-Calculated):</h4>
                  {newSemester.subjects.map((subject, idx) => (
                    <div key={idx} className="subject-form-card">
                      <div className="subject-form-header">
                        <h5>Subject {idx + 1}</h5>
                        {(subject.theoryGrade || subject.practicalGrade) && (
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            {subject.theoryGrade && (
                              <span
                                style={{
                                  fontSize: "14px",
                                  color:
                                    subject.theoryGrade === "ATKT"
                                      ? "#f44336"
                                      : "#2e7d32",
                                  fontWeight: "bold",
                                }}
                              >
                                Theory: {subject.theoryGrade}
                                {subject.theoryGrade === "ATKT" && " ⚠️ FAIL"}
                              </span>
                            )}
                            {subject.practicalGrade && (
                              <span
                                style={{
                                  fontSize: "14px",
                                  color:
                                    subject.practicalGrade === "ATKT"
                                      ? "#f44336"
                                      : "#0277bd",
                                  fontWeight: "bold",
                                }}
                              >
                                Practical: {subject.practicalGrade}
                                {subject.practicalGrade === "ATKT" &&
                                  " ⚠️ FAIL"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="subject-form-body">
                        <div className="form-row">
                          <div className="form-group" style={{ flex: 2 }}>
                            <label>Subject Name *</label>
                            <input
                              type="text"
                              placeholder="e.g., Data Structures"
                              value={subject.subjectName}
                              onChange={(e) =>
                                updateSubject(
                                  idx,
                                  "subjectName",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Theory Fields */}
                        <div
                          style={{
                            padding: "10px",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <h6
                            style={{ margin: "0 0 10px 0", color: "#495057" }}
                          >
                            Theory Component (CP=2 if passed, CP=0 if ATKT)
                          </h6>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Internal Avg (out of 25)</label>
                              <input
                                type="number"
                                min="0"
                                max="25"
                                step="0.01"
                                placeholder="0-25"
                                value={subject.avg}
                                onChange={(e) =>
                                  updateSubject(idx, "avg", e.target.value)
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>Semester End (out of 75)</label>
                              <input
                                type="number"
                                min="0"
                                max="75"
                                step="0.01"
                                placeholder="0-75"
                                value={subject.semesterEnd}
                                onChange={(e) =>
                                  updateSubject(
                                    idx,
                                    "semesterEnd",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            {subject.theoryGrade && (
                              <div className="form-group">
                                <label>Auto Grade</label>
                                <div
                                  style={{
                                    padding: "10px",
                                    background:
                                      subject.theoryGrade === "ATKT"
                                        ? "#ffebee"
                                        : "#e8f5e9",
                                    borderRadius: "4px",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color:
                                      subject.theoryGrade === "ATKT"
                                        ? "#f44336"
                                        : "#2e7d32",
                                  }}
                                >
                                  {subject.theoryGrade}
                                  {subject.theoryGrade === "ATKT" && (
                                    <div style={{ fontSize: "12px" }}>
                                      Sem End &lt; 30 - FAIL
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Practical Fields */}
                        <div
                          style={{
                            padding: "10px",
                            background: "#e7f3ff",
                            borderRadius: "8px",
                          }}
                        >
                          <h6
                            style={{ margin: "0 0 10px 0", color: "#0056b3" }}
                          >
                            Practical Component (CP=1 if passed, CP=0 if ATKT) -
                            Optional
                          </h6>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Practical Marks (out of 50)</label>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.01"
                                placeholder="0-50 (optional)"
                                value={subject.practicalMarks}
                                onChange={(e) =>
                                  updateSubject(
                                    idx,
                                    "practicalMarks",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            {subject.practicalGrade && (
                              <div className="form-group">
                                <label>Auto Grade</label>
                                <div
                                  style={{
                                    padding: "10px",
                                    background:
                                      subject.practicalGrade === "ATKT"
                                        ? "#ffebee"
                                        : "#e3f2fd",
                                    borderRadius: "4px",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color:
                                      subject.practicalGrade === "ATKT"
                                        ? "#f44336"
                                        : "#0277bd",
                                  }}
                                >
                                  {subject.practicalGrade}
                                  {subject.practicalGrade === "ATKT" && (
                                    <div style={{ fontSize: "12px" }}>
                                      Below 20 - FAIL
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-ghost"
                onClick={() => setShowAddSemester(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddSemester}>
                Calculate & Add Semester
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailExam;
