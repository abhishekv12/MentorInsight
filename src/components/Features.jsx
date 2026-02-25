import React from 'react';

const Features = () => {
  return (
    <section className="features" id="features">
      <h2 className="section-title">Why Choose MMMP?</h2>

      {/* --- Standard Feature Cards --- */}
      <div className="feature-grid">
        <div className="card">
          <i className="fa-solid fa-handshake"></i>
          <h3>Smart Matching</h3>
          <p>
            Our algorithm pairs mentors and mentees based on skills, goals, and
            availability.
          </p>
        </div>

        <div className="card">
          <i className="fa-solid fa-chart-line"></i>
          <h3>Progress Tracking</h3>
          <p>
            Monitor milestones and goals in real-time with visual dashboards.
          </p>
        </div>

        <div className="card">
          <div className="icon-container">
            <i className="fa-solid fa-comments"></i>
          </div>
          <h3>Seamless Chat</h3>
          <p>
            Integrated communication tools for instant feedback and scheduling.
          </p>
        </div>

        <div className="card">
          <div className="icon-container">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <h3>Resource Library</h3>
          <p>
            Access a curated collection of learning materials, guides, and
            templates.
          </p>
        </div>

        <div className="card">
          <div className="icon-container">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <h3>Goal Setting & Feedback</h3>
          <p>
            Set clear objectives and receive constructive feedback to accelerate
            growth.
          </p>
        </div>

        <div className="card">
          <div className="icon-container">
            <i className="fa-solid fa-house-user"></i>
          </div>
          <h3>Parent Portal</h3>
          <p>
            Guardians can view real-time attendance, track academic progress,
            and receive updates instantly.
          </p>
        </div>
      </div>

      {/* --- Bento Grid Section (Separated for correct CSS layout) --- */}
      <div className="bento-grid" style={{ marginTop: '50px' }}>
        
        <div className="bento-card session-card grid-col-span-2">
          <div className="card-content horizontal align-center">
            <div className="date-badge">
              <span className="month">OCT</span>
              <span className="day">24</span>
            </div>
            <div className="session-details">
              <h3>Next Mentorship Session</h3>
              <p>
                <i className="fa-regular fa-clock"></i> 3:00 PM - 4:00 PM (Zoom)
              </p>
              <span className="topic-tag">Topic: Career Roadmap Planning</span>
            </div>
            <button className="btn-join">
              <i className="fa-solid fa-video"></i> Join
            </button>
          </div>
        </div>

        <div className="bento-card skills-card grid-row-span-2">
          <h3>
            <i className="fa-solid fa-brain accent-icon"></i> Soft Skills Matrix
          </h3>
          <p>Tracking growth beyond academics.</p>

          <div className="skills-container">
            {/* Skill 1 */}
            <div className="skill-item">
              <div className="skill-header">
                <span>Communication</span>
                <span className="skill-score">85%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{ width: '85%', background: 'var(--primary-blue)' }}
                ></div>
              </div>
            </div>

            {/* Skill 2 */}
            <div className="skill-item">
              <div className="skill-header">
                <span>Leadership</span>
                <span className="skill-score">70%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{ width: '70%', background: 'var(--primary-teal)' }}
                ></div>
              </div>
            </div>

            {/* Skill 3 */}
            <div className="skill-item">
              <div className="skill-header">
                <span>Critical Thinking</span>
                <span className="skill-score">92%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{ width: '92%', background: 'var(--accent-green)' }}
                ></div>
              </div>
            </div>

            {/* Skill 4 */}
            <div className="skill-item">
              <div className="skill-header">
                <span>Time Management</span>
                <span className="skill-score">65%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{ width: '65%', background: '#f59e0b' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-card tasks-card">
          <h3>
            <i className="fa-solid fa-list-check accent-icon"></i> Action Items
          </h3>
          <ul className="task-list">
            <li>
              <i className="fa-regular fa-circle-check"></i> Submit internship
              application
            </li>
            <li>
              <i className="fa-regular fa-circle"></i> Update LinkedIn profile
            </li>
            <li>
              <i className="fa-regular fa-circle"></i> Read provided case study
            </li>
          </ul>
        </div>

        <div className="bento-card resources-card">
          <h3>
            <i className="fa-solid fa-folder-open accent-icon"></i> Shared Resources
          </h3>
          <div className="resource-links">
            <a href="#" className="resource-item">
              <i className="fa-solid fa-file-pdf"></i>
              <span>Mentorship_Guide_v2.pdf</span>
            </a>
            <a href="#" className="resource-item">
              <i className="fa-solid fa-link"></i>
              <span>Coursera Course Link</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
