import { useState } from 'react'
import {
  Search,
  Download,
  Bell,
  UserCheck,
  LogOut,
  ChevronDown,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

interface CentralHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  slaAlertCount: number
  onNotificationClick: () => void
}

export default function CentralHeader({
  searchTerm,
  setSearchTerm,
  slaAlertCount,
  onNotificationClick,
}: CentralHeaderProps) {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
      {/* Left: Search Bar & Department Subtitle */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search national projects, states, agencies, ULPINs or section alerts..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>

      {/* Right: Actions, Badges & Profile */}
      <div className="flex items-center gap-3">
        {/* Authority Level Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-bold text-navy border border-navy/10">
          <Building2 className="h-3.5 w-3.5 text-navy" />
          <span>Central Authority | DoLR &amp; NITI Aayog</span>
        </div>

        {/* MIS Report Export Action */}
        <button
          type="button"
          onClick={() => alert('Exporting National Land Acquisition MIS Summary Report (PDF/Excel)...')}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-navy transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export MIS</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onNotificationClick}
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-navy transition-colors cursor-pointer"
          title="SLA Breach Notifications"
        >
          <Bell className="h-4 w-4" />
          {slaAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
              {slaAlertCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 hidden xs:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-xs">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-slate-900 leading-none">
                {user?.name || 'Central Director'}
              </span>
              <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">
                {user?.departmentName || 'Dept of Land Resources'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10 z-50 border border-slate-100"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Central Director'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@dolr.gov.in'}</p>
              </div>

              <div className="mt-1 space-y-0.5">
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 font-medium">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Central Monitoring Authorization</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
