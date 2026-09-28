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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Statutory Land Acquisition Lifecycle
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Standardized 6-stage milestone tracker under RFCTLARR Act 2013 & National Highways Act 1956
        </p>
      </div>

      {/* Interactive Project Selector Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-[#991B1B]">
            <GitFork className="h-5 w-5" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Track Acquisition Progress for Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="mt-0.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-[#991B1B] focus:outline-none"
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
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Current Stage</span>
              <span className="inline-flex rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-bold text-[#991B1B]">
                {activeProject.currentStage}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Land Acquired</span>
              <span className="text-xs font-bold text-slate-800">
                {activeProject.landAcquiredHa} / {activeProject.landRequiredHa} Ha
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectProject(activeProject)}
              className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Full Dossier
            </button>
          </div>
        )}
      </div>

      {/* 6-Stage Visual Interactive Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`flex flex-col justify-between rounded-xl border p-5 transition-all shadow-2xs ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isCurrent
                  ? 'border-red-300 bg-red-50/40 ring-1 ring-red-200'
                  : 'border-slate-200 bg-white opacity-85'
              }`}
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#991B1B] text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        `0${index + 1}`
                      )}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {stageItem.stage}
                    </span>
                  </div>

                  {isCompleted && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Completed
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-[#991B1B] px-2 py-0.5 text-[10px] font-bold text-white">
                      Active Stage
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      Pending
                    </span>
                  )}
                </div>

                {/* Subtitle & Legal Reference */}
                <h4 className="mt-3 text-sm font-bold text-slate-900">
                  {stageItem.title}
                </h4>
                <span className="text-[11px] font-semibold text-[#991B1B] block mt-0.5">
                  {stageItem.legalSection}
                </span>

                {/* Description */}
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {stageItem.description}
                </p>
              </div>

              {/* Stage Metadata Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] space-y-1.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Standard Statutory SLA:</span>
                  <span className="font-semibold text-slate-800">{stageItem.standardSla}</span>
                </div>
                <div className="flex justify-between">
                  <span>Responsible Authority:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                    {stageItem.responsible}
                  </span>
                </div>
                {milestone?.completedDate && (
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                    <span>Completed on:</span>
                    <span>{milestone.completedDate}</span>
                  </div>
                )}
                {isCurrent && milestone && (
                  <div className="flex justify-between text-[#991B1B] font-semibold pt-1 border-t border-slate-100">
                    <span>SLA Days Elapsed:</span>
                    <span>{milestone.elapsedDays} / {milestone.slaDays} Days</span>
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
