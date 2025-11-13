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
        {/* Professional gradient - Azure blue to teal */}
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(214, 100%, 58%)" />
          <stop offset="50%" stopColor="hsl(197, 100%, 55%)" />
          <stop offset="100%" stopColor="hsl(180, 100%, 45%)" />
        </linearGradient>
        
        {/* Glow effect for premium look */}
        <filter id="professionalGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Radial gradient for depth */}
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="hsl(180, 100%, 60%)" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="hsl(214, 100%, 58%)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      
      {/* Outer circle with gradient border */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="url(#brandGrad)" strokeWidth="3" opacity="0.15"/>
      <circle cx="60" cy="60" r="48" fill="none" stroke="url(#brandGrad)" strokeWidth="2" opacity="0.3"/>
      
      {/* Central glow effect */}
      <circle cx="60" cy="60" r="35" fill="url(#centerGlow)" opacity="0.2"/>
      
      {/* AI Neural Network Symbol (top) */}
      <g opacity="0.9" filter="url(#professionalGlow)">
        {/* Neural nodes */}
        <circle cx="45" cy="35" r="3" fill="hsl(214, 100%, 58%)"/>
        <circle cx="60" cy="30" r="3" fill="hsl(197, 100%, 55%)"/>
        <circle cx="75" cy="35" r="3" fill="hsl(180, 100%, 45%)"/>
        
        {/* Neural connections */}
        <line x1="45" y1="35" x2="60" y2="30" stroke="url(#brandGrad)" strokeWidth="1.5" opacity="0.6"/>
        <line x1="60" y1="30" x2="75" y2="35" stroke="url(#brandGrad)" strokeWidth="1.5" opacity="0.6"/>
        <line x1="45" y1="35" x2="60" y2="50" stroke="url(#brandGrad)" strokeWidth="1.5" opacity="0.6"/>
        <line x1="75" y1="35" x2="60" y2="50" stroke="url(#brandGrad)" strokeWidth="1.5" opacity="0.6"/>
      </g>
      
      {/* Ethics Balance/Scale Symbol (center) - representing fairness */}
      <g filter="url(#professionalGlow)">
        {/* Scale beam */}
        <line x1="45" y1="55" x2="75" y2="55" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Center pivot */}
        <circle cx="60" cy="55" r="4" fill="url(#brandGrad)"/>
        {/* Left pan */}
        <path d="M 42 55 L 38 60 L 46 60 Z" fill="hsl(214, 100%, 58%)" opacity="0.8"/>
        {/* Right pan */}
        <path d="M 78 55 L 74 60 L 82 60 Z" fill="hsl(180, 100%, 45%)" opacity="0.8"/>
      </g>
      
      {/* ESG Leaf/Sustainability Symbol (bottom) */}
      <g filter="url(#professionalGlow)">
        {/* Leaf shape */}
        <path 
          d="M 60 65 Q 50 75, 52 85 Q 55 88, 60 85 Q 65 88, 68 85 Q 70 75, 60 65 Z" 
          fill="hsl(140, 65%, 45%)" 
          opacity="0.85"
        />
        {/* Leaf vein */}
        <path 
          d="M 60 65 Q 60 75, 60 85" 
          stroke="hsl(140, 70%, 35%)" 
          strokeWidth="1.5" 
          fill="none"
          opacity="0.6"
        />
        {/* Side veins */}
        <path d="M 60 72 Q 54 75, 52 78" stroke="hsl(140, 70%, 35%)" strokeWidth="1" fill="none" opacity="0.5"/>
        <path d="M 60 72 Q 66 75, 68 78" stroke="hsl(140, 70%, 35%)" strokeWidth="1" fill="none" opacity="0.5"/>
      </g>
      
      {/* Data flow orbits - representing ingestion */}
      <g opacity="0.25">
        <circle cx="60" cy="60" r="40" fill="none" stroke="url(#brandGrad)" strokeWidth="1" strokeDasharray="2,3"/>
        <circle cx="60" cy="60" r="32" fill="none" stroke="url(#brandGrad)" strokeWidth="1" strokeDasharray="2,3"/>
      </g>
      
      {/* Corner accent dots - data points */}
      <circle cx="85" cy="45" r="2" fill="hsl(214, 100%, 58%)" opacity="0.6"/>
      <circle cx="35" cy="75" r="2" fill="hsl(180, 100%, 45%)" opacity="0.6"/>
      <circle cx="85" cy="75" r="2" fill="hsl(197, 100%, 55%)" opacity="0.6"/>
    </svg>
  )
}
