import type {
  LandRecord,
  StepperStep,
  DocumentItem,
  NoticeItem,
  ObjectionItem,
  CompensationSummary,
} from '../types/citizen'

export const MOCK_CITIZEN_LAND_RECORD: LandRecord = {
  ulpin: 'MH-PUN-KHD-1422A-9812',
  surveyNo: '142',
  subDivision: '2A/1',
  village: 'Khed Shivapur',
  taluka: 'Haveli',
  district: 'Pune',
  state: 'Maharashtra',
  totalAreaHa: 1.85,
  totalAreaAcres: 4.57,
  acquiredAreaHa: 0.65,
  rightsType: 'Occupant Class-1 (Aakar Padat)',
  landCategory: 'Perennial Irrigated Agricultural',
  irrigationStatus: 'Well + Canal Source',
  marketValuePerHa: 6500000,
  jointOwnersCount: 2,
  extract712Status: 'Verified',
  extract8AStatus: 'Verified',
  coOrdinates: { lat: 18.3512, lng: 73.8541 },
}

export const MOCK_ACQUISITION_CASE = {
  caseId: 'LAO-PUN-2025-0894',
  projectName: 'Pune - Nashik Industrial Expressway Alignment (Phase II)',
  acquiringAgency: 'Maharashtra State Road Development Corporation (MSRDC)',
  laoOfficerName: 'Shri. S. V. Kulkarni (LAO Pune Division)',
  laoOfficeAddress: 'Collectorate Office, Building B, 3rd Floor, Pune - 411001',
  contactEmail: 'lao.pune.exp@maharashtra.gov.in',
  contactPhone: '+91 20 2612 4490',
  currentStage: 'award' as const,
  lastUpdated: '14 Feb 2026',
}

export const MOCK_STEPPER_STEPS: StepperStep[] = [
  {
    id: 'notified',
    label: '1. Notified',
    subtitle: 'Sec 11 Preliminary Notification Published',
    status: 'completed',
    date: '10 Oct 2025',
    officer: 'Revenue Dept Govt of Maharashtra',
    refDoc: 'Gazette Notice No. LAO/PUN/2025/11-A',
  },
  {
    id: 'surveyed',
    label: '2. Surveyed',
    subtitle: 'Joint Measurement Survey (JMS) & GPS Mapping',
    status: 'completed',
    date: '28 Nov 2025',
    officer: 'Cadastral Surveyor P. M. Jadhav',
    refDoc: 'JMS Map Sheet No. 44/Khed',
  },
  {
    id: 'hearing',
    label: '3. Hearing',
    subtitle: 'Section 15 Objections & Claims Hearing',
    status: 'completed',
    date: '15 Jan 2026',
    officer: 'Tehsildar Haveli & LAO Officer',
    refDoc: 'Hearing Proceeding Minutes #84',
  },
  {
    id: 'award',
    label: '4. Award',
    subtitle: 'Section 23 Compensation Award Determination',
    status: 'current',
    date: '10 Feb 2026',
    officer: 'District Collector & LAO Pune',
    refDoc: 'Award Summary Order #LAO/PUN/894/AWARD',
  },
  {
    id: 'possession',
    label: '5. Possession',
    subtitle: 'Section 38 Notice & Physical Land Handover',
    status: 'upcoming',
    date: 'Expected Mar 2026',
    officer: 'Talathi & Circle Officer',
  },
  {
    id: 'paid',
    label: '6. Paid',
    subtitle: 'Direct Benefit Transfer (DBT) to Bank Account',
    status: 'upcoming',
    date: 'Expected Mar 2026',
    officer: 'State Treasury & Bank Payment Gateway',
  },
]

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: '7/12 Adhikar Patrak (Land Extract)',
    category: 'Land Ownership',
    fileName: '7-12_Extract_Survey_142-2A.pdf',
    fileSize: '1.4 MB',
    uploadedDate: '05 Nov 2025',
    status: 'Verified',
    remarks: 'Digitally signed e-Record verified via DILRMP API',
  },
  {
    id: 'doc-2',
    title: 'Form 8A Khataut (Holding Record)',
    category: 'Land Ownership',
    fileName: 'Khata_8A_Rajesh_Kumar.pdf',
    fileSize: '980 KB',
    uploadedDate: '05 Nov 2025',
    status: 'Verified',
    remarks: 'Khata No. 894 matched with Mahabhulekh',
  },
  {
    id: 'doc-3',
    title: 'Aadhaar Card & KYC Document',
    category: 'Identity',
    fileName: 'Aadhaar_Masked_RajeshKumar.pdf',
    fileSize: '450 KB',
    uploadedDate: '06 Nov 2025',
    status: 'Verified',
    remarks: 'UIDAI e-KYC verified',
  },
  {
    id: 'doc-4',
    title: 'Bank Passbook & Cancelled Cheque',
    category: 'Bank Details',
    fileName: 'SBI_Passbook_FrontPage.pdf',
    fileSize: '1.1 MB',
    uploadedDate: '12 Jan 2026',
    status: 'Verified',
    remarks: 'NPCI Aadhaar-seeded account active',
  },
  {
    id: 'doc-5',
    title: 'Fruit Tree & Well Valuation Certificate',
    category: 'Objection Proof',
    fileName: 'Horticulture_Survey_Report.pdf',
    fileSize: '2.8 MB',
    uploadedDate: '18 Jan 2026',
    status: 'Under Review',
    remarks: 'Submitted for revision of Mango tree count valuation',
  },
]

