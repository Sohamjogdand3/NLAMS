import { useState } from 'react'
import {
  Layers,
  Info,
} from 'lucide-react'
import type { AffectedVillage, ParcelInfo } from '../../types/district'
import { MOCK_AFFECTED_VILLAGES, MOCK_PARCELS_INFO } from '../../data/mockDistrictData'

export default function DistrictGisMap() {
  const [villages] = useState<AffectedVillage[]>(MOCK_AFFECTED_VILLAGES)
  const [parcels] = useState<ParcelInfo[]>(MOCK_PARCELS_INFO)
  const [selectedVillage, setSelectedVillage] = useState<AffectedVillage | null>(villages[0])
  const [selectedParcel, setSelectedParcel] = useState<ParcelInfo | null>(parcels[0])
  const [filterTehsil, setFilterTehsil] = useState<string>('all')

  const filteredParcels = parcels.filter((p) => filterTehsil === 'all' || p.tehsil === filterTehsil)

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#042A5E] px-2.5 py-0.5 text-xs font-bold text-white">
              GIS Cadastral Spatial Map
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Pune Collectorate Jurisdiction
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            District-Wide Land Acquisition &amp; Parcel Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial visualization of affected villages, survey numbers, and land acquisition progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterTehsil}
            onChange={(e) => setFilterTehsil(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#042A5E] focus:outline-none"
          >
            <option value="all">All Tehsils (Haveli, Khed, Shirur)</option>
            <option value="Haveli">Tehsil: Haveli</option>
            <option value="Khed">Tehsil: Khed</option>
            <option value="Shirur">Tehsil: Shirur</option>
            <option value="Maval">Tehsil: Maval</option>
          </select>
        </div>
      </div>

      {/* Main Map + Details Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive GIS Spatial Canvas Widget */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-[#0A192F] p-5 shadow-md flex flex-col justify-between min-h-[500px] relative overflow-hidden">
          {/* Map Controls Header */}
          <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 z-10">
            <div className="flex items-center gap-2 text-white">
              <Layers className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold">Live Cadastral Layer: 7/12 Land Records + GIS Corridor</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-300 font-bold">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Acquired (864 Ha)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> In Progress (556 Ha)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Pending Scrutiny
              </span>
            </div>
          </div>

          {/* Interactive Cadastral Map Polygon Simulation */}
          <div className="my-auto py-8 flex items-center justify-center relative">
            <svg viewBox="0 0 800 450" className="w-full max-w-2xl h-auto drop-shadow-2xl">
              {/* Outer Corridor Boundary Line */}
              <path
                d="M 120 180 Q 250 80 480 120 T 700 240 L 650 380 Q 400 420 180 340 Z"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="2"
                strokeDasharray="6,6"
              />

              {/* Village Polygon 1: Wagholi */}
              <polygon
                points="180,140 320,110 360,220 220,260"
                fill="#047857"
                fillOpacity="0.75"
                stroke="#A7F3D0"
                strokeWidth="2"
                className="cursor-pointer hover:fill-opacity-95 transition-all"
                onClick={() => setSelectedVillage(villages[0])}
              />
              <text x="250" y="180" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                Wagholi (78 Ha)
              </text>

              {/* Village Polygon 2: Lonikand */}
              <polygon
                points="330,110 490,90 520,200 370,220"
                fill="#D97706"
                fillOpacity="0.75"
                stroke="#FDE68A"
                strokeWidth="2"
                className="cursor-pointer hover:fill-opacity-95 transition-all"
                onClick={() => setSelectedVillage(villages[1])}
              />
              <text x="410" y="160" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                Lonikand (65 Ha)
              </text>

              {/* Village Polygon 3: Kadamwakabadi */}
              <polygon
                points="220,270 370,230 420,360 250,380"
                fill="#047857"
                fillOpacity="0.85"
                stroke="#A7F3D0"
                strokeWidth="2"
                className="cursor-pointer hover:fill-opacity-95 transition-all"
                onClick={() => setSelectedVillage(villages[2])}
              />
              <text x="290" y="300" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                Kadamwakabadi (54 Ha)
              </text>

              {/* Village Polygon 4: Chakan Industrial */}
              <polygon
                points="500,90 680,120 640,250 530,200"
                fill="#DC2626"
                fillOpacity="0.75"
                stroke="#FECACA"
                strokeWidth="2"
                className="cursor-pointer hover:fill-opacity-95 transition-all"
                onClick={() => setSelectedVillage(villages[4])}
              />
              <text x="560" y="160" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                Chakan (42 Ha)
              </text>
            </svg>
          </div>

          {/* Footer Instruction Note */}
          <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs text-slate-300 z-10">
            <span className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-amber-400" />
              Click any village polygon to inspect survey numbers &amp; acquisition status
            </span>
            <span className="font-bold text-amber-400">CRS: EPSG:4326 (WGS84)</span>
          </div>
        </div>

        {/* Affected Villages & Survey Parcel Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Affected Village Detail Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selected Village Spatial Details
            </h3>

            {selectedVillage ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-base font-extrabold text-[#042A5E]">
                      {selectedVillage.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-semibold">
                      Tehsil: {selectedVillage.tehsil}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                    {selectedVillage.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Total Land</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedVillage.areaHectares} Ha</span>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2.5 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-semibold">Acquired</span>
                    <span className="font-bold text-emerald-900 text-sm">{selectedVillage.acquiredHectares} Ha</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Parcels Count:</span>
                  <span className="font-bold text-slate-900">{selectedVillage.parcelsCount} Survey Numbers</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a village polygon from map</p>
            )}
          </div>

          {/* Survey Parcel Search & Inspection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              7/12 Land Parcel Matrix
            </h3>

            <div className="space-y-2">
              {filteredParcels.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedParcel(p)}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedParcel?.id === p.id
                      ? 'border-[#042A5E] bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{p.surveyNo} ({p.village})</span>
                    <span className="text-[#042A5E]">₹{(p.compensationAmount / 100000).toFixed(2)} Lakh</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Owner: {p.ownerName}</span>
                    <span className="font-semibold text-slate-700">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
