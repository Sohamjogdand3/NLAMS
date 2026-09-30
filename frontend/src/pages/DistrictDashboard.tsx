import { useState, useEffect, useCallback } from 'react'
import type { DistrictNavigationTab, DistrictProject, DistrictKpiMetric } from '../types/district'
import {
  MOCK_DISTRICT_KPIS,
  MOCK_DISTRICT_PROJECTS,
  MOCK_SCRUTINY_REQUISITIONS,
} from '../data/mockDistrictData'
import { proposalsApi, type Proposal } from '../services/api'
import { Loader2 } from 'lucide-react'

import DistrictSidebar from '../components/district/DistrictSidebar'
import DistrictHeader from '../components/district/DistrictHeader'
import DistrictOverview from '../components/district/DistrictOverview'
import DistrictProjectsTable from '../components/district/DistrictProjectsTable'
import DistrictPipelineTracker from '../components/district/DistrictPipelineTracker'
import DistrictGisMap from '../components/district/DistrictGisMap'
import DistrictScrutinyPanel from '../components/district/DistrictScrutinyPanel'
import DistrictSection11Freeze from '../components/district/DistrictSection11Freeze'
import DistrictValuationCalculator from '../components/district/DistrictValuationCalculator'
import DistrictClaimVerification from '../components/district/DistrictClaimVerification'
import DistrictCompensationRnR from '../components/district/DistrictCompensationRnR'
import DistrictAlertsAi from '../components/district/DistrictAlertsAi'
import DistrictReportsAudit from '../components/district/DistrictReportsAudit'
import LegalIntelligencePanel from '../components/rag/LegalIntelligencePanel'

import { X, FileText } from 'lucide-react'

function mapProposalToDistrictProject(p: Proposal): DistrictProject {
  const stageMap: Record<string, any> = {
    '1': 'Proposal',
    '2': 'Scrutiny',
    '3': 'Notification',
    '4': 'Award',
    '5': 'Compensation',
    '6': 'R&R',
    '7': 'Possession',
    'STAGE_1_REQUISITION': 'Proposal',
    'STAGE_2_ALIGNMENT_SCRUTINY': 'Scrutiny',
    'STAGE_3_SECTION11_NOTIFICATION': 'Notification',
    'STAGE_4_VALUATION_AWARD': 'Award',
    'STAGE_5_COMPENSATION_DISBURSEMENT': 'Compensation',
    'STAGE_6_RNR_REHABILITATION': 'R&R',
    'STAGE_7_POSSESSION_HANDOVER': 'Possession',
  }
  const currentStage = stageMap[String(p.current_stage)] || 'Notification'

  const idStr = String(p.id)
  const code = p.proposal_code || (idStr.startsWith('prop-') ? idStr.toUpperCase() : `PROP-${idStr.substring(0, 6).toUpperCase()}`)

  return {
    id: idStr,
    code,
    name: p.project_title || p.project_name || `Project ${code}`,
    piaAgency: p.requiring_agency || 'NHAI',
    sector: p.ministry || 'Highways & Infrastructure',
    tehsil: 'Haveli & Khed',
    districtsCovered: p.districts && p.districts.length > 0 ? p.districts.join(', ') : 'Pune, Maharashtra',
    currentStage,
    status: (p.status?.toLowerCase() || 'sec_3a_gazette') as any,
    totalLandReqHectares: p.total_area_hectares || p.required_area_ha || (p.total_area_sqm ? +(p.total_area_sqm / 10000).toFixed(2) : 245.8),
    acquiredHectares: Number(p.current_stage) >= 7 ? (p.total_area_hectares || p.required_area_ha || 245.8) : +(((p.total_area_hectares || p.required_area_ha || 245.8) * 0.45).toFixed(1)),
    totalCompensationCr: p.estimated_compensation_cr || (p.estimated_budget_inr ? +(p.estimated_budget_inr / 10000000).toFixed(2) : 580.0),
    disbursedCompensationCr: p.total_disbursed_inr ? +(p.total_disbursed_inr / 10000000).toFixed(2) : 120.0,
    affectedVillagesCount: 8,
    affectedParcelsCount: p.parcels_count || 142,
    affectedFamiliesCount: 86,
    submittedDate: p.created_at ? p.created_at.split('T')[0] : '2026-09-01',
    slaDeadline: '2026-12-31',
    slaDaysRemaining: 45,
    isDelayed: false,
    assignedOfficer: p.appointed_cala || 'Dr. Suhas Diwase (IAS) / LAO Haveli',
    pendingActionRemark: p.conflict_notes || p.comments || 'Requisition files verified against Mahabhulekh.',
    documentsSubmitted: [
      { name: p.dpr_file_url || `${code}_DPR.pdf`, type: 'DPR', status: 'Verified', date: '2026-09-10' },
      { name: p.gis_boundary_file_url || `${code}_Cadastral_Overlay.kml`, type: 'GIS_KML', status: 'Verified', date: '2026-09-12' },
      { name: `${code}_Section3a_Gazette.pdf`, type: 'Gazette', status: 'Verified', date: '2026-09-18' },
    ],
  }
}

