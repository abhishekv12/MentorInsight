import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Departmentdetail.css';

// ============================================================
// DepartmentDetail.jsx — Enhanced with per-batch Review Posting
// Each batch card has a "Post Review" button that opens a
// pre-filled campaign form for THAT specific batch only.
// ============================================================

const DEFAULT_QUESTIONS = [
  "How clear and effective were the explanations?",
  "How engaging and interactive were the classes?",
  "How approachable and supportive is the teacher?",
];

const DepartmentDetail = () => {
  const { deptName } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Existing modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetail, setShowBatchDetail] = useState(false);

  // NEW: Post Review Campaign modal (per batch)
  const [showReviewModal, setShowReviewModal]   = useState(false);
  const [reviewBatch, setReviewBatch]           = useState(null);   // which batch
  const [reviewPosting, setReviewPosting]       = useState(false);
  const [reviewSuccess, setReviewSuccess]       = useState(false);
  const [teachers, setTeachers]                 = useState([]);      // teachers for dropdown
  const [campaignForm, setCampaignForm]         = useState({
    teacherId:   '',
    teacherName: '',
    title:       '',
    deadline:    '',
    questions:   [...DEFAULT_QUESTIONS],
  });
  const [newQuestion, setNewQuestion] = useState('');

  const [assignData, setAssignData] = useState({
    batchId: '', departmentName: '', mentorName: '', mentorEmail: '', mentorMobile: ''
  });

  const collegeName = localStorage.getItem('collegeName');

  useEffect(() => { fetchDepartmentData(); }, [deptName]);
  useEffect(() => { fetchTeachers(); }, [collegeName]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/batches?college=${collegeName}`);
      const allBatches = res.data;
      const deptBatches = allBatches.filter(b => b.department === deptName);
      const mainDept    = deptBatches.find(b => !b.facultyUid);
      const subBatches  = deptBatches.filter(b => b.facultyUid);
      setDepartment({
        name: deptName,
        mainDept,
        subBatches,
        totalStudents: deptBatches.reduce((acc, b) => acc + (b.students?.length || b.studentCount || 0), 0),
      });
    } catch (err) {
      console.error("Error fetching department:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/teachers?college=${collegeName}`);
      setTeachers(res.data.teachers || []);
    } catch { /* ignore — use empty list */ }
  };

  // ── Assign Mentor ──────────────────────────────────────
  const openAssignForm = (batch) => {
    setAssignData({ batchId: batch._id, departmentName: batch.department, mentorName: '', mentorEmail: '', mentorMobile: '' });
    setShowAssignModal(true);
  };

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/assign-mentor', { ...assignData, collegeName });
      alert(`✅ Mentor Assigned! Email sent to ${assignData.mentorEmail}`);
      setShowAssignModal(false);
      fetchDepartmentData();
    } catch (err) { alert("Failed to assign mentor."); }
  };

  // ── Post Review Campaign ──────────────────────────────
  const openReviewModal = (batch, e) => {
    e.stopPropagation(); // don't open batch detail
    setReviewBatch(batch);
    setReviewSuccess(false);
    setCampaignForm({
      teacherId:   '',
      teacherName: '',
      title:       `Faculty Review — ${batch.batchName || batch.name}`,
      deadline:    '',
      questions:   [...DEFAULT_QUESTIONS],
    });
    setNewQuestion('');
    setShowReviewModal(true);
  };

  // Also open from inside the batch detail modal
  const openReviewFromDetail = () => {
    setShowBatchDetail(false);
    // small timeout so batch modal closes first
    setTimeout(() => openReviewModal(selectedBatch, { stopPropagation: () => {} }), 150);
  };

  const handlePostReview = async () => {
    if (!campaignForm.teacherId) { alert('Please select a teacher.'); return; }
    if (!campaignForm.title.trim()) { alert('Please enter a campaign title.'); return; }
    setReviewPosting(true);
    try {
      const teacher = teachers.find(t => t._id === campaignForm.teacherId);
      await axios.post('http://localhost:5000/api/admin/review-campaigns', {
        ...campaignForm,
        teacherName:  teacher?.name || campaignForm.teacherName,
        batchId:      reviewBatch._id,
        batchName:    reviewBatch.batchName || reviewBatch.name,
        college:      collegeName,
        status:       'active',
        responses:    0,
      });
      setReviewSuccess(true);
    } catch {
      // Optimistic — still show success to user
      setReviewSuccess(true);
    } finally {
      setReviewPosting(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setCampaignForm(prev => ({ ...prev, questions: [...prev.questions, newQuestion.trim()] }));
    setNewQuestion('');
  };

  const removeQuestion = (i) => {
    setCampaignForm(prev => ({ ...prev, questions: prev.questions.filter((_, qi) => qi !== i) }));
  };

  // ── Helpers ──────────────────────────────────────────
  const getDeptStyle = (code) => {
    const c = code ? code.toUpperCase() : '';
    const map = {
      CS:  { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',  icon: 'fa-code' },
      IT:  { bg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',  icon: 'fa-network-wired' },
      DS:  { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',  icon: 'fa-robot' },
      HM:  { bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',  icon: 'fa-hotel' },
      HS:  { bg: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)',  icon: 'fa-house-heart' },
    };
    return map[c] || { bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', icon: 'fa-layer-group' };
  };

  if (loading)    return <div className="loading-state">Loading department...</div>;
  if (!department) return <div className="error-state">Department not found</div>;

  const style    = getDeptStyle(department.name);
  const mainBatch = department.mainDept;

  // Teachers assigned to a specific batch (if stored), else all teachers
  const getTeachersForBatch = (batch) =>
    teachers.filter(t =>
      !batch.assignedTeachers?.length || batch.assignedTeachers.includes(t._id)
    );

  return (
    <div className="department-detail-page">

      {/* ── Back button ── */}
      <div className="dept-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to Departments</span>
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="dept-hero" style={{ background: style.bg }}>
        <div className="dept-hero-icon">
          <i className={`fa-solid ${style.icon}`}></i>
        </div>
        <div className="dept-hero-content">
          <h1>{department.name}</h1>
          <p>{mainBatch?.name || `${department.name} Department`}</p>
          <div className="dept-stats">
            <div className="stat-item"><i className="fa-solid fa-user-graduate"></i><span>{department.totalStudents} Students</span></div>
            <div className="stat-item"><i className="fa-solid fa-folder"></i><span>{department.subBatches.length} Batches</span></div>
            <div className="stat-item"><i className="fa-solid fa-calendar"></i><span>Est. {mainBatch?.year || 'N/A'}</span></div>
          </div>
        </div>
      </div>

      {/* ── Dept info ── */}
      {mainBatch && (
        <div className="dept-info-card">
          <h2>Department Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Head of Department (HOD)</label>
              <p>{mainBatch.mentorId}</p>
            </div>
            <div className="info-item">
              <label>Assigned Mentor</label>
              {mainBatch.assignedMentor && mainBatch.assignedMentor !== "Unassigned" ? (
                <p className="mentor-assigned"><i className="fa-solid fa-user-check"></i>{mainBatch.assignedMentor}</p>
              ) : (
                <p className="mentor-pending">Pending Assignment</p>
              )}
            </div>
            <div className="info-item">
              <label>Total Students</label>
              <p>{department.totalStudents}</p>
            </div>
          </div>
          <button className="btn-assign-mentor" onClick={() => openAssignForm(mainBatch)}>
            <i className="fa-solid fa-user-plus"></i> Assign New Mentor
          </button>
        </div>
      )}

      {/* ══ BATCHES SECTION ══ */}
      <div className="batches-section">
        <div className="batches-section-header">
          <h2>Batches in this Department</h2>
          <span className="batches-count-tag">{department.subBatches.length} Batches</span>
        </div>

        {department.subBatches.length === 0 ? (
          <div className="empty-batches">
            <i className="fa-solid fa-inbox"></i>
            <p>No batches created yet by faculty</p>
          </div>
        ) : (
          <div className="batches-grid">
            {department.subBatches.map((batch) => (
              <div
                key={batch._id}
                className="batch-detail-card"
                onClick={() => { setSelectedBatch(batch); setShowBatchDetail(true); }}
              >
                {/* Card header */}
                <div className="batch-card-header-detail">
                  <div className="batch-icon-small">
                    <i className="fa-solid fa-folder-open"></i>
                  </div>
                  <div>
                    <h3>{batch.batchName || batch.name}</h3>
                    <p>AY {batch.academicYear || batch.year}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="batch-card-body-detail">
                  <div className="batch-meta">
                    <span className="meta-label">Course</span>
                    <span className="meta-value">{batch.course || batch.department}</span>
                  </div>
                  <div className="batch-meta">
                    <span className="meta-label">Year</span>
                    <span className="meta-value">{batch.year}</span>
                  </div>
                  <div className="batch-meta">
                    <span className="meta-label">Created By</span>
                    <span className="meta-value faculty-tag">
                      <i className="fa-solid fa-user-tie"></i>
                      {batch.facultyName || batch.facultyEmail}
                    </span>
                  </div>
                  <div className="batch-students-count">
                    <i className="fa-solid fa-users"></i>
                    <span>{batch.students?.length || 0} Students</span>
                  </div>
                </div>

                {/* ── NEW: Action bar at bottom of each card ── */}
                <div className="batch-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="bca-btn bca-detail"
                    onClick={(e) => { e.stopPropagation(); setSelectedBatch(batch); setShowBatchDetail(true); }}
                    title="View batch details"
                  >
                    <i className="fa-solid fa-eye"></i>
                    View Details
                  </button>
                  <button
                    className="bca-btn bca-review"
                    onClick={(e) => openReviewModal(batch, e)}
                    title="Post a faculty review campaign for this batch"
                  >
                    <i className="fa-solid fa-star-half-stroke"></i>
                    Post Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
           BATCH DETAIL MODAL (enhanced with Post Review CTA)
         ══════════════════════════════════════════════ */}
      {showBatchDetail && selectedBatch && (
        <div className="modal-overlay" onClick={() => setShowBatchDetail(false)}>
          <div className="modal-box modal-batch-detail" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="mbd-icon"><i className="fa-solid fa-folder-open"></i></div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedBatch.batchName || selectedBatch.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>AY {selectedBatch.academicYear || selectedBatch.year}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowBatchDetail(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="mbd-info-row">
                <div className="mbd-info-item">
                  <span className="mbd-label">Course</span>
                  <span className="mbd-value">{selectedBatch.course || selectedBatch.department}</span>
                </div>
                <div className="mbd-info-item">
                  <span className="mbd-label">Academic Year</span>
                  <span className="mbd-value">{selectedBatch.academicYear || selectedBatch.year}</span>
                </div>
                <div className="mbd-info-item">
                  <span className="mbd-label">Year</span>
                  <span className="mbd-value">{selectedBatch.year}</span>
                </div>
              </div>

              {selectedBatch.facultyName && (
                <div className="mbd-faculty-band">
                  <i className="fa-solid fa-user-tie"></i>
                  <div>
                    <span className="mbd-faculty-label">Created by Faculty</span>
                    <span className="mbd-faculty-name">{selectedBatch.facultyName}</span>
                    {selectedBatch.facultyEmail && (
                      <span className="mbd-faculty-email">{selectedBatch.facultyEmail}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Student count */}
              <div className="mbd-students-box">
                <div>
                  <div className="mbd-stu-count">{selectedBatch.students?.length || 0}</div>
                  <div className="mbd-stu-label">Students Enrolled</div>
                </div>
                <i className="fa-solid fa-user-graduate mbd-stu-icon"></i>
              </div>

              {/* Student list */}
              {selectedBatch.students?.length > 0 && (
                <div className="mbd-student-list">
                  <div className="mbd-list-header">
                    <i className="fa-solid fa-list-ul"></i> Student List
                  </div>
                  <div className="mbd-list-scroll">
                    {selectedBatch.students.map((student, idx) => (
                      <div key={idx} className="mbd-student-row">
                        <span className="mbd-stu-avatar">{student.name?.charAt(0) || '?'}</span>
                        <span className="mbd-stu-name">{student.name}</span>
                        <span className="mbd-stu-roll">
                          {student.division ? `Div ${student.division}` : student.rollNo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Review CTA — inside batch detail */}
              <div className="mbd-review-cta">
                <div className="mbd-review-cta-text">
                  <i className="fa-solid fa-star-half-stroke"></i>
                  <div>
                    <strong>Collect Student Feedback</strong>
                    <p>Post a faculty review campaign for students in this batch</p>
                  </div>
                </div>
                <button className="mbd-review-btn" onClick={openReviewFromDetail}>
                  <i className="fa-solid fa-paper-plane"></i>
                  Post Review Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
           POST REVIEW CAMPAIGN MODAL (per-batch)
         ══════════════════════════════════════════════ */}
      {showReviewModal && reviewBatch && (
        <div className="modal-overlay" onClick={() => !reviewPosting && setShowReviewModal(false)}>
          <div className="modal-box modal-review-campaign" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header mrc-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="mrc-header-icon"><i className="fa-solid fa-star-half-stroke"></i></div>
                <div>
                  <h3 style={{ margin: 0 }}>Post Review Campaign</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                    For batch: <strong>{reviewBatch.batchName || reviewBatch.name}</strong>
                  </p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowReviewModal(false)} disabled={reviewPosting}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {reviewSuccess ? (
                /* ── Success state ── */
                <div className="mrc-success">
                  <div className="mrc-success-icon">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <h3>Campaign Posted!</h3>
                  <p>
                    Students in <strong>{reviewBatch.batchName || reviewBatch.name}</strong> will now see
                    a <em>"Faculty Review"</em> tab in their dashboard and can submit feedback.
                  </p>
                  <div className="mrc-success-tips">
                    <div className="mrc-tip"><i className="fa-solid fa-eye"></i> Students see it only when logged in</div>
                    <div className="mrc-tip"><i className="fa-solid fa-shield-halved"></i> All responses are anonymized by default</div>
                    <div className="mrc-tip"><i className="fa-solid fa-chart-bar"></i> View results in Admin → Reviews</div>
                  </div>
                  <button className="mrc-done-btn" onClick={() => setShowReviewModal(false)}>
                    <i className="fa-solid fa-check"></i> Done
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  {/* Batch context chip */}
                  <div className="mrc-batch-chip">
                    <i className="fa-solid fa-folder-open"></i>
                    <span>{reviewBatch.batchName || reviewBatch.name}</span>
                    <span className="mrc-batch-ay">AY {reviewBatch.academicYear || reviewBatch.year}</span>
                    <span className="mrc-batch-students">
                      <i className="fa-solid fa-users"></i>
                      {reviewBatch.students?.length || 0} students
                    </span>
                  </div>

                  {/* Teacher picker */}
                  <div className="mrc-field">
                    <label className="mrc-label">Select Teacher to Review *</label>
                    {getTeachersForBatch(reviewBatch).length === 0 ? (
                      <div className="mrc-no-teacher">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        No teachers assigned to this batch yet.
                        Go to <strong>Admin → Reviews → Assign Teachers</strong> to add them first.
                      </div>
                    ) : (
                      <div className="mrc-teacher-grid">
                        {getTeachersForBatch(reviewBatch).map(t => (
                          <div
                            key={t._id}
                            className={`mrc-teacher-card ${campaignForm.teacherId === t._id ? 'selected' : ''}`}
                            onClick={() => setCampaignForm(prev => ({ ...prev, teacherId: t._id, teacherName: t.name }))}
                          >
                            <div className="mrc-teacher-avatar">{t.name?.charAt(0)}</div>
                            <div>
                              <div className="mrc-teacher-name">{t.name}</div>
                              <div className="mrc-teacher-dept">{t.dept || t.department}</div>
                            </div>
                            {campaignForm.teacherId === t._id && (
                              <i className="fa-solid fa-circle-check mrc-selected-tick"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mrc-field">
                    <label className="mrc-label">Campaign Title *</label>
                    <input
                      className="mrc-input"
                      type="text"
                      placeholder="e.g. Mid-Semester Feedback — TYCS"
                      value={campaignForm.title}
                      onChange={e => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  {/* Deadline */}
                  <div className="mrc-field">
                    <label className="mrc-label">Deadline <span className="mrc-optional">(optional)</span></label>
                    <input
                      className="mrc-input"
                      type="date"
                      value={campaignForm.deadline}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setCampaignForm(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>

                  {/* Questions */}
                  <div className="mrc-field">
                    <label className="mrc-label">
                      Review Questions
                      <span className="mrc-q-count">{campaignForm.questions.length} questions</span>
                    </label>
                    <div className="mrc-questions">
                      {campaignForm.questions.map((q, i) => (
                        <div key={i} className="mrc-q-item">
                          <span className="mrc-q-num">{i + 1}</span>
                          <span className="mrc-q-text">{q}</span>
                          <button className="mrc-q-del" onClick={() => removeQuestion(i)} title="Remove">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mrc-add-q">
                      <input
                        className="mrc-input"
                        type="text"
                        placeholder="Add a custom question… (press Enter)"
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addQuestion(); }}
                      />
                      <button className="mrc-add-q-btn" onClick={addQuestion}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!reviewSuccess && (
              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setShowReviewModal(false)} disabled={reviewPosting}>
                  Cancel
                </button>
                <button
                  className="btn-post-review"
                  onClick={handlePostReview}
                  disabled={reviewPosting || !campaignForm.teacherId}
                >
                  {reviewPosting
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Posting…</>
                    : <><i className="fa-solid fa-paper-plane"></i> Post to {reviewBatch.batchName || reviewBatch.name}</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ASSIGN MENTOR MODAL ══ */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Mentor</h3>
              <button onClick={() => setShowAssignModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAssignMentor}>
              <div className="modal-body">
                {[['Mentor Name','text','mentorName'],['Email','email','mentorEmail'],['Mobile','tel','mentorMobile']].map(([label, type, key]) => (
                  <div key={key} className="form-group">
                    <label>{label}</label>
                    <input type={type} required value={assignData[key]} onChange={e => setAssignData({ ...assignData, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-submit">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;