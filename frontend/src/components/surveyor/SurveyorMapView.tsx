import { useState } from 'react'
import { Compass, Crosshair, ChevronRight } from 'lucide-react'
import type { FieldParcelTask } from '../../types/surveyor'

interface SurveyorMapViewProps {
  parcels: FieldParcelTask[]
  onOpenSurvey: (parcelId: string) => void
}

export default function SurveyorMapView({ parcels, onOpenSurvey }: SurveyorMapViewProps) {
  const [selectedParcel, setSelectedParcel] = useState<FieldParcelTask | null>(parcels[0] || null)
  const [isLocating, setIsLocating] = useState(false)
  const [accuracy, setAccuracy] = useState(3.2)

  const handleLocateMe = () => {
    setIsLocating(true)
    setTimeout(() => {
      setIsLocating(false)
      setAccuracy(2.8)
    }, 800)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cadastral Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Wagholi Village Cadastral Sheet #4 • Alignment Corridor
          </p>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Crosshair className={`h-3.5 w-3.5 text-[#042A5E] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Fixing...' : `GPS ±${accuracy}m`}</span>
        </button>
      </div>

      {/* Simulated Interactive GIS / Map Canvas */}
      <div className="relative h-[380px] w-full rounded-2xl border border-slate-300 bg-slate-900 overflow-hidden shadow-inner flex flex-col justify-between p-3.5">
        {/* Background Cadastral Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-80" />

        {/* Corridor Route Line */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          <path
            d="M 20 280 Q 150 160 380 90"
            fill="none"
            stroke="#EF4444"
            strokeWidth="8"
            strokeDasharray="6 4"
            opacity="0.8"
          />
          <path
            d="M 20 280 Q 150 160 380 90"
            fill="none"
            stroke="#FCA5A5"
            strokeWidth="32"
            opacity="0.25"
          />
        </svg>

        {/* Map Header Floating Overlay */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="rounded-lg bg-black/70 backdrop-blur px-2.5 py-1 text-[10px] font-mono font-bold text-white flex items-center gap-1.5">
            <Compass className="h-3 w-3 text-emerald-400" />
            <span>18.5794° N, 73.9842° E</span>
          </div>
          <div className="rounded-lg bg-black/70 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-amber-300">
            NHAI Ring Road RoW (60m)
          </div>
        </div>

        {/* Parcel Polygons / Markers */}
        <div className="relative z-10 grid grid-cols-2 gap-3 my-auto">
          {parcels.map((p) => {
            const isSelected = selectedParcel?.id === p.id
            return (
              <div
                key={p.id}
                onClick={() => setSelectedParcel(p)}
                className={`p-2.5 rounded-xl backdrop-blur transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#042A5E]/90 border-2 border-amber-400 text-white shadow-lg scale-105'
                    : 'bg-black/60 border border-white/20 text-white/90 hover:bg-black/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black">{p.khasraGatNumber}</span>
                  <span className="text-[9px] font-bold text-amber-300">{p.prescribedAreaHectares} Ha</span>
                </div>
                <div className="text-[10px] font-medium truncate mt-0.5 opacity-90">{p.ownerNameRecord}</div>
              </div>
            )
          })}
        </div>

        {/* Map Legend Footer */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-white/80 bg-black/70 backdrop-blur rounded-lg px-2.5 py-1.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Acquisition RoW
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Boundary Stone
            </span>
          </div>
          <span>Scale 1:2500</span>
        </div>
      </div>

      {/* Selected Parcel Quick Card */}
      {selectedParcel && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase font-mono">Selected Cadastral Parcel</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {selectedParcel.khasraGatNumber} — {selectedParcel.village}
              </h3>
              <p className="text-xs text-slate-600">
                {selectedParcel.ownerNameRecord} • {selectedParcel.prescribedAreaHectares} Ha
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenSurvey(selectedParcel.id)}
              className="rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white px-3.5 py-2.5 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Survey</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
