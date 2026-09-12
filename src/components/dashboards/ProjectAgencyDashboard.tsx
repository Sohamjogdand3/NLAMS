import React, { useState } from "react";
import "./GovernmentDashboards.css";

interface Props {
  onLogout: () => void;
}

const ProjectAgencyDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "My Projects",
    "Land Requirements",
    "Acquisition Progress",
    "Fund Deposits",
    "Possession Handover",
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
          <span>Project Agency</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="gov-body">

        <aside className="gov-sidebar">
          <div className="profile-box">
            <div className="profile-icon">PA</div>
            <strong>Project Agency</strong>
            <small>Project Authority</small>
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
              <h1>Project Agency Dashboard</h1>
              <p>Monitor land requirements and acquisition progress</p>
            </div>

            <button className="primary-btn">
              + New Land Requirement
            </button>
          </div>

          <div className="kpi-grid">

            <div className="kpi-card">
              <span>Active Projects</span>
              <strong>12</strong>
              <small>Currently active</small>
            </div>

            <div className="kpi-card">
              <span>Land Required</span>
              <strong>1,284</strong>
              <small>Acres</small>
            </div>

            <div className="kpi-card">
              <span>Under Acquisition</span>
              <strong>847</strong>
              <small>Acres</small>
            </div>

            <div className="kpi-card">
              <span>Possession Received</span>
              <strong>326</strong>
              <small>Acres</small>
            </div>

          </div>

          <div className="content-card">

            <div className="card-header">
              <h2>Project Acquisition Status</h2>
              <button>View All</button>
            </div>

            <table className="gov-table">

              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Project Name</th>
                  <th>District</th>
                  <th>Land Required</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>PRJ-2026-001</td>
                  <td>Mumbai–Nagpur Highway</td>
                  <td>Thane</td>
                  <td>420 Acres</td>
                  <td>
                    <div className="progress-bar">
                      <div style={{ width: "75%" }} />
                    </div>
                    75%
                  </td>
                  <td>
                    <span className="status approved">On Track</span>
                  </td>
                </tr>

                <tr>
                  <td>PRJ-2026-008</td>
                  <td>Rail Freight Corridor</td>
                  <td>Palghar</td>
                  <td>315 Acres</td>
                  <td>
                    <div className="progress-bar">
                      <div style={{ width: "52%" }} />
                    </div>
                    52%
                  </td>
                  <td>
                    <span className="status pending">In Progress</span>
                  </td>
                </tr>

                <tr>
                  <td>PRJ-2026-014</td>
                  <td>Industrial Corridor</td>
                  <td>Pune</td>
                  <td>275 Acres</td>
                  <td>
                    <div className="progress-bar">
                      <div style={{ width: "35%" }} />
                    </div>
                    35%
                  </td>
                  <td>
                    <span className="status pending">Under Acquisition</span>
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

          <div className="content-card">

            <div className="card-header">
              <h2>Recent Actions</h2>
            </div>

            <div className="activity-list">

              <div>
                <strong>Land requirement submitted</strong>
                <span>PRJ-2026-014 • 2 hours ago</span>
              </div>

              <div>
                <strong>Fund deposit confirmed</strong>
                <span>PRJ-2026-008 • Yesterday</span>
              </div>

              <div>
                <strong>Possession request approved</strong>
                <span>PRJ-2026-001 • 2 days ago</span>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};

export default ProjectAgencyDashboard;