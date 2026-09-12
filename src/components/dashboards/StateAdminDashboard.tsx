import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const StateAdminDashboard: React.FC<Props> = ({ onLogout }) => {

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "District Overview",
    "User Management",
    "State MIS",
    "Policy & Rates",
    "Reports",
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
          <span>State Administration</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="gov-body">

        <aside className="gov-sidebar">

          <div className="profile-box">
            <div className="profile-icon">SA</div>
            <strong>State Administrator</strong>
            <small>Maharashtra State</small>
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
              <h1>State Administration Dashboard</h1>
              <p>State-wide land acquisition monitoring and administration</p>
            </div>

            <button className="primary-btn">
              Generate State Report
            </button>
          </div>

          <div className="kpi-grid">

            <div className="kpi-card">
              <span>Total Districts</span>
              <strong>36</strong>
              <small>Under monitoring</small>
            </div>

            <div className="kpi-card">
              <span>Active Projects</span>
              <strong>248</strong>
              <small>Across Maharashtra</small>
            </div>

            <div className="kpi-card">
              <span>Acquisition Cases</span>
              <strong>8,642</strong>
              <small>State-wide</small>
            </div>

            <div className="kpi-card">
              <span>Pending Approvals</span>
              <strong>426</strong>
              <small>Require attention</small>
            </div>

          </div>

          <div className="content-card">

            <div className="card-header">
              <h2>District Performance</h2>
              <button>View All Districts</button>
            </div>

            <table className="gov-table">

              <thead>
                <tr>
                  <th>District</th>
                  <th>Projects</th>
                  <th>Active Cases</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>Mumbai Suburban</td>
                  <td>18</td>
                  <td>428</td>
                  <td>312</td>
                  <td>116</td>
                  <td>
                    <span className="status approved">Good</span>
                  </td>
                </tr>

                <tr>
                  <td>Pune</td>
                  <td>31</td>
                  <td>846</td>
                  <td>574</td>
                  <td>272</td>
                  <td>
                    <span className="status pending">Monitoring</span>
                  </td>
                </tr>

                <tr>
                  <td>Thane</td>
                  <td>27</td>
                  <td>734</td>
                  <td>612</td>
                  <td>122</td>
                  <td>
                    <span className="status approved">Good</span>
                  </td>
                </tr>

                <tr>
                  <td>Nashik</td>
                  <td>24</td>
                  <td>621</td>
                  <td>398</td>
                  <td>223</td>
                  <td>
                    <span className="status pending">Monitoring</span>
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

          <div className="content-card">

            <div className="card-header">
              <h2>State Alerts</h2>
            </div>

            <div className="activity-list">

              <div>
                <strong>⚠ High pending cases in Pune</strong>
                <span>272 cases require district-level review</span>
              </div>

              <div>
                <strong>✓ Compensation processing improved</strong>
                <span>State-wide processing increased by 14%</span>
              </div>

              <div>
                <strong>ℹ Policy rate configuration updated</strong>
                <span>Updated compensation multiplier</span>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};

export default StateAdminDashboard;