import { useState } from 'react'
import type { NavigationTab, StateAcquisitionProgress } from '../types/central'
import {
  MOCK_CENTRAL_KPIS,
  MOCK_STATE_PROGRESS,
  MOCK_CRITICAL_PROJECTS,
  MOCK_SLA_ALERTS,
  MOCK_AI_RISK_INSIGHTS,
  MOCK_SECTOR_BREAKDOWN,
} from '../data/mockCentralData'

import CentralSidebar from '../components/central/CentralSidebar'
import CentralHeader from '../components/central/CentralHeader'
import InteractiveIndiaMap from '../components/central/InteractiveIndiaMap'
import StatePerformancePanel from '../components/central/StatePerformancePanel'
import CriticalProjectsTable from '../components/central/CriticalProjectsTable'
import SlaAlertsWidget from '../components/central/SlaAlertsWidget'
import AiRiskWidget from '../components/central/AiRiskWidget'
import CentralBlockerOverride from '../components/central/CentralBlockerOverride'

import {
  PieChart,
} from 'lucide-react'

export default function CentralDashboard() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedState, setSelectedState] = useState<StateAcquisitionProgress | null>(null)
  const [slaAlerts, setSlaAlerts] = useState(MOCK_SLA_ALERTS)

  const handleAcknowledgeAlert = (id: string) => {
    setSlaAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="flex h-screen w-full bg-slate-100/80 font-sans text-slate-800 overflow-hidden">
      {/* 1. Sidebar Navigation */}
      <CentralSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        slaAlertCount={slaAlerts.length}
      />

      {/* 2. Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <CentralHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          slaAlertCount={slaAlerts.length}
          onNotificationClick={() => setActiveTab('notifications')}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: MAIN DASHBOARD OVERVIEW */}
          {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* National KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_CENTRAL_KPIS.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">{kpi.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                        {kpi.trend}
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {kpi.value}
                      </span>
                      <span className="block text-xs font-semibold text-slate-500 mt-1">
                        {kpi.subtext}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infrastructure Sector Allocation (Clean & Compact) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">
                      <PieChart className="h-3.5 w-3.5" /> Sectoral Allocation
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      National Infrastructure Sector Breakdown
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {MOCK_SECTOR_BREAKDOWN.map((sec) => (
                    <div key={sec.sector} className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                      <span className="block text-xs font-bold text-slate-800 line-clamp-1" title={sec.sector}>
                        {sec.sector}
                      </span>
                      <span className="block text-lg font-black text-navy mt-1">
                        {sec.acquiredPercentage}% <span className="text-xs font-normal text-slate-500">Acquired</span>
                      </span>
                      <div className="mt-1 text-[11px] text-slate-500 font-medium flex justify-between">
                        <span>{sec.projectCount} Projects</span>
                        <span>₹{(sec.allocatedBudgetCr / 1000).toFixed(0)}k Cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action Queue: PMO Blockers & Top Alerts Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <SlaAlertsWidget
                    alerts={slaAlerts.slice(0, 3)}
                    onAcknowledge={handleAcknowledgeAlert}
                  />
                </div>
                <div className="lg:col-span-5">
                  <AiRiskWidget insights={MOCK_AI_RISK_INSIGHTS.slice(0, 2)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS DIRECTORY */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <CriticalProjectsTable
                projects={MOCK_CRITICAL_PROJECTS}
                selectedStateFilter={selectedState ? selectedState.stateName : null}
              />
            </div>
          )}

          {/* TAB 3: STATES DIRECTORY */}
          {activeTab === 'states' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <StatePerformancePanel
                  statesData={MOCK_STATE_PROGRESS}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              </div>
              <div className="lg:col-span-6">
                <InteractiveIndiaMap
                  statesData={MOCK_STATE_PROGRESS}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              </div>
            </div>
          )}

          {/* TAB 4: GIS MAP */}
          {activeTab === 'gismap' && (
            <div className="h-[650px]">
              <InteractiveIndiaMap
                statesData={MOCK_STATE_PROGRESS}
                selectedState={selectedState}
                onSelectState={setSelectedState}
              />
            </div>
          )}

          {/* TAB 5: WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">National Statutory Workflow Pipeline</h2>
              <p className="text-xs text-slate-500">
                Monitoring statutory compliance timelines under the RFCTLARR Act, 2013 across all 6 sequential stages.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
                {[
                  { stage: 'Section 4(1)', label: 'Notification', days: '60 Days SLA', count: 184 },
                  { stage: 'Section 8', label: 'SIA Study', days: '180 Days SLA', count: 210 },
                  { stage: 'Section 11', label: 'Preliminary', days: '12 Months SLA', count: 340 },
                  { stage: 'Section 15', label: 'Objections', days: '60 Days SLA', count: 98 },
                  { stage: 'Section 19', label: 'Final Declaration', days: '12 Months SLA', count: 160 },
                  { stage: 'Section 23 & 38', label: 'Award & Possession', days: 'Comprehensive', count: 428 },
                ].map((s, idx) => (
                  <div key={s.stage} className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[10px] font-extrabold uppercase text-navy">Stage 0{idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{s.stage}</h4>
                    <span className="block text-xs font-semibold text-slate-600">{s.label}</span>
                    <span className="block text-xs font-extrabold text-emerald-700 mt-2">{s.count} Active Projects</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RISK & AI */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <CentralBlockerOverride />
              <AiRiskWidget insights={MOCK_AI_RISK_INSIGHTS} />
            </div>
          )}

          {/* TAB 7: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Macro Analytics */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900">National Macro-Level Acquisition Analytics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">Total Award Budget</span>
                    <span className="block text-xl font-black text-slate-900 mt-1">₹1,84,200 Cr</span>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                    <span className="text-xs font-semibold text-emerald-700">Disbursed Compensation</span>
                    <span className="block text-xl font-black text-emerald-900 mt-1">₹1,42,800 Cr</span>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-200">
                    <span className="text-xs font-semibold text-indigo-700">Average Disbursal Speed</span>
                    <span className="block text-xl font-black text-indigo-900 mt-1">14.2 Days</span>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
                    <span className="text-xs font-semibold text-amber-800">Pending Escrows</span>
                    <span className="block text-xl font-black text-amber-950 mt-1">₹41,400 Cr</span>
                  </div>
                </div>
              </div>

              {/* Integrated National Reports Generator */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900">National MIS Reports Generator</h2>
                <p className="text-xs text-slate-500">Generate and export automated compliance &amp; acquisition reports for Cabinet Secretariat.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => alert('Generating National Monthly Acquisition Summary PDF...')}
                    className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Download Cabinet Report (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Exporting Inter-State Land Acquisition Analytics (Excel)...')}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Export Analytics Data (Excel)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <SlaAlertsWidget
                alerts={slaAlerts}
                onAcknowledge={handleAcknowledgeAlert}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
