import { useState } from 'react'
import {
  FileCheck2,
  CheckCircle2,
  Download,
  ShieldCheck,
} from 'lucide-react'
import type { SiaReviewItem } from '../../types/rnr'

interface SiaCommissioningPanelProps {
  reviews: SiaReviewItem[]
  onIssueClearance: (reviewId: string) => void
}

export default function SiaCommissioningPanel({
  reviews,
  onIssueClearance,
}: SiaCommissioningPanelProps) {
  const [reviewsList, setReviewsList] = useState(reviews)
  const [successMsg, setSuccessMsg] = useState('')

  const handleClearance = (id: string) => {
    onIssueClearance(id)
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, section7ClearanceStatus: 'Clearance Issued' as const } : r
      )
    )
    setSuccessMsg('Section 7 Expert Committee Social Clearance issued successfully!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-purple-900" />
              Social Impact Assessment (SIA) &amp; Section 7 Expert Committee
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Statutory appraisal of independent Social Impact Assessment reports under Section 4 &amp; 7 of the RFCTLARR Act, 2013. Reviewing public hearing deliberations, livelihood displacement mitigation plans, and multi-disciplinary expert committee recommendations.
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-950 border border-purple-200">
            Section 7 Statutory Gate
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Reviews Dossiers */}
      <div className="space-y-4">
        {reviewsList.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-purple-900">
                    {item.projectCode}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      item.section7ClearanceStatus === 'Clearance Issued'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.section7ClearanceStatus}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{item.projectName}</h3>
                <div className="text-xs text-slate-500">
                  SIA Agency: <strong>{item.siaAgencyName}</strong> • Requiring Agency:{' '}
                  <strong>{item.requiringAgency}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Downloading full SIA report: ${item.reportDocUrl}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  SIA Dossier PDF
                </button>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Affected Families
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {item.affectedFamiliesCount} Families
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Displaced Families
                </span>
                <span className="font-bold text-purple-950 text-sm mt-0.5 block">
                  {item.displacedFamiliesCount} Families
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Public Hearing Date
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {item.publicHearingCompletedDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Recommendation
                </span>
                <span className="font-bold text-emerald-700 text-xs mt-0.5 block truncate">
                  {item.expertCommitteeRecommendation}
                </span>
              </div>
            </div>

            {/* Mitigation Conditions Summary */}
            <div className="rounded-lg bg-purple-50/60 p-3 border border-purple-100 text-xs space-y-1">
              <span className="font-bold text-purple-950 block">
                Expert Committee Mitigation Directives:
              </span>
              <p className="text-purple-900 leading-relaxed">
                {item.mitigationConditionsSummary}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                Statutory prerequisite for District Collector's Section 11 Preliminary Freeze.
              </div>

              {item.section7ClearanceStatus !== 'Clearance Issued' ? (
                <button
                  onClick={() => handleClearance(item.id)}
                  className="rounded-lg bg-purple-900 px-4 py-2 text-xs font-bold text-white hover:bg-purple-850 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Issue Section 7 Social Clearance
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Section 7 Clearance Active &amp; Forwarded to Collector
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
