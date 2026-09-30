import {
  GitFork,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import type { DistrictKpiMetric, DistrictProject, AcquisitionStage } from '../../types/district'

interface DistrictOverviewProps {
  kpis: DistrictKpiMetric[]
  projects: DistrictProject[]
  onSelectProject: (project: DistrictProject) => void
  onNavigateTab: (tab: any) => void
}

export default function DistrictOverview({
  kpis,
  projects,
  onSelectProject,
  onNavigateTab,
}: DistrictOverviewProps) {
  const stages: { stage: AcquisitionStage; label: string; count: number; delayedCount: number }[] = [
    { stage: 'Proposal', label: '1. Proposal', count: projects.filter((p) => p.currentStage === 'Proposal').length, delayedCount: 0 },
    { stage: 'Scrutiny', label: '2. Scrutiny', count: projects.filter((p) => p.currentStage === 'Scrutiny').length, delayedCount: 1 },
    { stage: 'Notification', label: '3. Notification', count: projects.filter((p) => p.currentStage === 'Notification').length, delayedCount: 0 },
    { stage: 'Award', label: '4. Award (Sec 23)', count: projects.filter((p) => p.currentStage === 'Award').length, delayedCount: 0 },
    { stage: 'Compensation', label: '5. Compensation', count: projects.filter((p) => p.currentStage === 'Compensation').length, delayedCount: 0 },
    { stage: 'R&R', label: '6. R&R Package', count: projects.filter((p) => p.currentStage === 'R&R').length, delayedCount: 0 },
    { stage: 'Possession', label: '7. Possession', count: projects.filter((p) => p.currentStage === 'Possession').length, delayedCount: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Metrics Grid */}
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

      {/* Acquisition Pipeline Stage Overview Card (Compact & Cluster-Free) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-[#042A5E]" />
              <h2 className="text-sm font-bold text-slate-900">
                Statutory Acquisition Pipeline (RFCTLARR Act 2013)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live district project progression across 7 mandatory statutory stages
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('pipeline')}
            className="flex items-center gap-1.5 rounded-xl bg-[#042A5E] px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors w-fit cursor-pointer"
          >
            <span>Detailed Pipeline View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Unified Sleek 7-Stage Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stg, idx) => (
            <div
              key={stg.stage}
              onClick={() => onNavigateTab('pipeline')}
              className={`flex flex-col justify-between rounded-xl border px-3 py-2.5 transition-all cursor-pointer hover:border-[#042A5E] hover:shadow-xs ${
                stg.count > 0 ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50/60 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">0{idx + 1}</span>
                {stg.delayedCount > 0 ? (
                  <span className="font-bold text-red-700 bg-red-100 text-[9px] px-1.5 py-0.2 rounded">
                    Delayed
                  </span>
                ) : stg.count > 0 ? (
                  <span className="font-bold text-emerald-700 bg-emerald-100 text-[9px] px-1.5 py-0.2 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-slate-400 text-[9px]">Idle</span>
                )}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[11px] font-bold text-slate-800 truncate" title={stg.label}>
                  {stg.stage}
                </span>
                <span className="text-lg font-black text-[#042A5E] leading-none">
                  {stg.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority District Requisitions & AI Legal Copilot (Cluster-Free Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority District Requisitions Table (Expanded for Breathing Room) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Priority District Projects &amp; SLA Deadlines
              </h3>
              <p className="text-[11px] text-slate-500">
                Requisitions requiring Land Acquisition Officer (LAO) scrutiny or Section 3D declaration
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-bold text-[#042A5E] hover:underline cursor-pointer"
            >
              View All 14 Projects →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Project Code &amp; Title</th>
                  <th className="py-2 px-3">PIA Agency</th>
                  <th className="py-2 px-3">Stage</th>
                  <th className="py-2 px-3">Land Req.</th>
                  <th className="py-2 px-3">SLA Watch</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {projects.slice(0, 4).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.code}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[190px]">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{p.piaAgency}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#042A5E]">
                        {p.currentStage}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-bold">{p.totalLandReqHectares} Ha</td>
                    <td className="py-2.5 px-3">
                      {p.isDelayed ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                          <Clock className="h-3 w-3" /> SLA Risk ({p.slaDaysRemaining}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> {p.slaDaysRemaining} days left
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectProject(p)}
                        className="rounded-lg bg-slate-100 hover:bg-[#042A5E] hover:text-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Legal Intelligence Side Card */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#042A5E] to-[#031B3D] p-5 text-white shadow-md space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 border-b border-white/10 pb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                DHARAA AI Legal &amp; Statutory Assistant
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              &quot;Section 3D Declaration for Pune Ring Road has 0 un-adjudicated objections remaining. Recommended for immediate Gazette publication.&quot;
            </p>
            <div className="rounded-xl bg-white/10 p-3 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-white block">Active Statutory SLA Status:</span>
              <p>• 14 Projects monitored under RFCTLARR Act 2013</p>
              <p>• 0 Gazette compliance violations</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('alerts')}
            className="w-full rounded-xl bg-amber-400 py-2 text-xs font-extrabold text-[#042A5E] hover:bg-amber-300 transition-colors cursor-pointer shadow-xs"
          >
            Ask AI Legal &amp; Document Copilot →
          </button>
        </div>
      </div>
    </div>
  )
}
