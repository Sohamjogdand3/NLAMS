import {
  LayoutDashboard,
  GitFork,
  MapPin,
  FileCheck2,
  Coins,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  AlertTriangle,
} from 'lucide-react'
import type { DistrictNavigationTab } from '../../types/district'

interface DistrictSidebarProps {
  activeTab: DistrictNavigationTab
  setActiveTab: (tab: DistrictNavigationTab) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  pendingScrutinyCount: number
}

export default function DistrictSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  pendingScrutinyCount,
}: DistrictSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as DistrictNavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'pipeline' as DistrictNavigationTab,
      label: 'Acquisition Pipeline',
      icon: GitFork,
      badge: '7 Stages',
      badgeColor: 'bg-blue-100 text-[#042A5E] font-bold',
    },
    {
      id: 'scrutiny' as DistrictNavigationTab,
      label: 'Scrutiny & Verification',
      icon: FileCheck2,
      badge: pendingScrutinyCount > 0 ? `${pendingScrutinyCount} Review` : null,
      badgeColor: 'bg-amber-600 text-white font-extrabold',
    },
    {
      id: 'section11' as DistrictNavigationTab,
      label: 'Sec 11 Freeze & Objections',
      icon: ShieldCheck,
      badge: '60d Timer',
      badgeColor: 'bg-red-700 text-white font-bold',
    },
    {
      id: 'valuation' as DistrictNavigationTab,
      label: 'RFCTLARR Valuation',
      icon: Coins,
      badge: 'Award Engine',
      badgeColor: 'bg-amber-100 text-amber-900 font-bold',
    },
    {
      id: 'claims' as DistrictNavigationTab,
      label: 'Public Claim Verification',
      icon: FileSpreadsheet,
      badge: pendingScrutinyCount > 0 ? `${pendingScrutinyCount} Pending` : 'Dual-Pane',
      badgeColor: 'bg-emerald-700 text-white font-bold',
    },
    {
      id: 'compensation' as DistrictNavigationTab,
      label: 'Compensation Disbursal',
      icon: Building,
      badge: 'PFMS/DBT',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'gis' as DistrictNavigationTab,
      label: 'Cadastral GIS Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'alerts' as DistrictNavigationTab,
      label: 'Alerts & Bottlenecks',
      icon: AlertTriangle,
      badge: '3 Risk',
      badgeColor: 'bg-red-700 text-white animate-pulse',
    },
    {
      id: 'reports' as DistrictNavigationTab,
      label: 'Reports & Audit Log',
      icon: FileCheck2,
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
        className="absolute -right-3.5 top-7 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-colors"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* District Collectorate Branding Header */}
      <div className="flex h-20 items-center border-b border-slate-200 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#042A5E] to-[#031B3D] text-amber-400 shadow-sm ring-2 ring-blue-100">
            <Building className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                District Administration
              </span>
              <span className="truncate text-base font-bold text-slate-900">
                Collectorate · Pune
              </span>
              <span className="truncate text-[11px] text-slate-500">
                Revenue & LAO Command Unit
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            District Revenue Modules
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#042A5E] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                        item.badgeColor || (isActive ? 'bg-amber-400 text-[#042A5E] font-bold' : 'bg-slate-200 text-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer / Authority Badge */}
      <div className="border-t border-slate-200 p-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex flex-col text-[11px]">
              <span className="font-bold text-slate-800">RBAC Scope</span>
              <span className="text-slate-500">Haveli & Khed Tehsils</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="RBAC Restricted to Assigned District">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
        )}
      </div>
    </aside>
  )
}
