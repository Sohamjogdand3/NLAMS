interface EmblemIndiaProps {
  className?: string
  height?: number
}

export default function EmblemIndia({ className = "h-16 w-auto", height = 64 }: EmblemIndiaProps) {
  return (
    <img
      src="/emblem-india.jpg"
      alt="State Emblem of India - Ashoka Lion Capital"
      style={{ height: `${height}px`, width: 'auto' }}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  )
}
