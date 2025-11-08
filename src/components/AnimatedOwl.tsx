import { useState, useEffect, useRef } from "react"
import owlLogo from "@/assets/owl-logo.png"
import { cn } from "@/lib/utils"

interface AnimatedOwlProps {
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

export function AnimatedOwl({ 
  size = "lg", 
  className,
  enableBlink = true,
  enableTilt = true,
  enableFloat = false,
  followCursor = false
}: AnimatedOwlProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const owlRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableBlink) return

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 4000)

    return () => clearInterval(blinkInterval)
  }, [enableBlink])

  useEffect(() => {
    if (!followCursor || !owlRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = owlRef.current?.getBoundingClientRect()
      if (!rect) return

      const owlCenterX = rect.left + rect.width / 2
      const owlCenterY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - owlCenterX
      const deltaY = e.clientY - owlCenterY
      
      // Calculate rotation angles (limited range for natural look)
      const maxRotation = 15
      const rotateY = (deltaX / rect.width) * maxRotation
      const rotateX = -(deltaY / rect.height) * maxRotation
      
      setRotation({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 })
    }

    const element = owlRef.current
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [followCursor])

  return (
    <div 
      ref={owlRef}
      className={cn("relative inline-block", className)}
    >
      {/* Main owl image */}
      <img
        src={owlLogo}
        alt="CompliWise Owl"
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
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 8%, transparent 8%), radial-gradient(circle at 65% 35%, rgba(255,255,255,0.9) 8%, transparent 8%)",
            pointerEvents: "none"
          }}
        />
      )}
    </div>
  )
}
