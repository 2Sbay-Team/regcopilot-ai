import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// Vector LaterneX mark: gradient circle with an "L" glyph
export function LaterneXLogo({ className, size = 40 }: LaterneXLogoProps) {
  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size }} aria-label="LaterneX logo">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-labelledby="laterneXTitle"
      >
        <title id="laterneXTitle">LaterneX</title>
        <defs>
          <linearGradient id="lxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsl(var(--accent))`} />
            <stop offset="100%" stopColor={`hsl(var(--primary))`} />
          </linearGradient>
          <radialGradient id="lxShine" cx="30%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="lxShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Outer gradient disc */}
        <circle cx="50" cy="50" r="46" fill="url(#lxGradient)" filter="url(#lxShadow)" />
        {/* Subtle glossy highlight */}
        <circle cx="50" cy="50" r="46" fill="url(#lxShine)" />
        {/* Soft inner ring for depth */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary-foreground) / 0.12)" strokeWidth="2" />

        {/* Stylized "L" mark */}
        <path
          d="M35 25 L35 70 L70 70"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
