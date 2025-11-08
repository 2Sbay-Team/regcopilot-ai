import { useState, useEffect, useRef } from "react"
import octopusLogo from "@/assets/octopus-logo.png"
import { cn } from "@/lib/utils"

interface AnimatedOctopusProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  enableBlink?: boolean
  enableFloat?: boolean
  enableWave?: boolean
  followCursor?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

export function AnimatedOctopus({ 
  size = "lg", 
  className,
  enableBlink = true,
  enableFloat = false,
  enableWave = true,
  followCursor = false
}: AnimatedOctopusProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const octopusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableBlink) return

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3500)

    return () => clearInterval(blinkInterval)
  }, [enableBlink])

  useEffect(() => {
    if (!followCursor || !octopusRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = octopusRef.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      
      // Calculate rotation angles
      const maxRotation = 20
      const rotateY = (deltaX / rect.width) * maxRotation
      const rotateX = -(deltaY / rect.height) * maxRotation
      
      setRotation({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 })
    }

    const element = octopusRef.current
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [followCursor])

  return (
    <div 
      ref={octopusRef}
      className={cn("relative inline-block", className)}
    >
      {/* Main octopus image */}
      <img
        src={octopusLogo}
        alt="Regulix Octopus"
        className={cn(
          "object-contain transition-all duration-300",
          sizeClasses[size],
          enableWave && !followCursor && "animate-owl-tilt",
          enableFloat && "animate-owl-float"
        )}
        style={followCursor ? {
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.2s ease-out'
        } : undefined}
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
            background: "radial-gradient(circle at 45% 38%, rgba(138,43,226,0.9) 4%, transparent 4%), radial-gradient(circle at 55% 38%, rgba(138,43,226,0.9) 4%, transparent 4%)",
            pointerEvents: "none"
          }}
        />
      )}
    </div>
  )
}
