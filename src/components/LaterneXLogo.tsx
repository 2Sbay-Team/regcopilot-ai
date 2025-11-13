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
        {/* Professional gradient - Deep blue to forest green */}
        <linearGradient id="professionalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 100%, 40%)" />
          <stop offset="50%" stopColor="hsl(190, 85%, 35%)" />
          <stop offset="100%" stopColor="hsl(150, 60%, 35%)" />
        </linearGradient>
        
        {/* Accent gradient */}
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 100%, 45%)" />
          <stop offset="100%" stopColor="hsl(150, 60%, 40%)" />
        </linearGradient>
      </defs>
      
      {/* AI Symbol - Hexagonal Neural Network */}
      <g>
        {/* Hexagon frame */}
        <path 
          d="M 60 20 L 80 32 L 80 56 L 60 68 L 40 56 L 40 32 Z" 
          fill="none" 
          stroke="url(#professionalGrad)" 
          strokeWidth="3"
          strokeLinejoin="miter"
        />
        
        {/* Neural nodes */}
        <circle cx="50" cy="38" r="3.5" fill="hsl(210, 100%, 40%)"/>
        <circle cx="70" cy="38" r="3.5" fill="hsl(190, 85%, 35%)"/>
        <circle cx="60" cy="28" r="3.5" fill="hsl(180, 90%, 38%)"/>
        <circle cx="60" cy="48" r="4" fill="url(#accentGrad)"/>
        
        {/* Neural connections */}
        <line x1="60" y1="28" x2="50" y2="38" stroke="hsl(210, 100%, 40%)" strokeWidth="2"/>
        <line x1="60" y1="28" x2="70" y2="38" stroke="hsl(190, 85%, 35%)" strokeWidth="2"/>
        <line x1="50" y1="38" x2="60" y2="48" stroke="hsl(210, 100%, 40%)" strokeWidth="2"/>
        <line x1="70" y1="38" x2="60" y2="48" stroke="hsl(190, 85%, 35%)" strokeWidth="2"/>
      </g>
      
      {/* Ethics Symbol - Balanced Scales */}
      <g transform="translate(0, 8)">
        {/* Scale base */}
        <rect x="57" y="72" width="6" height="3" rx="1" fill="hsl(210, 100%, 40%)"/>
        
        {/* Center pillar */}
        <rect x="58.5" y="58" width="3" height="14" rx="1.5" fill="url(#professionalGrad)"/>
        
        {/* Balance beam */}
        <rect x="42" y="56" width="36" height="3" rx="1.5" fill="url(#accentGrad)"/>
        
        {/* Left scale pan */}
        <path 
          d="M 45 56 L 42 60 L 48 60 Z" 
          fill="hsl(210, 100%, 40%)"
        />
        <line x1="42" y1="60" x2="48" y2="60" stroke="hsl(210, 100%, 35%)" strokeWidth="1.5"/>
        
        {/* Right scale pan */}
        <path 
          d="M 75 56 L 72 60 L 78 60 Z" 
          fill="hsl(150, 60%, 35%)"
        />
        <line x1="72" y1="60" x2="78" y2="60" stroke="hsl(150, 60%, 30%)" strokeWidth="1.5"/>
        
        {/* Center pivot */}
        <circle cx="60" cy="57.5" r="2.5" fill="hsl(190, 85%, 35%)"/>
      </g>
      
      {/* ESG Symbol - Leaf with Data Points */}
      <g>
        {/* Main leaf */}
        <path 
          d="M 60 82 Q 52 88, 53 96 Q 55.5 100, 60 97.5 Q 64.5 100, 67 96 Q 68 88, 60 82 Z" 
          fill="hsl(150, 60%, 35%)"
        />
        
        {/* Leaf detail/vein */}
        <path 
          d="M 60 82 L 60 97" 
          stroke="hsl(150, 70%, 25%)" 
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Data points on leaf */}
        <circle cx="56" cy="88" r="1.5" fill="hsl(150, 70%, 55%)"/>
        <circle cx="64" cy="88" r="1.5" fill="hsl(150, 70%, 55%)"/>
        <circle cx="60" cy="92" r="1.5" fill="hsl(150, 70%, 55%)"/>
      </g>
      
      {/* Connecting elements - minimal */}
      <g opacity="0.3">
        {/* Data flow lines */}
        <line x1="60" y1="68" x2="60" y2="82" stroke="url(#professionalGrad)" strokeWidth="1" strokeDasharray="2,2"/>
      </g>
    </svg>
  )
}
