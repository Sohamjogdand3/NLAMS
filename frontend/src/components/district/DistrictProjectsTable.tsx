import { useState } from 'react'
import {
  Search,
  Filter,
  Eye,
  FileCheck2,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react'
import type { DistrictProject } from '../../types/district'

interface DistrictProjectsTableProps {
  projects: DistrictProject[]
  onSelectProject: (project: DistrictProject) => void
  onOpenScrutiny?: (project: DistrictProject) => void
}

export default function DistrictProjectsTable({
  projects,
  onSelectProject,
  onOpenScrutiny,
}: DistrictProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.piaAgency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tehsil.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = stageFilter === 'all' || p.currentStage === stageFilter
    const matchesSector = sectorFilter === 'all' || p.sector === sectorFilter

    return matchesSearch && matchesStage && matchesSector
  })

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search district projects by code, name, agency or tehsil..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:border-[#042A5E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-100"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-[#042A5E] focus:outline-none"
            >
              <option value="all">All Statutory Stages</option>
              <option value="Proposal">Stage 1: Proposal</option>
              <option value="Scrutiny">Stage 2: Scrutiny</option>
              <option value="Notification">Stage 3: Notification</option>
              <option value="Award">Stage 4: Award</option>
              <option value="Compensation">Stage 5: Compensation</option>
              <option value="R&R">Stage 6: R&R</option>
              <option value="Possession">Stage 7: Possession</option>
            </select>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-[#042A5E] focus:outline-none"
            >
              <option value="all">All Infrastructure Sectors</option>
              <option value="Highways & Expressways">Highways & Expressways</option>
              <option value="Railways & Freight">Railways & Freight</option>
              <option value="Industrial Parks">Industrial Parks</option>
              <option value="High Speed Rail">High Speed Rail</option>
              <option value="Expressways">Expressways</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredProjects.length} of {projects.length} Projects
          </span>
        </div>
      </div>

      {/* Main District Projects Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Project Code &amp; Title</th>
                <th className="py-3 px-4">PIA Agency &amp; Tehsil</th>
                <th className="py-3 px-4">Statutory Stage</th>
                <th className="py-3 px-4">Land Req. (Ha)</th>
                <th className="py-3 px-4">Compensation (Cr)</th>
                <th className="py-3 px-4">SLA Watch</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{p.code}</span>
                      <span className="text-xs text-slate-600 truncate max-w-xs">{p.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{p.sector}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{p.piaAgency}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" /> Tehsil: {p.tehsil}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-[#042A5E]">
                      {p.currentStage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900">{p.totalLandReqHectares} Ha</span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {p.acquiredHectares} Ha Acquired
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900">₹{p.totalCompensationCr} Cr</span>
                      <span className="text-[10px] text-blue-700 font-bold">
                        ₹{p.disbursedCompensationCr} Cr Disbursed
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {p.isDelayed ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                        <Clock className="h-3 w-3" /> Overdue ({p.slaDaysRemaining}d)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> {p.slaDaysRemaining} days remaining
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.currentStage === 'Scrutiny' && onOpenScrutiny && (
                        <button
                          type="button"
                          onClick={() => onOpenScrutiny(p)}
                          className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#042A5E] px-2.5 py-1.5 text-xs font-extrabold shadow-2xs transition-colors"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" />
                          <span>Scrutinize</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectProject(p)}
                        className="flex items-center gap-1 rounded-lg bg-[#042A5E] hover:bg-slate-800 text-white px-2.5 py-1.5 text-xs font-bold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect Dossier</span>
                      </button>
                    </div>
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
