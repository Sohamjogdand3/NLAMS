import {
  FileCheck2,
  UserCheck,
  Scale,
  Database,
  Building2,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import type {
  StateProposalItem,
  MultiplierComplianceRecord,
  LandRegistryApiGatewayStatus,
} from '../../types/stateNodal'

interface StateOverviewProps {
  proposals: StateProposalItem[]
  multiplierRecords: MultiplierComplianceRecord[]
  apiGateways: LandRegistryApiGatewayStatus[]
  onSelectTab: (tab: any) => void
}

export default function StateOverview({
  proposals,
  multiplierRecords,
  apiGateways,
  onSelectTab,
}: StateOverviewProps) {
  const pendingIntake = proposals.filter((p) => p.status === 'Pending_State_Intake').length
  const calaAppointed = proposals.filter((p) => p.status === 'CALA_Appointed').length
  const totalHectares = proposals.reduce((acc, p) => acc + p.totalLandReqHectares, 0)
  const totalCr = proposals.reduce((acc, p) => acc + p.estimatedCompensationCr, 0)

  const compliantMultipliers = multiplierRecords.filter(
    (m) => m.complianceStatus === 'Compliant'
  ).length
  const auditRiskCount = multiplierRecords.filter(
    (m) => m.complianceStatus !== 'Compliant'
  ).length

  return (
    <div className="space-y-6">
      {/* State Authority Compact Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#042A5E] via-[#0A3D7E] to-[#042A5E] p-4 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase border border-amber-400/30">
                State Revenue Nodal Authority
              </span>
              <span className="text-xs text-slate-300">• Maharashtra</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              State Land Acquisition Governance Console
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectTab('proposals')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-[#042A5E] hover:bg-amber-300 transition-colors shadow-xs cursor-pointer"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              Review Intake ({pendingIntake})
            </button>
            <button
              onClick={() => onSelectTab('cala-appointments')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors border border-white/20 cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5" />
              CALA Orders
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Proposals</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{proposals.length}</span>
            <span className="text-xs font-bold text-emerald-700">{calaAppointed} Appointed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {pendingIntake} awaiting State Gazetted order
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Land Demand</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalHectares.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-600">Hectares</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across 5 Priority Districts</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Est. Compensation</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">₹{totalCr.toFixed(0)}</span>
            <span className="text-xs font-bold text-slate-600">Crores</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">PFMS State Escrow projection</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Multiplier Compliance</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {Math.round((compliantMultipliers / (multiplierRecords.length || 1)) * 100)}%
            </span>
            {auditRiskCount > 0 && (
              <span className="text-xs font-bold text-amber-700">{auditRiskCount} Flagged</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">RFCTLARR Schedule I validation</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proposals Pipeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#042A5E]" />
              State Intake &amp; Requisition Queue
            </h2>
            <button
              onClick={() => onSelectTab('proposals')}
              className="text-xs font-bold text-[#042A5E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Proposals <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {proposals.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#042A5E]">
                        {item.projectCode}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          item.status === 'Pending_State_Intake'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {item.requiringAgency}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{item.projectName}</h3>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs font-black text-slate-800">
                      {item.totalLandReqHectares} Ha
                    </span>
                    <div className="text-[10px] text-slate-400">
                      ₹{item.estimatedCompensationCr} Cr Est.
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Districts:{' '}
                      <strong className="text-slate-800">{item.targetDistricts.join(', ')}</strong>
                    </span>
                    <span>
                      Overlap Check:{' '}
                      <strong
                        className={
                          item.structuralConflictStatus === 'Clear'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }
                      >
                        {item.structuralConflictStatus}
                      </strong>
                    </span>
                  </div>

                  {item.status === 'Pending_State_Intake' ? (
                    <button
                      onClick={() => onSelectTab('proposals')}
                      className="rounded-lg bg-[#042A5E] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#07397b] transition-colors cursor-pointer"
                    >
                      Appoint CALA &rarr;
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      CALA Order: {item.appointmentOrderNo?.split('/')[3] || 'Issued'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Land Registry & Multipliers (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4 text-[#042A5E]" />
              Land Registry Gateways
            </h2>
            <button
              onClick={() => onSelectTab('land-registry-api')}
              className="text-xs font-bold text-[#042A5E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Config <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {apiGateways.map((gw) => (
              <div
                key={gw.gatewayId}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{gw.name}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {gw.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Latency: {gw.realtimePingMs}ms</span>
                  <span>Locks Active: {gw.activeLocksCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick statutory guidance */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">RFCTLARR Statutory Mandate</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  State Revenue Nodal Authority is the mandatory bridge between Requisitioning Agencies (NHAI/Railways) and District Collectors. Once intake is approved, a gazetted Section 3(a) or Section 3(g) CALA order is generated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
