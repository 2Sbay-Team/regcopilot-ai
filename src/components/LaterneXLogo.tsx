import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Modern LaterneX logo: Clean circular design representing EU AI Act, ESG, GDPR, Ethics, and Data Ingestion
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
        <title id={`${uniqueId}-title`}>LaterneX - Intelligence for a Transparent Future</title>
        <defs>
          {/* Blue gradient for main circle */}
          <linearGradient id={`${uniqueId}-blue-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          
          {/* Light blue for accents */}
          <linearGradient id={`${uniqueId}-light-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          
          {/* Center glow */}
          <radialGradient id={`${uniqueId}-center-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
          </radialGradient>
          
          {/* Soft shadow */}
          <filter id={`${uniqueId}-shadow`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer circle - main structure */}
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          fill="url(#${uniqueId}-blue-gradient)"
          filter={`url(#${uniqueId}-shadow)`}
        />
        
        {/* Inner white circle for contrast */}
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          fill="white"
        />
        
        {/* Five segments representing domains */}
        {/* AI Act - top */}
        <path
          d="M 50 12 L 50 28 A 22 22 0 0 1 64 32.5 L 71.5 20.3 A 39 39 0 0 0 50 12 Z"
          fill="#3b82f6"
          opacity="0.9"
        />
        
        {/* GDPR - top right */}
        <path
          d="M 71.5 20.3 L 64 32.5 A 22 22 0 0 1 67.5 46 L 82 43.5 A 39 39 0 0 0 71.5 20.3 Z"
          fill="#2563eb"
          opacity="0.85"
        />
        
        {/* ESG - bottom right */}
        <path
          d="M 82 43.5 L 67.5 46 A 22 22 0 0 1 60 61 L 74 68.5 A 39 39 0 0 0 82 43.5 Z"
          fill="#1d4ed8"
          opacity="0.9"
        />
        
        {/* Ethics - bottom left */}
        <path
          d="M 74 68.5 L 60 61 A 22 22 0 0 1 40 61 L 26 68.5 A 39 39 0 0 0 74 68.5 Z"
          fill="#1e40af"
          opacity="0.85"
        />
        
        {/* Data Ingestion - left */}
        <path
          d="M 26 68.5 L 40 61 A 22 22 0 0 1 32.5 46 L 18 48.5 A 39 39 0 0 0 26 68.5 Z"
          fill="#2563eb"
          opacity="0.9"
        />
        
        {/* Complete the circle - top left */}
        <path
          d="M 18 48.5 L 32.5 46 A 22 22 0 0 1 36 32.5 L 28.5 20.3 A 39 39 0 0 0 18 48.5 Z"
          fill="#3b82f6"
          opacity="0.85"
        />
        
        <path
          d="M 28.5 20.3 L 36 32.5 A 22 22 0 0 1 50 28 L 50 12 A 39 39 0 0 0 28.5 20.3 Z"
          fill="#60a5fa"
          opacity="0.9"
        />

        {/* Center circle with glow effect */}
        <circle 
          cx="50" 
          cy="50" 
          r="18" 
          fill="url(#${uniqueId}-center-glow)"
        />
        
        <circle 
          cx="50" 
          cy="50" 
          r="16" 
          fill="url(#${uniqueId}-blue-gradient)"
        />
        
        {/* White "L" lettermark */}
        <path
          d="M 43 38 L 43 60 L 57 60"
          fill="none"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Accent dot */}
        <circle
          cx="59"
          cy="60"
          r="1.8"
          fill="white"
        />
        
        {/* Subtle connection lines */}
        <circle cx="50" cy="20" r="1.2" fill="#60a5fa" opacity="0.8" />
        <circle cx="68" cy="30" r="1.2" fill="#60a5fa" opacity="0.8" />
        <circle cx="75" cy="50" r="1.2" fill="#3b82f6" opacity="0.8" />
        <circle cx="67" cy="70" r="1.2" fill="#2563eb" opacity="0.8" />
        <circle cx="50" cy="75" r="1.2" fill="#1e40af" opacity="0.8" />
        <circle cx="33" cy="70" r="1.2" fill="#2563eb" opacity="0.8" />
        <circle cx="25" cy="50" r="1.2" fill="#3b82f6" opacity="0.8" />
        <circle cx="32" cy="30" r="1.2" fill="#60a5fa" opacity="0.8" />
      </svg>
    </div>
  )
}