function mapCustomProposalToDistrictProject(cp: any): DistrictProject {
  const stageMap: Record<string, any> = {
    'Submitted_To_State': 'Scrutiny',
    'CALA_Appointed': 'Scrutiny',
    'SIA_In_Progress': 'Notification',
    'Sec11_Published': 'Notification',
    'Valuation_Computed': 'Award',
    'Award_Pronounced': 'Award',
    'Disbursed': 'Compensation',
    'Handover_Complete': 'Possession',
  }
  const currentStage = stageMap[cp.status] || (cp.currentStage || 'Scrutiny')

  return {
    id: String(cp.id),
    code: cp.code || `PROP-${String(cp.id).toUpperCase()}`,
    name: cp.name || cp.project_title || 'Land Acquisition Project',
    piaAgency: cp.agency || cp.requiring_agency || 'NHAI',
    sector: cp.sector || 'Highways & Infrastructure',
    tehsil: cp.tehsil || 'Haveli & Khed',
    districtsCovered: `${cp.district || 'Pune'}, ${cp.state || 'Maharashtra'}`,
    currentStage,
    status: cp.status === 'CALA_Appointed' ? 'sec_3a_gazette' : (cp.status?.toLowerCase() || 'sec_3a_gazette') as any,
    totalLandReqHectares: cp.landRequiredHa || cp.total_area_hectares || 120.5,
    acquiredHectares: cp.status === 'Handover_Complete' ? (cp.landRequiredHa || 120.5) : +((cp.landRequiredHa || 120.5) * 0.3).toFixed(1),
    totalCompensationCr: cp.budgetCr || cp.estimated_compensation_cr || 350.0,
    disbursedCompensationCr: cp.disbursedCr || 0,
    affectedVillagesCount: cp.affectedVillagesCount || 6,
    affectedParcelsCount: cp.affectedParcelsCount || 98,
    affectedFamiliesCount: cp.affectedFamiliesCount || 64,
    submittedDate: cp.submittedDate || new Date().toISOString().split('T')[0],
    slaDeadline: '2026-12-31',
    slaDaysRemaining: 60,
    isDelayed: false,
    assignedOfficer: cp.appointedCalaOfficer || cp.assignedDistrictCollector || 'Dr. Suhas Diwase (IAS) / LAO Haveli',
    pendingActionRemark: cp.appointmentOrderNo ? `CALA Appointed via Sec 3(a) Order #${cp.appointmentOrderNo}` : 'Intake verified from State Nodal',
    documentsSubmitted: [
      { name: `${cp.code || 'PROP'}_Requisition.pdf`, type: 'DPR', status: 'Verified', date: new Date().toISOString().split('T')[0] },
      { name: `${cp.code || 'PROP'}_Alignment.kml`, type: 'GIS_KML', status: 'Verified', date: new Date().toISOString().split('T')[0] },
      { name: `${cp.code || 'PROP'}_Sec3a_Gazette.pdf`, type: 'Gazette', status: 'Verified', date: new Date().toISOString().split('T')[0] },
    ],
  }
}

