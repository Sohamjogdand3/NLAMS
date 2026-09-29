import { useState } from 'react'
import StateHeader from '../components/state/StateHeader'
import StateSidebar from '../components/state/StateSidebar'
import StateOverview from '../components/state/StateOverview'
import StateProposalIntake from '../components/state/StateProposalIntake'
import StateCalaAssignment from '../components/state/StateCalaAssignment'
import StateMultiplierAudit from '../components/state/StateMultiplierAudit'
import StateLandRegistryApi from '../components/state/StateLandRegistryApi'
import LegalIntelligencePanel from '../components/rag/LegalIntelligencePanel'
import type { StateNavigationTab, StateProposalItem } from '../types/stateNodal'
import {
  MOCK_STATE_PROPOSALS,
  MOCK_MULTIPLIER_AUDIT_LOGS,
  MOCK_REGISTRY_API_GATEWAYS,
} from '../data/mockStateNodalData'

export default function StateNodalDashboard() {
  const [activeTab, setActiveTab] = useState<StateNavigationTab>('overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [proposals, setProposals] = useState<StateProposalItem[]>(MOCK_STATE_PROPOSALS)
  const [multipliers] = useState(MOCK_MULTIPLIER_AUDIT_LOGS)
  const [gateways] = useState(MOCK_REGISTRY_API_GATEWAYS)

  const [searchTerm, setSearchTerm] = useState('')

  const pendingCount = proposals.filter((p) => p.status === 'Pending_State_Intake').length

  const handleApproveProposal = (
    proposalId: string,
    collector: string,
    lao: string,
    orderNo: string
  ) => {
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
  }

  const handleApproveIntake = (_proposalId: string) => {
    setActiveTab('cala-appointments')
  }

  const handleIssueClarification = (proposalId: string, reason: string) => {
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
