import { useState } from 'react'
import {
  CheckCircle2,
  Download,
  Building2,
  FileCheck2,
} from 'lucide-react'
import { MOCK_RFCTLARR_VALUATIONS } from '../../data/mockDistrictData'
import type { RfctlarrValuationItem } from '../../types/district'

interface DistrictValuationCalculatorProps {
  onAwardApproved?: (valuationId: string) => void
}

export default function DistrictValuationCalculator({
  onAwardApproved,
}: DistrictValuationCalculatorProps) {
  const [valuations, setValuations] = useState<RfctlarrValuationItem[]>(MOCK_RFCTLARR_VALUATIONS)
  const [selectedValuationId, setSelectedValuationId] = useState<string>(valuations[0]?.id || '')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Interactive Live Calculator Form State
  const activeVal = valuations.find((v) => v.id === selectedValuationId) || valuations[0]

  const [areaSqM, setAreaSqM] = useState<number>(activeVal?.acquiredAreaSqM || 4200)
  const [circleRate, setCircleRate] = useState<number>(activeVal?.circleRatePerSqM || 450)
  const [subRegistrarRate, setSubRegistrarRate] = useState<number>(activeVal?.subRegistrarAvgRatePerSqM || 520)
  const [regionalMultiplier, setRegionalMultiplier] = useState<number>(activeVal?.regionalMultiplier || 1.5)
  const [structuresVal, setStructuresVal] = useState<number>(activeVal?.structuresValuation || 450000)
  const [treesVal, setTreesVal] = useState<number>(activeVal?.treesValuation || 180000)
  const [interestMonths, setInterestMonths] = useState<number>(12) // months from Sec 11 to award

  // Calculations adhering to RFCTLARR Act 2013 (First Schedule)
  const chosenBaselineRate = Math.max(circleRate, subRegistrarRate)
  const baselineLandValue = areaSqM * chosenBaselineRate
  const multipliedLandValue = baselineLandValue * regionalMultiplier
  const solatiumAmount = multipliedLandValue * 1.0 // 100% Solatium (Sec 30(1))
  const additionalInterestAmount = (baselineLandValue * 0.12 * (interestMonths / 12)) // 12% p.a. (Sec 30(3))
  const totalAwardAmount = multipliedLandValue + solatiumAmount + additionalInterestAmount + structuresVal + treesVal

  // Sync inputs when selecting another valuation from the list
  const handleSelectValuation = (val: RfctlarrValuationItem) => {
    setSelectedValuationId(val.id)
    setAreaSqM(val.acquiredAreaSqM)
    setCircleRate(val.circleRatePerSqM)
    setSubRegistrarRate(val.subRegistrarAvgRatePerSqM)
    setRegionalMultiplier(val.regionalMultiplier)
    setStructuresVal(val.structuresValuation)
    setTreesVal(val.treesValuation)
  }

  const handleApproveAward = (valId: string) => {
    setValuations((prev) =>
      prev.map((v) =>
        v.id === valId ? { ...v, status: 'CALA_Approved', totalCalculatedAward: totalAwardAmount } : v
      )
    )
    if (onAwardApproved) onAwardApproved(valId)
    setToastMessage(`Statutory Award Order signed for Khasra ${activeVal.khasraNo}! Ready for PFMS Escrow payout.`)
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="space-y-5">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="rounded-xl bg-slate-900 text-white p-3.5 shadow-xl flex items-center justify-between animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-white">
              RFCTLARR Act 2013 · First Schedule Engine
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Sec 26 to Sec 30 Statutory Computation
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Automated Statutory Compensation Valuation Engine
          </h2>
          <p className="text-xs text-slate-500">
            Computes baseline rate, applies distance multiplier factor (1.0x–2.0x), mandates 100% Solatium, and adds 12% p.a. interest.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert(`Exporting PFMS statutory award batch schedule for ${activeVal.projectCode}...`)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export PFMS Award Batch</span>
        </button>
      </div>

      {/* Main Grid: Item Selector & Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Khasra Parcel Queue (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Khasra Parcels for Valuation ({valuations.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Select to inspect</span>
          </div>

          <div className="space-y-2.5">
            {valuations.map((val) => (
              <div
                key={val.id}
                onClick={() => handleSelectValuation(val)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedValuationId === val.id
                    ? 'border-[#042A5E] bg-blue-50/50 ring-2 ring-blue-200 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#042A5E]">{val.khasraNo}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${
                      val.status === 'CALA_Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : val.status === 'Computed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {val.status === 'CALA_Approved' ? 'CALA Signed' : val.status}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 mt-1 truncate">{val.ownerName}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{val.village} · {val.acquiredAreaSqM.toLocaleString()} sq.m</span>
                  <span className="font-bold text-slate-900">{formatINR(val.totalCalculatedAward)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Statutory Calculation Breakdown (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {activeVal.khasraNo} — {activeVal.ownerName}
                </h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {activeVal.village} ({activeVal.projectCode})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Statutory award sheet computed under Section 26, 27, 28, 29 &amp; 30 of RFCTLARR Act 2013
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApproveAward(activeVal.id)}
                className="rounded-xl bg-[#042A5E] hover:bg-[#031B3D] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sign Award Order</span>
              </button>
            </div>
          </div>

          {/* Interactive Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block">Acquired Area (sq.m)</label>
              <input
                type="number"
                value={areaSqM}
                onChange={(e) => setAreaSqM(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#042A5E]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block">Circle Rate (₹/sq.m)</label>
              <input
                type="number"
                value={circleRate}
                onChange={(e) => setCircleRate(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#042A5E]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block">Sub-Registrar Deeds (₹/sq.m)</label>
              <input
                type="number"
                value={subRegistrarRate}
                onChange={(e) => setSubRegistrarRate(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#042A5E]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block">Multiplier (1.0x-2.0x)</label>
              <select
                value={regionalMultiplier}
                onChange={(e) => setRegionalMultiplier(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#042A5E] cursor-pointer"
              >
                <option value={1.0}>1.0x — Urban</option>
                <option value={1.25}>1.25x — Rural (0-10km)</option>
                <option value={1.5}>1.5x — Rural (10-20km)</option>
                <option value={1.75}>1.75x — Rural (20-30km)</option>
                <option value={2.0}>2.0x — Deep Rural</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block">Interest Period (Months)</label>
              <input
                type="number"
                value={interestMonths}
                onChange={(e) => setInterestMonths(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#042A5E]"
              />
            </div>
          </div>

          {/* Statutory Step-by-Step Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Statutory Component</th>
                  <th className="py-2 px-3">Legal Basis</th>
                  <th className="py-2 px-3">Formula / Factor Applied</th>
                  <th className="py-2 px-3 text-right">Computed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Baseline Market Value</td>
                  <td className="py-2.5 px-3 text-slate-500">Sec 26(1)</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    Max(Circle Rate: ₹{circleRate}, Deeds: ₹{subRegistrarRate}) × {areaSqM.toLocaleString()} sq.m
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">{formatINR(baselineLandValue)}</td>
                </tr>

                <tr className="hover:bg-slate-50 bg-blue-50/20">
                  <td className="py-2.5 px-3 font-bold text-[#042A5E]">Multiplied Market Value</td>
                  <td className="py-2.5 px-3 text-slate-500">First Schedule</td>
                  <td className="py-2.5 px-3 text-[#042A5E]">
                    Baseline Land Value × {regionalMultiplier}x Regional Distance Factor
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#042A5E]">{formatINR(multipliedLandValue)}</td>
                </tr>

                <tr className="hover:bg-slate-50 bg-emerald-50/20">
                  <td className="py-2.5 px-3 font-bold text-emerald-800">100% Solatium</td>
                  <td className="py-2.5 px-3 text-slate-500">Sec 30(1)</td>
                  <td className="py-2.5 px-3 text-emerald-700">100% on Total Market Value</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-800">+{formatINR(solatiumAmount)}</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Additional 12% p.a. Interest</td>
                  <td className="py-2.5 px-3 text-slate-500">Sec 30(3)</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    12% per annum from Sec 11 date ({interestMonths} months elapsed)
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">+{formatINR(additionalInterestAmount)}</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Structures &amp; Assets Valuation</td>
                  <td className="py-2.5 px-3 text-slate-500">Sec 29(1)</td>
                  <td className="py-2.5 px-3 text-slate-600">PWD Certified valuation of tubewells, sheds &amp; walls</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">+{formatINR(structuresVal)}</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Trees &amp; Standing Crops</td>
                  <td className="py-2.5 px-3 text-slate-500">Sec 29(2)</td>
                  <td className="py-2.5 px-3 text-slate-600">Horticulture/Forest timber &amp; fruit-bearing tree yield</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">+{formatINR(treesVal)}</td>
                </tr>

                {/* Total Award Row */}
                <tr className="bg-slate-900 text-white font-black text-sm">
                  <td className="py-3 px-3">TOTAL STATUTORY AWARD</td>
                  <td className="py-3 px-3 text-[11px] font-medium text-amber-400">Section 30(2) &amp; Award Order</td>
                  <td className="py-3 px-3 text-[11px] font-medium text-slate-300">Composite Sum payable to Khatedar</td>
                  <td className="py-3 px-3 text-right text-emerald-400 text-base">{formatINR(totalAwardAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Highlights */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl gap-2 border border-slate-200">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Escrow Disbursal via: <strong>CALA PFMS Treasury Account</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                100% Tax Exempted under Sec 96
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
