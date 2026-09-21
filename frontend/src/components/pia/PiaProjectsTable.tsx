import { useState } from 'react'
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  AlertCircle,
  ArrowUpRight,
  Layers,
} from 'lucide-react'
import type { PiaProject } from '../../types/pia'

interface PiaProjectsTableProps {
  projects: PiaProject[]
  onSelectProject: (project: PiaProject) => void
  onOpenCreateModal: () => void
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export default function PiaProjectsTable({
  projects,
  onSelectProject,
  onOpenCreateModal,
  statusFilter,
  setStatusFilter,
}: PiaProjectsTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [localSearch, setLocalSearch] = useState<string>('')

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'draft' && p.status !== 'draft') return false
      if (statusFilter === 'under_scrutiny' && p.status !== 'under_scrutiny') return false
      if (statusFilter === 'approved' && p.status !== 'approved' && p.status !== 'possession_completed') return false
      if (statusFilter === 'clarification_required' && p.status !== 'clarification_required') return false
      if (statusFilter === 'in_progress' && p.status !== 'in_progress') return false
    }

    // Stage filter
    if (stageFilter !== 'all' && p.currentStage !== stageFilter) {
      return false
    }

    // Sector filter
    if (sectorFilter !== 'all' && p.sector !== sectorFilter) {
      return false
    }

    // Search query
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase()
      const match =
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.tehsils.some((t) => t.toLowerCase().includes(q))
      if (!match) return false
    }

    return true
  })

  return (
    <div className="space-y-5">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Project Implementing Agency (PIA) Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Managing active infrastructure corridor acquisitions across national states & districts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Cards toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <span>+ New Proposal</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by Code, Name, State, District..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#991B1B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-100"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#991B1B] focus:outline-none"
            >
              <option value="all">All Statuses ({projects.length})</option>
              <option value="draft">Draft Proposals</option>
              <option value="under_scrutiny">Under Scrutiny</option>
              <option value="clarification_required">Clarification Required</option>
              <option value="in_progress">Acquisition In Progress</option>
              <option value="approved">Possession / Completed</option>
            </select>

            {/* Stage filter dropdown */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#991B1B] focus:outline-none"
            >
              <option value="all">All Statutory Stages</option>
              <option value="Proposal">Stage 1: Proposal</option>
              <option value="Scrutiny">Stage 2: Scrutiny</option>
              <option value="Notification">Stage 3: Notification (3A/3D)</option>
              <option value="Award">Stage 4: Award (3G)</option>
              <option value="Compensation">Stage 5: Compensation (3H)</option>
              <option value="Possession">Stage 6: Possession (3E)</option>
            </select>

            {/* Sector filter */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#991B1B] focus:outline-none hidden sm:block"
            >
              <option value="all">All Sectors</option>
              <option value="Highways">Highways</option>
              <option value="Railways">Railways</option>
              <option value="Industrial Corridor">Industrial</option>
              <option value="Energy / Power">Energy / Solar</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill display */}
        {(statusFilter !== 'all' || stageFilter !== 'all' || sectorFilter !== 'all' || localSearch) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Active filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#991B1B]">
                Status: {statusFilter.replace('_', ' ')}
                <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-black">×</button>
              </span>
            )}
            {stageFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                Stage: {stageFilter}
                <button type="button" onClick={() => setStageFilter('all')} className="hover:text-black">×</button>
              </span>
            )}
            {sectorFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                Sector: {sectorFilter}
                <button type="button" onClick={() => setSectorFilter('all')} className="hover:text-black">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all')
                setStageFilter('all')
                setSectorFilter('all')
                setLocalSearch('')
              }}
              className="text-[11px] text-[#991B1B] hover:underline font-semibold"
            >
              Reset All
            </button>
            <span className="text-slate-400 ml-auto text-[11px]">
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
        )}
      </div>

      {/* View Mode: TABLE */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Project ID</th>
                  <th className="px-4 py-3.5">Project Name & Sector</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Land Required (Ha)</th>
                  <th className="px-4 py-3.5">Current Stage</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Updated</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No land acquisition projects match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      className="hover:bg-red-50/20 transition-colors cursor-pointer"
                      onClick={() => onSelectProject(proj)}
                    >
                      {/* Project ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-[#991B1B]">
                        {proj.code}
                      </td>

                      {/* Name & Sector */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block max-w-sm truncate hover:text-[#991B1B]">
                          {proj.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                            {proj.sector}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {proj.parcelsCount} parcels
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{proj.district}, {proj.state}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                          Tehsils: {proj.tehsils.join(', ')}
                        </span>
                      </td>

                      {/* Land Required */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{proj.landRequiredHa} Ha</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600"
                              style={{ width: `${Math.min(100, (proj.landAcquiredHa / proj.landRequiredHa) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {((proj.landAcquiredHa / proj.landRequiredHa) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800">
                          {proj.currentStage}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {proj.status === 'clarification_required' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-900">
                            <AlertCircle className="h-3 w-3 text-[#991B1B]" />
                            Clarification Req
                          </span>
                        ) : proj.status === 'in_progress' ? (
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-900">
                            In Progress
                          </span>
                        ) : proj.status === 'approved' || proj.status === 'possession_completed' ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900">
                            Possession Completed
                          </span>
                        ) : proj.status === 'under_scrutiny' ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                            Under Scrutiny
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {proj.lastUpdated}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectProject(proj)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#991B1B] hover:bg-red-50 transition-colors"
                        >
                          <span>Dossier</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelectProject(proj)}
            >
              <div>
                {/* Header row in card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#991B1B]">
                      {proj.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#991B1B] transition-colors mt-0.5 leading-snug">
                      {proj.name}
                    </h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shrink-0">
                    {proj.sector}
                  </span>
                </div>

                {/* Location */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{proj.district}, {proj.state}</span>
                </div>

                {/* Land Acquisition Progress Bar */}
                <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Land Acquired</span>
                    <span className="font-bold text-slate-900">
                      {proj.landAcquiredHa} / {proj.landRequiredHa} Ha
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#991B1B]"
                      style={{ width: `${Math.min(100, (proj.landAcquiredHa / proj.landRequiredHa) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    <span>{proj.parcelsCount} Cadastral Parcels</span>
                    <span className="font-semibold text-emerald-700">
                      {((proj.landAcquiredHa / proj.landRequiredHa) * 100).toFixed(1)}% Vested
                    </span>
                  </div>
                </div>

                {/* Statutory Stage & Status Badge */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-800">
                    <Layers className="h-3 w-3 text-slate-500" />
                    Stage: {proj.currentStage}
                  </span>

                  {proj.status === 'clarification_required' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-900">
                      <AlertCircle className="h-3 w-3 text-[#991B1B]" />
                      Clarification
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                      {proj.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">Updated {proj.lastUpdated.split(' ')[0]}</span>
                <span className="font-semibold text-[#991B1B] flex items-center gap-1 group-hover:underline">
                  Dossier <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
