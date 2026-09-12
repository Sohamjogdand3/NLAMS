interface SwachhBharatLogoProps {
  className?: string
  height?: number
}

export default function SwachhBharatLogo({ className = "h-14 w-auto", height = 56 }: SwachhBharatLogoProps) {
  return (
    <svg
      viewBox="0 0 240 140"
      height={height}
      className={className}
      aria-label="Swachh Bharat Logo - Ek Kadam Swachhata Ki Ore"
      role="img"
    >
      {/* Tricolor Arc Swoosh above the glasses */}
      <g>
        {/* Saffron Arc */}
        <path
          d="M 20 50 C 70 12, 170 12, 220 50 C 190 32, 110 24, 20 50 Z"
          fill="#FF9933"
        />
        {/* White Arc Divider / Band */}
        <path
          d="M 22 53 C 72 17, 168 17, 218 53 C 188 36, 108 28, 22 53 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="0.5"
        />
        {/* Green Arc */}
        <path
          d="M 24 56 C 74 22, 166 22, 216 56 C 186 40, 106 32, 24 56 Z"
          fill="#138808"
        />
      </g>

      {/* Gandhi Spectacles Frame */}
      <g stroke="#1E293B" strokeWidth="4" fill="none">
        {/* Left Lens Frame */}
        <circle cx="75" cy="75" r="28" fill="#FFFFFF" />
        {/* Right Lens Frame */}
        <circle cx="165" cy="75" r="28" fill="#FFFFFF" />
        {/* Nose Bridge */}
        <path d="M 103 72 C 112 65, 128 65, 137 72" strokeWidth="4.5" />
        {/* Left Temple Arm */}
        <path d="M 47 70 C 35 68, 25 60, 15 50" strokeWidth="3" />
        {/* Right Temple Arm */}
        <path d="M 193 70 C 205 68, 215 60, 225 50" strokeWidth="3" />
      </g>

      {/* Lens Text */}
      <g fontFamily="'Tiro Devanagari Hindi', 'Noto Sans Devanagari', 'Mangal', 'Devanagari', sans-serif" fontWeight="bold">
        {/* Left Lens: स्वच्छ */}
        <text
          x="75"
          y="82"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="18"
          letterSpacing="0.5"
        >
          स्वच्छ
        </text>

        {/* Right Lens: भारत */}
        <text
          x="165"
          y="82"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="18"
          letterSpacing="0.5"
        >
          भारत
        </text>
      </g>

      {/* Tagline Below: एक कदम स्वच्छता की ओर */}
      <g transform="translate(120, 126)">
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill="#1E293B"
          fontSize="12"
          fontWeight="700"
          fontFamily="'Tiro Devanagari Hindi', 'Noto Sans Devanagari', 'Mangal', 'Devanagari', sans-serif"
          letterSpacing="0.5"
        >
          एक कदम स्वच्छता की ओर
        </text>
      </g>
    </svg>
  )
}
