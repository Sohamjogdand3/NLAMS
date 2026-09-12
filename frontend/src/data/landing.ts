import type { Pillar, RoleCard, StatItem, WorkflowStage, InfoCard } from '../types/landing'

export const workflowStages: WorkflowStage[] = [
  {
    id: 'identification',
    label: 'Identification',
    description: 'Land parcels required for the public project are identified and mapped using GIS.',
  },
  {
    id: 'notification',
    label: 'Notification',
    description: 'Formal notifications under Section 11 are published and served to landholders.',
  },
  {
    id: 'objections',
    label: 'Objections',
    description: 'Affected persons and stakeholders may submit objections within the statutory window.',
  },
  {
    id: 'compensation',
    label: 'Compensation',
    description: 'Fair compensation is computed per market value plus solatium and disbursed to landholders.',
  },
  {
    id: 'rr',
    label: 'R&R',
    description: 'Rehabilitation & resettlement entitlements are tracked and delivered to affected families.',
  },
  {
    id: 'possession',
    label: 'Possession',
    description: 'Physical possession of acquired land is recorded and handed over to the project agency.',
  },
]

export const infoCards: InfoCard[] = [
  {
    id: 'land-acquisition',
    icon: 'landmark',
    title: 'Land Acquisition',
    description: 'Meaning and purpose of acquiring land for public projects.',
  },
  {
    id: 'process',
    icon: 'workflow',
    title: 'Land Acquisition Process',
    description: 'Identification → Notification → Objections → Compensation → R&R → Possession.',
  },
  {
    id: 'compensation',
    icon: 'banknote',
    title: 'Compensation',
    description: 'Information about compensation and eligible benefits.',
  },
  {
    id: 'rr',
    icon: 'home',
    title: 'Rehabilitation & Resettlement',
    description: 'Support and entitlements for affected families.',
  },
  {
    id: 'rights',
    icon: 'shield',
    title: 'Citizen Rights',
    description: 'Transparency, objections, information access, and fair compensation.',
  },
  {
    id: 'acts',
    icon: 'scroll',
    title: 'Acts & Rules',
    description: 'RFCTLARR Act, 2013 and related rules.',
  },
  {
    id: 'notices',
    icon: 'bell',
    title: 'Latest Notices',
    description: 'Acquisition notifications and public notices.',
  },
  {
    id: 'services',
    icon: 'headset',
    title: 'Citizen Services',
    description: 'Track case, compensation, R&R and grievances.',
  },
  {
    id: 'gis',
    icon: 'map',
    title: 'Land Records & GIS',
    description: 'View land-related information and acquisition areas.',
  },
  {
    id: 'faqs',
    icon: 'help',
    title: 'FAQs',
    description: 'Common questions about land acquisition.',
  },
]

export const stats: StatItem[] = [
  { value: '28', label: 'States & UTs onboarded' },
  { value: '412', label: 'Active projects tracked' },
  { value: '86,000+', label: 'Parcels under management' },
  { value: '9', label: 'Role-based workspaces' },
]

export const roles: RoleCard[] = [
  {
    id: 'citizen',
    title: 'Citizen',
    description: 'Track your land, follow your case, and receive compensation.',
    journey: 'View land record → track case status → submit objection → receive payment',
  },
  {
    id: 'surveyor',
    title: 'Surveyor',
    description: 'Capture ground-truth boundaries and flag mismatches for review.',
    journey: 'Accept task → capture GPS boundary → flag encroachment → submit report',
  },
  {
    id: 'lao',
    title: 'Land Acquisition Officer',
    description: 'Run the statutory acquisition process end to end for assigned projects.',
    journey: 'Issue notices → conduct hearings → record objections → prepare award',
  },
  {
    id: 'collector',
    title: 'District Collector',
    description: 'Approve awards and possession orders across the district.',
    journey: 'Review award → approve possession → monitor district projects → handle escalation',
  },
  {
    id: 'agency',
    title: 'Project Agency',
    description: 'Request land for public infrastructure and track it through to handover.',
    journey: 'Submit requirement → track progress → deposit funds → receive possession',
  },
  {
    id: 'admin',
    title: 'State & Central Admin',
    description: 'Oversee policy, users, and integrations across jurisdictions.',
    journey: 'Manage users → configure policy → generate MIS reports → audit at scale',
  },
]

export const pillars: Pillar[] = [
  {
    id: 'gis',
    title: 'GIS-enabled',
    description: 'Every parcel is a real boundary on a map, not a row in a spreadsheet.',
  },
  {
    id: 'workflow',
    title: 'Workflow-driven',
    description: 'Every case shows its stage, what is pending, and who owns the next action.',
  },
  {
    id: 'transparent',
    title: 'Transparent',
    description: 'Landholders and agencies see the same status officers work from.',
  },
  {
    id: 'decision-support',
    title: 'Decision support, not decision-making',
    description: 'AI flags delay risk for officers to act on — statutory authority stays with them.',
  },
]
