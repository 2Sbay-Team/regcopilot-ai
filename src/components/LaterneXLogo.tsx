import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Professional enterprise logo for LaterneX compliance platform
// Clean, minimal, versatile mark suitable for SaaS/enterprise context
export function LaterneXLogo({ className, size = 40 }: LaterneXLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      role="img"
      aria-label="LaterneX"
    >
      <title>LaterneX</title>
      {/* Professional geometric mark: overlapping squares representing compliance layers */}
      <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
        {/* Outer compliance frame */}
        <rect 
          x="40" 
          y="40" 
          width="120" 
          height="120" 
          stroke="hsl(222, 47%, 11%)" 
          strokeWidth="8"
          rx="4"
        />
        
        {/* Inner data layer */}
        <rect 
          x="60" 
          y="60" 
          width="80" 
          height="80" 
          stroke="hsl(217, 91%, 60%)" 
          strokeWidth="6"
          rx="3"
        />
        
        {/* Central integrity mark */}
        <path 
          d="M 100 85 L 115 100 L 100 115" 
          stroke="hsl(217, 91%, 60%)" 
          strokeWidth="6"
          fill="none"
        />
        <path 
          d="M 85 100 L 115 100" 
          stroke="hsl(217, 91%, 60%)" 
          strokeWidth="6"
        />
      </g>
    </svg>
  )
}
