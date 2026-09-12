export type NavigationTab =
  | 'dashboard'
  | 'projects'
  | 'states'
  | 'gismap'
  | 'workflow'
  | 'risk'
  | 'analytics'
  | 'reports'
  | 'notifications'

export type ProjectRiskLevel = 'critical' | 'high' | 'moderate' | 'low'

export type StatutorySection =
  | 'Sec 4(1) Notification'
  | 'Sec 8 SIA Study'
  | 'Sec 11 Preliminary'
  | 'Sec 15 Objections'
  | 'Sec 19 Final Declaration'
  | 'Sec 23 Award Determination'
  | 'Sec 38 Possession'

export interface CentralKpiMetric {
  id: string
  title: string
  value: string
  subtext: string
  trend: string
  trendType: 'positive' | 'negative' | 'neutral'
  badgeColor?: string
}

export interface StateAcquisitionProgress {
  stateCode: string
  stateName: string
  activeProjects: number
  totalTargetHectares: number
  acquiredHectares: number
  completionPercentage: number
  compensationAllocatedCr: number
  compensationDisbursedCr: number
  pendingSlaBreaches: number
  riskLevel: ProjectRiskLevel
  coordinates: { x: number; y: number } // For SVG map plotting
}

export interface CriticalProject {
  id: string
  projectCode: string
  projectName: string
  acquiringAgency: 'NHAI' | 'MoRTH' | 'Indian Railways' | 'NHSRCL (Bullet Train)' | 'NICDC'
  state: string
  district: string
  currentStage: StatutorySection
  targetCompletionDate: string
  delayDays: number
  riskLevel: ProjectRiskLevel
  slaBreached: boolean
  totalLandAreaHa: number
  compensationBudgetCr: number
  primaryBottleneck: string
}

export interface SlaAlert {
  id: string
  projectCode: string
  projectName: string
  state: string
  district: string
  sectionName: StatutorySection
  daysOverdue: number
  severity: 'critical' | 'warning'
  assignedAuthority: string
  dateFlagged: string
  description: string
}

export interface AiRiskInsight {
  id: string
  corridorName: string
  projectCount: number
  predictedDelayDays: number
  confidencePercentage: number
  riskCategory: 'Litigation Bottleneck' | 'Compensation Disparity' | 'Cadastral Mismatch' | 'Forest Clearance'
  impactSummary: string
  recommendedIntervention: string
  affectedState: string
}

export interface SectorBreakdown {
  sector: string
  projectCount: number
  allocatedBudgetCr: number
  acquiredPercentage: number
}
