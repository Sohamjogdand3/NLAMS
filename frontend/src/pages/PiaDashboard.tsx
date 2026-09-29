import { useState, useEffect } from 'react'
import type {
  PiaNavigationTab,
  PiaProject,
  PiaDocument,
  PiaClarificationAlert,
  PiaKpiMetrics,
  InfrastructureSector,
} from '../types/pia'
import { proposalsApi, type Proposal } from '../services/api'

import PiaSidebar from '../components/pia/PiaSidebar'
import PiaHeader from '../components/pia/PiaHeader'
import PiaOverview from '../components/pia/PiaOverview'
import PiaProjectsTable from '../components/pia/PiaProjectsTable'
import PiaProjectDossierModal from '../components/pia/PiaProjectDossierModal'
import PiaCreateProposalModal from '../components/pia/PiaCreateProposalModal'
import PiaAcquisitionProgress from '../components/pia/PiaAcquisitionProgress'
import PiaDocumentsRepo from '../components/pia/PiaDocumentsRepo'
import PiaAlertsTasks from '../components/pia/PiaAlertsTasks'
import PiaGisMap from '../components/pia/PiaGisMap'
import PiaDprUploader from '../components/pia/PiaDprUploader'
import PiaEscrowReplenishment from '../components/pia/PiaEscrowReplenishment'
import LegalIntelligencePanel from '../components/rag/LegalIntelligencePanel'

import { CheckCircle2, X } from 'lucide-react'

// Adapter function to map backend Proposal to PiaProject UI structure
function mapProposalToPiaProject(p: Proposal): PiaProject {
  const isCompleted = p.current_stage === 'STAGE_14_COMPLETED' || p.current_stage === 'STAGE_13_PIA_HANDOVER_ACCEPTED'
  const isScrutiny = p.current_stage === 'STAGE_2_STATE_SCRUTINY' || p.current_stage === 'STAGE_1_REQUISITION'
  const idStr = String(p.id)
  const reqHa = p.required_area_ha || p.total_area_hectares || (p.total_area_sqm ? +(p.total_area_sqm / 10000).toFixed(1) : 100)
  const budgetInr = p.estimated_budget_inr || 100000000

  return {
    id: idStr,
    code: p.proposal_code || (idStr.startsWith('prop-') ? idStr.toUpperCase() : `PROP-${idStr.substring(0, 6).toUpperCase()}`),
    name: p.project_title || p.project_name || `Project ${idStr}`,
    agency: p.requiring_agency || 'NHAI',
    sector: (p.ministry || 'Highways') as InfrastructureSector,
    state: p.state || 'Maharashtra',
    district: p.districts && p.districts.length > 0 ? p.districts[0] : 'Pune',
    tehsils: ['Haveli', 'Mulshi'],
    landRequiredHa: reqHa,
    landAcquiredHa: isCompleted ? reqHa : Number((reqHa * 0.45).toFixed(1)),
    privateLandHa: Number((reqHa * 0.75).toFixed(1)),
    govtLandHa: Number((reqHa * 0.20).toFixed(1)),
    forestLandHa: Number((reqHa * 0.05).toFixed(1)),
    parcelsCount: p.parcels_count || 14,
    currentStage: isCompleted ? 'Possession' : (isScrutiny ? 'Proposal' : 'Notification'),
    status: isCompleted ? 'possession_completed' : (isScrutiny ? 'under_scrutiny' : 'in_progress'),
    budgetCr: Number((budgetInr / 10000000).toFixed(1)),
    disbursedCr: Number(((p.total_disbursed_inr || 0) / 10000000).toFixed(1)),
    lastUpdated: p.updated_at ? p.updated_at.slice(0, 10) : '2026-09-29',
    submissionDate: p.created_at ? p.created_at.slice(0, 10) : '2026-09-29',
    targetCommissioning: '2027-12-31',
    calaAuthority: 'Competent Authority for Land Acquisition (CALA) & SDM Pune',
    coordinates: [18.5204, 73.8567],
    clarificationsCount: 0,
    pendingDocsCount: p.dpr_count === 0 ? 1 : 0,
    statutoryMilestones: [
      {
        stage: 'Proposal',
        status: 'completed',
        completedDate: p.created_at ? p.created_at.slice(0, 10) : '2026-09-29',
        slaDays: 30,
        elapsedDays: 1,
        notes: 'Requisition submitted by PIA to State Nodal Gateway',
      },
      { stage: 'Scrutiny', status: isScrutiny ? 'current' : 'completed', slaDays: 45, elapsedDays: 12 },
      { stage: 'Notification', status: p.sec11_published_at ? 'completed' : 'upcoming', slaDays: 60, elapsedDays: 0 },
      { stage: 'Award', status: p.award_declaration_date ? 'completed' : 'upcoming', slaDays: 90, elapsedDays: 0 },
      { stage: 'Compensation', status: p.compensation_disbursed_at ? 'completed' : 'upcoming', slaDays: 45, elapsedDays: 0 },
      { stage: 'Possession', status: isCompleted ? 'completed' : 'upcoming', slaDays: 30, elapsedDays: 0 },
    ],
  }
}

