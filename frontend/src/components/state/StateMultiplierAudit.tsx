import { useState } from 'react'
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'
import type { MultiplierComplianceRecord } from '../../types/stateNodal'

interface StateMultiplierAuditProps {
  records: MultiplierComplianceRecord[]
}

export default function StateMultiplierAudit({ records }: StateMultiplierAuditProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Compliant' | 'Under-Assessed Risk'>(
    'ALL'
  )

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.districtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tehsilName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = statusFilter === 'ALL' || r.complianceStatus === statusFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#042A5E]" />
              RFCTLARR Schedule I Multiplier Compliance Audit
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Verification of distance-based multiplier factors applied to baseline market values across urban (1.0x) and rural (1.25x – 2.0x) zones in accordance with Department of Land Resources (DoLR) notification &amp; State Revenue Rules.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Statutory Bracket</div>
            <div className="text-xs font-black text-[#042A5E] mt-0.5">Factor: 1.00x – 2.00x</div>
          </div>
        </div>
      </div>

      {/* Statutory Formula Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Urban Area</span>
          <div className="text-sm font-black text-slate-900 mt-0.5">1.00x Multiplier</div>
          <p className="text-[10px] text-slate-500 mt-1">Within municipal corporation boundaries</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Semi-Urban (0–10 km)</span>
          <div className="text-sm font-black text-slate-900 mt-0.5">1.25x Multiplier</div>
          <p className="text-[10px] text-slate-500 mt-1">Buffer zone from urban limits</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Rural (10–20 km)</span>
          <div className="text-sm font-black text-slate-900 mt-0.5">1.50x – 1.75x Multiplier</div>
          <p className="text-[10px] text-slate-500 mt-1">Agricultural rural belts</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Deep Rural (&gt;20 km)</span>
          <div className="text-sm font-black text-emerald-800 mt-0.5">2.00x Multiplier</div>
          <p className="text-[10px] text-slate-500 mt-1">Maximum statutory rural compensation</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search district, tehsil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="Compliant">Compliant Only</option>
              <option value="Under-Assessed Risk">Under-Assessed Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">District / Tehsil</th>
                <th className="px-4 py-3">Zone Classification</th>
                <th className="px-4 py-3 text-center">Distance from Urban</th>
                <th className="px-4 py-3 text-center">Mandated Factor</th>
                <th className="px-4 py-3 text-center">Applied Factor</th>
                <th className="px-4 py-3 text-center">Audit Status</th>
                <th className="px-4 py-3 text-right">Audit Officer / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{rec.districtName}</div>
                    <div className="text-[11px] text-slate-500">{rec.tehsilName}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {rec.zoneType}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {rec.statutoryDistanceKm} km
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-black text-[#042A5E]">
                      {rec.mandatedMultiplierFactor.toFixed(2)}x
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-mono font-black ${
                        rec.actualAppliedMultiplier < rec.mandatedMultiplierFactor
                          ? 'text-red-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {rec.actualAppliedMultiplier.toFixed(2)}x
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {rec.complianceStatus === 'Compliant' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-800">
                        <AlertTriangle className="h-3 w-3" />
                        Under-Assessed
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="text-[11px] font-bold text-slate-800">
                      {rec.auditingOfficer}
                    </div>
                    <div className="text-[10px] text-slate-400">{rec.lastAuditedDate}</div>
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
