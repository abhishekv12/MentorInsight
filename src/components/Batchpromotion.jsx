import React, { useState } from 'react';
import axios from 'axios';
import './BatchPromotion.css';

// Props: batches (ALL batches array), onClose, onPromotionComplete
const BatchPromotion = ({ batches, onClose, onPromotionComplete }) => {
  const [step, setStep] = useState('select');   // 'select' | 'confirm' | 'result'
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [promoting, setPromoting] = useState(false);
  const [promotionResult, setPromotionResult] = useState(null);
  const [targetAcademicYear, setTargetAcademicYear] = useState('');

  // Only FY/SY/TY batches that have students
  const promotableBatches = (batches || []).filter(b =>
    ['FY', 'SY', 'TY'].includes(b.year) &&
    (b.students?.length || 0) > 0
  );

  const yearMap = { FY: 'SY', SY: 'TY', TY: 'GRADUATED' };
  const yearColors = {
    FY: { bg: '#eff6ff', border: '#3b82f6', badge: '#2563eb', text: '#1e40af' },
    SY: { bg: '#f0fdf4', border: '#22c55e', badge: '#16a34a', text: '#14532d' },
    TY: { bg: '#faf5ff', border: '#a855f7', badge: '#9333ea', text: '#581c87' },
  };

  const getNextAcademicYear = (ay) => {
    const parts = ay.split('-');
    const s = parseInt(parts[0]) + 1;
    const e = parseInt(parts[1]) + 1;
    return `${s}-${e}`;
  };

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    setTargetAcademicYear(getNextAcademicYear(batch.academicYear));
    setStep('confirm');
  };

  // ✅ FIXED: Compute eligibility - now properly checks for semester records AND completion
  const getEligibility = (batch) => {
    if (!batch?.students?.length) return { eligible: [], ineligible: [] };
    
    // ✅ Define required number of semesters per year
    const requiredSemesters = {
      'FY': 2,  // First Year = Sem 1 + Sem 2
      'SY': 2,  // Second Year = Sem 3 + Sem 4
      'TY': 2,  // Third Year = Sem 5 + Sem 6
    };
    
    const eligible = [], ineligible = [];
    
    batch.students.forEach(student => {
      // ✅ CRITICAL FIX: Check if student has semester records first
      const hasSemesterData = student.semesters && student.semesters.length > 0;
      
      if (!hasSemesterData) {
        // ❌ No semester data = not eligible for promotion
        ineligible.push({
          ...student,
          totalATKT: 0,
          hasFailedSemester: false,
          reason: 'No semester examination records found',
        });
        return; // Skip to next student
      }

      // ✅ NEW CHECK: Verify student has completed ALL required semesters for their year
      const required = requiredSemesters[batch.year] || 2;
      const completed = student.semesters.length;
      
      if (completed < required) {
        ineligible.push({
          ...student,
          totalATKT: 0,
          hasFailedSemester: false,
          reason: `Only ${completed} of ${required} required semesters completed`,
        });
        return; // Skip to next student
      }

      // ✅ Calculate ATKT and check for failed semesters
      let totalATKT = 0, hasFailedSemester = false;
      student.semesters.forEach(sem => {
        let semATKT = 0;
        (sem.subjects || []).forEach(sub => {
          if (sub.theoryGrade === 'ATKT') semATKT++;
          if (sub.practicalGrade === 'ATKT') semATKT++;
        });
        totalATKT += semATKT;
        if (sem.status === 'FAIL' || semATKT >= 3) hasFailedSemester = true;
      });
      
      // ✅ Student must have completed all semesters AND meet promotion criteria
      if (!hasFailedSemester && totalATKT < 3) {
        eligible.push({ ...student, totalATKT });
      } else {
        ineligible.push({
          ...student, totalATKT, hasFailedSemester,
          reason: hasFailedSemester
            ? 'Failed semester (3+ ATKT in one semester)'
            : `${totalATKT} total ATKT subjects`,
        });
      }
    });
    return { eligible, ineligible };
  };

  const { eligible, ineligible } = selectedBatch
    ? getEligibility(selectedBatch)
    : { eligible: [], ineligible: [] };

  const handlePromote = async () => {
    if (eligible.length === 0) { alert('No eligible students!'); return; }
    const nextYear = yearMap[selectedBatch.year];
    if (!window.confirm(
      `Promote ${eligible.length} student(s) from ${selectedBatch.batchName} (${selectedBatch.year}) → ${nextYear} (${targetAcademicYear})?\n\n` +
      `• Source batch stays ACTIVE — you can add & promote again anytime\n` +
      `• Already-promoted students won't be duplicated`
    )) return;

    try {
      setPromoting(true);
      const response = await axios.post('http://localhost:5000/api/faculty/promote-batch', {
        batchId: selectedBatch.id,
        currentYear: selectedBatch.year,
        currentAcademicYear: selectedBatch.academicYear,
        eligibleStudentIds: eligible.map(s => s._id),
        targetAcademicYear,
      });
      setPromotionResult(response.data);
      setStep('result');
      onPromotionComplete();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-promotion" onClick={e => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step !== 'select' && (
              <button
                onClick={() => { setStep('select'); setSelectedBatch(null); setPromotionResult(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667eea', fontSize: '18px', padding: '0' }}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            )}
            <h2 style={{ margin: 0 }}>
              🎓 {step === 'select' ? 'Promote Batch — Select Class'
                  : step === 'confirm' ? `Promote ${selectedBatch?.batchName}`
                  : 'Promotion Complete'}
            </h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">

          {/* ══════════════════════════════
               STEP 1 — CLASS SELECTOR
          ══════════════════════════════ */}
          {step === 'select' && (
            <>
              <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>
                Select the class you want to promote to the next year:
              </p>

              {promotableBatches.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <i className="fa-solid fa-graduation-cap" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}></i>
                  <p>No eligible batches found.<br />Only FY / SY / TY batches with students can be promoted.</p>
                </div>
              ) : (
                <div className="batch-selector-grid">
                  {promotableBatches.map((batch) => {
                    const colors = yearColors[batch.year] || yearColors.FY;
                    const nextYr = yearMap[batch.year] || '—';
                    const { eligible: el, ineligible: inel } = getEligibility(batch);
                    return (
                      <div
                        key={batch.id}
                        className="batch-select-card"
                        style={{ borderColor: colors.border, background: colors.bg }}
                        onClick={() => handleSelectBatch(batch)}
                      >
                        <div className="bsc-top">
                          <span className="bsc-year-badge" style={{ background: colors.badge }}>
                            {batch.year}
                          </span>
                          <span className="bsc-arrow" style={{ color: colors.badge }}>
                            → {nextYr}
                          </span>
                        </div>

                        <h3 className="bsc-name" style={{ color: colors.text }}>
                          {batch.batchName}
                        </h3>
                        <p className="bsc-meta">{batch.course} &nbsp;•&nbsp; AY {batch.academicYear}</p>

                        <div className="bsc-stats">
                          <div className="bsc-stat" style={{ borderColor: '#22c55e', background: '#f0fdf4' }}>
                            <i className="fa-solid fa-circle-check" style={{ color: '#16a34a' }}></i>
                            <span><strong style={{ color: '#16a34a' }}>{el.length}</strong> eligible</span>
                          </div>
                          <div className="bsc-stat" style={{ borderColor: '#f87171', background: '#fef2f2' }}>
                            <i className="fa-solid fa-circle-xmark" style={{ color: '#dc2626' }}></i>
                            <span><strong style={{ color: '#dc2626' }}>{inel.length}</strong> not eligible</span>
                          </div>
                        </div>

                        <div className="bsc-footer" style={{ color: colors.badge }}>
                          Select &amp; Promote <i className="fa-solid fa-chevron-right"></i>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════
               STEP 2 — CONFIRM PROMOTION
          ══════════════════════════════ */}
          {step === 'confirm' && selectedBatch && (
            <>
              {/* Details + academic year picker */}
              <div className="promotion-info">
                <div className="info-card">
                  <div className="info-header">
                    <i className="fa-solid fa-circle-info"></i>
                    <h3>Promotion Details</h3>
                  </div>
                  <div className="info-content">
                    <div className="info-row">
                      <span>Source Batch:</span>
                      <strong>{selectedBatch.batchName} ({selectedBatch.year})</strong>
                    </div>
                    <div className="info-row">
                      <span>Promoting To:</span>
                      <strong>{yearMap[selectedBatch.year]}</strong>
                    </div>
                    <div className="info-row">
                      <span>Source Academic Year:</span>
                      <strong>{selectedBatch.academicYear}</strong>
                    </div>
                    <div className="info-row">
                      <span>Target Academic Year:</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={targetAcademicYear}
                          onChange={e => setTargetAcademicYear(e.target.value)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #667eea', fontWeight: '600', color: '#333', fontSize: '14px' }}
                        >
                          {[0, 1, 2].map(offset => {
                            const parts = selectedBatch.academicYear.split('-');
                            const s = parseInt(parts[0]) + offset + 1;
                            const e = parseInt(parts[1]) + offset + 1;
                            return <option key={offset} value={`${s}-${e}`}>{s}-{e}</option>;
                          })}
                        </select>
                        <small style={{ color: '#64748b' }}>← change if needed</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="promotion-rules">
                  <h4>📋 How It Works</h4>
                  <ul>
                    <li>✅ Students must have completed <strong>BOTH semesters</strong> for their year (FY: Sem 1+2, SY: Sem 3+4, TY: Sem 5+6)</li>
                    <li>✅ Students with <strong>0–2 total ATKT</strong> across all semesters are promoted</li>
                    <li>❌ Students with <strong>3+ ATKT or a FAIL semester</strong> are skipped</li>
                    <li>❌ Students with <strong>incomplete semester records</strong> are skipped</li>
                    <li>📁 <strong>Source batch stays active</strong> — add new students &amp; promote again anytime</li>
                    <li>🔁 Already-promoted students are <strong>never duplicated</strong></li>
                    <li>📚 All attendance &amp; semester records are carried over</li>
                  </ul>
                </div>
              </div>

              {/* Summary */}
              <div className="promotion-summary">
                <div className="summary-card eligible">
                  <div className="summary-header">
                    <i className="fa-solid fa-circle-check"></i>
                    <h3>Eligible</h3>
                  </div>
                  <div className="summary-count">{eligible.length}</div>
                  <small>Will be added to {yearMap[selectedBatch.year]} ({targetAcademicYear})</small>
                </div>
                <div className="summary-card failed">
                  <div className="summary-header">
                    <i className="fa-solid fa-circle-xmark"></i>
                    <h3>Not Eligible</h3>
                  </div>
                  <div className="summary-count">{ineligible.length}</div>
                  <small>Stay in {selectedBatch.year} — complete requirements first</small>
                </div>
              </div>

              {/* Eligible list */}
              {eligible.length > 0 && (
                <div className="students-section">
                  <h4 style={{ color: '#4caf50' }}>
                    <i className="fa-solid fa-circle-check"></i> To Be Promoted ({eligible.length})
                  </h4>
                  <div className="students-list">
                    {eligible.map((s, i) => (
                      <div key={i} className="student-item eligible-item">
                        <div className="student-avatar">{s.name?.charAt(0) || '?'}</div>
                        <div className="student-info">
                          <strong>{s.name}</strong>
                          <small>Roll: {s.rollNo} &nbsp;|&nbsp; {s.totalATKT === 0 ? 'No ATKT' : `${s.totalATKT} ATKT`}</small>
                        </div>
                        <div className="promotion-badge">
                          <i className="fa-solid fa-arrow-up"></i> → {yearMap[selectedBatch.year]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ineligible list */}
              {ineligible.length > 0 && (
                <div className="students-section">
                  <h4 style={{ color: '#f44336' }}>
                    <i className="fa-solid fa-circle-xmark"></i> Not Promoted ({ineligible.length})
                  </h4>
                  <div className="students-list">
                    {ineligible.map((s, i) => (
                      <div key={i} className="student-item failed-item">
                        <div className="student-avatar">{s.name?.charAt(0) || '?'}</div>
                        <div className="student-info">
                          <strong>{s.name}</strong>
                          <small>Roll: {s.rollNo}</small>
                          <small style={{ color: '#f44336' }}>⚠ {s.reason}</small>
                        </div>
                        <div className="retention-badge">
                          <i className="fa-solid fa-rotate-left"></i> Stay in {selectedBatch.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════
               STEP 3 — RESULT
          ══════════════════════════════ */}
          {step === 'result' && promotionResult && (
            <div className="promotion-result">
              <div className="result-success">
                <i className="fa-solid fa-circle-check"></i>
                <h3>
                  {promotionResult.skipped
                    ? 'All eligible students already promoted!'
                    : 'Promotion Completed Successfully!'}
                </h3>
              </div>
              <div className="result-details">
                <div className="result-item">
                  <span>Target Batch:</span>
                  <strong>{promotionResult.newBatch?.batchName} ({promotionResult.newBatch?.academicYear})</strong>
                </div>
                <div className="result-item">
                  <span>Students Promoted Now:</span>
                  <strong style={{ color: '#16a34a' }}>{promotionResult.promotedCount}</strong>
                </div>
                {promotionResult.alreadyPromotedCount > 0 && (
                  <div className="result-item">
                    <span>Already in target (skipped):</span>
                    <strong>{promotionResult.alreadyPromotedCount}</strong>
                  </div>
                )}
                <div className="result-item">
                  <span>Source Batch Status:</span>
                  <strong style={{ color: '#16a34a' }}>✅ Still Active</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer">
          {step === 'select' && (
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
          )}
          {step === 'confirm' && (
            <>
              <button className="btn-ghost" onClick={() => setStep('select')} disabled={promoting}>
                ← Back
              </button>
              <button
                className="btn-primary"
                onClick={handlePromote}
                disabled={promoting || eligible.length === 0}
              >
                {promoting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Promoting...</>
                  : <><i className="fa-solid fa-graduation-cap"></i> Promote {eligible.length} Student{eligible.length !== 1 ? 's' : ''}</>
                }
              </button>
            </>
          )}
          {step === 'result' && (
            <button className="btn-primary" onClick={onClose}>
              <i className="fa-solid fa-check"></i> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPromotion;