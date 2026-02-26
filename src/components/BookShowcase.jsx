import React, { useState } from 'react';

const BookShowcase = () => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState('student-details');

  // Helper to determine button class
  const getNavClass = (tabName) => 
    `book-nav-item ${activeTab === tabName ? 'active' : ''}`;

  return (
    <section className="book-showcase" id="book-features">
      <div className="container-book">
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Inside the Mentor-Mentee Book
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '50px', color: 'var(--light-text)' }}>
          A comprehensive record keeping system designed for holistic development.
        </p>

        <div className="book-interface">
          {/* Navigation Side */}
          <div className="book-nav">
            <button className={getNavClass('student-details')} onClick={() => setActiveTab('student-details')}>
              <i className="fa-solid fa-id-card"></i> Student Details
            </button>
            <button className={getNavClass('academic-records')} onClick={() => setActiveTab('academic-records')}>
              <i className="fa-solid fa-graduation-cap"></i> Academic Records
            </button>
            <button className={getNavClass('parents-details')} onClick={() => setActiveTab('parents-details')}>
              <i className="fa-solid fa-users"></i> Parents Details
            </button>
            <button className={getNavClass('objective')} onClick={() => setActiveTab('objective')}>
              <i className="fa-solid fa-bullseye"></i> Objective & Goals
            </button>
            <button className={getNavClass('academic-performance')} onClick={() => setActiveTab('academic-performance')}>
              <i className="fa-solid fa-chart-line"></i> Performance
            </button>
          </div>

          {/* Content Side */}
          <div className="book-content-panel">
            
            {activeTab === 'student-details' && (
              <div className="book-page active">
                <div className="page-header">
                  <i className="fa-solid fa-id-card accent-icon"></i>
                  <h3>Student Profile</h3>
                </div>
                <p>Capture essential demographic information. A complete profile view including photo, contact info, and unique identifiers.</p>
                <div className="mock-ui-strip">
                  <span>ID: 2025001</span> | <span>Name: John Doe</span> | <span>Batch: 2025</span>
                </div>
              </div>
            )}

            {activeTab === 'academic-records' && (
              <div className="book-page active">
                <div className="page-header">
                  <i className="fa-solid fa-graduation-cap accent-icon"></i>
                  <h3>Historical Academic Records</h3>
                </div>
                <p>A repository of past educational history, previous school records, and foundational academic documents.</p>
              </div>
            )}

            {activeTab === 'parents-details' && (
              <div className="book-page active">
                <div className="page-header">
                  <i className="fa-solid fa-users accent-icon"></i>
                  <h3>Guardian Information</h3>
                </div>
                <p>Maintain up-to-date contact details and occupation information for parents or guardians.</p>
              </div>
            )}

            {activeTab === 'objective' && (
              <div className="book-page active">
                 <div className="page-header">
                  <i className="fa-solid fa-bullseye accent-icon"></i>
                  <h3>Objectives & Career Goals</h3>
                </div>
                <p>Define short-term targets and long-term career aspirations.</p>
              </div>
            )}

             {activeTab === 'academic-performance' && (
              <div className="book-page active">
                <div className="page-header">
                  <i className="fa-solid fa-chart-line accent-icon"></i>
                  <h3>Current Performance Tracking</h3>
                </div>
                <p>Real-time tracking of current semester progress and attendance.</p>
                <div className="mock-progress-container">
                  <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Attendance Avg.</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '5px', marginTop: '15px' }}>Internal Assessment Avg.</p>
                  <div className="progress-bar">
                    <div className="progress-fill blue" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default BookShowcase;

