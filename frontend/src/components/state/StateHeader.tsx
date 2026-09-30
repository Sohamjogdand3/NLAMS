import { useState } from 'react'
import {
  Search,
  Download,
  Bell,
  LogOut,
  ChevronDown,
  Building,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

interface StateHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  pendingIntakeCount: number
  onNotificationClick: () => void
}

export default function StateHeader({
  searchTerm,
  setSearchTerm,
  pendingIntakeCount,
  onNotificationClick,
}: StateHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login?type=department')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search state proposals, project codes, CALA officers, or districts..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#042A5E] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#042A5E]"
          />
        </div>
      </div>

      {/* Authority Level Badge & Actions */}
      <div className="flex items-center gap-3">
        {/* Export Action */}
        <button
          type="button"
          onClick={() => alert('Exporting State Land Acquisition Compliance Report (PDF)...')}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export State MIS</span>
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={onNotificationClick}
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          title="Pending Central Proposals"
        >
          <Bell className="h-4 w-4" />
          {pendingIntakeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-[#042A5E] shadow-xs animate-pulse">
              {pendingIntakeCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 hidden xs:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200/80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#042A5E] text-xs font-bold text-white shadow-xs">
              SR
            </div>
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-slate-900 leading-none">
                {user?.name || 'Smt. Radhika Rastogi (IAS)'}
              </span>
              <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">
                Principal Sec, Revenue &amp; Land Reforms
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10 z-50 border border-slate-100 animate-in fade-in-50"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Principal Secretary (Revenue)'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'sec.revenue@maharashtra.gov.in'}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[9.5px] font-bold text-[#042A5E]">
                  <Building className="h-3 w-3" />
                  <span>State Revenue Nodal Desk</span>
                </div>
              </div>

              <div className="mt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out (State SSO)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
