import { useState } from 'react'
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Compass,
  CheckCircle2,
} from 'lucide-react'
import type { LandRecord } from '../../types/citizen'

interface ParcelMapWidgetProps {
  landRecord: LandRecord
}

export default function ParcelMapWidget({ landRecord }: ParcelMapWidgetProps) {
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'alignment'>('satellite')
  const [zoomLevel, setZoomLevel] = useState(100)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
              <MapPin className="h-3 w-3" /> GIS Parcel Visualization
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              ULPIN: {landRecord.ulpin}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Parcel Survey No. {landRecord.surveyNo}/{landRecord.subDivision}
          </h3>
          <p className="text-xs text-slate-500">
            {landRecord.village}, Taluka {landRecord.taluka}, District {landRecord.district}
          </p>
        </div>

        {/* Layer Selector */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
              activeLayer === 'satellite' ? 'bg-white text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('alignment')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
              activeLayer === 'alignment' ? 'bg-white text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expressway Alignment
          </button>
        </div>
      </div>

      {/* Interactive GIS SVG Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 min-h-[320px] flex-1 flex flex-col justify-between group">
        {/* Background Grid / Satellite Simulation */}
        <div
          className="absolute inset-0 transition-transform duration-300 pointer-events-none"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {activeLayer === 'satellite' ? (
            <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 opacity-90 relative">
              {/* Satellite texture simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-950 relative">
              {/* Grid lines */}
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}

          {/* SVG Map Drawings */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 350" preserveAspectRatio="xMidYMid meet">
            {/* Neighboring Parcels */}
            <path
              d="M 40,50 L 180,30 L 210,140 L 50,160 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="100" y="90" fill="#64748b" fontSize="10" fontWeight="bold">
              Sur. 141 (Patil)
            </text>

            <path
              d="M 380,40 L 470,60 L 460,200 L 360,180 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="390" y="120" fill="#64748b" fontSize="10" fontWeight="bold">
              Sur. 143 (Deshmukh)
            </text>

            {/* Total Citizen Parcel (Survey 142/2A) */}
            <path
              d="M 185,35 L 375,45 L 355,270 L 205,250 Z"
              fill="#065f46"
              fillOpacity="0.35"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            <text x="230" y="100" fill="#6ee7b7" fontSize="12" fontWeight="extrabold">
              Survey 142/2A (Total: 1.85 Ha)
            </text>
            <text x="230" y="116" fill="#a7f3d0" fontSize="10">
              Owner: Rajesh Kumar & Joint
            </text>

            {/* Acquired Buffer Strip (Expressway Corridor Alignment) */}
            <path
              d="M 195,140 L 365,150 L 358,230 L 200,215 Z"
              fill="#b91c1c"
              fillOpacity="0.55"
              stroke="#ef4444"
              strokeWidth="3"
            />
            <text x="215" y="180" fill="#fca5a5" fontSize="12" fontWeight="extrabold">
              Acquired Area: 0.65 Ha (4-Lane Corridor)
            </text>

            {/* Expressway Center Line */}
            {activeLayer === 'alignment' && (
              <path
                d="M 10,185 L 490,200"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="8 4"
              />
            )}

            {/* Pins & Points */}
            <circle cx="280" cy="185" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x="290" y="190" fill="#fbbf24" fontSize="10" fontWeight="bold">
              GPS Marker #P-89
            </text>
          </svg>
        </div>

        {/* Map Top Control Overlay */}
        <div className="relative z-10 flex items-center justify-between p-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">GIS Parcel Map</span>
            <span className="text-[11px] text-slate-400">Scale 1:500</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded cursor-pointer text-[10px] font-bold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Map Bottom Legend Overlay */}
        <div className="relative z-10 p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-500/40 border border-emerald-400" />
              <span className="text-[11px] font-medium text-slate-200">Total Ownership (1.85 Ha)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-rose-500/60 border border-rose-400" />
              <span className="text-[11px] font-bold text-rose-300">Acquired Corridor (0.65 Ha)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-700/80 border border-emerald-500" />
              <span className="text-[11px] font-medium text-slate-200">Retained Land (1.20 Ha)</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Compass className="h-3 w-3 text-amber-400" /> WGS84 EPSG:4326 Datum
          </div>
        </div>
      </div>

      {/* Land Metadata Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="block text-[11px] font-semibold text-slate-500">Total Land Area</span>
          <span className="text-sm font-extrabold text-slate-900">
            {landRecord.totalAreaHa} Ha <span className="text-xs font-normal text-slate-500">({landRecord.totalAreaAcres} Acres)</span>
          </span>
        </div>

        <div className="rounded-xl bg-rose-50 p-3 border border-rose-100">
          <span className="block text-[11px] font-semibold text-rose-700">Acquired Area</span>
          <span className="text-sm font-extrabold text-rose-900">
            {landRecord.acquiredAreaHa} Ha <span className="text-xs font-normal text-rose-700">(35.1% of parcel)</span>
          </span>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
          <span className="block text-[11px] font-semibold text-emerald-700">7/12 Extract Status</span>
          <span className="text-sm font-extrabold text-emerald-900 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified
          </span>
        </div>

        <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
          <span className="block text-[11px] font-semibold text-amber-800">Land Category</span>
          <span className="text-xs font-bold text-amber-950 truncate block" title={landRecord.landCategory}>
            {landRecord.landCategory}
          </span>
        </div>
      </div>
    </div>
  )
}
