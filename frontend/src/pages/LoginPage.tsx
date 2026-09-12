import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  BookOpen,
  KeyRound,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileCheck2,
  MapPin,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import UtilityBar from '../components/landing/UtilityBar'
import Header from '../components/landing/Header'
import Footer from '../components/landing/Footer'
import { useAuth } from '../auth/AuthContext'
import { type UserType, MOCK_ACCOUNTS } from '../types/auth'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, user } = useAuth()

  // Get active login type from URL search param
  const initialType: UserType = searchParams.get('type') === 'department' ? 'department' : 'citizen'
  const [activeType, setActiveType] = useState<UserType>(initialType)

  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate random 5-character captcha text
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

  // Sync state if URL query param changes
  useEffect(() => {
    const typeFromUrl = searchParams.get('type')
    if (typeFromUrl === 'department' || typeFromUrl === 'citizen') {
      setActiveType(typeFromUrl)
    }
  }, [searchParams])

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!username.trim()) {
      setErrorMessage('Please enter your User Name or Employee ID')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your Password')
      return
    }

    if (captchaInput.trim().toLowerCase() !== captchaText.toLowerCase()) {
      setErrorMessage('Security captcha text does not match. Please try again.')
      generateCaptcha()
      return
    }

    setIsLoading(true)

    // Perform mock login
    setTimeout(() => {
      login(username.trim(), activeType)
      setIsLoading(false)
      setSuccessMessage(`Successfully authenticated as ${username}!`)

      // Redirect to citizen or department dashboard
      setTimeout(() => {
        if (activeType === 'citizen') {
          navigate('/dashboard/citizen')
        } else {
          navigate('/dashboard/central')
        }
      }, 800)
    }, 600)
  }

  // Quick fill helper for testing
  const handleQuickFill = (accountKey: string) => {
    const acc = MOCK_ACCOUNTS[accountKey]
    if (acc) {
      setUsername(acc.username)
      setPassword('password123')
      setActiveType(acc.role === 'citizen' ? 'citizen' : 'department')
      setCaptchaInput(captchaText)
      setErrorMessage(null)
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
                {activeType === 'citizen' ? 'Citizen Single Sign-On Portal' : 'Departmental Official Portal'}
              </span>
            </div>

            {user && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Active Session: <strong>{user.name}</strong> ({user.role.toUpperCase()})</span>
              </div>
            )}
          </div>

          {/* Hero Image Banner */}
          <div className="mb-8 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/60">
            <img
              src="/land-acquisition-hero.jpg"
              alt="Aerial view of land acquisition with GIS parcel overlay, survey numbers, project alignment corridor"
              className="w-full h-48 sm:h-56 lg:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#042A5E]/80 via-[#042A5E]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                Land Acquisition Information &amp; Citizen Services
              </h2>
              <p className="mt-1.5 text-sm text-white/80 max-w-xl">
                Access information, procedures, notices, rights and services related to land acquisition.
              </p>
            </div>
          </div>

          {/* 2-Column Responsive Layout (Full Screen Span) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Modern Security & Access Features Card */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 p-6 sm:p-10 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-navy border border-blue-100 mb-4">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Secure Government Single Sign-On (SSO)</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#042A5E] tracking-tight font-sans">
                  Instructions &amp; Access Guidelines
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Welcome to the National Land Acquisition &amp; Management System (NLAMS). Please review the instructions below before logging in.
                </p>

                {/* Instruction Cards */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs">
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Enter Registered Credentials</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {activeType === 'citizen'
                          ? 'Provide your registered Citizen User ID, Aadhaar-linked Mobile No, or Email ID.'
                          : 'Use your Official Government Department User ID or Employee Code.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs">
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Verify Password</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Enter your confidential portal password. Click the eye icon to verify spelling.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs">
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-[#042A5E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Security Captcha Check</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Type the exact security captcha code shown in the image box to complete authentication.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key System Features Highlights */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Digitally Signed Land Records</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>GIS Geo-Referenced Cadastral Parcels</span>
                  </div>
                </div>
              </div>

              {/* Quick Demo Credentials Panel for testing convenience */}
              <div className="mt-8 rounded-xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border border-amber-200/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <KeyRound className="h-4 w-4 text-amber-600" />
                    <span>Quick Demo Account Selector</span>
                  </div>
                  <span className="text-[11px] font-medium text-amber-700">One-click auto fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('citizen123')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-300 shadow-xs hover:bg-amber-100 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-amber-700" />
                    Citizen (Landowner)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('lao_officer')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-900 border border-blue-300 shadow-xs hover:bg-blue-50 transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-blue-700" />
                    LAO Officer
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('surveyor_01')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 shadow-xs hover:bg-slate-100 transition-colors"
                  >
                    Field Surveyor
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('collector_district')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-900 border border-indigo-300 shadow-xs hover:bg-indigo-50 transition-colors"
                  >
                    Collector
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Modern Floating Auth Form Card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  {/* Styled Segmented Tab Switcher */}
                  <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveType('citizen')
                        setErrorMessage(null)
                      }}
                      className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        activeType === 'citizen'
                          ? 'bg-[#FF6B00] text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Citizen Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveType('department')
                        setErrorMessage(null)
                      }}
                      className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        activeType === 'department'
                          ? 'bg-[#042A5E] text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Department / Institute Login
                    </button>
                  </div>

                  {/* Top Circular Icon & Badge */}
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center shadow-md text-white mb-3 transition-colors ${
                      activeType === 'citizen' ? 'bg-[#FF6B00]' : 'bg-[#042A5E]'
                    }`}>
                      <User className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 font-sans">
                      {activeType === 'citizen' ? 'Citizen Portal Sign In' : 'Department Official Log In'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 max-w-xs">
                      {activeType === 'citizen'
                        ? 'Track compensation claims, view notices, and submit objections'
                        : 'Access official GIS survey tools, LAO decision workflows, & approval desks'}
                    </p>
                  </div>

                  {/* Error & Success Feedback Alerts */}
                  {errorMessage && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-800 border border-red-200 shadow-xs">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Name / Employee ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {activeType === 'citizen' ? 'User Name / Mobile No' : 'User Name / Employee ID'}
                      </label>
                      <div className="relative rounded-lg shadow-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={activeType === 'citizen' ? 'Enter registered username or mobile' : 'Enter official user ID or employee ID'}
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative rounded-lg shadow-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded-sm border-slate-300 text-navy focus:ring-navy cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          Remember Me
                        </label>
                      </div>

                      <a href="#" className="text-xs font-bold text-navy hover:underline">
                        Forgot Password?
                      </a>
                    </div>

                    {/* Security Captcha Section */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Security Text (Captcha)
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Stylized Captcha Canvas Box */}
                        <div className="relative select-none rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-center text-xl font-extrabold tracking-widest text-slate-900 shadow-inner font-mono overflow-hidden flex items-center justify-center min-w-[130px] h-[44px]">
                          {/* Noise pattern SVG overlay */}
                          <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <line x1="0" y1="5" x2="130" y2="40" stroke="#000" strokeWidth="2" />
                              <line x1="0" y1="40" x2="130" y2="10" stroke="#000" strokeWidth="1.5" />
                              <circle cx="30" cy="15" r="8" stroke="#000" strokeWidth="1" fill="none" />
                            </svg>
                          </div>
                          <span className="relative z-10 italic transform -rotate-1 tracking-widest font-black text-slate-900">
                            {captchaText}
                          </span>
                        </div>

                        {/* Refresh Captcha Button */}
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="p-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-navy transition-colors focus:outline-hidden"
                          title="Refresh Captcha"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>

                        {/* Captcha Input */}
                        <input
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Enter captcha"
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50/60 py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Sign In CTA Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full rounded-lg py-3.5 text-sm font-bold text-white shadow-md transition-all focus:outline-hidden disabled:opacity-50 cursor-pointer mt-3 flex items-center justify-center gap-2 ${
                        activeType === 'citizen'
                          ? 'bg-[#FF6B00] hover:bg-[#E05E00]'
                          : 'bg-[#042A5E] hover:bg-[#021838]'
                      }`}
                    >
                      <span>{isLoading ? 'Authenticating Credentials...' : 'Sign In to Account'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Footer Help Links */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
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
