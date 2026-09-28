import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const LAODashboard: React.FC<Props> = ({ onLogout }) => {

  const [active, setActive] = useState("Dashboard");
  const [showAward, setShowAward] = useState(false);

  const menu = [
    ["Dashboard", "▦"],
    ["Acquisition Cases", "◫"],
    ["Notices", "📄"],
    ["Hearings & Objections", "⚖"],
    ["Compensation & Awards", "₹"],
    ["Project Linkage", "🏗"],
    ["Reports", "📊"],
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
            <strong>Demo District</strong>
          </div>

          <button className="header-icon">
            🔔<b>6</b>
          </button>

          <div className="gov-profile">
            <div>LA</div>
            <span>
              <strong>Demo LAO</strong>
              <small>Land Acquisition Officer</small>
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
            <div className="role-symbol">🏛</div>

            <div>
              <strong>Land Acquisition Officer</strong>
              <small>District Acquisition Office</small>
            </div>
          </div>

          <label>ACQUISITION MANAGEMENT</label>

          {menu.map(([name, icon]) => (
            <button
              key={name}
              className={active === name ? "gov-nav active" : "gov-nav"}
              onClick={() => setActive(name)}
            >
              <span>{icon}</span>
              {name}

              {name === "Hearings & Objections" && <em>9</em>}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="online">
              <span></span>
              LAO Office Active
            </div>
            <small>District jurisdiction</small>
          </div>

        </aside>


        <main className="gov-main">

          <div className="gov-page-heading">

            <div>
              <span>NLAMS / LAND ACQUISITION OFFICE</span>

              <h1>Land Acquisition Officer Dashboard</h1>

              <p>
                Manage acquisition cases, notices, hearings and award preparation.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setActive("Acquisition Cases")}
            >
              Open Acquisition Cases →
            </button>

          </div>


          <div className="gov-kpis">

            <div className="gov-kpi">
              <span>ACTIVE CASES</span>
              <strong>48</strong>
              <small>District acquisition cases</small>
            </div>

            <div className="gov-kpi orange">
              <span>NOTICES PENDING</span>
              <strong>17</strong>
              <small>Awaiting issue</small>
            </div>

            <div className="gov-kpi red">
              <span>HEARINGS</span>
              <strong>09</strong>
              <small>Upcoming hearings</small>
            </div>

            <div className="gov-kpi green">
              <span>AWARDS READY</span>
              <strong>06</strong>
              <small>Ready for approval</small>
            </div>

          </div>


          <section className="gov-card">

            <div className="card-heading">

              <div>
                <span>ACQUISITION PIPELINE</span>
                <h2>Case Processing Overview</h2>
              </div>

              <button>View All Cases →</button>

            </div>

            <div className="pipeline">

              <div>
                <strong>48</strong>
                <span>Active Cases</span>
              </div>

              <i>→</i>

              <div>
                <strong>17</strong>
                <span>Notice Stage</span>
              </div>

              <i>→</i>

              <div>
                <strong>09</strong>
                <span>Hearing Stage</span>
              </div>

              <i>→</i>

              <div>
                <strong>11</strong>
                <span>Award Preparation</span>
              </div>

              <i>→</i>

              <div>
                <strong>06</strong>
                <span>Ready for Approval</span>
              </div>

            </div>

          </section>


          <div className="gov-grid-two">

            <section className="gov-card large">

              <div className="card-heading">

                <div>
                  <span>PRIORITY CASES</span>
                  <h2>Acquisition Cases</h2>
                </div>

                <button>View All →</button>

              </div>

              <table className="gov-table">

                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Project</th>
                    <th>Land</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td><strong>LAC-2026-001</strong></td>
                    <td>NH-48 Expansion</td>
                    <td>2.4 Ha</td>
                    <td>Hearing</td>
                    <td>
                      <span className="status orange">Priority</span>
                    </td>
                    <td>
                      <button>Open</button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>LAC-2026-014</strong></td>
                    <td>Rail Corridor</td>
                    <td>4.1 Ha</td>
                    <td>Award</td>
                    <td>
                      <span className="status green">Ready</span>
                    </td>
                    <td>
                      <button onClick={() => setShowAward(true)}>
                        Prepare Award
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>LAC-2026-019</strong></td>
                    <td>Industrial Corridor</td>
                    <td>3.8 Ha</td>
                    <td>Notice</td>
                    <td>
                      <span className="status blue">Processing</span>
                    </td>
                    <td>
                      <button>Open</button>
                    </td>
                  </tr>

                </tbody>

              </table>

            </section>


            <section className="gov-card">

              <div className="card-heading">
                <div>
                  <span>UPCOMING</span>
                  <h2>Hearings</h2>
                </div>
              </div>

              <div className="hearing">
                <strong>18 SEP</strong>
                <div>
                  <b>LAC-2026-001</b>
                  <small>Demo Citizen • 10:30 AM</small>
                </div>
              </div>

              <div className="hearing">
                <strong>20 SEP</strong>
                <div>
                  <b>LAC-2026-014</b>
                  <small>Demo Citizen 02 • 11:00 AM</small>
                </div>
              </div>

              <div className="hearing">
                <strong>22 SEP</strong>
                <div>
                  <b>LAC-2026-019</b>
                  <small>Demo Citizen 03 • 02:00 PM</small>
                </div>
              </div>

            </section>

          </div>


          <section className="award-banner">

            <div className="award-symbol">₹</div>

            <div>
              <span>AWARD PREPARATION</span>
              <h2>06 cases are ready for award preparation</h2>
              <p>
                Verify compensation calculations and supporting documents
                before forwarding for Collector approval.
              </p>
            </div>

            <button onClick={() => setShowAward(true)}>
              Review Awards →
            </button>

          </section>


          <footer className="gov-footer">
            NLAMS • Land Acquisition Office
            <span>Demo District • Demonstration Prototype</span>
          </footer>

        </main>
      </div>


      {showAward && (

        <div className="gov-modal-overlay">

          <div className="gov-modal">

            <button
              className="modal-x"
              onClick={() => setShowAward(false)}
            >
              ×
            </button>

            <span>AWARD PREPARATION</span>

            <h2>LAC-2026-014</h2>

            <p className="modal-subtitle">
              Rail Freight Corridor – Section B
            </p>

            <div className="modal-grid">

              <div>
                <small>Land Area</small>
                <strong>4.1 Ha</strong>
              </div>

              <div>
                <small>Land Owner</small>
                <strong>Demo Citizen 02</strong>
              </div>

              <div>
                <small>Estimated Award</small>
                <strong>₹12,80,000</strong>
              </div>

              <div>
                <small>Documents</small>
                <strong>✓ Complete</strong>
              </div>

            </div>

            <div className="decision-box">

              <strong>Award Preparation</strong>

              <div>
                <button
                  className="approve"
                  onClick={() => setShowAward(false)}
                >
                  ✓ Forward to Collector
                </button>

                <button
                  className="reject"
                  onClick={() => setShowAward(false)}
                >
                  Request Correction
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default LAODashboard;