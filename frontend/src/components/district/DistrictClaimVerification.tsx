import { useState } from 'react'
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Eye,
  Check,
  X,
  Scale,
  Layers,
} from 'lucide-react'
import { MOCK_CLAIM_VERIFICATIONS } from '../../data/mockDistrictData'
import type { LandownerClaimVerificationItem } from '../../types/district'

export default function DistrictClaimVerification() {
  const [claims, setClaims] = useState<LandownerClaimVerificationItem[]>(MOCK_CLAIM_VERIFICATIONS)
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '')
  const [actionRemark, setActionRemark] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [previewDocTitle, setPreviewDocTitle] = useState<string | null>(null)

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || claims[0]

  const handleUpdateClaimStatus = (
    claimId: string,
    newStatus: 'Approved_For_Escrow' | 'Clarification_Required' | 'Disputed'
  ) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: newStatus,
              officerRemarks: actionRemark.trim() ? actionRemark : c.officerRemarks,
            }
          : c
      )
    )

    const label =
      newStatus === 'Approved_For_Escrow'
        ? 'Approved for PFMS Escrow Payout'
        : newStatus === 'Clarification_Required'
        ? 'Clarification Requested from Landowner'
        : 'Flagged for Revenue Tribunal Adjudication'

    setToastMessage(`Claim ${activeClaim.claimNumber} (${activeClaim.khasraNo}): ${label}`)
    setActionRemark('')
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="space-y-5">
      {/* Document Preview Modal */}
      {previewDocTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#042A5E]" />
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-[360px]">{previewDocTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocTitle(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-6 flex flex-col items-center justify-center bg-slate-50 rounded-xl my-4 border border-dashed border-slate-200">
              <ShieldCheck className="h-10 w-10 text-emerald-600 mb-2" />
              <span className="text-xs font-bold text-slate-800">Digitally Verified Government Record</span>
              <span className="text-[11px] text-slate-500 mt-0.5">SHA-256 e-Signed by State Land Revenue Authority</span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewDocTitle(null)}
              className="w-full rounded-xl bg-slate-900 text-white py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

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
              Public Claims Adjudication (Workflow Step 7)
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Dual-Pane Title &amp; Survey Verification
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Side-by-Side Public Claim Verification Queue
          </h2>
          <p className="text-xs text-slate-500">
            Compare landowner uploaded title deeds and KYC records side-by-side against field cadastral survey findings.
          </p>
        </div>
      </div>

      {/* Main Dual-Pane Adjudication Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Claims Queue (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Claims for Adjudication ({claims.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Click to compare</span>
          </div>

          <div className="space-y-2.5">
            {claims.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClaimId(c.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedClaimId === c.id
                    ? 'border-[#042A5E] bg-blue-50/50 ring-2 ring-blue-200 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#042A5E]">{c.khasraNo}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${
                      c.status === 'Approved_For_Escrow'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Clarification_Required'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-[#042A5E]'
                    }`}
                  >
                    {c.status === 'Approved_For_Escrow' ? 'Escrow Cleared' : c.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-1 truncate">{c.claimantName}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{c.village} ({c.projectCode})</span>
                  <span className="font-bold text-slate-900">{formatINR(c.calculatedAwardAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Side-by-Side Verification Screen (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {activeClaim.claimNumber} — {activeClaim.khasraNo} ({activeClaim.village})
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target Project: <strong>{activeClaim.projectCode}</strong> · Award Amount: <strong>{formatINR(activeClaim.calculatedAwardAmount)}</strong>
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                activeClaim.status === 'Approved_For_Escrow'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeClaim.status === 'Clarification_Required'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-900'
              }`}
            >
              {activeClaim.status === 'Approved_For_Escrow' ? 'Approved for Escrow Payout' : activeClaim.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Dual-Pane Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Pane: Citizen Uploaded Claim */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#042A5E] border-b border-blue-200/60 pb-2">
                <User className="h-4 w-4" />
                <span>1. Citizen Uploaded Title &amp; KYC</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Claimant Name</span>
                  <span className="font-bold text-slate-900">{activeClaim.claimantName}</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Aadhaar KYC</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="h-3.5 w-3.5" /> {activeClaim.aadhaarNumberMasked}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Claimed Area</span>
                    <span className="font-bold text-slate-900">{activeClaim.claimedAreaSqM.toLocaleString()} sq.m</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Bank Account (DBT)</span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {activeClaim.bankAccountNumberMasked} (IFSC: {activeClaim.bankIfsc})
                  </span>
                </div>

                {/* Document links */}
                <div className="pt-2 border-t border-blue-200/40 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted Documents</span>
                  <button
                    type="button"
                    onClick={() => setPreviewDocTitle(activeClaim.titleDeedDocUrl)}
                    className="w-full flex items-center justify-between text-[11px] bg-white border border-blue-200 p-2 rounded-lg text-slate-800 hover:bg-blue-50 cursor-pointer"
                  >
                    <span className="truncate">{activeClaim.titleDeedDocUrl}</span>
                    <Eye className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDocTitle(activeClaim.extract712DocUrl)}
                    className="w-full flex items-center justify-between text-[11px] bg-white border border-blue-200 p-2 rounded-lg text-slate-800 hover:bg-blue-50 cursor-pointer"
                  >
                    <span className="truncate">{activeClaim.extract712DocUrl}</span>
                    <Eye className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Cadastral Survey & Ground Records */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 border-b border-emerald-200/60 pb-2">
                <Layers className="h-4 w-4" />
                <span>2. Field Cadastral Survey &amp; JMS Record</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">RoR Landowner of Record</span>
                  <span className="font-bold text-slate-900">{activeClaim.claimantName}</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Cadastral Area</span>
                    <span className="font-bold text-slate-900">{activeClaim.cadastralAreaSqM.toLocaleString()} sq.m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Area Discrepancy</span>
                    <span
                      className={`font-bold text-[11px] ${
                        activeClaim.areaDiscrepancySqM > 0 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {activeClaim.areaDiscrepancySqM === 0 ? '0 sq.m (Clean Match)' : `+${activeClaim.areaDiscrepancySqM} sq.m Discrepancy`}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Survey Verification Status</span>
                  <span className="font-semibold text-emerald-800 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Cadastral Boundaries Verified
                  </span>
                </div>

                {/* Survey Documents */}
                <div className="pt-2 border-t border-emerald-200/40 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Survey Records</span>
                  <button
                    type="button"
                    onClick={() => setPreviewDocTitle(activeClaim.cadastralMapDocUrl)}
                    className="w-full flex items-center justify-between text-[11px] bg-white border border-emerald-200 p-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer"
                  >
                    <span className="truncate">{activeClaim.cadastralMapDocUrl}</span>
                    <Eye className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDocTitle(activeClaim.jmsSurveyReportUrl)}
                    className="w-full flex items-center justify-between text-[11px] bg-white border border-emerald-200 p-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer"
                  >
                    <span className="truncate">{activeClaim.jmsSurveyReportUrl}</span>
                    <Eye className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Officer Findings / Action Remarks */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">
              CALA Order / Verification Findings:
            </label>
            <input
              type="text"
              placeholder="Enter adjudication remark (e.g. Title approved, Bank account validated for PFMS)..."
              value={actionRemark || activeClaim.officerRemarks || ''}
              onChange={(e) => setActionRemark(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#042A5E]"
            />
          </div>

          {/* Adjudication Action Controls */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleUpdateClaimStatus(activeClaim.id, 'Disputed')}
              className="rounded-xl bg-slate-100 hover:bg-red-50 text-red-700 border border-red-200 px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Flag to Revenue Tribunal</span>
            </button>
            <button
              type="button"
              onClick={() => handleUpdateClaimStatus(activeClaim.id, 'Clarification_Required')}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 px-3.5 py-2 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Request Clarification</span>
            </button>
            <button
              type="button"
              onClick={() => handleUpdateClaimStatus(activeClaim.id, 'Approved_For_Escrow')}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve Title &amp; Authorize Escrow Payout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
