import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoboticShieldLogoProps {
  className?: string
  size?: number
}

export function RoboticShieldLogo({ className, size = 40 }: RoboticShieldLogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {/* Outer shield glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 rounded-lg blur-md animate-pulse-subtle" />
      
      {/* Main shield */}
      <div className="relative h-full w-full flex items-center justify-center">
        <Shield 
          className="text-primary drop-shadow-lg" 
          size={size * 0.8}
          strokeWidth={2.5}
        />
        
        {/* Tech accent lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[40%] h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent absolute top-[35%]" />
          <div className="w-[40%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent absolute top-[50%]" />
          <div className="w-[40%] h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent absolute top-[65%]" />
        </div>
        
        {/* Center dot */}
        <div className="absolute w-[12%] h-[12%] rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50" />
      </div>
    </div>
  )
}
