export type CaseStage = 'notified' | 'surveyed' | 'hearing' | 'award' | 'possession' | 'paid'

export interface StepperStep {
  id: CaseStage
  label: string
  subtitle: string
  status: 'completed' | 'current' | 'upcoming'
  date?: string
  officer?: string
  refDoc?: string
}

export interface LandRecord {
  ulpin: string
  surveyNo: string
  subDivision: string
  village: string
  taluka: string
  district: string
  state: string
  totalAreaHa: number
  totalAreaAcres: number
  acquiredAreaHa: number
  rightsType: string
  landCategory: string
  irrigationStatus: string
  marketValuePerHa: number
  jointOwnersCount: number
  extract712Status: 'Verified' | 'Pending' | 'Action Needed'
  extract8AStatus: 'Verified' | 'Pending' | 'Action Needed'
  coOrdinates: { lat: number; lng: number }
}

export interface DocumentItem {
  id: string
  title: string
  category: 'Land Ownership' | 'Identity' | 'Bank Details' | 'Objection Proof'
  fileName?: string
  fileSize?: string
  uploadedDate?: string
  status: 'Verified' | 'Under Review' | 'Required' | 'Rejected'
  remarks?: string
}

export interface NoticeItem {
  id: string
  noticeNo: string
  title: string
  section: string
  issueDate: string
  lastDateToAct?: string
  issuedBy: string
  fileSize: string
  type: 'Section 11' | 'Section 15' | 'Section 19' | 'Award Copy' | 'Possession Order'
  isNew?: boolean
}

export interface ObjectionItem {
  id: string
  trackingNo: string
  dateSubmitted: string
  type: 'Land Area Discrepancy' | 'Ownership Claim' | 'Valuation & Compensation' | 'Structure/Trees' | 'R&R Support'
  description: string
  status: 'Received' | 'Under Hearing' | 'Resolved' | 'Rejected'
  assignedOfficer: string
  nextHearingDate?: string
  hearingVenue?: string
  responseSummary?: string
  attachedFilesCount: number
}

export interface PaymentTranche {
  trancheNo: number
  title: string
  amount: number
  percentage: number
  status: 'DISBURSED' | 'PENDING_APPROVAL' | 'SCHEDULED'
  disbursementDate?: string
  transactionId?: string
  bankRef?: string
}

export interface CompensationSummary {
  caseNo: string
  projectName: string
  acquiringAgency: string
  totalAcquiredAreaHa: number
  baseLandValuation: number
  solatium100Percent: number
  additionalInterest: number
  rehabilitationAllowance: number
  totalAwardAmount: number
  disbursedAmount: number
  pendingAmount: number
  bankName: string
  accountNoMasked: string
  ifscCode: string
  dbtStatus: 'ACTIVE' | 'PENDING_VERIFICATION' | 'FAILED'
  tranches: PaymentTranche[]
}
