import {
  LayoutDashboard,
  Users,
  Gift,
  Building,
  FileCheck2,
  Coins,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react'
import type { RnRNavigationTab } from '../../types/rnr'

interface RnRSidebarProps {
  activeTab: RnRNavigationTab
  setActiveTab: (tab: RnRNavigationTab) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  pendingCensusCount: number
}

export default function RnRSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  pendingCensusCount,
}: RnRSidebarProps) {
  const menuItems = [
    {
      id: 'overview' as RnRNavigationTab,
      label: 'R&R Executive Summary',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'census' as RnRNavigationTab,
      label: 'Affected Families Census',
      icon: Users,
      badge: pendingCensusCount > 0 ? `${pendingCensusCount} Active` : null,
      badgeColor: 'bg-purple-100 text-purple-900 font-bold',
    },
    {
      id: 'entitlements' as RnRNavigationTab,
      label: 'Schedule II Entitlement Packages',
      icon: Gift,
      badge: 'Sec 31',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'community-assets' as RnRNavigationTab,
      label: 'Schedule III Community Assets',
      icon: Building,
      badge: '4 Sites',
      badgeColor: 'bg-blue-100 text-[#042A5E] font-bold',
    },
    {
      id: 'sia-clearance' as RnRNavigationTab,
      label: 'SIA Expert Committee Sign-Off',
      icon: FileCheck2,
      badge: 'Sec 7',
      badgeColor: 'bg-amber-100 text-amber-900 font-bold',
    },
    {
      id: 'disbursals' as RnRNavigationTab,
      label: 'Livelihood Disbursals Ledger',
      icon: Coins,
      badge: null,
    },
  ]

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 shadow-xs z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-7 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand / Role Title */}
      <div className="flex h-16 items-center border-b border-slate-100 px-5 gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-900 text-white font-bold text-xs shadow-xs shrink-0">
          <HeartHandshake className="h-5 w-5 text-amber-400" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Social Welfare Authority
            </span>
            <span className="text-xs font-black text-purple-950 truncate">
              R&amp;R Administrator Desk
            </span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[9px] shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer / Statutory Banner */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-purple-50/50 m-3 rounded-xl text-center">
          <div className="text-[10px] text-purple-700 font-bold uppercase">RFCTLARR 2013 Mandate</div>
          <div className="text-xs font-bold text-purple-950 mt-0.5">Schedules II &amp; III Enforced</div>
          <div className="text-[9.5px] text-purple-600 mt-0.5">Non-Owner Social Protection</div>
        </div>
      )}
    </aside>
  )
}