export const MOCK_NOTICES: NoticeItem[] = [
  {
    id: 'not-101',
    noticeNo: 'NLAMS/NOTICE/2026/AW-894',
    title: 'Final Compensation Award Notice under Section 23',
    section: 'Section 23, RFCTLARR Act 2013',
    issueDate: '10 Feb 2026',
    lastDateToAct: '25 Feb 2026',
    issuedBy: 'Office of District Collector, Pune',
    fileSize: '2.4 MB',
    type: 'Award Copy',
    isNew: true,
  },
  {
    id: 'not-102',
    noticeNo: 'NLAMS/NOTICE/2026/HR-412',
    title: 'Notice for Submission of Bank Account Details for DBT Disbursement',
    section: 'Section 37, RFCTLARR Act 2013',
    issueDate: '01 Feb 2026',
    lastDateToAct: '20 Feb 2026',
    issuedBy: 'Land Acquisition Officer, Pune Expressway Project',
    fileSize: '1.1 MB',
    type: 'Section 19',
    isNew: true,
  },
  {
    id: 'not-103',
    noticeNo: 'NLAMS/NOTICE/2025/SEC15-88',
    title: 'Hearing of Objections Notice under Section 15(2)',
    section: 'Section 15(2)',
    issueDate: '20 Dec 2025',
    issuedBy: 'Tehsildar Office Haveli',
    fileSize: '1.8 MB',
    type: 'Section 15',
    isNew: false,
  },
  {
    id: 'not-104',
    noticeNo: 'NLAMS/NOTICE/2025/PRE-11',
    title: 'Preliminary Notification of Land Acquisition for MSRDC Expressway',
    section: 'Section 11(1)',
    issueDate: '10 Oct 2025',
    issuedBy: 'Revenue & Forests Dept, Govt of Maharashtra',
    fileSize: '3.2 MB',
    type: 'Section 11',
    isNew: false,
  },
]

export const MOCK_OBJECTIONS: ObjectionItem[] = [
  {
    id: 'obj-501',
    trackingNo: 'OBJ-2026-PUN-8841',
    dateSubmitted: '18 Jan 2026',
    type: 'Valuation & Compensation',
    description:
      'Re-evaluation requested for 18 mature Alphonso Mango trees and RCC Borewell pump house situated on acquired parcel Survey 142/2A.',
    status: 'Under Hearing',
    assignedOfficer: 'Shri. A. K. Patil (Horticulture Evaluator & LAO Assistant)',
    nextHearingDate: '22 Feb 2026',
    hearingVenue: 'Sub-Divisional Office, Haveli, Swargate, Pune',
    responseSummary:
      'Joint field inspection scheduled with District Horticulture Officer on 22 Feb 2026 to verify tree count & age.',
    attachedFilesCount: 2,
  },
  {
    id: 'obj-502',
    trackingNo: 'OBJ-2025-PUN-3120',
    dateSubmitted: '02 Nov 2025',
    type: 'Land Area Discrepancy',
    description:
      'Initial notification showed 0.72 Ha acquired, whereas actual roadway corridor survey requires only 0.65 Ha.',
    status: 'Resolved',
    assignedOfficer: 'P. M. Jadhav (Cadastral Surveyor)',
    responseSummary:
      'Objection accepted. Joint Measurement Survey corrected the acquired area to exactly 0.65 Ha. Revised map issued.',
    attachedFilesCount: 1,
  },
]

export const MOCK_COMPENSATION: CompensationSummary = {
  caseNo: 'LAO-PUN-2025-0894',
  projectName: 'Pune - Nashik Industrial Expressway Alignment (Phase II)',
  acquiringAgency: 'Maharashtra State Road Development Corporation (MSRDC)',
  totalAcquiredAreaHa: 0.65,
  baseLandValuation: 4225000, // 0.65 Ha @ 65L/Ha
  solatium100Percent: 4225000, // 100% Solatium as per RFCTLARR 2013
  additionalInterest: 380250, // 12% per annum from Sec 11 notification date
  rehabilitationAllowance: 500000, // One-time R&R assistance allowance
  totalAwardAmount: 9330250, // ₹ 93,30,250
  disbursedAmount: 4665125, // 50% initial tranche disbursed
  pendingAmount: 4665125, // 50% remaining post possession
  bankName: 'State Bank of India (SBI)',
  accountNoMasked: '•••• •••• 5829',
  ifscCode: 'SBIN0001234',
  dbtStatus: 'ACTIVE',
  tranches: [
    {
      trancheNo: 1,
      title: 'Tranche 1: Initial 50% Land & Solatium Payment',
      amount: 4665125,
      percentage: 50,
      status: 'DISBURSED',
      disbursementDate: '12 Feb 2026',
      transactionId: 'DBT/PUN/2026/99812401',
      bankRef: 'UTR-SBI20260212009812',
    },
    {
      trancheNo: 2,
      title: 'Tranche 2: Final 50% Balance Payment post Land Handover',
      amount: 4665125,
      percentage: 50,
      status: 'PENDING_APPROVAL',
    },
  ],
}
