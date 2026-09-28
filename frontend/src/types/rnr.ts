export type RnRNavigationTab =
  | 'overview'
  | 'census'
  | 'entitlements'
  | 'community-assets'
  | 'sia-clearance'
  | 'disbursals'

export interface AffectedFamilyRecord {
  id: string
  familyHeadName: string
  contactNumber: string
  village: string
  tehsil: string
  district: string
  aadhaarMasked: string
  occupancyType: 'Agricultural Laborer' | 'Tenant Farmer' | 'Sharecropper' | 'Artisan / Small Trader' | 'Titleholder Displaced'
  vulnerabilityFlag: 'SC/ST Category' | 'BPL (Below Poverty Line)' | 'Women-Headed Household' | 'Elderly / Disabled' | 'General'
  familyMembersCount: number
  primaryLivelihood: string
  eligibleEntitlements: {
    housingUnitAllocated: boolean
    housingSiteLocation?: string
    subsistenceGrantAmount: number // ₹ per month for 1 year (e.g. ₹3,000/mo)
    resettlementAllowanceOneTime: number // e.g. ₹50,000
    cattleShedGrant: number // e.g. ₹25,000
    jobTrainingOpted: boolean
  }
  biometricEkycVerified: boolean
  claimStatus: 'Census Enrolled' | 'Entitlement Approved' | 'Package Disbursed' | 'Grievance Under Review'
  assignedOfficer: string
  lastUpdated: string
}

export interface CommunityAssetRecord {
  id: string
  assetName: string
  village: string
  district: string
  assetType: 'Temple / Religious Site' | 'Gauchar (Grazing Land)' | 'Public Drinking Well' | 'Anganwadi / School' | 'Cremation / Burial Ground'
  extentAreaSqm: number
  reconstructionPlan: 'Relocation & Reconstruction' | 'Cash Escrow Disbursal to Gram Panchayat' | 'Alternate Government Land Allotment'
  estimatedCostCr: number
  gramPanchayatConsentSigned: boolean
  workStatus: 'Pending Tender' | 'Site Handed Over' | 'Under Construction' | 'Commissioned'
}

export interface SiaReviewItem {
  id: string
  projectCode: string
  projectName: string
  requiringAgency: string
  siaAgencyName: string
  affectedFamiliesCount: number
  displacedFamiliesCount: number
  publicHearingCompletedDate: string
  expertCommitteeRecommendation: 'Approved Without Modifications' | 'Conditional Approval (Mitigation Mandated)' | 'Rejection Recommended'
  mitigationConditionsSummary: string
  section7ClearanceStatus: 'Clearance Issued' | 'Review In Progress' | 'Awaiting Gram Sabha Resolution'
  reportDocUrl: string
}
