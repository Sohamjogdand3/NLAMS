import {
  FolderGit2,
  FileEdit,
  SearchCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Building2,
  PlusCircle,
  ShieldAlert,
  Compass,
} from 'lucide-react'
import type { PiaProject, PiaClarificationAlert, PiaKpiMetrics } from '../../types/pia'

interface PiaOverviewProps {
  kpis: PiaKpiMetrics
  projects: PiaProject[]
  alerts: PiaClarificationAlert[]
  onSelectProject: (project: PiaProject) => void
  onOpenCreateModal: () => void
  onNavigateTab: (tab: any) => void
  onFilterStatus: (status: string) => void
}

export default function PiaOverview({
  kpis,
  projects,
  alerts,
  onSelectProject,
  onOpenCreateModal,
  onNavigateTab,
  onFilterStatus,
}: PiaOverviewProps) {
  const openAlerts = alerts.filter((a) => a.status === 'open')

  // Top 6 KPI definitions requested specifically by user
  const kpiCards = [
    {
      id: 'total',
      title: 'Total Projects',
      count: kpis.totalProjects,
      subtext: 'Across all sector corridors',
      icon: FolderGit2,
      color: 'border-slate-300 text-slate-900',
      bg: 'bg-white',
      badge: 'Portfolio',
      badgeColor: 'bg-slate-100 text-slate-700',
      filter: 'all',
    },
    {
      id: 'draft',
      title: 'Draft Proposals',
      count: kpis.draftProposals,
      subtext: 'Pending agency submission',
      icon: FileEdit,
      color: 'border-slate-300 text-slate-700',
      bg: 'bg-white',
      badge: 'Step 1-2 In Prep',
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      filter: 'draft',
    },
    {
      id: 'scrutiny',
      title: 'Under Scrutiny',
      count: kpis.underScrutiny,
      subtext: 'With CALA / District Collector',
      icon: SearchCheck,
      color: 'border-blue-200 text-blue-900',
      bg: 'bg-white',
      badge: 'Revenue Verification',
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
      filter: 'under_scrutiny',
    },
    {
      id: 'clarification',
      title: 'Clarification Required',
      count: kpis.clarificationRequired,
      subtext: 'Action required within SLA',
      icon: AlertCircle,
      color: 'border-red-300 text-[#991B1B]',
      bg: 'bg-red-50/50 ring-1 ring-red-200',
      badge: `${openAlerts.length} Critical Queries`,
      badgeColor: 'bg-[#991B1B] text-white',
      filter: 'clarification_required',
    },
    {
      id: 'in_progress',
      title: 'Acquisition in Progress',
      count: kpis.acquisitionInProgress,
      subtext: 'Notification to compensation',
      icon: Clock,
      color: 'border-purple-200 text-purple-900',
      bg: 'bg-white',
      badge: 'Statutory Active',
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
      filter: 'in_progress',
    },
    {
      id: 'approved',
      title: 'Approved / Possession',
      count: kpis.approved,
      subtext: 'Sec 3E possession cleared',
      icon: CheckCircle2,
      color: 'border-emerald-200 text-emerald-900',
      bg: 'bg-white',
      badge: 'Right-of-Way Ready',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      filter: 'approved',
    },
  ]

  // Statutory pipeline stages
  const timelineStages = [
    { stage: 'Proposal', desc: 'Requisition & PFR', count: 4, status: 'completed' },
    { stage: 'Scrutiny', desc: 'CALA Verification', count: 6, status: 'completed' },
    { stage: 'Notification', desc: 'Sec 3A / 3D Gazette', count: 5, status: 'current' },
    { stage: 'Award', desc: 'Sec 3G Determination', count: 4, status: 'pending' },
    { stage: 'Compensation', desc: 'Sec 3H Escrow Disbursal', count: 3, status: 'pending' },
    { stage: 'Possession', desc: 'Sec 3E Site Handover', count: 6, status: 'pending' },
  ]

  return (
    <div className="space-y-6">
      {/* 1. National PIA Executive Context & Quick Action Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-red-800/80 px-2.5 py-1 text-xs font-semibold text-red-100 ring-1 ring-red-700">
              <Building2 className="h-3.5 w-3.5" />
              <span>National Highways Authority of India (NHAI) · PIU Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Land Acquisition & Corridor Right-of-Way Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Manage pre-statutory proposals, field measurement records, CALA revenue scrutinies, gazette notifications, and compensation disbursements under the RFCTLARR & NH Acts.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Start 2-Step Proposal</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('gis')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors"
            >
              <Compass className="h-4 w-4 text-red-400" />
              <span>Corridor GIS Map</span>
            </button>
          </div>
        </div>

        {/* Aggregate Land & Financials Micro-strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Total Land Required</span>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {kpis.totalLandRequiredHa.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">Ha</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Possession Acquired</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">
              {kpis.totalLandAcquiredHa.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">Ha ({((kpis.totalLandAcquiredHa / kpis.totalLandRequiredHa) * 100).toFixed(1)}%)</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Sanctioned Budget</span>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5">
              ₹{kpis.totalBudgetCr.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">Cr</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Direct Disbursed (PFMS)</span>
            <p className="text-lg sm:text-xl font-bold text-amber-300 mt-0.5">
              ₹{kpis.totalDisbursedCr.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">Cr</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Urgent Clarification Required Alert Banner */}
      {openAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/90 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#991B1B] text-white shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#991B1B]">
                    Action Required: {openAlerts.length} Pending Clarification Request{openAlerts.length > 1 ? 's' : ''} from Revenue Authorities
                  </h4>
                  <span className="inline-flex rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-900">
                    Statutory SLA Risk
                  </span>
                </div>
                <p className="text-xs text-red-900/80 mt-0.5">
                  Latest: <span className="font-semibold">{openAlerts[0]?.title}</span> ({openAlerts[0]?.projectCode}) — {openAlerts[0]?.daysLeft} days remaining to respond.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('alerts')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-3.5 py-2 text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              <span>Resolve Queries</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. 6 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                onFilterStatus(card.filter)
                onNavigateTab('projects')
              }}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${card.bg} ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-600 block">{card.title}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">{card.count}</span>
                  <span className="text-xs text-slate-500">projects</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">{card.subtext}</span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#991B1B]">
                <span>View projects</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </button>
          )
        })}
      </div>

      {/* 4. Statutory Acquisition Progress Pipeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#991B1B]" />
              Statutory Land Acquisition Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              National standard timeline: Requisition → Revenue Scrutiny → Notification (3A/3D) → Award (3G) → Compensation (3H) → Possession (3E)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-bold text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Detailed Stage Tracker</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 6 Stage Milestone Horizontal Cards */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {timelineStages.map((st, idx) => (
            <div
              key={st.stage}
              className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:border-red-300 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>STAGE 0{idx + 1}</span>
                <span className="text-[#991B1B]">{st.count} Projects</span>
              </div>
              <div className="my-2">
                <span className="text-xs font-bold text-slate-900 block">{st.stage}</span>
                <span className="text-[10px] text-slate-500 block leading-tight">{st.desc}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#991B1B]"
                  style={{ width: `${Math.min(100, (st.count / 8) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Active Projects Snapshot Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Priority Projects Overview</h3>
            <p className="text-xs text-slate-500">Recently updated corridor acquisitions</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-bold text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1"
          >
            <span>View All ({projects.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5 rounded-l-lg">Project Code & Name</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Land Req. (Ha)</th>
                <th className="px-3 py-2.5">Current Stage</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Last Updated</th>
                <th className="px-3 py-2.5 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {projects.slice(0, 5).map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-3 font-medium">
                    <span className="font-mono text-[10px] font-bold text-[#991B1B] block">{proj.code}</span>
                    <span className="text-slate-900 font-bold block max-w-xs truncate">{proj.name}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 text-slate-800 font-medium">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{proj.district}, {proj.state}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                      {proj.tehsils.join(', ')}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-bold text-slate-900">{proj.landRequiredHa}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {proj.landAcquiredHa} Ha acquired
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800">
                      {proj.currentStage}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {proj.status === 'clarification_required' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-900">
                        <AlertCircle className="h-3 w-3 text-[#991B1B]" />
                        Clarification Req
                      </span>
                    ) : proj.status === 'in_progress' ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                        In Progress
                      </span>
                    ) : proj.status === 'approved' || proj.status === 'possession_completed' ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                        Possession Completed
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        {proj.status.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-500 text-[11px]">
                    {proj.lastUpdated}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectProject(proj)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