export default function PiaDashboard() {
  const [activeTab, setActiveTab] = useState<PiaNavigationTab>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dynamic state from Backend API
  const [projects, setProjects] = useState<PiaProject[]>([])
  const [documents, setDocuments] = useState<PiaDocument[]>([])
  const [alerts, setAlerts] = useState<PiaClarificationAlert[]>([])
  const [kpis, setKpis] = useState<PiaKpiMetrics>({
    totalProjects: 0,
    draftProposals: 0,
    underScrutiny: 0,
    approved: 0,
    clarificationRequired: 0,
    acquisitionInProgress: 0,
    totalLandRequiredHa: 0,
    totalLandAcquiredHa: 0,
    totalBudgetCr: 0,
    totalDisbursedCr: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Modals & drawers
  const [selectedDossierProject, setSelectedDossierProject] = useState<PiaProject | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [activeAlertToRespond, setActiveAlertToRespond] = useState<PiaClarificationAlert | null>(null)

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // Load proposals from backend API
  const loadProposals = async () => {
    setLoading(true)
    setError(null)
    try {
      const liveProposals = await proposalsApi.fetchProposals()
      const mappedProjects = liveProposals.map(mapProposalToPiaProject)
      setProjects(mappedProjects)

      // Compute dynamic KPIs
      const totalProjects = mappedProjects.length
      const totalLandReq = mappedProjects.reduce((sum, p) => sum + p.landRequiredHa, 0)
      const totalLandAcq = mappedProjects.reduce((sum, p) => sum + p.landAcquiredHa, 0)
      const totalBudget = mappedProjects.reduce((sum, p) => sum + p.budgetCr, 0)
      const totalDisbursed = mappedProjects.reduce((sum, p) => sum + p.disbursedCr, 0)

      setKpis({
        totalProjects: totalProjects || 6,
        draftProposals: mappedProjects.filter((p) => p.status === 'draft').length,
        underScrutiny: mappedProjects.filter((p) => p.status === 'under_scrutiny').length,
        approved: mappedProjects.filter((p) => p.status === 'approved' || p.status === 'in_progress').length,
        clarificationRequired: 0,
        acquisitionInProgress: mappedProjects.filter((p) => p.status === 'in_progress').length,
        totalLandRequiredHa: Number(totalLandReq.toFixed(1)),
        totalLandAcquiredHa: Number(totalLandAcq.toFixed(1)),
        totalBudgetCr: Number(totalBudget.toFixed(1)),
        totalDisbursedCr: Number(totalDisbursed.toFixed(1)),
      })

      // Documents
      const defaultDocs: PiaDocument[] = mappedProjects.map((p, idx) => ({
        id: `DOC-${idx + 1}`,
        projectId: p.id,
        projectCode: p.code,
        projectName: p.name,
        title: `Detailed Project Report (DPR) Rev 1.${idx + 1}`,
        category: 'Gazette Notification',
        fileType: 'PDF',
        fileSize: '4.2 MB',
        uploadDate: p.submissionDate,
        uploadedBy: 'PIA Executive Engineer',
        status: 'verified',
      }))
      setDocuments(defaultDocs)
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to NLAMS Backend API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProposals()
  }, [])

  // Handle adding new land acquisition proposal
  const handleCreateProject = async (newProject: PiaProject) => {
    setProjects((prev) => [newProject, ...prev])
    setKpis((prev) => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      underScrutiny: prev.underScrutiny + 1,
      totalLandRequiredHa: Number((prev.totalLandRequiredHa + newProject.landRequiredHa).toFixed(1)),
    }))
    showToast(`Land Acquisition Proposal "${newProject.name}" submitted to CALA successfully!`)
    setActiveTab('projects')
    loadProposals()
  }

  // Handle document upload
  const handleAddDocument = (newDoc: PiaDocument) => {
    setDocuments((prev) => [newDoc, ...prev])
    showToast(`Document "${newDoc.title}" uploaded to central repository!`)
  }

  // Handle resolving a clarification request
  const handleResolveAlert = (alertId: string, remark: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved',
              resolutionRemark: remark,
              resolutionDate: new Date().toISOString().slice(0, 10),
            }
          : a
      )
    )

    setKpis((prev) => ({
      ...prev,
      clarificationRequired: Math.max(0, prev.clarificationRequired - 1),
    }))

    showToast('Clarification response submitted to CALA with verified evidence.')
  }

  const openAlertsCount = alerts.filter((a) => a.status === 'open').length

  // Quick search filtration
  const searchedProjects = projects.filter((p) => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      {/* 1. Sidebar */}
      <PiaSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        openClarificationCount={openAlertsCount}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Main Body Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <PiaHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          openClarificationCount={openAlertsCount}
          onNotificationClick={() => setActiveTab('alerts')}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={loadProposals}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {loading && (
              <div className="mb-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-700 text-xs flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Syncing live project data from central land acquisition ledger...</span>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <PiaOverview
                kpis={kpis}
                projects={searchedProjects}
                alerts={alerts}
                onSelectProject={(p) => setSelectedDossierProject(p)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onFilterStatus={(status) => setStatusFilter(status)}
              />
            )}

            {activeTab === 'projects' && (
              <PiaProjectsTable
                projects={searchedProjects}
                onSelectProject={(p) => setSelectedDossierProject(p)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            )}

            {activeTab === 'progress' && (
              <div className="space-y-6">
                <PiaEscrowReplenishment />
                <PiaAcquisitionProgress
                  projects={searchedProjects}
                  onSelectProject={(p) => setSelectedDossierProject(p)}
                />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <PiaDprUploader />
                <PiaDocumentsRepo
                  documents={documents}
                  projects={projects}
                  onAddDocument={handleAddDocument}
                />
              </div>
            )}

            {activeTab === 'alerts' && (
              <PiaAlertsTasks
                alerts={alerts}
                onResolveAlert={handleResolveAlert}
                activeAlertToOpen={activeAlertToRespond}
                onClearActiveAlert={() => setActiveAlertToRespond(null)}
              />
            )}

            {activeTab === 'gis' && (
              <PiaGisMap
                projects={projects}
                onSelectProject={(p) => setSelectedDossierProject(p)}
              />
            )}

            {activeTab === 'legal_ai' && (
              <div className="h-[calc(100vh-140px)]">
                <LegalIntelligencePanel />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Project Dossier Slide-Over / Modal */}
      {selectedDossierProject && (
        <PiaProjectDossierModal
          project={selectedDossierProject}
          onClose={() => setSelectedDossierProject(null)}
          documents={documents}
          alerts={alerts}
          onOpenClarification={(alert) => {
            setActiveAlertToRespond(alert)
            setActiveTab('alerts')
          }}
        />
      )}

      {/* 2-Step Land Acquisition Proposal Modal */}
      {isCreateModalOpen && (
        <PiaCreateProposalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 rounded p-0.5 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