export default function DistrictDashboard() {
  const [activeTab, setActiveTab] = useState<DistrictNavigationTab>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [projects, setProjects] = useState<DistrictProject[]>([])
  const [kpis, setKpis] = useState<DistrictKpiMetric[]>(MOCK_DISTRICT_KPIS)
  const [selectedProject, setSelectedProject] = useState<DistrictProject | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      let allMapped: DistrictProject[] = []
      try {
        const data = await proposalsApi.fetchProposals()
        if (Array.isArray(data) && data.length > 0) {
          allMapped = data.map(mapProposalToDistrictProject)
        }
      } catch (err) {
        console.warn('API fetch skipped in District dashboard:', err)
      }

      // Merge custom proposals appointed by State Nodal
      try {
        const customStr = localStorage.getItem('dharaa_custom_proposals')
        if (customStr) {
          const customProposals = JSON.parse(customStr)
          const customMapped = customProposals.map(mapCustomProposalToDistrictProject)
          const existingIds = new Set(allMapped.map((p) => String(p.id)))
          const newCustoms = customMapped.filter((p: DistrictProject) => !existingIds.has(String(p.id)))
          allMapped = [...newCustoms, ...allMapped]
        }
      } catch (e) {
        console.warn('Error reading custom proposals in District dashboard:', e)
      }

      if (allMapped.length === 0) {
        allMapped = MOCK_DISTRICT_PROJECTS
      }

      setProjects(allMapped)

      // Compute live KPIs
      const totalArea = allMapped.reduce((acc, p) => acc + p.totalLandReqHectares, 0)
      const totalAcquired = allMapped.reduce((acc, p) => acc + p.acquiredHectares, 0)
      const totalCompensation = allMapped.reduce((acc, p) => acc + p.totalCompensationCr, 0)

      setKpis([
        {
          id: 'kpi-1',
          title: 'Active District Acquisitions',
          value: `${allMapped.length}`,
          subtext: `${allMapped.filter((p) => p.currentStage === 'Notification').length} in Sec 11/3A Window`,
          trend: '+2 from last month',
          badgeColor: 'bg-blue-100 text-[#042A5E]',
        },
        {
          id: 'kpi-2',
          title: 'Total Land Required',
          value: `${totalArea.toFixed(1)} Ha`,
          subtext: `${totalAcquired.toFixed(1)} Ha Acquired (${((totalAcquired / (totalArea || 1)) * 100).toFixed(0)}%)`,
          trend: '+18.4 Ha this week',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
        {
          id: 'kpi-3',
          title: 'Sanctioned Compensation',
          value: `₹${totalCompensation.toFixed(0)} Cr`,
          subtext: 'PFMS Treasury Locked',
          trend: '100% Escrow Funded',
          badgeColor: 'bg-purple-100 text-purple-800',
        },
        {
          id: 'kpi-4',
          title: 'Section 11 Active Locks',
          value: `${allMapped.reduce((acc, p) => acc + p.affectedParcelsCount, 0)}`,
          subtext: 'Parcels in Mahabhulekh',
          trend: '0 Unauthorized Transfers',
          badgeColor: 'bg-amber-100 text-amber-800',
        },
      ])
    } catch (err) {
      console.warn('Using district project cache:', err)
      setProjects(MOCK_DISTRICT_PROJECTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const pendingScrutiniesCount = MOCK_SCRUTINY_REQUISITIONS.filter((r) => r.status === 'Under Review').length

  const handleUpdateProjectStage = (projectId: string, newStage: any, remark: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, currentStage: newStage, pendingActionRemark: remark }
          : p
      )
    )
  }

  const searchedProjects = projects.filter((p) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      p.code.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.piaAgency.toLowerCase().includes(term) ||
      p.tehsil.toLowerCase().includes(term)
    )
  })

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* District Revenue Sidebar */}
      <DistrictSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingScrutinyCount={pendingScrutiniesCount}
      />

      {/* Main Content Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* District Header Bar */}
        <DistrictHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pendingScrutinyCount={pendingScrutiniesCount}
          onNotificationClick={() => setActiveTab('scrutiny')}
        />

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="h-8 w-8 text-[#042A5E] animate-spin" />
              <span className="text-xs font-bold text-slate-600">Loading District Land Revenue Records...</span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DistrictOverview
                  kpis={kpis}
                  projects={searchedProjects}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

          {activeTab === 'projects' && (
            <DistrictProjectsTable
              projects={searchedProjects}
              onSelectProject={(p) => setSelectedProject(p)}
              onOpenScrutiny={(p) => {
                setSelectedProject(p)
                setActiveTab('scrutiny')
              }}
            />
          )}

          {activeTab === 'pipeline' && (
            <DistrictPipelineTracker
              projects={searchedProjects}
              onSelectProject={(p) => setSelectedProject(p)}
            />
          )}

          {activeTab === 'gis' && <DistrictGisMap />}

          {activeTab === 'scrutiny' && (
            <DistrictScrutinyPanel
              projects={searchedProjects}
              onUpdateProjectStatus={handleUpdateProjectStage}
            />
          )}

          {activeTab === 'section11' && <DistrictSection11Freeze />}

          {activeTab === 'valuation' && <DistrictValuationCalculator />}

          {activeTab === 'claims' && <DistrictClaimVerification />}

          {activeTab === 'compensation' && <DistrictCompensationRnR />}

          {activeTab === 'alerts' && <DistrictAlertsAi />}

          {activeTab === 'reports' && <DistrictReportsAudit />}

          {activeTab === 'legal_ai' && (
            <div className="h-[calc(100vh-140px)]">
              <LegalIntelligencePanel />
            </div>
          )}
        </>
      )}
    </main>
  </div>

      {/* Project Dossier Slide-Over Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between border-l border-slate-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-amber-400">
                    District Dossier: {selectedProject.code}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedProject.name}
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    PIA Agency: {selectedProject.piaAgency} · Sector: {selectedProject.sector}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-semibold text-[10px]">Statutory Stage</span>
                  <span className="font-extrabold text-[#042A5E] text-sm mt-0.5 block">{selectedProject.currentStage}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-semibold text-[10px]">Land Area Req</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{selectedProject.totalLandReqHectares} Ha</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block font-semibold text-[10px]">Acquired Area</span>
                  <span className="font-extrabold text-emerald-950 text-sm mt-0.5 block">{selectedProject.acquiredHectares} Ha</span>
                </div>
              </div>

              {/* Submitted Requisition Documents */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Submitted Verification Documents ({selectedProject.documentsSubmitted.length})
                </h3>
                <div className="space-y-2">
                  {selectedProject.documentsSubmitted.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#042A5E]" />
                        <div>
                          <span className="font-bold text-slate-900 block">{doc.name}</span>
                          <span className="text-[10px] text-slate-500">Submitted: {doc.date}</span>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Remark */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                <span className="font-bold text-[#042A5E] block">Assigned LAO Remark:</span>
                <p className="text-blue-900 font-medium">{selectedProject.pendingActionRemark || 'None'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="w-full rounded-xl bg-[#042A5E] py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 transition-colors"
            >
              Close Project Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
