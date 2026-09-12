import { useState } from 'react'
import {
  Bell,
  User,
  LogOut,
  Search,
  FileText,
  ChevronDown,
  Home,
  Layers,
  Activity,
  AlertCircle,
  CreditCard,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'
import EmblemIndia from '../landing/EmblemIndia'
import { useAuth } from '../../auth/AuthContext'

interface CitizenHeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  unreadNotificationsCount?: number
}

export default function CitizenHeader({
  activeTab,
  setActiveTab,
  unreadNotificationsCount = 2,
}: CitizenHeaderProps) {
  const { user, logout } = useAuth()
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [notifDropdown, setNotifDropdown] = useState(false)

  const menuItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'land', label: 'My Land' },
    { id: 'case', label: 'Case Status Timeline' },
    { id: 'notices', label: 'Notices & Alerts', badge: '2' },
    { id: 'compensation', label: 'Compensation Status' },
    { id: 'objections', label: 'Objections & Grievances', badge: '1' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <header className="w-full bg-[#042A5E] text-white shadow-md sticky top-0 z-40">
      {/* Top Bar */}
      <div className="border-b border-[#031B3D] px-4 sm:px-8 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Official Title */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <EmblemIndia height={42} className="h-10 w-auto brightness-200" />
              <div className="h-7 w-px bg-blue-900 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Government of India • DoLR
                </span>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                  National Land Acquisition & Management System (NLAMS)
                </h1>
              </div>
            </a>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdown(!notifDropdown)}
                className="relative rounded-lg p-2 text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                title="Notices & Alerts"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#991B1B] text-[10px] font-bold text-white ring-2 ring-[#042A5E]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifDropdown && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-2xl p-4 text-xs z-50 text-slate-800"
                  onMouseLeave={() => setNotifDropdown(false)}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 font-bold text-[#042A5E]">
                    <span>Official Notices & Alerts (2)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('notices')
                        setNotifDropdown(false)
                      }}
                      className="text-[11px] text-[#042A5E] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div
                      onClick={() => {
                        setActiveTab('notices')
                        setNotifDropdown(false)
                      }}
                      className="p-2.5 rounded-lg bg-amber-50/70 border-l-3 border-amber-600 cursor-pointer hover:bg-amber-50"
                    >
                      <div className="font-bold text-slate-900">Sec 23 Award Notice Issued</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Award order #LAO/PUN/894 determined for Survey 142/2A.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">10 Feb 2026</span>
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('compensation')
                        setNotifDropdown(false)
                      }}
                      className="p-2.5 rounded-lg bg-emerald-50/70 border-l-3 border-emerald-600 cursor-pointer hover:bg-emerald-50"
                    >
                      <div className="font-bold text-slate-900">DBT Compensation Payment</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Tranche 1 ₹46,65,125 credited to SBI A/c ending 5829.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">12 Feb 2026</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2.5 rounded-lg bg-[#031B3D] border border-blue-900/60 px-3 py-1.5 hover:bg-[#02132C] transition-colors cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 font-extrabold text-xs text-[#042A5E]">
                  {user?.name?.charAt(0) || 'R'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">
                    {user?.name || 'Rajesh Kumar'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-300 mt-0.5">
                    Landowner • Haveli, Pune
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
              </button>

              {profileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-2xl py-2 z-50 text-xs text-slate-800"
                  onMouseLeave={() => setProfileDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-[#042A5E]">{user?.name || 'Rajesh Kumar'}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || 'rajesh.kumar@citizen.nlams.gov.in'}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                      <ShieldCheck className="h-3 w-3" /> Aadhaar KYC Verified
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile')
                      setProfileDropdown(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User className="h-4 w-4 text-slate-400" /> Profile & Land Parcels
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-[#991B1B] hover:bg-red-50 font-bold"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-[#031B3D] border-b border-blue-950 px-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-bold bg-white/5'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-amber-400 text-[#042A5E]'
                        : 'bg-[#991B1B] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
