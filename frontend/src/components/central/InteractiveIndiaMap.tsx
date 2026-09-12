import { useState } from 'react'
import type { StateAcquisitionProgress } from '../../types/central'
import { Info, Layers } from 'lucide-react'

interface InteractiveIndiaMapProps {
  statesData: StateAcquisitionProgress[]
  selectedState: StateAcquisitionProgress | null
  onSelectState: (state: StateAcquisitionProgress | null) => void
}

export default function InteractiveIndiaMap({
  statesData,
  selectedState,
  onSelectState,
}: InteractiveIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<StateAcquisitionProgress | null>(null)

  // Simplified SVG paths for major Indian state regions for crisp vector visualization
  const stateSvgPaths: Record<string, { path: string; center: { x: number; y: number } }> = {
    MH: {
      path: 'M 140,240 L 190,230 L 220,270 L 190,300 L 140,280 Z',
      center: { x: 175, y: 260 },
    },
    UP: {
      path: 'M 210,130 L 270,140 L 280,180 L 210,170 Z',
      center: { x: 245, y: 155 },
    },
    GJ: {
      path: 'M 90,190 L 140,190 L 150,235 L 100,245 L 80,210 Z',
      center: { x: 115, y: 215 },
    },
    TN: {
      path: 'M 180,360 L 220,360 L 210,410 L 170,400 Z',
      center: { x: 195, y: 385 },
    },
    OD: {
      path: 'M 280,220 L 330,210 L 340,260 L 290,260 Z',
      center: { x: 310, y: 235 },
    },
    KA: {
      path: 'M 145,290 L 195,295 L 180,360 L 135,340 Z',
      center: { x: 165, y: 320 },
    },
    WB: {
      path: 'M 320,180 L 360,170 L 370,220 L 335,220 Z',
      center: { x: 345, y: 195 },
    },
    RJ: {
      path: 'M 110,120 L 180,120 L 195,175 L 125,175 Z',
      center: { x: 150, y: 145 },
    },
  }

  const getRiskColor = (risk: string, isSelected: boolean) => {
    if (isSelected) return '#DC2626' // Highlight selected state with crimson
    switch (risk) {
      case 'low':
        return '#059669' // Emerald
      case 'moderate':
        return '#D97706' // Amber
      case 'high':
        return '#EA580C' // Orange
      case 'critical':
        return '#B91C1C' // Deep Red
      default:
        return '#475569'
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col h-full">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">
              <Layers className="h-3.5 w-3.5" /> Interactive National GIS Map
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Live State Acquisition Status Overlay
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            National Land Acquisition Corridor Map
          </h3>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span>&gt;80% (On Track)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
            <span>65-80% (Moderate)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-700" />
            <span>&lt;65% (Critical SLA Risk)</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative flex-1 rounded-xl bg-slate-950 p-4 border border-slate-800 min-h-[380px] flex items-center justify-center overflow-hidden group">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* SVG Map Canvas */}
        <svg
          viewBox="0 0 450 450"
          className="w-full h-full max-h-[380px] relative z-10 transition-transform duration-300"
        >
          {/* India Boundary Outline Background Simulation */}
          <path
            d="M 120,70 L 220,50 L 310,70 L 390,140 L 380,240 L 340,280 L 240,430 L 160,370 L 80,230 L 90,130 Z"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="6 3"
          />

          {/* Interactive State Polygons */}
          {statesData.map((st) => {
            const svgInfo = stateSvgPaths[st.stateCode]
            if (!svgInfo) return null

            const isSelected = selectedState?.stateCode === st.stateCode
            const isHovered = hoveredState?.stateCode === st.stateCode
            const fill = getRiskColor(st.riskLevel, isSelected)

            return (
              <g key={st.stateCode} className="cursor-pointer">
                <path
                  d={svgInfo.path}
                  fill={fill}
                  fillOpacity={isSelected || isHovered ? 0.9 : 0.65}
                  stroke={isSelected ? '#FFFFFF' : '#1E293B'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  onMouseEnter={() => setHoveredState(st)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onSelectState(isSelected ? null : st)}
                  className="transition-all duration-200 hover:filter hover:brightness-125"
                />

                {/* State Label Pin */}
                <circle
                  cx={svgInfo.center.x}
                  cy={svgInfo.center.y}
                  r="3.5"
                  fill="#FFFFFF"
                />
                <text
                  x={svgInfo.center.x}
                  y={svgInfo.center.y - 7}
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md uppercase"
                >
                  {st.stateCode} ({st.completionPercentage}%)
                </text>
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip Box on Hover or Selected */}
        {(hoveredState || selectedState) && (
          <div className="absolute top-4 right-4 z-20 w-64 rounded-xl bg-slate-900/95 border border-slate-700 p-3 text-xs text-white shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="font-extrabold text-white text-sm">
                {(hoveredState || selectedState)?.stateName}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  (hoveredState || selectedState)?.riskLevel === 'low'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : (hoveredState || selectedState)?.riskLevel === 'moderate'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-red-950 text-red-300 border border-red-700'
                }`}
              >
                {(hoveredState || selectedState)?.riskLevel} Risk
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>Active Projects:</span>
                <span className="font-bold text-white">{(hoveredState || selectedState)?.activeProjects}</span>
              </div>
              <div className="flex justify-between">
                <span>Acquired Area:</span>
                <span className="font-bold text-emerald-400">
                  {((hoveredState || selectedState)?.acquiredHectares || 0).toLocaleString()} Ha ({(hoveredState || selectedState)?.completionPercentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Disbursed Budget:</span>
                <span className="font-bold text-white">
                  ₹{((hoveredState || selectedState)?.compensationDisbursedCr || 0).toLocaleString()} Cr
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending SLA Breaches:</span>
                <span className="font-bold text-red-400">
                  {(hoveredState || selectedState)?.pendingSlaBreaches} Statutory Cases
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Control Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-navy" /> Click any state to filter nationwide project pipeline
        </span>
        {selectedState && (
          <button
            type="button"
            onClick={() => onSelectState(null)}
            className="font-bold text-red-600 hover:underline cursor-pointer"
          >
            Clear Filter ({selectedState.stateName})
          </button>
        )}
      </div>
    </div>
  )
}
