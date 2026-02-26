import React, { useState } from 'react';
import './StudentDetailSemester.css';

const StudentDetailSemester = ({ student, batch, onBack, onUpdate }) => {
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
        avg: '', // Direct average field instead of IA-I and IA-II
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

  const calculateSubjectMetrics = (subject) => {
    const avg = parseFloat(subject.avg) || 0;
    const practical = parseFloat(subject.practicalTutorial) || 0;
    const semesterEnd = parseFloat(subject.semesterEnd) || 0;
    
    // Calculate total marks (out of 100)
    // Assuming: AVG is weighted, Practical and Semester End are direct marks
    const totalMarks = avg + practical + semesterEnd;
    const percentage = (totalMarks / 200) * 100; // Convert to percentage
    
    // Calculate SGPA based on percentage (10-point scale)
    let sgpa = 0;
    let grade = 'F';
    
    if (percentage >= 90) {
      sgpa = 10;
      grade = 'O'; // Outstanding
    } else if (percentage >= 80) {
      sgpa = 9;
      grade = 'A+';
    } else if (percentage >= 70) {
      sgpa = 8;
      grade = 'A';
    } else if (percentage >= 60) {
      sgpa = 7;
      grade = 'B+';
    } else if (percentage >= 55) {
      sgpa = 6;
      grade = 'B';
    } else if (percentage >= 50) {
      sgpa = 5;
      grade = 'C';
    } else if (percentage >= 45) {
      sgpa = 4;
      grade = 'D';
    } else if (percentage >= 40) {
      sgpa = 4;
      grade = 'E';
    } else {
      sgpa = 0;
      grade = 'F';
    }
    
    return { avg, sgpa: sgpa.toFixed(2), grade };
  };

  const calculateSemesterSGPA = (subjects) => {
    const totalSGPA = subjects.reduce((sum, s) => {
      const { sgpa } = calculateSubjectMetrics(s);
      return sum + parseFloat(sgpa);
    }, 0);
    const avgSGPA = (totalSGPA / subjects.length).toFixed(2);
    
    // Calculate semester grade based on average SGPA
    let semesterGrade = 'F';
    const sgpaValue = parseFloat(avgSGPA);
    
    if (sgpaValue >= 9.5) {
      semesterGrade = 'O';
    } else if (sgpaValue >= 8.5) {
      semesterGrade = 'A+';
    } else if (sgpaValue >= 7.5) {
      semesterGrade = 'A';
    } else if (sgpaValue >= 6.5) {
      semesterGrade = 'B+';
    } else if (sgpaValue >= 5.5) {
      semesterGrade = 'B';
    } else if (sgpaValue >= 5.0) {
      semesterGrade = 'C';
    } else if (sgpaValue >= 4.0) {
      semesterGrade = 'D';
    } else {
      semesterGrade = 'F';
    }
    
    return { avgSGPA, semesterGrade };
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
    // Validate all subjects have names
    const validSubjects = newSemester.subjects.filter(s => s.subjectName.trim() !== '');
    
    if (validSubjects.length === 0) {
      alert('Please add at least one subject');
      return;
    }

    // Calculate metrics for all subjects
    const processedSubjects = validSubjects.map(subject => {
      const { avg, sgpa, grade } = calculateSubjectMetrics(subject);
      return {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode || '',
        avg: parseFloat(subject.avg) || 0,
        practicalTutorial: parseFloat(subject.practicalTutorial) || 0,
        semesterEnd: parseFloat(subject.semesterEnd) || 0,
        semesterGrade: grade,
        overallSGPA: parseFloat(sgpa)
      };
    });

    const { avgSGPA, semesterGrade } = calculateSemesterSGPA(validSubjects);

    const newSemesterData = {
      semesterNumber: newSemester.semesterNumber,
      semesterName: `Semester ${['I', 'II', 'III', 'IV', 'V', 'VI'][newSemester.semesterNumber - 1]}`,
      subjects: processedSubjects,
      semesterSGPA: parseFloat(avgSGPA),
      semesterGrade: semesterGrade
    };

    const updatedSemesters = [...(student.semesters || []), newSemesterData];

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

  return (
    <div className="student-detail-semester">
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
                  <h3>Overall SGPA</h3>
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
                          <table className="exam-table">
                            <thead>
                              <tr>
                                <th>SUBJECT</th>
                                <th>AVG</th>
                                <th>PRACTICAL/TUT ASSESSMENT</th>
                                <th>SEMESTER END EXAMINATION</th>
                                <th>OVERALL SGPA AND GRADE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {semester.subjects.map((subject, subIdx) => (
                                <tr key={subIdx}>
                                  <td className="subject-name">
                                    <div className="subject-info">
                                      <span className="subject-title">{subject.subjectName}</span>
                                      {subject.subjectCode && (
                                        <span className="subject-code">{subject.subjectCode}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="avg-marks">{subject.avg}</td>
                                  <td>{subject.practicalTutorial}</td>
                                  <td>{subject.semesterEnd}</td>
                                  <td>
                                    <div className="sgpa-grade-cell">
                                      <span className="sgpa-value">SGPA: {subject.overallSGPA}</span>
                                      <span className="grade-badge-inline">{subject.semesterGrade}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              <tr className="total-row">
                                <td colSpan="4" style={{textAlign: 'right', fontWeight: 'bold'}}>
                                  Average SGPA:
                                </td>
                                <td>
                                  <span className="sgpa-value">{semester.semesterSGPA}</span>
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
                            <label>Code (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., CS301"
                              value={subject.subjectCode}
                              onChange={(e) => updateSubject(idx, 'subjectCode', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Average (AVG)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="e.g., 42.5"
                              value={subject.avg}
                              onChange={(e) => updateSubject(idx, 'avg', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Practical/Tutorial</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={subject.practicalTutorial}
                              onChange={(e) => updateSubject(idx, 'practicalTutorial', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Semester End</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={subject.semesterEnd}
                              onChange={(e) => updateSubject(idx, 'semesterEnd', e.target.value)}
                            />
                          </div>
                        </div>
                        <p style={{fontSize: '12px', color: '#64748b', marginTop: '10px', fontStyle: 'italic'}}>
                          * Grade will be calculated automatically based on marks
                        </p>
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

export default StudentDetailSemester;

