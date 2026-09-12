import type { SlaAlert } from '../../types/central'
import { AlertCircle, ChevronRight } from 'lucide-react'

interface SlaAlertsWidgetProps {
  alerts: SlaAlert[]
  onAcknowledge?: (alertId: string) => void
}

export default function SlaAlertsWidget({
  alerts,
  onAcknowledge,
}: SlaAlertsWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
              <AlertCircle className="h-3.5 w-3.5" /> Statutory SLA Monitoring
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            Section Statutory Deadline Breaches
          </h3>
        </div>
        <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
          {alerts.length} Active Alerts
        </span>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {alerts.map((alertItem) => {
          const isCritical = alertItem.severity === 'critical'

          return (
            <div
              key={alertItem.id}
              className={`rounded-xl p-3.5 border transition-all ${
                isCritical
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-amber-200 bg-amber-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                    {alertItem.sectionName}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    {alertItem.projectName}
                  </h4>
                </div>
                <span className="shrink-0 font-extrabold text-xs text-red-700 bg-white px-2 py-0.5 rounded border border-red-200 shadow-2xs">
                  +{alertItem.daysOverdue} Days Overdue
                </span>
              </div>

              <p className="text-[11px] text-slate-600 font-medium mb-2 leading-relaxed">
                {alertItem.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-2">
                <span>
                  Location: <strong className="text-slate-800">{alertItem.state} ({alertItem.district})</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onAcknowledge && onAcknowledge(alertItem.id)}
                  className="font-bold text-navy hover:text-red-700 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Escalate to Secretary</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
