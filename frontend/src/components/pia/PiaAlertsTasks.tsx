import { useState } from 'react'
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileQuestion,
  Calendar,
  UploadCloud,
  X,
} from 'lucide-react'
import type { PiaClarificationAlert } from '../../types/pia'

interface PiaAlertsTasksProps {
  alerts: PiaClarificationAlert[]
  onResolveAlert: (alertId: string, remark: string) => void
  activeAlertToOpen?: PiaClarificationAlert | null
  onClearActiveAlert?: () => void
}

export default function PiaAlertsTasks({
  alerts,
  onResolveAlert,
  activeAlertToOpen,
  onClearActiveAlert,
}: PiaAlertsTasksProps) {
  const [selectedAlert, setSelectedAlert] = useState<PiaClarificationAlert | null>(
    activeAlertToOpen || null
  )
  const [filterType, setFilterType] = useState<'all' | 'open' | 'resolved'>('all')
  const [responseRemark, setResponseRemark] = useState('')
  const [attachedFileName, setAttachedFileName] = useState('')

  const openAlerts = alerts.filter((a) => a.status === 'open')
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved')

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'open') return a.status === 'open'
    if (filterType === 'resolved') return a.status === 'resolved'
    return true
  })

  const upcomingDeadlines = [
    {
      id: 'dl_01',
      title: 'Section 19 Final Declaration 1-Year Lapse Deadline',
      projectCode: 'NHAI-VNS-KOL-02',
      deadlineDate: '2026-04-12',
      daysRemaining: 23,
      statutorySection: 'Sec 19(7) RFCTLARR',
      severity: 'critical',
      actionNeeded: 'Gazette notification under Section 3D must be published to avoid lapse.',
    },
    {
      id: 'dl_02',
      title: 'Joint Measurement Survey (JMS) Sign-off Window',
      projectCode: 'NHAI-DEL-MUM-PKG04',
      deadlineDate: '2026-04-20',
      daysRemaining: 31,
      statutorySection: 'Sec 3G NH Act',
      severity: 'warning',
      actionNeeded: 'CALA Nuh & Tehsildar joint field inspection sheet countersignature.',
    },
    {
      id: 'dl_03',
      title: 'PFMS DBT Direct Disbursal Reconcile for Q4',
      projectCode: 'DFCCIL-WDFC-REV-12',
      deadlineDate: '2026-03-31',
      daysRemaining: 11,
      statutorySection: 'Public Financial Management',
      severity: 'info',
      actionNeeded: 'Submit Bank Escrow utilization certificate for 740 khatedars.',
    },
  ]

  const handleOpenResponseModal = (alert: PiaClarificationAlert) => {
    setSelectedAlert(alert)
    setResponseRemark('')
    setAttachedFileName('')
  }

  const handleCloseModal = () => {
    setSelectedAlert(null)
    if (onClearActiveAlert) onClearActiveAlert()
  }

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlert || !responseRemark.trim()) return

    onResolveAlert(selectedAlert.id, responseRemark)
    handleCloseModal()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Alerts, Clarification Requests & Action Items
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Respond to revenue authorities, track statutory deadline lapsing, and clear project bottlenecks
        </p>
      </div>

      {/* Top Warning Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#991B1B]">Open Clarification Requests</span>
            <AlertTriangle className="h-4 w-4 text-[#991B1B]" />
          </div>
          <p className="text-2xl font-bold text-red-950 mt-1">{openAlerts.length}</p>
          <span className="text-[11px] text-red-700 mt-1 block">
            Requires technical/cadastral clarification to CALA
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Upcoming Statutory Deadlines</span>
            <Clock className="h-4 w-4 text-amber-800" />
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-1">{upcomingDeadlines.length}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Within the next 35 calendar days
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Resolved Queries</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-800" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-1">{resolvedAlerts.length}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            Cleared with CALA endorsement
          </span>
        </div>
      </div>

      {/* Clarification Requests Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-[#991B1B]" />
              Competent Authority (CALA) Clarification Requests
            </h3>
            <p className="text-xs text-slate-500">
              Inquiries raised during revenue scrutiny and public objection hearings
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('open')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'open' ? 'bg-white text-[#991B1B] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Open ({openAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('resolved')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'resolved' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Resolved ({resolvedAlerts.length})
            </button>
          </div>
        </div>

        {/* List of Alerts */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No clarification requests match this filter.
            </p>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-all ${
                  alert.status === 'open'
                    ? 'border-red-200 bg-red-50/20'
                    : 'border-slate-200 bg-slate-50/40 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#991B1B]">
                        {alert.projectCode}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {alert.queryType}
                      </span>
                      {alert.status === 'open' ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-900 animate-pulse">
                          {alert.daysLeft} days to respond
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                          Resolved
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Raised By: <strong className="text-slate-700">{alert.raisedBy}</strong></span>
                      <span>Flagged: {alert.dateRaised}</span>
                    </div>

                    {/* Resolution Remark if resolved */}
                    {alert.status === 'resolved' && alert.resolutionRemark && (
                      <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900">
                        <span className="font-bold block">Resolution Submitted:</span>
                        <span>{alert.resolutionRemark}</span>
                      </div>
                    )}
                  </div>

                  {alert.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleOpenResponseModal(alert)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors shrink-0 self-start"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload Requested Document</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Statutory Deadlines Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Statutory Lapsing Timers & Critical Milestones
          </h3>
          <p className="text-xs text-slate-500">
            Automated alerts to avoid statutory lapse of Land Acquisition notifications
          </p>
        </div>

        <div className="space-y-3">
          {upcomingDeadlines.map((dl) => (
            <div
              key={dl.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#991B1B]">
                    {dl.projectCode}
                  </span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {dl.statutorySection}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{dl.title}</h4>
                <p className="text-xs text-slate-600">{dl.actionNeeded}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{dl.daysRemaining} Days Left</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Due: {dl.deadlineDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response & Document Upload Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#991B1B]">
                  {selectedAlert.projectCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Upload Requested Document &amp; Respond to CALA
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-red-50/60 p-3 border border-red-200 text-xs">
              <p className="font-bold text-[#991B1B]">{selectedAlert.title}</p>
              <p className="text-slate-700 mt-1 leading-relaxed text-[11px]">{selectedAlert.description}</p>
              <p className="text-slate-500 text-[10px] mt-1.5 font-semibold">Requested By Authority: {selectedAlert.raisedBy}</p>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-4 text-xs">
              {/* Document Attachment Upload Section */}
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center space-y-2">
                <UploadCloud className="h-6 w-6 text-[#991B1B] mx-auto" />
                <p className="font-bold text-slate-900">Upload Requested Document File *</p>
                <p className="text-[10px] text-slate-500">Supports PDF, CAD/DWG, or Spreadsheet (.xlsx)</p>
                
                <div className="pt-1 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachedFileName(`${selectedAlert.queryType.replace(/\s+/g, '_')}_Certified.pdf`)}
                    className="rounded-lg bg-white border border-slate-300 hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-[#991B1B] shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-[#991B1B]" />
                    <span>{attachedFileName ? `Selected: ${attachedFileName}` : 'Choose File to Upload'}</span>
                  </button>
                  {attachedFileName && (
                    <span className="text-emerald-700 text-[11px] font-bold">
                      ✓ Document file ready for submission
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Explanatory Remarks / Cover Note *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter clarification summary, survey reconciliation remarks, or DPR reference details..."
                  value={responseRemark}
                  onChange={(e) => setResponseRemark(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-[#991B1B] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] px-5 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Upload &amp; Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
