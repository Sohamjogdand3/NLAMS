import { Link } from 'react-router-dom';

export default function UtilityBar() {
  return (
    <div className="bg-navy-dark text-white/80 text-xs border-b border-navy/40">
      <div className="mx-auto flex max-w-[1700px] w-full items-center justify-between px-4 sm:px-8 lg:px-12 py-1.5">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block h-2 w-2 rounded-full bg-saffron animate-pulse" />
          <span>भारत सरकार | GOVERNMENT OF INDIA</span>
          <span aria-hidden className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:inline text-white/90">भूमि संसाधन विभाग (DoLR) · ग्रामीण विकास मंत्रालय</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] sm:text-xs">

          <button className="hover:text-white transition-colors underline decoration-dotted">Skip to main content</button>
          <span aria-hidden className="text-white/30">|</span>
          <div className="flex items-center gap-1.5 font-semibold">
            <button title="Decrease text size" className="hover:text-white transition-colors px-1">A-</button>
            <button title="Normal text size" className="hover:text-white transition-colors px-1 text-white">A</button>
            <button title="Increase text size" className="hover:text-white transition-colors px-1">A+</button>
          </div>
          <span aria-hidden className="text-white/30">|</span>
          <button className="hover:text-saffron transition-colors font-semibold text-white">हिंदी</button>
        </div>
      </div>
    </div>
  )
}

