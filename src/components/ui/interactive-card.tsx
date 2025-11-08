import { ReactNode, useState } from "react"
import { Card } from "@/components/ui/card"
import { useHaptic } from "@/hooks/useHaptic"
import { cn } from "@/lib/utils"

interface InteractiveCardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  hoverEffect?: boolean
  hapticFeedback?: boolean
}

export function InteractiveCard({
  children,
  onClick,
  className,
  hoverEffect = true,
  hapticFeedback = true,
}: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const { vibrate } = useHaptic()

  const handleClick = () => {
    if (hapticFeedback) {
      vibrate("light")
    }
    onClick?.()
  }

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  return (
    <Card
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn(
        "transition-all duration-200 cursor-pointer relative overflow-hidden",
        hoverEffect && "hover:shadow-xl hover:border-primary/50",
        isPressed && "scale-[0.98]",
        !isPressed && "scale-100",
        className
      )}
    >
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">{children}</div>
    </Card>
  )
}
