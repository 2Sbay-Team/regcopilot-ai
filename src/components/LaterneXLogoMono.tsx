import { cn } from "@/lib/utils"

interface LaterneXLogoMonoProps {
  className?: string
  size?: number
  variant?: "light" | "dark" | "adaptive"
}

// Monochrome version - perfect for favicons, print, and any background
export function LaterneXLogoMono({ 
  className, 
  size = 40,
  variant = "adaptive" 
}: LaterneXLogoMonoProps) {
  // Color based on variant
  const strokeColor = variant === "light" ? "#ffffff" : variant === "dark" ? "#000000" : "currentColor"
  const fillColor = variant === "light" ? "#ffffff" : variant === "dark" ? "#000000" : "currentColor"
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(variant === "adaptive" && "text-foreground", className)}
      aria-label="LaterneX logo"
    >
      {/* Outer circle */}
      <circle 
        cx="60" 
        cy="60" 
        r="54" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="2.5" 
        opacity="0.2"
      />
      <circle 
        cx="60" 
        cy="60" 
        r="48" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="2" 
        opacity="0.15"
      />
      
      {/* AI Neural Network Symbol (top) */}
      <g opacity="0.9">
        {/* Neural nodes */}
        <circle cx="45" cy="35" r="3" fill={fillColor}/>
        <circle cx="60" cy="30" r="3" fill={fillColor}/>
        <circle cx="75" cy="35" r="3" fill={fillColor}/>
        
        {/* Neural connections */}
        <line x1="45" y1="35" x2="60" y2="30" stroke={strokeColor} strokeWidth="1.5" opacity="0.5"/>
        <line x1="60" y1="30" x2="75" y2="35" stroke={strokeColor} strokeWidth="1.5" opacity="0.5"/>
        <line x1="45" y1="35" x2="60" y2="50" stroke={strokeColor} strokeWidth="1.5" opacity="0.5"/>
        <line x1="75" y1="35" x2="60" y2="50" stroke={strokeColor} strokeWidth="1.5" opacity="0.5"/>
      </g>
      
      {/* Ethics Balance/Scale Symbol (center) */}
      <g>
        {/* Scale beam */}
        <line x1="45" y1="55" x2="75" y2="55" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round"/>
        {/* Center pivot */}
        <circle cx="60" cy="55" r="4" fill={fillColor}/>
        {/* Left pan */}
        <path d="M 42 55 L 38 60 L 46 60 Z" fill={fillColor} opacity="0.7"/>
        {/* Right pan */}
        <path d="M 78 55 L 74 60 L 82 60 Z" fill={fillColor} opacity="0.7"/>
      </g>
      
      {/* ESG Leaf/Sustainability Symbol (bottom) */}
      <g>
        {/* Leaf shape */}
        <path 
          d="M 60 65 Q 50 75, 52 85 Q 55 88, 60 85 Q 65 88, 68 85 Q 70 75, 60 65 Z" 
          fill={fillColor}
          opacity="0.8"
        />
        {/* Leaf vein */}
        <path 
          d="M 60 65 Q 60 75, 60 85" 
          stroke={strokeColor}
          strokeWidth="1.5" 
          fill="none"
          opacity="0.5"
        />
        {/* Side veins */}
        <path d="M 60 72 Q 54 75, 52 78" stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.4"/>
        <path d="M 60 72 Q 66 75, 68 78" stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.4"/>
      </g>
      
      {/* Data flow orbits */}
      <g opacity="0.2">
        <circle cx="60" cy="60" r="40" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,3"/>
        <circle cx="60" cy="60" r="32" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,3"/>
      </g>
      
      {/* Corner accent dots */}
      <circle cx="85" cy="45" r="2" fill={fillColor} opacity="0.5"/>
      <circle cx="35" cy="75" r="2" fill={fillColor} opacity="0.5"/>
      <circle cx="85" cy="75" r="2" fill={fillColor} opacity="0.5"/>
    </svg>
  )
}

// Simplified version optimized for favicon (16x16, 32x32)
export function LaterneXLogoFavicon({ 
  className, 
  size = 32 
}: Omit<LaterneXLogoMonoProps, "variant">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LaterneX favicon"
    >
      {/* Simplified for small sizes - bolder strokes */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4"/>
      
      {/* AI - Neural network (simplified) */}
      <circle cx="60" cy="30" r="5" fill="currentColor"/>
      <circle cx="45" cy="35" r="4" fill="currentColor"/>
      <circle cx="75" cy="35" r="4" fill="currentColor"/>
      <line x1="45" y1="35" x2="60" y2="50" stroke="currentColor" strokeWidth="3"/>
      <line x1="75" y1="35" x2="60" y2="50" stroke="currentColor" strokeWidth="3"/>
      
      {/* Ethics - Balance scale (simplified) */}
      <line x1="45" y1="55" x2="75" y2="55" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="60" cy="55" r="5" fill="currentColor"/>
      
      {/* ESG - Leaf (simplified) */}
      <path 
        d="M 60 65 Q 50 75, 52 85 Q 55 88, 60 85 Q 65 88, 68 85 Q 70 75, 60 65 Z" 
        fill="currentColor"
      />
    </svg>
  )
}
