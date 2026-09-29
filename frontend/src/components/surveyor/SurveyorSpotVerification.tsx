import { useState } from 'react'
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react'
import type { FieldParcelTask } from '../../types/surveyor'

interface SurveyorSpotVerificationProps {
  parcel: FieldParcelTask
  onCompleteVerification: () => void
}

export default function SurveyorSpotVerification({
  parcel,
  onCompleteVerification,
}: SurveyorSpotVerificationProps) {
  const [occupantName, setOccupantName] = useState(parcel.occupantOnSite)
  const [phone, setPhone] = useState('+91 98220 14821')
  const [ekycStatus, setEkycStatus] = useState<'pending' | 'verifying' | 'verified'>('pending')
  const [signatureDone, setSignatureDone] = useState(false)
  const [spotRemarks, setSpotRemarks] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSimulateEkyc = () => {
    setEkycStatus('verifying')
    setTimeout(() => {
      setEkycStatus('verified')
    }, 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCompleteVerification()
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
            <UserCheck className="h-4 w-4 text-[#042A5E]" />
            Spot Occupant eKYC &amp; Presence Verification
          </h3>
          <span className="font-mono text-xs font-bold text-[#042A5E]">
            {parcel.khasraGatNumber}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Verify physical possession, identity of cultivator, and collect digitally witnessed signature at parcel site.
        </p>
      </div>

      {isSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Spot verification recorded &amp; digitally sealed!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Occupant Details Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            On-Site Cultivator / Occupant
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Name of Person Present On-Site
              </label>
              <input
                type="text"
                required
                value={occupantName}
                onChange={(e) => setOccupantName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#042A5E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Contact Mobile Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#042A5E]"
              />
            </div>
          </div>
        </div>

        {/* Biometric / Aadhaar OTP Verification Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Spot Aadhaar eKYC
          </h4>

          {ekycStatus === 'verified' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Aadhaar Biometric eKYC Authenticated</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800">Match 98.4%</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSimulateEkyc}
              disabled={ekycStatus === 'verifying'}
              className="w-full rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs font-bold text-[#042A5E] hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="h-5 w-5 text-[#042A5E]" />
              <span>
                {ekycStatus === 'verifying'
                  ? 'Verifying Biometrics with UIDAI...'
                  : 'Trigger Spot Aadhaar OTP / Thumbprint Match'}
              </span>
            </button>
          )}
        </div>

        {/* Digital Signature Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Farmer / Occupant Signature
            </h4>
            {signatureDone && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Signed on Screen
              </span>
            )}
          </div>

          <div
            onClick={() => setSignatureDone(true)}
            className="h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer text-xs text-slate-400"
          >
            {signatureDone ? (
              <span className="italic font-serif text-lg font-bold text-slate-800 transform -rotate-3">
                {occupantName}
              </span>
            ) : (
              <span>Tap here to sign on screen</span>
            )}
          </div>
        </div>

        {/* Remarks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <label className="block text-[11px] font-bold text-slate-700">
            Field Surveyor Witness Remarks:
          </label>
          <textarea
            rows={2}
            value={spotRemarks}
            onChange={(e) => setSpotRemarks(e.target.value)}
            placeholder="e.g. Occupant confirmed crop season and boundary tree counts in presence of Talathi..."
            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-xl bg-[#042A5E] hover:bg-[#07397b] py-3 text-xs font-bold text-white shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Complete &amp; Seal Joint Survey Record
        </button>
      </form>
    </div>
  )
}
