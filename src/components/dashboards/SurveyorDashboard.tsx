import React, { useState } from "react";
import "./SurveyorDashboard.css";

interface Props {
  onLogout: () => void;
}

const SurveyorDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    ["Dashboard", "▦"],
    ["Assigned Surveys", "📍"],
    ["Field Survey", "🛰️"],
    ["Land Boundaries", "⬡"],
    ["Verification Queue", "✓"],
    ["Survey Reports", "▤"],
    ["GIS Map", "🗺️"],
  ];

  const tasks = [
    {
      id: "SRV-2026-041",
      survey: "142/3",
      village: "Demo Village",
      project: "NH-48 Expansion",
      area: "2.4 Ha",
      status: "Pending Survey",
      priority: "High",
    },
    {
      id: "SRV-2026-042",
      survey: "155/2",
      village: "Shiv Nagar",
      project: "Rail Freight Corridor",
      area: "1.8 Ha",
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: "SRV-2026-043",
      survey: "161/7",
      village: "Demo Village",
      project: "Industrial Corridor",
      area: "3.1 Ha",
      status: "Boundary Review",
      priority: "High",
    },
  ];

  return (
    <div className="surveyor-dashboard">

      {/* HEADER */}
      <header className="surveyor-header">

        <div className="surveyor-brand">
          <div className="surveyor-emblem">IN</div>

          <div>
            <h2>NLAMS</h2>
            <span>National Land Acquisition Management System</span>
          </div>
        </div>

        <div className="surveyor-header-right">

          <div className="jurisdiction">
            <span>JURISDICTION</span>
            <strong>Demo Village • Taluka</strong>
          </div>

          <div className="notification-wrap">

            <button
              className="survey-notification"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
            >
              🔔
              <b>4</b>
            </button>

            {showNotifications && (
              <div className="survey-notification-panel">
                <h3>Notifications</h3>

                <div>
                  <strong>New Survey Assigned</strong>
                  <p>Survey No. 142/3 requires field verification.</p>
                </div>

                <div>
                  <strong>Boundary Flag Raised</strong>
                  <p>Parcel 161/7 has a boundary mismatch.</p>
                </div>

                <div>
                  <strong>Report Returned</strong>
                  <p>Survey report SRV-2026-038 needs review.</p>
                </div>
              </div>
            )}
          </div>

          <div className="surveyor-profile">
            <div className="surveyor-avatar">SV</div>
            <div>
              <strong>Demo Surveyor</strong>
              <small>Village Surveyor</small>
            </div>
          </div>

          <button className="surveyor-logout" onClick={onLogout}>
            Logout
          </button>

        </div>
      </header>


      <div className="surveyor-body">

        {/* SIDEBAR */}
        <aside className="surveyor-sidebar">

          <div className="surveyor-role-box">
            <div className="surveyor-role-icon">📍</div>

            <div>
              <strong>Village Surveyor</strong>
              <small>Field Operations</small>
            </div>
          </div>

          <div className="surveyor-nav-label">
            SURVEY OPERATIONS
          </div>

          <nav>
            {menuItems.map(([name, icon]) => (
              <button
                key={name}
                className={
                  activeMenu === name
                    ? "surveyor-nav active"
                    : "surveyor-nav"
                }
                onClick={() => setActiveMenu(name)}
              >
                <span>{icon}</span>
                {name}

                {name === "Verification Queue" && (
                  <em>5</em>
                )}
              </button>
            ))}
          </nav>

          <div className="surveyor-sidebar-bottom">

            <div className="field-status">
              <span></span>
              <div>
                <strong>Field Mode Active</strong>
                <small>GPS services available</small>
              </div>
            </div>

            <button
              className="surveyor-help"
              onClick={() => setActiveMenu("Help")}
            >
              ? &nbsp; Surveyor Help
            </button>

          </div>

        </aside>


        {/* MAIN */}
        <main className="surveyor-main">

          {/* PAGE TITLE */}
          <div className="surveyor-page-title">

            <div>
              <span>NLAMS / SURVEY OPERATIONS</span>

              <h1>Surveyor Workspace</h1>

              <p>
                Manage assigned land surveys, boundaries and
                field verification activities.
              </p>
            </div>

            <button
              className="start-survey-btn"
              onClick={() => setShowSurvey(true)}
            >
              + Start Field Survey
            </button>

          </div>


          {/* KPI */}
          <section className="surveyor-kpis">

            <div className="surveyor-kpi blue">
              <div>
                <span>ASSIGNED SURVEYS</span>
                <strong>18</strong>
                <p>For current jurisdiction</p>
              </div>
              <div className="survey-kpi-icon">📍</div>
            </div>

            <div className="surveyor-kpi orange">
              <div>
                <span>PENDING SURVEYS</span>
                <strong>07</strong>
                <p>Require field visit</p>
              </div>
              <div className="survey-kpi-icon">⏱</div>
            </div>

            <div className="surveyor-kpi green">
              <div>
                <span>COMPLETED</span>
                <strong>11</strong>
                <p>This acquisition cycle</p>
              </div>
              <div className="survey-kpi-icon">✓</div>
            </div>

            <div className="surveyor-kpi red">
              <div>
                <span>BOUNDARY FLAGS</span>
                <strong>03</strong>
                <p>Require attention</p>
              </div>
              <div className="survey-kpi-icon">⚠</div>
            </div>

          </section>


          {/* MAIN TWO COLUMN */}
          <section className="surveyor-main-grid">

            {/* GIS MAP */}
            <div className="gis-card">

              <div className="gis-header">

                <div>
                  <span>GIS FIELD VIEW</span>
                  <h2>Assigned Land Parcels</h2>
                </div>

                <div className="map-controls">
                  <button>＋</button>
                  <button>−</button>
                  <button>⌖</button>
                </div>

              </div>

              <div className="fake-map">

                <div className="map-grid"></div>

                <div className="road road-one"></div>
                <div className="road road-two"></div>

                <div className="parcel parcel-one">
                  <span>142/3</span>
                </div>

                <div className="parcel parcel-two">
                  <span>155/2</span>
                </div>

                <div className="parcel parcel-three">
                  <span>161/7</span>
                </div>

                <div className="gps-marker">
                  <span>●</span>
                  <small>Surveyor GPS</small>
                </div>

                <div className="map-label village-label">
                  DEMO VILLAGE
                </div>

                <div className="map-legend">

                  <strong>Map Legend</strong>

                  <div>
                    <i className="legend-blue"></i>
                    Assigned Parcel
                  </div>

                  <div>
                    <i className="legend-orange"></i>
                    Under Survey
                  </div>

                  <div>
                    <i className="legend-red"></i>
                    Boundary Flag
                  </div>

                </div>

              </div>

              <div className="gis-footer">

                <span>
                  📍 GPS: 19.0478° N, 72.8897° E
                </span>

                <span>
                  Satellite Layer: Active
                </span>

                <button onClick={() => setActiveMenu("GIS Map")}>
                  Open Full Map →
                </button>

              </div>

            </div>


            {/* TODAY'S TASKS */}
            <div className="tasks-card">

              <div className="tasks-heading">
                <div>
                  <span>TODAY</span>
                  <h2>Survey Tasks</h2>
                </div>

                <button>View All</button>
              </div>

              {tasks.map((task) => (

                <div
                  key={task.id}
                  className={
                    selectedTask === task.id
                      ? "survey-task selected"
                      : "survey-task"
                  }
                  onClick={() => setSelectedTask(task.id)}
                >

                  <div className="task-location">
                    <div>📍</div>
                  </div>

                  <div className="task-info">

                    <strong>
                      Survey No. {task.survey}
                    </strong>

                    <span>
                      {task.village} • {task.area}
                    </span>

                    <small>
                      {task.project}
                    </small>

                  </div>

                  <div className="task-right">

                    <span
                      className={
                        task.priority === "High"
                          ? "priority high"
                          : "priority medium"
                      }
                    >
                      {task.priority}
                    </span>

                    <small>
                      {task.status}
                    </small>

                  </div>

                </div>

              ))}

              <button
                className="open-task-btn"
                onClick={() => setShowSurvey(true)}
              >
                Open Selected Survey →
              </button>

            </div>

          </section>


          {/* LOWER SECTION */}
          <section className="surveyor-lower-grid">

            {/* VERIFICATION QUEUE */}
            <div className="survey-content-card">

              <div className="content-card-header">

                <div>
                  <span>FIELD VERIFICATION</span>
                  <h2>Verification Queue</h2>
                </div>

                <button
                  onClick={() =>
                    setActiveMenu("Verification Queue")
                  }
                >
                  View Queue →
                </button>

              </div>

              <table className="survey-table">

                <thead>
                  <tr>
                    <th>Survey No.</th>
                    <th>Land Owner</th>
                    <th>Area</th>
                    <th>Verification</th>
                    <th>Flag</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td><strong>142/3</strong></td>
                    <td>Demo Citizen</td>
                    <td>2.4 Ha</td>
                    <td>
                      <span className="status pending">
                        Pending
                      </span>
                    </td>
                    <td>
                      <span className="flag none">
                        None
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setShowSurvey(true)}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>161/7</strong></td>
                    <td>Demo Citizen 02</td>
                    <td>3.1 Ha</td>
                    <td>
                      <span className="status review">
                        Review
                      </span>
                    </td>
                    <td>
                      <span className="flag danger">
                        Boundary
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setShowSurvey(true)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><strong>155/2</strong></td>
                    <td>Demo Citizen 03</td>
                    <td>1.8 Ha</td>
                    <td>
                      <span className="status completed">
                        Verified
                      </span>
                    </td>
                    <td>
                      <span className="flag none">
                        None
                      </span>
                    </td>
                    <td>
                      <button>View</button>
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>


            {/* AI / FIELD ALERT */}
            <div className="survey-alert-card">

              <div className="alert-header">
                <div className="ai-symbol">✦</div>

                <div>
                  <span>FIELD INTELLIGENCE</span>
                  <h2>Survey Alerts</h2>
                </div>
              </div>

              <div className="alert-main">

                <div className="alert-icon">
                  ⚠
                </div>

                <div>
                  <strong>
                    Boundary mismatch detected
                  </strong>

                  <p>
                    Parcel 161/7 shows a possible boundary
                    difference between submitted records and
                    mapped survey data.
                  </p>
                </div>

              </div>

              <div className="alert-meta">
                <span>Confidence</span>
                <strong>87%</strong>
              </div>

              <div className="confidence-bar">
                <div></div>
              </div>

              <button
                onClick={() => setActiveMenu("Land Boundaries")}
              >
                Review Boundary →
              </button>

            </div>

          </section>


          {/* REPORT SECTION */}
          <section className="report-strip">

            <div className="report-icon">📋</div>

            <div>
              <strong>Survey Report Submission</strong>
              <p>
                3 completed surveys are ready for submission
                to the Talathi verification queue.
              </p>
            </div>

            <div className="report-count">
              <strong>03</strong>
              <span>Reports Ready</span>
            </div>

            <button
              onClick={() => setActiveMenu("Survey Reports")}
            >
              Review Reports →
            </button>

          </section>


          <footer className="surveyor-footer">
            <span>
              NLAMS • Field Survey Operations
            </span>

            <span>
              Jurisdiction: Demo Village • Demonstration Prototype
            </span>
          </footer>

        </main>
      </div>


      {/* SURVEY MODAL */}
      {showSurvey && (

        <div
          className="survey-modal-overlay"
          onClick={() => setShowSurvey(false)}
        >

          <div
            className="survey-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setShowSurvey(false)}
            >
              ×
            </button>

            <span>FIELD SURVEY</span>

            <h2>
              Survey No. 142/3
            </h2>

            <p>
              National Highway Expansion – Phase 2
            </p>

            <div className="survey-modal-grid">

              <div>
                <small>Village</small>
                <strong>Demo Village</strong>
              </div>

              <div>
                <small>Area</small>
                <strong>2.4 Hectares</strong>
              </div>

              <div>
                <small>GPS Status</small>
                <strong className="gps-ok">
                  ● Connected
                </strong>
              </div>

              <div>
                <small>Boundary</small>
                <strong>Verified</strong>
              </div>

            </div>

            <div className="survey-checklist">

              <h3>Field Verification Checklist</h3>

              <label>
                <input type="checkbox" defaultChecked />
                Land boundary identified
              </label>

              <label>
                <input type="checkbox" defaultChecked />
                Survey number matched
              </label>

              <label>
                <input type="checkbox" />
                Ownership details verified
              </label>

              <label>
                <input type="checkbox" />
                Existing structure checked
              </label>

            </div>

            <div className="survey-modal-actions">

              <button
                className="cancel-survey"
                onClick={() => setShowSurvey(false)}
              >
                Cancel
              </button>

              <button
                className="submit-survey"
                onClick={() => {
                  setShowSurvey(false);
                  setActiveMenu("Survey Reports");
                }}
              >
                Submit Survey Report →
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default SurveyorDashboard;