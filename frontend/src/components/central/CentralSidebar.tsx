import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  Map as MapIcon,
  GitMerge,
  AlertTriangle,
  BarChart3,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import type { NavigationTab } from '../../types/central'

interface CentralSidebarProps {
  activeTab: NavigationTab
  setActiveTab: (tab: NavigationTab) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  slaAlertCount: number
}

export default function CentralSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  slaAlertCount,
}: CentralSidebarProps) {
  const menuItems: { id: NavigationTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'states', label: 'States', icon: MapPin },
    { id: 'gismap', label: 'GIS Map', icon: MapIcon },
    { id: 'workflow', label: 'Workflow', icon: GitMerge },
    { id: 'risk', label: 'Risk & AI', icon: AlertTriangle, badge: 3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: slaAlertCount },
  ]

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-[#0F172A] text-slate-300 transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 font-extrabold text-white text-xs shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                NLAMS CENTRAL
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                National Command Center
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 font-bold text-white text-xs">
            NL
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-700 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {/* Badge Counter */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-red-700'
                      : 'bg-red-900/60 text-red-300 border border-red-700/50'
                  } ${isCollapsed ? 'absolute top-1 right-1' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="border-t border-slate-800/80 p-3 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
