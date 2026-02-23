import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BatchManagement = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', code: '', mentorName: '' });
  const collegeName = localStorage.getItem('collegeName');

  useEffect(() => { if (collegeName) fetchData(); }, [collegeName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/batches?college=${collegeName}`);
      const allBatches = res.data;
      const deptMap = {};
      allBatches.forEach(batch => {
        const deptKey = batch.department || 'Uncategorized';
        if (!deptMap[deptKey]) deptMap[deptKey] = { name: deptKey, mainDept: null, subBatches: [], totalStudents: 0 };
        if (batch.facultyUid) deptMap[deptKey].subBatches.push(batch);
        else deptMap[deptKey].mainDept = batch;
        deptMap[deptKey].totalStudents += batch.students?.length || batch.studentCount || 0;
      });
      setDepartments(Object.values(deptMap));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/batches', {
        name: newBatch.name, department: newBatch.code,
        year: new Date().getFullYear().toString(),
        mentorId: newBatch.mentorName, assignedMentor: "Unassigned", collegeName,
      });
      setShowCreateModal(false);
      setNewBatch({ name: '', code: '', mentorName: '' });
      fetchData();
    } catch (err) { alert("Error creating department"); }
  };

  const getDeptStyle = (code) => {
    const c = code ? code.toUpperCase() : '';
    const map = {
      'CS': { grad: ['#6366f1','#4338ca'], accent: '#818cf8', soft: 'rgba(99,102,241,.1)', icon: 'fa-code' },
      'IT': { grad: ['#0ea5e9','#0369a1'], accent: '#38bdf8', soft: 'rgba(14,165,233,.1)', icon: 'fa-network-wired' },
      'DS': { grad: ['#ec4899','#9d174d'], accent: '#f472b6', soft: 'rgba(236,72,153,.1)', icon: 'fa-robot' },
      'HM': { grad: ['#f97316','#c2410c'], accent: '#fb923c', soft: 'rgba(249,115,22,.1)', icon: 'fa-hotel' },
      'HS': { grad: ['#f472b6','#be185d'], accent: '#f9a8d4', soft: 'rgba(244,114,182,.1)', icon: 'fa-house-heart' },
    };
    return map[c] || { grad: ['#475569','#1e293b'], accent: '#94a3b8', soft: 'rgba(99,116,147,.1)', icon: 'fa-layer-group' };
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'#64748b', fontSize:14, fontFamily:'DM Sans,sans-serif' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight:10 }} /> Loading departments...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .bm-wrap { font-family:'DM Sans',sans-serif; }

        .bm-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
        .bm-title { font-size:20px; font-weight:800; color:#f1f5f9; margin:0 0 3px; }
        .bm-sub { font-size:13px; color:#334155; margin:0; }
        .bm-add {
          display:flex; align-items:center; gap:7px; padding:9px 16px;
          background:#dc2626; color:#fff; border:none; border-radius:10px;
          font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;
          box-shadow:0 4px 14px rgba(220,38,38,.3); transition:all .18s;
        }
        .bm-add:hover { background:#b91c1c; transform:translateY(-1px); }

        .bm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }

        /* ── THE CARD ── */
        .bm-card {
          background:#0d1f35;
          border:1px solid rgba(255,255,255,.07);
          border-radius:18px;
          overflow:hidden;
          cursor:pointer;
          transition:transform .2s, box-shadow .2s, border-color .2s;
          position:relative;
        }
        .bm-card:hover {
          transform:translateY(-3px);
          box-shadow:0 16px 40px rgba(0,0,0,.45);
          border-color:rgba(255,255,255,.13);
        }

        /* Header band — same height as before, just richer */
        .bm-card-head {
          padding:18px 18px 16px;
          position:relative; overflow:hidden;
        }
        /* Dot texture */
        .bm-card-head::before {
          content:'';
          position:absolute; inset:0; pointer-events:none;
          background-image:radial-gradient(rgba(255,255,255,.18) 1px, transparent 1px);
          background-size:18px 18px;
          opacity:.5;
        }
        /* Glow orb top-right */
        .bm-card-head::after {
          content:'';
          position:absolute; width:120px; height:120px; border-radius:50%;
          top:-40px; right:-30px; pointer-events:none;
          background:radial-gradient(circle, rgba(255,255,255,.15) 0%, transparent 70%);
        }
        .bm-head-row { display:flex; align-items:center; gap:12px; position:relative; z-index:1; }
        .bm-icon-box {
          width:42px; height:42px; border-radius:12px; flex-shrink:0;
          background:rgba(255,255,255,.18);
          border:1px solid rgba(255,255,255,.25);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; color:#fff;
        }
        .bm-code { font-size:20px; font-weight:800; color:#fff; line-height:1.1; letter-spacing:-.01em; }
        .bm-est { font-size:11px; color:rgba(255,255,255,.55); font-weight:600; margin-top:2px; }

        /* Batch pill top-right */
        .bm-batch-pill {
          position:absolute; top:13px; right:13px; z-index:2;
          padding:3px 9px; border-radius:100px;
          background:rgba(0,0,0,.25);
          border:1px solid rgba(255,255,255,.15);
          font-size:10px; font-weight:700; color:rgba(255,255,255,.8);
          display:flex; align-items:center; gap:4px;
        }

        /* Body */
        .bm-card-body { padding:15px 17px 17px; }
        .bm-dept-name {
          font-size:14px; font-weight:800; color:#e2e8f0;
          margin-bottom:13px; line-height:1.3;
        }

        /* Info rows */
        .bm-info { margin-bottom:10px; }
        .bm-info-lbl {
          font-size:9px; font-weight:800; color:#1e3a5f;
          text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px;
        }
        .bm-info-val {
          font-size:13px; font-weight:700; color:#64748b;
          display:flex; align-items:center; gap:6px;
        }
        .bm-info-val.green { color:#4ade80; }
        .bm-info-val.muted { color:#1e3a5f; font-style:italic; font-weight:500; font-size:12px; }

        .bm-sep { height:1px; background:rgba(255,255,255,.05); margin:12px 0; }

        /* Bottom stat row */
        .bm-bottom { display:flex; align-items:center; justify-content:space-between; }
        .bm-students {
          display:flex; align-items:center; gap:6px;
          font-size:12.5px; font-weight:700; color:#334155;
        }
        .bm-students i { font-size:11px; }
        .bm-arrow-btn {
          width:26px; height:26px; border-radius:7px;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.07);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; color:#1e3a5f;
          transition:all .18s;
        }
        .bm-card:hover .bm-arrow-btn { background:rgba(255,255,255,.1); color:#64748b; border-color:rgba(255,255,255,.12); }

        /* Modal */
        .bm-overlay {
          position:fixed; inset:0; background:rgba(2,6,23,.85);
          z-index:9999; display:flex; align-items:center; justify-content:center;
          padding:20px; backdrop-filter:blur(8px);
        }
        .bm-modal {
          background:#0a1628; border-radius:18px; width:100%; max-width:420px;
          border:1px solid rgba(255,255,255,.08);
          box-shadow:0 32px 80px rgba(0,0,0,.7);
        }
        .bm-mhead {
          padding:18px 22px; border-bottom:1px solid rgba(255,255,255,.07);
          display:flex; justify-content:space-between; align-items:center;
        }
        .bm-mtitle { font-size:16px; font-weight:800; color:#f1f5f9; margin:0; }
        .bm-mclose {
          width:28px; height:28px; border-radius:7px; border:none;
          background:rgba(255,255,255,.06); color:#475569; cursor:pointer;
          display:flex; align-items:center; justify-content:center; font-size:12px;
        }
        .bm-mbody { padding:20px 22px; display:flex; flex-direction:column; gap:14px; }
        .bm-flbl { display:block; font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
        .bm-finp {
          width:100%; padding:11px 13px; border:1.5px solid rgba(255,255,255,.08);
          border-radius:9px; background:#0f172a; color:#e2e8f0;
          font-size:13.5px; font-weight:500; font-family:inherit;
          outline:none; transition:border-color .18s, box-shadow .18s; box-sizing:border-box;
        }
        .bm-finp:focus { border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,.08); }
        .bm-finp::placeholder { color:#1e3a5f; }
        .bm-mfoot { padding:14px 22px; border-top:1px solid rgba(255,255,255,.07); display:flex; justify-content:flex-end; gap:8px; }
        .bm-btn-cancel {
          padding:9px 16px; border-radius:9px; border:1.5px solid rgba(255,255,255,.08);
          background:transparent; color:#475569; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit;
        }
        .bm-btn-submit {
          padding:9px 20px; border-radius:9px; border:none;
          background:#dc2626; color:#fff; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit;
          box-shadow:0 4px 12px rgba(220,38,38,.3); transition:all .18s;
        }
        .bm-btn-submit:hover { background:#b91c1c; }
      `}</style>

      <div className="bm-wrap">
        {/* Header */}
        <div className="bm-header">
          <div>
            <h3 className="bm-title">Departments</h3>
            <p className="bm-sub">Manage departments for {collegeName}</p>
          </div>
          <button className="bm-add" onClick={() => setShowCreateModal(true)}>
            <i className="fa-solid fa-plus" /> Add Department
          </button>
        </div>

        {/* Cards */}
        <div className="bm-grid">
          {departments.map((dept) => {
            const s = getDeptStyle(dept.name);
            const main = dept.mainDept;

            return (
              <div className="bm-card" key={dept.name}
                onClick={() => navigate(`/admin/department/${dept.name}`)}>

                {/* Gradient header */}
                <div className="bm-card-head"
                  style={{ background:`linear-gradient(135deg, ${s.grad[0]} 0%, ${s.grad[1]} 100%)` }}>

                  {dept.subBatches.length > 0 && (
                    <div className="bm-batch-pill">
                      <i className="fa-solid fa-folder" style={{ fontSize:9 }} />
                      {dept.subBatches.length}
                    </div>
                  )}

                  <div className="bm-head-row">
                    <div className="bm-icon-box">
                      <i className={`fa-solid ${s.icon}`} />
                    </div>
                    <div>
                      <div className="bm-code">{dept.name}</div>
                      <div className="bm-est">Est. {main?.year || new Date().getFullYear()}</div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="bm-card-body">
                  <div className="bm-dept-name">{main?.name || dept.name}</div>

                  {main && (
                    <>
                      <div className="bm-info">
                        <div className="bm-info-lbl">Head of Department</div>
                        <div className="bm-info-val">
                          <i className="fa-solid fa-user-tie" style={{ color:s.accent, fontSize:11 }} />
                          {main.mentorId || '—'}
                        </div>
                      </div>

                      <div className="bm-info">
                        <div className="bm-info-lbl">Assigned Mentor</div>
                        {main.assignedMentor && main.assignedMentor !== "Unassigned" ? (
                          <div className="bm-info-val green">
                            <i className="fa-solid fa-circle-check" style={{ fontSize:11 }} />
                            {main.assignedMentor}
                          </div>
                        ) : (
                          <div className="bm-info-val muted">Pending Assignment</div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="bm-sep" />

                  <div className="bm-bottom">
                    <div className="bm-students">
                      <i className="fa-solid fa-user-graduate" style={{ color:s.accent }} />
                      {dept.totalStudents} Students
                    </div>
                    <div className="bm-arrow-btn">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showCreateModal && (
          <div className="bm-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="bm-modal" onClick={e => e.stopPropagation()}>
              <div className="bm-mhead">
                <h3 className="bm-mtitle">Create Department</h3>
                <button className="bm-mclose" onClick={() => setShowCreateModal(false)}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              <form onSubmit={handleCreateBatch}>
                <div className="bm-mbody">
                  {[
                    { label:"Department Name", key:"name",       ph:"e.g. Computer Science" },
                    { label:"Department Code", key:"code",       ph:"e.g. CS" },
                    { label:"HOD Name",        key:"mentorName", ph:"Head of Department" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="bm-flbl">{f.label}</label>
                      <input className="bm-finp" type="text" required placeholder={f.ph}
                        value={newBatch[f.key]}
                        onChange={e => setNewBatch({ ...newBatch, [f.key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div className="bm-mfoot">
                  <button type="button" className="bm-btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="bm-btn-submit">
                    <i className="fa-solid fa-plus" style={{ marginRight:6 }} />Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BatchManagement;