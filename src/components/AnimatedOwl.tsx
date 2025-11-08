import { useState, useEffect } from "react"
import owlLogo from "@/assets/owl-logo.png"
import { cn } from "@/lib/utils"

interface AnimatedOwlProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  enableBlink?: boolean
  enableTilt?: boolean
  enableFloat?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

export function AnimatedOwl({ 
  size = "lg", 
  className,
  enableBlink = true,
  enableTilt = true,
  enableFloat = false 
}: AnimatedOwlProps) {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (!enableBlink) return

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 4000)

    return () => clearInterval(blinkInterval)
  }, [enableBlink])

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Main owl image */}
      <img
        src={owlLogo}
        alt="CompliWise Owl"
        className={cn(
          "object-contain transition-all duration-300",
          sizeClasses[size],
          enableTilt && "animate-owl-tilt",
          enableFloat && "animate-owl-float"
        )}
      />
      
      {/* Blinking overlay for eyes */}
      {enableBlink && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            sizeClasses[size],
            isBlinking ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 8%, transparent 8%), radial-gradient(circle at 65% 35%, rgba(255,255,255,0.9) 8%, transparent 8%)",
            pointerEvents: "none"
          }}
        />
      )}
    </div>
  )
}
