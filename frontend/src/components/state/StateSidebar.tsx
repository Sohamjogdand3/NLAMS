import {
  LayoutDashboard,
  FileCheck2,
  UserCheck,
  Scale,
  Database,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import type { StateNavigationTab } from '../../types/stateNodal'

interface StateSidebarProps {
  activeTab: StateNavigationTab
  setActiveTab: (tab: StateNavigationTab) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  pendingIntakeCount: number
}

export default function StateSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  pendingIntakeCount,
}: StateSidebarProps) {
  const menuItems = [
    {
      id: 'overview' as StateNavigationTab,
      label: 'State Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'proposals' as StateNavigationTab,
      label: 'Proposal Intake & Routing',
      icon: FileCheck2,
      badge: pendingIntakeCount > 0 ? `${pendingIntakeCount} Pending` : null,
      badgeColor: 'bg-amber-500 text-[#042A5E] font-bold',
    },
    {
      id: 'cala-appointments' as StateNavigationTab,
      label: 'CALA Appointment Orders',
      icon: UserCheck,
      badge: 'Sec 3(a)',
      badgeColor: 'bg-[#042A5E] text-white font-bold',
    },
    {
      id: 'multiplier-audit' as StateNavigationTab,
      label: 'Multiplier Compliance Audit',
      icon: Scale,
      badge: '1.0x-2.0x',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'land-registry-api' as StateNavigationTab,
      label: 'Land Registry API Gateways',
      icon: Database,
      badge: '3 Online',
      badgeColor: 'bg-emerald-600 text-white font-bold',
    },
    {
      id: 'reports' as StateNavigationTab,
      label: 'State MIS & Audit Log',
      icon: FileSpreadsheet,
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#042A5E] text-white font-bold text-xs shadow-xs shrink-0">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              State Government Desk
            </span>
            <span className="text-xs font-black text-[#042A5E] truncate">
              Revenue Nodal Authority
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
                  ? 'bg-[#042A5E] text-white shadow-xs'
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

      {/* Footer / Jurisdiction Indicator */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 m-3 rounded-xl text-center">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Jurisdiction Boundary</div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">Government of Maharashtra</div>
          <div className="text-[9.5px] text-slate-500 mt-0.5">Revenue &amp; Forest Department</div>
        </div>
      )}
    </aside>
  )
}
