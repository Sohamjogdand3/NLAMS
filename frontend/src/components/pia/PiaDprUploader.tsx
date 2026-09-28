import { useState } from 'react'
import {
  UploadCloud,
  FileCode,
  CheckCircle2,
  Database,
} from 'lucide-react'

interface PiaDprUploaderProps {
  onAlignmentParsed?: (data: any) => void
}

export default function PiaDprUploader({ onAlignmentParsed }: PiaDprUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedResult, setParsedResult] = useState<{
    totalLengthKm: number
    districtsIdentified: string[]
    tehsilsCount: number
    estimatedParcelsCount: number
    forestAreaHectares: number
    privateLandHectares: number
    governmentLandHectares: number
  } | null>(null)

  const handleSimulateUpload = (name: string) => {
    setFileName(name)
    setIsProcessing(true)
    setTimeout(() => {
      const res = {
        totalLengthKm: 48.6,
        districtsIdentified: ['Pune', 'Haveli Tehsil', 'Daund Tehsil'],
        tehsilsCount: 2,
        estimatedParcelsCount: 420,
        forestAreaHectares: 12.4,
        privateLandHectares: 218.5,
        governmentLandHectares: 34.0,
      }
      setParsedResult(res)
      setIsProcessing(false)
      if (onAlignmentParsed) onAlignmentParsed(res)
    }, 1200)
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#991B1B]" />
            GIS Alignment (KML / GeoJSON) &amp; DPR Auto-Ingestion
          </h3>
          <p className="text-xs text-slate-500">
            Upload right-of-way alignment polygon or DPR file to automatically intersect with State Cadastral Land Registry (Mahabhulekh / DILRMP).
          </p>
        </div>
        <span className="rounded-md bg-red-50 text-[#991B1B] border border-red-200 px-2 py-0.5 text-[10px] font-bold">
          Step 1: Requisition
        </span>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files?.[0]) {
            handleSimulateUpload(e.dataTransfer.files[0].name)
          }
        }}
        onClick={() => handleSimulateUpload('NHAI_Pune_RingRoad_Alignment_WGS84.kml')}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[#991B1B] bg-red-50/50'
            : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-[#991B1B] mb-3">
          <FileCode className="h-6 w-6" />
        </div>
        <h4 className="text-xs font-bold text-slate-900">
          {fileName ? fileName : 'Click to Upload or Drag & Drop GIS Alignment (.kml, .kmz, .geojson, .pdf)'}
        </h4>
        <p className="mt-1 text-[11px] text-slate-400">
          Auto-parses RoW coordinates &amp; queries State Cadastral APIs for Gat/Khasra numbers
        </p>
      </div>

      {/* Parsing Loader */}
      {isProcessing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#042A5E]">
            <Database className="h-4 w-4 animate-spin" />
            <span>Querying Mahabhulekh &amp; DILRMP Spatial Registry...</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Intersecting alignment polygon with 28,540,000 state cadastral parcels
          </p>
        </div>
      )}

      {/* Parsed GIS Results Matrix */}
      {parsedResult && !isProcessing && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>GIS Alignment Successfully Intersected with State Registry</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-600">
              Corridor Length: {parsedResult.totalLengthKm} km
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Parcels</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {parsedResult.estimatedParcelsCount} Gat Nos
              </div>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Private Land</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {parsedResult.privateLandHectares} Ha
              </div>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Govt / Grazing Land</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {parsedResult.governmentLandHectares} Ha
              </div>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Forest Overlap</span>
              <div className="text-base font-black text-amber-700 mt-0.5">
                {parsedResult.forestAreaHectares} Ha
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
