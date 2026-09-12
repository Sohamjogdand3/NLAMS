import { useState } from 'react'
import { Menu, X, ChevronDown, Play, Pause, ChevronLeft, ChevronRight, LogIn } from 'lucide-react'
import EmblemIndia from './EmblemIndia'
import SwachhBharatLogo from './SwachhBharatLogo'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#ministry', label: 'Ministry', hasDropdown: true },
  { href: '#schemes', label: 'Schemes', hasDropdown: true },
  { href: '#acts', label: 'Acts & Policies' },
  { href: '#naksha', label: 'NAKSHA GIS', hasDropdown: true },
  { href: '#workflow', label: 'How it Works' },
  { href: '#roles', label: 'Role Workspaces' },
  { href: '#about', label: 'About NLAMS' },
  { href: '#rti', label: 'RTI' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  return (
    <header className="w-full bg-surface shadow-sm">
      {/* 1. Official Government Header Branding Banner (As in Reference Image) */}
      <div className="border-b border-border bg-white py-3">
        <div className="mx-auto flex max-w-[1700px] w-full items-center justify-between px-4 sm:px-8 lg:px-12">
          {/* Left Brand: State Emblem of India + Department Details */}
          <a href="/" className="flex items-center gap-3 sm:gap-4 group">
            <div className="shrink-0 transition-transform group-hover:scale-105">
              <EmblemIndia height={68} className="h-14 sm:h-16 w-auto" />
            </div>
            <div className="h-12 w-px bg-slate-300 hidden xs:block" />
            <div className="flex flex-col">
              {/* Hindi Department Name */}
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide font-serif">
                भूमि संसाधन विभाग
              </span>
              {/* English Department Name */}
              <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight leading-none uppercase font-sans">
                DEPARTMENT OF LAND RESOURCES
              </h1>
              {/* Ministry Subtitle */}
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-wider uppercase mt-0.5">
                MINISTRY OF RURAL DEVELOPMENT
              </span>
              
              {/* System Name Badge */}
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-sm bg-navy px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white tracking-widest shadow-xs">
                  NLAMS
                </span>
                <span className="text-[11px] font-bold text-navy hidden sm:inline">
                  National Land Acquisition & Management System
                </span>
              </div>
            </div>
          </a>

          {/* Right Brand: Swachh Bharat Abhiyan Logo (As in Reference Image) */}
          <div className="hidden md:flex items-center gap-4">
            <SwachhBharatLogo height={58} className="h-14 w-auto drop-shadow-xs" />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Sticky Bar) */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-surface/98 backdrop-blur shadow-xs">
        <div className="mx-auto flex max-w-[1700px] w-full items-center justify-between px-4 sm:px-8 lg:px-12 py-2">
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
                      href="/login?type=citizen"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-navy transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-saffron" />
                      Citizen Login
                    </a>
                    <a
                      href="/login?type=department"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-navy transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-navy" />
                      Department / Institute Login
                    </a>
                  </div>
                )}
              </div>

              {/* Blue Register Button */}
              <a
                href="/login?type=citizen&mode=register"
                className="inline-flex items-center gap-2 rounded-md bg-[#042A5E] px-4 py-2 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#021838] focus:outline-hidden"
              >
                <span>Register</span>
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
                <span>Sign In to NLAMS Portal</span>
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
