import React from 'react';
import './AboutDeveloper.css';

export default function AboutDeveloper({ onBack }) {
  return (
    <div className="app-container dev-screen-container">
      {/* Header with SVG Arrow */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-back" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </button>
          <h2>About Developer</h2>
        </div>
      </div>

      <div className="dev-scroll-container">
        {/* Profile Card */}
        <div className="dev-profile-card">
          <div className="dev-avatar-wrapper">
            <img 
              src="/assets/developer.png" 
              alt="Akshat Raj" 
              className="dev-avatar"
            />
          </div>
          
          <h1 className="dev-name">Akshat Raj</h1>
          <p className="dev-title">Full Stack Developer & Creator</p>
        </div>

        {/* Bio Section */}
        <div className="dev-section">
          <h3>About Me</h3>
          <p className="dev-bio">
            Hi! I'm Akshat Raj. I am a Full Stack Developer passionate about engineering clean, 
            modular, and high-performance applications. I built the Urgentify ecosystem—integrating 
            a Node.js MVC REST backend, React Native mobile clients, and this Manifest V3 Chrome Extension—to 
            effectively solve "deadline blindness" through beautiful, dynamic color-shifted interfaces.
          </p>
        </div>

        {/* Tech Badges Section */}
        <div className="dev-section">
          <h3>Ecosystem Stack</h3>
          <div className="tech-badges-grid">
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Express.js</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">React & Vite</span>
            <span className="tech-badge">React Native</span>
            <span className="tech-badge">Chrome Extension API</span>
          </div>
        </div>

        {/* Action Connect Button with SVG LinkedIn Logo */}
        <div className="dev-connect-action">
          <a 
            href="https://www.linkedin.com/in/akshat-raj-b1a5722a6/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary btn-linkedin-connect"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            Connect on LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

