import { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  MapPin,
} from 'lucide-react'
import type { StateProposalItem } from '../../types/stateNodal'

interface StateProposalIntakeProps {
  proposals: StateProposalItem[]
  onApproveIntake: (proposalId: string) => void
  onIssueClarification: (proposalId: string, remark: string) => void
}

export default function StateProposalIntake({
  proposals,
  onApproveIntake,
  onIssueClarification,
}: StateProposalIntakeProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string>(proposals[0]?.id || '')
  const [clarificationText, setClarificationText] = useState('')
  const [showClarificationInput, setShowClarificationInput] = useState(false)

  const activeProp = proposals.find((p) => p.id === selectedProposalId) || proposals[0]

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-white">
              State Jurisdiction · Workflow Step 2
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Central Agency Proposal Intake
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Central Proposal Ingestion &amp; Conflict Verification
          </h2>
          <p className="text-xs text-slate-500">
            Review incoming requisitions from NHAI, Railways &amp; MoRTH for forest land, structural overlaps, and master plan alignment.
          </p>
        </div>
      </div>

      {/* Main Grid: Proposal Queue & Detailed Review Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Pending Ingestion List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Incoming Proposals ({proposals.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Click to review</span>
          </div>

          <div className="space-y-2.5">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProposalId(prop.id)
                  setShowClarificationInput(false)
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedProposalId === prop.id
                    ? 'border-[#042A5E] bg-blue-50/50 ring-2 ring-blue-200 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#042A5E]">{prop.projectCode}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${
                      prop.status === 'CALA_Appointed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prop.status === 'Pending_State_Intake'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-[#042A5E]'
                    }`}
                  >
                    {prop.status === 'CALA_Appointed' ? 'CALA Appointed' : 'Pending Intake'}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-1 truncate">{prop.projectName}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>Agency: {prop.requiringAgency}</span>
                  <span className="font-bold text-slate-900">{prop.totalLandReqHectares} Ha</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Proposal Dossier & Structural Conflict Audit (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{activeProp.projectName}</h3>
                <span className="text-[10px] font-bold bg-[#042A5E] text-white px-2 py-0.5 rounded">
                  {activeProp.projectCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Submitted by: <strong>{activeProp.requiringAgency}</strong> · Date: <strong>{activeProp.submissionDate}</strong>
              </p>
            </div>

            {/* Conflict Tag */}
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold flex items-center gap-1 ${
                  activeProp.structuralConflictStatus === 'Clear'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {activeProp.structuralConflictStatus === 'Clear' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span>Conflict Status: {activeProp.structuralConflictStatus}</span>
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Districts</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{activeProp.targetDistricts.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Land Required</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{activeProp.totalLandReqHectares} Hectares</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Est. Compensation</span>
              <span className="font-bold text-[#042A5E] mt-0.5 block">₹{activeProp.estimatedCompensationCr} Cr</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">State Jurisdiction</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{activeProp.stateJurisdiction}</span>
            </div>
          </div>

          {/* Dossier Files Verification */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Submitted Statutory Files
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileText className="h-4 w-4 text-[#042A5E]" />
                  <span className="truncate max-w-[180px]">{activeProp.dprFileUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Opening ${activeProp.dprFileUrl}...`)}
                  className="text-xs font-bold text-[#042A5E] hover:underline cursor-pointer"
                >
                  View DPR
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="truncate max-w-[180px]">{activeProp.gisBoundaryFileUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Loading GIS boundary overlay for ${activeProp.gisBoundaryFileUrl}...`)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  View GIS
                </button>
              </div>
            </div>
          </div>

          {/* State Authority Remarks */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">State Nodal Review Notes:</span>
            <p className="text-slate-600">{activeProp.comments || 'No active remarks logged.'}</p>
          </div>

          {/* Clarification Input Form */}
          {showClarificationInput && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 animate-in fade-in-50">
              <label className="text-xs font-bold text-amber-900 block">
                Official Clarification Query to Requiring Agency:
              </label>
              <textarea
                rows={2}
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
                placeholder="Specify structural/forest conflict details or missing village survey numbers..."
                className="w-full rounded-lg border border-amber-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClarificationInput(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!clarificationText.trim()) return
                    onIssueClarification(activeProp.id, clarificationText)
                    setClarificationText('')
                    setShowClarificationInput(false)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  Send Query to {activeProp.requiringAgency}
                </button>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              Approved proposals will proceed directly to <strong>CALA Appointment &amp; District File Locking</strong>.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClarificationInput(!showClarificationInput)}
                className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Request Clarification
              </button>
              <button
                type="button"
                onClick={() => onApproveIntake(activeProp.id)}
                className="rounded-xl bg-[#042A5E] hover:bg-[#031B3D] text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span>Approve Intake &amp; Assign CALA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
