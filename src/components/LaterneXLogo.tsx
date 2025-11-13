import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Professional, modern LaterneX logo
export function LaterneXLogo({ className, size = 40 }: LaterneXLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LaterneX logo"
    >
      <title>LaterneX — AI Ethics ESG Mark</title>
      
      {/* Minimal, professional mark using currentColor for theming */}
      {/* AI — Hexagonal neural motif */}
      <g>
        <path
          d="M 60 20 L 80 32 L 80 56 L 60 68 L 40 56 L 40 32 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Nodes */}
        <circle cx="50" cy="38" r="3" fill="currentColor" opacity="0.85"/>
        <circle cx="70" cy="38" r="3" fill="currentColor" opacity="0.7"/>
        <circle cx="60" cy="28" r="3" fill="currentColor" opacity="0.6"/>
        {/* Connections */}
        <line x1="60" y1="28" x2="50" y2="38" stroke="currentColor" strokeWidth="1.8" opacity="0.55"/>
        <line x1="60" y1="28" x2="70" y2="38" stroke="currentColor" strokeWidth="1.8" opacity="0.55"/>
        <line x1="50" y1="38" x2="60" y2="48" stroke="currentColor" strokeWidth="1.8" opacity="0.55"/>
        <line x1="70" y1="38" x2="60" y2="48" stroke="currentColor" strokeWidth="1.8" opacity="0.55"/>
      </g>

      {/* Ethics — Balanced scales */}
      <g transform="translate(0, 8)">
        <line x1="45" y1="56" x2="75" y2="56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="60" cy="56" r="2.8" fill="currentColor"/>
        {/* Pans */}
        <path d="M 45 56 L 41.5 60 L 48.5 60 Z" fill="currentColor" opacity="0.8"/>
        <path d="M 75 56 L 71.5 60 L 78.5 60 Z" fill="currentColor" opacity="0.8"/>
        {/* Pillar */}
        <line x1="60" y1="56" x2="60" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        {/* Base */}
        <line x1="56" y1="72" x2="64" y2="72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </g>

      {/* ESG — Leaf (stroke only, no fill) */}
      <g>
        <path
          d="M 60 82 C 54 86, 52 92, 54 96 C 56 100, 64 100, 66 96 C 68 92, 66 86, 60 82 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 60 82 L 60 97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
