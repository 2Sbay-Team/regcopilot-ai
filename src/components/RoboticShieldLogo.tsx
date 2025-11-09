import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoboticShieldLogoProps {
  className?: string
  size?: number
}

export function RoboticShieldLogo({ className, size = 40 }: RoboticShieldLogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {/* Enhanced outer shield glow with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-accent/30 rounded-xl blur-lg animate-pulse-subtle" />
      
      {/* Secondary glow layer for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-primary/20 rounded-xl blur-sm" />
      
      {/* Main shield with enhanced gradient */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield 
            className="text-primary drop-shadow-[0_4px_12px_rgba(59,130,246,0.5)]" 
            size={size * 0.82}
            strokeWidth={2.8}
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))',
            }}
          />
        </div>
        
        {/* Gradient overlay on shield */}
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          <Shield 
            className="text-transparent" 
            size={size * 0.82}
            strokeWidth={2.8}
            style={{
              fill: 'url(#shieldGradient)',
              stroke: 'url(#shieldStrokeGradient)',
            }}
          />
        </div>
        
        {/* Enhanced tech accent lines with subtle animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[42%] h-[2.5px] bg-gradient-to-r from-transparent via-accent/80 to-transparent absolute top-[36%] animate-pulse-subtle" />
          <div className="w-[38%] h-[2.5px] bg-gradient-to-r from-transparent via-primary/90 to-transparent absolute top-[50%]" />
          <div className="w-[42%] h-[2.5px] bg-gradient-to-r from-transparent via-accent/80 to-transparent absolute top-[64%] animate-pulse-subtle" />
        </div>
        
        {/* Enhanced center AI node with gradient */}
        <div className="absolute w-[14%] h-[14%] rounded-full bg-gradient-to-br from-accent via-primary to-accent animate-pulse shadow-lg shadow-accent/60 border-2 border-primary/20" />
        <div className="absolute w-[8%] h-[8%] rounded-full bg-background/90 shadow-inner" />
      </div>

      {/* SVG Gradients Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="shieldStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
