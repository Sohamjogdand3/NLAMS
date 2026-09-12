import React, { useState } from "react";
import { ROLES_CONFIG } from "../roles";
import "./LoginPage.css";

interface Props {
  onLoginSuccess: (roleId: string) => void;
  onBackToLanding: () => void;
}

const ROLE_INFO: Record<string, { icon: string; description: string }> = {
  citizen: {
    icon: "👤",
    description: "Track land, acquisition cases and compensation.",
  },
  surveyor: {
    icon: "📍",
    description: "Conduct field surveys and verify land boundaries.",
  },
  talathi: {
    icon: "🏘️",
    description: "Verify village land records and survey reports.",
  },
  tehsildar: {
    icon: "🏛️",
    description: "Review cases, mutations and local disputes.",
  },
  lao: {
    icon: "📑",
    description: "Manage acquisition cases, notices and awards.",
  },
  collector: {
    icon: "🏢",
    description: "Approve awards and oversee district acquisition.",
  },
  projectAgency: {
    icon: "🏗️",
    description: "Submit land requirements and track projects.",
  },
  stateAdmin: {
    icon: "🌐",
    description: "Monitor land acquisition across the state.",
  },
  centralAdmin: {
    icon: "🇮🇳",
    description: "Monitor the national NLAMS system.",
  },
};

export const LoginPage: React.FC<Props> = ({
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const selectedInfo =
    ROLE_INFO[selectedRole] || ROLE_INFO.citizen;

  const isCitizen = selectedRole === "citizen";
  const isAgency = selectedRole === "projectAgency";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prototype authentication only.
    // No database or real authentication is performed.
    onLoginSuccess(selectedRole);
  };

  const roleKeys = Object.keys(ROLES_CONFIG);

  return (
    <div className="nlams-login-page">

      {/* ================= HEADER ================= */}

      <header className="login-header">

        <div className="login-brand">

          <div className="login-emblem">
            🇮🇳
          </div>

          <div>
            <h2>NLAMS</h2>
            <span>
              National Land Acquisition Management System
            </span>
          </div>

        </div>

        <button
          className="back-home-btn"
          onClick={onBackToLanding}
        >
          ← Back to Website
        </button>

      </header>


      {/* ================= MAIN ================= */}

      <main className="login-main">

        {/* LEFT INFORMATION PANEL */}

        <section className="login-info">

          <div className="info-badge">
            DIGITAL GOVERNANCE PORTAL
          </div>

          <h1>
            One Platform.
            <br />
            <span>Connected Land Acquisition.</span>
          </h1>

          <p className="info-description">
            NLAMS connects citizens, field officers,
            revenue administration, acquisition authorities
            and project agencies through a common digital workflow.
          </p>


          {/* WORKFLOW */}

          <div className="mini-workflow">

            <div className="workflow-line"></div>

            <div className="mini-step">
              <span>🏗️</span>
              <div>
                <strong>Project Agency</strong>
                <small>Land Requirement</small>
              </div>
            </div>

            <div className="mini-step">
              <span>📍</span>
              <div>
                <strong>Surveyor</strong>
                <small>Field Survey</small>
              </div>
            </div>

            <div className="mini-step">
              <span>📋</span>
              <div>
                <strong>Land Verification</strong>
                <small>Records & Survey</small>
              </div>
            </div>

            <div className="mini-step">
              <span>⚖️</span>
              <div>
                <strong>Review & Acquisition</strong>
                <small>Case Processing</small>
              </div>
            </div>

            <div className="mini-step">
              <span>🏢</span>
              <div>
                <strong>Approval</strong>
                <small>District Administration</small>
              </div>
            </div>

            <div className="mini-step">
              <span>💰</span>
              <div>
                <strong>Citizen</strong>
                <small>Compensation</small>
              </div>
            </div>

          </div>

        </section>


        {/* RIGHT LOGIN PANEL */}

        <section className="login-panel">

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                NLAMS PORTAL ACCESS
              </span>

              <h2>Welcome to NLAMS</h2>

              <p>
                Select your role to continue
              </p>
            </div>

            <div className="secure-icon">
              🔐
            </div>

          </div>


          {/* ROLE SELECTION */}

          <div className="role-section">

            <label>Select your role</label>

            <div className="role-grid">

              {roleKeys.map((key) => {

                const info =
                  ROLE_INFO[key] || ROLE_INFO.citizen;

                const roleTitle =
                  ROLES_CONFIG[key]?.title || key;

                return (
                  <button
                    key={key}
                    type="button"
                    className={
                      selectedRole === key
                        ? "role-card selected"
                        : "role-card"
                    }
                    onClick={() => {
                      setSelectedRole(key);
                      setUserId("");
                      setPassword("");
                      setOtp("");
                    }}
                  >

                    <span className="role-icon">
                      {info.icon}
                    </span>

                    <span className="role-content">

                      <strong>
                        {roleTitle}
                      </strong>

                      <small>
                        {info.description}
                      </small>

                    </span>

                    {selectedRole === key && (
                      <span className="role-check">
                        ✓
                      </span>
                    )}

                  </button>
                );
              })}

            </div>

          </div>


          {/* LOGIN FORM */}

          <form
            className="prototype-login-form"
            onSubmit={handleSubmit}
          >

            <div className="selected-access">

              <span>
                {selectedInfo.icon}
              </span>

              <div>
                <small>ACCESSING AS</small>

                <strong>
                  {ROLES_CONFIG[selectedRole]?.title}
                </strong>
              </div>

            </div>


            {/* USER ID */}

            <div className="input-group">

              <label>
                {isCitizen
                  ? "Mobile Number / Aadhaar"
                  : isAgency
                  ? "Organization ID"
                  : "Employee ID"}
              </label>

              <div className="input-wrapper">

                <span>
                  {isCitizen ? "📱" : "🪪"}
                </span>

                <input
                  type="text"
                  placeholder={
                    isCitizen
                      ? "Enter mobile number"
                      : isAgency
                      ? "AGENCY-DEMO-001"
                      : "EMP-DEMO-001"
                  }
                  value={userId}
                  onChange={(e) =>
                    setUserId(e.target.value)
                  }
                />

              </div>

            </div>


            {/* PASSWORD */}

            {!isCitizen && (
              <div className="input-group">

                <label>Password</label>

                <div className="input-wrapper">

                  <span>🔑</span>

                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                </div>

              </div>
            )}


            {/* OTP */}

            <div className="input-group">

              <div className="label-row">

                <label>Security OTP</label>

                <button
                  type="button"
                  className="demo-otp"
                  onClick={() => setOtp("123456")}
                >
                  Use Demo OTP
                </button>

              </div>

              <div className="input-wrapper">

                <span>🔢</span>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                />

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="access-button"
            >
              Access NLAMS Portal
              <span>→</span>
            </button>

          </form>


          {/* DEMO NOTICE */}

          <div className="prototype-notice">

            <span>ℹ️</span>

            <div>
              <strong>Prototype Access</strong>

              <p>
                Demo authentication is enabled for this
                demonstration. No real credentials are required.
              </p>
            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="login-footer">

        <span>
          © 2026 NLAMS
        </span>

        <span>
          National Land Acquisition Management System
        </span>

        <span>
          Demonstration Prototype
        </span>

      </footer>

    </div>
  );
};