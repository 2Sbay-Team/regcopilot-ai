import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Vector LaterneX mark: Azure gradient circle with refined "L" glyph
export function LaterneXLogo({ className, size = 40 }: LaterneXLogoProps) {
  const uniqueId = `lx-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size }} aria-label="LaterneX logo">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-labelledby={`${uniqueId}-title`}
      >
        <title id={`${uniqueId}-title`}>LaterneX</title>
        <defs>
          {/* Azure blue gradient - from light cyan to deep blue */}
          <linearGradient id={`${uniqueId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="50%" stopColor="#0078d4" />
            <stop offset="100%" stopColor="#0052a3" />
          </linearGradient>
          
          {/* Glossy shine effect */}
          <radialGradient id={`${uniqueId}-shine`} cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          
          {/* Professional drop shadow */}
          <filter id={`${uniqueId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main circle with Azure gradient */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill={`url(#${uniqueId}-gradient)`} 
          filter={`url(#${uniqueId}-shadow)`} 
        />
        
        {/* Glossy highlight overlay */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill={`url(#${uniqueId}-shine)`} 
        />
        
        {/* Inner subtle ring for depth */}
        <circle 
          cx="50" 
          cy="50" 
          r="42" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="1" 
          opacity="0.15" 
        />

        {/* Bold, refined "L" lettermark in white */}
        <path
          d="M32 28 L32 72 L68 72"
          fill="none"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        
        {/* Accent line for tech feel */}
        <line
          x1="68"
          y1="72"
          x2="72"
          y2="72"
          stroke="#00d4ff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}
