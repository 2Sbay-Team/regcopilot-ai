import { forwardRef, useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { useHaptic } from "@/hooks/useHaptic"
import { cn } from "@/lib/utils"

interface HapticButtonProps extends ButtonProps {
  hapticFeedback?: boolean
  rippleEffect?: boolean
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ children, onClick, className, hapticFeedback = true, rippleEffect = true, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false)
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
    const { vibrate } = useHaptic()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        vibrate("light")
      }

      if (rippleEffect) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()

        setRipples((prev) => [...prev, { id, x, y }])

        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
        }, 600)
      }

      onClick?.(e)
    }

    const handleMouseDown = () => {
      setIsPressed(true)
    }

    const handleMouseUp = () => {
      setIsPressed(false)
    }

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "relative overflow-hidden transition-all duration-150",
          isPressed && "scale-[0.97]",
          !isPressed && "scale-100 active:scale-[0.97]",
          className
        )}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        {children}
      </Button>
    )
  }
)

HapticButton.displayName = "HapticButton"
