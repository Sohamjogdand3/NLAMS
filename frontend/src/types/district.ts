export type DistrictNavigationTab =
  | 'dashboard'
  | 'projects'
  | 'pipeline'
  | 'gis'
  | 'scrutiny'
  | 'section11'
  | 'valuation'
  | 'claims'
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

export interface RfctlarrValuationItem {
  id: string
  projectCode: string
  khasraNo: string
  village: string
  ownerName: string
  landCategory: 'Agricultural' | 'Non-Agricultural' | 'Commercial' | 'Industrial'
  acquiredAreaSqM: number
  circleRatePerSqM: number
  subRegistrarAvgRatePerSqM: number
  chosenBaselineRatePerSqM: number
  baselineLandValue: number
  regionalMultiplier: number // 1.0 to 2.0
  multipliedLandValue: number
  solatium100Percent: number
  additionalInterest12Percent: number // 12% p.a.
  structuresValuation: number
  treesValuation: number
  totalCalculatedAward: number
  status: 'Draft' | 'Computed' | 'CALA_Approved' | 'Disbursed'
}

export interface Section11NoticeEntry {
  id: string
  projectCode: string
  projectName: string
  gazetteNotificationNo: string
  publicationDate: string
  expiryDate: string
  totalDays: number
  daysRemaining: number
  stateRegistryLockStatus: 'Active' | 'Pending' | 'Unlocked'
  affectedKhasrasCount: number
  totalObjectionsReceived: number
  objectionsResolved: number
  hearingSchedule: string
  objections: {
    id: string
    khatedarName: string
    khasraNo: string
    objectionType: 'Boundary Mismatch' | 'Title Ownership Dispute' | 'Compensation Rate' | 'Tree/Structure Enumeration'
    submissionDate: string
    status: 'Hearing Scheduled' | 'Disposed / Overruled' | 'Remand for Re-survey'
    hearingDate: string
    officerRemarks: string
  }[]
}

export interface LandownerClaimVerificationItem {
  id: string
  claimNumber: string
  projectCode: string
  khasraNo: string
  village: string
  claimantName: string
  aadhaarNumberMasked: string
  aadhaarKycVerified: boolean
  bankAccountNumberMasked: string
  bankIfsc: string
  claimedAreaSqM: number
  cadastralAreaSqM: number
  areaDiscrepancySqM: number
  titleDeedDocUrl: string
  extract712DocUrl: string
  bankPassbookDocUrl: string
  cadastralMapDocUrl: string
  jmsSurveyReportUrl: string
  calculatedAwardAmount: number
  status: 'Pending_Verification' | 'Approved_For_Escrow' | 'Clarification_Required' | 'Disputed'
  officerRemarks?: string
}
