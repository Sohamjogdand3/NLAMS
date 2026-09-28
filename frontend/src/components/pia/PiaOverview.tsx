import {
  FolderGit2,
  FileEdit,
  SearchCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  MapPin,
  ShieldAlert,
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
      color: 'border-slate-200/90 text-slate-900 hover:border-slate-300',
      bg: 'bg-white',
      iconBg: 'bg-slate-100 text-slate-700',
      badge: 'Portfolio',
      badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/60',
      filter: 'all',
    },
    {
      id: 'draft',
      title: 'Draft Proposals',
      count: kpis.draftProposals,
      subtext: 'Pending agency submission',
      icon: FileEdit,
      color: 'border-amber-200/80 text-amber-900 hover:border-amber-300',
      bg: 'bg-gradient-to-b from-amber-50/25 to-white',
      iconBg: 'bg-amber-100/70 text-amber-700',
      badge: 'Step 1-2 In Prep',
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200/70',
      filter: 'draft',
    },
    {
      id: 'scrutiny',
      title: 'Under Scrutiny',
      count: kpis.underScrutiny,
      subtext: 'With CALA / Collector',
      icon: SearchCheck,
      color: 'border-blue-200/80 text-blue-900 hover:border-blue-300',
      bg: 'bg-gradient-to-b from-blue-50/25 to-white',
      iconBg: 'bg-blue-100/70 text-blue-700',
      badge: 'Revenue Verification',
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200/70',
      filter: 'under_scrutiny',
    },
    {
      id: 'clarification',
      title: 'Clarification Required',
      count: kpis.clarificationRequired,
      subtext: 'Action required within SLA',
      icon: AlertCircle,
      color: 'border-red-300/90 text-[#991B1B] hover:border-red-400 ring-1 ring-red-200/60',
      bg: 'bg-gradient-to-b from-red-50/40 to-white',
      iconBg: 'bg-red-100 text-[#991B1B]',
      badge: `${openAlerts.length} Critical Queries`,
      badgeColor: 'bg-[#991B1B] text-white shadow-2xs',
      filter: 'clarification_required',
    },
    {
      id: 'in_progress',
      title: 'Acquisition in Progress',
      count: kpis.acquisitionInProgress,
      subtext: 'Notification to compensation',
      icon: Clock,
      color: 'border-purple-200/80 text-purple-900 hover:border-purple-300',
      bg: 'bg-gradient-to-b from-purple-50/25 to-white',
      iconBg: 'bg-purple-100/70 text-purple-700',
      badge: 'Statutory Active',
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200/70',
      filter: 'in_progress',
    },
    {
      id: 'approved',
      title: 'Approved / Possession',
      count: kpis.approved,
      subtext: 'Sec 3E possession cleared',
      icon: CheckCircle2,
      color: 'border-emerald-200/80 text-emerald-900 hover:border-emerald-300',
      bg: 'bg-gradient-to-b from-emerald-50/25 to-white',
      iconBg: 'bg-emerald-100/70 text-emerald-700',
      badge: 'Right-of-Way Ready',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
      filter: 'approved',
    },
  ]

  return (
    <div className="space-y-5">
      {/* 1. Urgent Clarification Required Alert Banner */}
      {openAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/90 p-3 sm:p-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#991B1B] text-white shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#991B1B]">
                    Action Required: {openAlerts.length} Pending Query{openAlerts.length > 1 ? 'ies' : ''} from Revenue Authority
                  </h4>
                  <span className="inline-flex rounded-full bg-red-200/80 px-2 py-0.5 text-[9px] font-extrabold text-red-900">
                    SLA Risk
                  </span>
                </div>
                <p className="text-[11px] text-red-900/80 mt-0.5">
                  Latest: <span className="font-semibold">{openAlerts[0]?.title}</span> ({openAlerts[0]?.projectCode}) — {openAlerts[0]?.daysLeft} days left.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('alerts')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-3 py-1.5 text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <span>Resolve Queries</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. 6 Primary KPI Summary Cards (Ultra-Compact Modern Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
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
              className={`group flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 text-left transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer ${card.bg} ${card.color}`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className={`p-1 rounded-md ${card.iconBg}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-[#991B1B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="mt-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none">{card.count}</span>
                  <span className="text-[10px] text-slate-400 font-medium">projects</span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 block leading-tight truncate mt-1">{card.title}</span>
                <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">{card.subtext}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 2. Priority Projects Overview Table */}

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
