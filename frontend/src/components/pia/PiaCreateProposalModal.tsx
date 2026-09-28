import { useState } from 'react'
import {
  X,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Shield,
  FileText,
  FileSpreadsheet,
  Layers,
} from 'lucide-react'
import type { PiaProject, InfrastructureSector } from '../../types/pia'

interface PiaCreateProposalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: (project: PiaProject) => void
}

export default function PiaCreateProposalModal({
  isOpen,
  onClose,
  onCreateProject,
}: PiaCreateProposalModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // Step 1 State
  const [projectName, setProjectName] = useState('')
  const [sector, setSector] = useState<InfrastructureSector>('Highways')
  const [agencyUnit, setAgencyUnit] = useState('NHAI PIU Gurugram / Nuh')
  const [state, setState] = useState('Haryana')
  const [district, setDistrict] = useState('')
  const [tehsils, setTehsils] = useState('')
  const [landRequiredHa, setLandRequiredHa] = useState<number>(250)
  const [privateLandHa, setPrivateLandHa] = useState<number>(200)
  const [govtLandHa, setGovtLandHa] = useState<number>(35)
  const [forestLandHa, setForestLandHa] = useState<number>(15)
  const [targetCommissioning, setTargetCommissioning] = useState('2027-12-31')
  const [alignmentFileName, setAlignmentFileName] = useState('')

  // Step 2 State
  const [pfrFileName, setPfrFileName] = useState('')
  const [villageScheduleFileName, setVillageScheduleFileName] = useState('')
  const [calaPreference, setCalaPreference] = useState('Sub-Divisional Magistrate (SDM) / CALA')
  const [hasForestNoc, setHasForestNoc] = useState(true)
  const [declarationAgreed, setDeclarationAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleNextStep = () => {
    if (!projectName.trim()) {
      setValidationError('Please enter a valid project name.')
      return
    }
    if (!district.trim()) {
      setValidationError('Please enter the target district.')
      return
    }
    if (landRequiredHa <= 0) {
      setValidationError('Land required must be greater than 0 hectares.')
      return
    }

    setValidationError(null)
    setCurrentStep(2)
  }

  const handleSubmit = () => {
    if (!declarationAgreed) {
      setValidationError('Please certify the statutory declaration to proceed.')
      return
    }

    setIsSubmitting(true)
    setValidationError(null)

    setTimeout(() => {
      const randomSuffix = Math.floor(100 + Math.random() * 900)
      const projectCode =
        sector === 'Highways'
          ? `NHAI-${district.toUpperCase().slice(0, 3)}-PKG${randomSuffix}`
          : sector === 'Railways'
          ? `DFCCIL-CORR-${randomSuffix}`
          : `NICDC-NODE-${randomSuffix}`

      const newProject: PiaProject = {
        id: `proj_${Date.now()}`,
        code: projectCode,
        name: projectName,
        agency: 'National Highways Authority of India (NHAI)',
        sector,
        state,
        district,
        tehsils: tehsils ? tehsils.split(',').map((t) => t.trim()) : [district],
        landRequiredHa: Number(landRequiredHa),
        landAcquiredHa: 0,
        privateLandHa: Number(privateLandHa),
        govtLandHa: Number(govtLandHa),
        forestLandHa: Number(forestLandHa),
        parcelsCount: Math.round(Number(landRequiredHa) * 2.8),
        currentStage: 'Proposal',
        status: 'under_scrutiny',
        budgetCr: Math.round(Number(landRequiredHa) * 2.2),
        disbursedCr: 0,
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        submissionDate: new Date().toISOString().slice(0, 10),
        targetCommissioning,
        calaAuthority: `${calaPreference}, ${district}`,
        coordinates: [28.6139, 77.209], // Default capital vicinity
        clarificationsCount: 0,
        pendingDocsCount: 1,
        statutoryMilestones: [
          {
            stage: 'Proposal',
            status: 'completed',
            completedDate: new Date().toISOString().slice(0, 10),
            slaDays: 30,
            elapsedDays: 1,
            notes: 'Requisition submitted by PIA to CALA',
          },
          { stage: 'Scrutiny', status: 'current', slaDays: 45, elapsedDays: 1, notes: 'Awaiting initial revenue scrutiny' },
          { stage: 'Notification', status: 'upcoming', slaDays: 60, elapsedDays: 0 },
          { stage: 'Award', status: 'upcoming', slaDays: 90, elapsedDays: 0 },
          { stage: 'Compensation', status: 'upcoming', slaDays: 45, elapsedDays: 0 },
          { stage: 'Possession', status: 'upcoming', slaDays: 30, elapsedDays: 0 },
        ],
      }

      onCreateProject(newProject)
      setIsSubmitting(false)
      onClose()
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in-50">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#991B1B] text-white">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Start Land Acquisition Proposal
              </h3>
              <p className="text-xs text-slate-300">
                2-Step Statutory Requisition for Project Implementing Agencies (RFCTLARR / NH Act)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Step Progress Indicator */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex items-center w-full max-w-md mx-auto">
            {/* Step 1 Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  currentStep === 1
                    ? 'bg-[#991B1B] text-white ring-2 ring-red-200'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
              </div>
              <span className={`text-xs font-bold ${currentStep === 1 ? 'text-[#991B1B]' : 'text-slate-700'}`}>
                Step 1: Project Alignment
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-300 mx-4" />

            {/* Step 2 Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  currentStep === 2
                    ? 'bg-[#991B1B] text-white ring-2 ring-red-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </div>
              <span className={`text-xs font-bold ${currentStep === 2 ? 'text-[#991B1B]' : 'text-slate-400'}`}>
                Step 2: Statutory Schedules
              </span>
            </div>
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-[#991B1B]" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentStep === 1 ? (
            /* STEP 1: Alignment & Land Requirement */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Title / Corridor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Delhi-Dehradun Economic Corridor (Package III Spur)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Infrastructure Sector *
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as InfrastructureSector)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  >
                    <option value="Highways">National Highways / Expressways</option>
                    <option value="Railways">Dedicated Freight / High Speed Rail</option>
                    <option value="Industrial Corridor">Industrial Nodes (NICDC)</option>
                    <option value="Energy / Power">Energy / Power Transmission ROW</option>
                    <option value="Port & Multi-Modal">Multi-Modal Logistics Park (MMLP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIA Regional Unit / PIU *
                  </label>
                  <input
                    type="text"
                    value={agencyUnit}
                    onChange={(e) => setAgencyUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  >
                    <option value="Haryana">Haryana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gurugram, Sonipat, Jaipur"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tehsils / Revenue Taluks (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sohna, Farrukhnagar, Pataudi"
                    value={tehsils}
                    onChange={(e) => setTehsils(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Commissioning Date *
                  </label>
                  <input
                    type="date"
                    value={targetCommissioning}
                    onChange={(e) => setTargetCommissioning(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Land Requirement Sub-breakdown */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#991B1B]" />
                  Land Area Breakdown (in Hectares)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Total Req (Ha)</label>
                    <input
                      type="number"
                      value={landRequiredHa}
                      onChange={(e) => setLandRequiredHa(Number(e.target.value))}
                      className="w-full rounded border border-slate-300 bg-white p-2 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Private (Ha)</label>
                    <input
                      type="number"
                      value={privateLandHa}
                      onChange={(e) => setPrivateLandHa(Number(e.target.value))}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Govt Land (Ha)</label>
                    <input
                      type="number"
                      value={govtLandHa}
                      onChange={(e) => setGovtLandHa(Number(e.target.value))}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Forest (Ha)</label>
                    <input
                      type="number"
                      value={forestLandHa}
                      onChange={(e) => setForestLandHa(Number(e.target.value))}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* GIS Alignment File upload simulation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corridor GIS Alignment File (.KML / .GeoJSON / Shapefile)
                </label>
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 text-xs text-slate-600">
                    <UploadCloud className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="font-semibold text-slate-700">
                      {alignmentFileName || 'Click to select or drag corridor alignment file'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports WGS84 coordinates & PM GatiShakti national standard
                    </p>
                    <button
                      type="button"
                      onClick={() => setAlignmentFileName('Delhi_Dehradun_Alignment_PK3.geojson')}
                      className="mt-1 rounded bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-300"
                    >
                      Attach Sample GeoJSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Statutory Documentation & Requisition */
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-[#991B1B]" />
                  Statutory Schedules & Village Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* PFR Upload */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <span className="font-bold text-slate-800 block mb-1">
                      1. Preliminary Feasibility Report (PFR) *
                    </span>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Technical DPR alignment & ROW width approval
                    </p>
                    <button
                      type="button"
                      onClick={() => setPfrFileName('PFR_Signed_Feasibility_Report_2026.pdf')}
                      className="rounded bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-red-700" />
                      <span>{pfrFileName || 'Upload Signed PFR (.pdf)'}</span>
                    </button>
                  </div>

                  {/* Village Schedule */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <span className="font-bold text-slate-800 block mb-1">
                      2. Gata / Khasra Schedule of Villages *
                    </span>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Village-wise list of affected survey numbers
                    </p>
                    <button
                      type="button"
                      onClick={() => setVillageScheduleFileName('Village_Gata_List_Gurugram.xlsx')}
                      className="rounded bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
                      <span>{villageScheduleFileName || 'Upload Schedule (.xlsx)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CALA Authority Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation of Competent Authority (CALA) *
                </label>
                <select
                  value={calaPreference}
                  onChange={(e) => setCalaPreference(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#991B1B] focus:outline-none"
                >
                  <option value="Sub-Divisional Magistrate (SDM) / CALA">
                    Sub-Divisional Magistrate (SDM) / CALA
                  </option>
                  <option value="Additional District Magistrate (LA) / ADM">
                    Additional District Magistrate (LA) / ADM
                  </option>
                  <option value="Special Land Acquisition Officer (SLAO)">
                    Special Land Acquisition Officer (SLAO)
                  </option>
                </select>
              </div>

              {/* Forest NOC check */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="forestNoc"
                  checked={hasForestNoc}
                  onChange={(e) => setHasForestNoc(e.target.checked)}
                  className="rounded border-slate-300 text-[#991B1B] focus:ring-red-200"
                />
                <label htmlFor="forestNoc" className="text-slate-700 font-medium">
                  Stage-1 Forest Clearance proposal already registered on PARIVESH Portal
                </label>
              </div>

              {/* Statutory Certification */}
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#991B1B]">
                  <Shield className="h-4 w-4" />
                  <span>Statutory Certificate by Project Implementing Agency</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I hereby certify that the corridor alignment has been delineated to minimize involuntary resettlement and displacement of local communities. The requisition is submitted in accordance with Section 3A of the National Highways Act, 1956 / RFCTLARR Act 2013.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="declarationAgreed"
                    checked={declarationAgreed}
                    onChange={(e) => setDeclarationAgreed(e.target.checked)}
                    className="rounded border-slate-300 text-[#991B1B] focus:ring-red-200"
                  />
                  <label htmlFor="declarationAgreed" className="text-slate-900 font-bold">
                    I confirm and digitally sign this acquisition proposal
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          {currentStep === 2 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Alignment</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}

          {currentStep === 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors"
            >
              <span>Next: Statutory Schedules</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 text-xs font-bold shadow-xs transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Submitting to CALA...' : 'Submit Proposal to CALA'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
