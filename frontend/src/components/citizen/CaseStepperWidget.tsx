import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  FileText,
  User,
  Calendar,
  Info,
  Award,
} from 'lucide-react'
import type { StepperStep } from '../../types/citizen'

interface CaseStepperWidgetProps {
  steps: StepperStep[]
  caseId: string
  projectName: string
}

export default function CaseStepperWidget({
  steps,
  caseId,
  projectName,
}: CaseStepperWidgetProps) {
  const [selectedStep, setSelectedStep] = useState<StepperStep>(
    steps.find((s) => s.status === 'current') || steps[3]
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              Case ID: {caseId}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Acquisition Case
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
            Acquisition Lifecycle Stepper
          </h2>
          <p className="text-xs text-slate-500 font-medium">{projectName}</p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Current Status</div>
          <div className="text-sm font-extrabold text-amber-600 flex items-center gap-1 sm:justify-end">
            <Award className="h-4 w-4" />
            Stage 4: Compensation Award Determined
          </div>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="py-6 overflow-x-auto no-scrollbar">
        <div className="min-w-[680px] flex items-center justify-between relative px-4">
          {/* Progress Line */}
          <div className="absolute top-5 left-10 right-10 h-1 bg-slate-200 -z-0">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-amber-500 w-[60%] transition-all duration-500" />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'
            const isSelected = selectedStep.id === step.id

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelectedStep(step)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all shadow-xs ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                      ? 'border-amber-500 bg-amber-500 text-slate-950 ring-4 ring-amber-100 font-extrabold'
                      : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : isCurrent ? (
                    <Clock className="h-6 w-6 text-slate-950 animate-spin-slow" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'text-amber-600 font-extrabold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium max-w-[95px] truncate">
                    {step.date || 'Pending'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail Card for Selected Step */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 mt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                selectedStep.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedStep.status === 'current'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Info className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {selectedStep.label} Detailed Breakdown
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    selectedStep.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedStep.status === 'current'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {selectedStep.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{selectedStep.subtitle}</p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {selectedStep.date && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold">Execution Date:</span> {selectedStep.date}
                  </div>
                )}
                {selectedStep.officer && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold">Responsible Official:</span>{' '}
                    {selectedStep.officer}
                  </div>
                )}
                {selectedStep.refDoc && (
                  <div className="flex items-center gap-1.5 text-slate-700 sm:col-span-2">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-semibold">Reference Notice:</span>{' '}
                    <span className="text-amber-800 font-medium underline">
                      {selectedStep.refDoc}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="h-4 w-4" />
              Download Stage Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
