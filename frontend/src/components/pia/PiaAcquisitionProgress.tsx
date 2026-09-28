import { useState } from 'react'
import {
  GitFork,
  CheckCircle2,
} from 'lucide-react'
import type { PiaProject, StatutoryStage } from '../../types/pia'

interface PiaAcquisitionProgressProps {
  projects: PiaProject[]
  onSelectProject: (project: PiaProject) => void
}

export default function PiaAcquisitionProgress({
  projects,
  onSelectProject,
}: PiaAcquisitionProgressProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0]

  const stagesMetadata: {
    stage: StatutoryStage
    title: string
    legalSection: string
    description: string
    standardSla: string
    responsible: string
  }[] = [
    {
      stage: 'Proposal',
      title: 'Project Requisition & PFR',
      legalSection: 'Pre-statutory Preparation',
      description:
        'Alignment delineation, village cadastral list compilation, boundary coordinates, and formal requisition submission to the Competent Authority.',
      standardSla: '30 Days',
      responsible: 'Project Implementing Agency (PIA)',
    },
    {
      stage: 'Scrutiny',
      title: 'Revenue & Cadastral Scrutiny',
      legalSection: 'Collector / CALA Scrutiny',
      description:
        'District revenue verification against Bhulekh land records, field boundary matching, identifying dispute-free khasras and forest patches.',
      standardSla: '45 Days',
      responsible: 'CALA / Sub-Divisional Magistrate',
    },
    {
      stage: 'Notification',
      title: 'Preliminary & Final Gazette Notification',
      legalSection: 'Section 3A & 3D (NH Act) / Sec 11 & 19 (RFCTLARR)',
      description:
        'Publication of preliminary intention in Gazette of India and local newspapers. 21-day public objection period under Sec 3C followed by Final Declaration.',
      standardSla: '60 Days',
      responsible: 'Ministry of Road Transport & Highways / CALA',
    },
    {
      stage: 'Award',
      title: 'Joint Measurement Survey & Valuation',
      legalSection: 'Section 3G (NH Act) / Sec 23 (RFCTLARR)',
      description:
        'Joint ground survey (JMS) with landowners, structure valuation, tree enumeration, applying circle rate multiplier and 100% Solatium.',
      standardSla: '90 Days',
      responsible: 'CALA Valuation Division & Revenue Tehsildar',
    },
    {
      stage: 'Compensation',
      title: 'Direct Benefit Transfer (DBT)',
      legalSection: 'Section 3H (NH Act) / Sec 77 (RFCTLARR)',
      description:
        'PIA deposits sanctioned compensation into CALA Escrow Account. Immediate e-disbursement to verified bank accounts of khatedars via PFMS.',
      standardSla: '45 Days',
      responsible: 'CALA Disbursement Cell & State Treasury',
    },
    {
      stage: 'Possession',
      title: 'Vesting & Physical Site Handover',
      legalSection: 'Section 3E (NH Act) / Sec 38 (RFCTLARR)',
      description:
        'Land vests absolutely in Central Government free from all encumbrances. Formal possession certificate issued to PIA for civil construction work.',
      standardSla: '30 Days',
      responsible: 'District Administration to PIA Project Director',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Statutory Land Acquisition Lifecycle
          </h2>
          <p className="text-xs text-slate-500">
            Standardized 6-stage milestone tracker under RFCTLARR Act 2013 &amp; NH Act 1956
          </p>
        </div>
      </div>

      {/* Interactive Project Selector Banner (Compact) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-50 text-[#991B1B]">
            <GitFork className="h-4 w-4" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Track Progress for Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="mt-0.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-900 focus:border-[#991B1B] focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeProject && (
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2.5 md:pt-0 md:pl-3.5">
            <div>
              <span className="text-[9.5px] text-slate-400 font-bold block">Current Stage</span>
              <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-[#991B1B]">
                {activeProject.currentStage}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 font-bold block">Land Acquired</span>
              <span className="text-[11px] font-bold text-slate-800">
                {activeProject.landAcquiredHa} / {activeProject.landRequiredHa} Ha
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectProject(activeProject)}
              className="rounded-lg bg-slate-900 text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Full Dossier
            </button>
          </div>
        )}
      </div>

      {/* 6-Stage Visual Interactive Timeline (Ultra-Compact Modern 6-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {stagesMetadata.map((stageItem, index) => {
          // Check milestone status on the selected project
          const milestone = activeProject?.statutoryMilestones.find(
            (m) => m.stage === stageItem.stage
          )
          const isCompleted = milestone?.status === 'completed'
          const isCurrent = milestone?.status === 'current'
          const isUpcoming = !isCompleted && !isCurrent

          return (
            <div
              key={stageItem.stage}
              className={`flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150 shadow-2xs hover:shadow-sm ${
                isCompleted
                  ? 'border-emerald-200/90 bg-gradient-to-b from-emerald-50/25 to-white'
                  : isCurrent
                  ? 'border-red-300 bg-gradient-to-b from-red-50/40 to-white ring-1 ring-red-200/80 shadow-xs'
                  : 'border-slate-200/80 bg-white opacity-90'
              }`}
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9.5px] font-black ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#991B1B] text-white shadow-2xs animate-pulse'
                          : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        `0${index + 1}`
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      {stageItem.stage}
                    </span>
                  </div>

                  {isCompleted && (
                    <span className="rounded bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-800 shrink-0">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded bg-[#991B1B] px-1.5 py-0.5 text-[8.5px] font-bold text-white shadow-2xs shrink-0">
                      Active
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-semibold text-slate-400 shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                {/* Subtitle & Legal Reference */}
                <h4 className="mt-1.5 text-xs font-bold text-slate-900 leading-snug line-clamp-1" title={stageItem.title}>
                  {stageItem.title}
                </h4>
                <span className="text-[9.5px] font-semibold text-[#991B1B] block truncate mt-0.5" title={stageItem.legalSection}>
                  {stageItem.legalSection}
                </span>

                {/* Description */}
                <p className="mt-1 text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                  {stageItem.description}
                </p>
              </div>

              {/* Stage Metadata Footer */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9.5px] space-y-0.5 text-slate-500">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">SLA:</span>
                  <span className="font-semibold text-slate-700">{stageItem.standardSla}</span>
                </div>
                {milestone?.completedDate && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Done:</span>
                    <span className="truncate">{milestone.completedDate}</span>
                  </div>
                )}
                {isCurrent && milestone && (
                  <div className="flex justify-between items-center text-[#991B1B] font-bold">
                    <span>Elapsed:</span>
                    <span>{milestone.elapsedDays}/{milestone.slaDays}d</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
