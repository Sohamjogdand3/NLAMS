import { useState } from 'react'
import {
  Search,
  Bell,
  Building,
  User,
  LogOut,
  ChevronDown,
  PlusCircle,
  ExternalLink,
  Phone,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

interface PiaHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  openClarificationCount: number
  onNotificationClick: () => void
  onOpenCreateModal: () => void
}

export default function PiaHeader({
  searchTerm,
  setSearchTerm,
  openClarificationCount,
  onNotificationClick,
  onOpenCreateModal,
}: PiaHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
    }, 800)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex flex-col border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      {/* Top micro-utility bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1 bg-slate-900 text-[11px] text-slate-300 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
            GOVERNMENT OF INDIA · MINISTRY OF RURAL DEVELOPMENT & MoRTH
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">
            Project Implementing Agency (PIA) Central Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 text-slate-300">
            <Phone className="h-3 w-3 text-red-400" />
            <span>PIA Helpline: 1800-11-2026</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/central')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
          >
            Switch to Central Dashboard <ExternalLink className="h-3 w-3" />
          </button>
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
              placeholder="Search by Project Code (e.g. NHAI-DEL-MUM), Title, District or Tehsil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#991B1B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* Action Buttons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Refresh sync button */}
          <button
            type="button"
            onClick={handleSync}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors ${
              isSyncing ? 'opacity-70' : ''
            }`}
            title="Sync latest gazette and revenue updates"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-[#991B1B]' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Bhulekh'}</span>
          </button>

          {/* Prominent Create Proposal CTA Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-3.5 py-2 text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Acquisition Proposal</span>
            <span className="sm:hidden">Proposal</span>
          </button>

          {/* Notifications / Clarifications Bell */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Clarifications & Statutory Deadlines"
          >
            <Bell className="h-5 w-5" />
            {openClarificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#991B1B] text-[10px] font-bold text-white shadow-xs">
                {openClarificationCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 sm:px-3 sm:py-2 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-red-100 text-[#991B1B] font-bold text-xs sm:text-sm">
                VS
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {user?.name || 'Vikram Singh (PIA Lead)'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {user?.departmentName || 'NHAI · Executive Director (LA)'}
                </span>
              </div>
              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in-50">
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Vikram Singh'}</p>
                  <p className="text-[11px] text-slate-500">vikram.singh@nhai.gov.in</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
                    <Building className="h-3 w-3" />
                    <span>NHAI Project Implementation Unit</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/dashboard/citizen')
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Citizen Portal View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/dashboard/central')
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left"
                  >
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>Central National View</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out (DoLR SSO)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
