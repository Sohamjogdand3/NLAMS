import { useState } from 'react'
import {
  MOCK_PIA_PROJECTS,
  MOCK_PIA_KPIS,
  MOCK_PIA_DOCUMENTS,
  MOCK_PIA_ALERTS,
} from '../data/mockPiaData'
import type {
  PiaNavigationTab,
  PiaProject,
  PiaDocument,
  PiaClarificationAlert,
  PiaKpiMetrics,
} from '../types/pia'

import PiaSidebar from '../components/pia/PiaSidebar'
import PiaHeader from '../components/pia/PiaHeader'
import PiaOverview from '../components/pia/PiaOverview'
import PiaProjectsTable from '../components/pia/PiaProjectsTable'
import PiaProjectDossierModal from '../components/pia/PiaProjectDossierModal'
import PiaCreateProposalModal from '../components/pia/PiaCreateProposalModal'
import PiaAcquisitionProgress from '../components/pia/PiaAcquisitionProgress'
import PiaDocumentsRepo from '../components/pia/PiaDocumentsRepo'
import PiaAlertsTasks from '../components/pia/PiaAlertsTasks'
import PiaReportsAnalytics from '../components/pia/PiaReportsAnalytics'
import PiaGisMap from '../components/pia/PiaGisMap'

import { CheckCircle2, X } from 'lucide-react'

export default function PiaDashboard() {
  const [activeTab, setActiveTab] = useState<PiaNavigationTab>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dynamic state
  const [projects, setProjects] = useState<PiaProject[]>(MOCK_PIA_PROJECTS)
  const [documents, setDocuments] = useState<PiaDocument[]>(MOCK_PIA_DOCUMENTS)
  const [alerts, setAlerts] = useState<PiaClarificationAlert[]>(MOCK_PIA_ALERTS)
  const [kpis, setKpis] = useState<PiaKpiMetrics>(MOCK_PIA_KPIS)

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

  // Handle adding new land acquisition proposal
  const handleCreateProject = (newProject: PiaProject) => {
    setProjects((prev) => [newProject, ...prev])
    setKpis((prev) => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      underScrutiny: prev.underScrutiny + 1,
      totalLandRequiredHa: Number((prev.totalLandRequiredHa + newProject.landRequiredHa).toFixed(1)),
    }))
    showToast(`Land Acquisition Proposal "${newProject.name}" submitted to CALA successfully!`)
    setActiveTab('projects')
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

  // Quick search filtration for projects when searching globally in header
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
              <PiaAcquisitionProgress
                projects={searchedProjects}
                onSelectProject={(p) => setSelectedDossierProject(p)}
              />
            )}

            {activeTab === 'documents' && (
              <PiaDocumentsRepo
                documents={documents}
                projects={projects}
                onAddDocument={handleAddDocument}
              />
            )}

            {activeTab === 'alerts' && (
              <PiaAlertsTasks
                alerts={alerts}
                onResolveAlert={handleResolveAlert}
                activeAlertToOpen={activeAlertToRespond}
                onClearActiveAlert={() => setActiveAlertToRespond(null)}
              />
            )}

            {activeTab === 'reports' && (
              <PiaReportsAnalytics projects={projects} />
            )}

            {activeTab === 'gis' && (
              <PiaGisMap
                projects={projects}
                onSelectProject={(p) => setSelectedDossierProject(p)}
              />
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
