import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const TehsildarDashboard: React.FC<Props> = ({ onLogout }) => {

  const [active, setActive] = useState("Dashboard");
  const [caseOpen, setCaseOpen] = useState(false);

  const menu = [
    ["Dashboard", "▦"],
    ["Case Approvals", "✓"],
    ["Mutation Approvals", "↻"],
    ["Disputes & Objections", "⚖"],
    ["Acquisition Cases", "◫"],
    ["Taluka Overview", "▤"],
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
            <strong>Demo Taluka • Demo District</strong>
          </div>

          <button className="header-icon">
            🔔<b>7</b>
          </button>

          <div className="gov-profile">
            <div>TH</div>
            <span>
              <strong>Demo Tehsildar</strong>
              <small>Taluka Administration</small>
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
              <strong>Tehsildar</strong>
              <small>Taluka Administration</small>
            </div>
          </div>

          <label>TALUKA ADMINISTRATION</label>

          {menu.map(([name, icon]) => (
            <button
              key={name}
              className={active === name ? "gov-nav active" : "gov-nav"}
              onClick={() => setActive(name)}
            >
              <span>{icon}</span>
              {name}

              {name === "Case Approvals" && <em>12</em>}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="online">
              <span></span>
              Administrative Access
            </div>
            <small>Taluka jurisdiction</small>
          </div>

        </aside>

        <main className="gov-main">

          <div className="gov-page-heading">

            <div>
              <span>NLAMS / TALUKA ADMINISTRATION</span>

              <h1>Tehsildar Dashboard</h1>

              <p>
                Review land acquisition cases, disputes and revenue approvals.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setActive("Case Approvals")}
            >
              Open Approval Queue →
            </button>

          </div>


          <div className="gov-kpis">

            <div className="gov-kpi">
              <span>ACTIVE ACQUISITION CASES</span>
              <strong>37</strong>
              <small>Across 12 villages</small>
            </div>

            <div className="gov-kpi orange">
              <span>PENDING APPROVALS</span>
              <strong>12</strong>
              <small>Require your action</small>
            </div>

            <div className="gov-kpi red">
              <span>DISPUTES</span>
              <strong>06</strong>
              <small>Open objections</small>
            </div>

            <div className="gov-kpi green">
              <span>COMPLETED THIS MONTH</span>
              <strong>24</strong>
              <small>Cases processed</small>
            </div>

          </div>


          <div className="gov-grid-two">

            <section className="gov-card large">

              <div className="card-heading">

                <div>
                  <span>APPROVAL QUEUE</span>
                  <h2>Cases Requiring Action</h2>
                </div>

                <button>
                  View Queue →
                </button>

              </div>

              <table className="gov-table">

                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Project</th>
                    <th>Village</th>
                    <th>Stage</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td><strong>LAC-2026-001</strong></td>
                    <td>NH-48 Expansion</td>
                    <td>Demo Village</td>
                    <td>
                      <span className="status orange">
                        Verification
                      </span>
                    </td>
                    <td>
                      <span className="status red">High</span>
                    </td>
                    <td>
                      <button onClick={() => setCaseOpen(true)}>
                        Review
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>LAC-2026-014</strong></td>
                    <td>Rail Corridor</td>
                    <td>Shiv Nagar</td>
                    <td>
                      <span className="status blue">
                        Objection
                      </span>
                    </td>
                    <td>
                      <span className="status orange">Medium</span>
                    </td>
                    <td>
                      <button onClick={() => setCaseOpen(true)}>
                        Review
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>LAC-2026-019</strong></td>
                    <td>Industrial Corridor</td>
                    <td>Demo Village</td>
                    <td>
                      <span className="status green">
                        Verified
                      </span>
                    </td>
                    <td>
                      <span className="status blue">Normal</span>
                    </td>
                    <td>
                      <button onClick={() => setCaseOpen(true)}>
                        Approve
                      </button>
                    </td>
                  </tr>

                </tbody>

              </table>

            </section>


            <section className="gov-card">

              <div className="card-heading">
                <div>
                  <span>CASE WORKFLOW</span>
                  <h2>Current Processing</h2>
                </div>
              </div>

              <div className="vertical-flow">

                <div className="flow-step done">
                  <span>✓</span>
                  <div>
                    <strong>Survey Completed</strong>
                    <small>Field survey verified</small>
                  </div>
                </div>

                <div className="flow-step done">
                  <span>✓</span>
                  <div>
                    <strong>Revenue Verification</strong>
                    <small>Talathi verification completed</small>
                  </div>
                </div>

                <div className="flow-step current">
                  <span>3</span>
                  <div>
                    <strong>Tehsildar Review</strong>
                    <small>Approval required</small>
                  </div>
                </div>

                <div className="flow-step">
                  <span>4</span>
                  <div>
                    <strong>LAO Processing</strong>
                    <small>Upcoming stage</small>
                  </div>
                </div>

              </div>

            </section>

          </div>


          <div className="gov-grid-two">

            <section className="gov-card">

              <div className="card-heading">
                <div>
                  <span>PUBLIC OBJECTIONS</span>
                  <h2>Recent Disputes</h2>
                </div>
              </div>

              <div className="activity">
                <div className="activity-icon red-icon">⚖</div>

                <div>
                  <strong>Objection #OBJ-2026-18</strong>
                  <p>Land owner disputes acquisition boundary.</p>
                  <small>Hearing required • 18 Sep 2026</small>
                </div>
              </div>

              <div className="activity">
                <div className="activity-icon">⚖</div>

                <div>
                  <strong>Objection #OBJ-2026-16</strong>
                  <p>Compensation calculation questioned.</p>
                  <small>Documents submitted</small>
                </div>
              </div>

            </section>


            <section className="alert-box">

              <span>⚡ ACTION REQUIRED</span>

              <h2>12 approvals pending</h2>

              <p>
                Several acquisition cases have crossed their
                expected review period.
              </p>

              <button onClick={() => setActive("Case Approvals")}>
                Open Approval Queue →
              </button>

            </section>

          </div>


          <footer className="gov-footer">
            NLAMS • Taluka Administration
            <span>Demo Taluka • Demonstration Prototype</span>
          </footer>

        </main>
      </div>


      {caseOpen && (

        <div className="gov-modal-overlay">

          <div className="gov-modal">

            <button
              className="modal-x"
              onClick={() => setCaseOpen(false)}
            >
              ×
            </button>

            <span>CASE REVIEW</span>

            <h2>LAC-2026-001</h2>

            <p className="modal-subtitle">
              National Highway Expansion – Phase 2
            </p>

            <div className="modal-grid">

              <div>
                <small>Village</small>
                <strong>Demo Village</strong>
              </div>

              <div>
                <small>Survey Number</small>
                <strong>142/3</strong>
              </div>

              <div>
                <small>Area</small>
                <strong>2.4 Ha</strong>
              </div>

              <div>
                <small>Current Stage</small>
                <strong>Tehsildar Review</strong>
              </div>

            </div>

            <div className="decision-box">

              <strong>Decision</strong>

              <div>
                <button
                  className="approve"
                  onClick={() => setCaseOpen(false)}
                >
                  ✓ Approve Case
                </button>

                <button
                  className="reject"
                  onClick={() => setCaseOpen(false)}
                >
                  Return for Review
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default TehsildarDashboard;