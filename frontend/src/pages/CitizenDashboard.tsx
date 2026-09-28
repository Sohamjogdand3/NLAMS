import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CitizenHeader from '../components/citizen/CitizenHeader'
import CaseStepperWidget from '../components/citizen/CaseStepperWidget'
import DocumentUploadWidget from '../components/citizen/DocumentUploadWidget'
import PaymentStatusCard from '../components/citizen/PaymentStatusCard'
import NoticeListWidget from '../components/citizen/NoticeListWidget'
import ObjectionSection from '../components/citizen/ObjectionSection'
import CitizenProfileSection from '../components/citizen/CitizenProfileSection'

import {
  MOCK_CITIZEN_LAND_RECORD,
  MOCK_ACQUISITION_CASE,
  MOCK_STEPPER_STEPS,
  MOCK_DOCUMENTS,
  MOCK_NOTICES,
  MOCK_OBJECTIONS,
  MOCK_COMPENSATION,
} from '../data/mockCitizenData'
import { citizenApi } from '../services/api'
import type { Project } from '../services/api'
import ProjectTable from '../components/dashboard/ProjectTable'

import {
  PlusCircle,
  CreditCard,
  KeyRound,
  CheckCircle2,
  MapPin,
  Building2,
  FileCheck2,
} from 'lucide-react'

export default function CitizenDashboard() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || 'TK-2026-8941'
  const [activeToken, setActiveToken] = useState<string>(tokenFromUrl)

  const [activeTab, setActiveTab] = useState<string>('home')
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (tokenFromUrl) {
      setActiveToken(tokenFromUrl)
    }
  }, [tokenFromUrl])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await citizenApi.fetchCitizenProjects()
        setProjects(data.items)
      } catch (error) {
        console.warn('Failed to fetch citizen projects from API, using client mock data:', error)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col">
      {/* Citizen Portal Header Navigation */}
      <CitizenHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-6 space-y-6">
        {/* Welcome & Active Token Context Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#042A5E] via-slate-900 to-[#042A5E] p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                <FileCheck2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Landowner Self-Service Portal</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30">
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                <span>TOKEN #{activeToken}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Rajesh Kumar S/o Rameshwar Kumar
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-amber-300">
                <MapPin className="h-3.5 w-3.5" />
                Survey No. {MOCK_CITIZEN_LAND_RECORD.surveyNo}/{MOCK_CITIZEN_LAND_RECORD.subDivision} ({MOCK_CITIZEN_LAND_RECORD.village}, {MOCK_CITIZEN_LAND_RECORD.taluka}, {MOCK_CITIZEN_LAND_RECORD.district})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Corridor: <strong className="text-white">{MOCK_ACQUISITION_CASE.projectName}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('objections')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> Raise Objection
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compensation')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-emerald-400" /> View Compensation
            </button>
          </div>
        </div>

        {/* TAB 1: HOME (Dashboard Overview Grid) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Case Stepper Widget */}
            <CaseStepperWidget
              steps={MOCK_STEPPER_STEPS}
              caseId={MOCK_ACQUISITION_CASE.caseId}
              projectName={MOCK_ACQUISITION_CASE.projectName}
            />

            {/* DBT Payment Status Card */}
            <div>
              <PaymentStatusCard compensation={MOCK_COMPENSATION} />
            </div>

            {/* Document Upload Status + Notices Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DocumentUploadWidget documents={MOCK_DOCUMENTS} />
              <NoticeListWidget notices={MOCK_NOTICES} />
            </div>

            {/* Projects list if loaded */}
            {projects.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Associated Infrastructure Projects</h3>
                <ProjectTable projects={projects} />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY LAND RECORDS */}
        {activeTab === 'land' && (
          <div className="space-y-6">
            <DocumentUploadWidget documents={MOCK_DOCUMENTS} />
          </div>
        )}

        {/* TAB 3: CASE TRACKING */}
        {activeTab === 'case' && (
          <div className="space-y-6">
            <CaseStepperWidget
              steps={MOCK_STEPPER_STEPS}
              caseId={MOCK_ACQUISITION_CASE.caseId}
              projectName={MOCK_ACQUISITION_CASE.projectName}
            />
            <NoticeListWidget notices={MOCK_NOTICES} />
          </div>
        )}

        {/* TAB 4: NOTICES */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <NoticeListWidget notices={MOCK_NOTICES} />
          </div>
        )}

        {/* TAB 5: OBJECTIONS */}
        {activeTab === 'objections' && (
          <div className="space-y-6">
            <ObjectionSection objections={MOCK_OBJECTIONS} />
          </div>
        )}

        {/* TAB 6: COMPENSATION */}
        {activeTab === 'compensation' && (
          <div className="space-y-6">
            <PaymentStatusCard compensation={MOCK_COMPENSATION} />
          </div>
        )}

        {/* TAB 7: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <CitizenProfileSection
              landRecord={MOCK_CITIZEN_LAND_RECORD}
              compensation={MOCK_COMPENSATION}
            />
          </div>
        )}
      </main>

      {/* Portal Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-[#042A5E]">NLAMS Citizen Interface</span>
            <span>•</span>
            <span>Department of Land Resources, Ministry of Rural Development</span>
          </div>
          <div>
            Need help? Toll-Free Helpline: <span className="font-bold text-[#FF6B00]">1800-11-2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
