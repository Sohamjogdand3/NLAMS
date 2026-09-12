import { useState } from 'react'
import {
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  Download,
} from 'lucide-react'
import type { CompensationSummary } from '../../types/citizen'

interface PaymentStatusCardProps {
  compensation: CompensationSummary
}

export default function PaymentStatusCard({ compensation }: PaymentStatusCardProps) {
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const percentagePaid = Math.round(
    (compensation.disbursedAmount / compensation.totalAwardAmount) * 100
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Direct Benefit Transfer (DBT) Active
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {compensation.caseNo}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1">
            Compensation Award & Disbursement Summary
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Determined as per RFCTLARR Act 2013 • Acquired Parcel Area: {compensation.totalAcquiredAreaHa} Ha
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReceiptModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Receipt className="h-4 w-4" /> Download Official Award Receipt
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        {/* Total Calculated Award */}
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md">
          <span className="text-xs font-semibold text-slate-300 block">Total Sanctioned Award</span>
          <span className="text-2xl font-black text-amber-400 block mt-1">
            {formatINR(compensation.totalAwardAmount)}
          </span>
          <span className="text-[11px] text-slate-300 block mt-2 border-t border-slate-700/80 pt-2">
            Includes 100% Solatium & 12% Interest
          </span>
        </div>

        {/* Disbursed Amount */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Disbursed to Bank</span>
            <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
              {percentagePaid}% Paid
            </span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-900 block mt-1">
            {formatINR(compensation.disbursedAmount)}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-2">
            Credited via SBI DBT Gateway
          </span>
        </div>

        {/* Pending Amount */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Pending Balance</span>
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
              Tranche 2
            </span>
          </div>
          <span className="text-2xl font-extrabold text-amber-950 block mt-1">
            {formatINR(compensation.pendingAmount)}
          </span>
          <span className="text-[11px] text-amber-800 block mt-2">
            Scheduled post physical handover
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-slate-100 p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span>Disbursement Progress</span>
          <span>{percentagePaid}% Complete ({formatINR(compensation.disbursedAmount)} / {formatINR(compensation.totalAwardAmount)})</span>
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700"
            style={{ width: `${percentagePaid}%` }}
          />
        </div>
      </div>

      {/* Breakdown Accordion / Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Detailed Award Valuation Breakdown */}
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
          <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-3">
            Valuation Breakdown (RFCTLARR Act 2013)
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200 text-slate-700">
              <span>Base Market Land Valuation (0.65 Ha @ ₹65L/Ha)</span>
              <span className="font-bold text-slate-900">{formatINR(compensation.baseLandValuation)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 text-slate-700">
              <span className="flex items-center gap-1">
                100% Solatium Assistance (Sec 30)
                <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-1 rounded">Mandatory</span>
              </span>
              <span className="font-bold text-slate-900">{formatINR(compensation.solatium100Percent)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 text-slate-700">
              <span>12% Additional Interest from Sec 11 Notice</span>
              <span className="font-bold text-slate-900">{formatINR(compensation.additionalInterest)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 text-slate-700">
              <span>R&R One-Time Resettlement Assistance</span>
              <span className="font-bold text-slate-900">{formatINR(compensation.rehabilitationAllowance)}</span>
            </div>

            <div className="flex justify-between py-2 font-extrabold text-sm text-slate-900 border-t-2 border-slate-900 pt-2">
              <span>Gross Final Award Amount</span>
              <span className="text-emerald-700">{formatINR(compensation.totalAwardAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right: Bank Account & DBT Status */}
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-3">
              Linked Bank Account (DBT Verified)
            </h4>

            <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Bank Name</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-sky-600" /> {compensation.bankName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Account Number</span>
                <span className="font-mono font-bold text-slate-900">{compensation.accountNoMasked}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">IFSC Code</span>
                <span className="font-mono font-semibold text-slate-700">{compensation.ifscCode}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-semibold">Aadhaar Seeding Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> NPCI Seeded & Verified
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Direct Credit to Aadhaar-Linked Bank Account managed by State Treasury e-Payment Gateway.</span>
          </div>
        </div>
      </div>

      {/* Tranches Table */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-3">
          Payment Tranches & Payment Receipt Log
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3">Tranche</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Disbursement Date</th>
                <th className="py-2.5 px-3">Transaction UTR Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compensation.tranches.map((t) => (
                <tr key={t.trancheNo} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">#{t.trancheNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{t.title}</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">{formatINR(t.amount)}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        t.status === 'DISBURSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status === 'DISBURSED' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{t.disbursementDate || 'Pending Stage 5'}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                    {t.bankRef || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Award Receipt Download Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Official Compensation Award Certificate
              </h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="font-serif font-bold text-slate-900 block text-sm">
                  GOVERNMENT OF MAHARASHTRA • REVENUE DEPT
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Land Acquisition Officer, Pune Division
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Award Order No:</span>
                <span className="font-bold text-slate-900">LAO/PUN/894/AWARD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Beneficiary Name:</span>
                <span className="font-bold text-slate-900">Rajesh Kumar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Land Parcel:</span>
                <span className="font-bold text-slate-900">Survey 142/2A (0.65 Ha Acquired)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Award Sanctioned:</span>
                <span className="font-extrabold text-emerald-700">{formatINR(compensation.totalAwardAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Award Certificate PDF downloaded successfully!')
                  setShowReceiptModal(false)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4" /> Save PDF Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
