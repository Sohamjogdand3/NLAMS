import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  BookOpen,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileCheck2,
  MapPin,
  ArrowRight,
  HelpCircle,
  Building,
  Mail,
  Send,
  Timer,
} from 'lucide-react'
import UtilityBar from '../components/landing/UtilityBar'
import Header from '../components/landing/Header'
import Footer from '../components/landing/Footer'
import { useAuth } from '../auth/AuthContext'
import { type UserType, MOCK_ACCOUNTS } from '../types/auth'
import { authApi } from '../services/api'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, loginWithOTP, user } = useAuth()

  // Active login type: 'pia' or 'department'
  const initialType: UserType = searchParams.get('type') === 'pia' ? 'pia' : 'department'
  const [activeType, setActiveType] = useState<UserType>(initialType)

  // Auth mode: 'otp' (Government OTP standard) or 'password' (Legacy/Direct)
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp')

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState('collector.pune@nlams.gov.demo')
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('Password@123')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // OTP flow state
  const [otpSent, setOtpSent] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  // Captcha generator
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaText(result)
    setCaptchaInput('')
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  // Cooldown countdown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCooldown])

  // Sync state if URL query param changes
  useEffect(() => {
    const typeFromUrl = searchParams.get('type')
    if (typeFromUrl === 'pia' || typeFromUrl === 'department') {
      setActiveType(typeFromUrl as UserType)
      if (typeFromUrl === 'pia') {
        setEmailOrUsername('officer.nhai@nlams.gov.demo')
      } else {
        setEmailOrUsername('collector.pune@nlams.gov.demo')
      }
    }
  }, [searchParams])

  // Request OTP from government Identity Provider
  const handleRequestOtp = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanInput = emailOrUsername.trim().toLowerCase()
    if (!cleanInput) {
      setErrorMessage('Please enter your official government email address.')
      return
    }

    if (cleanInput.includes('@gmail.com') || cleanInput.includes('@yahoo.com') || cleanInput.includes('@hotmail.com')) {
      setErrorMessage('Personal email providers (Gmail, Yahoo, etc.) are strictly prohibited for Government Officials. Use an authorized government identity (@nlams.gov.demo).')
      return
    }

    setIsSendingOtp(true)
    try {
      const res = await authApi.requestOfficialOTP(cleanInput)
      setOtpSent(true)
      setOtpCooldown(res.cooldown_seconds || 60)
      setSuccessMessage(res.message || `OTP dispatched to ${res.identifier_masked || cleanInput}. Valid for 3 minutes.`)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch OTP. Please verify your government email.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Handle Form Submission (Verify OTP or Password Login)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanEmail = emailOrUsername.trim()
    if (!cleanEmail) {
      setErrorMessage('Please enter your Official Email / ID')
      return
    }

    if (captchaInput.trim().toLowerCase() !== captchaText.toLowerCase()) {
      setErrorMessage('Security captcha text does not match. Please try again.')
      generateCaptcha()
      return
    }

    setIsLoading(true)

    try {
      if (authMode === 'otp') {
        if (!otpCode.trim()) {
          setErrorMessage('Please enter the 6-digit OTP sent to your government email.')
          setIsLoading(false)
          return
        }

        const success = await loginWithOTP(cleanEmail, otpCode.trim(), activeType)
        if (!success) {
          throw new Error('Authentication failed. Please check your credentials.')
        }
      } else {
        // Password / Legacy flow
        const success = await login(cleanEmail, activeType, password, otpCode || '123456')
        if (!success) {
          throw new Error('Authentication failed. Invalid password or credentials.')
        }
      }

      setSuccessMessage(`Authenticated successfully as ${cleanEmail}!`)

      // Redirect to appropriate dashboard
      setTimeout(() => {
        const lowerEmail = cleanEmail.toLowerCase()
        if (activeType === 'pia' || lowerEmail.includes('nhai') || lowerEmail.includes('mmrda') || lowerEmail.includes('cidco') || lowerEmail.includes('pwd')) {
          navigate('/dashboard/pia')
        } else if (lowerEmail.includes('state') || lowerEmail.includes('maharashtra') || lowerEmail.includes('nodal')) {
          navigate('/dashboard/state-nodal')
        } else if (lowerEmail.includes('rnr') || lowerEmail.includes('rehab')) {
          navigate('/dashboard/rnr-admin')
        } else if (lowerEmail.includes('surveyor') || lowerEmail.includes('patwari') || lowerEmail.includes('amin')) {
          navigate('/surveyor/field-app')
        } else if (
          lowerEmail.includes('collector') ||
          lowerEmail.includes('lao') ||
          lowerEmail.includes('tehsildar') ||
          lowerEmail.includes('talathi') ||
          lowerEmail.includes('district')
        ) {
          navigate('/dashboard/district')
        } else {
          navigate('/dashboard/central')
        }
      }, 600)
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.')
      generateCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  // Quick fill helper for Maharashtra demo accounts
  const handleQuickFill = (accountKey: string) => {
    const acc = MOCK_ACCOUNTS[accountKey]
    if (acc) {
      const email = acc.email || acc.username
      setEmailOrUsername(email)
      setPassword('Password@123')
      setActiveType(acc.role === 'pia' || acc.role === 'agency' ? 'pia' : 'department')
      setCaptchaInput(captchaText)
      setErrorMessage(null)
      setSuccessMessage(`Selected demo identity: ${acc.name} (${email})`)
      setOtpSent(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FC] via-white to-[#EBF2FA] flex flex-col font-sans">
      <UtilityBar />
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1700px] w-full">
          {/* Breadcrumb / Status Banner */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <a href="/" className="hover:text-navy transition-colors">Home</a>
              <span>/</span>
              <span className="text-navy font-bold">
                {activeType === 'pia' ? 'PIA Agency Identity Provider' : 'Government Official Authentication'}
              </span>
            </div>

            {user && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Active Government Session: <strong>{user.name}</strong> ({user.role.toUpperCase()})</span>
              </div>
            )}
          </div>

          {/* Hero Banner */}
          <div className="mb-8 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/60">
            <img
              src="/land-acquisition-hero.jpg"
              alt="Aerial view of land acquisition with GIS parcel overlay"
              className="w-full h-48 sm:h-56 lg:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#042A5E]/85 via-[#042A5E]/35 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 text-xs px-2.5 py-1 rounded-md border border-amber-400/30 mb-2 backdrop-blur-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                <span>Government-Grade Identity &amp; Access Management</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                Official Single Sign-On Portal (Maharashtra &amp; Central Hierarchy)
              </h2>
              <p className="mt-1 text-sm text-white/85 max-w-2xl">
                Multi-factor Email OTP verification for 36 District Collectors, 36 LAOs, 358 Tehsildars, 358 Talathis, State Admin, and National Infrastructure Agencies.
              </p>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Security Guidelines & Maharashtra Hierarchy Quick Fill */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 p-6 sm:p-10 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-navy border border-blue-100 mb-4">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Government Demo IdP (nlams.gov.demo)</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#042A5E] tracking-tight">
                  Official Authentication Protocol
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Authentication is strictly restricted to verified government identities. Official logins enforce email domain validation, Redis-backed one-time passwords, and cryptographically signed JWT sessions.
                </p>

                {/* Instruction Cards */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:bg-white hover:border-slate-300">
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Enter Official Email</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Provide your approved government email (e.g. <code>collector.pune@nlams.gov.demo</code>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:bg-white hover:border-slate-300">
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Request &amp; Verify Email OTP</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Receive a secure single-use 6-digit OTP code (180s expiry, max 3 attempts).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:bg-white hover:border-slate-300">
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Session Rotation &amp; Audit Log</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        An immutable audit entry is recorded and a 15-minute access token is issued.
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Highlights */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Aadhaar eKYC &amp; DigiLocker Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>36 Districts &amp; 358 Talukas Seeded</span>
                  </div>
                </div>
              </div>

              {/* Maharashtra Hierarchy Quick Demo Account Selector */}
              <div className="mt-6 rounded-xl bg-gradient-to-r from-slate-50 via-white to-amber-50/40 border border-slate-200/80 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <KeyRound className="h-4 w-4 text-[#991B1B]" />
                    <span>Maharashtra Hierarchy Demo Accounts</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">1-click auto-select</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('collector_district')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-900 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    Collector (Pune)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('lao_officer')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    LAO (Pune)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('tehsildar_haveli')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    Tehsildar (Haveli)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('talathi_haveli')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    Talathi (Haveli)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('nhai_agency')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-[#991B1B] border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-[#991B1B]" />
                    PIA (NHAI)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('state_admin')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    State Admin (MH)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('central_admin')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-900 border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    Central Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Auth Form Card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-9 flex flex-col justify-between">
                <div>
                  {/* TWO-LOGIN Segmented Tab Switcher */}
                  <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveType('pia')
                        setEmailOrUsername('officer.nhai@nlams.gov.demo')
                        setErrorMessage(null)
                        setOtpSent(false)
                      }}
                      className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        activeType === 'pia'
                          ? 'bg-[#991B1B] text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      PIA Agency Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveType('department')
                        setEmailOrUsername('collector.pune@nlams.gov.demo')
                        setErrorMessage(null)
                        setOtpSent(false)
                      }}
                      className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        activeType === 'department'
                          ? 'bg-[#042A5E] text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Department Official Login
                    </button>
                  </div>

                  {/* Header Badge & Title */}
                  <div className="flex flex-col items-center mb-5 text-center">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md text-white mb-2.5 transition-colors ${
                      activeType === 'pia' ? 'bg-[#991B1B]' : 'bg-[#042A5E]'
                    }`}>
                      {activeType === 'pia' ? <Building2 className="h-7 w-7" /> : <Building className="h-7 w-7" />}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {activeType === 'pia' ? 'PIA Agency Portal Sign In' : 'Department Official Log In'}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs">
                      {activeType === 'pia'
                        ? 'For NHAI, MMRDA, CIDCO & Maharashtra PWD project authorities'
                        : 'For Collectors, LAOs, Tehsildars, Talathis & Revenue Administrators'}
                    </p>
                  </div>

                  {/* Authentication Mode Switcher (Email OTP vs Password) */}
                  <div className="mb-4 flex items-center justify-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAuthMode('otp')}
                      className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${
                        authMode === 'otp'
                          ? 'bg-white text-navy shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Government Email OTP (2FA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('password')}
                      className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${
                        authMode === 'password'
                          ? 'bg-white text-navy shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Password + Direct SSO
                    </button>
                  </div>

                  {/* Feedback Alerts */}
                  {errorMessage && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-200 shadow-xs">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Official Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {activeType === 'pia' ? 'PIA Official Email Address' : 'Government Official Email (*.gov.demo)'}
                      </label>
                      <div className="relative rounded-lg shadow-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          value={emailOrUsername}
                          onChange={(e) => setEmailOrUsername(e.target.value)}
                          placeholder="e.g. collector.pune@nlams.gov.demo"
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                          required
                        />
                      </div>
                    </div>

                    {/* OTP Mode Fields */}
                    {authMode === 'otp' ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            6-Digit Security OTP
                          </label>
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={isSendingOtp || otpCooldown > 0}
                            className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                          >
                            {isSendingOtp ? (
                              <span>Dispatching...</span>
                            ) : otpCooldown > 0 ? (
                              <span className="flex items-center gap-1 text-amber-700">
                                <Timer className="h-3 w-3" /> Resend in {otpCooldown}s
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Send className="h-3 w-3" /> {otpSent ? 'Resend OTP' : 'Send Email OTP'}
                              </span>
                            )}
                          </button>
                        </div>
                        <div className="relative rounded-lg shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <KeyRound className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit OTP (e.g. 123456)"
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                            required
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {otpSent ? 'OTP sent via Ethereal / Local Mailer. Check server console if testing locally.' : 'Click "Send Email OTP" to receive a verification code.'}
                        </p>
                      </div>
                    ) : (
                      /* Password Mode Fields */
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password
                        </label>
                        <div className="relative rounded-lg shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Captcha Section */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Security Text (Captcha)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative select-none rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-center text-lg font-extrabold tracking-widest text-slate-900 shadow-inner font-mono overflow-hidden flex items-center justify-center min-w-[110px] h-[40px]">
                          <span className="relative z-10 italic transform -rotate-1 font-black text-slate-900">
                            {captchaText}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-navy transition-colors focus:outline-hidden"
                          title="Refresh Captcha"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>

                        <input
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Enter captcha"
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Sign In CTA Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full rounded-lg py-3 text-sm font-bold text-white shadow-md transition-all focus:outline-hidden disabled:opacity-50 cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                        activeType === 'pia'
                          ? 'bg-[#991B1B] hover:bg-[#7F1D1D]'
                          : 'bg-[#042A5E] hover:bg-[#021838]'
                      }`}
                    >
                      <span>{isLoading ? 'Verifying Identity...' : activeType === 'pia' ? 'Sign In as PIA Agency' : 'Sign In as Department Official'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Footer Help Links */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-semibold text-slate-600">
                  <a href="#" className="flex items-center gap-1.5 hover:text-navy transition-colors">
                    <BookOpen className="h-3.5 w-3.5 text-navy" />
                    <span>User Manual &amp; FAQs</span>
                  </a>
                  <a href="#" className="flex items-center gap-1.5 hover:text-navy transition-colors">
                    <HelpCircle className="h-3.5 w-3.5 text-navy" />
                    <span>Helpdesk Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
