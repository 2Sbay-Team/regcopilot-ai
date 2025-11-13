import { cn } from "@/lib/utils"

interface LaterneXLogoProps {
  className?: string
  size?: number
}

// LaterneX mark — pure stroke monogram, no fills/gradients/background
// Uses currentColor so theming is controlled externally. Intended for white backgrounds.
export function LaterneXLogo({ className, size = 40 }: LaterneXLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      role="img"
      aria-label="LaterneX logo"
    >
      <title>LaterneX</title>
      {/* Stroke-only, corporate-simple monogram: L × */}
      <g stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* L */}
        <path d="M42 32 V86 H76" />
        {/* X */}
        <path d="M82 34 L102 74" />
        <path d="M102 34 L82 74" />
        {/* Baseline accent (thin), optional for balance */}
        <path d="M34 92 H100" strokeWidth="2" opacity="0.6" />
      </g>
    </svg>
  )
}
