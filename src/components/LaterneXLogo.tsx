import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Vector LaterneX mark: Unified ESG + AI + GDPR + Ethics symbol
// Circular sectors with glowing center "L" representing transparency and interconnected compliance
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
          {/* Navy base gradient - trust & regulation */}
          <radialGradient id={`${uniqueId}-base`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0C1F3F" />
            <stop offset="100%" stopColor="#081629" />
          </radialGradient>
          
          {/* Center glow - transparency & light */}
          <radialGradient id={`${uniqueId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#32C8F4" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#32C8F4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#32C8F4" stopOpacity="0" />
          </radialGradient>
          
          {/* AI sector gradient - cyan innovation */}
          <linearGradient id={`${uniqueId}-ai`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#32C8F4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1E9FCC" stopOpacity="0.9" />
          </linearGradient>
          
          {/* ESG sector gradient - emerald sustainability */}
          <linearGradient id={`${uniqueId}-esg`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#35D296" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2AB57A" stopOpacity="0.9" />
          </linearGradient>
          
          {/* GDPR sector gradient - silver governance */}
          <linearGradient id={`${uniqueId}-gdpr`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B8C5D6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B9BAD" stopOpacity="0.9" />
          </linearGradient>
          
          {/* Ethics sector gradient - balanced blend */}
          <linearGradient id={`${uniqueId}-ethics`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#5B9ECC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4A7FAA" stopOpacity="0.9" />
          </linearGradient>
          
          {/* Professional shadow */}
          <filter id={`${uniqueId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Glow filter for center */}
          <filter id={`${uniqueId}-center-glow`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Base circle - navy foundation */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill={`url(#${uniqueId}-base)`}
          filter={`url(#${uniqueId}-shadow)`}
        />
        
        {/* Four sectors representing domains */}
        {/* AI Sector (top-right) */}
        <path
          d="M 50 50 L 50 8 A 42 42 0 0 1 79.7 20.3 Z"
          fill={`url(#${uniqueId}-ai)`}
          opacity="0.4"
        />
        
        {/* ESG Sector (bottom-right) */}
        <path
          d="M 50 50 L 79.7 79.7 A 42 42 0 0 1 50 92 Z"
          fill={`url(#${uniqueId}-esg)`}
          opacity="0.4"
        />
        
        {/* GDPR Sector (bottom-left) */}
        <path
          d="M 50 50 L 20.3 79.7 A 42 42 0 0 1 8 50 Z"
          fill={`url(#${uniqueId}-gdpr)`}
          opacity="0.4"
        />
        
        {/* Ethics Sector (top-left) */}
        <path
          d="M 50 50 L 20.3 20.3 A 42 42 0 0 1 50 8 Z"
          fill={`url(#${uniqueId}-ethics)`}
          opacity="0.4"
        />

        {/* Interconnecting data lines - subtle neural network pattern */}
        <line x1="50" y1="8" x2="50" y2="20" stroke="#32C8F4" strokeWidth="0.5" opacity="0.5" />
        <line x1="79.7" y1="20.3" x2="70" y2="30" stroke="#32C8F4" strokeWidth="0.5" opacity="0.5" />
        <line x1="79.7" y1="79.7" x2="70" y2="70" stroke="#35D296" strokeWidth="0.5" opacity="0.5" />
        <line x1="50" y1="92" x2="50" y2="80" stroke="#35D296" strokeWidth="0.5" opacity="0.5" />
        <line x1="20.3" y1="79.7" x2="30" y2="70" stroke="#B8C5D6" strokeWidth="0.5" opacity="0.5" />
        <line x1="8" y1="50" x2="20" y2="50" stroke="#B8C5D6" strokeWidth="0.5" opacity="0.5" />
        <line x1="20.3" y1="20.3" x2="30" y2="30" stroke="#5B9ECC" strokeWidth="0.5" opacity="0.5" />
        <line x1="92" y1="50" x2="80" y2="50" stroke="#32C8F4" strokeWidth="0.5" opacity="0.5" />
        
        {/* Outer ring - unity & continuous improvement */}
        <circle 
          cx="50" 
          cy="50" 
          r="42" 
          fill="none" 
          stroke="#32C8F4" 
          strokeWidth="0.8" 
          opacity="0.3"
        />
        
        {/* Center glow circle - transparency core */}
        <circle 
          cx="50" 
          cy="50" 
          r="22" 
          fill={`url(#${uniqueId}-glow)`}
          filter={`url(#${uniqueId}-center-glow)`}
        />
        
        {/* Bold "L" lettermark - the lantern */}
        <path
          d="M 42 35 L 42 62 L 58 62"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        
        {/* Accent dot - precision & focus */}
        <circle
          cx="61"
          cy="62"
          r="2"
          fill="#32C8F4"
          opacity="0.9"
        />
        
        {/* Inner nodes - data points */}
        <circle cx="50" cy="25" r="1.5" fill="#32C8F4" opacity="0.6" />
        <circle cx="65" cy="35" r="1.5" fill="#32C8F4" opacity="0.6" />
        <circle cx="65" cy="65" r="1.5" fill="#35D296" opacity="0.6" />
        <circle cx="50" cy="75" r="1.5" fill="#35D296" opacity="0.6" />
        <circle cx="35" cy="65" r="1.5" fill="#B8C5D6" opacity="0.6" />
        <circle cx="35" cy="35" r="1.5" fill="#5B9ECC" opacity="0.6" />
      </svg>
    </div>
  )
}
