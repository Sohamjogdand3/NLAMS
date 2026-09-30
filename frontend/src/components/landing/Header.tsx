import { useState } from 'react'
import { Menu, X, ChevronDown, Play, Pause, ChevronLeft, ChevronRight, LogIn } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard/citizen', label: 'Citizen Portal' },
  { href: '/gis-mapping', label: 'NAKSHA GIS' },
  { href: '#ministry', label: 'Ministry', hasDropdown: true },
  { href: '#schemes', label: 'Schemes', hasDropdown: true },
  { href: '#acts', label: 'Acts & Policies' },
  { href: '#workflow', label: 'How it Works' },
  { href: '#roles', label: 'Role Workspaces' },
  { href: '#about', label: 'About DHARAA' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  return (
    <header className="w-full bg-surface shadow-sm sticky top-0 z-40">
      {/* Main Navigation Bar */}
      <div className="border-b border-slate-200 bg-surface/98 backdrop-blur shadow-xs">
        <div className="mx-auto flex max-w-[1700px] w-full items-center justify-between px-4 sm:px-8 lg:px-12 py-2.5">
          {/* DHARAA Logo & Brand */}
          <a href="/" className="flex items-center gap-2 mr-6 shrink-0">
            <span className="inline-flex items-center rounded bg-navy px-2 py-1 text-xs font-black uppercase text-white tracking-widest shadow-xs">
              DHARAA
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 hidden sm:inline tracking-tight">
              National Land Acquisition & Management System
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:gap-2 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs lg:text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-navy transition-colors"
              >
                <span>{link.label}</span>
                {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
              </a>
            ))}
          </nav>

          {/* Login Dropdown & Register CTA */}
          <div className="hidden md:flex items-center gap-3 relative">
              {/* Orange Login Button with Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLoginDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#E05E00] focus:outline-hidden cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {loginDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/10 z-50 border border-slate-100"
                    onMouseLeave={() => setLoginDropdownOpen(false)}
                  >
                    <a
                      href="/login?type=pia"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-navy transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#991B1B]" />
                      PIA Agency Login (NHAI)
                    </a>
                    <a
                      href="/login?type=department"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-navy transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#042A5E]" />
                      Department / Official Login
                    </a>
                    <div className="border-t border-slate-100 my-1" />
                    <a
                      href="#citizen-token-tracker"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50/60 hover:bg-amber-100 transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#FF6B00]" />
                      Citizen Token Desk (No Login)
                    </a>
                  </div>
                )}
              </div>

              {/* Citizen Token Quick Action Button */}
              <a
                href="/dashboard/citizen"
                className="inline-flex items-center gap-2 rounded-md bg-[#042A5E] px-4 py-2 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#021838] focus:outline-hidden"
              >
                <span>Citizen Portal</span>
              </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center justify-between w-full md:w-auto">
            <span className="text-xs font-bold text-navy md:hidden">Menu Navigation</span>
            <button
              className="rounded-md p-1.5 text-navy hover:bg-slate-100 focus:outline-hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="border-t border-border bg-surface px-4 py-3 lg:hidden shadow-lg">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-navy"
                >
                  <span>{link.label}</span>
                  {link.hasDropdown && <ChevronDown className="h-4 w-4 text-slate-400" />}
                </a>
              ))}
              <a
                href="/login?type=citizen"
                className="mt-3 flex items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-bold text-white shadow-xs"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to DHARAA Portal</span>
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* 3. Latest News Ticker Strip (Dark Navy Bar from Reference Image) */}
      <div className="bg-navy text-white text-xs border-b border-navy-dark overflow-hidden">
        <div className="mx-auto flex max-w-[1700px] w-full items-center justify-between px-4 sm:px-8 lg:px-12 py-1.5">
          <div className="flex items-center gap-3 overflow-hidden w-full">
            {/* LATEST NEWS Badge */}
            <div className="bg-blue px-2.5 py-1 text-[11px] font-black tracking-wider uppercase shrink-0 rounded-xs shadow-xs flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-ping" />
              LATEST NEWS
            </div>

            {/* Ticker Content */}
            <div className="truncate text-[11px] sm:text-xs font-medium text-slate-100 flex items-center gap-2">
              <span className="truncate">
                Summary of the Feedback / Comments received from the States / public / stakeholders on THE DRAFT REGISTRATION BILL &amp; LAND ACQUISITION GUIDELINES, 2025
              </span>
              <span className="shrink-0 rounded-xs bg-danger px-1.5 py-0.5 text-[9px] font-bold text-white uppercase animate-pulse">
                New
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 pl-4 text-slate-300">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 hover:text-white transition-colors"
              title={isPaused ? "Play ticker" : "Pause ticker"}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
            <button className="p-1 hover:text-white transition-colors" title="Previous news">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 hover:text-white transition-colors" title="Next news">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
