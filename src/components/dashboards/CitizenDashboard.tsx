import React, { useState } from "react";
import "./CitizenDashboard.css";

interface Props {
  onLogout: () => void;
}

const CitizenDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCase, setShowCase] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "My Land Records", icon: "▤" },
    { name: "My Acquisition Cases", icon: "◫" },
    { name: "Notices & Alerts", icon: "🔔" },
    { name: "Objections / Grievance", icon: "⚖" },
    { name: "Compensation", icon: "₹" },
    { name: "Documents", icon: "▣" },
  ];

  return (
    <div className="citizen-dashboard">

      {/* ================= TOP NAVBAR ================= */}
      <header className="citizen-header">

        <div className="citizen-brand">
          <div className="brand-emblem">IN</div>
          <div>
            <h2>NLAMS</h2>
            <span>National Land Acquisition Management System</span>
          </div>
        </div>

        <div className="header-right">

          <div className="portal-status">
            <span></span>
            Portal Active
          </div>

          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
            >
              🔔
              <b>3</b>
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <div className="notification-title">
                  <strong>Notifications</strong>
                  <span>3 New</span>
                </div>

                <div className="notification-item">
                  <span>📄</span>
                  <div>
                    <strong>Hearing Notice</strong>
                    <p>Hearing scheduled for 18 Sep 2026.</p>
                    <small>2 hours ago</small>
                  </div>
                </div>

                <div className="notification-item">
                  <span>🔔</span>
                  <div>
                    <strong>Case Updated</strong>
                    <p>Your acquisition case was updated.</p>
                    <small>Yesterday</small>
                  </div>
                </div>

                <div className="notification-item">
                  <span>💰</span>
                  <div>
                    <strong>Compensation</strong>
                    <p>Award preparation has started.</p>
                    <small>2 days ago</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="language">English ▾</div>

          <div className="profile">
            <div className="profile-avatar">DC</div>
            <div>
              <strong>Demo Citizen</strong>
              <small>Citizen</small>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>

        </div>
      </header>


      {/* ================= BODY ================= */}
      <div className="citizen-body">

        {/* SIDEBAR */}
        <aside className="citizen-sidebar">

          <div className="citizen-role">
            <div className="role-icon">👤</div>
            <div>
              <strong>Citizen Portal</strong>
              <small>Public Access</small>
            </div>
          </div>

          <div className="sidebar-label">
            MY NLAMS
          </div>

          <nav>
            {menuItems.map((item) => (
              <button
                key={item.name}
                className={
                  activeMenu === item.name
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => setActiveMenu(item.name)}
              >
                <span>{item.icon}</span>
                {item.name}

                {item.name === "Notices & Alerts" && (
                  <em>3</em>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <button
              className="sidebar-item"
              onClick={() => setActiveMenu("Help & Support")}
            >
              <span>?</span>
              Help & Support
            </button>

            <div className="prototype-box">
              <small>NLAMS</small>
              <strong>Demonstration Prototype</strong>
              <p>Static demo environment</p>
            </div>
          </div>

        </aside>


        {/* MAIN CONTENT */}
        <main className="citizen-main">

          {/* PAGE HEADER */}
          <div className="page-heading">

            <div>
              <div className="breadcrumb">
                NLAMS / Citizen Portal
              </div>

              <h1>
                Good Morning, Demo Citizen 👋
              </h1>

              <p>
                Track your land, acquisition cases and compensation
                from one place.
              </p>
            </div>

            <button className="refresh-btn">
              ↻ Refresh
            </button>

          </div>


          {/* ================= KPI CARDS ================= */}
          <section className="citizen-kpis">

            <div className="citizen-kpi blue">
              <div className="kpi-top">
                <span>My Land Parcels</span>
                <div className="kpi-icon">🗺</div>
              </div>

              <strong>03</strong>

              <p>Land parcels linked to your profile</p>

              <button
                onClick={() => setActiveMenu("My Land Records")}
              >
                View Records →
              </button>
            </div>


            <div className="citizen-kpi orange">
              <div className="kpi-top">
                <span>Active Cases</span>
                <div className="kpi-icon">◫</div>
              </div>

              <strong>02</strong>

              <p>Land acquisition cases in process</p>

              <button
                onClick={() =>
                  setActiveMenu("My Acquisition Cases")
                }
              >
                Track Cases →
              </button>
            </div>


            <div className="citizen-kpi green">
              <div className="kpi-top">
                <span>Compensation</span>
                <div className="kpi-icon">₹</div>
              </div>

              <strong>₹8.45 L</strong>

              <p>Estimated compensation amount</p>

              <button
                onClick={() => setActiveMenu("Compensation")}
              >
                View Details →
              </button>
            </div>


            <div className="citizen-kpi purple">
              <div className="kpi-top">
                <span>Notices</span>
                <div className="kpi-icon">🔔</div>
              </div>

              <strong>04</strong>

              <p>Recent notices and alerts</p>

              <button
                onClick={() => setActiveMenu("Notices & Alerts")}
              >
                View Notices →
              </button>
            </div>

          </section>


          {/* ================= MAIN GRID ================= */}
          <section className="dashboard-grid">

            {/* CASE TRACKER */}
            <div className="case-card">

              <div className="card-heading">

                <div>
                  <span className="section-tag">
                    ACTIVE ACQUISITION CASE
                  </span>

                  <h2>
                    National Highway Expansion – Phase 2
                  </h2>

                  <p>
                    Case ID: <strong>LAC-2026-001</strong>
                  </p>
                </div>

                <span className="status-warning">
                  Under Acquisition
                </span>

              </div>


              <div className="case-info">

                <div>
                  <small>Survey Number</small>
                  <strong>142/3</strong>
                </div>

                <div>
                  <small>Village</small>
                  <strong>Demo Village</strong>
                </div>

                <div>
                  <small>District</small>
                  <strong>Demo District</strong>
                </div>

                <div>
                  <small>Area</small>
                  <strong>2.4 Hectares</strong>
                </div>

              </div>


              {/* TIMELINE */}
              <div className="case-progress">

                <div className="progress-line"></div>

                <div className="progress-step completed">
                  <div>✓</div>
                  <span>Land Identified</span>
                </div>

                <div className="progress-step completed">
                  <div>✓</div>
                  <span>Survey</span>
                </div>

                <div className="progress-step completed">
                  <div>✓</div>
                  <span>Verified</span>
                </div>

                <div className="progress-step current">
                  <div>4</div>
                  <span>Notice / Hearing</span>
                </div>

                <div className="progress-step">
                  <div>5</div>
                  <span>Award</span>
                </div>

                <div className="progress-step">
                  <div>6</div>
                  <span>Compensation</span>
                </div>

              </div>


              <div className="current-stage">

                <div>
                  <small>CURRENT STAGE</small>
                  <strong>Notice / Hearing</strong>
                  <p>
                    Hearing is scheduled for 18 September 2026.
                  </p>
                </div>

                <button onClick={() => setShowCase(true)}>
                  View Case Details →
                </button>

              </div>

            </div>


            {/* QUICK ACTIONS */}
            <div className="quick-card">

              <div className="card-title">
                <h3>Quick Actions</h3>
                <span>Common Services</span>
              </div>

              <button
                onClick={() => setActiveMenu("My Land Records")}
              >
                <span>🗺️</span>
                <div>
                  <strong>My Land Records</strong>
                  <small>View registered land</small>
                </div>
                →
              </button>

              <button
                onClick={() =>
                  setActiveMenu("Objections / Grievance")
                }
              >
                <span>⚖️</span>
                <div>
                  <strong>Submit Objection</strong>
                  <small>Raise an objection or grievance</small>
                </div>
                →
              </button>

              <button
                onClick={() => setActiveMenu("Documents")}
              >
                <span>📄</span>
                <div>
                  <strong>Upload Document</strong>
                  <small>Manage case documents</small>
                </div>
                →
              </button>

              <button
                onClick={() => setActiveMenu("Compensation")}
              >
                <span>💰</span>
                <div>
                  <strong>Compensation</strong>
                  <small>Track payment status</small>
                </div>
                →
              </button>

            </div>

          </section>


          {/* ================= LOWER GRID ================= */}
          <section className="lower-grid">

            {/* LAND RECORDS */}
            <div className="content-card">

              <div className="card-title">
                <div>
                  <h3>My Land Records</h3>
                  <span>Recently linked parcels</span>
                </div>

                <button
                  onClick={() =>
                    setActiveMenu("My Land Records")
                  }
                >
                  View All →
                </button>
              </div>

              <div className="land-table-wrapper">

                <table>

                  <thead>
                    <tr>
                      <th>Survey No.</th>
                      <th>Village</th>
                      <th>Area</th>
                      <th>Land Status</th>
                      <th>Acquisition</th>
                    </tr>
                  </thead>

                  <tbody>

                    <tr>
                      <td><strong>142/3</strong></td>
                      <td>Demo Village</td>
                      <td>2.4 Ha</td>
                      <td>
                        <span className="badge verified">
                          Verified
                        </span>
                      </td>
                      <td>
                        <span className="badge acquisition">
                          Under Acquisition
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td><strong>143/1</strong></td>
                      <td>Demo Village</td>
                      <td>1.2 Ha</td>
                      <td>
                        <span className="badge verified">
                          Verified
                        </span>
                      </td>
                      <td>
                        <span className="badge normal">
                          Not Acquired
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td><strong>139/8</strong></td>
                      <td>Demo Village</td>
                      <td>0.8 Ha</td>
                      <td>
                        <span className="badge review">
                          Under Review
                        </span>
                      </td>
                      <td>
                        <span className="badge normal">
                          Not Acquired
                        </span>
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

            </div>


            {/* NOTICES */}
            <div className="content-card notices-card">

              <div className="card-title">
                <div>
                  <h3>Recent Notices</h3>
                  <span>Important updates</span>
                </div>

                <button
                  onClick={() =>
                    setActiveMenu("Notices & Alerts")
                  }
                >
                  View All →
                </button>
              </div>


              <div className="notice-item">

                <div className="notice-icon important">
                  !
                </div>

                <div>
                  <strong>Hearing Notice</strong>

                  <p>
                    Hearing scheduled for 18 September 2026.
                  </p>

                  <small>
                    LAC-2026-001 • 2 hours ago
                  </small>
                </div>

                <span>→</span>

              </div>


              <div className="notice-item">

                <div className="notice-icon new">
                  ✓
                </div>

                <div>
                  <strong>Land Verification</strong>

                  <p>
                    Survey information has been verified.
                  </p>

                  <small>
                    LAC-2026-001 • Yesterday
                  </small>
                </div>

                <span>→</span>

              </div>


              <div className="notice-item">

                <div className="notice-icon money">
                  ₹
                </div>

                <div>
                  <strong>Compensation Update</strong>

                  <p>
                    Award preparation has started.
                  </p>

                  <small>
                    LAC-2026-001 • 2 days ago
                  </small>
                </div>

                <span>→</span>

              </div>

            </div>

          </section>


          {/* ================= COMPENSATION ================= */}
          <section className="compensation-card">

            <div className="compensation-left">

              <div className="money-icon">₹</div>

              <div>
                <span>COMPENSATION STATUS</span>

                <h2>₹8,45,000</h2>

                <p>
                  Estimated compensation for Survey No. 142/3
                </p>
              </div>

            </div>


            <div className="compensation-stages">

              <div className="comp-stage done">
                <span>✓</span>
                <div>
                  <strong>Assessment</strong>
                  <small>Completed</small>
                </div>
              </div>

              <div className="stage-line"></div>

              <div className="comp-stage current">
                <span>2</span>
                <div>
                  <strong>Award</strong>
                  <small>Under Preparation</small>
                </div>
              </div>

              <div className="stage-line"></div>

              <div className="comp-stage">
                <span>3</span>
                <div>
                  <strong>Payment</strong>
                  <small>Pending</small>
                </div>
              </div>

            </div>

            <button
              className="compensation-button"
              onClick={() => setActiveMenu("Compensation")}
            >
              View Compensation →
            </button>

          </section>


          {/* ================= FOOTER ================= */}
          <div className="dashboard-footer">
            <span>NLAMS • National Land Acquisition Management System</span>
            <span>Demonstration Prototype • 2026</span>
          </div>

        </main>

      </div>


      {/* ================= CASE MODAL ================= */}
      {showCase && (
        <div
          className="modal-overlay"
          onClick={() => setShowCase(false)}
        >
          <div
            className="case-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setShowCase(false)}
            >
              ×
            </button>

            <span className="section-tag">
              ACQUISITION CASE
            </span>

            <h2>
              National Highway Expansion – Phase 2
            </h2>

            <p className="modal-case-id">
              Case ID: LAC-2026-001
            </p>

            <div className="modal-details">

              <div>
                <small>Survey Number</small>
                <strong>142/3</strong>
              </div>

              <div>
                <small>Area</small>
                <strong>2.4 Hectares</strong>
              </div>

              <div>
                <small>Village</small>
                <strong>Demo Village</strong>
              </div>

              <div>
                <small>Current Status</small>
                <strong>Notice / Hearing</strong>
              </div>

            </div>

            <div className="modal-notice">
              <strong>Next Action</strong>
              <p>
                Attend the scheduled hearing on
                <b> 18 September 2026</b>.
              </p>
            </div>

            <button
              className="modal-button"
              onClick={() => setShowCase(false)}
            >
              Close Case Details
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default CitizenDashboard;