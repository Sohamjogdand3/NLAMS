import { useState, useEffect } from 'react'
import {
  getWorkflowAuditLogs,
  type WorkflowAuditLog,
} from '../../utils/auditLogger'
import {
  Clock,
  ShieldCheck,
  FileText,
  Building2,
  ArrowRight,
  Download,
  Filter,
} from 'lucide-react'

const MATRIX_STEPS = [
  {
    step: 1,
    workItem: 'Proposal Ingestion',
    originating: 'PIA Agency Desk',
    receiving: 'State Revenue Nodal',
    artifact: 'Requisition File & KML Alignment',
    status: 'COMPLETED',
  },
  {
    step: 2,
    workItem: 'Scrutiny & CALA Order',
    originating: 'State Revenue Nodal',
    receiving: 'District Collector Desk',
    artifact: 'Sec 3(a) Gazette Order',
    status: 'COMPLETED',
  },
  {
    step: 3,
    workItem: 'SIA Study & Expert Gate',
    originating: 'District Collector Desk',
    receiving: 'Expert Committee Desk',
    artifact: 'Social Impact Ledger',
    status: 'COMPLETED',
  },
  {
    step: 4,
    workItem: 'Sec 11 Freeze & Objections',
    originating: 'District Collector Desk',
    receiving: 'Citizen Portal',
    artifact: 'Form-II Gazette Notice & API Lock',
    status: 'COMPLETED',
  },
  {
    step: 5,
    workItem: 'Field Geotag Audit',
    originating: 'Field Surveyor App',
    receiving: 'District LAO Desk',
    artifact: 'Geotagged Asset Photos & GPS Bounds',
    status: 'COMPLETED',
  },
  {
    step: 6,
    workItem: 'Award Valuation',
    originating: 'District LAO Desk',
    receiving: 'Citizen & R&R Desks',
    artifact: 'RFCTLARR Sec 23 Statutory Award',
    status: 'IN_PROGRESS',
  },
  {
    step: 7,
    workItem: 'Claim Verification',
    originating: 'Citizen Portal',
    receiving: 'District LAO Desk',
    artifact: 'Title Verification Certificate',
    status: 'PENDING',
  },
  {
    step: 8,
    workItem: 'Disbursement & Handover',
    originating: 'R&R Admin Desk',
    receiving: 'PIA & Central Desks',
    artifact: 'PFMS DBT Payout & Title Mutation',
    status: 'PENDING',
  },
]

export default function WorkflowMatrixAuditComponent() {
  const [logs, setLogs] = useState<WorkflowAuditLog[]>([])
  const [selectedStepFilter, setSelectedStepFilter] = useState<number | 'ALL'>('ALL')

  const reloadLogs = () => {
    setLogs(getWorkflowAuditLogs())
  }

  useEffect(() => {
    reloadLogs()
    const interval = setInterval(reloadLogs, 3000)
    return () => clearInterval(interval)
  }, [])

  const filteredLogs = selectedStepFilter === 'ALL' 
    ? logs 
    : logs.filter((l) => l.step === selectedStepFilter)

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-white">
              STATUTORY WORKFLOW MATRIX
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Cryptographic Audit Chain Active
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            📊 Summary Dashboard Flow Matrix & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end statutory land acquisition workflow matrix and cross-dashboard real-time transaction ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Exporting Statutory Audit Dossier (PDF)...')}
          className="flex items-center gap-1.5 rounded-xl bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Full Audit Dossier</span>
        </button>
      </div>

      {/* 8-Step Summary Flow Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#042A5E]" />
            <h3 className="text-sm font-bold text-slate-900">8-Step LAP Statutory Workflow Execution Matrix</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">8 Sequential Legal Stages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Step</th>
                <th className="py-2.5 px-3">Work Item</th>
                <th className="py-2.5 px-3">Originating Dashboard</th>
                <th className="py-2.5 px-3">Receiving Dashboard</th>
                <th className="py-2.5 px-3">Output Artifact Produced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MATRIX_STEPS.map((row) => (
                <tr key={row.step} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#042A5E] text-white text-[11px] font-bold">
                      {row.step}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{row.workItem}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-blue-50 border border-blue-200 text-blue-900 px-2 py-0.5 text-[11px] font-semibold">
                      {row.originating}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 w-fit">
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      {row.receiving}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-0.5 text-[11px] font-bold flex items-center gap-1 w-fit">
                      <FileText className="h-3 w-3 text-emerald-600" />
                      {row.artifact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Audit Logs Stream */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#042A5E]" />
            <h3 className="text-sm font-bold text-slate-900">Real-Time Cross-Dashboard Audit Logs</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {filteredLogs.length} Entries
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Step:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStepFilter('ALL')}
              className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                selectedStepFilter === 'ALL'
                  ? 'bg-[#042A5E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStepFilter(s)}
                className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedStepFilter === s
                    ? 'bg-[#042A5E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                S{s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#042A5E] text-white text-[10px] font-black shrink-0">
                    S{log.step}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                    {log.targetProject}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 shrink-0">{log.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">FLOW ORIGIN ➔ RECEIVER</span>
                  <span className="font-semibold text-slate-700">
                    {log.originatingDashboard} ➔ {log.receivingDashboard}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">OUTPUT ARTIFACT</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                    📄 {log.outputArtifact}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">EXECUTED BY</span>
                  <span className="font-medium text-slate-800">
                    {log.user} ({log.role})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200/80">
                "{log.details}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
