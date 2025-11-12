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
          {/* Center glow - transparency & light (Azure) */}
          <radialGradient id={`${uniqueId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor={`hsl(var(--brand-azure))`} stopOpacity="0.5" />
            <stop offset="70%" stopColor={`hsl(var(--brand-azure))`} stopOpacity="0.1" />
            <stop offset="100%" stopColor={`hsl(var(--brand-azure))`} stopOpacity="0" />
          </radialGradient>
          
          {/* AI sector gradient - Azure innovation */}
          <linearGradient id={`${uniqueId}-ai`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsl(var(--brand-azure-light))`} stopOpacity="0.9" />
            <stop offset="100%" stopColor={`hsl(var(--brand-azure))`} stopOpacity="0.95" />
          </linearGradient>
          
          {/* ESG sector gradient - Emerald sustainability */}
          <linearGradient id={`${uniqueId}-esg`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`hsl(var(--brand-emerald))`} stopOpacity="0.85" />
            <stop offset="100%" stopColor={`hsl(var(--brand-emerald))`} stopOpacity="0.95" />
          </linearGradient>
          
          {/* GDPR sector gradient - Silver governance */}
          <linearGradient id={`${uniqueId}-gdpr`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`hsl(var(--brand-silver))`} stopOpacity="0.85" />
            <stop offset="100%" stopColor={`hsl(var(--brand-silver))`} stopOpacity="0.95" />
          </linearGradient>
          
          {/* Ethics sector gradient - Azure balance */}
          <linearGradient id={`${uniqueId}-ethics`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={`hsl(var(--brand-azure))`} stopOpacity="0.85" />
            <stop offset="100%" stopColor={`hsl(var(--brand-azure-light))`} stopOpacity="0.95" />
          </linearGradient>
          
          {/* Soft shadow */}
          <filter id={`${uniqueId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.28" />
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

        {/* Base circle - white background */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="hsl(var(--background))"
          stroke={`hsl(var(--brand-azure) / 0.25)`}
          strokeWidth="0.5"
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
        <line x1="50" y1="8" x2="50" y2="20" stroke={`hsl(var(--brand-azure))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="79.7" y1="20.3" x2="70" y2="30" stroke={`hsl(var(--brand-azure))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="79.7" y1="79.7" x2="70" y2="70" stroke={`hsl(var(--brand-emerald))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="50" y1="92" x2="50" y2="80" stroke={`hsl(var(--brand-emerald))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="20.3" y1="79.7" x2="30" y2="70" stroke={`hsl(var(--brand-silver))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="8" y1="50" x2="20" y2="50" stroke={`hsl(var(--brand-silver))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="20.3" y1="20.3" x2="30" y2="30" stroke={`hsl(var(--brand-azure))`} strokeWidth="0.5" opacity="0.5" />
        <line x1="92" y1="50" x2="80" y2="50" stroke={`hsl(var(--brand-azure))`} strokeWidth="0.5" opacity="0.5" />
        
        {/* Outer ring - unity & continuous improvement */}
        <circle 
          cx="50" 
          cy="50" 
          r="42" 
          fill="none" 
          stroke={`hsl(var(--brand-azure))`} 
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
          fill={`hsl(var(--brand-azure))`}
          opacity="0.9"
        />
        
        {/* Inner nodes - data points and ingestion arc */}
        <circle cx="50" cy="25" r="1.5" fill={`hsl(var(--brand-azure))`} opacity="0.6" />
        <circle cx="65" cy="35" r="1.5" fill={`hsl(var(--brand-azure))`} opacity="0.6" />
        <circle cx="65" cy="65" r="1.5" fill={`hsl(var(--brand-emerald))`} opacity="0.6" />
        <circle cx="50" cy="75" r="1.5" fill={`hsl(var(--brand-emerald))`} opacity="0.6" />
        <circle cx="35" cy="65" r="1.5" fill={`hsl(var(--brand-silver))`} opacity="0.6" />
        <circle cx="35" cy="35" r="1.5" fill={`hsl(var(--brand-azure-light))`} opacity="0.6" />
        {/* Data ingestion arc */}
        <path d="M 62 80 A 30 30 0 0 1 20 58" fill="none" stroke={`hsl(var(--brand-azure))`} strokeWidth="0.8" opacity="0.25" strokeDasharray="2 3" />
      </svg>
    </div>
  )
}
