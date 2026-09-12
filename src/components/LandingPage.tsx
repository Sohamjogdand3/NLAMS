import React, { useState } from "react";
import "./LandingPage.css";

interface Props {
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigateToLogin }) => {
  const [activeStep, setActiveStep] = useState(0);

  const workflow = [
    {
      number: "01",
      title: "Land Requirement",
      description: "Project agency identifies and submits the required land.",
      icon: "🏗️",
    },
    {
      number: "02",
      title: "Field Survey",
      description: "Surveyor checks the land, boundaries and survey information.",
      icon: "📍",
    },
    {
      number: "03",
      title: "Verification",
      description: "Land records and survey information are verified.",
      icon: "📋",
    },
    {
      number: "04",
      title: "Review & Hearing",
      description: "Objections are reviewed and the case moves through approval.",
      icon: "⚖️",
    },
    {
      number: "05",
      title: "Award & Approval",
      description: "Compensation award is prepared and sent for approval.",
      icon: "📑",
    },
    {
      number: "06",
      title: "Possession & Compensation",
      description: "Possession is completed and citizens can track compensation.",
      icon: "🏠",
    },
  ];

  const stakeholders = [
    {
      icon: "👤",
      title: "Citizen",
      text: "Track land acquisition cases, notices and compensation.",
    },
    {
      icon: "📍",
      title: "Surveyor",
      text: "Conduct field surveys and verify land boundaries.",
    },
    {
      icon: "🏘️",
      title: "Talathi",
      text: "Verify village-level land records and survey reports.",
    },
    {
      icon: "🏛️",
      title: "Tehsildar",
      text: "Review cases, mutations and local disputes.",
    },
    {
      icon: "📑",
      title: "LAO",
      text: "Manage notices, hearings and acquisition awards.",
    },
    {
      icon: "🏢",
      title: "District Collector",
      text: "Approve awards and oversee district acquisition.",
    },
    {
      icon: "🏗️",
      title: "Project Agency",
      text: "Submit land requirements and track project progress.",
    },
    {
      icon: "🌐",
      title: "State / Central Admin",
      text: "Monitor acquisition activities at higher levels.",
    },
  ];

  const features = [
    {
      icon: "🗺️",
      title: "GIS-Based Land View",
      text: "Visual representation of land parcels, boundaries and acquisition areas.",
    },
    {
      icon: "📋",
      title: "Digital Case Tracking",
      text: "Follow a land acquisition case through its different stages.",
    },
    {
      icon: "🔐",
      title: "Role-Based Access",
      text: "Different users see information and actions relevant to their role.",
    },
    {
      icon: "🔔",
      title: "Notices & Alerts",
      text: "Keep stakeholders informed about important case updates.",
    },
    {
      icon: "💰",
      title: "Compensation Tracking",
      text: "Citizens can see the status of their compensation.",
    },
    {
      icon: "⚖️",
      title: "Objection & Hearing",
      text: "Provide a clear process for objections and case hearings.",
    },
  ];

  return (
    <div className="nlams-landing">

      {/* ================= HEADER ================= */}
      <header className="nlams-header">
        <div className="brand">
          <div className="brand-emblem">🇮🇳</div>

          <div>
            <h2>NLAMS</h2>
            <span>National Land Acquisition Management System</span>
          </div>
        </div>

        <nav className="desktop-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#workflow">How It Works</a>
          <a href="#stakeholders">Stakeholders</a>
        </nav>

        <div className="header-actions">
          <select className="language-select">
            <option>English</option>
            <option>हिंदी</option>
            <option>मराठी</option>
          </select>

          <button
            className="header-login"
            onClick={onNavigateToLogin}
          >
            Login / Access Portal
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero" id="home">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-text">

            <div className="gov-badge">
              🇮🇳 Digital Governance Initiative
            </div>

            <h1>
              Transparent &
              <span> Digital Land Acquisition</span>
            </h1>

            <p className="hero-description">
              NLAMS brings citizens, government officials and project
              agencies together on one platform to manage the land
              acquisition process more clearly and efficiently.
            </p>

            <div className="hero-buttons">

              <button
                className="hero-primary"
                onClick={onNavigateToLogin}
              >
                Access NLAMS Portal
                <span>→</span>
              </button>

              <a href="#workflow" className="hero-secondary">
                Explore Workflow
              </a>

            </div>

            <div className="hero-trust">
              <span>✓ Citizen-centric</span>
              <span>✓ Transparent workflow</span>
              <span>✓ Digital records</span>
            </div>

          </div>

          {/* GIS VISUAL */}
          <div className="hero-visual">

            <div className="map-card">

              <div className="map-header">
                <div>
                  <strong>NLAMS Land View</strong>
                  <small>Demo GIS Visualization</small>
                </div>

                <span className="map-status">
                  ● ACTIVE
                </span>
              </div>

              <div className="map-area">

                <div className="map-grid"></div>

                <div className="india-shape">
                  🇮🇳
                </div>

                <div className="parcel parcel-one"></div>
                <div className="parcel parcel-two"></div>
                <div className="parcel parcel-three"></div>

                <div className="map-pin pin-one">📍</div>
                <div className="map-pin pin-two">📍</div>
                <div className="map-pin pin-three">📍</div>

                <div className="map-label label-one">
                  Survey Area
                </div>

                <div className="map-label label-two">
                  Acquisition Zone
                </div>

              </div>

              <div className="map-footer">
                <div>
                  <small>Selected Parcel</small>
                  <strong>Survey No. 142/3</strong>
                </div>

                <div>
                  <small>Area</small>
                  <strong>2.4 Ha</strong>
                </div>

                <div>
                  <small>Status</small>
                  <strong className="status-text">
                    Under Review
                  </strong>
                </div>
              </div>

            </div>

            <div className="floating-card floating-one">
              <span>📋</span>
              <div>
                <strong>Case Tracking</strong>
                <small>6 stages completed</small>
              </div>
            </div>

            <div className="floating-card floating-two">
              <span>✓</span>
              <div>
                <strong>Verified</strong>
                <small>Land information</small>
              </div>
            </div>

          </div>

        </div>

        <div className="scroll-indicator">
          <span>Explore NLAMS</span>
          <div>↓</div>
        </div>

      </section>

      {/* ================= INTRO ================= */}
      <section className="intro-section" id="about">

        <div className="section-heading">
          <span>ABOUT NLAMS</span>

          <h2>
            One Platform for the
            <strong> Land Acquisition Journey</strong>
          </h2>

          <p>
            NLAMS connects different stakeholders involved in land
            acquisition and provides a common digital workflow for
            tracking land, cases, approvals and compensation.
          </p>
        </div>

        <div className="intro-cards">

          <div className="intro-card blue-card">
            <div className="big-icon">🗺️</div>
            <h3>Land Information</h3>
            <p>
              Organize land, survey and ownership information
              in a connected digital process.
            </p>
          </div>

          <div className="intro-card green-card">
            <div className="big-icon">🔄</div>
            <h3>Connected Workflow</h3>
            <p>
              Move cases from survey and verification through
              approval, possession and compensation.
            </p>
          </div>

          <div className="intro-card orange-card">
            <div className="big-icon">👥</div>
            <h3>Multiple Stakeholders</h3>
            <p>
              Give each stakeholder access to the information
              and activities relevant to their responsibility.
            </p>
          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="features-section">

        <div className="section-heading">
          <span>KEY CAPABILITIES</span>

          <h2>
            Designed Around the
            <strong> Acquisition Process</strong>
          </h2>
        </div>

        <div className="features-grid">

          {features.map((feature, index) => (
            <div
              className="feature-card"
              key={index}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>

              <div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>

              <span className="feature-arrow">
                →
              </span>
            </div>
          ))}

        </div>

      </section>

      {/* ================= WORKFLOW ================= */}
      <section className="workflow-section" id="workflow">

        <div className="section-heading">

          <span>CORE WORKFLOW</span>

          <h2>
            How a Land Acquisition Case
            <strong> Moves Through NLAMS</strong>
          </h2>

          <p>
            Each stage is handled by the appropriate stakeholder,
            creating a clear flow from land requirement to
            possession and compensation.
          </p>

        </div>

        <div className="workflow-container">

          <div className="workflow-navigation">

            {workflow.map((step, index) => (

              <button
                key={index}
                className={
                  activeStep === index
                    ? "workflow-nav active"
                    : "workflow-nav"
                }
                onClick={() => setActiveStep(index)}
              >

                <span>{step.number}</span>

                <div>
                  <strong>{step.title}</strong>
                  <small>{step.icon}</small>
                </div>

              </button>

            ))}

          </div>

          <div className="workflow-detail">

            <div className="workflow-big-number">
              {workflow[activeStep].number}
            </div>

            <div className="workflow-detail-icon">
              {workflow[activeStep].icon}
            </div>

            <h3>
              {workflow[activeStep].title}
            </h3>

            <p>
              {workflow[activeStep].description}
            </p>

            <div className="workflow-progress">

              <div
                className="progress-fill"
                style={{
                  width: `${((activeStep + 1) / workflow.length) * 100}%`,
                }}
              ></div>

            </div>

            <span className="progress-label">
              Stage {activeStep + 1} of {workflow.length}
            </span>

          </div>

        </div>

      </section>

      {/* ================= STAKEHOLDERS ================= */}
      <section className="stakeholder-section" id="stakeholders">

        <div className="section-heading">

          <span>STAKEHOLDERS</span>

          <h2>
            Connecting Everyone
            <strong> Involved in the Process</strong>
          </h2>

          <p>
            NLAMS provides role-specific access so every stakeholder
            can perform their part of the acquisition workflow.
          </p>

        </div>

        <div className="stakeholder-grid">

          {stakeholders.map((person, index) => (

            <div
              className="stakeholder-card"
              key={index}
            >

              <div className="stakeholder-icon">
                {person.icon}
              </div>

              <div>
                <h3>{person.title}</h3>
                <p>{person.text}</p>
              </div>

              <span>→</span>

            </div>

          ))}

        </div>

      </section>

      {/* ================= CASE TRACKER ================= */}
      <section className="tracker-section">

        <div className="tracker-content">

          <div>

            <span className="section-label">
              CASE TRANSPARENCY
            </span>

            <h2>
              Track the Journey of a
              <strong> Land Acquisition Case</strong>
            </h2>

            <p>
              From initial requirement to compensation,
              NLAMS provides a clear view of the current stage
              of the case.
            </p>

            <button
              className="hero-primary"
              onClick={onNavigateToLogin}
            >
              Enter NLAMS Portal →
            </button>

          </div>

          <div className="case-timeline">

            {[
              "Land Requirement",
              "Survey",
              "Verification",
              "Review",
              "Award",
              "Compensation",
            ].map((item, index) => (

              <div className="timeline-item" key={index}>

                <div className="timeline-dot">
                  {index < 3 ? "✓" : index + 1}
                </div>

                <div>
                  <strong>{item}</strong>
                  <small>
                    {index < 3
                      ? "Completed"
                      : "Upcoming stage"}
                  </small>
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="nlams-footer">

        <div className="footer-main">

          <div className="footer-brand">

            <div className="brand">
              <div className="brand-emblem">🇮🇳</div>

              <div>
                <h2>NLAMS</h2>
                <span>
                  National Land Acquisition Management System
                </span>
              </div>
            </div>

            <p>
              A digital platform concept for transparent
              and connected land acquisition management.
            </p>

          </div>

          <div className="footer-links">

            <div>
              <h4>Platform</h4>
              <a href="#about">About NLAMS</a>
              <a href="#workflow">How It Works</a>
              <a href="#stakeholders">Stakeholders</a>
            </div>

            <div>
              <h4>Access</h4>
              <button onClick={onNavigateToLogin}>
                Login / Access Portal
              </button>
              <a href="#home">Home</a>
            </div>

          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 NLAMS</span>
          <span>Demonstration Prototype</span>
        </div>

      </footer>

    </div>
  );
};