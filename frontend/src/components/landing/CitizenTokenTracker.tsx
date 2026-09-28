import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

export default function CitizenTokenTracker() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tokenInput, setTokenInput] = useState('TK-2026-8941')
  const [isGenerating, setIsGenerating] = useState(false)

  // Direct citizen to dedicated Citizen Interface with Token
  const handleOpenCitizenInterface = (targetToken: string) => {
    // Set active citizen session
    login('citizen123', 'citizen')
    // Redirect directly to Citizen Interface
    navigate(`/dashboard/citizen?token=${encodeURIComponent(targetToken.trim())}`)
  }

  // Handle Token Search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    handleOpenCitizenInterface(tokenInput.trim().toUpperCase())
  }

  // Generate a new token and immediately direct to Citizen Interface
  const handleGenerateAndOpen = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const randNum = Math.floor(1000 + Math.random() * 9000)
      const newToken = `TK-2026-${randNum}`
      setIsGenerating(false)
      handleOpenCitizenInterface(newToken)
    }, 400)
  }

  return (
    <section id="citizen-token-tracker" className="py-14 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white via-slate-50 to-[#EBF2FA]">
      <div className="mx-auto max-w-[1700px] w-full space-y-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900 border border-amber-200">
            <KeyRound className="h-3.5 w-3.5 text-amber-700" />
            <span>Direct Citizen Access Desk · No Password Needed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#042A5E] tracking-tight">
            Citizen Land Acquisition Token Search &amp; Self-Service
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Enter your Citizen Token Number below or generate a new token to be directed directly to your dedicated Citizen Interface with land records, compensation awards, and hearing notices.
          </p>
        </div>

        {/* Token Search & Direct Redirection Card */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-white p-6 sm:p-10 shadow-xl border border-slate-200/90 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-[#FF6B00]" />
                <span>Enter Token Number for Instant Direct Access</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sample Tokens: <button type="button" onClick={() => setTokenInput('TK-2026-8941')} className="font-mono text-[#042A5E] font-bold hover:underline">TK-2026-8941</button> · <button type="button" onClick={() => setTokenInput('LAO-PUN-2025-0894')} className="font-mono text-[#042A5E] font-bold hover:underline">LAO-PUN-2025-0894</button>
              </p>
            </div>

            {/* Generate Token CTA */}
            <button
              type="button"
              onClick={handleGenerateAndOpen}
              disabled={isGenerating}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#E05E00] hover:from-[#E05E00] hover:to-[#C45200] text-white px-4 py-3 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGenerating ? 'Generating Token...' : 'Generate New Token'}</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Enter Token No (e.g. TK-2026-8941)"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#042A5E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#042A5E]/20"
                  required
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#042A5E] hover:bg-[#021838] text-white px-7 py-3.5 text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Direct to Citizen Interface</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Features Micro-strip */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Direct Benefit Transfer Status</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <FileCheck2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Gazette Notices &amp; Objections</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <span>DILRMP Verified Land Records</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
