import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const TalathiDashboard: React.FC<Props> = ({ onLogout }) => {
  const [active, setActive] = useState("Dashboard");
  const [selected, setSelected] = useState<string | null>(null);

  const menu = [
    ["Dashboard", "▦"],
    ["Village Land Register", "▤"],
    ["Verification Queue", "✓"],
    ["Mutation Entries", "↻"],
    ["Surveyor Reports", "📋"],
    ["Land Disputes", "⚖"],
    ["Village Map", "🗺"],
  ];

  return (
    <div className="gov-dashboard">

      <header className="gov-header">
        <div className="gov-brand">
          <div className="gov-emblem">IN</div>
          <div>
            <h2>NLAMS</h2>
            <span>National Land Acquisition Management System</span>
          </div>
        </div>

        <div className="gov-header-right">
          <div className="jurisdiction-box">
            <small>JURISDICTION</small>
            <strong>Demo Village • Demo Taluka</strong>
          </div>

          <button className="header-icon">🔔<b>5</b></button>

          <div className="gov-profile">
            <div>TL</div>
            <span>
              <strong>Demo Talathi</strong>
              <small>Revenue Department</small>
            </span>
          </div>

          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="gov-body">

        <aside className="gov-sidebar">

          <div className="gov-role">
            <div className="role-symbol">📑</div>
            <div>
              <strong>Talathi</strong>
              <small>Village Revenue Officer</small>
            </div>
          </div>

          <label>REVENUE OPERATIONS</label>

          {menu.map(([name, icon]) => (
            <button
              key={name}
              className={active === name ? "gov-nav active" : "gov-nav"}
              onClick={() => setActive(name)}
            >
              <span>{icon}</span>
              {name}

              {name === "Verification Queue" && <em>8</em>}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="online">
              <span></span>
              System Online
            </div>
            <small>Village jurisdiction locked</small>
          </div>

        </aside>

        <main className="gov-main">

          <div className="gov-page-heading">
            <div>
              <span>NLAMS / REVENUE DEPARTMENT</span>
              <h1>Village Revenue Dashboard</h1>
              <p>Manage village land records and acquisition verification.</p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setActive("Verification Queue")}
            >
              Review Pending Records →
            </button>
          </div>

          <div className="gov-kpis">

            <div className="gov-kpi">
              <span>VILLAGE LAND PARCELS</span>
              <strong>1,284</strong>
              <small>Registered records</small>
            </div>

            <div className="gov-kpi orange">
              <span>PENDING VERIFICATION</span>
              <strong>08</strong>
              <small>Surveyor submissions</small>
            </div>

            <div className="gov-kpi green">
              <span>MUTATION REQUESTS</span>
              <strong>14</strong>
              <small>Awaiting processing</small>
            </div>

            <div className="gov-kpi red">
              <span>DISPUTED RECORDS</span>
              <strong>03</strong>
              <small>Require attention</small>
            </div>

          </div>

          <div className="gov-grid-two">

            <section className="gov-card large">

              <div className="card-heading">
                <div>
                  <span>LAND RECORD VERIFICATION</span>
                  <h2>Pending Surveyor Reports</h2>
                </div>

                <button onClick={() => setActive("Surveyor Reports")}>
                  View All →
                </button>
              </div>

              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Survey No.</th>
                    <th>Owner</th>
                    <th>Area</th>
                    <th>Survey Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td><strong>142/3</strong></td>
                    <td>Demo Citizen</td>
                    <td>2.4 Ha</td>
                    <td><span className="status orange">Pending</span></td>
                    <td>
                      <button onClick={() => setSelected("142/3")}>
                        Verify
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>161/7</strong></td>
                    <td>Demo Citizen 02</td>
                    <td>3.1 Ha</td>
                    <td><span className="status red">Boundary Flag</span></td>
                    <td>
                      <button onClick={() => setSelected("161/7")}>
                        Review
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>155/2</strong></td>
                    <td>Demo Citizen 03</td>
                    <td>1.8 Ha</td>
                    <td><span className="status green">Verified</span></td>
                    <td>
                      <button>View</button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </section>

            <section className="gov-card">

              <div className="card-heading">
                <div>
                  <span>VILLAGE OVERVIEW</span>
                  <h2>Record Status</h2>
                </div>
              </div>

              <div className="donut-placeholder">
                <div>
                  <strong>1,284</strong>
                  <small>Total Parcels</small>
                </div>
              </div>

              <div className="legend-row">
                <span className="dot blue"></span> Verified
                <strong>1,176</strong>
              </div>

              <div className="legend-row">
                <span className="dot orange"></span> Under Review
                <strong>105</strong>
              </div>

              <div className="legend-row">
                <span className="dot red"></span> Disputed
                <strong>03</strong>
              </div>

            </section>

          </div>

          <div className="gov-grid-two">

            <section className="gov-card">

              <div className="card-heading">
                <div>
                  <span>MUTATION</span>
                  <h2>Recent Mutation Requests</h2>
                </div>
              </div>

              <div className="activity">
                <div className="activity-icon">↻</div>
                <div>
                  <strong>Mutation #MUT-2026-084</strong>
                  <p>Ownership update requested for Survey 139/8</p>
                  <small>Today • Pending Review</small>
                </div>
              </div>

              <div className="activity">
                <div className="activity-icon">↻</div>
                <div>
                  <strong>Mutation #MUT-2026-081</strong>
                  <p>Inheritance record submitted</p>
                  <small>Yesterday • Documents Received</small>
                </div>
              </div>

            </section>

            <section className="alert-box">

              <span>⚠ IMPORTANT</span>

              <h2>Boundary discrepancy detected</h2>

              <p>
                Survey No. 161/7 has a mismatch between field
                survey data and village record boundaries.
              </p>

              <button onClick={() => setSelected("161/7")}>
                Review Record →
              </button>

            </section>

          </div>

          <footer className="gov-footer">
            NLAMS • Village Revenue Operations
            <span>Demo Village • Demonstration Prototype</span>
          </footer>

        </main>
      </div>

      {selected && (
        <div className="gov-modal-overlay">
          <div className="gov-modal">

            <button
              className="modal-x"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <span>LAND RECORD VERIFICATION</span>

            <h2>Survey No. {selected}</h2>

            <div className="modal-grid">

              <div>
                <small>Land Owner</small>
                <strong>Demo Citizen</strong>
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
                <small>Survey Status</small>
                <strong>Pending Verification</strong>
              </div>

            </div>

            <div className="decision-box">
              <strong>Verification Decision</strong>

              <div>
                <button
                  className="approve"
                  onClick={() => setSelected(null)}
                >
                  ✓ Verify Record
                </button>

                <button
                  className="reject"
                  onClick={() => setSelected(null)}
                >
                  ⚠ Send for Review
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TalathiDashboard;