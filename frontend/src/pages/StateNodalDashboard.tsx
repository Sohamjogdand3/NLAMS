import { useState, useEffect, useCallback } from 'react'
import StateHeader from '../components/state/StateHeader'
import StateSidebar from '../components/state/StateSidebar'
import StateOverview from '../components/state/StateOverview'
import StateProposalIntake from '../components/state/StateProposalIntake'
import StateCalaAssignment from '../components/state/StateCalaAssignment'
import StateMultiplierAudit from '../components/state/StateMultiplierAudit'
import StateLandRegistryApi from '../components/state/StateLandRegistryApi'
import LegalIntelligencePanel from '../components/rag/LegalIntelligencePanel'
import type { StateNavigationTab, StateProposalItem, MultiplierComplianceRecord, LandRegistryApiGatewayStatus } from '../types/stateNodal'
import { proposalsApi, stateGatewayApi, type Proposal } from '../services/api'
import { MOCK_STATE_PROPOSALS } from '../data/mockStateNodalData'
import { recordWorkflowStepLog } from '../utils/auditLogger'
import WorkflowMatrixAuditComponent from '../components/common/WorkflowMatrixAuditComponent'
import { Loader2, AlertCircle, RefreshCw, Bell } from 'lucide-react'

function mapProposalToStateProposalItem(p: Proposal): StateProposalItem {
  let status: StateProposalItem['status'] = 'Pending_State_Intake'
  const stageNum = Number(p.current_stage) || 1
  if (p.status === 'CALA_ASSIGNED' || p.appointed_cala || p.assigned_collector || stageNum >= 2) {
    status = 'CALA_Appointed'
  } else if (p.status === 'REJECTED') {
    status = 'Rejected'
  } else if (p.status === 'STATE_SCRUTINY_PENDING' || p.status === 'SUBMITTED' || p.status === 'DRAFT') {
    status = 'Pending_State_Intake'
  }

  let structuralConflictStatus: StateProposalItem['structuralConflictStatus'] = 'Clear'
  if (p.structural_conflict_status === 'Forest Land Detected' || p.structural_conflict_status === 'State Highway Overlap') {
    structuralConflictStatus = p.structural_conflict_status
  }

  const idStr = String(p.id)

  return {
    id: idStr,
    projectCode: idStr.startsWith('prop-') ? idStr.toUpperCase() : `PROP-${idStr.substring(0, 6).toUpperCase()}`,
    projectName: p.project_title || p.project_name || `Proposal ${idStr}`,
    requiringAgency: p.requiring_agency || 'NHAI',
    submissionDate: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    stateJurisdiction: p.state || 'Maharashtra',
    targetDistricts: p.districts && p.districts.length > 0 ? p.districts : ['Pune'],
    totalLandReqHectares: p.total_area_hectares || p.required_area_ha || (p.total_area_sqm ? +(p.total_area_sqm / 10000).toFixed(2) : 100),
    estimatedCompensationCr: p.estimated_compensation_cr || (p.estimated_budget_inr ? +(p.estimated_budget_inr / 10000000).toFixed(2) : 350.0),
    structuralConflictStatus,
    status,
    assignedDistrictCollector: p.assigned_collector,
    appointedCalaOfficer: p.appointed_cala,
    appointmentOrderNo: p.appointment_order_no,
    appointmentDate: p.gazette_date || (p.updated_at ? p.updated_at.split('T')[0] : undefined),
    dprFileUrl: p.dpr_file_url || `${(p.project_title || p.project_name || 'Project').replace(/\s+/g, '_')}_DPR.pdf`,
    gisBoundaryFileUrl: p.gis_boundary_file_url || `${(p.project_title || p.project_name || 'Project').replace(/\s+/g, '_')}_GIS.kml`,
    comments: p.comments || p.description,
  }
}

