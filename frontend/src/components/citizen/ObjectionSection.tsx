import { useState } from 'react'
import {
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Calendar,
  User,
  X,
  Send,
} from 'lucide-react'
import type { ObjectionItem } from '../../types/citizen'

interface ObjectionSectionProps {
  objections: ObjectionItem[]
}

export default function ObjectionSection({ objections }: ObjectionSectionProps) {
  const [objectionList, setObjectionList] = useState<ObjectionItem[]>(objections)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form State
  const [type, setType] = useState<ObjectionItem['type']>('Valuation & Compensation')
  const [description, setDescription] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successTrackingNo, setSuccessTrackingNo] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsSubmitting(true)

    setTimeout(() => {
      const generatedNo = `OBJ-2026-PUN-${Math.floor(1000 + Math.random() * 9000)}`
      const newObjection: ObjectionItem = {
        id: `obj-${Date.now()}`,
        trackingNo: generatedNo,
        dateSubmitted: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        type,
        description,
        status: 'Received',
        assignedOfficer: 'Office of Tehsildar & Sub-Divisional LAO Pune',
        attachedFilesCount: attachedFiles.length || 1,
        responseSummary:
          'Objection received via Citizen Portal. Scheduled for preliminary review within 3 working days.',
      }

      setObjectionList([newObjection, ...objectionList])
      setIsSubmitting(false)
      setIsFormOpen(false)
      setDescription('')
      setAttachedFiles([])
      setSuccessTrackingNo(generatedNo)
    }, 1000)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Grievance & Objection Management (Section 15)
            </h3>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              {objectionList.filter((o) => o.status !== 'Resolved').length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            File legal objections regarding land area, compensation valuation, tree count, or rehabilitation under Sec 15(1)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" /> Submit New Objection / Claim
        </button>
      </div>

      {/* Success Notification Banner */}
      {successTrackingNo && (
        <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-emerald-950 block text-sm">
                Objection Successfully Submitted!
              </span>
              <p className="mt-0.5">
                Your Tracking ID is <span className="font-mono font-bold">{successTrackingNo}</span>. An official receipt has been issued to the LAO Pune hearing desk.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessTrackingNo(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Objection Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Lodge Objection / Dispute Claim
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objection Category
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/50 bg-slate-50"
                >
                  <option value="Valuation & Compensation">Compensation / Land Valuation Rates</option>
                  <option value="Land Area Discrepancy">Land Area / Boundary Measurement Mismatch</option>
                  <option value="Structure/Trees">Tree, Well, or Structure Valuation</option>
                  <option value="Ownership Claim">Joint Ownership / Inheritance Title Dispute</option>
                  <option value="R&R Support">Rehabilitation & Resettlement Assistance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Objection Grounds / Statement
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide specific details regarding your dispute, survey number references, and requested remedy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Evidence Files (Maps, Receipts, Tree Survey Reports - PDF/JPG)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setAttachedFiles(Array.from(e.target.files || []))}
                  className="w-full rounded-lg border border-dashed border-slate-300 p-2.5 text-xs text-slate-600 bg-slate-50 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-slate-950 cursor-pointer shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Submit Objection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Objections List */}
      <div className="space-y-4">
        {objectionList.map((obj) => {
          const isResolved = obj.status === 'Resolved'
          const isHearing = obj.status === 'Under Hearing'

          return (
            <div
              key={obj.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isResolved
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isHearing
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {obj.trackingNo}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                    {obj.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Submitted: {obj.dateSubmitted}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isHearing
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {obj.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs font-semibold text-slate-800 mt-3">{obj.description}</p>

              {/* Hearing & Assigned Official Info */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    Assigned Hearing Officer
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" /> {obj.assignedOfficer}
                  </div>
                </div>

                {obj.nextHearingDate ? (
                  <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                    <div className="text-[10px] font-bold uppercase text-amber-800">
                      Scheduled Hearing Details
                    </div>
                    <div className="font-bold text-amber-950 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" /> Date: {obj.nextHearingDate}
                    </div>
                    {obj.hearingVenue && (
                      <div className="text-[11px] text-amber-900 mt-0.5">
                        Venue: {obj.hearingVenue}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Evidence Attachments</div>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> {obj.attachedFilesCount} Files Attached
                    </div>
                  </div>
                )}
              </div>

              {/* Official Response Summary */}
              {obj.responseSummary && (
                <div className="mt-3 rounded-lg bg-slate-900 p-3 text-xs text-slate-200 border-l-4 border-amber-500">
                  <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Official LAO Hearing Remarks
                  </div>
                  <p className="mt-1 font-medium leading-relaxed">{obj.responseSummary}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}
