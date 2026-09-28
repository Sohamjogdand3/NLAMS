import { useState } from 'react'
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

interface DistrictHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  pendingScrutinyCount: number
  onNotificationClick: () => void
}

export default function DistrictHeader({
  searchTerm,
  setSearchTerm,
  pendingScrutinyCount,
  onNotificationClick,
}: DistrictHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex flex-col border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      {/* Top micro-utility bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1 bg-[#042A5E] text-[11px] text-slate-200 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
            GOVERNMENT OF MAHARASHTRA · DISTRICT REVENUE & LAND ACQUISITION AUTHORITY
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-200">
            Pune Collectorate · Haveli / Khed / Maval Sub-Divisions
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 text-slate-300">
            <Phone className="h-3 w-3 text-amber-400" />
            <span>LAO Control Desk: 020-2612-4099</span>
          </div>
        </div>
      </div>

      {/* Main Header bar */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Search Bar */}
        <div className="flex flex-1 max-w-lg items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Project Code (e.g. NHAI-PUN-RING), Village, Parcel Survey No, or Gazette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#042A5E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Action Buttons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications / Scrutiny Requisition Bell */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Pending Scrutinies & Statutory SLA Deadlines"
          >
            <Bell className="h-5 w-5" />
            {pendingScrutinyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-[#042A5E] shadow-xs animate-pulse">
                {pendingScrutinyCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden xs:block" />

          {/* District Revenue Officer Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#042A5E] text-white font-extrabold text-xs shadow-xs">
                {user?.name ? user.name.split(' ').map((n) => n[0]).join('') : 'LAO'}
              </div>
              <div className="hidden flex-col text-left leading-tight sm:flex">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                  {user?.name || 'Anil Deshmukh (LAO)'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                  {user?.departmentName || 'Land Acquisition Officer'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 text-xs text-slate-700 animate-in fade-in-50 zoom-in-95"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                  <p className="font-bold text-[#042A5E] text-sm">{user?.name || 'Anil Deshmukh'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'lao.pune@nlams.gov.in'}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                    <ShieldCheck className="h-3 w-3" /> Assigned District: Pune
                  </div>
                </div>

                <div className="px-2 py-1 space-y-1">
                  <div className="flex items-center justify-between px-3 py-2 text-slate-600 rounded-lg">
                    <span>Sub-Division</span>
                    <span className="font-bold text-slate-900">Haveli & Khed</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-slate-600 rounded-lg">
                    <span>Role Level</span>
                    <span className="font-bold text-[#042A5E]">District Collectorate</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-1" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-red-700 font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out of District Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
