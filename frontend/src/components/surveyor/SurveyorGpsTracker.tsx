import { useState } from 'react'
import {
  MapPin,
  Play,
  CheckCircle2,
} from 'lucide-react'
import type { FieldParcelTask } from '../../types/surveyor'

interface SurveyorGpsTrackerProps {
  parcel: FieldParcelTask
  onSaveGpsData: (measuredArea: number, variance: number, coordsCount: number, isDisputed: boolean) => void
}

export default function SurveyorGpsTracker({
  parcel,
  onSaveGpsData,
}: SurveyorGpsTrackerProps) {
  const [isWalking, setIsWalking] = useState(false)
  const [waypoints, setWaypoints] = useState<Array<{ lat: number; lng: number; time: string }>>([
    { lat: 18.5794, lng: 73.9812, time: '16:20:15' },
    { lat: 18.5798, lng: 73.9825, time: '16:25:30' },
    { lat: 18.5785, lng: 73.9831, time: '16:32:10' },
  ])
  const [isDisputed, setIsDisputed] = useState(parcel.isDisputedBoundary)
  const [disputeNote, setDisputeNote] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleDropWaypoint = () => {
    const lat = Number((18.578 + Math.random() * 0.003).toFixed(5))
    const lng = Number((73.981 + Math.random() * 0.003).toFixed(5))
    const time = new Date().toLocaleTimeString()
    setWaypoints((prev) => [...prev, { lat, lng, time }])
  }

  const handleFinishWalk = () => {
    setIsWalking(false)
    const measuredArea = Number((parcel.prescribedAreaHectares * (0.98 + Math.random() * 0.03)).toFixed(2))
    const variance = Number(
      Math.abs(((measuredArea - parcel.prescribedAreaHectares) / parcel.prescribedAreaHectares) * 100).toFixed(2)
    )

    onSaveGpsData(measuredArea, variance, waypoints.length, isDisputed)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  const measured = parcel.measuredAreaHectares || 1.82
  const variance = parcel.variancePercentage || 1.08

  return (
    <div className="space-y-4">
      {/* Active Parcel Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black text-[#042A5E]">
            {parcel.khasraGatNumber}
          </span>
          <span className="rounded-full bg-blue-50 text-[#042A5E] px-2 py-0.5 text-[10px] font-bold border border-blue-200">
            {parcel.village}, {parcel.tehsil}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-800">
          RoR Landholder: {parcel.ownerNameRecord}
        </div>
        <div className="text-[11px] text-slate-500">
          7/12 Prescribed Area: <strong>{parcel.prescribedAreaHectares} Hectares</strong>
        </div>
      </div>

      {/* GPS Boundary Walk Canvas Mockup */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 h-64 flex flex-col justify-between p-3 text-white shadow-inner">
        {/* Map Top Status */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur px-2.5 py-1 text-[11px] font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>GPS Tracking Active</span>
          </div>
          <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-mono">
            {waypoints.length} Points Logged
          </span>
        </div>

        {/* Simulated Polygon Wireframe */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <div className="relative w-48 h-40 border-2 border-emerald-400 border-dashed rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <div className="text-center">
              <span className="text-[11px] font-black text-emerald-300 block">
                {parcel.khasraGatNumber}
              </span>
              <span className="text-[10px] font-mono text-white/80">
                Area: {measured} Ha
              </span>
            </div>
            {/* Waypoint markers */}
            <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] font-bold text-slate-900">
              P1
            </div>
            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] font-bold text-slate-900">
              P2
            </div>
            <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] font-bold text-slate-900">
              P3
            </div>
            <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] font-bold text-slate-900">
              P4
            </div>
          </div>
        </div>

        {/* Walk Controls Bar */}
        <div className="flex items-center justify-between gap-2 z-10">
          {!isWalking ? (
            <button
              type="button"
              onClick={() => setIsWalking(true)}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Play className="h-4 w-4 fill-white" />
              Start Boundary Walk
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDropWaypoint}
                className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 px-3 text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Drop GPS Waypoint
              </button>
              <button
                type="button"
                onClick={handleFinishWalk}
                className="rounded-xl bg-red-600 hover:bg-red-700 py-2.5 px-3 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Finish
              </button>
            </>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Boundary polygon &amp; GPS coordinates recorded locally!</span>
        </div>
      )}

      {/* Cadastral Area vs Prescribed 7/12 Variance Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Area Reconciliation &amp; Tolerance
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              7/12 Record Area
            </span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">
              {parcel.prescribedAreaHectares} Ha
            </span>
          </div>

          <div className="rounded-xl bg-blue-50 p-3 border border-blue-200">
            <span className="text-[10px] text-blue-800 font-bold uppercase block">
              Measured GPS Area
            </span>
            <span className="text-sm font-black text-[#042A5E] mt-0.5 block">
              {measured} Ha
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-600">Measurement Variance:</span>
          <span
            className={`font-mono font-bold ${
              variance < 3.0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {variance}% ({variance < 3.0 ? 'Within Statutory Tolerance' : 'Discrepancy Flagged'})
          </span>
        </div>
      </div>

      {/* Boundary Dispute Toggle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">Flag Boundary Dispute</h4>
            <p className="text-[10px] text-slate-500">
              Encroachment or physical overlap with neighboring Khasra
            </p>
          </div>
          <input
            type="checkbox"
            checked={isDisputed}
            onChange={(e) => setIsDisputed(e.target.checked)}
            className="h-5 w-5 rounded text-red-600 focus:ring-red-500 cursor-pointer"
          />
        </div>

        {isDisputed && (
          <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in-50">
            <label className="block text-[11px] font-bold text-red-800">
              Dispute Description &amp; Disputing Party:
            </label>
            <textarea
              rows={2}
              value={disputeNote}
              onChange={(e) => setDisputeNote(e.target.value)}
              placeholder="e.g. Boundary dispute with southern neighbor Gat 142/2B over farm bund..."
              className="w-full rounded-lg border border-red-300 p-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
