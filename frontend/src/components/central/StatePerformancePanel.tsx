import type { StateAcquisitionProgress } from '../../types/central'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface StatePerformancePanelProps {
  statesData: StateAcquisitionProgress[]
  selectedState: StateAcquisitionProgress | null
  onSelectState: (state: StateAcquisitionProgress | null) => void
}

export default function StatePerformancePanel({
  statesData,
  selectedState,
  onSelectState,
}: StatePerformancePanelProps) {
  // Sort states by completion percentage descending
  const sortedStates = [...statesData].sort(
    (a, b) => b.completionPercentage - a.completionPercentage
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" /> State Performance Directory
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            State-Wise Acquisition Leaderboard
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {statesData.length} Major States Tracked
        </span>
      </div>

      {/* State List with Progress Bars */}
      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {sortedStates.map((st) => {
          const isSelected = selectedState?.stateCode === st.stateCode

          return (
            <div
              key={st.stateCode}
              onClick={() => onSelectState(isSelected ? null : st)}
              className={`group rounded-xl p-3.5 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-navy bg-navy/5 shadow-xs'
                  : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-navy text-[10px] font-extrabold text-white">
                    {st.stateCode}
                  </span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-navy transition-colors">
                    {st.stateName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-900">
                    {st.completionPercentage}%
                  </span>
                  {st.pendingSlaBreaches > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100" title={`${st.pendingSlaBreaches} SLA breaches`}>
                      <AlertCircle className="h-3 w-3" /> {st.pendingSlaBreaches}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    st.completionPercentage >= 80
                      ? 'bg-emerald-600'
                      : st.completionPercentage >= 65
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${st.completionPercentage}%` }}
                />
              </div>

              {/* Bottom Metrics */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{st.activeProjects} Projects</span>
                <span>
                  {st.acquiredHectares.toLocaleString()} / {st.totalTargetHectares.toLocaleString()} Ha
                </span>
                <span className="font-semibold text-slate-700">
                  ₹{(st.compensationDisbursedCr / 1000).toFixed(1)}k Cr Disbursed
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
