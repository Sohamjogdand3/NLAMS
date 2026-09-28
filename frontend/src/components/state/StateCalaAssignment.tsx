import { useState } from 'react'
import {
  UserCheck,
  Building2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import type { StateProposalItem } from '../../types/stateNodal'

interface StateCalaAssignmentProps {
  proposals: StateProposalItem[]
  onApproveProposal: (proposalId: string, collector: string, lao: string, orderNo: string) => void
}

export default function StateCalaAssignment({
  proposals,
  onApproveProposal,
}: StateCalaAssignmentProps) {
  const [selectedProposal, setSelectedProposal] = useState<StateProposalItem | null>(null)
  const [collectorName, setCollectorName] = useState('')
  const [laoName, setLaoName] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const appointedProposals = proposals.filter((p) => p.status === 'CALA_Appointed')
  const pendingProposals = proposals.filter((p) => p.status === 'Pending_State_Intake')

  const handleOpenModal = (p: StateProposalItem) => {
    setSelectedProposal(p)
    setCollectorName(
      p.targetDistricts.includes('Pune')
        ? 'Dr. Suhas Diwase (IAS), District Collector Pune'
        : p.targetDistricts.includes('Thane')
        ? 'Shri Ashok Shingare (IAS), Collector Thane'
        : 'District Collector & Magistrate'
    )
    setLaoName(
      p.targetDistricts.includes('Pune')
        ? 'Special Land Acquisition Officer (SLO-15), Haveli'
        : 'Competent Authority & SDO'
    )
    const year = new Date().getFullYear()
    const rand = Math.floor(100 + Math.random() * 900)
    setOrderNumber(`REV/LAO/${p.targetDistricts[0]?.toUpperCase() || 'MH'}/CALA-${year}-${rand}`)
  }

  const handleConfirmAppointment = () => {
    if (!selectedProposal || !collectorName || !laoName || !orderNumber) return

    onApproveProposal(selectedProposal.id, collectorName, laoName, orderNumber)
    setSuccessMsg(`CALA Appointment Order ${orderNumber} issued successfully!`)
    setSelectedProposal(null)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#042A5E]" />
              CALA Appointment Orders &amp; Jurisdiction Locks
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Formal delegation of statutory acquisition powers under Section 3(a) of the National Highways Act, 1956 and Section 3(g) of the RFCTLARR Act, 2013. Locking project files directly to District Collectors &amp; Land Acquisition Officers.
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#042A5E] border border-slate-200">
            {appointedProposals.length} Orders Active
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Pending Action Callout if any */}
      {pendingProposals.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  {pendingProposals.length} Requisitions Awaiting Gazetted CALA Appointment
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  The Requiring Agency (NHAI/Railways) has submitted requisitions that need official appointment of District Collectors before Section 11 Preliminary Freeze can begin.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal(pendingProposals[0])}
              className="rounded-lg bg-[#042A5E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#07397b] transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Issue Next Order &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Active CALA Appointments Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Gazetted CALA Appointment Directory
          </h3>
          <span className="text-[11px] text-slate-500">
            All orders digitally signed via State Digital Token
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {appointedProposals.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#042A5E]">
                      {item.projectCode}
                    </span>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                      CALA Appointed
                    </span>
                    <span className="rounded-md bg-slate-100 text-slate-700 font-bold px-2 py-0.5 text-[10px]">
                      {item.requiringAgency}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{item.projectName}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-600 mt-2">
                    <div>
                      <span className="text-slate-400">Order No: </span>
                      <span className="font-mono font-bold text-slate-800">
                        {item.appointmentOrderNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Gazette Date: </span>
                      <span className="font-bold text-slate-800">{item.appointmentDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">District Collector: </span>
                      <span className="font-bold text-slate-800">
                        {item.assignedDistrictCollector}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Appointed LAO: </span>
                      <span className="font-bold text-slate-800">{item.appointedCalaOfficer}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                  <div className="text-right hidden lg:block">
                    <div className="text-xs font-black text-slate-800">
                      {item.totalLandReqHectares} Ha
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.targetDistricts.join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(
                        `Downloading Official Gazette Notification:\nOrder No: ${item.appointmentOrderNo}\nSigned: Secretary (Revenue & Forest Dept, Govt. of Maharashtra)`
                      )
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Gazette PDF
                  </button>
                </div>
              </div>
            </div>
          ))}

          {appointedProposals.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No CALA appointments currently on record.
            </div>
          )}
        </div>
      </div>

      {/* Appointment Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#042A5E]" />
                <h3 className="text-sm font-black text-slate-900">
                  Issue Statutory CALA Appointment Order
                </h3>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                <div className="font-mono font-bold text-[#042A5E]">
                  {selectedProposal.projectCode}
                </div>
                <div className="font-bold text-slate-800">{selectedProposal.projectName}</div>
                <div className="text-[11px] text-slate-500">
                  Requiring Agency: {selectedProposal.requiringAgency} • Area:{' '}
                  {selectedProposal.totalLandReqHectares} Ha
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Official Gazette Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#042A5E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Assigned District Collector (Competent Authority)
                </label>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#042A5E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Designated Special Land Acquisition Officer (LAO)
                </label>
                <input
                  type="text"
                  value={laoName}
                  onChange={(e) => setLaoName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#042A5E]"
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-[11px] text-blue-900 flex items-start gap-2">
                <Building2 className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  By issuing this order, jurisdiction over all land parcels defined in the KML GIS boundary is assigned directly to the District Collectorate with Mahabhulekh mutation lock enabled.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedProposal(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAppointment}
                className="rounded-lg bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#07397b] transition-colors cursor-pointer shadow-xs"
              >
                Sign &amp; Gazette Order &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