const DEFAULT_MULTIPLIER_RECORDS: MultiplierComplianceRecord[] = [
  {
    id: 'mult-01',
    districtName: 'Pune',
    tehsilName: 'Haveli (Wagholi)',
    zoneType: 'Rural (10-20km)',
    statutoryDistanceKm: 14.5,
    mandatedMultiplierFactor: 1.5,
    actualAppliedMultiplier: 1.5,
    complianceStatus: 'Compliant',
    lastAuditedDate: '2026-09-24',
    auditingOfficer: 'State Land Records Inspector Unit 1',
  },
  {
    id: 'mult-02',
    districtName: 'Pune',
    tehsilName: 'Khed (Chakan)',
    zoneType: 'Semi-Urban (0-10km)',
    statutoryDistanceKm: 8.2,
    mandatedMultiplierFactor: 1.25,
    actualAppliedMultiplier: 1.25,
    complianceStatus: 'Compliant',
    lastAuditedDate: '2026-09-22',
    auditingOfficer: 'Director of Land Records Audit Cell',
  },
  {
    id: 'mult-03',
    districtName: 'Nashik',
    tehsilName: 'Sinnar Rural',
    zoneType: 'Deep Rural (>20km)',
    statutoryDistanceKm: 28.0,
    mandatedMultiplierFactor: 2.0,
    actualAppliedMultiplier: 1.5,
    complianceStatus: 'Under-Assessed Risk',
    lastAuditedDate: '2026-09-20',
    auditingOfficer: 'State Nodal Compliance Auditor',
  },
  {
    id: 'mult-04',
    districtName: 'Thane',
    tehsilName: 'Kalyan Urban Area',
    zoneType: 'Urban',
    statutoryDistanceKm: 0.0,
    mandatedMultiplierFactor: 1.0,
    actualAppliedMultiplier: 1.0,
    complianceStatus: 'Compliant',
    lastAuditedDate: '2026-09-15',
    auditingOfficer: 'State Revenue Audit Cell',
  },
]

const DEFAULT_REGISTRY_GATEWAYS: LandRegistryApiGatewayStatus[] = [
  {
    gatewayId: 'gw-mh-01',
    name: 'Mahabhulekh 7/12 & 8A Land Records API',
    coverage: 'State of Maharashtra (All 36 Districts)',
    totalRecordsIndexed: 28540000,
    realtimePingMs: 42,
    status: 'ONLINE',
    lastSyncTimestamp: '2026-09-29 00:05:12',
    activeLocksCount: 352,
  },
  {
    gatewayId: 'gw-dilrmp-02',
    name: 'DILRMP Cadastral Cadastre Spatial Server',
    coverage: 'National / DoLR Integrated States',
    totalRecordsIndexed: 142000000,
    realtimePingMs: 68,
    status: 'ONLINE',
    lastSyncTimestamp: '2026-09-28 23:58:40',
    activeLocksCount: 1420,
  },
  {
    gatewayId: 'gw-sarita-03',
    name: 'SARITA Sub-Registrar Deed Index Gateway',
    coverage: 'State Registration & Stamps Dept',
    totalRecordsIndexed: 18900000,
    realtimePingMs: 85,
    status: 'ONLINE',
    lastSyncTimestamp: '2026-09-29 00:01:25',
    activeLocksCount: 198,
  },
]

