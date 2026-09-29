export type PiaNavigationTab =
  | 'dashboard'
  | 'projects'
  | 'create-proposal'
  | 'progress'
  | 'documents'
  | 'alerts'
  | 'reports'
  | 'gis'
  | 'profile'
  | 'legal_ai'

export type StatutoryStage =
  | 'Proposal'
  | 'Scrutiny'
  | 'Notification'
  | 'Award'
  | 'Compensation'
  | 'Possession'

export type ProjectStatus =
  | 'draft'
  | 'under_scrutiny'
  | 'approved'
  | 'clarification_required'
  | 'in_progress'
  | 'possession_completed'

export type InfrastructureSector =
  | 'Highways'
  | 'Railways'
  | 'Industrial Corridor'
  | 'Energy / Power'
  | 'Port & Multi-Modal'

export interface PiaProject {
  id: string
  code: string
  name: string
  agency: string
  sector: InfrastructureSector
  state: string
  district: string
  tehsils: string[]
  landRequiredHa: number
  landAcquiredHa: number
  privateLandHa: number
  govtLandHa: number
  forestLandHa: number
  parcelsCount: number
  currentStage: StatutoryStage
  status: ProjectStatus
  budgetCr: number
  disbursedCr: number
  lastUpdated: string
  submissionDate: string
  targetCommissioning: string
  calaAuthority: string
  coordinates: [number, number] // [lat, lng]
  alignmentPath?: [number, number][]
  clarificationsCount: number
  pendingDocsCount: number
  statutoryMilestones: {
    stage: StatutoryStage
    status: 'completed' | 'current' | 'upcoming'
    completedDate?: string
    notes?: string
    slaDays: number
    elapsedDays: number
  }[]
}

export interface PiaDocument {
  id: string
  projectId: string
  projectCode: string
  projectName: string
  title: string
  category:
    | 'Gazette Notification'
    | 'Joint Measurement Survey'
    | 'Sanction Order'
    | 'Cadastral Map'
    | 'Valuation Sheet'
    | 'Forest Clearance'
  fileType: 'PDF' | 'DWG' | 'XLSX' | 'ZIP'
  fileSize: string
  uploadDate: string
  uploadedBy: string
  status: 'verified' | 'pending' | 'action_required'
  gazetteNumber?: string
  remarks?: string
}

export interface PiaClarificationAlert {
  id: string
  projectId: string
  projectCode: string
  projectName: string
  raisedBy: string
  queryType:
    | 'Cadastral Mismatch'
    | 'Valuation Query'
    | 'Revenue Boundary'
    | 'Missing Forest NOC'
    | 'Survey Objection'
  severity: 'critical' | 'warning' | 'info'
  daysLeft: number
  dateRaised: string
  title: string
  description: string
  status: 'open' | 'resolved'
  resolutionRemark?: string
  resolutionDate?: string
}

export interface PiaKpiMetrics {
  totalProjects: number
  draftProposals: number
  underScrutiny: number
  approved: number
  clarificationRequired: number
  acquisitionInProgress: number
  totalLandRequiredHa: number
  totalLandAcquiredHa: number
  totalBudgetCr: number
  totalDisbursedCr: number
}

export interface CreateProposalFormData {
  projectName: string
  sector: InfrastructureSector
  agencyUnit: string
  state: string
  district: string
  tehsils: string
  landRequiredHa: number
  privateLandHa: number
  govtLandHa: number
  forestLandHa: number
  targetCommissioning: string
  calaPreference: string
  justificationNote: string
  corridorType: string
  hasForestNoc: boolean
  pfrDocumentName?: string
  villageScheduleName?: string
  alignmentFileName?: string
}
