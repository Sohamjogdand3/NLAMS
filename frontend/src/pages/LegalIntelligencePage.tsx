import { useState } from 'react'
import DistrictSidebar from '../components/district/DistrictSidebar'
import DistrictHeader from '../components/district/DistrictHeader'
import LegalIntelligencePanel from '../components/rag/LegalIntelligencePanel'
import type { DistrictNavigationTab } from '../types/district'
import { useNavigate } from 'react-router-dom'

export default function LegalIntelligencePage() {
  const [activeTab, setActiveTab] = useState<DistrictNavigationTab>('legal_ai')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const navigate = useNavigate()

  const handleTabChange = (tab: DistrictNavigationTab) => {
    if (tab === 'legal_ai') {
      setActiveTab('legal_ai')
    } else {
      navigate('/dashboard/district')
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <DistrictSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingScrutinyCount={0}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DistrictHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pendingScrutinyCount={0}
          onNotificationClick={() => {}}
        />

        <div className="flex-1 overflow-hidden">
          <LegalIntelligencePanel />
        </div>
      </div>
    </div>
  )
}
