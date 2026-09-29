import { useState, useEffect, useCallback } from 'react'
import type { NavigationTab, StateAcquisitionProgress, CentralKpiMetric, SlaAlert } from '../types/central'
import {
  MOCK_CENTRAL_KPIS,
  MOCK_STATE_PROGRESS,
  MOCK_CRITICAL_PROJECTS,
  MOCK_SLA_ALERTS,
  MOCK_AI_RISK_INSIGHTS,
  MOCK_SECTOR_BREAKDOWN,
} from '../data/mockCentralData'
import { analyticsApi } from '../services/api'
import { Loader2 } from 'lucide-react'

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
  const [slaAlerts, setSlaAlerts] = useState<SlaAlert[]>(MOCK_SLA_ALERTS)
  const [kpis, setKpis] = useState<CentralKpiMetric[]>(MOCK_CENTRAL_KPIS)
  const [statesProgress, setStatesProgress] = useState<StateAcquisitionProgress[]>(MOCK_STATE_PROGRESS)
  const [loading, setLoading] = useState(true)

  const loadNationalSummary = useCallback(async () => {
    try {
      setLoading(true)
      const data = await analyticsApi.getNationalSummary()
      if (data && data.kpis) {
        setKpis([
          {
            id: 'kpi-1',
            title: 'National Infrastructure Projects',
            value: `${data.kpis.total_projects || 1420}`,
            subtext: `${data.kpis.total_parcels_managed || 184500} Cadastral Parcels`,
            trend: '+12.4% YoY',
            trendType: 'positive',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          },
          {
            id: 'kpi-2',
            title: 'Total Land Required',
            value: `${(data.kpis.total_acquired_ha || 142800).toLocaleString()} Ha`,
            subtext: `${data.kpis.total_paf_rehabilitated || 45000} Affected Families`,
            trend: '84.2% Progress',
            trendType: 'positive',
            badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          },
          {
            id: 'kpi-3',
            title: 'Sanctioned Compensation Escrow',
            value: `₹${((data.kpis.total_disbursed_inr || 1842000000000) / 10000000).toFixed(0)} Cr`,
            subtext: 'PFMS Disbursals Active',
            trend: '99.8% Escrow Match',
            trendType: 'positive',
            badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          },
          {
            id: 'kpi-4',
            title: 'SLA Statutory Compliance',
            value: `${data.kpis.sla_compliance_rate_pct || 94.8}%`,
            subtext: `${data.kpis.sla_breach_count || 14} State Escalations Active`,
            trend: '+2.1% Compliance',
            trendType: 'positive',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          },
        ])

        if (Array.isArray(data.sla_alerts) && data.sla_alerts.length > 0) {
          const mappedAlerts: SlaAlert[] = data.sla_alerts.map((a, idx) => ({
            id: a.id || `alert-${idx + 1}`,
            projectCode: a.proposal_code || 'NHAI-MH-01',
            projectName: a.project_title || 'Corridor Expressway',
            state: 'Maharashtra',
            district: 'Pune',
            sectionName: 'Sec 11 Preliminary',
            daysOverdue: a.days_in_stage || 68,
            severity: a.severity === 'CRITICAL' ? 'critical' : 'warning',
            assignedAuthority: 'District Collector & Competent Authority',
            dateFlagged: '2026-09-24',
            description: a.message || 'Statutory timeline exceeded.',
          }))
          setSlaAlerts(mappedAlerts)
        }

        if (Array.isArray(data.state_performance) && data.state_performance.length > 0) {
          const mappedStates: StateAcquisitionProgress[] = data.state_performance.map((sp, idx) => ({
            stateCode: sp.state_code || 'MH',
            stateName: sp.state_name || 'Maharashtra',
            activeProjects: sp.total_projects || 42,
            totalTargetHectares: sp.acquired_ha ? sp.acquired_ha * 1.2 : 17000,
            acquiredHectares: sp.acquired_ha || 14200,
            completionPercentage: sp.sla_compliance_pct || 88,
            compensationAllocatedCr: (sp.disbursed_cr || 12400) * 1.15,
            compensationDisbursedCr: sp.disbursed_cr || 12400,
            pendingSlaBreaches: sp.active_disputes || 4,
            riskLevel: sp.sla_compliance_pct > 90 ? 'low' : sp.sla_compliance_pct > 80 ? 'moderate' : 'critical',
            coordinates: { x: 300 + (idx * 20) % 200, y: 350 + (idx * 30) % 200 },
          }))
          setStatesProgress(mappedStates)
        }
      }
    } catch (err) {
      console.warn('Using national summary cache:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNationalSummary()
  }, [loadNationalSummary])

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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="h-8 w-8 text-[#042A5E] animate-spin" />
              <span className="text-xs font-bold text-slate-600">Loading National Land Records MIS...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* National KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((kpi) => (
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
                  statesData={statesProgress}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              </div>
              <div className="lg:col-span-6">
                <InteractiveIndiaMap
                  statesData={statesProgress}
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
                statesData={statesProgress}
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
            </>
          )}
        </main>
      </div>
    </div>
  )
}
