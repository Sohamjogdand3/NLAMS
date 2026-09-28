import { useState } from 'react'
import {
  Trees,
  Camera,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react'
import type { FieldParcelTask, GeotaggedPhoto } from '../../types/surveyor'
import { MOCK_GEOTAGGED_PHOTOS } from '../../data/mockSurveyorData'

interface SurveyorAssetAuditProps {
  parcel: FieldParcelTask
  onSaveAssets: (trees: FieldParcelTask['treesSurveyed'], structures: FieldParcelTask['structuresCount'], photoCount: number) => void
}

export default function SurveyorAssetAudit({
  parcel,
  onSaveAssets,
}: SurveyorAssetAuditProps) {
  const [timberTrees, setTimberTrees] = useState(parcel.treesSurveyed?.timberTrees || 0)
  const [fruitTrees, setFruitTrees] = useState(parcel.treesSurveyed?.fruitBearingTrees || 0)
  const [borewells, setBorewells] = useState(parcel.structuresCount?.borewells || 0)
  const [puccaHouses, setPuccaHouses] = useState(parcel.structuresCount?.puccaStructures || 0)
  const [farmPonds, setFarmPonds] = useState(parcel.structuresCount?.farmPonds || 0)
  const [fencingMeters, setFencingMeters] = useState(parcel.structuresCount?.fencingMeters || 0)

  const [photos, setPhotos] = useState<GeotaggedPhoto[]>(MOCK_GEOTAGGED_PHOTOS)
  const [showSavedMsg, setShowSavedMsg] = useState(false)

  const handleCapturePhoto = () => {
    const newPh: GeotaggedPhoto = {
      id: `PH-00${photos.length + 1}`,
      caption: `Field Snapshot of ${parcel.khasraGatNumber}`,
      category: 'Crop / Trees',
      latitude: 18.5793,
      longitude: 73.9815,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      thumbnailUrl: '/land-acquisition-hero.jpg',
    }
    setPhotos((prev) => [newPh, ...prev])
  }

  const handleSave = () => {
    onSaveAssets(
      { timberTrees, fruitBearingTrees: fruitTrees },
      { puccaStructures: puccaHouses, borewells, farmPonds, fencingMeters },
      photos.length
    )
    setShowSavedMsg(true)
    setTimeout(() => setShowSavedMsg(false), 3500)
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
            <Trees className="h-4 w-4 text-emerald-700" />
            Asset &amp; Tree Valuation Audit
          </h3>
          <span className="font-mono text-xs font-bold text-[#042A5E]">
            {parcel.khasraGatNumber}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Enumerate all standing timber/fruit trees, agricultural borewells, and civil structures for CALA compensation determination.
        </p>
      </div>

      {showSavedMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Asset inventory &amp; photos saved to local survey cache!</span>
        </div>
      )}

      {/* Tree Counter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Tree Inventory Counter
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fruit-bearing trees */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Fruit-Bearing Trees</span>
              <span className="text-[10px] text-slate-400">Mango, Guava, Coconut</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFruitTrees((v) => Math.max(0, v - 1))}
                className="h-7 w-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-sm font-black text-slate-900 w-6 text-center">
                {fruitTrees}
              </span>
              <button
                type="button"
                onClick={() => setFruitTrees((v) => v + 1)}
                className="h-7 w-7 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold hover:bg-[#07397b]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Timber trees */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Timber Trees</span>
              <span className="text-[10px] text-slate-400">Teak, Sal, Babool, Neem</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimberTrees((v) => Math.max(0, v - 1))}
                className="h-7 w-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-sm font-black text-slate-900 w-6 text-center">
                {timberTrees}
              </span>
              <button
                type="button"
                onClick={() => setTimberTrees((v) => v + 1)}
                className="h-7 w-7 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold hover:bg-[#07397b]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Built Structures Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Structures &amp; Infrastructure Inventory
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Borewells */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Borewells / Tube Wells</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBorewells((v) => Math.max(0, v - 1))}
                className="h-6 w-6 rounded bg-white border border-slate-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="font-mono font-bold w-4 text-center">{borewells}</span>
              <button
                type="button"
                onClick={() => setBorewells((v) => v + 1)}
                className="h-6 w-6 rounded bg-[#042A5E] text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Pucca House */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Pucca Dwellings</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPuccaHouses((v) => Math.max(0, v - 1))}
                className="h-6 w-6 rounded bg-white border border-slate-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="font-mono font-bold w-4 text-center">{puccaHouses}</span>
              <button
                type="button"
                onClick={() => setPuccaHouses((v) => v + 1)}
                className="h-6 w-6 rounded bg-[#042A5E] text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Farm Pond */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Shet Tale (Farm Pond)</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFarmPonds((v) => Math.max(0, v - 1))}
                className="h-6 w-6 rounded bg-white border border-slate-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="font-mono font-bold w-4 text-center">{farmPonds}</span>
              <button
                type="button"
                onClick={() => setFarmPonds((v) => v + 1)}
                className="h-6 w-6 rounded bg-[#042A5E] text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Fencing */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Barbed Fencing (Meters)</span>
            <input
              type="number"
              value={fencingMeters}
              onChange={(e) => setFencingMeters(Number(e.target.value))}
              className="w-16 rounded border border-slate-300 p-1 text-center font-mono font-bold text-xs"
            />
          </div>
        </div>
      </div>

      {/* Geotagged Photos Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Geotagged Photo Audit ({photos.length})
          </h4>
          <button
            type="button"
            onClick={handleCapturePhoto}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#042A5E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#07397b] transition-colors cursor-pointer shadow-xs"
          >
            <Camera className="h-3.5 w-3.5 text-amber-400" />
            Capture Photo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {photos.map((ph) => (
            <div
              key={ph.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#042A5E]">{ph.id}</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                  {ph.category}
                </span>
              </div>
              <p className="font-bold text-slate-800 text-[11px]">{ph.caption}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Lat: {ph.latitude}</span>
                <span>Lng: {ph.longitude}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-bold text-white shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Save Asset Inventory &amp; Photos
      </button>
    </div>
  )
}
