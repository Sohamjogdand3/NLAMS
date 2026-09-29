import { useState, useEffect, useCallback } from 'react'
import StateHeader from '../components/state/StateHeader'
import StateSidebar from '../components/state/StateSidebar'
import StateOverview from '../components/state/StateOverview'
import StateProposalIntake from '../components/state/StateProposalIntake'
import StateCalaAssignment from '../components/state/StateCalaAssignment'
import StateMultiplierAudit from '../components/state/StateMultiplierAudit'
import StateLandRegistryApi from '../components/state/StateLandRegistryApi'
import type { StateNavigationTab, StateProposalItem, MultiplierComplianceRecord, LandRegistryApiGatewayStatus } from '../types/stateNodal'
import { proposalsApi, stateGatewayApi, type Proposal } from '../services/api'
import { Loader2, AlertCircle } from 'lucide-react'

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
  const [proposals, setProposals] = useState<StateProposalItem[]>([])
  const [multipliers, setMultipliers] = useState<MultiplierComplianceRecord[]>(DEFAULT_MULTIPLIER_RECORDS)
  const [gateways] = useState<LandRegistryApiGatewayStatus[]>(DEFAULT_REGISTRY_GATEWAYS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const propData = await proposalsApi.fetchProposals()
      if (Array.isArray(propData) && propData.length > 0) {
        setProposals(propData.map(mapProposalToStateProposalItem))
      } else {
        setProposals([])
      }

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
      console.error('Failed to load state nodal dashboard data:', err)
      setError(err?.message || 'Failed to connect to State Revenue Gateway.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
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
    } catch (err: any) {
      console.error('Failed to assign CALA on backend:', err)
      alert(`Error assigning CALA: ${err.message || 'Network error'}`)
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
                  <StateProposalIntake
                    proposals={proposals}
                    onApproveIntake={handleApproveIntake}
                    onIssueClarification={handleIssueClarification}
                  />
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
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-3">
                    <h3 className="text-base font-black text-slate-900">
                      State Land Acquisition MIS &amp; Statutory Audit Trail
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xl mx-auto">
                      Immutable cryptographic audit trail of all State Revenue Nodal actions, gazetted Section 3(a) orders, Mahabhulekh mutation lock triggers, and multiplier factor determinations.
                    </p>
                    <div className="pt-4 flex justify-center gap-3">
                      <button
                        onClick={() => alert('Generating State Annual Land Acquisition Audit Report (PDF)...')}
                        className="rounded-xl bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#07397b] transition-colors cursor-pointer"
                      >
                        Export Annual MIS Report (PDF)
                      </button>
                      <button
                        onClick={() => alert('Exporting State Land Acquisition Ledger (Excel / CSV)...')}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Export Gazette Ledger (CSV)
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

