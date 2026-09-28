import { useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  History,
  FileText,
} from 'lucide-react'
import type { AuditLogEntry } from '../../types/district'
import { MOCK_AUDIT_LOGS } from '../../data/mockDistrictData'

export default function DistrictReportsAudit() {
  const [auditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-white">
              District MIS &amp; Audit Governance
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Immutable Revenue Trail
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            District MIS Reports &amp; Activity Audit Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export automated land acquisition MIS summaries for State Revenue Dept &amp; audit all official decisions
          </p>
        </div>
      </div>

      {/* 2-Column Grid: MIS Reports Generator & Audit Log Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: District MIS Export Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Automated MIS Reports Generator
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#042A5E] text-xs">District Monthly Progress Summary</span>
                  <FileText className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-[11px] text-slate-600">
                  Comprehensive PDF report covering all 14 active projects, land acquired in hectares, and Section 3D/3G gazette notifications.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Generating District Monthly Progress PDF...')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#042A5E] text-white py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download District Report (PDF)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs">Compensation &amp; DBT Disbursal Matrix</span>
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                </div>
                <p className="text-[11px] text-slate-600">
                  Detailed Excel sheet with landowner bank account verification, PFMS transaction references, and escrow balances.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Exporting Compensation DBT Matrix (Excel)...')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 text-white py-2 text-xs font-bold hover:bg-emerald-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Compensation Sheet (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timestamped Revenue Audit Trail */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-[#042A5E]">
              <History className="h-5 w-5" />
              <h3 className="text-sm font-bold">District Revenue Official Audit Log</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {auditLogs.length} Logged Actions
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{log.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-700">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>User: <strong className="text-slate-800">{log.user}</strong> ({log.role})</span>
                  <span className="font-bold text-[#042A5E]">Project: {log.targetProject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
