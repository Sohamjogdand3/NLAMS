import type { AiRiskInsight } from '../../types/central'
import { Sparkles, BrainCircuit, ArrowUpRight, ShieldAlert } from 'lucide-react'

interface AiRiskWidgetProps {
  insights: AiRiskInsight[]
}

export default function AiRiskWidget({ insights }: AiRiskWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-600" /> AI Predictive Intelligence
            </span>
            <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100/60 px-2 py-0.5 rounded">
              NLAMS Risk Engine v2.4
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            Corridor Delay-Risk &amp; Bottleneck Forecasting
          </h3>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="space-y-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Sparkles className="h-3 w-3" /> {item.riskCategory}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">
                  {item.corridorName}
                </h4>
              </div>

              <div className="text-right shrink-0">
                <span className="block font-black text-xs text-indigo-900">
                  {item.confidencePercentage}% AI Confidence
                </span>
                <span className="block text-[10px] font-extrabold text-red-600 mt-0.5">
                  +{item.predictedDelayDays} Days Delay Forecast
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium mb-3 leading-relaxed">
              {item.impactSummary}
            </p>

            <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  Recommended Intervention: <strong className="text-slate-900">{item.recommendedIntervention}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => alert(`Initiating central intervention proposal for: ${item.corridorName}`)}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer ml-2"
              >
                <span>Initiate</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
