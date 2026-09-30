import {
  Navigation,
  Wifi,
  WifiOff,
  LogOut,
  MapPin,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

interface SurveyorHeaderProps {
  isOnline: boolean
  onToggleOnline: () => void
  accuracyMeters: number
  queuedCount: number
}

export default function SurveyorHeader({
  isOnline,
  onToggleOnline,
  accuracyMeters,
  queuedCount,
}: SurveyorHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login?type=department')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-[#042A5E] px-3.5 text-white shadow-md">
      {/* Brand & Active Officer */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-[#042A5E] font-black text-xs shadow-xs">
          <Navigation className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-white">DHARAA Mobile JMS</span>
            <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
              Field App
            </span>
          </div>
          <span className="text-[10px] text-slate-300 truncate max-w-[140px] block">
            {user?.name || 'Ramesh Kadam (Talathi / Surveyor)'}
          </span>
        </div>
      </div>

      {/* Real-time Field Indicators */}
      <div className="flex items-center gap-2">
        {/* GPS Accuracy Pill */}
        <div className="hidden xs:flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
          <MapPin className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span>±{accuracyMeters}m</span>
        </div>

        {/* Offline / Online Toggle */}
        <button
          onClick={onToggleOnline}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}
          title="Click to toggle simulated offline/online mode"
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {queuedCount > 0 && (
            <span className="rounded-full bg-amber-400 px-1 text-[9px] font-black text-[#042A5E]">
              {queuedCount}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  )
}
