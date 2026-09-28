import React from 'react';
import { ROLES_CONFIG } from '../roles';

interface Props {
  activeRoleId: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<Props> = ({ activeRoleId, onLogout }) => {
  const role = ROLES_CONFIG[activeRoleId] || ROLES_CONFIG['citizen'];

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="dash-header">
        <div className="dash-brand">
          <h2>NLAMS Dashboard</h2>
          <span>{role.title}</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </header>

      <div className="dash-container">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="role-badge">
            <strong>{role.title}</strong>
            <small>Jurisdiction: {role.level}</small>
          </div>
          <nav className="side-nav">
            {role.menuItems.map((item, idx) => (
              <div key={idx} className={idx === 0 ? 'nav-link active' : 'nav-link'}>
                {item}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Panel */}
        <main className="dash-main">
          <h1>{role.title} Workspace</h1>
          <p className="subtext">Scope: {role.level} Level Administrative View</p>

          <div className="widgets-container">
            {role.widgets.map((widget, i) => (
              <div key={i} className="dash-card">
                <h4>{widget}</h4>
                <span className="card-number">{Math.floor(Math.random() * 15) + 1}</span>
                <p>Pending Actions</p>
              </div>
            ))}
          </div>

          <div className="table-card">
            <h3>Recent Applications / Cases</h3>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Case Ref ID</th>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#LAC-2026-881</td>
                  <td>National Highway Expansion Phase 2</td>
                  <td><span className="badge-pending">Under Processing</span></td>
                  <td><button className="btn-action">View</button></td>
                </tr>
                <tr>
                  <td>#LAC-2026-904</td>
                  <td>Rail Freight Corridor Section B</td>
                  <td><span className="badge-approved">Notice Issued</span></td>
                  <td><button className="btn-action">View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};