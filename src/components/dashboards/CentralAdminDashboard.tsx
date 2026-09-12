import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const CentralAdminDashboard: React.FC<Props> = ({ onLogout }) => {

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "National Overview",
    "State Administration",
    "Integrations",
    "Audit & Compliance",
    "AI Monitoring",
    "National Reports",
  ];

  return (
    <div className="gov-dashboard">

      <header className="gov-header">

        <div>
          <h2>NLAMS</h2>
          <span>National Land Acquisition Management System</span>
        </div>

        <div className="header-right">
          <span>🔔 Notifications</span>
          <span>Central Administration</span>
          <button onClick={onLogout}>Logout</button>
        </div>

      </header>

      <div className="gov-body">

        <aside className="gov-sidebar">

          <div className="profile-box">
            <div className="profile-icon">CA</div>
            <strong>Central Administrator</strong>
            <small>National Level</small>
          </div>

          {menuItems.map((item) => (
            <button
              key={item}
              className={activeMenu === item ? "side-active" : ""}
              onClick={() => setActiveMenu(item)}
            >
              {item}
            </button>
          ))}

        </aside>

        <main className="gov-main">

          <div className="page-title">

            <div>
              <h1>Central Administration Dashboard</h1>
              <p>National overview of land acquisition operations</p>
            </div>

            <button className="primary-btn">
              National Report
            </button>

          </div>

          <div className="kpi-grid">

            <div className="kpi-card">
              <span>States / UTs</span>
              <strong>36</strong>
              <small>Connected jurisdictions</small>
            </div>

            <div className="kpi-card">
              <span>Active Projects</span>
              <strong>2,846</strong>
              <small>Nationwide</small>
            </div>

            <div className="kpi-card">
              <span>Land Under Acquisition</span>
              <strong>1.82M</strong>
              <small>Acres</small>
            </div>

            <div className="kpi-card">
              <span>Cases Processed</span>
              <strong>4.76M</strong>
              <small>Total cases</small>
            </div>

          </div>

          <div className="content-card">

            <div className="card-header">
              <h2>National State Overview</h2>
              <button>View Detailed MIS</button>
            </div>

            <table className="gov-table">

              <thead>
                <tr>
                  <th>State / UT</th>
                  <th>Projects</th>
                  <th>Land Acquired</th>
                  <th>Cases</th>
                  <th>Completion</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>Maharashtra</td>
                  <td>248</td>
                  <td>84,620 Acres</td>
                  <td>8,642</td>
                  <td>78%</td>
                  <td>
                    <span className="status approved">Healthy</span>
                  </td>
                </tr>

                <tr>
                  <td>Gujarat</td>
                  <td>214</td>
                  <td>72,410 Acres</td>
                  <td>7,218</td>
                  <td>72%</td>
                  <td>
                    <span className="status approved">Healthy</span>
                  </td>
                </tr>

                <tr>
                  <td>Uttar Pradesh</td>
                  <td>386</td>
                  <td>1,12,840 Acres</td>
                  <td>18,426</td>
                  <td>64%</td>
                  <td>
                    <span className="status pending">Monitoring</span>
                  </td>
                </tr>

                <tr>
                  <td>Karnataka</td>
                  <td>192</td>
                  <td>61,250 Acres</td>
                  <td>6,824</td>
                  <td>81%</td>
                  <td>
                    <span className="status approved">Healthy</span>
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

          <div className="content-card">

            <div className="card-header">
              <h2>System Health & AI Monitoring</h2>
            </div>

            <div className="activity-list">

              <div>
                <strong>✓ National GIS Integration</strong>
                <span>Operational • Last sync 12 minutes ago</span>
              </div>

              <div>
                <strong>✓ Land Records Integration</strong>
                <span>Operational • All major states connected</span>
              </div>

              <div>
                <strong>🤖 AI Anomaly Detection</strong>
                <span>2,184 records flagged for review</span>
              </div>

              <div>
                <strong>⚠ Integration Alert</strong>
                <span>Temporary delay reported from 2 state systems</span>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};

export default CentralAdminDashboard;