import {
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
} from 'lucide-react'
import type { LandRecord, CompensationSummary } from '../../types/citizen'

interface CitizenProfileSectionProps {
  landRecord: LandRecord
  compensation: CompensationSummary
}

export default function CitizenProfileSection({
  landRecord,
  compensation,
}: CitizenProfileSectionProps) {
  return (
    <div className="space-y-6">
      {/* Top Card: Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 font-black text-2xl text-slate-950 shadow-md">
              RK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Rajesh Kumar</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> Aadhaar KYC Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Registered Landowner • Citizen ID: <span className="font-mono font-bold">CTZ-MH-9812</span>
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> +91 98230 •••••
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> rajesh.kumar@citizen.nlams.gov.in
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Khed Shivapur, Haveli, Pune
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Profile details are locked to Aadhaar KYC authentication.')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5 text-slate-500" /> KYC Details Locked
          </button>
        </div>
      </div>

      {/* Grid: Land Parcels & DBT Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Land Parcels Registered */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-600" />
            Registered Land Parcels (1)
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-navy bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                ULPIN: {landRecord.ulpin}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                7/12 Verified
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900">
              Survey No. {landRecord.surveyNo}/{landRecord.subDivision}
            </div>

            <div className="text-xs text-slate-600">
              Village: {landRecord.village}, Taluka: {landRecord.taluka}, District: {landRecord.district}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 mt-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Total Ownership Area</span>
                <span className="font-bold text-slate-900">{landRecord.totalAreaHa} Ha ({landRecord.totalAreaAcres} Acres)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Acquired Area</span>
                <span className="font-bold text-rose-700">{landRecord.acquiredAreaHa} Ha</span>
              </div>
            </div>
          </div>
        </div>

        {/* DBT & Bank Linkage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Direct Benefit Transfer (DBT) Account
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Bank Name</span>
              <span className="text-xs font-extrabold text-slate-900">{compensation.bankName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Account Number</span>
              <span className="font-mono text-xs font-extrabold text-slate-900">
                {compensation.accountNoMasked}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">IFSC Code</span>
              <span className="font-mono text-xs font-semibold text-slate-700">{compensation.ifscCode}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="text-xs font-bold text-slate-700">NPCI Aadhaar Seeding</span>
              <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Active & Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
