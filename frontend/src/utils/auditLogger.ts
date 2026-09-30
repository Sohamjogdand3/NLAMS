export interface WorkflowAuditLog {
  id: string
  step: number
  workItem: string
  originatingDashboard: string
  receivingDashboard: string
  outputArtifact: string
  targetProject: string
  timestamp: string
  user: string
  role: string
  action: string
  details: string
}

export const INITIAL_WORKFLOW_LOGS: WorkflowAuditLog[] = [
  {
    id: 'log-step-1',
    step: 1,
    workItem: 'Proposal Ingestion',
    originatingDashboard: 'PIA Agency Desk',
    receivingDashboard: 'State Revenue Nodal',
    outputArtifact: 'Requisition File & KML Alignment',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'Er. Rajesh Patil (NHAI)',
    role: 'PIA Officer',
    action: 'Submitted Requisition File & KML Alignment',
    details: 'Project proposal created with DPR and interactive GIS boundary alignment.',
  },
  {
    id: 'log-step-2',
    step: 2,
    workItem: 'Scrutiny & CALA Order',
    originatingDashboard: 'State Revenue Nodal',
    receivingDashboard: 'District Collector Desk',
    outputArtifact: 'Sec 3(a) Gazette Order',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'Shri Anand V. (IAS)',
    role: 'State Revenue Nodal Officer',
    action: 'Issued Sec 3(a) Gazette Order & Appointed CALA',
    details: 'Intake verified against GIS forest layer; appointed District Collector Haveli.',
  },
  {
    id: 'log-step-3',
    step: 3,
    workItem: 'SIA Study & Expert Gate',
    originatingDashboard: 'District Collector Desk',
    receivingDashboard: 'Expert Committee Desk',
    outputArtifact: 'Social Impact Ledger',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'Dr. Suhas Diwase (IAS)',
    role: 'District Collector',
    action: 'Commissioned SIA Study & Cleared Expert Gate',
    details: 'Expert committee approved Social Impact Ledger with minimal displacement ratio.',
  },
  {
    id: 'log-step-4',
    step: 4,
    workItem: 'Sec 11 Freeze & Objections',
    originatingDashboard: 'District Collector Desk',
    receivingDashboard: 'Citizen Portal',
    outputArtifact: 'Form-II Gazette Notice & API Lock',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'District LAO Haveli',
    role: 'Land Acquisition Officer',
    action: 'Published Form-II Gazette Notice & API Lock',
    details: 'Section 11 freeze published; DILRMP / Mahabhulekh mutation lock engaged.',
  },
  {
    id: 'log-step-5',
    step: 5,
    workItem: 'Field Geotag Audit',
    originatingDashboard: 'Field Surveyor App',
    receivingDashboard: 'District LAO Desk',
    outputArtifact: 'Geotagged Asset Photos & GPS Bounds',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'Suresh More (Patwari)',
    role: 'Field Surveyor',
    action: 'Synced Geotagged Asset Photos & GPS Bounds',
    details: 'Boundary walk completed with mobile GPS markers and structure photos.',
  },
  {
    id: 'log-step-6',
    step: 6,
    workItem: 'Award Valuation',
    originatingDashboard: 'District LAO Desk',
    receivingDashboard: 'Citizen & R&R Desks',
    outputArtifact: 'RFCTLARR Sec 23 Statutory Award',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'District LAO Haveli',
    role: 'Land Acquisition Officer',
    action: 'Pronounced RFCTLARR Sec 23 Statutory Award',
    details: 'Calculated 100% Solatium + 12% Interest + Multiplier factor 1.5x.',
  },
  {
    id: 'log-step-7',
    step: 7,
    workItem: 'Claim Verification',
    originatingDashboard: 'Citizen Portal',
    receivingDashboard: 'District LAO Desk',
    outputArtifact: 'Title Verification Certificate',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'Ramesh K. (Landowner)',
    role: 'Citizen',
    action: 'Generated Title Verification Certificate',
    details: 'Verified 7/12 extract, Aadhaar credentials, and direct bank account mapping.',
  },
  {
    id: 'log-step-8',
    step: 8,
    workItem: 'Disbursement & Handover',
    originatingDashboard: 'R&R Admin Desk',
    receivingDashboard: 'PIA & Central Desks',
    outputArtifact: 'PFMS DBT Payout & Title Mutation',
    targetProject: 'PROP-2026-MH8941',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toLocaleString('en-IN'),
    user: 'R&R Administrator',
    role: 'Rehabilitation Officer',
    action: 'Triggered PFMS DBT Payout & Land Title Mutation',
    details: 'Compensation disbursed to escrow; land mutated on DILRMP to NHAI.',
  },
]

const STORAGE_KEY = 'dharaa_workflow_audit_logs'

export function getWorkflowAuditLogs(): WorkflowAuditLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to read workflow audit logs from localStorage:', e)
  }
  // Initialize with initial logs
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WORKFLOW_LOGS))
  } catch (e) {
    // ignore
  }
  return INITIAL_WORKFLOW_LOGS
}

export function recordWorkflowStepLog(entry: Omit<WorkflowAuditLog, 'id' | 'timestamp'>): WorkflowAuditLog {
  const logs = getWorkflowAuditLogs()
  const newLog: WorkflowAuditLog = {
    ...entry,
    id: `log-step-${Date.now()}`,
    timestamp: new Date().toLocaleString('en-IN'),
  }
  const updatedLogs = [newLog, ...logs]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs))
  } catch (e) {
    console.warn('Failed to save workflow audit log:', e)
  }
  return newLog
}
