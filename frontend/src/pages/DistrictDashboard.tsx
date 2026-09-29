import { useState } from 'react'
import type { DistrictNavigationTab, DistrictProject } from '../types/district'
import {
  MOCK_DISTRICT_KPIS,
  MOCK_DISTRICT_PROJECTS,
  MOCK_SCRUTINY_REQUISITIONS,
} from '../data/mockDistrictData'

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

export default function DistrictDashboard() {
  const [activeTab, setActiveTab] = useState<DistrictNavigationTab>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [projects, setProjects] = useState<DistrictProject[]>(MOCK_DISTRICT_PROJECTS)
  const [selectedProject, setSelectedProject] = useState<DistrictProject | null>(null)

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
          {activeTab === 'dashboard' && (
            <DistrictOverview
              kpis={MOCK_DISTRICT_KPIS}
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

          {activeTab === 'legal_ai' && <LegalIntelligencePanel />}
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
