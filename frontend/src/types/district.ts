export type DistrictNavigationTab =
  | 'dashboard'
  | 'projects'
  | 'pipeline'
  | 'gis'
  | 'scrutiny'
  | 'compensation'
  | 'alerts'
  | 'reports'

export type AcquisitionStage =
  | 'Proposal'
  | 'Scrutiny'
  | 'Notification'
  | 'Award'
  | 'Compensation'
  | 'R&R'
  | 'Possession'

export type DistrictProjectStatus =
  | 'pending_scrutiny'
  | 'clarification_requested'
  | 'scrutiny_approved'
  | 'sec_3a_gazette'
  | 'sec_3d_declaration'
  | 'sec_3g_award'
  | 'compensation_disbursing'
  | 'possession_completed'

export interface DistrictKpiMetric {
  id: string
  title: string
  value: string
  subtext: string
  trend: string
  badgeColor: string
}

export interface AffectedVillage {
  id: string
  name: string
  tehsil: string
  parcelsCount: number
  areaHectares: number
  acquiredHectares: number
  status: 'In Progress' | 'Completed' | 'Pending Scrutiny'
}

export interface ParcelInfo {
  id: string
  surveyNo: string
  village: string
  tehsil: string
  ownerName: string
  totalAreaSqM: number
  acquiredAreaSqM: number
  compensationAmount: number
  status: 'Surveyed' | 'Awarded' | 'Disbursed' | 'Disputed'
  category: 'Agricultural' | 'Residential' | 'Commercial' | 'Forest' | 'Industrial'
}

export interface DistrictProject {
  id: string
  code: string
  name: string
  piaAgency: string // NHAI, Railways, MSRDC, etc.
  sector: string
  tehsil: string
  districtsCovered: string
  currentStage: AcquisitionStage
  status: DistrictProjectStatus
  totalLandReqHectares: number
  acquiredHectares: number
  totalCompensationCr: number
  disbursedCompensationCr: number
  affectedVillagesCount: number
  affectedParcelsCount: number
  affectedFamiliesCount: number
  submittedDate: string
  slaDeadline: string
  slaDaysRemaining: number
  isDelayed: boolean
  assignedOfficer: string
  pendingActionRemark?: string
  documentsSubmitted: {
    name: string
    type: string
    status: 'Verified' | 'Pending Review' | 'Clarification Required'
    date: string
  }[]
}

export interface ScrutinyRequisition {
  id: string
  projectId: string
  projectCode: string
  projectName: string
  piaAgency: string
  requisitionDate: string
  landAreaHectares: number
  surveyorName: string
  documentsCount: number
  status: 'Under Review' | 'Clarification Sent' | 'Recommended for 3A' | 'Rejected'
  comments: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  targetProject: string
  details: string
}
