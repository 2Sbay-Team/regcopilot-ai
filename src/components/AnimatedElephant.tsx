import { useState, useEffect, useRef } from "react"
import elephantLogo from "@/assets/elephant-logo.png"
import { cn } from "@/lib/utils"

interface AnimatedElephantProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  enableBlink?: boolean
  enableTilt?: boolean
  enableFloat?: boolean
  followCursor?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

export function AnimatedElephant({ 
  size = "lg", 
  className,
  enableBlink = true,
  enableTilt = true,
  enableFloat = false,
  followCursor = false
}: AnimatedElephantProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const elephantRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableBlink) return

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 4000)

    return () => clearInterval(blinkInterval)
  }, [enableBlink])

  useEffect(() => {
    if (!followCursor || !elephantRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = elephantRef.current?.getBoundingClientRect()
      if (!rect) return

      const elephantCenterX = rect.left + rect.width / 2
      const elephantCenterY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - elephantCenterX
      const deltaY = e.clientY - elephantCenterY
      
      // Calculate rotation angles (limited range for natural look)
      const maxRotation = 15
      const rotateY = (deltaX / rect.width) * maxRotation
      const rotateX = -(deltaY / rect.height) * maxRotation
      
      setRotation({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 })
    }

    const element = elephantRef.current
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [followCursor])

  return (
    <div 
      ref={elephantRef}
      className={cn("relative inline-block", className)}
    >
      {/* Main elephant image */}
      <img
        src={elephantLogo}
        alt="HannibalAI Elephant"
        className={cn(
          "object-contain transition-all duration-300",
          sizeClasses[size],
          enableTilt && !followCursor && "animate-owl-tilt",
          enableFloat && "animate-owl-float"
        )}
        style={followCursor ? {
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.15s ease-out'
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
            background: "radial-gradient(circle at 35% 30%, rgba(139,69,19,0.8) 6%, transparent 6%), radial-gradient(circle at 65% 30%, rgba(139,69,19,0.8) 6%, transparent 6%)",
            pointerEvents: "none"
          }}
        />
      )}
    </div>
  )
}
