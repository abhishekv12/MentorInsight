import React from 'react';

const BentoGrid = () => {
  return (
    <section className="exclusive-features" id="exclusive-features">
      <div className="features-header">
        <h2>The Holistic Growth Engine</h2>
        <p>
          Our portal goes beyond basic tracking. We provide an exclusive,
          360-degree view of the mentee's journey, combining academic rigor with
          personal development.
        </p>
      </div>

      <div className="bento-grid">
        {/* --- Card 1: Academic Tracker --- */}
        <div className="bento-card main-performance grid-col-span-2 grid-row-span-2">
          <div className="card-content">
            <div className="card-txt">
              <h3>
                <i className="fa-solid fa-chart-line accent-icon"></i> Academic
                Performance Tracker
              </h3>
              <p>
                Real-time visualization of current semester progress, internal
                assessments, and attendance trends.
              </p>
            </div>
            <div className="mock-chart-container">
              <div className="chart-bars">
                {/* FIX: Styles must be objects in React */}
                <div className="bar" style={{ height: '60%' }}>
                  <span>Sem 1</span>
                </div>
                <div className="bar" style={{ height: '85%' }}>
                  <span>Sem 2</span>
                </div>
                <div className="bar active" style={{ height: '75%' }}>
                  <span>Current</span>
                </div>
              </div>
              <div className="chart-label">Trajectory: Rising</div>
            </div>
          </div>
        </div>

        {/* --- Card 2: Objectives --- */}
        <div className="bento-card objective-card grid-col-span-2">
          <div className="card-content horizontal">
            <i className="fa-solid fa-bullseye accent-icon large"></i>
            <div>
              <h3>Objectives & North Star Goals</h3>
              <p>
                Define and track short-term targets and long-term career
                aspirations to keep mentorship focused.
              </p>
            </div>
          </div>
        </div>

        {/* --- Card 3: Student Profile --- */}
        <div className="bento-card profile-card">
          <div className="profile-preview">
            <i className="fa-solid fa-user-graduate"></i>
            <div className="profile-info">
              <h4>Student Details</h4>
              <span>Comprehensive Profile</span>
            </div>
          </div>
        </div>

        {/* --- Card 4: Parents Details --- */}
        <div className="bento-card profile-card">
          <div className="profile-preview">
            <i className="fa-solid fa-house-user"></i>
            <div className="profile-info">
              <h4>Parents Details</h4>
              <span>Guardian Connection</span>
            </div>
          </div>
        </div>

        {/* --- Card 5: Historical Records --- */}
        {/* FIX: Changed 'class' to 'className' here */}
        <div className="bento-card records-card grid-col-span-2">
          <h3>
            <i className="fa-solid fa-file-certificate accent-icon"></i> Complete
            Historical Records
          </h3>
          <p>
            A secured vault of past academic history, previous school records,
            and official examination results.
          </p>
          <div className="mini-tags">
            <span>
              <i className="fa-solid fa-check"></i> 10th/12th Grade
            </span>
            <span>
              <i className="fa-solid fa-check"></i> University Exams
            </span>
          </div>
        </div>

        {/* --- Card 6: Hobbies --- */}
        <div className="bento-card hobbies-card">
          <i className="fa-solid fa-palette accent-icon"></i>
          <h3>Hobbies & Interests</h3>
          <p>Understanding the person beyond the grades for better rapport.</p>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;

