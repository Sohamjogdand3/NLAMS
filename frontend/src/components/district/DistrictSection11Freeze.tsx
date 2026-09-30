import { useState } from 'react'
import {
  Clock,
  Lock,
  CheckCircle2,
  Gavel,
  Check,
} from 'lucide-react'
import { MOCK_SECTION_11_NOTICES } from '../../data/mockDistrictData'
import type { Section11NoticeEntry } from '../../types/district'
import { recordWorkflowStepLog } from '../../utils/auditLogger'

export default function DistrictSection11Freeze() {
  const [notices, setNotices] = useState<Section11NoticeEntry[]>(MOCK_SECTION_11_NOTICES)
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>(notices[0]?.id || '')
  const [selectedObjectionId, setSelectedObjectionId] = useState<string | null>(null)
  const [hearingRemark, setHearingRemark] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const activeNotice = notices.find((n) => n.id === selectedNoticeId) || notices[0]

  const handleDisposeObjection = (objId: string, outcome: 'Disposed / Overruled' | 'Remand for Re-survey') => {
    if (!hearingRemark.trim()) {
      alert('Please enter official CALA Hearing Order notes before disposing.')
      return
    }

    setNotices((prev) =>
      prev.map((n) =>
        n.id === activeNotice.id
          ? {
              ...n,
              objectionsResolved: n.objectionsResolved + 1,
              objections: n.objections.map((o) =>
                o.id === objId
                  ? {
                      ...o,
                      status: outcome,
                      officerRemarks: `[CALA DISPOSAL ORDER]: ${hearingRemark}`,
                    }
                  : o
              ),
            }
          : n
      )
    )

    recordWorkflowStepLog({
      step: 4,
      workItem: 'Sec 11 Freeze & Objections',
      originatingDashboard: 'District Collector Desk',
      receivingDashboard: 'Citizen Portal',
      outputArtifact: 'Form-II Gazette Notice & API Lock',
      targetProject: activeNotice.projectCode,
      user: 'District LAO Haveli',
      role: 'Land Acquisition Officer',
      action: `Section 11 Objection Disposed (${outcome})`,
      details: `Form-II Gazette preliminary notification active. Hearing remark: "${hearingRemark}".`,
    })

    setToastMessage(`Objection ${objId} officially updated as: ${outcome}`)
    setHearingRemark('')
    setSelectedObjectionId(null)
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
            <span className="rounded-md bg-[#991B1B] px-2.5 py-0.5 text-xs font-bold text-white">
              Section 11 Preliminary Notification
            </span>
            <span className="text-[11px] font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Statutory 60-Day Objection Period &amp; Registry Lock
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Section 11 Gazette Freeze &amp; Objections Adjudication
          </h2>
          <p className="text-xs text-slate-500">
            Enforces automated API freeze on State Land Registry transactions, tracks 60-day objection timer, and schedules CALA tribunals.
          </p>
        </div>

        {/* State Registry Lock Live Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2 sm:px-3 sm:py-2 rounded-xl text-xs text-emerald-900 font-bold shrink-0">
          <Lock className="h-4 w-4 text-emerald-600 animate-pulse" />
          <div className="flex flex-col text-left leading-tight">
            <span>State Land Registry API: ACTIVE LOCK</span>
            <span className="text-[10px] text-emerald-700 font-normal">Sale Deeds &amp; Mutations Blocked</span>
          </div>
        </div>
      </div>

      {/* Notice Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {notices.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelectedNoticeId(n.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedNoticeId === n.id
                ? 'border-[#042A5E] bg-blue-50/40 ring-2 ring-blue-200 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#042A5E]">{n.projectCode}</span>
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs bg-red-100/70 px-2 py-0.5 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                <span>{n.daysRemaining} Days Left</span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">{n.projectName}</h4>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">{n.gazetteNotificationNo}</div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>{n.affectedKhasrasCount} Khasras Frozen</span>
              <span className="font-bold text-[#042A5E]">{n.totalObjectionsReceived} Objections ({n.objectionsResolved} Resolved)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Notice Inspection & Objection Hearings Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* Notice Info Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{activeNotice.gazetteNotificationNo}</span>
              <span className="text-[10px] font-bold bg-[#042A5E] text-white px-2 py-0.5 rounded">
                Section 11(1) Active
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Published on: <strong>{activeNotice.publicationDate}</strong> · Statutory Expiry: <strong>{activeNotice.expiryDate}</strong>
            </div>
          </div>

          {/* 60-Day Progress Bar */}
          <div className="flex flex-col min-w-[220px]">
            <div className="flex justify-between text-[10.5px] font-bold text-slate-700 mb-1">
              <span>60-Day Objection Window</span>
              <span className="text-red-700">{activeNotice.daysRemaining} days remaining</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600"
                style={{ width: `${((activeNotice.totalDays - activeNotice.daysRemaining) / activeNotice.totalDays) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Objections Tribunal Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Khatedar Objections Filed under Section 15(1) ({activeNotice.objections.length})
            </h3>
            <span className="text-[11px] text-slate-500">Hearing Venue: <strong>{activeNotice.hearingSchedule}</strong></span>
          </div>

          <div className="space-y-2.5">
            {activeNotice.objections.map((obj) => (
              <div
                key={obj.id}
                className="rounded-xl border border-slate-200/90 p-4 transition-all hover:border-slate-300 bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#042A5E]">{obj.khasraNo}</span>
                    <span className="text-xs font-semibold text-slate-800">· {obj.khatedarName}</span>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      {obj.objectionType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Filed: {obj.submissionDate}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        obj.status === 'Disposed / Overruled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : obj.status === 'Remand for Re-survey'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-900 animate-pulse'
                      }`}
                    >
                      {obj.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                  <strong>Official Hearing Record / Notes:</strong> {obj.officerRemarks}
                </div>

                {/* CALA Action Controls */}
                {obj.status === 'Hearing Scheduled' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Enter CALA hearing findings & disposition notes..."
                      value={selectedObjectionId === obj.id ? hearingRemark : ''}
                      onChange={(e) => {
                        setSelectedObjectionId(obj.id)
                        setHearingRemark(e.target.value)
                      }}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#042A5E]"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDisposeObjection(obj.id, 'Disposed / Overruled')}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Dispose Objection</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisposeObjection(obj.id, 'Remand for Re-survey')}
                        className="rounded-lg bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Gavel className="h-3.5 w-3.5" />
                        <span>Remand Re-survey</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
