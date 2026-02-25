import React, { useState } from 'react';
import './StudentDetailUniversity.css';

// STANDARD UNIVERSITY GRADING POINTS (10-point scale)
const GRADE_POINTS = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'D': 4,
  'F': 0
};

const StudentDetailUniversity = ({ student, batch, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState(null);

  const [newAttendance, setNewAttendance] = useState({
    month: '',
    percentage: ''
  });

  const [newSemester, setNewSemester] = useState({
    semesterNumber: 1,
    numberOfSubjects: 7,
    subjects: []
  });

  // Initialize subjects array when number changes
  const initializeSubjects = (count) => {
    const subjects = [];
    for (let i = 0; i < count; i++) {
      subjects.push({
        subjectName: '',
        subjectCode: '',
        credits: 4,
        iaI: '',
        iaII: '',
        avg: '',
        practicalTutorial: '',
        semesterEnd: '',
        semesterGrade: ''
      });
    }
    setNewSemester({...newSemester, numberOfSubjects: count, subjects});
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = [...newSemester.subjects];
    updatedSubjects[index][field] = value;
    setNewSemester({...newSemester, subjects: updatedSubjects});
  };

  // Get grade point from grade letter
  const getGradePoint = (grade) => {
    return GRADE_POINTS[grade] || 0;
  };

  // ✅ CORRECT SGPA CALCULATION: Uses ONLY grades and credits
  const calculateSemesterSGPA = (subjects) => {
    let totalQualityPoints = 0;
    let totalCredits = 0;

    subjects.forEach(subject => {
      const gradePoint = GRADE_POINTS[subject.semesterGrade] || 0;
      const credits = parseFloat(subject.credits) || 0;

      totalQualityPoints += gradePoint * credits; // QP = GP × Credits
      totalCredits += credits;
    });

    if (totalCredits === 0) return 0;

    // Calculate SGPA
    const sgpa = totalQualityPoints / totalCredits;
    
    // Round to 2 decimal places (standard university practice)
    return parseFloat(sgpa.toFixed(2));
  };

  // Get semester grade based on SGPA
  const getSemesterGrade = (sgpa) => {
    const sgpaValue = parseFloat(sgpa);
    if (sgpaValue >= 9.5) return 'O';
    if (sgpaValue >= 8.5) return 'A+';
    if (sgpaValue >= 7.5) return 'A';
    if (sgpaValue >= 6.5) return 'B+';
    if (sgpaValue >= 5.5) return 'B';
    if (sgpaValue >= 5.0) return 'C';
    if (sgpaValue >= 4.0) return 'D';
    return 'F';
  };

  const handleAddAttendance = async () => {
    if (!newAttendance.month || !newAttendance.percentage) {
      alert('Please fill all fields');
      return;
    }

    const updatedAttendance = [
      ...(student.attendanceRecords || []),
      { month: newAttendance.month, percentage: parseFloat(newAttendance.percentage) }
    ];

    const avgAttendance = updatedAttendance.reduce((sum, rec) => sum + rec.percentage, 0) / updatedAttendance.length;

    await onUpdate({
      ...student,
      attendanceRecords: updatedAttendance,
      attendance: Math.round(avgAttendance)
    });

    setNewAttendance({ month: '', percentage: '' });
    setShowAddAttendance(false);
  };

  const handleAddSemester = async () => {
    // Validate: At least one subject with name and grade
    const validSubjects = newSemester.subjects.filter(s => 
      s.subjectName.trim() !== '' && s.semesterGrade !== ''
    );
    
    if (validSubjects.length === 0) {
      alert('Please add at least one subject with Subject Name and Grade');
      return;
    }

    // ✅ FIXED: Process subjects correctly - store grade points properly
    const processedSubjects = validSubjects.map(subject => {
      const gradePoint = getGradePoint(subject.semesterGrade);
      
      return {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode || '',
        credits: parseFloat(subject.credits) || 4,
        // Store marks as null if not entered (for display purposes only)
        iaI: subject.iaI !== '' ? parseFloat(subject.iaI) : null,
        iaII: subject.iaII !== '' ? parseFloat(subject.iaII) : null,
        avg: subject.avg !== '' ? parseFloat(subject.avg) : null,
        practicalTutorial: subject.practicalTutorial !== '' ? parseFloat(subject.practicalTutorial) : null,
        semesterEnd: subject.semesterEnd !== '' ? parseFloat(subject.semesterEnd) : null,
        semesterGrade: subject.semesterGrade,
        gradePoint: gradePoint // ✅ STORE THE GRADE POINT EXPLICITLY
      };
    });

    // Calculate semester SGPA using ONLY grades and credits
    const semesterSGPA = calculateSemesterSGPA(validSubjects);
    const semesterGrade = getSemesterGrade(semesterSGPA);

    const newSemesterData = {
      semesterNumber: newSemester.semesterNumber,
      semesterName: `Semester ${['I', 'II', 'III', 'IV', 'V', 'VI'][newSemester.semesterNumber - 1]}`,
      subjects: processedSubjects,
      semesterSGPA: semesterSGPA,
      semesterGrade: semesterGrade
    };

    const updatedSemesters = [...(student.semesters || []), newSemesterData];

    console.log('📊 Semester Data Being Saved:', newSemesterData); // DEBUG LOG

    await onUpdate({
      ...student,
      semesters: updatedSemesters
    });

    // Reset form
    setNewSemester({
      semesterNumber: 1,
      numberOfSubjects: 7,
      subjects: []
    });
    setShowAddSemester(false);
  };

  // ✅ FIXED: Helper to display values correctly
  const displayValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    // If it's a number, show it (even if 0)
    return value;
  };

  return (
    <div className="student-detail-university">
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
            {student.name?.charAt(0) || '?'}
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
              <span><i className="fa-solid fa-envelope"></i> {student.email}</span>
              <span><i className="fa-solid fa-phone"></i> {student.phone}</span>
            </div>
          </div>
        </div>
        <div className="student-banner-right">
          <span className={`status-badge-xl ${student.status?.toLowerCase()}`}>
            {student.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fa-solid fa-chart-pie"></i>
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <i className="fa-solid fa-calendar-check"></i>
          Attendance
        </button>
        <button 
          className={`tab ${activeTab === 'examination' ? 'active' : ''}`}
          onClick={() => setActiveTab('examination')}
        >
          <i className="fa-solid fa-graduation-cap"></i>
          Examination
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
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
                      style={{width: `${student.attendance || 0}%`}}
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
                  <p className="metric-value">{student.semesters?.length || 0}</p>
                  <small>Academic Records</small>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-icon batch-icon">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div className="card-content">
                  <h3>Overall CGPA</h3>
                  <p className="metric-value">
                    {student.semesters && student.semesters.length > 0 
                      ? (student.semesters.reduce((sum, s) => sum + (s.semesterSGPA || 0), 0) / student.semesters.length).toFixed(2)
                      : '0.00'}
                  </p>
                  <small>Cumulative Average</small>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <h2>Quick Stats</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <label>Academic Year</label>
                  <p>{batch.academicYear}</p>
                </div>
                <div className="stat-item">
                  <label>Current Year</label>
                  <p>{student.year}</p>
                </div>
                <div className="stat-item">
                  <label>Department</label>
                  <p>{batch.department}</p>
                </div>
                <div className="stat-item">
                  <label>Batch</label>
                  <p>{batch.batchName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-tab">
            <div className="section-header">
              <h2>Attendance Record</h2>
              <button className="btn-add" onClick={() => setShowAddAttendance(true)}>
                <i className="fa-solid fa-plus"></i>
                Add Record
              </button>
            </div>

            {student.attendanceRecords && student.attendanceRecords.length > 0 ? (
              <div className="attendance-table-wrapper">
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
                    {student.attendanceRecords.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.month}</td>
                        <td className="attendance-percent">{record.percentage}%</td>
                        <td>
                          <span className={`attendance-status ${record.percentage >= 75 ? 'good' : 'low'}`}>
                            {record.percentage >= 75 ? 'Good' : 'Low'}
                          </span>
                        </td>
                        <td>{student.attendance}%</td>
                        <td>
                          {record.percentage >= 90 ? '✓ Excellent' : 
                           record.percentage >= 75 ? '✓ Satisfactory' : 
                           '⚠ Needs Improvement'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-calendar-xmark"></i>
                <p>No attendance records yet</p>
                <button className="btn-primary" onClick={() => setShowAddAttendance(true)}>
                  Add First Record
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'examination' && (
          <div className="examination-tab">
            <div className="section-header">
              <h2>Examination Record</h2>
              <button className="btn-add" onClick={() => setShowAddSemester(true)}>
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
                      onClick={() => setExpandedSemester(expandedSemester === semIdx ? null : semIdx)}
                    >
                      <div className="semester-title">
                        <h3>{semester.semesterName}</h3>
                        <span className="subject-count">{semester.subjects.length} Subjects</span>
                      </div>
                      <div className="semester-stats">
                        <div className="stat">
                          <span className="stat-label">Semester SGPA</span>
                          <span className="stat-value">{semester.semesterSGPA}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Grade</span>
                          <span className="grade-badge">{semester.semesterGrade}</span>
                        </div>
                        <i className={`fa-solid fa-chevron-${expandedSemester === semIdx ? 'up' : 'down'}`}></i>
                      </div>
                    </div>

                    {expandedSemester === semIdx && (
                      <div className="semester-content">
                        <div className="exam-table-wrapper">
                          <table className="exam-table-university">
                            <thead>
                              <tr>
                                <th rowSpan="2" className="subject-header">SUBJECT</th>
                                <th colSpan="3" className="internal-header">INTERNAL ASSESSMENT EXAMINATION</th>
                                <th rowSpan="2" className="practical-header">PRACTICAL/TUT ASSESSMENT</th>
                                <th rowSpan="2" className="semester-exam-header">SEMESTER END EXAMINATION</th>
                                <th rowSpan="2" className="grade-header">SEMESTER END GRADE</th>
                                <th rowSpan="2" className="overall-header">CREDITS / GRADE POINT</th>
                              </tr>
                              <tr>
                                <th className="ia-header">IA-I</th>
                                <th className="ia-header">IA-II</th>
                                <th className="avg-header">AVG</th>
                              </tr>
                            </thead>
                            <tbody>
                              {semester.subjects.map((subject, subIdx) => {
                                // ✅ FIXED: Get grade point correctly
                                const gradePoint = subject.gradePoint || getGradePoint(subject.semesterGrade);
                                
                                return (
                                  <tr key={subIdx}>
                                    <td className="subject-name">
                                      <div className="subject-info">
                                        <span className="subject-title">{subject.subjectName}</span>
                                        {subject.subjectCode && (
                                          <span className="subject-code">{subject.subjectCode}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="ia-cell">{displayValue(subject.iaI)}</td>
                                    <td className="ia-cell">{displayValue(subject.iaII)}</td>
                                    <td className="avg-cell">{displayValue(subject.avg)}</td>
                                    <td className="practical-cell">{displayValue(subject.practicalTutorial)}</td>
                                    <td className="semester-end-cell">{displayValue(subject.semesterEnd)}</td>
                                    <td className="grade-cell">
                                      <span className="grade-badge">{subject.semesterGrade}</span>
                                    </td>
                                    <td className="overall-cell">
                                      <div className="overall-cell-content">
                                        <span className="subject-code">Credits: {subject.credits || 4}</span>
                                        <span className="sgpa-value">GP: {gradePoint}</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="overall-row">
                                <td colSpan="7" className="overall-label">
                                  Overall SGPA and Grade:
                                </td>
                                <td className="overall-values">
                                  <div className="sgpa-grade-display">
                                    <span className="sgpa-text">SGPA: {semester.semesterSGPA}</span>
                                    <span className="grade-text">{semester.semesterGrade}</span>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-file-circle-xmark"></i>
                <p>No semester records yet</p>
                <button className="btn-primary" onClick={() => setShowAddSemester(true)}>
                  Add First Semester
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Attendance Modal */}
      {showAddAttendance && (
        <div className="modal-overlay" onClick={() => setShowAddAttendance(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Attendance Record</h3>
              <button onClick={() => setShowAddAttendance(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Month</label>
                <input 
                  type="text" 
                  placeholder="e.g., June, July"
                  value={newAttendance.month}
                  onChange={(e) => setNewAttendance({...newAttendance, month: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Attendance Percentage</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g., 89.7"
                  value={newAttendance.percentage}
                  onChange={(e) => setNewAttendance({...newAttendance, percentage: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowAddAttendance(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddAttendance}>
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Semester Modal */}
      {showAddSemester && (
        <div className="modal-overlay" onClick={() => setShowAddSemester(false)}>
          <div className="modal-box modal-xl" onClick={(e) => e.stopPropagation()}>
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
                    onChange={(e) => setNewSemester({...newSemester, semesterNumber: parseInt(e.target.value)})}
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
                    onChange={(e) => initializeSubjects(parseInt(e.target.value))}
                    placeholder="e.g., 7"
                  />
                </div>
              </div>

              {newSemester.subjects.length > 0 && (
                <div className="subjects-section">
                  <h4>Enter Subject Details:</h4>
                  <div style={{
                    fontSize: '13px', 
                    color: '#64748b', 
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '6px'
                  }}>
                    <strong>📊 SGPA Calculation Formula:</strong><br/>
                    SGPA = Σ(Grade Point × Credits) / Σ(Credits)<br/>
                    <strong>Note:</strong> Marks fields are optional and for display only. SGPA is calculated using only <strong>Grades</strong> and <strong>Credits</strong>.
                  </div>
                  {newSemester.subjects.map((subject, idx) => (
                    <div key={idx} className="subject-form-card">
                      <div className="subject-form-header">
                        <h5>Subject {idx + 1}</h5>
                      </div>
                      <div className="subject-form-body">
                        <div className="form-row">
                          <div className="form-group" style={{flex: 2}}>
                            <label>Subject Name *</label>
                            <input 
                              type="text" 
                              placeholder="e.g., Data Science"
                              value={subject.subjectName}
                              onChange={(e) => updateSubject(idx, 'subjectName', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Code (Opt)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., CS301"
                              value={subject.subjectCode}
                              onChange={(e) => updateSubject(idx, 'subjectCode', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{flex: 0.5}}>
                            <label>Credits *</label>
                            <input 
                              type="number" 
                              min="1"
                              max="10"
                              value={subject.credits}
                              onChange={(e) => updateSubject(idx, 'credits', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>IA-I (Optional, for display)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="50"
                              step="0.1"
                              placeholder="Out of 50"
                              value={subject.iaI}
                              onChange={(e) => updateSubject(idx, 'iaI', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>IA-II (Optional, for display)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="50"
                              step="0.1"
                              placeholder="Out of 50"
                              value={subject.iaII}
                              onChange={(e) => updateSubject(idx, 'iaII', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>AVG (Optional, for display)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="50"
                              step="0.1"
                              placeholder="Out of 50"
                              value={subject.avg}
                              onChange={(e) => updateSubject(idx, 'avg', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Practical/Tutorial (Optional, for display)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="50"
                              step="0.1"
                              placeholder="Out of 50"
                              value={subject.practicalTutorial}
                              onChange={(e) => updateSubject(idx, 'practicalTutorial', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Semester End (Optional, for display)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="Out of 100"
                              value={subject.semesterEnd}
                              onChange={(e) => updateSubject(idx, 'semesterEnd', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Semester Grade * (Used for SGPA)</label>
                            <select 
                              value={subject.semesterGrade}
                              onChange={(e) => updateSubject(idx, 'semesterGrade', e.target.value)}
                              style={{
                                borderColor: subject.semesterGrade ? '#e2e8f0' : '#ef4444',
                                borderWidth: '2px'
                              }}
                            >
                              <option value="">⚠️ Select Grade</option>
                              <option value="O">O - Outstanding (10 points)</option>
                              <option value="A+">A+ - Excellent (9 points)</option>
                              <option value="A">A - Very Good (8 points)</option>
                              <option value="B+">B+ - Good (7 points)</option>
                              <option value="B">B - Above Average (6 points)</option>
                              <option value="C">C - Average (5 points)</option>
                              <option value="D">D - Pass (4 points)</option>
                              <option value="F">F - Fail (0 points)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowAddSemester(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddSemester}>
                Add Semester
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailUniversity;
