import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Layers,
  Navigation,
} from 'lucide-react'
import type { PiaProject } from '../../types/pia'

interface PiaGisMapProps {
  projects: PiaProject[]
  onSelectProject: (project: PiaProject) => void
}

export default function PiaGisMap({ projects, onSelectProject }: PiaGisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all')
  const [activeMapProject, setActiveMapProject] = useState<PiaProject | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid multiple map initializations
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Default center of India
    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5],
      zoom: 5,
      scrollWheelZoom: true,
      zoomControl: true,
    })
    mapInstanceRef.current = map

    // Crisp OpenStreetMap / Carto Positron basemap tiles for clean government style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> · GoI Survey of India Delineation',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Stage color mapping
    const getStageColor = (stage: string) => {
      switch (stage) {
        case 'Possession':
          return '#16A34A' // Green
        case 'Compensation':
          return '#F59E0B' // Amber
        case 'Award':
          return '#9333EA' // Purple
        case 'Notification':
          return '#2563EB' // Blue
        case 'Scrutiny':
          return '#D97706' // Yellow-Orange
        default:
          return '#991B1B' // Red / Crimson
      }
    }

    // Add project markers and alignment polylines
    projects.forEach((proj) => {
      if (selectedCorridor !== 'all' && proj.sector !== selectedCorridor) {
        return
      }

      const color = getStageColor(proj.currentStage)

      // Custom pulsing marker pin
      const customIcon = L.divIcon({
        className: 'custom-pia-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 2.5px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
          ">
            <span>●</span>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })

      const marker = L.marker(proj.coordinates, { icon: customIcon }).addTo(map)

      const popupContent = document.createElement('div')
      popupContent.className = 'p-1 text-slate-800 font-sans'
      popupContent.innerHTML = `
        <div style="font-family: inherit; min-width: 210px;">
          <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #991B1B; margin-bottom: 2px;">
            ${proj.code}
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #0F172A; line-height: 1.3; margin-bottom: 4px;">
            ${proj.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            📍 ${proj.district}, ${proj.state}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 6px; padding: 4px 6px; background: #F8FAFC; border-radius: 4px; border: 1px solid #E2E8F0;">
            <span>Stage: <strong style="color: ${color};">${proj.currentStage}</strong></span>
            <span>Req: <strong>${proj.landRequiredHa} Ha</strong></span>
          </div>
          <button id="view-proj-btn-${proj.id}" style="
            width: 100%;
            background: #991B1B;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
          ">
            Open Project Dossier →
          </button>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-proj-btn-${proj.id}`)
        if (btn) {
          btn.onclick = () => {
            onSelectProject(proj)
          }
        }
        setActiveMapProject(proj)
      })

      // Add alignment path if available
      if (proj.alignmentPath && proj.alignmentPath.length > 1) {
        L.polyline(proj.alignmentPath, {
          color: color,
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 6',
        }).addTo(map)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [projects, selectedCorridor, onSelectProject])

  return (
    <div className="space-y-4">
      {/* Header with Corridor Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Interactive GIS Infrastructure Corridors Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Geospatial alignment visualization synchronized with PM GatiShakti national master plan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Filter Corridor:</label>
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Corridors & Packages</option>
            <option value="Highways">National Highways (NHAI)</option>
            <option value="Railways">Freight & High Speed Rail</option>
            <option value="Industrial Corridor">Industrial Nodes (NICDC)</option>
            <option value="Energy / Power">Energy & Solar Corridors</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Leaflet Map Target */}
        <div ref={mapContainerRef} className="h-[520px] w-full z-0" />

        {/* Floating Map Legend Card */}
        <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-md backdrop-blur-xs max-w-xs text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1.5">
            <Layers className="h-4 w-4 text-[#991B1B]" />
            <span>Statutory Stage Pins</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
              <span className="text-slate-600">Possession Granted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-slate-600">Compensation (3H)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#9333EA]" />
              <span className="text-slate-600">Award (Sec 3G)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
              <span className="text-slate-600">Notification (3A/3D)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
              <span className="text-slate-600">Revenue Scrutiny</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#991B1B]" />
              <span className="text-slate-600">Draft Proposal</span>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
            Dashed lines represent proposed corridor right-of-way (ROW) alignments.
          </p>
        </div>

        {/* Quick Inspector pill top-right */}
        {activeMapProject && (
          <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-xs text-xs">
            <Navigation className="h-4 w-4 text-[#991B1B]" />
            <div>
              <span className="font-bold text-slate-900 block leading-tight">{activeMapProject.name}</span>
              <span className="text-[10px] text-slate-500">
                {activeMapProject.landAcquiredHa} of {activeMapProject.landRequiredHa} Ha Acquired
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectProject(activeMapProject)}
              className="ml-2 rounded bg-red-50 text-[#991B1B] hover:bg-red-100 px-2 py-1 text-[10px] font-bold"
            >
              View
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
