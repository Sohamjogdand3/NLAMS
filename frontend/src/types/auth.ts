export type UserType = 'citizen' | 'department' | 'pia'

export type DepartmentRole =
  | 'lao' // Land Acquisition Officer
  | 'collector' // District Collector
  | 'dist_collector' // District Collector
  | 'tehsildar' // Taluka Executive Magistrate
  | 'talathi' // Village Revenue Officer
  | 'surveyor' // Survey / GIS Officer
  | 'agency' // Acquiring Agency / NHAI / Railways
  | 'pia' // Project Implementing Agency
  | 'state_admin' // State Revenue Admin (Maharashtra)
  | 'central_admin' // Central / National Government Authority
  | 'rnr_admin' // Rehabilitation & Resettlement Administrator
  | 'admin' // System Administrator

export interface UserSession {
  id: string
  name: string
  email: string
  userType: UserType
  role: DepartmentRole | 'citizen'
  departmentName?: string
  token: string
}

export interface MockAccount {
  username: string
  email?: string
  name: string
  role: DepartmentRole | 'citizen'
  departmentName?: string
  description: string
}

export const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  // Central Admin
  'central_admin': {
    username: 'central.admin@nlams.gov.demo',
    email: 'central.admin@nlams.gov.demo',
    name: 'Central Platform Administrator',
    role: 'central_admin',
    departmentName: 'Department of Land Resources (DoLR), MoRD',
    description: 'National Central Monitoring Authority',
  },
  // Maharashtra State Admin
  'state_admin': {
    username: 'state.maharashtra@nlams.gov.demo',
    email: 'state.maharashtra@nlams.gov.demo',
    name: 'Maharashtra State Revenue Secretary',
    role: 'state_admin',
    departmentName: 'Revenue & Forest Department, Govt of Maharashtra',
    description: 'State Head of Land Revenue',
  },
  // District Collector (Pune)
  'collector_district': {
    username: 'collector.pune@nlams.gov.demo',
    email: 'collector.pune@nlams.gov.demo',
    name: 'District Collector (Pune)',
    role: 'dist_collector',
    departmentName: 'Office of District Collector, Pune',
    description: 'District Collector & Magistrate',
  },
  // LAO Officer (Pune)
  'lao_officer': {
    username: 'lao.pune@nlams.gov.demo',
    email: 'lao.pune@nlams.gov.demo',
    name: 'LAO Officer (Pune)',
    role: 'lao',
    departmentName: 'Special Land Acquisition Office, Pune',
    description: 'Land Acquisition Officer',
  },
  // R&R Administrator (Social Welfare & Rehabilitation)
  'rnr_officer': {
    username: 'rnr.officer.pune@nlams.gov.demo',
    email: 'rnr.officer.pune@nlams.gov.demo',
    name: 'Dr. Sunita Jagtap (R&R Administrator)',
    role: 'rnr_admin',
    departmentName: 'Rehabilitation & Resettlement Authority, Pune',
    description: 'R&R Administrator & Social Impact Assessor',
  },
  // Field Surveyor / Talathi
  'surveyor_pune': {
    username: 'surveyor.pune@nlams.gov.demo',
    email: 'surveyor.pune@nlams.gov.demo',
    name: 'Ramesh Kadam (Cadastral Surveyor / Talathi)',
    role: 'surveyor',
    departmentName: 'District Land Records & Cadastral Survey Division',
    description: 'Field Surveyor & Cadastral Mapping Officer',
  },
  // Tehsildar (Haveli, Pune)
  'tehsildar_haveli': {
    username: 'tehsildar.haveli.pune@nlams.gov.demo',
    email: 'tehsildar.haveli.pune@nlams.gov.demo',
    name: 'Tehsildar (Haveli, Pune)',
    role: 'tehsildar',
    departmentName: 'Tehsil Revenue Office, Haveli (Pune)',
    description: 'Taluka Executive Magistrate',
  },
  // Talathi (Haveli, Pune)
  'talathi_haveli': {
    username: 'talathi.haveli.pune@nlams.gov.demo',
    email: 'talathi.haveli.pune@nlams.gov.demo',
    name: 'Talathi Officer (Haveli, Pune)',
    role: 'talathi',
    departmentName: 'Talathi Saza, Haveli (Pune)',
    description: 'Village Land Records & 7/12 Officer',
  },
  // PIA Agency (NHAI)
  'nhai_agency': {
    username: 'officer.nhai@nlams.gov.demo',
    email: 'officer.nhai@nlams.gov.demo',
    name: 'NHAI Project Director',
    role: 'pia',
    departmentName: 'National Highways Authority of India (NHAI)',
    description: 'Project Implementing Agency',
  },
  // PIA Agency (MMRDA)
  'mmrda_agency': {
    username: 'officer.mmrda@nlams.gov.demo',
    email: 'officer.mmrda@nlams.gov.demo',
    name: 'MMRDA Land Officer',
    role: 'pia',
    departmentName: 'Mumbai Metropolitan Region Development Authority',
    description: 'Urban Transit & Infrastructure Agency',
  },
  // Citizen
  'citizen123': {
    username: 'citizen@example.com',
    email: 'citizen@example.com',
    name: 'Rajesh Patil (Landowner)',
    role: 'citizen',
    description: 'Landowner / Citizen Portal Access',
  },
}
