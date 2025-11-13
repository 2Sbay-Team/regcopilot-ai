import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Professional, modern LaterneX logo - clean corporate mark
export function LaterneXLogo({ className, size = 40 }: LaterneXLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-label="LaterneX logo"
    >
      <title>LaterneX — Compliance & ESG Platform</title>
      
      {/* Clean geometric mark - interlocking hexagons representing connected systems */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Primary hexagon - outer */}
      <path
        d="M 60 15 L 85 30 L 85 60 L 60 75 L 35 60 L 35 30 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      
      {/* Inner hexagon - creates depth */}
      <path
        d="M 60 30 L 75 40 L 75 60 L 60 70 L 45 60 L 45 40 Z"
        fill="url(#logoGradient)"
        opacity="0.15"
      />
      
      {/* Central "L" monogram - sharp and modern */}
      <g>
        <path
          d="M 52 42 L 52 58 L 68 58"
          stroke="url(#logoGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      
      {/* Bottom accent bar - compliance foundation */}
      <rect
        x="35"
        y="85"
        width="50"
        height="4"
        rx="2"
        fill="url(#logoGradient)"
      />
      
      {/* Data nodes - representing connected intelligence */}
      <circle cx="60" cy="24" r="2.5" fill="url(#logoGradient)" opacity="0.8"/>
      <circle cx="80" cy="35" r="2.5" fill="url(#logoGradient)" opacity="0.8"/>
      <circle cx="40" cy="35" r="2.5" fill="url(#logoGradient)" opacity="0.8"/>
    </svg>
  )
}
