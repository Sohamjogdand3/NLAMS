export type UserType = 'citizen' | 'department'

export type DepartmentRole =
  | 'lao' // Land Acquisition Officer
  | 'collector' // District Collector
  | 'surveyor' // Survey / GIS Officer
  | 'agency' // Acquiring Agency / NHAI / Railways
  | 'admin' // System Administrator
  | 'central_admin' // Central / National Government Authority

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
  name: string
  role: DepartmentRole | 'citizen'
  departmentName?: string
  description: string
}

export const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  // Citizen account
  'citizen123': {
    username: 'citizen123',
    name: 'Rajesh Kumar',
    role: 'citizen',
    description: 'Landowner / Citizen',
  },
  // Department accounts
  'central_admin': {
    username: 'central_admin',
    name: 'Dr. Rameshwar Rao (IAS)',
    role: 'central_admin',
    departmentName: 'Department of Land Resources (DoLR) / NITI Aayog',
    description: 'National Central Monitoring Authority',
  },
  'lao_officer': {
    username: 'lao_officer',
    name: 'Anil Deshmukh (LAO)',
    role: 'lao',
    departmentName: 'Revenue & Land Reforms Dept',
    description: 'Land Acquisition Officer',
  },
  'surveyor_01': {
    username: 'surveyor_01',
    name: 'Priya Sharma',
    role: 'surveyor',
    departmentName: 'State Survey & Cadastral Dept',
    description: 'Field Surveyor & GIS Analyst',
  },
  'collector_district': {
    username: 'collector_district',
    name: 'Sanjay Mehta (IAS)',
    role: 'collector',
    departmentName: 'District Administration',
    description: 'District Collector & Magistrate',
  },
  'nhai_agency': {
    username: 'nhai_agency',
    name: 'Vikram Singh',
    role: 'agency',
    departmentName: 'National Highways Authority of India (NHAI)',
    description: 'Acquiring Agency Representative',
  },
  'admin_system': {
    username: 'admin_system',
    name: 'System Admin',
    role: 'admin',
    departmentName: 'Department of Land Resources (DoLR)',
    description: 'Platform Administrator',
  },
}
