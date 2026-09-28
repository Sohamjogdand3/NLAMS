import {
  LayoutDashboard,
  FolderGit2,
  GitFork,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  HelpCircle,
} from 'lucide-react'
import type { PiaNavigationTab } from '../../types/pia'

interface PiaSidebarProps {
  activeTab: PiaNavigationTab
  setActiveTab: (tab: PiaNavigationTab) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  openClarificationCount: number
  onOpenCreateModal?: () => void
}

export default function PiaSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  openClarificationCount,
}: PiaSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as PiaNavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'projects' as PiaNavigationTab,
      label: 'My Projects',
      icon: FolderGit2,
      badge: '8 Active',
    },
    {
      id: 'progress' as PiaNavigationTab,
      label: 'Acquisition Progress',
      icon: GitFork,
      badge: null,
    },
    {
      id: 'documents' as PiaNavigationTab,
      label: 'Documents Repository',
      icon: FileText,
      badge: null,
    },
    {
      id: 'alerts' as PiaNavigationTab,
      label: 'Alerts & Tasks',
      icon: AlertTriangle,
      badge: openClarificationCount > 0 ? `${openClarificationCount} Action` : null,
      badgeColor: 'bg-red-700 text-white animate-pulse',
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

      {/* Agency Branding Header */}
      <div className="flex h-20 items-center border-b border-slate-200 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#991B1B] to-[#7F1D1D] text-white shadow-sm ring-2 ring-red-100">
            <Building2 className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[10px] font-bold tracking-widest text-[#991B1B] uppercase">
                PIA Portal · MoRTH / NHAI
              </span>
              <span className="truncate text-base font-bold text-slate-900">
                Project Agency
              </span>
              <span className="truncate text-[11px] text-slate-500">
                National Highway / Corridor Units
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Agency Management
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
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-red-50 text-[#991B1B] font-semibold ring-1 ring-red-200'
                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#991B1B]' : 'text-slate-500 group-hover:text-slate-800'
                }`}
              />

              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
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

      {/* Government Badge & Support footer */}
      {!isCollapsed && (
        <div className="border-t border-slate-200 p-3 bg-slate-50/50">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Shield className="h-4 w-4 text-[#991B1B]" />
              <span>DoLR Interoperability v3.4</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Synchronized with State Bhulekh, PM GatiShakti & BhoomiRashi.
            </p>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault()
                  alert('PIA Support Helpline: 1800-11-2026 | Technical Helpdesk: helpdesk-pia@nlams.gov.in')
                }}
                className="hover:text-[#991B1B] flex items-center gap-1 font-medium"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>PIA SOP Guide</span>
              </a>
              <span className="text-[10px] text-slate-400">Govt of India</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