export default function StateNodalDashboard() {
  const [activeTab, setActiveTab] = useState<StateNavigationTab>('overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [proposals, setProposals] = useState<StateProposalItem[]>(MOCK_STATE_PROPOSALS)
  const [multipliers, setMultipliers] = useState<MultiplierComplianceRecord[]>(DEFAULT_MULTIPLIER_RECORDS)
  const [gateways] = useState<LandRegistryApiGatewayStatus[]>(DEFAULT_REGISTRY_GATEWAYS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newProposalAlert, setNewProposalAlert] = useState<string | null>(null)
  const [lastKnownCount, setLastKnownCount] = useState<number>(0)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let stateItems: StateProposalItem[] = []
      try {
        const propData = await proposalsApi.fetchProposals()
        if (Array.isArray(propData) && propData.length > 0) {
          stateItems = propData.map(mapProposalToStateProposalItem)
        } else {
          stateItems = [...MOCK_STATE_PROPOSALS]
        }
      } catch (e) {
        stateItems = [...MOCK_STATE_PROPOSALS]
      }

      // Merge custom proposals submitted from PIA side
      try {
        const customStr = localStorage.getItem('dharaa_custom_proposals')
        if (customStr) {
          const customProposals = JSON.parse(customStr)
          const customStateItems: StateProposalItem[] = customProposals.map((cp: any) => ({
            id: String(cp.id),
            projectCode: cp.code || `PROP-${String(cp.id).slice(-4)}`,
            projectName: cp.name,
            requiringAgency: cp.agency || 'NHAI',
            submissionDate: cp.submissionDate || new Date().toISOString().split('T')[0],
            stateJurisdiction: cp.state || 'Maharashtra',
            targetDistricts: [cp.district || 'Pune'],
            totalLandReqHectares: Number(cp.landRequiredHa) || 100,
            estimatedCompensationCr: Number(cp.budgetCr) || 250,
            structuralConflictStatus: (cp.forestLandHa && cp.forestLandHa > 0) ? 'Forest Land Detected' : 'Clear',
            status: 'Pending_State_Intake',
            dprFileUrl: `${cp.code || 'DPR'}_DetailedProjectReport.pdf`,
            gisBoundaryFileUrl: `${cp.code || 'GIS'}_Alignment.kml`,
            comments: `Requisition submitted by ${cp.agency || 'PIA'} on ${cp.submissionDate || 'today'}. Awaiting State Scrutiny.`,
          }))

          const existingCodes = new Set(stateItems.map((s) => s.projectCode))
          const filteredCustom = customStateItems.filter((c) => !existingCodes.has(c.projectCode))
          stateItems = [...filteredCustom, ...stateItems]
        }
      } catch (err) {
        console.warn('Error merging custom proposals in State Admin:', err)
      }

      setProposals(stateItems)

      try {
        const multData = await stateGatewayApi.fetchMultipliers('MH')
        if (Array.isArray(multData) && multData.length > 0) {
          const mappedMults: MultiplierComplianceRecord[] = multData.map((m: any, idx: number) => ({
            id: m.id || `mult-${idx + 1}`,
            districtName: m.district_name || 'State District',
            tehsilName: m.tehsil_name || 'Tehsil Area',
            zoneType: (m.distance_from_urban_km > 20 ? 'Deep Rural (>20km)' : m.distance_from_urban_km > 10 ? 'Rural (10-20km)' : m.distance_from_urban_km > 0 ? 'Semi-Urban (0-10km)' : 'Urban') as any,
            statutoryDistanceKm: m.distance_from_urban_km || 0,
            mandatedMultiplierFactor: m.multiplier_factor || 1.0,
            actualAppliedMultiplier: m.multiplier_factor || 1.0,
            complianceStatus: 'Compliant',
            lastAuditedDate: m.effective_date || new Date().toISOString().split('T')[0],
            auditingOfficer: 'State Land Records Inspector',
          }))
          setMultipliers(mappedMults)
        }
      } catch (mErr) {
        console.warn('Using default multiplier compliance records:', mErr)
      }
    } catch (err: any) {
      console.warn('Using state proposals fallback cache:', err)
      setProposals(MOCK_STATE_PROPOSALS)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Auto-sync: detect new PIA proposals ──────────────────────────────────
  // 1. Cross-tab: storage event fires when ANOTHER tab writes to localStorage
  // 2. Same-tab polling: check every 5s if the count changed (storage events
  //    do NOT fire within the same browser tab)
  useEffect(() => {
    const getCustomCount = (): number => {
      try {
        const raw = localStorage.getItem('dharaa_custom_proposals')
        if (!raw) return 0
        return (JSON.parse(raw) as any[]).length
      } catch {
        return 0
      }
    }

    // Initialize baseline count
    setLastKnownCount(getCustomCount())

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dharaa_custom_proposals') {
        const newCount = getCustomCount()
        setLastKnownCount((prev) => {
          if (newCount > prev) {
            setNewProposalAlert(`${newCount - prev} new proposal(s) received from PIA!`)
            setTimeout(() => setNewProposalAlert(null), 6000)
          }
          return newCount
        })
        loadData()
      }
    }

    // Cross-tab listener
    window.addEventListener('storage', handleStorageChange)

    // Same-tab poll every 5 seconds
    const pollInterval = setInterval(() => {
      const currentCount = getCustomCount()
      setLastKnownCount((prev) => {
        if (currentCount !== prev) {
          if (currentCount > prev) {
            setNewProposalAlert(`${currentCount - prev} new proposal(s) received from PIA!`)
            setTimeout(() => setNewProposalAlert(null), 6000)
          }
          loadData()
          return currentCount
        }
        return prev
      })
    }, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
    }
  }, [loadData])

  const pendingCount = proposals.filter((p) => p.status === 'Pending_State_Intake').length

  const handleApproveProposal = async (
    proposalId: string,
    collector: string,
    lao: string,
    orderNo: string
  ) => {
    try {
      await stateGatewayApi.assignCala({
        proposal_id: proposalId,
        district_collector_name: collector,
        la_officer_name: lao,
        appointment_order_no: orderNo,
      })
    } catch (err: any) {
      console.warn('Backend CALA assignment skipped, updating local shared state:', err)
    }

    // Update in-memory state
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'CALA_Appointed' as const,
              assignedDistrictCollector: collector,
              appointedCalaOfficer: lao,
              appointmentOrderNo: orderNo,
              appointmentDate: new Date().toISOString().split('T')[0],
            }
          : p
      )
    )

    // Sync to shared localStorage so District Collector & LAO Dashboards receive it instantly
    try {
      const customStr = localStorage.getItem('dharaa_custom_proposals')
      if (customStr) {
        const customProposals = JSON.parse(customStr)
        const updated = customProposals.map((cp: any) => {
          if (String(cp.id) === String(proposalId) || cp.code === proposalId) {
            return {
              ...cp,
              assignedDistrictCollector: collector,
              appointedCalaOfficer: lao,
              appointmentOrderNo: orderNo,
              currentStage: 'Scrutiny',
              status: 'CALA_Appointed',
            }
          }
          return cp
        })
        localStorage.setItem('dharaa_custom_proposals', JSON.stringify(updated))

        recordWorkflowStepLog({
          step: 2,
          workItem: 'Scrutiny & CALA Order',
          originatingDashboard: 'State Revenue Nodal',
          receivingDashboard: 'District Collector Desk',
          outputArtifact: 'Sec 3(a) Gazette Order',
          targetProject: proposalId,
          user: 'Shri Anand V. (IAS)',
          role: 'State Revenue Nodal Officer',
          action: `Issued Sec 3(a) Order #${orderNo} & Appointed CALA`,
          details: `Approved scrutiny for proposal ${proposalId}; appointed District Collector (${collector}) and CALA (${lao}).`,
        })
      }
    } catch (e) {
      console.warn('Failed to update custom proposal in localStorage:', e)
    }
  }

  const handleApproveIntake = async (proposalId: string) => {
    try {
      await proposalsApi.submitStateScrutiny(proposalId, {
        action: 'APPROVED',
        remarks: 'State scrutiny verified. Approved for CALA appointment.',
      })
      setActiveTab('cala-appointments')
    } catch (err: any) {
      console.error('Failed to approve intake on backend:', err)
      setActiveTab('cala-appointments')
    }
  }

  const handleIssueClarification = async (proposalId: string, reason: string) => {
    try {
      await proposalsApi.submitStateScrutiny(proposalId, {
        action: 'CLARIFICATION_REQUESTED',
        remarks: reason,
      })
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status: 'Clarification_Issued' as const,
                comments: reason,
              }
            : p
        )
      )
    } catch (err: any) {
      console.error('Failed to submit clarification to backend:', err)
      alert(`Error submitting clarification: ${err.message || 'Network error'}`)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 font-sans antialiased">
      {/* Sidebar */}
      <StateSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingIntakeCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <StateHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pendingIntakeCount={pendingCount}
          onNotificationClick={() => setActiveTab('proposals')}
        />

        {/* ── New Proposal Live Alert Toast ─────────────────────────────── */}
        {newProposalAlert && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 shadow-md animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-emerald-600 shrink-0 animate-bounce" />
              <span className="text-xs font-bold text-emerald-900">{newProposalAlert}</span>
              <button
                type="button"
                onClick={() => setActiveTab('proposals')}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[10px] font-bold transition-colors cursor-pointer"
              >
                View Now →
              </button>
            </div>
            <button
              type="button"
              onClick={() => setNewProposalAlert(null)}
              className="text-emerald-500 hover:text-emerald-800 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Loader2 className="h-8 w-8 text-[#042A5E] animate-spin" />
                <span className="text-xs font-bold text-slate-600">Loading State Revenue Portal Data...</span>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  State Revenue Gateway Connection Error
                </div>
                <p className="text-xs text-red-700">{error}</p>
                <button
                  onClick={loadData}
                  className="rounded-xl bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#07397b] transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <StateOverview
                    proposals={proposals}
                    multiplierRecords={multipliers}
                    apiGateways={gateways}
                    onSelectTab={setActiveTab}
                  />
                )}

                {activeTab === 'proposals' && (
                  <div className="space-y-3">
                    {/* Refresh Bar */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-700">
                          Incoming Proposals
                          {lastKnownCount > 0 && (
                            <span className="ml-2 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              {lastKnownCount} from PIA
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">Auto-syncs every 5s</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsRefreshing(true)
                          await loadData()
                          setIsRefreshing(false)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                      </button>
                    </div>
                    <StateProposalIntake
                      proposals={proposals}
                      onApproveIntake={handleApproveIntake}
                      onIssueClarification={handleIssueClarification}
                    />
                  </div>
                )}

                {activeTab === 'cala-appointments' && (
                  <StateCalaAssignment
                    proposals={proposals}
                    onApproveProposal={handleApproveProposal}
                  />
                )}

                {activeTab === 'multiplier-audit' && (
                  <StateMultiplierAudit records={multipliers} />
                )}

                {activeTab === 'land-registry-api' && (
                  <StateLandRegistryApi gateways={gateways} />
                )}

                {activeTab === 'reports' && (
                  <WorkflowMatrixAuditComponent />
                )}
              </>
            )}
            {activeTab === 'legal_ai' && (
              <div className="h-[calc(100vh-140px)]">
                <LegalIntelligencePanel />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

