import { useState } from 'react'
import {
  Coins,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'

interface EscrowAccount {
  id: string
  projectCode: string
  projectName: string
  districtCollectorate: string
  totalRequiredCr: number
  currentlyDepositedCr: number
  pendingReplenishmentCr: number
  status: 'Adequate Balance' | 'Replenishment Demanded' | 'Critical Shortfall'
  slaDeadlineDate: string
}

export default function PiaEscrowReplenishment() {
  const [escrows, setEscrows] = useState<EscrowAccount[]>([
    {
      id: 'ESC-NHAI-PUN-01',
      projectCode: 'NHAI-PUN-RING-01',
      projectName: 'Pune Outer Ring Road (East Package 1)',
      districtCollectorate: 'Office of District Collector, Pune (CALA Escrow)',
      totalRequiredCr: 840.0,
      currentlyDepositedCr: 600.0,
      pendingReplenishmentCr: 240.0,
      status: 'Replenishment Demanded',
      slaDeadlineDate: '2026-10-15',
    },
    {
      id: 'ESC-NHAI-MH-04',
      projectCode: 'NHAI-MH-DEL-MUM-EXPR',
      projectName: 'Delhi-Mumbai Expressway (Pkg 4 Palghar)',
      districtCollectorate: 'District Collectorate Palghar',
      totalRequiredCr: 580.0,
      currentlyDepositedCr: 580.0,
      pendingReplenishmentCr: 0.0,
      status: 'Adequate Balance',
      slaDeadlineDate: '2026-12-01',
    },
    {
      id: 'ESC-MIDC-TLG-09',
      projectCode: 'MIDC-TLG-IND-09',
      projectName: 'Talegaon Mega Industrial Park (Phase 3)',
      districtCollectorate: 'Sub-Divisional Officer / CALA Maval (Pune)',
      totalRequiredCr: 210.0,
      currentlyDepositedCr: 150.0,
      pendingReplenishmentCr: 60.0,
      status: 'Replenishment Demanded',
      slaDeadlineDate: '2026-10-30',
    },
  ])

  const [selectedEscrow, setSelectedEscrow] = useState<EscrowAccount | null>(null)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleOpenDepositModal = (esc: EscrowAccount) => {
    setSelectedEscrow(esc)
    setDepositAmount(esc.pendingReplenishmentCr)
  }

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEscrow) return

    setIsProcessing(true)
    setTimeout(() => {
      setEscrows((prev) =>
        prev.map((item) =>
          item.id === selectedEscrow.id
            ? {
                ...item,
                currentlyDepositedCr: item.currentlyDepositedCr + depositAmount,
                pendingReplenishmentCr: Math.max(0, item.pendingReplenishmentCr - depositAmount),
                status:
                  item.currentlyDepositedCr + depositAmount >= item.totalRequiredCr
                    ? 'Adequate Balance'
                    : 'Replenishment Demanded',
              }
            : item
        )
      )
      setIsProcessing(false)
      setSuccessMsg(
        `PFMS Escrow Deposit of ₹${depositAmount} Cr transferred successfully to ${selectedEscrow.districtCollectorate}.`
      )
      setSelectedEscrow(null)
      setTimeout(() => setSuccessMsg(''), 5000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#991B1B]" />
              PFMS CALA District Compensation Escrow Gateway
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Statutory 100% advance compensation deposit mandate under Section 19(2) of RFCTLARR Act 2013 &amp; NH Act 1956. Funds locked directly in District Collector's dedicated acquisition escrow before possession.
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-red-50 text-[#991B1B] border border-red-200 px-3 py-1 text-xs font-black">
            Sec 19 Deposit Mandate
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Escrow Accounts Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Active Project Escrow Portfolios ({escrows.length})
          </h3>
          <span className="text-[11px] text-slate-500">PFMS Real-Time Treasury Bridge</span>
        </div>

        <div className="divide-y divide-slate-100">
          {escrows.map((esc) => (
            <div key={esc.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#042A5E]">
                      {esc.projectCode}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        esc.status === 'Adequate Balance'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {esc.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{esc.projectName}</h4>
                  <p className="text-[11px] text-slate-500">{esc.districtCollectorate}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-[11px] text-slate-600 mt-2">
                    <div>
                      <span className="text-slate-400">Total Requirement: </span>
                      <strong className="text-slate-800">₹{esc.totalRequiredCr} Cr</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Deposited in Escrow: </span>
                      <strong className="text-emerald-700">₹{esc.currentlyDepositedCr} Cr</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Pending Deposit: </span>
                      <strong
                        className={
                          esc.pendingReplenishmentCr > 0 ? 'text-red-700' : 'text-slate-400'
                        }
                      >
                        ₹{esc.pendingReplenishmentCr} Cr
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {esc.pendingReplenishmentCr > 0 ? (
                    <button
                      onClick={() => handleOpenDepositModal(esc)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#991B1B] px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      Replenish Escrow &rarr;
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="h-4 w-4" />
                      100% Escrow Funded
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {selectedEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleConfirmDeposit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-[#991B1B]" />
                <h3 className="text-sm font-black text-slate-900">
                  PFMS Advance Compensation Escrow Deposit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEscrow(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                <div className="font-mono font-bold text-[#042A5E]">
                  {selectedEscrow.projectCode}
                </div>
                <div className="font-bold text-slate-900">{selectedEscrow.projectName}</div>
                <div className="text-[11px] text-slate-500">{selectedEscrow.districtCollectorate}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Deposit Amount (₹ Crores)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Funds are credited to the Competent Authority's designated Public Financial Management System (PFMS) escrow account. Section 19 declaration will unlock once 100% funds are verified.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedEscrow(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="rounded-lg bg-[#991B1B] px-4 py-2 text-xs font-bold text-white hover:bg-red-800 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isProcessing ? 'Authorizing Treasury PFMS...' : 'Authorize Escrow Transfer &rarr;'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
