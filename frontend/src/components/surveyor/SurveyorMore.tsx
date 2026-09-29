import { useState } from 'react'
import {
  CloudUpload,
  Sliders,
  CheckCircle2,
  Mic,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import type { FieldParcelTask, SurveyorPreferences } from '../../types/surveyor'

interface SurveyorMoreProps {
  parcels: FieldParcelTask[]
  preferences: SurveyorPreferences
  onUpdatePreferences: (prefs: Partial<SurveyorPreferences>) => void
  onSyncAll: () => void
  isOnline: boolean
  onNavigateToLegal?: () => void
}

export default function SurveyorMore({
  parcels,
  preferences,
  onUpdatePreferences,
  onSyncAll,
  isOnline,
  onNavigateToLegal,
}: SurveyorMoreProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncToast, setSyncToast] = useState<string | null>(null)

  const cachedParcels = parcels.filter((p) => p.offlineCached)

  const handleTriggerSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      onSyncAll()
      setIsSyncing(false)
      setSyncToast('All local survey records synced to Maharashtra State Revenue Cloud!')
      setTimeout(() => setSyncToast(null), 3000)
    }, 1200)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          More &amp; Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Customise your field workflow, manage offline sync, and review SOPs.
        </p>
      </div>

      {syncToast && (
        <div className="rounded-xl bg-emerald-900 text-white p-3 text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 1. Offline Storage & Sync Queue Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5 text-[#042A5E]" />
            <div>
              <h3 className="text-sm font-black text-slate-900">Offline Storage &amp; Sync</h3>
              <p className="text-xs text-slate-500">
                {cachedParcels.length} survey records saved locally in browser DB
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <button
          type="button"
          disabled={cachedParcels.length === 0 || isSyncing}
          onClick={handleTriggerSync}
          className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] active:scale-[0.99] disabled:opacity-50 text-white py-3 px-4 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing with State Cloud...' : `Sync ${cachedParcels.length} Records to State Cloud`}</span>
        </button>
      </div>

      {/* 2. My Preferences (Survey Mode, Appearance, Text Size, Voice) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="h-4 w-4 text-[#042A5E]" />
          <h3 className="text-sm font-black text-slate-900">Surveyor Preferences</h3>
        </div>

        {/* Survey Mode (Guided vs Compact) */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Survey Mode</div>
            <div className="text-[11px] text-slate-500">
              {preferences.surveyMode === 'guided' ? 'Guided (Step-by-step questions)' : 'Compact (Fast single-screen form)'}
            </div>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => onUpdatePreferences({ surveyMode: 'guided' })}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                preferences.surveyMode === 'guided' ? 'bg-white text-[#042A5E] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Guided
            </button>
            <button
              type="button"
              onClick={() => onUpdatePreferences({ surveyMode: 'compact' })}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                preferences.surveyMode === 'compact' ? 'bg-white text-[#042A5E] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* Text Size (Medium vs Large) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-800">Outdoor Text Size</div>
            <div className="text-[11px] text-slate-500">High contrast readability in direct sunlight</div>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => onUpdatePreferences({ textSize: 'medium' })}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                preferences.textSize === 'medium' ? 'bg-white text-[#042A5E] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => onUpdatePreferences({ textSize: 'large' })}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                preferences.textSize === 'large' ? 'bg-white text-[#042A5E] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Large (18px)
            </button>
          </div>
        </div>

        {/* Voice Input Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#042A5E]" />
            <div>
              <div className="text-xs font-bold text-slate-800">Voice Dictation (Marathi / English)</div>
              <div className="text-[11px] text-slate-500">Speak observations directly in the field</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdatePreferences({ voiceInput: !preferences.voiceInput })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              preferences.voiceInput ? 'bg-[#042A5E]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.voiceInput ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto Save Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-800">Automatic Local Autosave</div>
            <div className="text-[11px] text-slate-500">Never lose field notes on low battery</div>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Always ON
          </span>
        </div>
      </div>

      {/* 3. Field SOP & Help */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#042A5E]" />
          <h3 className="text-sm font-black text-slate-900">RFCTLARR Cadastral Field Manual</h3>
        </div>
        <p className="text-xs text-slate-500">
          Standard Operating Procedure for Joint Measurement Surveys (JMS) under Maharashtra Land Revenue Code &amp; Section 11 RFCTLARR Act 2013.
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#042A5E]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Government of Maharashtra
          </span>
          <span className="text-slate-400">v2.4 Certified</span>
        </div>
      </div>

      {/* 4. Field Legal Guidance RAG Copilot */}
      {onNavigateToLegal && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-700" />
              <h3 className="text-sm font-black text-indigo-950">Field Legal Guidance</h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              RAG AI
            </span>
          </div>
          <p className="text-xs text-indigo-900">
            Query RFCTLARR statutory rules, boundary walk protocols, tree valuation rules, and village revenue norms.
          </p>
          <button
            type="button"
            onClick={onNavigateToLegal}
            className="w-full rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Launch Field Legal Guidance &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
