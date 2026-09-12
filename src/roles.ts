export interface RoleConfig {
  id: string;
  title: string;
  level: 'Village' | 'Taluka' | 'District' | 'State' | 'National' | 'Public';
  menuItems: string[];
  widgets: string[];
}

export const ROLES_CONFIG: Record<string, RoleConfig> = {
  citizen: {
    id: 'citizen',
    title: 'Citizen Portal',
    level: 'Public',
    menuItems: ['My Land Records', 'Track Applications', 'Submit Objection', 'Compensation Status'],
    widgets: ['Application Tracker', 'Active Notices', 'Payment Status']
  },
  surveyor: {
    id: 'surveyor',
    title: 'Village Surveyor Dashboard',
    level: 'Village',
    menuItems: ['Assigned Tasks', 'Field Maps', 'Photo Uploads', 'Encroachments'],
    widgets: ['Pending Inspections', 'GPS Captures', 'Boundary Conflicts']
  },
  talathi: {
    id: 'talathi',
    title: 'Talathi Revenue Dashboard',
    level: 'Village',
    menuItems: ['Village Register', 'Mutations Queue', 'Survey Reviews', 'Verification'],
    widgets: ['Pending Mutations', 'Survey Verification Requests']
  },
  tehsildar: {
    id: 'tehsildar',
    title: 'Tehsildar Arbitration Dashboard',
    level: 'Taluka',
    menuItems: ['Approvals Queue', 'Dispute Resolution', 'Taluka Overview', 'LAO Cases'],
    widgets: ['Dispute Hearings', 'Taluka SLA Status', 'Escalations']
  },
  lao: {
    id: 'lao',
    title: 'Land Acquisition Officer (LAO)',
    level: 'District',
    menuItems: ['Active Cases', 'Sec 4/11 Notices', 'Hearings Log', 'Awards Setup'],
    widgets: ['Active Case Files', 'Draft Awards Pending', 'Objections Log']
  },
  collector: {
    id: 'collector',
    title: 'District Collector Dashboard',
    level: 'District',
    menuItems: ['Award Approvals', 'Possession Warrants', 'District MIS', 'Escalations'],
    widgets: ['Pending Approvals', 'Possession Warrants Issued']
  },
  project_agency: {
    id: 'project_agency',
    title: 'Project Agency Portal (NHAI/Railways)',
    level: 'National',
    menuItems: ['Requirements Proposal', 'My Projects', 'Fund Escrow', 'Possession Status'],
    widgets: ['Active Proposals', 'Funded Projects', 'Handover Schedule']
  },
  state_admin: {
    id: 'state_admin',
    title: 'State Administrator Portal',
    level: 'State',
    menuItems: ['District Oversight', 'Official Provisioning', 'Schedule of Rates', 'State MIS'],
    widgets: ['Statewide Heatmap', 'District SLAs', 'Active Users']
  },
  central_admin: {
    id: 'central_admin',
    title: 'Central Admin Portal',
    level: 'National',
    menuItems: ['National Analytics', 'State Admins', 'API Gateway Integrations', 'Audit Logs'],
    widgets: ['National Analytics', 'API Health (DILRMP/BhuNaksha)', 'Audit Feed']
  }
};