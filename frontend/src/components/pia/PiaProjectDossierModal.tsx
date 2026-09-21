import {
  X,
  Building2,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Landmark,
} from 'lucide-react'
import type { PiaProject, PiaDocument, PiaClarificationAlert } from '../../types/pia'

interface PiaProjectDossierModalProps {
  project: PiaProject | null
  onClose: () => void
  documents: PiaDocument[]
  alerts: PiaClarificationAlert[]
  onOpenClarification: (alert: PiaClarificationAlert) => void
}

export default function PiaProjectDossierModal({
  project,
  onClose,
  documents,
  alerts,
  onOpenClarification,
}: PiaProjectDossierModalProps) {
  if (!project) return null

  const projectDocs = documents.filter((d) => d.projectId === project.id)
  const projectAlerts = alerts.filter((a) => a.projectId === project.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in-50">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-red-400">
                {project.code}
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {project.sector}
              </span>
              <span className="rounded-full bg-emerald-900/80 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-700">
                Stage: {project.currentStage}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Building2 className="h-3.5 w-3.5 text-red-400" />
              <span>{project.agency}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statutory Milestone Progress Line */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Statutory Land Acquisition Lifecycle Milestones
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {project.statutoryMilestones.map((ms, idx) => {
                const isCompleted = ms.status === 'completed'
                const isCurrent = ms.status === 'current'

                return (
                  <div
                    key={ms.stage}
                    className={`rounded-lg p-2.5 border text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : isCurrent
                        ? 'bg-red-50 border-red-200 text-red-950 ring-1 ring-red-300'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span>0{idx + 1}</span>
                      {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                      {isCurrent && <Clock className="h-3.5 w-3.5 text-[#991B1B] animate-pulse" />}
                    </div>
                    <p className="font-bold mt-1 text-slate-900">{ms.stage}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {isCompleted ? ms.completedDate : isCurrent ? `${ms.elapsedDays}d / ${ms.slaDays}d SLA` : 'Upcoming'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Key Metrics: Land Breakdown & Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Land Distribution */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#991B1B]" />
                Land Distribution & Parcels (Hectares)
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Land Required:</span>
                  <span className="font-bold text-slate-900">{project.landRequiredHa} Ha</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Private Land (Khatedars):</span>
                  <span className="font-semibold text-slate-800">{project.privateLandHa} Ha</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Government / Gram Sabha:</span>
                  <span className="font-semibold text-slate-800">{project.govtLandHa} Ha</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Forest / Protected ROW:</span>
                  <span className="font-semibold text-slate-800">{project.forestLandHa} Ha</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-bold">
                  <span className="text-slate-700">Total Cadastral Parcels:</span>
                  <span className="text-[#991B1B]">{project.parcelsCount} Gatas</span>
                </div>
              </div>
            </div>

            {/* Financial Status */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-[#991B1B]" />
                Compensation & Escrow Account
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sanctioned Estimate:</span>
                  <span className="font-bold text-slate-900">₹{project.budgetCr} Cr</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Disbursed (Direct DBT):</span>
                  <span className="font-bold text-emerald-700">₹{project.disbursedCr} Cr</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Pending Award Escrow:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(project.budgetCr - project.disbursedCr).toFixed(1)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Target Commissioning:</span>
                  <span className="font-semibold text-slate-800">{project.targetCommissioning}</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-semibold text-slate-700">
                  <span className="text-slate-500">Competent Authority:</span>
                  <span className="text-[11px] text-right truncate max-w-[200px]">{project.calaAuthority}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Clarifications Banner if any */}
          {projectAlerts.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#991B1B] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Active Clarification Requests for this Project ({projectAlerts.length})
              </h4>
              <div className="space-y-2">
                {projectAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-white p-3 border border-red-200 shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{alert.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{alert.description}</p>
                      <span className="text-[10px] text-[#991B1B] font-semibold">
                        Raised by: {alert.raisedBy} · {alert.daysLeft} days left
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onOpenClarification(alert)
                      }}
                      className="rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-3 py-1.5 text-xs font-bold whitespace-nowrap self-start sm:self-auto"
                    >
                      Respond Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Statutory Documents */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#991B1B]" />
              Repository Documents ({projectDocs.length})
            </h4>
            {projectDocs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No documents uploaded yet for this project.</p>
            ) : (
              <div className="space-y-2">
                {projectDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-red-50 text-[#991B1B]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{doc.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {doc.category} · {doc.fileSize} · Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                        className="text-[#991B1B] hover:underline font-semibold text-xs flex items-center gap-0.5"
                      >
                        Download <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified with National Land Records Modernization Programme (NLRMP)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  )
}
