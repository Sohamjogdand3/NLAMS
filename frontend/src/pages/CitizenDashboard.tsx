import { useState } from 'react'
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
import { useEffect } from 'react'
import { citizenApi } from '../services/api'
import type { Project } from '../services/api'
import ProjectTable from '../components/dashboard/ProjectTable'

import {
  PlusCircle,
  CreditCard,
} from 'lucide-react'

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [projects, setProjects] = useState<Project[]>([]);

  // Duplicate activeTab state removed

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await citizenApi.fetchCitizenProjects();
        setProjects(data.items);
      } catch (error) {
        console.error('Failed to fetch citizen projects', error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col">
      {/* Citizen Portal Header Navigation */}
      <CitizenHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-6">
        {/* Welcome & Quick Context Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-navy via-slate-900 to-slate-800 p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                Landowner Self-Service Portal
              </span>
          {/* Project Table */}
          <ProjectTable projects={projects} />
              <span className="text-xs text-slate-300">
                Acquisition Project: <span className="text-amber-300 font-semibold">{MOCK_ACQUISITION_CASE.projectName}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              Welcome, Rajesh Kumar
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Survey No. {MOCK_CITIZEN_LAND_RECORD.surveyNo}/{MOCK_CITIZEN_LAND_RECORD.subDivision} • {MOCK_CITIZEN_LAND_RECORD.village}, Taluka {MOCK_CITIZEN_LAND_RECORD.taluka}, District {MOCK_CITIZEN_LAND_RECORD.district}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('objections')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-sm"
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
            {/* Top Row: Case Stepper Widget */}
            <CaseStepperWidget
              steps={MOCK_STEPPER_STEPS}
              caseId={MOCK_ACQUISITION_CASE.caseId}
              projectName={MOCK_ACQUISITION_CASE.projectName}
            />

            {/* Middle Row: DBT Payment Card */}
            <div>
              <PaymentStatusCard compensation={MOCK_COMPENSATION} />
            </div>

            {/* Bottom Row: Document Upload Status + Notices Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DocumentUploadWidget documents={MOCK_DOCUMENTS} />
              <NoticeListWidget notices={MOCK_NOTICES} />
            </div>
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
            <span className="font-bold text-navy">NLAMS Citizen Portal</span>
            <span>•</span>
            <span>Department of Land Resources, Ministry of Rural Development</span>
          </div>
          <div>
            Need help? Helpline: <span className="font-bold text-amber-700">1800-11-2026</span> (Toll-Free)
          </div>
        </div>
      </footer>
    </div>
  )
}
