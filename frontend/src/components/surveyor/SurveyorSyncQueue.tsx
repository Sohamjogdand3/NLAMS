import { useState } from 'react'
import {
  CloudUpload,
  CheckCircle2,
  HardDrive,
} from 'lucide-react'
import type { FieldParcelTask } from '../../types/surveyor'

interface SurveyorSyncQueueProps {
  parcels: FieldParcelTask[]
  isOnline: boolean
  onSyncAll: () => void
}

export default function SurveyorSyncQueue({
  parcels,
  isOnline,
  onSyncAll,
}: SurveyorSyncQueueProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('')

  const cachedParcels = parcels.filter((p) => p.offlineCached)

  const handleTriggerSync = () => {
    if (!isOnline) {
      alert('Device is currently in Offline mode. Reconnect network to sync records.')
      return
    }

    setIsSyncing(true)
    setTimeout(() => {
      onSyncAll()
      setIsSyncing(false)
      setSyncSuccessMsg('All offline survey tasks synchronized with State DILRMP & CALA Registry!')
      setTimeout(() => setSyncSuccessMsg(''), 4000)
    }, 1200)
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
            <HardDrive className="h-4 w-4 text-[#042A5E]" />
            Offline Survey Storage &amp; Sync Queue
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isOnline
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {isOnline ? 'Online Gateway' : 'Offline Local Mode'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Surveys performed in remote areas without cellular coverage are encrypted in local device SQLite storage and automatically synchronized when connectivity returns.
        </p>
      </div>

      {syncSuccessMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Sync Button */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">
              {cachedParcels.length} Surveys Queued in Local Storage
            </div>
            <div className="text-[11px] text-slate-500">
              Includes GPS polygons, tree counts, and signed occupant KYC
            </div>
          </div>
          <button
            type="button"
            disabled={isSyncing || cachedParcels.length === 0}
            onClick={handleTriggerSync}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#07397b] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <CloudUpload className={`h-4 w-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Pushing to Cloud...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Queued Items List */}
      <div className="space-y-3">
        {cachedParcels.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-[#042A5E]">
                {p.khasraGatNumber}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[9.5px] font-bold text-slate-700">
                {p.surveyStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-800">{p.ownerNameRecord}</div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                GPS Points: <strong>{p.gpsCoordinatesCount}</strong> • Photos: <strong>{p.photoCount}</strong>
              </span>
              <span>{p.lastSurveyTimestamp || 'Recent'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
