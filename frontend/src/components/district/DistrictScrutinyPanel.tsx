import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Send,
  X,
} from 'lucide-react'
import type { ScrutinyRequisition, DistrictProject } from '../../types/district'
import { MOCK_SCRUTINY_REQUISITIONS } from '../../data/mockDistrictData'
import { recordWorkflowStepLog } from '../../utils/auditLogger'

interface DistrictScrutinyPanelProps {
  projects: DistrictProject[]
  onUpdateProjectStatus?: (projectId: string, newStage: any, remark: string) => void
}

export default function DistrictScrutinyPanel({
  projects: _projects,
  onUpdateProjectStatus,
}: DistrictScrutinyPanelProps) {
  const [requisitions, setRequisitions] = useState<ScrutinyRequisition[]>(MOCK_SCRUTINY_REQUISITIONS)
  const [selectedReq, setSelectedReq] = useState<ScrutinyRequisition | null>(requisitions[0])

  // Action Form States
  const [remark, setRemark] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'clarification' | 'reject'>('approve')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleProcessScrutiny = () => {
    if (!selectedReq) return
    if (!remark.trim()) {
      alert('Please enter official LAO scrutiny remarks before submitting.')
      return
    }

    if (actionType === 'approve') {
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === selectedReq.id
            ? { ...r, status: 'Recommended for 3A', comments: `[APPROVED FOR 3A]: ${remark}` }
            : r
        )
      )
      if (onUpdateProjectStatus) {
        onUpdateProjectStatus(selectedReq.projectId, 'Notification', remark)
      }
      recordWorkflowStepLog({
        step: 3,
        workItem: 'SIA Study & Expert Gate',
        originatingDashboard: 'District Collector Desk',
        receivingDashboard: 'Expert Committee Desk',
        outputArtifact: 'Social Impact Ledger',
        targetProject: selectedReq.projectCode,
        user: 'Dr. Suhas Diwase (IAS)',
        role: 'District Collector / Expert Committee Chair',
        action: 'SIA Study Appraised & Social Impact Ledger Approved',
        details: remark || 'Multi-criteria appraisal passed with public purpose clearance.',
      })
      setToastMessage(`Requisition ${selectedReq.projectCode} approved and recommended for Section 3A Gazette!`)
    } else if (actionType === 'clarification') {
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === selectedReq.id
            ? { ...r, status: 'Clarification Sent', comments: `[CLARIFICATION REQUESTED]: ${remark}` }
            : r
        )
      )
      setToastMessage(`Clarification requisition sent to ${selectedReq.piaAgency} for ${selectedReq.projectCode}.`)
    }

    setRemark('')
  }

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="rounded-xl bg-slate-900 text-white p-4 shadow-xl flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-[#042A5E]">
              Land Acquisition Officer Desk
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Section 4 &amp; 8 Verification
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            PIA Proposal Scrutiny &amp; Verification Module
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review land schedules, SIA exemption reports, Joint Measurement Surveys, and issue statutory clearances
          </p>
        </div>
      </div>

      {/* Scrutiny Queue & Inspection Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Requisitions Queue */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Requisitions Awaiting Scrutiny ({requisitions.length})
          </h3>

          <div className="space-y-3">
            {requisitions.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedReq(req)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedReq?.id === req.id
                    ? 'border-[#042A5E] bg-blue-50/60 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#042A5E] text-sm">{req.projectCode}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      req.status === 'Recommended for 3A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Clarification Sent'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-[#042A5E]'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{req.projectName}</h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Agency: {req.piaAgency}</span>
                  <span className="font-bold text-slate-700">{req.landAreaHectares} Ha</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Inspection & Official LAO Action Form */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          {selectedReq ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Requisition ID: {selectedReq.id}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#042A5E]">
                    {selectedReq.projectName}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    Submitted by {selectedReq.piaAgency} on {selectedReq.requisitionDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-slate-900">
                    {selectedReq.landAreaHectares} Ha
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Land Area</span>
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Submitted Documents Checklist ({selectedReq.documentsCount} Attachments)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-semibold text-emerald-900">1. Joint Measurement Survey (JMS)</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-semibold text-emerald-900">2. 7/12 Land Extracts Schedule</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-semibold text-emerald-900">3. SIA Exemption Report</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="font-semibold text-amber-900">4. Forest NOC Clearance</span>
                    <Clock className="h-4 w-4 text-amber-700" />
                  </div>
                </div>
              </div>

              {/* Action Form */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Official LAO Scrutiny Action &amp; Remarks
                </h4>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl border transition-colors ${
                      actionType === 'approve'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Recommend for 3A Gazette
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('clarification')}
                    className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl border transition-colors ${
                      actionType === 'clarification'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ? Request Clarification from PIA
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter official revenue scrutiny remarks, section compliance findings, or document clarification points..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#042A5E] focus:outline-none focus:ring-1 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={handleProcessScrutiny}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#042A5E] py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 shadow-sm transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Scrutiny Determination</span>
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">Select a requisition from the left list</p>
          )}
        </div>
      </div>
    </div>
  )
}
