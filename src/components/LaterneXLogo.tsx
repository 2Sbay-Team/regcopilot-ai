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
      <defs>
        {/* Modern gradient - blue to purple */}
        <linearGradient id="modernGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(220, 90%, 56%)" />
          <stop offset="100%" stopColor="hsl(260, 90%, 60%)" />
        </linearGradient>
        
        {/* Subtle glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Circular background with gradient */}
      <circle cx="60" cy="60" r="54" fill="url(#modernGrad)" opacity="0.08"/>
      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#modernGrad)" strokeWidth="2" opacity="0.2"/>
      
      {/* Modern "L" lettermark - bold and geometric */}
      <path
        d="M 38 32 L 50 32 L 50 78 L 78 78 L 78 88 L 38 88 Z"
        fill="url(#modernGrad)"
        filter="url(#glow)"
      />
      
      {/* Abstract data flow nodes */}
      <circle cx="72" cy="40" r="4" fill="hsl(220, 90%, 56%)" opacity="0.7"/>
      <circle cx="82" cy="52" r="4" fill="hsl(240, 90%, 58%)" opacity="0.7"/>
      <circle cx="82" cy="68" r="4" fill="hsl(260, 90%, 60%)" opacity="0.7"/>
      
      {/* Connection lines representing data ingestion */}
      <line x1="50" y1="42" x2="72" y2="40" stroke="hsl(220, 90%, 56%)" strokeWidth="1.5" opacity="0.3"/>
      <line x1="50" y1="58" x2="82" y2="52" stroke="hsl(240, 90%, 58%)" strokeWidth="1.5" opacity="0.3"/>
      <line x1="50" y1="74" x2="82" y2="68" stroke="hsl(260, 90%, 60%)" strokeWidth="1.5" opacity="0.3"/>
    </svg>
  )
}
