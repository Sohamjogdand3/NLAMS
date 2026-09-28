import { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { DistrictProject, AcquisitionStage } from '../../types/district'

interface DistrictPipelineTrackerProps {
  projects: DistrictProject[]
  onSelectProject: (project: DistrictProject) => void
}

export default function DistrictPipelineTracker({
  projects,
  onSelectProject,
}: DistrictPipelineTrackerProps) {
  const [selectedStage, setSelectedStage] = useState<AcquisitionStage | 'all'>('all')

  const stageDefinitions: {
    stage: AcquisitionStage
    title: string
    actSection: string
    description: string
  }[] = [
    { stage: 'Proposal', title: '1. Proposal Submission', actSection: 'Sec 4(1) PFR Requisition', description: 'PIA submits acquisition proposal & draft land schedule' },
    { stage: 'Scrutiny', title: '2. LAO Scrutiny & SIA', actSection: 'Sec 4 & Sec 8 SIA Study', description: 'Revenue Dept verifies 7/12 extracts & Social Impact Assessment' },
    { stage: 'Notification', title: '3. Gazette Notifications', actSection: 'Sec 11 & Sec 19 Final', description: 'Preliminary Section 11 & Final Declaration Section 19' },
    { stage: 'Award', title: '4. Award Determination', actSection: 'Sec 23 Award Hearing', description: 'Collector/LAO determines market value & 100% solatium' },
    { stage: 'Compensation', title: '5. Compensation Disbursal', actSection: 'Sec 30 DBT / Escrow', description: 'Direct bank transfer to verified landowners via PFMS' },
    { stage: 'R&R', title: '6. Resettlement & Rehab', actSection: 'Sec 31 R&R Package', description: 'Allotment of housing sites, jobs or annuity compensation' },
    { stage: 'Possession', title: '7. Possession Handover', actSection: 'Sec 38 Possession', description: 'Clear land handed over to PIA; revenue mutation completed' },
  ]

  const filteredProjects = projects.filter((p) => {
    if (selectedStage === 'all') return true
    return p.currentStage === selectedStage
  })

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-white">
              RFCTLARR Act 2013 Workflow
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              7 Sequential Statutory Stages
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            District Land Acquisition Pipeline Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click any stage below to filter projects, track SLA bottlenecks, and review pending revenue actions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedStage('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
            selectedStage === 'all'
              ? 'bg-[#042A5E] text-white border-[#042A5E]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          View All Stages ({projects.length})
        </button>
      </div>

      {/* 7 Interactive Stage Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {stageDefinitions.map((def) => {
          const stageProjects = projects.filter((p) => p.currentStage === def.stage)
          const delayedCount = stageProjects.filter((p) => p.isDelayed).length
          const isSelected = selectedStage === def.stage

          return (
            <div
              key={def.stage}
              onClick={() => setSelectedStage(def.stage)}
              className={`rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#042A5E] text-white border-[#042A5E] shadow-md ring-2 ring-blue-300'
                  : stageProjects.length > 0
                  ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                    isSelected ? 'text-amber-400' : 'text-slate-500'
                  }`}
                >
                  {def.actSection}
                </span>
                <h3
                  className={`text-xs font-extrabold mt-1 leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {def.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                <span
                  className={`text-2xl font-black ${
                    isSelected ? 'text-amber-400' : 'text-[#042A5E]'
                  }`}
                >
                  {stageProjects.length}
                </span>
                {delayedCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-700 text-white px-1.5 py-0.5 rounded">
                    {delayedCount} Delayed
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Stage Projects Table View */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            {selectedStage === 'all'
              ? 'All Projects in Acquisition Pipeline'
              : `Projects Currently at Stage: ${selectedStage}`}
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredProjects.length} Projects Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Project Code &amp; Name</th>
                <th className="py-3 px-4">Acquiring Agency</th>
                <th className="py-3 px-4">Land Area</th>
                <th className="py-3 px-4">Statutory SLA Status</th>
                <th className="py-3 px-4">Current Pending Action</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{p.code}</span>
                      <span className="text-xs text-slate-600 truncate max-w-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{p.piaAgency}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{p.totalLandReqHectares} Ha</td>
                  <td className="py-3.5 px-4">
                    {p.isDelayed ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                        <AlertTriangle className="h-3 w-3" /> Delayed ({p.slaDaysRemaining}d)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> SLA On Track
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {p.pendingActionRemark || 'Awaiting statutory approval'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectProject(p)}
                      className="rounded-lg bg-[#042A5E] text-white hover:bg-slate-800 px-3 py-1 text-xs font-bold transition-colors"
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
