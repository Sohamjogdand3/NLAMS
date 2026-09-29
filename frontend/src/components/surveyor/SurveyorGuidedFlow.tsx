import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Mic,
  Camera,
  Plus,
  Trash2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  X,
} from 'lucide-react'
import type {
  FieldParcelTask,
  SurveyStage,
  LandUseType,
  TreeRecord,
  CropRecord,
  StructureRecord,
  SurveyorPreferences,
} from '../../types/surveyor'

interface SurveyorGuidedFlowProps {
  parcel: FieldParcelTask
  onSaveParcel: (updatedParcel: FieldParcelTask) => void
  onBackToSurveys: () => void
  preferences: SurveyorPreferences
}

export default function SurveyorGuidedFlow({
  parcel,
  onSaveParcel,
  onBackToSurveys,
  preferences: _preferences,
}: SurveyorGuidedFlowProps) {
  const [currentStage, setCurrentStage] = useState<SurveyStage>('site')
  const [data, setData] = useState<FieldParcelTask>({ ...parcel })
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [voiceActiveField, setVoiceActiveField] = useState<string | null>(null)

  // Asset drill-down bottom-sheet state
  const [activeAssetModal, setActiveAssetModal] = useState<
    'none' | 'add-tree' | 'add-crop' | 'add-structure' | 'add-water' | 'camera'
  >('none')

  // New Tree Form State (Progressive Disclosure)
  const [newTreeSpecies, setNewTreeSpecies] = useState('Mango (Alphonso)')
  const [newTreeQty, setNewTreeQty] = useState(10)
  const [newTreeCondition, setNewTreeCondition] = useState<'Good' | 'Average' | 'Poor'>('Good')
  const [newTreeProductive, setNewTreeProductive] = useState(true)

  // New Crop Form State
  const [newCropName, setNewCropName] = useState('Sugarcane')
  const [newCropArea, setNewCropArea] = useState(1.0)
  const [newCropSeason, setNewCropSeason] = useState<'Kharif' | 'Rabi' | 'Perennial'>('Kharif')

  // New Structure Form State
  const [newStrucType, setNewStrucType] = useState<'Residential House' | 'Cattle Shed' | 'Farm Store'>('Residential House')
  const [newStrucConst, setNewStrucConst] = useState<'Pucca' | 'Semi-Pucca' | 'Kutcha'>('Pucca')
  const [newStrucArea, setNewStrucArea] = useState(65)

  // Camera simulation state
  const [cameraCategory, setCameraCategory] = useState<'Site Overview' | 'Crop / Trees' | 'Structure' | 'Boundary Marker'>('Site Overview')
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null)

  // Signature state
  const [signatureDone, setSignatureDone] = useState(data.ownerSignatureCaptured || false)

  // Auto-save helper
  const updateData = (updater: (prev: FieldParcelTask) => FieldParcelTask) => {
    setAutoSaveStatus('saving')
    setData((prev) => {
      const updated = { ...updater(prev), offlineCached: true, lastSurveyTimestamp: new Date().toISOString() }
      onSaveParcel(updated)
      setTimeout(() => setAutoSaveStatus('saved'), 400)
      return updated
    })
  }

  // Voice simulation
  const handleSimulateVoice = (field: 'dispute' | 'remarks') => {
    setVoiceActiveField(field)
    setTimeout(() => {
      if (field === 'dispute') {
        updateData((p) => ({ ...p, disputeNotes: 'Boundary dispute resolved mutually on North side with Gat 142/1.' }))
      } else {
        updateData((p) => ({
          ...p,
          surveyorRemarks: 'All tree counts and pucca residential plinth dimensions ground-truthed in presence of Khatedar.',
        }))
      }
      setVoiceActiveField(null)
    }, 1200)
  }

  // Stage transition validation
  const stages: { id: SurveyStage; label: string; number: number }[] = [
    { id: 'site', label: 'Site', number: 1 },
    { id: 'people', label: 'People', number: 2 },
    { id: 'assets', label: 'Assets', number: 3 },
    { id: 'evidence', label: 'Evidence', number: 4 },
    { id: 'review', label: 'Review', number: 5 },
  ]

  const currentStageIndex = stages.findIndex((s) => s.id === currentStage)

  // Readiness Calculation
  const hasSiteGps = (data.gpsCoordinatesCount || 0) > 0 || (data.measuredAreaHectares || 0) > 0
  const hasPeople = !!data.occupantOnSite
  const hasAssets = ((data.crops || []).length + (data.trees || []).length + (data.structures || []).length + (data.waterAssets || []).length) > 0
  const hasPhotos = (data.photos || []).length > 0
  const hasSignature = signatureDone

  const totalPoints = (hasSiteGps ? 20 : 0) + (hasPeople ? 20 : 0) + (hasAssets ? 20 : 0) + (hasPhotos ? 20 : 0) + (hasSignature ? 20 : 0)

  // Stage 1 (SITE) handlers
  const handleRecaptureGps = () => {
    updateData((p) => ({
      ...p,
      gpsCoordinatesCount: (p.gpsCoordinatesCount || 0) + 4,
      gpsAccuracyMeters: 2.4,
      measuredAreaHectares: p.prescribedAreaHectares * 0.99,
      variancePercentage: 1.0,
      surveyStatus: 'Boundary_Walk_In_Progress',
    }))
  }

  // Stage 3 (ASSETS) Add handlers
  const handleAddTree = () => {
    const newT: TreeRecord = {
      id: `TREE-${Date.now()}`,
      species: newTreeSpecies,
      category: 'Fruit-Bearing',
      quantity: Number(newTreeQty) || 1,
      condition: newTreeCondition,
      isProductive: newTreeProductive,
    }
    updateData((p) => ({ ...p, trees: [...(p.trees || []), newT] }))
    setActiveAssetModal('none')
  }

  const handleAddCrop = () => {
    const newC: CropRecord = {
      id: `CROP-${Date.now()}`,
      cropName: newCropName,
      cultivatedAreaHa: Number(newCropArea) || 0.5,
      season: newCropSeason,
      irrigationType: 'Borewell',
    }
    updateData((p) => ({ ...p, crops: [...(p.crops || []), newC] }))
    setActiveAssetModal('none')
  }

  const handleAddStructure = () => {
    const newS: StructureRecord = {
      id: `STRUC-${Date.now()}`,
      type: newStrucType,
      constructionType: newStrucConst,
      plinthAreaSqM: Number(newStrucArea) || 50,
      floors: 1,
      condition: 'Good',
    }
    updateData((p) => ({ ...p, structures: [...(p.structures || []), newS] }))
    setActiveAssetModal('none')
  }

  const handleSaveCapturedPhoto = () => {
    const newPhoto = {
      id: `PHOTO-${Date.now()}`,
      caption: `${cameraCategory} - ${data.khasraGatNumber}`,
      category: cameraCategory,
      latitude: 18.5794,
      longitude: 73.9842,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      thumbnailUrl: '/land-acquisition-hero.jpg',
    }
    updateData((p) => ({ ...p, photos: [newPhoto, ...(p.photos || [])] }))
    setCapturedPhotoPreview(null)
    setActiveAssetModal('none')
  }

  const handleSubmitFinalSurvey = () => {
    updateData((p) => ({
      ...p,
      surveyStatus: 'Survey_Completed',
      ownerSignatureCaptured: true,
      offlineCached: true,
    }))
    onBackToSurveys()
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200 max-w-lg mx-auto pb-24">
      {/* Top App Bar with Back and Autosave indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={onBackToSurveys}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Survey</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-[#042A5E] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {data.khasraGatNumber}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {autoSaveStatus === 'saved' ? '✓ Saved' : '⟳ Saving...'}
          </span>
        </div>
      </div>

      {/* Persistent 5-Stage Step Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            Stage {currentStageIndex + 1} of 5 • {stages[currentStageIndex].label}
          </span>
          <span className="text-[11px] font-bold text-[#042A5E]">
            {data.prescribedAreaHectares} Ha
          </span>
        </div>

        {/* Step dots */}
        <div className="grid grid-cols-5 gap-1.5">
          {stages.map((st, idx) => {
            const isCompleted = idx < currentStageIndex
            const isCurrent = idx === currentStageIndex
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setCurrentStage(st.id)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600'
                    : isCurrent
                    ? 'bg-[#042A5E] ring-2 ring-blue-300'
                    : 'bg-slate-200'
                }`}
                title={st.label}
              />
            )
          })}
        </div>
      </div>

      {/* STAGE 1: SITE (Location, Land, Measurements, Conversational details) */}
      {currentStage === 'site' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Location Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. GPS Location
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Accuracy: ±{data.gpsAccuracyMeters || 3.2}m
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#042A5E]" />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {data.gpsCoordinatesCount > 0 ? `${data.gpsCoordinatesCount} Boundary Points Fixed` : 'Boundary Walk Ready'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    18.5794° N, 73.9842° E • Wagholi
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecaptureGps}
                className="rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 px-2.5 py-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                Recapture
              </button>
            </div>
          </div>

          {/* Area Measurement */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Land Area Measurement
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">7/12 Prescribed Area</span>
                <span className="text-base font-black text-slate-900">{data.prescribedAreaHectares} Ha</span>
              </div>
              <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-200">
                <span className="text-[10px] font-bold text-[#042A5E] block uppercase">GPS Measured Area</span>
                <span className="text-base font-black text-[#042A5E]">
                  {data.measuredAreaHectares || data.prescribedAreaHectares} Ha
                </span>
              </div>
            </div>
          </div>

          {/* Conversational Questions (Guided Mode) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Land Use &amp; Access
            </span>

            {/* Conversational Q1: Land Use */}
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-1.5">
                What is the current land use?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Agricultural', 'Residential', 'Commercial', 'Barren'] as LandUseType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateData((p) => ({ ...p, landUse: type }))}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      data.landUse === type
                        ? 'bg-[#042A5E] text-white border-[#042A5E]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Q2: If Agricultural -> Irrigation */}
            {data.landUse === 'Agricultural' && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="text-sm font-bold text-slate-900 block mb-1.5">
                    Is the agricultural land irrigated?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateData((p) => ({ ...p, isIrrigated: true }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        data.isIrrigated
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Yes (Irrigated)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateData((p) => ({ ...p, isIrrigated: false }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        !data.isIrrigated
                          ? 'bg-[#042A5E] text-white border-[#042A5E]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      No (Rainfed / Jirayat)
                    </button>
                  </div>
                </div>

                {data.isIrrigated && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Primary Irrigation Source
                    </label>
                    <input
                      type="text"
                      value={data.irrigationSource || ''}
                      onChange={(e) => updateData((p) => ({ ...p, irrigationSource: e.target.value }))}
                      placeholder="e.g. Canal + Private Borewell"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-[#042A5E] focus:bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Q3: Road Access */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block mb-1.5">
                What type of road access exists?
              </label>
              <select
                value={data.roadAccess}
                onChange={(e) => updateData((p) => ({ ...p, roadAccess: e.target.value as any }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:border-[#042A5E] focus:bg-white"
              >
                <option value="Direct Paved Village Road">Direct Paved Village Road</option>
                <option value="Kutcha Farm Track">Kutcha Farm Track</option>
                <option value="Enclosed / No Direct Access">Enclosed / No Direct Access</option>
              </select>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => setCurrentStage('people')}
            className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3.5 px-4 text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CONTINUE TO PEOPLE</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STAGE 2: PEOPLE (Owner, Occupant, eKYC, Disputes, Remarks) */}
      {currentStage === 'people' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Khatedar Record (from 7/12)
            </span>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-xs font-bold text-slate-900">{data.ownerNameRecord}</div>
              <div className="text-[11px] text-slate-500">
                Gat {data.khasraGatNumber} • Khata #412 • Haveli
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. On-Site Occupancy
            </span>

            <div>
              <label className="text-sm font-bold text-slate-900 block mb-1.5">
                Who is cultivating / occupying the parcel on-site?
              </label>
              <div className="space-y-2">
                {(
                  ['Self-Cultivating Owner', 'Tenant', 'Sharecropper', 'Legal Heir', 'Caretaker'] as FieldParcelTask['occupantType'][]
                ).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      data.occupantType === type
                        ? 'border-[#042A5E] bg-blue-50/50 text-[#042A5E] font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{type}</span>
                    <input
                      type="radio"
                      name="occupantType"
                      checked={data.occupantType === type}
                      onChange={() => updateData((p) => ({ ...p, occupantType: type }))}
                      className="h-4 w-4 text-[#042A5E]"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Aadhaar KYC */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Aadhaar eKYC Verified</span>
                <span className="text-[11px] text-slate-500 block">{data.aadhaarMasked || 'XXXX-XXXX-4821'}</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>

            {/* Boundary / Co-sharer Dispute */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-sm font-bold text-slate-900 block">
                Any boundary dispute or co-sharer objection?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateData((p) => ({ ...p, isDisputedBoundary: false }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    !data.isDisputedBoundary
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  No Dispute
                </button>
                <button
                  type="button"
                  onClick={() => updateData((p) => ({ ...p, isDisputedBoundary: true }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    data.isDisputedBoundary
                      ? 'bg-red-700 text-white border-red-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Yes, Flag Dispute
                </button>
              </div>

              {data.isDisputedBoundary && (
                <div className="relative mt-2">
                  <textarea
                    rows={2}
                    value={data.disputeNotes || ''}
                    onChange={(e) => updateData((p) => ({ ...p, disputeNotes: e.target.value }))}
                    placeholder="Describe dispute details or speak via mic..."
                    className="w-full rounded-xl border border-red-200 bg-red-50/40 p-2.5 text-xs text-slate-900 pr-9 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSimulateVoice('dispute')}
                    className="absolute right-2.5 top-2.5 text-red-600 hover:text-red-800 cursor-pointer"
                    title="Speak remarks"
                  >
                    <Mic className={`h-4 w-4 ${voiceActiveField === 'dispute' ? 'animate-bounce text-red-700' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStage('assets')}
            className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3.5 px-4 text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CONTINUE TO ASSETS</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STAGE 3: ASSETS (Clean List with > indicators, drilldowns for Crops, Trees, Structures, Water) */}
      {currentStage === 'assets' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-slate-900">
              On-Site Asset Inventory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap any category below to inspect, edit or add itemized field assets.
            </p>
          </div>

          {/* Clean Asset List */}
          <div className="space-y-2.5">
            {/* 1. Crops */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 uppercase">Crops</div>
                  <div className="text-xs text-slate-500">{(data.crops || []).length} recorded</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAssetModal('add-crop')}
                  className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Crop
                </button>
              </div>

              {(data.crops || []).map((c) => (
                <div key={c.id} className="rounded-xl bg-slate-50 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{c.cropName}</span>
                    <span className="text-slate-500 text-[11px] block">{c.season} • {c.cultivatedAreaHa} ha</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateData((p) => ({ ...p, crops: (p.crops || []).filter((x) => x.id !== c.id) }))}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 2. Trees */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 uppercase">Trees</div>
                  <div className="text-xs text-slate-500">
                    {(data.trees || []).reduce((acc, t) => acc + t.quantity, 0)} trees recorded
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAssetModal('add-tree')}
                  className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Tree
                </button>
              </div>

              {(data.trees || []).map((t) => (
                <div key={t.id} className="rounded-xl bg-slate-50 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{t.species}</span>
                    <span className="text-slate-500 text-[11px] block">
                      Quantity: <strong>{t.quantity}</strong> • {t.condition} condition • {t.isProductive ? 'Productive' : 'Non-Fruit'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateData((p) => ({ ...p, trees: (p.trees || []).filter((x) => x.id !== t.id) }))}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 3. Structures */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 uppercase">Structures</div>
                  <div className="text-xs text-slate-500">{(data.structures || []).length} recorded</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAssetModal('add-structure')}
                  className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Structure
                </button>
              </div>

              {(data.structures || []).map((s) => (
                <div key={s.id} className="rounded-xl bg-slate-50 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{s.type}</span>
                    <span className="text-slate-500 text-[11px] block">
                      {s.constructionType} • {s.plinthAreaSqM} sq.m plinth area
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateData((p) => ({ ...p, structures: (p.structures || []).filter((x) => x.id !== s.id) }))}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 4. Water Assets */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 uppercase">Water / Irrigation Assets</div>
                  <div className="text-xs text-slate-500">{(data.waterAssets || []).length} recorded</div>
                </div>
              </div>

              {(data.waterAssets || []).map((w) => (
                <div key={w.id} className="rounded-xl bg-slate-50 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{w.type}</span>
                    <span className="text-slate-500 text-[11px] block">{w.operationalStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStage('evidence')}
            className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3.5 px-4 text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CONTINUE TO EVIDENCE</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STAGE 4: EVIDENCE (Photos & Observations) */}
      {currentStage === 'evidence' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Geotagged Site Photos ({(data.photos || []).length})
                </h2>
                <p className="text-xs text-slate-500">
                  Instant camera capture with GPS lat/long stamped on image.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveAssetModal('camera')}
                className="rounded-xl bg-[#042A5E] text-white px-3 py-2 text-xs font-bold shadow-xs hover:bg-[#031E44] flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {(data.photos || []).map((ph) => (
                <div key={ph.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-1">
                  <div className="relative h-24 rounded-lg overflow-hidden bg-slate-200">
                    <img src={ph.thumbnailUrl} alt={ph.caption} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-1 py-0.5 rounded">
                      {ph.latitude.toFixed(4)}, {ph.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 truncate">{ph.caption}</div>
                  <div className="text-[9px] text-slate-400">{ph.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Surveyor Observations with Voice Button */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase">
                Surveyor Field Observations
              </label>
              <button
                type="button"
                onClick={() => handleSimulateVoice('remarks')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#042A5E] hover:underline cursor-pointer"
              >
                <Mic className={`h-3.5 w-3.5 ${voiceActiveField === 'remarks' ? 'animate-bounce text-red-600' : ''}`} />
                <span>{voiceActiveField === 'remarks' ? 'Listening...' : 'Voice Dictation'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={data.surveyorRemarks || ''}
              onChange={(e) => updateData((p) => ({ ...p, surveyorRemarks: e.target.value }))}
              placeholder="Speak or type field observations (e.g. boundary status, farmer presence)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:border-[#042A5E]"
            />
          </div>

          <button
            type="button"
            onClick={() => setCurrentStage('review')}
            className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3.5 px-4 text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CONTINUE TO REVIEW</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STAGE 5: REVIEW & SUBMIT */}
      {currentStage === 'review' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Smart Completion Indicator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Survey Readiness</span>
              <span className="text-sm font-black text-[#042A5E]">{totalPoints}%</span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#042A5E] rounded-full transition-all duration-300"
                style={{ width: `${totalPoints}%` }}
              />
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600" /> Site &amp; GPS Boundary
                </span>
                <span className="font-bold text-emerald-700">Done</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600" /> People &amp; eKYC
                </span>
                <span className="font-bold text-emerald-700">Done</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600" /> Assets &amp; Trees Inventory
                </span>
                <span className="font-bold text-emerald-700">Done</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {hasPhotos ? <Check className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  Geotagged Photos
                </span>
                <span className={hasPhotos ? 'font-bold text-emerald-700' : 'font-bold text-amber-600'}>
                  {(data.photos || []).length} Captured
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {signatureDone ? <Check className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  Khatedar / Farmer Sign-off
                </span>
                <span className={signatureDone ? 'font-bold text-emerald-700' : 'font-bold text-amber-600'}>
                  {signatureDone ? 'Confirmed' : 'Pending Signature'}
                </span>
              </div>
            </div>
          </div>

          {/* On-Site Signature Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Khatedar On-Site Digital Confirmation
            </span>

            <div className="h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-3 text-center">
              {signatureDone ? (
                <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  <span>Digital Signature Verified: {data.ownerNameRecord}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSignatureDone(true)}
                  className="rounded-lg bg-[#042A5E] text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  Capture Farmer Signature
                </button>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleSubmitFinalSurvey}
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white py-4 px-4 text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span>SUBMIT &amp; QUEUE FOR STATE SYNC</span>
          </button>
        </div>
      )}

      {/* BOTTOM SHEET / MODAL FOR ADDING TREE (Progressive Disclosure) */}
      {activeAssetModal === 'add-tree' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add Tree Species</h3>
              <button
                type="button"
                onClick={() => setActiveAssetModal('none')}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tree Step 1 */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tree Species</label>
              <select
                value={newTreeSpecies}
                onChange={(e) => setNewTreeSpecies(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
              >
                <option value="Mango (Alphonso)">Mango (Alphonso)</option>
                <option value="Neem">Neem</option>
                <option value="Guava (L-49)">Guava (L-49)</option>
                <option value="Teak (Sagwan)">Teak (Sagwan)</option>
                <option value="Coconut">Coconut</option>
                <option value="Tamarind (Chinch)">Tamarind (Chinch)</option>
              </select>
            </div>

            {/* Tree Step 2 */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (Count)</label>
              <input
                type="number"
                min={1}
                value={newTreeQty}
                onChange={(e) => setNewTreeQty(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
              />
            </div>

            {/* Tree Step 3: Condition & Productivity */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Condition</label>
                <select
                  value={newTreeCondition}
                  onChange={(e) => setNewTreeCondition(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Productive?</label>
                <select
                  value={newTreeProductive ? 'yes' : 'no'}
                  onChange={(e) => setNewTreeProductive(e.target.value === 'yes')}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="yes">Yes (Fruit-bearing)</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddTree}
              className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3 px-4 text-xs font-black shadow-md transition-all cursor-pointer mt-2"
            >
              SAVE TREE
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM SHEET FOR ADDING CROP */}
      {activeAssetModal === 'add-crop' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add Standing Crop</h3>
              <button
                type="button"
                onClick={() => setActiveAssetModal('none')}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Crop Name</label>
              <input
                type="text"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                placeholder="e.g. Sugarcane (Co 86032)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Area (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCropArea}
                  onChange={(e) => setNewCropArea(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Season</label>
                <select
                  value={newCropSeason}
                  onChange={(e) => setNewCropSeason(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Perennial">Perennial</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCrop}
              className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3 px-4 text-xs font-black shadow-md transition-all cursor-pointer mt-2"
            >
              SAVE CROP
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM SHEET FOR ADDING STRUCTURE */}
      {activeAssetModal === 'add-structure' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add Built Structure</h3>
              <button
                type="button"
                onClick={() => setActiveAssetModal('none')}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Structure Type</label>
              <select
                value={newStrucType}
                onChange={(e) => setNewStrucType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
              >
                <option value="Residential House">Residential House</option>
                <option value="Cattle Shed">Cattle Shed</option>
                <option value="Farm Store">Farm Store / Godown</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Construction</label>
                <select
                  value={newStrucConst}
                  onChange={(e) => setNewStrucConst(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
                >
                  <option value="Pucca">Pucca (RCC/Brick)</option>
                  <option value="Semi-Pucca">Semi-Pucca</option>
                  <option value="Kutcha">Kutcha</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plinth (Sq.m)</label>
                <input
                  type="number"
                  value={newStrucArea}
                  onChange={(e) => setNewStrucArea(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddStructure}
              className="w-full rounded-xl bg-[#042A5E] hover:bg-[#031E44] text-white py-3 px-4 text-xs font-black shadow-md transition-all cursor-pointer mt-2"
            >
              SAVE STRUCTURE
            </button>
          </div>
        </div>
      )}

      {/* CAMERA UX MODAL */}
      {activeAssetModal === 'camera' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-bold">Field Camera (GPS Auto-Stamp)</span>
            <button
              type="button"
              onClick={() => {
                setActiveAssetModal('none')
                setCapturedPhotoPreview(null)
              }}
              className="text-white/80 hover:text-white p-2 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Camera Viewfinder */}
          <div className="relative flex-1 my-4 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/30 flex items-center justify-center">
            {capturedPhotoPreview ? (
              <img src={capturedPhotoPreview} alt="Captured preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2 text-white/70">
                <Camera className="h-12 w-12 mx-auto text-amber-400 animate-pulse" />
                <div className="text-xs font-bold">Point at site asset or boundary pillar</div>
                <div className="text-[10px] font-mono text-emerald-400">GPS: 18.5794° N, 73.9842° E</div>
              </div>
            )}
          </div>

          {/* Camera Action Buttons */}
          <div className="space-y-3">
            <div className="flex justify-center gap-2">
              {(['Site Overview', 'Boundary Marker', 'Crop / Trees', 'Structure'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCameraCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    cameraCategory === cat ? 'bg-amber-400 text-slate-950' : 'bg-white/20 text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {capturedPhotoPreview ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCapturedPhotoPreview(null)}
                  className="flex-1 rounded-xl bg-white/20 hover:bg-white/30 text-white py-3 text-xs font-bold cursor-pointer"
                >
                  RETAKE
                </button>
                <button
                  type="button"
                  onClick={handleSaveCapturedPhoto}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold cursor-pointer"
                >
                  USE PHOTO
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCapturedPhotoPreview('/land-acquisition-hero.jpg')}
                className="w-full rounded-2xl bg-white text-slate-950 py-3.5 text-sm font-black shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="h-5 w-5 text-[#042A5E]" />
                <span>CAPTURE PHOTO</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
