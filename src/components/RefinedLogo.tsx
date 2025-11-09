import { Shield } from "lucide-react";

interface RefinedLogoProps {
  size?: number;
  className?: string;
}

export function RefinedLogo({ size = 32, className = "" }: RefinedLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Hexagonal Shield Background */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Hexagonal Shape */}
        <defs>
          <linearGradient id="electric-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(214 100% 58%)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(190 100% 50%)', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Hexagon */}
        <polygon
          points="50,5 90,28 90,72 50,95 10,72 10,28"
          fill="url(#electric-gradient)"
          stroke="hsl(180 100% 45%)"
          strokeWidth="2"
          opacity="0.2"
        />
        
        {/* Inner Circuit Pattern */}
        <g stroke="hsl(214 100% 70%)" strokeWidth="1.5" opacity="0.6" filter="url(#glow)">
          <line x1="50" y1="15" x2="50" y2="35" />
          <line x1="50" y1="35" x2="35" y2="45" />
          <line x1="50" y1="35" x2="65" y2="45" />
          <line x1="35" y1="45" x2="35" y2="60" />
          <line x1="65" y1="45" x2="65" y2="60" />
          <line x1="35" y1="60" x2="50" y2="70" />
          <line x1="65" y1="60" x2="50" y2="70" />
          <line x1="50" y1="70" x2="50" y2="85" />
          
          {/* Circuit Nodes */}
          <circle cx="50" cy="35" r="2" fill="hsl(180 100% 45%)" />
          <circle cx="35" cy="45" r="2" fill="hsl(180 100% 45%)" />
          <circle cx="65" cy="45" r="2" fill="hsl(180 100% 45%)" />
          <circle cx="35" cy="60" r="2" fill="hsl(180 100% 45%)" />
          <circle cx="65" cy="60" r="2" fill="hsl(180 100% 45%)" />
          <circle cx="50" cy="70" r="2" fill="hsl(180 100% 45%)" />
        </g>
        
        {/* Center Shield Icon */}
        <path
          d="M50 30 L70 40 L70 60 L50 75 L30 60 L30 40 Z"
          fill="hsl(220 40% 12%)"
          stroke="url(#electric-gradient)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Checkmark in Center */}
        <path
          d="M43 52 L48 57 L60 42"
          stroke="hsl(180 100% 45%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
}

// Alternative: Minimalist version using Lucide icon
export function RefinedLogoMinimal({ size = 32, className = "" }: RefinedLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(214,100%,58%)] to-[hsl(190,100%,50%)] opacity-90" />
      <Shield 
        size={size * 0.6} 
        className="relative z-10 text-[hsl(180,100%,45%)]" 
        strokeWidth={2.5}
      />
      <div 
        className="absolute inset-0 bg-[hsl(180,100%,45%)] blur-md opacity-30"
        style={{
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
        }}
      />
    </div>
  );
}
