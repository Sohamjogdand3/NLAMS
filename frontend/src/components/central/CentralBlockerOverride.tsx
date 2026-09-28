import { useState } from 'react'
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
} from 'lucide-react'

interface BlockerItem {
  id: string
  projectCode: string
  projectName: string
  state: string
  district: string
  blockerType: 'Inter-Departmental Deadlock' | 'Court Stay on Section 11' | 'Forest Clearance Delay (>180d)' | 'Gram Sabha Resolution Dispute'
  delayDays: number
  statutoryStage: string
  assignedAuthority: string
  status: 'Critical Active' | 'Escalated to PMO' | 'Section 25 Intervened'
}

export default function CentralBlockerOverride() {
  const [blockers, setBlockers] = useState<BlockerItem[]>([
    {
      id: 'BLK-001',
      projectCode: 'NHAI-MH-DEL-MUM-EXPR',
      projectName: 'Delhi-Mumbai Expressway (Palghar Section)',
      state: 'Maharashtra',
      district: 'Palghar',
      blockerType: 'Forest Clearance Delay (>180d)',
      delayDays: 210,
      statutoryStage: 'Section 11 Preliminary Freeze',
      assignedAuthority: 'State Revenue & Forest Department',
      status: 'Critical Active',
    },
    {
      id: 'BLK-002',
      projectCode: 'DFCCIL-WDFC-PH2',
      projectName: 'Western Dedicated Freight Corridor (Vadodara-JNPT)',
      state: 'Gujarat / Maharashtra',
      district: 'Navsari & Valsad',
      blockerType: 'Inter-Departmental Deadlock',
      delayDays: 145,
      statutoryStage: 'Section 19 Final Declaration',
      assignedAuthority: 'State Revenue Secretary',
      status: 'Critical Active',
    },
    {
      id: 'BLK-003',
      projectCode: 'NHAI-PUN-RING-01',
      projectName: 'Pune Outer Ring Road (East Package 1)',
      state: 'Maharashtra',
      district: 'Pune (Haveli)',
      blockerType: 'Gram Sabha Resolution Dispute',
      delayDays: 92,
      statutoryStage: 'SIA Expert Committee Sign-Off',
      assignedAuthority: 'District Collector Pune',
      status: 'Escalated to PMO',
    },
  ])

  const [selectedBlocker, setSelectedBlocker] = useState<BlockerItem | null>(null)
  const [interventionNote, setInterventionNote] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBlocker) return

    setBlockers((prev) =>
      prev.map((b) =>
        b.id === selectedBlocker.id
          ? {
              ...b,
              status: 'Section 25 Intervened' as const,
            }
          : b
      )
    )

    setSuccessMsg(
      `Central Executive Directive issued for ${selectedBlocker.projectCode}. Chief Secretary & District Magistrate notified with 14-day statutory resolution timeline.`
    )
    setSelectedBlocker(null)
    setInterventionNote('')
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Executive Override Header */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-[#991B1B] via-[#7F1D1D] to-[#991B1B] p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase border border-amber-400/30">
                National Executive Authority
              </span>
              <span className="text-xs text-red-200">• PMO &amp; Cabinet Committee on Infrastructure</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
              Statutory Blocker Override &amp; Fast-Track Interventions
            </h1>
            <p className="text-xs text-red-100 max-w-2xl">
              High-level central interventions under RFCTLARR Act Section 25 (Urgency Provisions) &amp; Section 10A (Exemptions for National Defense and Strategic Infrastructure Corridors). Resolving inter-state deadlocks and issuing binding Chief Secretary directives.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Active Critical Blockers List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Critical National Infrastructure Blockers ({blockers.length})
          </h3>
          <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            {blockers.filter((b) => b.status === 'Critical Active').length} Active Deadlocks
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {blockers.map((b) => (
            <div key={b.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#042A5E]">
                      {b.projectCode}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        b.status === 'Critical Active'
                          ? 'bg-red-100 text-red-800'
                          : b.status === 'Escalated to PMO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {b.blockerType}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{b.projectName}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-[11px] text-slate-600 mt-2">
                    <div>
                      <span className="text-slate-400">Jurisdiction: </span>
                      <strong className="text-slate-800">
                        {b.district}, {b.state}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Bottleneck Stage: </span>
                      <strong className="text-slate-800">{b.statutoryStage}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Delay Duration: </span>
                      <strong className="text-red-700">{b.delayDays} Days Delayed</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.status !== 'Section 25 Intervened' ? (
                    <button
                      onClick={() => setSelectedBlocker(b)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <Zap className="h-4 w-4 text-amber-300" />
                      Executive Override &rarr;
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="h-4 w-4" />
                      Directive Active (14d SLA)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Override Action Modal */}
      {selectedBlocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleApplyOverride}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Central Executive Intervention (Section 25 / 10A)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlocker(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-red-50 p-3 space-y-1 border border-red-100">
                <div className="font-mono font-bold text-red-900">{selectedBlocker.projectCode}</div>
                <div className="font-bold text-slate-900">{selectedBlocker.projectName}</div>
                <div className="text-[11px] text-slate-600">
                  Blocker: <strong>{selectedBlocker.blockerType}</strong> • Delayed for{' '}
                  <strong>{selectedBlocker.delayDays} days</strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Statutory Urgency Mandate
                </label>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none">
                  <option value="Sec25">RFCTLARR Section 25 (Urgency Fast-Track 30-day SLA)</option>
                  <option value="Sec10A">Section 10A (Strategic National Corridor Exemption)</option>
                  <option value="Sec3g">NH Act Section 3(g) Binding Arbitrator Expedited Bench</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Executive Directive &amp; Compliance Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={interventionNote}
                  onChange={(e) => setInterventionNote(e.target.value)}
                  placeholder="Enter binding directive text for State Chief Secretary and District Magistrate..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedBlocker(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 cursor-pointer shadow-xs"
              >
                Dispatch Executive Order &rarr;
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
