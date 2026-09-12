import { useState } from 'react'
import type { CriticalProject, ProjectRiskLevel } from '../../types/central'
import {
  AlertTriangle,
  Clock,
  Filter,
  Eye,
  FileCheck,
} from 'lucide-react'

interface CriticalProjectsTableProps {
  projects: CriticalProject[]
  selectedStateFilter: string | null
}

export default function CriticalProjectsTable({
  projects,
  selectedStateFilter,
}: CriticalProjectsTableProps) {
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [activeModalProject, setActiveModalProject] = useState<CriticalProject | null>(null)

  // Filter projects based on agency, risk, and selected state
  const filteredProjects = projects.filter((p) => {
    if (selectedStateFilter && p.state !== selectedStateFilter) return false
    if (agencyFilter !== 'all' && p.acquiringAgency !== agencyFilter) return false
    if (riskFilter !== 'all' && p.riskLevel !== riskFilter) return false
    return true
  })

  const getRiskBadge = (risk: ProjectRiskLevel) => {
    switch (risk) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700 border border-red-200">
            <AlertTriangle className="h-3 w-3" /> Critical SLA Breach
          </span>
        )
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" /> High Delay Risk
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
            Moderate Status
          </span>
        )
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
              <AlertTriangle className="h-3.5 w-3.5" /> High-Priority Decision Support
            </span>
            {selectedStateFilter && (
              <span className="text-xs font-bold text-navy bg-navy/10 px-2 py-0.5 rounded">
                Filtered: {selectedStateFilter}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Critical &amp; Delayed Infrastructure Projects
          </h3>
          <p className="text-xs text-slate-500">
            National projects exceeding statutory section timelines requiring central intervention
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden text-xs py-1 pr-2"
            >
              <option value="all">All Agencies</option>
              <option value="NHAI">NHAI</option>
              <option value="MoRTH">MoRTH</option>
              <option value="Indian Railways">Indian Railways</option>
              <option value="NHSRCL (Bullet Train)">NHSRCL (Bullet Train)</option>
              <option value="NICDC">NICDC</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden text-xs py-1 pr-2"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Project Code &amp; Name</th>
              <th className="py-3 px-3">Agency</th>
              <th className="py-3 px-3">State / District</th>
              <th className="py-3 px-3">Current Section</th>
              <th className="py-3 px-3">Delay Days</th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No critical projects match the current state or filter criteria.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="block font-bold text-slate-900 text-xs">
                      {p.projectName}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                      {p.projectCode} • {p.totalLandAreaHa} Ha
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center rounded-md bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
                      {p.acquiringAgency}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="block font-bold text-slate-800">{p.state}</span>
                    <span className="block text-[10px] text-slate-500">{p.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {p.currentStage}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-red-700">
                      +{p.delayDays} days
                    </span>
                  </td>
                  <td className="py-3 px-3">{getRiskBadge(p.riskLevel)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveModalProject(p)}
                      className="inline-flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3 w-3" /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  National SLA Alert Detail
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeModalProject.projectName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalProject(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500">Agency</span>
                  <span className="font-bold text-navy">{activeModalProject.acquiringAgency}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500">Location</span>
                  <span className="font-bold text-slate-900">{activeModalProject.state} ({activeModalProject.district})</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500">Target Land Area</span>
                  <span className="font-bold text-slate-900">{activeModalProject.totalLandAreaHa} Hectares</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500">Compensation Budget</span>
                  <span className="font-bold text-slate-900">₹{activeModalProject.compensationBudgetCr} Cr</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-900 mb-1">Primary Operational Bottleneck:</span>
                <div className="rounded-xl bg-red-50 p-3 text-red-900 border border-red-200 font-medium">
                  {activeModalProject.primaryBottleneck}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-[11px]">
                  Target Date: <strong className="text-slate-800">{activeModalProject.targetCompletionDate}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Intervention directive sent to ${activeModalProject.state} State Revenue Secretary & CALA authority.`)
                    setActiveModalProject(null)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-800 cursor-pointer"
                >
                  <FileCheck className="h-3.5 w-3.5" /> Issue Central Directive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
