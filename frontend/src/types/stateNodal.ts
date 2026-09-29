export type StateNavigationTab =
  | 'overview'
  | 'gis'
  | 'proposals'
  | 'cala-appointments'
  | 'multiplier-audit'
  | 'land-registry-api'
  | 'reports'

export interface StateProposalItem {
  id: string
  projectCode: string
  projectName: string
  requiringAgency: string // NHAI, Railways, MoRTH, NTPC
  submissionDate: string
  stateJurisdiction: string // Maharashtra
  targetDistricts: string[]
  totalLandReqHectares: number
  estimatedCompensationCr: number
  structuralConflictStatus: 'Clear' | 'Forest Land Detected' | 'State Highway Overlap'
  status: 'Pending_State_Intake' | 'CALA_Appointed' | 'Clarification_Issued' | 'Rejected'
  assignedDistrictCollector?: string
  appointedCalaOfficer?: string
  appointmentOrderNo?: string
  appointmentDate?: string
  dprFileUrl: string
  gisBoundaryFileUrl: string
  comments?: string
}

export interface MultiplierComplianceRecord {
  id: string
  districtName: string
  tehsilName: string
  zoneType: 'Urban' | 'Semi-Urban (0-10km)' | 'Rural (10-20km)' | 'Deep Rural (>20km)'
  statutoryDistanceKm: number
  mandatedMultiplierFactor: number
  actualAppliedMultiplier: number
  complianceStatus: 'Compliant' | 'Under-Assessed Risk' | 'Over-Assessed Audit'
  lastAuditedDate: string
  auditingOfficer: string
}

export interface LandRegistryApiGatewayStatus {
  gatewayId: string
  name: string
  coverage: string
  totalRecordsIndexed: number
  realtimePingMs: number
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  lastSyncTimestamp: string
  activeLocksCount: number
}
