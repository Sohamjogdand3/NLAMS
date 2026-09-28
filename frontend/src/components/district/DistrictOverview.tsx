import {
  GitFork,
  MapPin,
  FileCheck2,
  Coins,
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

      {/* Acquisition Pipeline Stage Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-[#042A5E]" />
              <h2 className="text-base font-bold text-slate-900">
                Statutory Acquisition Pipeline (RFCTLARR Act 2013)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live district project progression across 7 mandatory statutory stages
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('pipeline')}
            className="flex items-center gap-1.5 rounded-xl bg-[#042A5E] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors w-fit"
          >
            <span>Detailed Pipeline View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 7-Stage Pipeline Visualizer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {stages.map((stg) => (
            <div
              key={stg.stage}
              onClick={() => onNavigateTab('pipeline')}
              className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer hover:border-[#042A5E] hover:shadow-xs ${
                stg.count > 0 ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-slate-700 block truncate">
                  {stg.label}
                </span>
                <span className="text-2xl font-black text-[#042A5E] mt-1 block">
                  {stg.count}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Projects</span>
                {stg.delayedCount > 0 ? (
                  <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    {stg.delayedCount} Delayed
                  </span>
                ) : stg.count > 0 ? (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    On Track
                  </span>
                ) : (
                  <span className="text-slate-400">Idle</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 2-Column Row: Priority Projects & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority District Requisitions Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Priority District Projects & SLA Deadlines
              </h3>
              <p className="text-xs text-slate-500">
                Requisitions requiring Land Acquisition Officer (LAO) scrutiny or Section 3D declaration
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-bold text-[#042A5E] hover:underline"
            >
              View All 14 Projects →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Project Code & Title</th>
                  <th className="py-2.5 px-3">PIA Agency</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Land Req.</th>
                  <th className="py-2.5 px-3">SLA Watch</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {projects.slice(0, 4).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.code}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{p.piaAgency}</td>
                    <td className="py-3 px-3">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-[#042A5E]">
                        {p.currentStage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-bold">{p.totalLandReqHectares} Ha</td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectProject(p)}
                        className="rounded-lg bg-slate-100 hover:bg-[#042A5E] hover:text-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors"
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

        {/* Quick Action Shortcuts & AI Legal Insight Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              District Revenue Quick Actions
            </h3>

            <button
              type="button"
              onClick={() => onNavigateTab('scrutiny')}
              className="w-full flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 hover:bg-amber-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="h-5 w-5 text-amber-700" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Scrutinize PIA Proposals
                  </span>
                  <span className="text-[10px] text-slate-500">
                    3 Pending Requisitions awaiting verification
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('gis')}
              className="w-full flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 p-3 hover:bg-blue-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#042A5E]" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    District GIS Spatial Map
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Inspect 38 affected villages & parcels
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#042A5E]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('reports')}
              className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-emerald-700" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Export District MIS Reports
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Cabinet & State Revenue PDF / Excel
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* AI Legal Assistance Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#042A5E] to-[#031B3D] p-5 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                NLAMS RAG + LLM AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              &quot;Section 3D Declaration for Pune Ring Road has 0 un-adjudicated objections remaining. Recommended for immediate Gazette publication.&quot;
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('alerts')}
              className="w-full rounded-xl bg-amber-400 py-2 text-xs font-extrabold text-[#042A5E] hover:bg-amber-300 transition-colors"
            >
              Ask AI Legal &amp; Document Copilot →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
