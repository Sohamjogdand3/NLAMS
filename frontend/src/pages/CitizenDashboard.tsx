import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import CitizenHeader from '../components/citizen/CitizenHeader'
import CaseStepperWidget from '../components/citizen/CaseStepperWidget'
import DocumentUploadWidget from '../components/citizen/DocumentUploadWidget'
import PaymentStatusCard from '../components/citizen/PaymentStatusCard'
import NoticeListWidget from '../components/citizen/NoticeListWidget'
import ObjectionSection from '../components/citizen/ObjectionSection'
import CitizenProfileSection from '../components/citizen/CitizenProfileSection'
import LegalIntelligencePanel from '../components/rag/LegalIntelligencePanel'

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
import { useAuth } from '../auth/AuthContext'

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
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || 'TK-2026-8941'
  const [activeToken, setActiveToken] = useState<string>(tokenFromUrl)
  const [activeTab, setActiveTab] = useState<string>('home')
  const [notices, setNotices] = useState(MOCK_NOTICES)

  const loadCitizenData = useCallback(async () => {
    try {
      const data = await citizenApi.fetchMyNotices()
      if (Array.isArray(data) && data.length > 0) {
        const mappedNotices = data.map((n: any, idx: number) => ({
          id: String(n.id || `not-${idx + 1}`),
          section: (n.section || 'Section 11(1)') as any,
          title: n.title || 'Preliminary Gazette Notification',
          publishedDate: n.published_date || '2026-09-12',
          expiryDate: n.expiry_date || '2026-11-11',
          daysRemaining: n.days_remaining || 48,
          status: 'Active',
          gazetteNo: n.gazette_notification_no || 'MAH/GAZ/2026/PUN-RING/042',
          pdfUrl: 'Section11_Gazette_Pune_RingRoad_Haveli.pdf',
          summary: n.description || 'Land acquisition notification under Section 11(1) of RFCTLARR Act 2013.',
        }))
        setNotices(mappedNotices as any)
      }
    } catch (err) {
      console.warn('Using cached citizen notices:', err)
    }
  }, [])

  useEffect(() => {
    loadCitizenData()
  }, [loadCitizenData])

  useEffect(() => {
    if (tokenFromUrl) {
      setActiveToken(tokenFromUrl)
    }
  }, [tokenFromUrl])

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
              {user?.name || 'Rajesh Kumar S/o Rameshwar Kumar'}
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
            <button
              type="button"
              onClick={() => setActiveTab('legal_help')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              <span>Legal Help</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HOME (Compact, Calm Overview) */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Case Stepper Widget */}
            <CaseStepperWidget
              steps={MOCK_STEPPER_STEPS}
              caseId={MOCK_ACQUISITION_CASE.caseId}
              projectName={MOCK_ACQUISITION_CASE.projectName}
            />

            {/* Two-Column Clean Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compensation Quick Status Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Compensation Entitlement
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5">
                      PFMS Approved
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ₹{((MOCK_COMPENSATION.totalAwardAmount || 9330250) / 100000).toFixed(2)} Lakh
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct Benefit Transfer scheduled to Bank Account: <strong>XXXX-XXXX-4821</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Disbursal Stage: <strong>Stage 3/4</strong></span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compensation')}
                    className="text-xs font-bold text-[#042A5E] hover:underline cursor-pointer"
                  >
                    View Breakdown &rarr;
                  </button>
                </div>
              </div>

              {/* Statutory Notices Quick Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Active Notices &amp; Objections
                    </span>
                    <span className="rounded-full bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5">
                      60d Window Active
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-base font-bold text-slate-900 block">
                      Section 11(1) Preliminary Gazette Notification
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Published on 12 Sep 2026 • 48 days remaining to submit objections under Sec 15.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('notices')}
                    className="text-xs font-bold text-[#042A5E] hover:underline cursor-pointer"
                  >
                    Read Gazette Notice &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('objections')}
                    className="rounded-lg bg-[#FF6B00] hover:bg-[#E05E00] text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    File Objection
                  </button>
                </div>
              </div>
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
            <NoticeListWidget notices={notices} />
          </div>
        )}

        {/* TAB 4: NOTICES */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <NoticeListWidget notices={notices} />
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

        {/* TAB 8: LEGAL HELP (PUBLIC STATUTORY ASSISTANT) */}
        {activeTab === 'legal_help' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Citizen Legal Helpdesk</span> — Ask questions regarding the RFCTLARR Act, your rights as a landowner, statutory notices, and claim procedures.
              </div>
              <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                Public Acts &amp; Rules
              </span>
            </div>
            <div className="h-[600px]">
              <LegalIntelligencePanel />
            </div>
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
