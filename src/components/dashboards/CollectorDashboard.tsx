import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const CollectorDashboard: React.FC<Props> = ({ onLogout }) => {

  const [active, setActive] = useState("Dashboard");
  const [showApproval, setShowApproval] = useState(false);

  const menu = [
    ["Dashboard", "▦"],
    ["Award Approvals", "✓"],
    ["Possession Orders", "🏠"],
    ["District Overview", "📊"],
    ["Acquisition Cases", "◫"],
    ["Escalations", "⚠"],
    ["Reports", "📋"],
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
            <strong>Demo District • Maharashtra</strong>
          </div>

          <button className="header-icon">
            🔔<b>4</b>
          </button>

          <div className="gov-profile">
            <div>DC</div>
            <span>
              <strong>District Collector</strong>
              <small>District Administration</small>
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
              <strong>District Collector</strong>
              <small>District Administration</small>
            </div>
          </div>

          <label>DISTRICT ADMINISTRATION</label>

          {menu.map(([name, icon]) => (
            <button
              key={name}
              className={active === name ? "gov-nav active" : "gov-nav"}
              onClick={() => setActive(name)}
            >
              <span>{icon}</span>
              {name}

              {name === "Award Approvals" && <em>06</em>}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="online">
              <span></span>
              Collectorate Online
            </div>
            <small>District-level authority</small>
          </div>

        </aside>


        <main className="gov-main">

          <div className="gov-page-heading">

            <div>
              <span>NLAMS / DISTRICT ADMINISTRATION</span>

              <h1>District Collector Dashboard</h1>

              <p>
                Monitor acquisition progress and approve awards and possession.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setActive("Award Approvals")}
            >
              Review Awards →
            </button>

          </div>


          <div className="gov-kpis">

            <div className="gov-kpi">
              <span>TOTAL ACQUISITION CASES</span>
              <strong>126</strong>
              <small>Across district</small>
            </div>

            <div className="gov-kpi orange">
              <span>AWARDS PENDING</span>
              <strong>06</strong>
              <small>Approval required</small>
            </div>

            <div className="gov-kpi green">
              <span>POSSESSION READY</span>
              <strong>11</strong>
              <small>Cases completed</small>
            </div>

            <div className="gov-kpi red">
              <span>ESCALATIONS</span>
              <strong>04</strong>
              <small>Require attention</small>
            </div>

          </div>


          <div className="district-stats">

            <div>
              <span>LAND UNDER ACQUISITION</span>
              <strong>384.6 Ha</strong>
              <small>↑ 8.4% this quarter</small>
            </div>

            <div>
              <span>COMPENSATION COMMITTED</span>
              <strong>₹42.8 Cr</strong>
              <small>Across active projects</small>
            </div>

            <div>
              <span>CASES COMPLETED</span>
              <strong>79</strong>
              <small>Current financial year</small>
            </div>

            <div>
              <span>AVERAGE PROCESSING</span>
              <strong>74 Days</strong>
              <small>District average</small>
            </div>

          </div>


          <div className="gov-grid-two">

            <section className="gov-card large">

              <div className="card-heading">

                <div>
                  <span>AWARD APPROVAL QUEUE</span>
                  <h2>Pending Collector Approval</h2>
                </div>

                <button>View All →</button>

              </div>

              <table className="gov-table">

                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Project</th>
                    <th>Village</th>
                    <th>Compensation</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td><strong>LAC-2026-014</strong></td>
                    <td>Rail Corridor</td>
                    <td>Shiv Nagar</td>
                    <td>₹12.8 L</td>
                    <td>
                      <span className="status orange">Pending</span>
                    </td>
                    <td>
                      <button onClick={() => setShowApproval(true)}>
                        Review
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>LAC-2026-021</strong></td>
                    <td>NH Expansion</td>
                    <td>Demo Village</td>
                    <td>₹8.45 L</td>
                    <td>
                      <span className="status orange">Pending</span>
                    </td>
                    <td>
                      <button onClick={() => setShowApproval(true)}>
                        Review
                      </button>
                    </td>
                  </tr>

                </tbody>

              </table>

            </section>


            <section className="gov-card">

              <div className="card-heading">
                <div>
                  <span>DISTRICT PERFORMANCE</span>
                  <h2>Acquisition Progress</h2>
                </div>
              </div>

              <div className="big-progress">

                <div className="progress-circle">
                  <strong>63%</strong>
                  <small>Overall</small>
                </div>

                <div className="progress-details">
                  <div>
                    <span>Survey</span>
                    <strong>91%</strong>
                  </div>

                  <div>
                    <span>Verification</span>
                    <strong>82%</strong>
                  </div>

                  <div>
                    <span>Awards</span>
                    <strong>63%</strong>
                  </div>

                  <div>
                    <span>Possession</span>
                    <strong>48%</strong>
                  </div>
                </div>

              </div>

            </section>

          </div>


          <section className="award-banner">

            <div className="award-symbol">✓</div>

            <div>
              <span>DISTRICT ACTION CENTER</span>

              <h2>
                06 awards and 11 possession orders require review
              </h2>

              <p>
                Review statutory compliance and forward approved
                cases to the next stage.
              </p>
            </div>

            <button onClick={() => setShowApproval(true)}>
              Open Action Center →
            </button>

          </section>


          <footer className="gov-footer">
            NLAMS • District Administration
            <span>Demo District • Demonstration Prototype</span>
          </footer>

        </main>
      </div>


      {showApproval && (

        <div className="gov-modal-overlay">

          <div className="gov-modal">

            <button
              className="modal-x"
              onClick={() => setShowApproval(false)}
            >
              ×
            </button>

            <span>AWARD APPROVAL</span>

            <h2>LAC-2026-014</h2>

            <p className="modal-subtitle">
              Rail Freight Corridor – Section B
            </p>

            <div className="modal-grid">

              <div>
                <small>Land Owner</small>
                <strong>Demo Citizen 02</strong>
              </div>

              <div>
                <small>Area</small>
                <strong>4.1 Ha</strong>
              </div>

              <div>
                <small>Award Amount</small>
                <strong>₹12,80,000</strong>
              </div>

              <div>
                <small>LAO Recommendation</small>
                <strong>Recommended</strong>
              </div>

            </div>

            <div className="decision-box">

              <strong>Collector Decision</strong>

              <div>

                <button
                  className="approve"
                  onClick={() => setShowApproval(false)}
                >
                  ✓ Approve Award
                </button>

                <button
                  className="reject"
                  onClick={() => setShowApproval(false)}
                >
                  Return to LAO
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default CollectorDashboard;